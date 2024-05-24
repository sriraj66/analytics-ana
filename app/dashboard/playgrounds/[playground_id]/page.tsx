'use client';
import styles from './page.module.css'
import AceEditor from "react-ace";
import { useCookies } from "react-cookie";
import { BiSave } from 'react-icons/bi'
import { VscPlay } from 'react-icons/vsc'
import { useState, useEffect, useRef } from "react";
import { MdDarkMode } from 'react-icons/md'
import { BsSunFill } from 'react-icons/bs'
import request from '@/utils/customFetch';
import Spinner from '@/components/misc/loaders/spinner';
import { useRouter } from 'next/navigation';
import { Space_Grotesk, Nunito, Lato, Source_Code_Pro } from 'next/font/google'

const nunito = Nunito({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] })
const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })
const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'] })
const source_code_pro = Source_Code_Pro({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

import "ace-builds/src-noconflict/ext-language_tools";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";

import 'ace-builds/src-noconflict/theme-crimson_editor';
import 'ace-builds/src-noconflict/theme-monokai';

export default function StudentPlayGround({ params }: { params: { playground_id: string } }) {
  const router = useRouter()
  const [playgroundTitle, setPlaygroundTitle] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [questionInput, setQuestionInput] = useState('')
  const [inputCases, setInputCases] = useState<any>([])
  const titleDiv = useRef<HTMLSpanElement>(null)
  const questionsDiv = useRef<HTMLSpanElement>(null)
  const inputsDiv = useRef<HTMLSpanElement>(null)
  const [cookie, setCookie, getCookie] = useCookies()
  const [fetchingData, setFetchingData] = useState(true)
  const [consoleOutput, setConsoleOutput] = useState<string | undefined>(undefined)
  const [submittingState, setSubmittingState] = useState(false)
  const [savingState, setSavingState] = useState(false)
  const [editorTheme, setEditorTheme] = useState('')
  const coding_languages = ['python', 'c', 'c++', 'java']
  const [codeLanguage, setCodeLanguage] = useState('python')
  
  useEffect(() => {
    const localCodeEditorTheme = localStorage.getItem('editorTheme')
    setEditorTheme((localCodeEditorTheme === null) ? 'dark' : localCodeEditorTheme)
  }, [])

  async function saveCode(state = true) {
    setSavingState(state)
    try {
      if (params.playground_id === 'create') {
        const create_response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/playground/save`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({name: playgroundTitle, code: codeInput, language: (codeLanguage === 'c++') ? 'cpp' : codeLanguage, question: questionInput, input: [inputCases]})})
        const create_data = await create_response.json()
        router.push(`/dashboard/playgrounds/${create_data?.id}`)
        router.refresh()
        setSavingState(false)
        return;
      }
      const response_data = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/playground/${params.playground_id}`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      const data = await response_data.json()
      if ((data?.playground._id) === params.playground_id) {  
        await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/playground/${params.playground_id}`, {method: 'PUT', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({name: playgroundTitle, code: codeInput, language: (codeLanguage === 'c++') ? 'cpp' : codeLanguage, question: questionInput, input: [inputCases]})})
      }
    } catch (e) {
      console.log("Cannot Save to the Server", e)
    }
    setSavingState(false)
  }

  async function compileCode() {
    setSubmittingState(true)
    try {
        let response: any = Object()
      if (!(params.playground_id === 'create')) {
        await saveCode(false)
        response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/playground/${params.playground_id}`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({code: codeInput, language: (codeLanguage === 'c++') ? 'cpp' : codeLanguage, input: [inputCases]})})
      } else {
        response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/playground/run`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({code: codeInput, language: (codeLanguage === 'c++') ? 'cpp' : codeLanguage, input: [inputCases]})})
      }
      let data = await response.json()
      data = data.output[0]
      if (typeof data === 'string') {
        setConsoleOutput(data)
        setSubmittingState(false)
        return
      }
      if (data.status.toLowerCase() === 'compilation error') {
        setConsoleOutput(data.status + '\n' + data.error.stderr)
      } else {
        setConsoleOutput(data?.output)
      }
    } catch {
      console.error("Error while Submitting")
    }
    setSubmittingState(false)
  }

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/playground/${params.playground_id}`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setQuestionInput((data.playground?.question === undefined) ? '' : data.playground?.question)
        setPlaygroundTitle(data.playground.name)
        setCodeInput(data.playground.code)
        setInputCases(data.playground.input[0])
        setCodeLanguage(data.playground.language)
        setFetchingData(false)
      } catch {
        router.push(`/dashboard/playgrounds/create`)
        router.refresh()
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (params.playground_id === 'create') {
      setFetchingData(false)
      return
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [])

  useEffect(() => {
    if (titleDiv.current) {
      titleDiv.current.innerText = playgroundTitle
    }
    if (questionsDiv.current) {
      questionsDiv.current.innerText = questionInput
    }
    if (inputsDiv.current) {
      inputsDiv.current.innerText = inputCases.join("\n")
    }
  }, [fetchingData])

  return (
    <div className={styles.dashboard_code_contents}>
      <div className={[styles.code_question_title_div, space_grotesk.className].join(' ')}>
        <span>
          PlayGround
        </span>
      </div>
      <div className={styles.code_main}>
        {(fetchingData) ?
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
        :
          <>
            <div className={[styles.code_question_inner_div, lato.className].join(' ')}>
              <span className={styles.code_question_inner_div_heading}>Playground Name</span>
              <span ref={titleDiv} onKeyUpCapture={(event) => setPlaygroundTitle(event.currentTarget.innerText)} contentEditable spellCheck={false} className={styles.code_question_inner_div_question}></span>
            </div>
            <div className={styles.code_question_div}>
              <div className={[styles.code_question_inner_div, lato.className].join(' ')}>
                <span className={styles.code_question_inner_div_heading}>Question</span>
                <span ref={questionsDiv} onKeyUpCapture={(event) => setQuestionInput(event.currentTarget.innerText)} contentEditable spellCheck={false} className={styles.code_question_inner_div_question}></span>
              </div>
              <div className={[styles.user_input_div, styles.code_question_inner_div, lato.className].join(' ')}>
                <span className={styles.code_question_inner_div_heading}>Inputs</span>
                <span ref={inputsDiv} onKeyUpCapture={(event) => setInputCases(event.currentTarget.innerText.split('\n'))} contentEditable spellCheck={false} className={styles.code_question_inner_div_question}></span>
              </div>
            </div>
            <div className={styles.code_editor_div}>
              <div className={styles.code_editor}>
                <div className={[styles.editor_config, nunito.className].join(' ')}>
                  <select className={[styles.editor_language_select, nunito.className].join(' ')} value={codeLanguage} onChange={(event) => setCodeLanguage(event.currentTarget.value)}>
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
                    <button title='Save' disabled={savingState || (codeInput === '')} onClick={() => saveCode()} style={savingState ? { color: 'white', cursor: 'no-drop', backgroundColor: '#1b238d' } : (codeInput === '') ? { color: 'gray', cursor: 'no-drop', backgroundColor: 'lightgray' } : {}} className={[styles.editor_theme_button, space_grotesk.className].join(' ')}>
                      {savingState ?
                        <Spinner />
                        :
                        <>
                          <BiSave fontSize={20} /><span>Save</span>
                        </>
                      }
                    </button>
                    <button title='Run' disabled={submittingState || (codeInput === '')} onClick={() => compileCode()} style={submittingState ? { color: 'white', cursor: 'no-drop', backgroundColor: '#1b238d' } : (codeInput === '') ? { color: 'gray', cursor: 'no-drop', backgroundColor: 'lightgray' } : {}} className={[styles.editor_theme_button, space_grotesk.className].join(' ')}>
                      {submittingState ?
                        <Spinner />
                        :
                        <>
                          <VscPlay fontSize={20} /><span>Run</span>
                        </>
                      }
                    </button>
                  </div>
                </div>
                <AceEditor
                  mode={(['c', 'c++', 'cpp'].includes(codeLanguage)) ? 'c_cpp' : codeLanguage}
                  theme={(editorTheme === 'white') ? 'crimson_editor' : 'monokai'}
                  name="code_editor"
                  fontSize={17}
                  showGutter={true}
                  highlightActiveLine={true}
                  showPrintMargin={false}
                  wrapEnabled={true}
                  value={codeInput}
                  onChange={(code) => setCodeInput(code)}
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
                  editorProps={{ $blockScrolling: true }}
                />
              </div>
            </div>
            <div style={{ overflow: 'hidden' }} className={styles.code_editor_div}>
              <div style={{ color: '#282b4a', padding: "8px 12px", fontSize: "20px", fontWeight: "600", background: (editorTheme === 'white') ? "" : "white" }}  className={[styles.editor_config, lato.className].join(' ')}>
                Output
              </div>
              <span style={{ overflow: 'auto', backgroundColor: (editorTheme === 'white') ? 'white' : '#28292a', color: (editorTheme === 'white') ? '#28292a' : 'white' }} className={[styles.output_box_value, source_code_pro.className].join(' ')}>
                {consoleOutput}
              </span>
            </div>
          </>
        }
      </div>
    </div>
  )
}
