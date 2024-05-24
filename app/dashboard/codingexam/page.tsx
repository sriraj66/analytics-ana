'use client';
import styles from '../page.module.css'
import styles2 from './page.module.css'
import request from '@/utils/customFetch';
import { useCookies } from 'react-cookie';
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';
import { Space_Grotesk, Nunito, Rubik } from 'next/font/google'
import displayDate from '@/utils/dateRender';
import Link from 'next/link';

const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] })
const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

interface examDataArray {
  id: string,
  title: string,
  status: string,
  date: string,
  start: string,
  end: string,
  hours: number,
  minutes: number,
  category: string,
  attend: string,
  userStatus: string
}

export default function StudentExamList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const examMain = useRef<HTMLDivElement>(null)
  const [currentExam, setCurrentExam] = useState(0)
  const [fetchingData, setFetchingData] = useState(true)
  const [examDatas, setExamDatas] = useState<Array<examDataArray>>([])
  const gradient_colors: any = {
    'upcoming': styles.upcoming_gradient,
    'ongoing': styles.ongoing_gradient,
    'ended': styles.ended_gradient,
    'attended': styles.attended_gradient,
  }
  const data_headers = [
    'Title',
    'Start',
    'End',
    'Status',
    'Category'
  ]
  
  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/exams`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let exam_data = await response.json();
        exam_data = exam_data.exams.filter((data: examDataArray) => data.category.toLowerCase() === 'coding').sort((a: examDataArray, b: examDataArray) => (a.status === "ongoing" ? -1 : 1))
        setExamDatas(exam_data)
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    };
    if (fetchingData) {
      fetchDatas();
    }
  }, [examDatas])

  useEffect(() => {
    window.onclick = (event) => {
      if (examMain.current !== null) {
        if (event.target == examMain.current) {
          examMain.current.style.display = 'none'
        }
      } 
    }  
  }, [])

  function spawnFullScreen(event: any) {
    const element: any = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
  }

  return (
    <div className={styles.dashboard_main_contents}>
      <div className={[styles.light_white_div].join(' ')}>
        <div className={styles.table_decoration}>
          <span className={[styles.heading_text, rubik.className].join(' ')}>
            Coding Exams
          </span>
          {(fetchingData) ? 
            <span style={{ padding: '15px' }} className={[styles.no_datas, space_grotesk.className].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
            :
            (examDatas.filter((data) => data.category.toLowerCase() === 'coding').length === 0) ?
              <span className={[styles.no_datas, space_grotesk.className].join(' ')}>
                Currently there's no Exams
              </span>
              :
              <div className={styles.table_div}>
                <div className={[styles.table_headers, rubik.className].join(' ')}>
                  {data_headers.map((header, index) =>
                    <span key={index} className={styles.table_values}>
                      {header}
                    </span>
                  )}
                </div>
                {examDatas.map((data, index: number) =>
                  <div onClick={(event) => {setCurrentExam(index); if (examMain.current !== null) { examMain.current.style.display = 'block' }}} className={[styles.table_headers, styles.table_active_div, rubik.className].join(' ')} key={data.id}>
                    <span className={styles.table_values}>
                      {data.title}
                    </span>
                    <span className={styles.table_values}>
                      {displayDate(data.start)}
                    </span>
                    <span className={styles.table_values}>
                      {displayDate(data.end)}
                    </span>
                    <span className={styles.table_values}>
                      <span className={[styles.table_curved_value, gradient_colors[data.attend.toLowerCase()], gradient_colors[data.status.toLowerCase()]].join(' ')}>
                        {(data.attend.toLowerCase() === 'attended') ? data.attend : data.status}
                      </span>
                    </span>
                    <span className={styles.table_values}>
                      <span className={styles.table_curved_value}>
                        {data.category}
                      </span>
                    </span>
                  </div>
                )}
              </div>
          }
        </div>
      </div>
      {(examDatas.length !== 0) &&
        <div ref={examMain} className={styles2.exam_main_div}>
          <div className={styles2.exam_inner_div}>
            <div className={[styles2.exam_main_div_header, rubik.className].join(' ')}>
              <span>Exam Details</span>
              <span onClick={(event) => {if (examMain.current !== null) { examMain.current.style.display = 'none' }}} className={styles2.exam_main_div_close}>&times;</span>
            </div>
            <div className={[styles2.exam_main_contents_div, rubik.className].join(' ')}>
              <div className={styles2.exam_data_div}>
                <div className={styles2.exam_icon_heading}>
                  <span>Title</span>
                </div>
                <div className={styles2.exam_data}>
                  {examDatas[currentExam].title}
                </div>
              </div>
              <div className={styles2.exam_data_div}>
                <div className={styles2.exam_icon_heading}>
                  <span>Start Time</span>
                </div>
                <div className={styles2.exam_data}>
                  {displayDate(examDatas[currentExam].start)}
                </div>
              </div>
              <div className={styles2.exam_data_div}>
                <div className={styles2.exam_icon_heading}>
                  <span>End Time</span>
                </div>
                <div className={styles2.exam_data}>
                  {displayDate(examDatas[currentExam].end)}
                </div>
              </div>
              <div className={styles2.exam_data_div}>
                <div className={styles2.exam_icon_heading}>
                  <span>Time Limit</span>
                </div>
                <div className={styles2.exam_data}>
                  {examDatas[currentExam].hours} hr {examDatas[currentExam].minutes} min
                </div>
              </div>
              <div className={styles2.exam_data_div}>
                <div className={styles2.exam_icon_heading}>
                  <span>Category</span>
                </div>
                <div style={{ color: 'white', paddingBlock: '2px' }} className={[styles2.exam_data, styles.table_curved_value].join(' ')}>
                  {examDatas[currentExam].category}
                </div>
              </div>
              <div className={styles2.exam_data_div}>
                <div className={styles2.exam_icon_heading}>
                  <span>Status</span>
                </div>
                <div style={{ color: 'white', paddingBlock: '2px' }} className={[styles2.exam_data, styles.table_curved_value, gradient_colors[examDatas[currentExam].attend.toLowerCase()], gradient_colors[examDatas[currentExam].status.toLowerCase()]].join(' ')}>
                  {(examDatas[currentExam].attend.toLowerCase() === 'attended') ? examDatas[currentExam].attend : examDatas[currentExam].status}
                </div>
              </div>
              {((examDatas[currentExam].userStatus?.toLowerCase() !== 'attended') && (examDatas[currentExam].status.toLowerCase() !== 'ended')) &&
                <>
                  <div className={styles2.exam_rules_div}>
                    <div className={styles2.exam_icon_heading}>
                      <span>Rules</span>
                    </div>
                    <ul className={[styles2.exam_rules, space_grotesk.className].join(' ')}>
                      <li>
                        Do not Copy from others
                      </li>
                      <li>
                        Try not to Switch to New tab in the Browser
                      </li>
                      <li>
                        Check if you have Stable Internet Connection before attending the test
                      </li>
                    </ul>
                  </div>
                  <span className={styles2.exam_attend_button_div}>
                    {(examDatas[currentExam].attend.toLowerCase() === 'attended') ? 
                      <Link onClick={spawnFullScreen} href={`/dashboard/exams/${examDatas[currentExam].id}/results`} className={[styles2.exam_attend_button, nunito.className].join(' ')}>
                        View Results
                      </Link>
                      :
                      (examDatas[currentExam].status == "ongoing") ? 
                        <Link onClick={spawnFullScreen} href={`/dashboard/exams/${examDatas[currentExam].id}`} className={[styles2.exam_attend_button, nunito.className].join(' ')}>
                          Attend Now
                        </Link>
                        :
                        <span style={{cursor: "no-drop"}} className={[styles2.exam_attend_button, nunito.className].join(' ')}>
                          Upcoming
                        </span>
                    }
                  </span>
                </>
              }
            </div>
          </div>
        </div>
      }
    </div>
  )
}
