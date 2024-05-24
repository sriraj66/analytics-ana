'use client';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'
import AceEditor from "react-ace";
import { useState, useRef, useEffect } from "react";
import { MdDarkMode } from 'react-icons/md'
import { BsSunFill } from 'react-icons/bs'
import { HiOutlineClock } from 'react-icons/hi'
import request from '@/utils/customFetch';
import { useTimer } from 'react-timer-hook';
import markdownRenderer from '@/utils/mdrenderutil/mdRender';
import Spinner from '@/components/misc/loaders/spinner';
import { Space_Grotesk, Nunito, Source_Code_Pro, Rubik, Poppins } from 'next/font/google'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })
const rubik = Rubik({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] })
const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })
const source_code_pro = Source_Code_Pro({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

interface examDatasArray {
  title: string,
  college: string,
  department: string,
  year: number,
  semester: number,
  category: string,
  questions: Array<any>,
  attended: Array<any>,
  date: string,
  hours: number,
  minutes: number,
  start: string,
  end: string
}

import "ace-builds/src-noconflict/ext-language_tools";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";

import 'ace-builds/src-noconflict/theme-crimson_editor';
import 'ace-builds/src-noconflict/theme-monokai';

async function timeoutTest(exam_id: string, token: string) {
  try {
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/exams/${exam_id}/timeout`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
  } catch { }
}

export default function IDE({ examData, exam_id, token }: { examData: examDatasArray, exam_id: string, token: string }) {
  examData.questions = examData.questions.filter((f: any) => !examData.attended.includes(f.number))
  const [examQuestions, setExamQuestions] = useState(examData.questions.reduce((acc, item) => ({ ...acc, [item.number]: item }), {}))
  const [mcqQuestions, setmcqQuestions] = useState<any>([])
  const [mcqAnswers, setmcqAnswers] = useState<any>(Object())
  const [currentQuestion, setCurrentQuestion] = useState<number>(examData.questions.sort((a, b) => a.number < b.number ? -1 : 1)[0].number)
  const [submittingState, setSubmittingState] = useState(false)
  const [compilingState, setCompilingState] = useState(false)
  const [questionTempDatas, setQuestionTempDatas] = useState<any>({})
  const [currentTabCount, setCurrentTabCount] = useState(0)
  const examWarn = useRef<HTMLDivElement>(null)
  const [resultsData, setResultsData] = useState<any>()
  let localCodeEditorTheme = localStorage.getItem('editorTheme')
  if (localCodeEditorTheme === null) {
    localStorage.setItem('editorTheme', 'dark')
    localCodeEditorTheme = 'dark'
  }
  const [editorTheme, setEditorTheme] = useState(localCodeEditorTheme)
  const coding_languages = ['python', 'c', 'c++', 'java']
  
  const expiryTime = new Date();
  expiryTime.setSeconds(expiryTime.getSeconds() + ((examData.hours * 3600) + (examData.minutes * 60)));
  const {
    totalSeconds, seconds, minutes, hours, days,
    isRunning, start, pause, resume, restart,
  } = useTimer({ expiryTimestamp: expiryTime, autoStart: true, onExpire: () => {return 0; Promise.resolve(timeoutTest(exam_id, token)); document.location.replace(`/dashboard/codingexam`)} });

  async function evaluateCode(code: string) {
    //delete examQuestions[+currentQuestion]
    //setExamQuestions(examQuestions)
    //setCurrentQuestion(+Object.keys(examQuestions)[0])
    //return
    if (code === 'submit') {
      setSubmittingState(true)
    } else {
      setCompilingState(true)
    }
    try {
      const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/exams/${exam_id}/${code}`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({questions: {number: currentQuestion, code: (questionTempDatas[+currentQuestion]?.code === undefined) ? '' : questionTempDatas[+currentQuestion]?.code, language: (questionTempDatas[+currentQuestion]?.language === undefined) ? 'python' : questionTempDatas[+currentQuestion].language}})})
      const data = await response.json()
      setCompilingState(false)
      setSubmittingState(false)
      if (data.status === 'Already taken this exam') {
        setQuestionTempDatas({...questionTempDatas, [+currentQuestion]: {...questionTempDatas[+currentQuestion], code: ''}})
        setCurrentQuestion(currentQuestion + 1)
        return;
      }
      if (data.status === 'Compilation Error') {
        setQuestionTempDatas({...questionTempDatas, [+currentQuestion]: {...questionTempDatas[+currentQuestion], output: (data?.status === undefined) ? '' : (data.status + '\n' + data.output.stderr)}})
        return;
      }
      if ((code === 'submit') && (data?.status?.toLowerCase() === 'submitted')) {      
        delete examQuestions[+currentQuestion]
        setExamQuestions(examQuestions)
        setCurrentQuestion(+Object.keys(examQuestions)[0])
        return;
      }
      setQuestionTempDatas({...questionTempDatas, [+currentQuestion]: {...questionTempDatas[+currentQuestion], output: (data?.output === undefined) ? null : data.output, testcase: (data?.testcase === undefined) ? Object() : data.testcase}})
    } catch (e) {
      console.error("Error while Submitting to Test", e)
      setCompilingState(false)
      setSubmittingState(false)
      return;
    }
  }

  async function mcqSubmit(event: any) {
    event.preventDefault()
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/exams/${exam_id}/validate`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({questions: Object.entries(mcqAnswers).map(qns => Object({number: +qns[0], answer: qns[1]}))})})
  }

  useEffect(() => {
    setmcqQuestions(Object.values(examQuestions).sort(() => (Math.random() > .5) ? 1 : -1))
  }, [])

  useEffect(() => {
    if (
      typeof document.hidden !== 'undefined' ||
      typeof (document as any).msHidden !== 'undefined' ||
      typeof (document as any).webkitHidden !== 'undefined'
    ) {
      const handleVisibilityChange = () => {
        if (Object.values(examQuestions).length == 0) return;
        if (document.hidden || (document as any).msHidden || (document as any).webkitHidden) {
          if (examWarn.current !== null) {
            examWarn.current.style.display = 'flex'
          }
          if (currentTabCount > 3) {
            //Promise.resolve(timeoutTest(exam_id, token))
            //document.location.replace(`/dashboard/codingexam`)
          }
          setCurrentTabCount((count) => count + 1)
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      console.log('Cannot Add Cheating Prevention Mechanism');
    }
  }, [currentTabCount]);

  return (
    <div className={styles.code_main_div_centered}>
      <div className={styles.code_main_div}>
        <div className={styles.code_main_div_heading}>
          {Object.values(examQuestions).length == 0 ?
            <span className={[styles.results_header, space_grotesk.className].join(' ')}>
              Results
            </span>
            :
            <>
              <div className={[styles.code_main_questions_select_div, nunito.className].join(' ')}>
                {(examData.category.toLowerCase() === 'mcq') ?
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>MCQ Test</span>
                :
                  <select value={currentQuestion} onChange={(event) => setCurrentQuestion(parseInt(event.currentTarget.value))} className={styles.code_main_questions_select}>
                    {Object.values(examQuestions).map((data: any, index: number) => (
                      <option key={data.number} value={data.number}>
                        {index + 1}. {(examData.category.toLowerCase() === 'mcq') ? data.question.split(' ').slice(0, 10).join(' ') : data.title}
                      </option>
                    ))}
                  </select>
                }
              </div>
              <div className={styles.questions_timer_div}>
              </div>
              <div className={styles.end_test_button_div}>
                <div className={styles.questions_timer_div}>
                  <HiOutlineClock />
                  <span className={[styles.question_timer, nunito.className].join(' ')}>
                    Test Time: {(hours + '').padStart(2, '0')}:{(minutes + '').padStart(2, '0')}:{(seconds + '').padStart(2, '0')}
                  </span>  
                </div>
                <button onClick={(event) => {Promise.resolve(timeoutTest(exam_id, token)); document.location.replace(`/dashboard/codingexam`)}} className={[styles.end_test_button, nunito.className].join(' ')}>
                  Finish Test
                </button>
              </div>
            </>
          }
        </div>
        <div className={styles.code_question_main_div}>
          {Object.values(examQuestions).length == 0 ?
            (resultsData === undefined) ?
                <span style={{ display: 'flex', justifyContent: 'center', alignSelf: 'center', padding: '15px', width: '100%' }} className={[styles.no_datas, space_grotesk.className].join(' ')}>
                  <Spinner color='#1b238d' size={65} />
                </span>
              :
                ''
            :
            <>
              {(examData.category.toLowerCase() === 'mcq') ?
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', width: '100%' }}>
                  <div className={styles.code_questions_div}>
                    <form onSubmit={mcqSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} >
                      {mcqQuestions.map((question: any, q_index: number) => 
                        <div key={q_index} className={styles.mcq_main_div}>
                          {markdownRenderer(question.question)}
                          <div className={styles.mcq_radio_option_div}>
                            {question.options.map((option: string) =>
                              <label key={option} className={[styles.mcq_radio, rubik.className].join(' ')}>
                                <input onChange={event => {mcqAnswers[+event.target.name] = event.target.value; setmcqAnswers(mcqAnswers)}} type="radio" name={question.number.toString()} value={option} required />
                                <span>{option}</span>
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                  <div style={{ padding: '8px 12px', borderTop: '1.5px solid #bec2e9' }} className={styles.code_editor_inner}>
                    <div className={[styles.compiler_controls_div, space_grotesk.className].join(' ')}>
                      <span>
                        {Object.keys(mcqAnswers).length} / {Object.keys(mcqQuestions).length}
                      </span>
                      <button disabled={Object.keys(mcqAnswers).length !== Object.keys(mcqQuestions).length} style={(Object.keys(mcqAnswers).length !== Object.keys(mcqQuestions).length) ? { color: 'white', cursor: 'no-drop', backgroundColor: '#282b4a' } : {}} className={[styles.submit_button, space_grotesk.className].join(' ')}>
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
                :
                <>
                  <div className={styles.code_questions_div}>
                    {markdownRenderer(examQuestions[+currentQuestion].description)}
                  </div>
                  <span className={styles.seperator_span}></span>
                </>
              }
              {(examData.category.toLowerCase() !== 'mcq') &&
                <div className={styles.code_editor_div_main}>
                  <div className={styles.code_editor_inner}>
                    <div className={styles.code_editor_div}>
                      <div className={styles.code_editor}>
                        <div className={[styles.editor_config, nunito.className].join(' ')}>
                          <select className={[styles.editor_language_select, nunito.className].join(' ')} value={(questionTempDatas[+currentQuestion]?.language === undefined) ? 'python' : questionTempDatas[+currentQuestion].language} onChange={(event) => setQuestionTempDatas({...questionTempDatas, [+currentQuestion]: {...questionTempDatas[+currentQuestion], language: event.currentTarget.value}})}>
                            {coding_languages.map(language =>
                              <option key={language} value={language}>{language.slice(0, 1).toUpperCase() + language.slice(1)}</option>
                            )}
                          </select>
                          <div className={styles.editor_config_first_half}>
                            <button title='Theme' onClick={(event) => {localStorage.setItem('editorTheme', (editorTheme === 'white') ? 'dark' : 'white'); setEditorTheme((editorTheme === 'white') ? 'dark' : 'white')}} className={[styles.editor_theme_button, nunito.className].join(' ')}>
                              {(editorTheme === 'white') ?
                                <BsSunFill fontSize={20} />
                                :
                                <MdDarkMode fontSize={20} />
                              }
                            </button>
                          </div>
                        </div>
                        <AceEditor
                          mode={(['c', 'c++'].includes((questionTempDatas[+currentQuestion]?.language === undefined) ? 'python' : questionTempDatas[+currentQuestion].language)) ? 'c_cpp' : (questionTempDatas[+currentQuestion]?.language === undefined) ? 'python' : questionTempDatas[+currentQuestion].language}
                          theme={(editorTheme === 'white') ? 'crimson_editor' : 'monokai'}
                          name="code_editor"
                          fontSize={16}
                          showGutter={true}
                          highlightActiveLine={true}
                          showPrintMargin={false}
                          wrapEnabled={true}
                          value={(questionTempDatas[+currentQuestion]?.code === undefined) ? '' : questionTempDatas[+currentQuestion]?.code}
                          onChange={(code) => setQuestionTempDatas({...questionTempDatas, [+currentQuestion]: {...questionTempDatas[+currentQuestion], code: code}})}
                          style={
                            { 
                              width: '100%',
                              height: '35vh',
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                            }
                          }
                          setOptions={
                            {
                              enableBasicAutocompletion: true,
                              enableLiveAutocompletion: true,
                              enableSnippets: false,
                              showLineNumbers: true,
                              tabSize: 4,
                            }
                          }
                          commands={[
                            {
                              name: 'paste',
                              bindKey: { win: 'Ctrl-V', mac: 'Command-V' },
                              exec: () => {}
                            },
                          ]}
                          editorProps={{ $blockScrolling: true }}
                        />
                      </div>
                    </div>
                    <div className={[styles.compiler_controls_div, space_grotesk.className].join(' ')}>
                      <button disabled={compilingState} onClick={() => evaluateCode('validate')} style={compilingState ? { color: 'white', cursor: 'no-drop', backgroundColor: '#1b238d' } : {}} className={[styles.compile_button, space_grotesk.className].join(' ')}>
                        Run Code
                        {compilingState &&
                          <Spinner />
                        }
                      </button>
                      <button disabled={submittingState} onClick={() => evaluateCode('submit')} style={submittingState ? { color: 'white', cursor: 'no-drop', backgroundColor: '#1b238d' } : {}} className={[styles.submit_button, space_grotesk.className].join(' ')}>
                        Submit
                        {submittingState &&
                          <Spinner />
                        }
                      </button>
                    </div>
                    <div style={{ overflow: 'hidden' }} className={styles.code_editor_div}>
                      <div className={styles.code_editor}>
                        <div style={{ backgroundColor: '#E8EBF2', borderBottom: '1px solid #c1c2cc', padding: '6px 12px', fontWeight: 600, color: '#282b4a', fontSize: '18px' }} className={[styles.editor_config, nunito.className].join(' ')}>
                          {(questionTempDatas[+currentQuestion]?.output !== undefined) ?
                            (((questionTempDatas[+currentQuestion]?.output === null) || (questionTempDatas[+currentQuestion]?.output === examQuestions[+currentQuestion].io[0]?.output)) && (questionTempDatas[+currentQuestion]?.output !== undefined)) ? '✅ Output' : '❌ Output'
                            :
                            "Input & Output"
                          }
                        </div>
                        <div className={styles.testcase_main_div}>
                          <div className={[styles.testcase_details_div, rubik.className].join(' ')}>
                            <div className={styles.test_case_inner_box_div}>
                              <span className={[styles.test_case_output_title, poppins.className].join(' ')}>
                                Input (stdin)
                              </span>
                              <span className={[styles.test_case_ouput_box, source_code_pro.className].join(' ')}>
                                {examQuestions[+currentQuestion].io[0]?.input}
                              </span>
                            </div>
                            {(questionTempDatas[+currentQuestion]?.output !== undefined) &&
                              <div className={styles.test_case_inner_box_div}>
                                <span className={[styles.test_case_output_title, poppins.className].join(' ')}>
                                  Your Output (stdout)
                                </span>
                                <span className={[styles.test_case_ouput_box, source_code_pro.className].join(' ')}>
                                  {(questionTempDatas[+currentQuestion]?.output === null) ? examQuestions[+currentQuestion].io[0]?.output : questionTempDatas[+currentQuestion]?.output}
                                </span>
                              </div>
                            }
                            <div className={styles.test_case_inner_box_div}>
                              <span className={[styles.test_case_output_title, poppins.className].join(' ')}>
                                Expected Output
                              </span>
                              <span className={[styles.test_case_ouput_box, source_code_pro.className].join(' ')}>
                                {examQuestions[+currentQuestion].io[0]?.output}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {(((questionTempDatas[+currentQuestion]?.output === null) || (questionTempDatas[+currentQuestion]?.output === examQuestions[+currentQuestion].io[0]?.output)) && (questionTempDatas[+currentQuestion]?.output !== undefined)) &&
                      <div style={{ overflow: 'hidden' }} className={styles.code_editor_div}>
                        <div className={styles.code_editor}>
                          <div style={{ backgroundColor: '#E8EBF2', borderBottom: '1px solid #c1c2cc', padding: '6px 12px', fontWeight: 600, color: '#282b4a', fontSize: '18px' }} className={[styles.editor_config, nunito.className].join(' ')}>
                            Testcases
                          </div>
                          <div className={styles.testcase_main_div}>
                            <div className={styles.testcase_main_div_list}>
                              {examQuestions[+currentQuestion].testcase
                                .map((testcase: any, index: number) =>
                                <div onClick={(event) => setQuestionTempDatas({...questionTempDatas, [+currentQuestion]: {...questionTempDatas[+currentQuestion], currentTestcase: index}})} key={index} style={{ background: (((questionTempDatas[+currentQuestion]?.currentTestcase === undefined) ? 0 : questionTempDatas[+currentQuestion]?.currentTestcase) === index) ? 'white' : '#ebebeb' }} className={[styles.testcase_box, nunito.className].join(' ')}>
                                  <span>
                                    {((questionTempDatas[+currentQuestion]?.testcase === undefined) ? '' : questionTempDatas[+currentQuestion]?.testcase[(questionTempDatas[+currentQuestion]?.currentTestcase === undefined) ? 0 : +questionTempDatas[+currentQuestion]?.currentTestcase]?.status === 'correct') ?
                                      '✅' 
                                    :
                                      '❌'
                                    }
                                  </span>
                                  <span>{index}</span>
                                </div>
                              )}
                            </div>
                            <div className={[styles.testcase_details_div, rubik.className].join(' ')}>
                              <span className={styles.testcase_details_status}>
                                {((questionTempDatas[+currentQuestion]?.testcase === undefined) ? '' : questionTempDatas[+currentQuestion]?.testcase[(questionTempDatas[+currentQuestion]?.currentTestcase === undefined) ? 0 : +questionTempDatas[+currentQuestion]?.currentTestcase]?.status === 'correct') ?
                                  'Congratulations, you passed the test case.'
                                  :
                                  'Testcase Failed'
                                }
                              </span>
                              <div className={styles.test_case_inner_box_div}>
                                <span className={[styles.test_case_output_title, poppins.className].join(' ')}>
                                  Input (stdin)
                                </span>
                                <span className={[styles.test_case_ouput_box, source_code_pro.className].join(' ')}>
                                  {examQuestions[+currentQuestion].testcase[(questionTempDatas[+currentQuestion]?.currentTestcase === undefined) ? 0 : questionTempDatas[+currentQuestion]?.currentTestcase].input}
                                </span>
                              </div>
                              <div className={styles.test_case_inner_box_div}>
                                <span className={[styles.test_case_output_title, poppins.className].join(' ')}>
                                  Output (stdout)
                                </span>
                                <span className={[styles.test_case_ouput_box, source_code_pro.className].join(' ')}>
                                  {(questionTempDatas[+currentQuestion]?.testcase === undefined) ? '' : questionTempDatas[+currentQuestion]?.testcase[(questionTempDatas[+currentQuestion]?.currentTestcase === undefined) ? 0 : +questionTempDatas[+currentQuestion]?.currentTestcase]?.output}                                  
                                </span>
                              </div>
                              <div className={styles.test_case_inner_box_div}>
                                <span className={[styles.test_case_output_title, poppins.className].join(' ')}>
                                  Expected Output
                                </span>
                                <span className={[styles.test_case_ouput_box, source_code_pro.className].join(' ')}>
                                  {examQuestions[+currentQuestion].testcase[(questionTempDatas[+currentQuestion]?.currentTestcase === undefined) ? 0 : questionTempDatas[+currentQuestion]?.currentTestcase].output}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </>
          }
        </div>
      </div>
      <div ref={examWarn} className={styles.exam_main_div}>
        <div className={styles.exam_inner_div}>
          <div className={[styles.exam_main_div_header, rubik.className].join(' ')}>
            <span>Warning ⚠️</span>
            <span onClick={(event) => {if (examWarn.current !== null) { examWarn.current.style.display = 'none' }}} className={styles.exam_main_div_close}>&times;</span>
          </div>
          <div className={[styles.exam_main_contents_div, rubik.className].join(' ')}>
            Dont Switch the tab. If you continue to switch the tab then the test will automatically end.
          </div>
        </div>
      </div>
    </div>
  )
}
