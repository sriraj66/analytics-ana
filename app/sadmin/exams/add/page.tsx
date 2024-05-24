'use client';
import { useCookies } from 'react-cookie';
import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react'
import styles from '../../page.module.css'
import styles2 from './page.module.css'
import { useRouter } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io'
import { ChangeEvent } from 'react';
import { FiArrowRight, FiUpload } from 'react-icons/fi'
import { BsFillFileEarmarkCodeFill } from 'react-icons/bs'
import request from '@/utils/customFetch';
import Spinner from '@/components/misc/loaders/spinner';
import readXlsxFile from 'read-excel-file'
import { Roboto, Inter } from 'next/font/google'
import { romanize } from 'romans';
import markdownRenderer from '@/utils/mdrenderutil/mdRender';

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const inter = Inter({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

interface departmentDataArray {
  _id: string,
  department: string,
  year: number,
  semester: number,
  section: string
}

interface collegeFormDataArray {
  title: string,
  date: string,
  start: number,
  end: number,
  exam: string,
  department: string
}

interface MCQDataArray {
  number: number,
  question: string, 
  answer: string,
  options: Array<string>,
  rating: number
}

export default function SuperAdminExamAdd() {
  const router = useRouter()
  const [cookie, setCookie, getCookie] = useCookies()
  const [submittingState, setSubmittingState] = useState(false)
  const uploadButton = useRef<HTMLInputElement>(null)
  const submitButton = useRef<HTMLButtonElement>(null)
  const [questionsCount, setQuestionsCount] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [formQuestionsDatas, setFormQuestionsDatas] = useState<any | MCQDataArray>([Object({number: 1, question: '', answer: '', option_1: '', option_2: '', option_3: '', option_4: '', rating: ''})])
  const [collegeFormDatas, setCollegeFormDatas] = useState<any | collegeFormDataArray>(Object({
    title: "",
    date: "",
    hours: "",
    minutes: "",
    start: "",
    end: "",
    exam: "MCQ",
    department: "",
    ansVis: true
  }))
  const [departmentId, setDepartmentId] = useState('')
  const [departmentList, setDepartmentList] = useState<Array<departmentDataArray>>([])
  const [excelFileData, setExcelFileData] = useState<any>(undefined)
  
  useEffect(() => {
    async function fetchData() {
      try {
        const departmentResponse = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/department`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const departmentData = await departmentResponse.json();
        if ((departmentData.department.length !== 0) || (departmentData.department.length !== undefined)) {
          setDepartmentId(departmentData.department[0]._id)
        }
        setDepartmentList(departmentData.department)
        setCollegeFormDatas({...collegeFormDatas, department: departmentData.department[0]._id})
      } catch {
        console.error('Error fetching data');
      }
    };
    fetchData();
  }, [])

  async function setFormDataState(event: BaseSyntheticEvent, key: string) {
    const arrayData = formQuestionsDatas
    let data = undefined
    try {
      data = arrayData[currentQuestion-1]
      data[key] = event.currentTarget.value
    }
    catch {
      data = Object({number: '', question: '', answer: '', option_1: '', option_2: '', option_3: '', option_4: '', rating: ''})
      data[key] = event.currentTarget.value
    }
    arrayData[currentQuestion-1] = data
    setFormQuestionsDatas([...arrayData])
  }

  function parseQuestionForm(object: any) {
    let newObj = Object()
    let options = []
    for (let obj in object) {
      if (obj.startsWith('option')) {
        options.push(object[obj])
      }
      else {
        newObj[obj] = (obj === 'rating') ? parseInt(object[obj]) : object[obj]
      }
    }
    newObj['options'] = options
    return newObj;
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const excelFile: any = event.target.files?.[0];
    if (excelFile) {
      try {
        readXlsxFile(excelFile).then(data => {
          console.log(data)
          console.log(data[0].length)
          if (data[0].length === 8) {
            setExcelFileData(data.slice(1).map((d: Array<any>) => Object({number: d[0], question: d[1], answer: d[2], options: d.slice(3, 7), rating: d[7]})))
          } else if (data[0].length === 10) {
            setExcelFileData(data.slice(1).map((d: Array<any>) => Object(
              {
                title: d[0],
                number: d[1],
                description: d[2],
                inputDescription: d[3],
                outputDescription: d[4],
                io: d[5].toString().split(',').map((value: any, index: number) => Object({input: value, output: d[6].toString().split(',')[index]})),
                testcase: d[7].toString().split(',').map((value: any, index: number) => Object({input: value, output: d[8].toString().split(',')[index]})),
                rating: d[9]
              }
            )))
          } else {
            setExcelFileData(undefined)
          }
        })
      } catch {
        setExcelFileData(undefined)
      }
    }
  }

  async function handleQuestionsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    let formNotFilled = false
    if (submitButton.current !== null) {
      submitButton.current.click()
    }
    formQuestionsDatas.forEach((questions: any, index: number) => {
      for (let value in questions) {
        if (questions[value] === '') {
          setCurrentQuestion(index+1)
          formNotFilled = true
          break;
        }
      }
      if (formNotFilled) { return; }
    });
    if (formNotFilled) { return; }
    const questions = formQuestionsDatas.map((datas: any) => parseQuestionForm(datas))
    let ExamDatas = {...collegeFormDatas}
    ExamDatas.start = new Date(collegeFormDatas.start).getTime()
    ExamDatas.end = new Date(collegeFormDatas.end).getTime()
    ExamDatas.questions = questions
    setSubmittingState(true)
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/exams/add`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(ExamDatas)})
      router.push('/admin/exams')
      router.refresh()
    } catch(error) {
      console.error("Error while Posting the Exam")
      setSubmittingState(false)
    }
  }

  async function handleQuestionsUpload(event: any) {
    let ExamDatas = {...collegeFormDatas}
    ExamDatas.start = new Date(collegeFormDatas.start).getTime()
    ExamDatas.end = new Date(collegeFormDatas.end).getTime()
    ExamDatas.questions = excelFileData
    setSubmittingState(true)
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/exams/add`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(ExamDatas)})
      router.push('/admin/exams')
      router.refresh()
    } catch(error) {
      console.error("Error while Posting the Exam")
      setSubmittingState(false)
    }
  }

  return (
    <div className={styles.admin_main_contents}>
      <div className={styles.light_gray_div}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Add Exam
          </span>
        </div>
        <div className={[styles2.exam_div].join(' ')}>
          <div className={[styles2.details_main_div, styles.details_main_div, roboto.className].join(' ')}>
            <div className={styles2.splitted_options_div}>
              <span className={styles2.splitted_options_div_heading}>
                Exam Detail
              </span>
              <div style={{ flexDirection: 'column' }} className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                <span style={{ width: '100%' }} className={[styles2.details_header, styles.details_header].join(' ')}>Title</span>
                <input value={collegeFormDatas.title} onChange={(value) => setCollegeFormDatas({...collegeFormDatas, title: value.currentTarget.value})} name='title' placeholder='Enter the Exam Title' className={[styles.details_value, inter.className].join(' ')} key={'exam_title'} required />
              </div>
              <div className={styles2.splitted_options_row_div}>
                <div style={{ flexDirection: 'column' }} className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                  <span style={{ width: '100%' }} className={[styles2.details_header, styles.details_header].join(' ')}>Exam Format</span>
                  <select value={collegeFormDatas.exam} onChange={(value) => {setExcelFileData(undefined); setCollegeFormDatas({...collegeFormDatas, exam: value.currentTarget.value})}} name='exam' className={[styles.details_value, inter.className].join(' ')} key={'exam_format'} required >
                    <option value={'MCQ'}>
                      MCQ
                    </option>
                    <option value={'Coding'}>
                      Coding
                    </option>
                  </select>
                </div>
                <div style={{ flexDirection: 'column' }} className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                  <span style={{ width: '100%' }} className={[styles2.details_header, styles.details_header].join(' ')}>Date</span>
                  <input value={collegeFormDatas.date} onChange={(value) => setCollegeFormDatas({...collegeFormDatas, date: value.currentTarget.value})} name='date' placeholder='Select the Exam Date' type='date' className={[styles.details_value, inter.className].join(' ')} onClick={(event) => event.currentTarget.showPicker()} key={'exam_date'} required />
                </div>
                <div style={{ flexDirection: 'column' }} className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                  <span style={{ width: '100%' }} className={[styles2.details_header, styles.details_header].join(' ')}>Duration</span>
                  <div className={styles2.timing_div}>
                    <input value={collegeFormDatas.hours} onChange={(value) => {if ((parseInt(value.currentTarget.value) < parseInt(value.currentTarget.min)) || (parseInt(value.currentTarget.value) > parseInt(value.currentTarget.max))) { return; } ; setCollegeFormDatas({...collegeFormDatas, hours: value.currentTarget.value})}} name='date' placeholder='Hrs' min={0} max={24} type='number' className={[styles.details_value, inter.className].join(' ')} key={'exam_duration_hours'} required />
                    <span style={{ fontSize: "22px", fontWeight: 500 }}>:</span>
                    <input value={collegeFormDatas.minutes} onChange={(value) => {if ((parseInt(value.currentTarget.value) < parseInt(value.currentTarget.min)) || (parseInt(value.currentTarget.value) > parseInt(value.currentTarget.max))) { return; } ; setCollegeFormDatas({...collegeFormDatas, minutes: value.currentTarget.value})}} name='date' placeholder='Mins' min={0} max={60} type='number' className={[styles.details_value, inter.className].join(' ')} key={'exam_duration_minutes'} required />
                  </div>
                </div>
                <div style={{ flexDirection: 'column' }} className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                  <span style={{ width: '100%' }} className={[styles2.details_header, styles.details_header].join(' ')}>Results</span>
                  <select onChange={(value) => {setCollegeFormDatas({...collegeFormDatas, ansVis: (value.currentTarget.value === 'yes')})}} name='ansVis' className={[styles.details_value, inter.className].join(' ')} required>
                    <option value='yes'>Show</option>
                    <option value='no'>Hide</option>
                  </select>
                </div>
              </div>
              <div className={styles2.splitted_options_row_div}>
                <div style={{ flexDirection: 'column' }} className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                  <span style={{ width: '100%' }} className={[styles2.details_header, styles.details_header].join(' ')}>Start Time</span>
                  <input value={collegeFormDatas.start} onChange={(value) => {setCollegeFormDatas({...collegeFormDatas, start: value.currentTarget.value})}} name='start' placeholder='Select the Start Time' type='datetime-local' className={[styles.details_value, inter.className].join(' ')} onClick={(event) => event.currentTarget.showPicker()} key={'exam_start'} required />
                </div>
                <div style={{ flexDirection: 'column' }} className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                  <span style={{ width: '100%' }} className={[styles2.details_header, styles.details_header].join(' ')}>End Time</span>
                  <input value={collegeFormDatas.end} onChange={(value) => setCollegeFormDatas({...collegeFormDatas, end: value.currentTarget.value})} name='end' placeholder='Select the End Time' type='datetime-local' className={[styles.details_value, inter.className].join(' ')} onClick={(event) => event.currentTarget.showPicker()} key={'exam_end'} required />
                </div>
              </div>
            </div>
            <div className={styles2.splitted_options_div}>
              <span className={styles2.splitted_options_div_heading}>
                College Detail
              </span>
              <div style={{ flexDirection: 'column' }} className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                <span style={{ width: '100%' }} className={[styles2.details_header, styles.details_header].join(' ')}>Department</span>
                <select onChange={(value) => setCollegeFormDatas({...collegeFormDatas, department: value.currentTarget.value})} name='department' className={[styles.details_value, inter.className].join(' ')} required >
                  {departmentList.map(department =>
                    <option value={department._id} key={department._id}>
                      {department.department} | {romanize(department.year)} / {romanize(department.semester)} / {department.section}
                    </option>
                  )}                
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {(Object.values(collegeFormDatas).every((value) => value !== "")) &&
        <div className={styles.light_gray_div}>
          <div className={styles.light_gray_heading_div}>
            <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
              Add Questions
            </span>
            <div style={{ display: 'inline-flex', alignSelf: 'end', gap: '8px' }}>
              <input onChange={handleFileChange} accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' ref={uploadButton} style={{ display: 'none' }} type='file'></input>
              <button onClick={() => { if (uploadButton) { if (uploadButton.current !== null) { uploadButton.current.value = "" }; uploadButton.current?.click() } }} className={[styles.iconButton_div, roboto.className].join(' ')}>
                <FiUpload className={styles.iconButton_icon} />
                <span>Upload</span>
              </button>
            </div>
          </div>
          {
            ((excelFileData === undefined) && (collegeFormDatas.exam?.toLowerCase() === 'mcq')) &&
              <form onSubmit={handleQuestionsSubmit} className={[styles2.exam_div].join(' ')}>
                <div className={[styles2.details_main_div, styles.details_main_div, roboto.className].join(' ')}>
                  <div className={styles2.splitted_options_div}>
                    <div className={styles2.splitted_options_div_heading_row}>
                      <span className={styles2.splitted_options_div_heading}>
                        MCQ Question -
                      </span>
                      <select value={currentQuestion} onChange={(event: BaseSyntheticEvent) => setCurrentQuestion(parseInt(event.currentTarget.value))} className={[styles2.questions_select, inter.className].join(' ')}>
                        {Array(questionsCount).fill(1).map((option, index) =>
                          <option value={index+1} key={index+1}>
                            {index+1}
                          </option> 
                        )}
                      </select>
                    </div>
                    <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                      <span className={[styles2.details_header, styles.details_header].join(' ')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Question</span>
                      <textarea onChange={(event) => setFormDataState(event, 'question')} value={formQuestionsDatas[currentQuestion-1]['question']} name='question' placeholder='Write the Question...' className={[styles.details_value, inter.className].join(' ')} style={{ resize: 'vertical', minHeight: '10em' }} required />
                    </div>
                    <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                      <span className={[styles2.details_header, styles.details_header].join(' ')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Options</span>
                      <div className={styles2.mcq_options_div}>
                        {Array(4).fill(1).map((option, index) =>
                          <input onChange={(event) => setFormDataState(event, `option_${index+1}`)} value={formQuestionsDatas[currentQuestion-1][`option_${index+1}`]} name='options' placeholder={`Enter the Option ${index+1}`} type='text' className={[styles2.mcq_options_details_value, styles.details_value, inter.className].join(' ')} key={index} required />
                        )}
                      </div>
                    </div>
                    <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                      <span className={[styles2.details_header, styles.details_header].join(' ')}>Answer</span>
                      <input onChange={(event) => setFormDataState(event, 'answer')} value={formQuestionsDatas[currentQuestion-1]['answer']} name='answer' placeholder='Enter the Answer' type='text' className={[styles.details_value, inter.className].join(' ')} required />
                    </div>
                    <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
                      <span className={[styles2.details_header, styles.details_header].join(' ')}>Rating</span>
                      <input onChange={(event) => setFormDataState(event, 'rating')} value={formQuestionsDatas[currentQuestion-1]['rating']} name='answer' placeholder='Enter the rating for this question' type='number' className={[styles.details_value, inter.className].join(' ')} required />
                    </div>
                  </div>
                </div>
                <div className={styles2.iconButtons_row_div}>
                  {/*
                  <div style={{ cursor: (questionsCount ===   1) ? 'no-drop' : 'pointer' }} onClick={() => {if (questionsCount === 1) {return;} ; setQuestionsCount(questionsCount-1); setCurrentQuestion(0); const questions = formQuestionsDatas; questions.pop(); setFormQuestionsDatas([...questions]); console.log(formQuestionsDatas); console.log(currentQuestion, questionsCount)}} className={[styles2.add_exam_button, styles.iconButton_div, roboto.className].join(' ')}>
                    <AiFillDelete className={styles.iconButton_icon} />
                    <span>Delete</span>
                  </div>
                  */}
                  {(excelFileData === undefined) &&
                    <div onClick={() => {setQuestionsCount(questionsCount+1); setCurrentQuestion(questionsCount+1); setFormQuestionsDatas([...formQuestionsDatas, Object({number: questionsCount+1, question: '', answer: '', option_1: '', option_2: '', option_3: '', option_4: '', rating: ''})])}} className={[styles2.add_exam_button, styles.iconButton_div, roboto.className].join(' ')}>
                      <span>Add Question</span>
                      <IoMdAdd className={styles.iconButton_icon} />
                    </div>
                  }
                  {submittingState ? 
                    <span className={[styles.submit_loader].join(' ')}>
                      <Spinner />
                    </span>
                    :
                    <button ref={submitButton} type='submit' className={[styles2.add_exam_button_colored, styles2.add_exam_button, styles.iconButton_div, roboto.className].join(' ')}>
                      <span>Submit</span>
                      <FiArrowRight className={[styles2.add_exam_button_colored, styles.iconButton_icon].join(' ')} />
                    </button>
                  }
                </div>
              </form>
            }
            {((excelFileData !== undefined) && (collegeFormDatas.exam?.toLowerCase() === 'mcq')) ?
              <>
                <div className={[styles2.details_main_div, styles.details_main_div, roboto.className].join(' ')}>
                  <div className={styles2.splitted_options_div}>
                    <span className={styles2.splitted_options_div_heading}>
                      Preview
                    </span>
                    {excelFileData.map((data: MCQDataArray) =>
                      <div className={[styles2.details_inner_div, styles.details_inner_div, roboto.className].join(' ')} key={data.number}>
                        <span className={[styles2.question_inner_text, inter.className].join(' ')}>
                          {data.number}{')'} {data.question}
                        </span>
                        <div style={{ paddingBottom: '8px' }} className={styles2.questions_options_div}>
                          {data.options.map((option, index) =>
                            <span style={(data.answer === option) ? { backgroundColor: "#282b4a", color: 'white' } : {}} className={styles2.options_item} key={index}>
                              {option}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {(submittingState) ?
                    <span className={[styles.submit_loader].join(' ')}>
                      <Spinner />
                    </span>
                    :
                    <button onClick={handleQuestionsUpload} ref={submitButton} type='submit' className={[styles2.add_exam_button_colored, styles2.add_exam_button, styles.iconButton_div, roboto.className].join(' ')}>
                      <span>Submit</span>
                      <FiArrowRight className={[styles2.add_exam_button_colored, styles.iconButton_icon].join(' ')} />
                    </button>
                  }
                </div>
              </>
              :
                ((excelFileData !== undefined) && (collegeFormDatas.exam?.toLowerCase() === 'coding')) ?
                  <>
                    <div className={[styles2.details_main_div, styles.details_main_div, roboto.className].join(' ')}>
                      <div className={styles2.splitted_options_div}>
                        <span className={styles2.splitted_options_div_heading}>
                          Preview
                        </span>
                        {excelFileData.map((data: any) =>
                          <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')} key={data.number}>
                            <div className={styles2.questions_main_div}>
                              <div className={styles2.questions_preview_inner_div}>
                                <span className={[styles2.question_inner_text, inter.className].join(' ')}>
                                  <BsFillFileEarmarkCodeFill /> {data.title}
                                </span>
                              </div>
                              <div className={styles2.questions_options_div}>
                                {markdownRenderer(data.description)}
                              </div>
                              <div className={styles2.questions_table_div}>
                                <table className={styles2.questions_table}>
                                  <thead>
                                    <tr>
                                      <td>Input</td>
                                      <td>Output</td>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {data.io.map((io: any, index: number) =>
                                      <tr key={index}>
                                        <td>{io.input}</td>
                                        <td>{io.output}</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                                <table className={styles2.questions_table}>
                                  <thead>
                                    <tr>
                                      <td>TestCases Input</td>
                                      <td>TestCases Output</td>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {data.testcase.map((io: any, index: number) =>
                                      <tr key={index}>
                                        <td>{io.input}</td>
                                        <td>{io.output}</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button onClick={handleQuestionsUpload} disabled={submittingState} style={submittingState ? { cursor: 'no-drop', backgroundColor: '#1b238d' } : {}} className={[styles2.add_exam_button_colored, styles2.add_exam_button, styles2.iconButton_div, styles.iconButton_div, roboto.className].join(' ')} type='submit'>
                        <span>Submit</span>
                        {submittingState ?
                          <Spinner />
                          :
                          <FiArrowRight style={{ backgroundColor: 'transparent' }} className={[styles2.add_exam_button_colored, styles.iconButton_icon].join(' ')} />
                        }
                      </button>
                    </div>
                  </>
                :
                  ((excelFileData === undefined) && (collegeFormDatas.exam?.toLowerCase() === 'coding')) &&
                    <span style={{ fontWeight: '500' }} className={[styles.no_datas, inter.className].join(' ')}>
                      Upload an Excel File with Coding Questions
                    </span>
              }
        </div>
      }
    </div>
  )
}
