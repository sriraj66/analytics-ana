'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { useCookies } from 'react-cookie';
import request from '@/utils/customFetch';
import { PiExamBold } from 'react-icons/pi'
import { BiTimeFive } from 'react-icons/bi'
import displayDate from '@/utils/dateRender';
import Spinner from '@/components/misc/loaders/spinner';
import { Space_Grotesk, Nunito, Rubik } from 'next/font/google'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
// const nunito = Nunito({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] })
// const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

try {
  const  rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] });
  const nunito = Nunito({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
  const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });
} catch (e) {
  console.error('Error loading fonts', e);
  const rubik = { className: 'default-font' };
  const nunito = { className: 'default-font' };
  const space_grotesk = { className: 'default-font' };
}

interface examDataArray {
  id: string,
  title: string,
  status: string,
  date: string,
  start: string,
  end: string,
  category: string,
  userStatus: string
}

export default function StudentDashboard() {
  const [cookie, setCookie, getCookie] = useCookies()
  const [currentUser, setCurrentUser] = useState("")
  const [profileData, setProfileData] = useState<any>(Object())
  const [fetchingData, setFetchingData] = useState(true)
  const [examFetchingData, setExamFetchingData] = useState(true)
  const [examDatas, setExamDatas] = useState<Array<examDataArray>>([])
  const [graphDatas, setGraphDatas] = useState<any>({
    datasets: [
      {
        label: "Exam Point",
        data: [],
        borderColor: "rgb(35 52 166)",
        backgroundColor: "rgba(190, 194, 233, 0.5)"
      }
    ]
  })

  const top_students_header = [
    'S.No',
    'Name',
    'Point'
  ]

  useEffect(() => {
    setCurrentUser((cookie.currentUser === undefined) ? '' : cookie.currentUser)
  }, [])

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/dashboard`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const profile_data = await response.json();
        setProfileData(profile_data)
        setGraphDatas({
          labels: profile_data.graph.map((data: any) => data.exam),
          datasets: [
            {
              fill: true,
              tension: 0.4,
              label: "Exam Point",
              data: profile_data.graph.map((data: any) => data.score),
              borderColor: "rgb(35 52 166)",
              backgroundColor: "rgba(190, 194, 233, 0.5)"
            }
          ]
        })
        setFetchingData(false)
      } catch(e) {
        console.error('Error fetching data', e);
        setFetchingData(false)
      }
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/exams`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let exam_data = await response.json();
        exam_data = exam_data.exams.filter((data: examDataArray) => data.status === 'ongoing')
        setExamDatas(exam_data)
        setExamFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setExamFetchingData(false)
      }
    };
    if (fetchingData) {
      fetchDatas();
    }
  }, [])

  const options = {
    responsive: true,
    aspectRatio: 3.9,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: "Datas"
      }
    },
    layout: {
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      borderWidth: 0,
    },
  };

  return (
    <div className={styles.dashboard_main_contents}>
      <span style={{ display: (currentUser === "") ? 'none' : 'block' }} className={[styles.welcome_user, rubik.className].join(' ')}>
        Welcome <span className={styles.welcome_user_gradient}>{currentUser.slice(0, 1).toUpperCase() + currentUser.slice(1, currentUser.length)}</span>
      </span>
      <Line style={{ display: (profileData.graph === undefined) ? 'none' : 'block' }} className={styles.graph_box} options={options} data={graphDatas} />
      <div className={styles.main_stats_inner_div}>
        <span className={[styles.main_stats_header, rubik.className].join(' ')}>
          Ongoing Exams
        </span>
        {(examFetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas, space_grotesk.className].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (examDatas.length === 0) ?
            <span className={[styles.no_datas, space_grotesk.className].join(' ')}>
              Currently there's no ongoing Exams
            </span>
            :
            <div className={styles.exam_main_div}>
              {examDatas.map((data: examDataArray) => 
                <Link href={(data.category.toLocaleLowerCase() === 'coding') ? '/dashboard/codingexam' : '/dashboard/mcqexam'} className={[styles.exam_div, nunito.className].join(' ')} key={data.id}>
                  <span className={styles.exam_title}>
                    {data.title}
                  </span>
                  <div style={{ gap: '10px' }} className={[styles.exam_details_div, rubik.className].join(' ')}>
                    <span style={{ gap: '8px' }} className={styles.exam_details_inner_div}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: "#2334a6", borderRadius: "10px"}}>
                        <BiTimeFive style={{ fontSize: '22px' }} />
                        Start
                      </span>
                      <span>
                        {displayDate(data.start)}
                      </span>
                    </span>
                    <span style={{ gap: '8px' }} className={styles.exam_details_inner_div}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: "#2334a6", borderRadius: "10px"}}>
                        <BiTimeFive style={{ fontSize: '22px' }} />
                        End
                      </span>
                      <span>
                        {displayDate(data.end)}
                      </span>
                    </span>
                    <span style={{ color: 'white' }} className={[styles.exam_details_inner_div, styles.table_curved_value].join(' ')}>
                      <PiExamBold style={{ fontSize: '22px' }} />
                      {data.category}
                    </span>
                  </div>
                </Link>
              )}
            </div>
        }
      </div>
      <div className={styles.main_stats_div}>
        <div className={styles.main_stats_inner_div_seperated}>
          <div style={{ gap: '14px' }} className={[styles.main_stats_inner_div, rubik.className].join(' ')}>
            <span className={styles.main_stats_header}>
              Overall Points
            </span>
            {(profileData.oascore !== undefined) &&
              <div className={styles.overall_points_div}>
                <span className={styles.overall_points_data}>
                    {profileData.oascore}
                  </span>
                  <Image alt='Badge' src={'/ui/badge.png'} width={40} height={40} />
                </div>
              }
            <span className={styles.overall_score_loader}>
              <span style={{ width: `${Math.round((profileData.oascore / profileData.total) * 100)}%` }} className={styles.overall_score_loaded}></span>
            </span>
          </div>
          <div className={styles.main_stats_inner_div}>
            <span className={[styles.main_stats_header, rubik.className].join(' ')}>
              Number of attended exam
            </span>
            <div className={[styles.attended_exams_div, rubik.className].join(' ')}>
              <div style={{ flex: 1 }} className={styles.attened_exams_inner_div}>
                <span style={{ color: '#2400FF', borderColor: '#2400FF' }} className={styles.attended_exam_circle}>
                  <span style={{ fontSize: '24px' }}>
                    {profileData.code_exam}
                  </span>
                </span>
                <span style={{ flex: 1, color: '#2400FF', fontSize: '18.5px' }}>
                  Coding Exam
                </span>
              </div>
              <div style={{ flex: 1 }} className={styles.attened_exams_inner_div}>
                <span style={{ color: '#BC42D0', borderColor: '#BC42D0' }} className={styles.attended_exam_circle}>
                  <span style={{ fontSize: '24px' }}>
                    {profileData.mcq_exam}
                  </span>
                </span>
                <span style={{ flex: 1, color: '#BC42D0', fontSize: '18.5px' }}>
                  MCQ Exam
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.main_stats_inner_div}>
          <span className={[styles.main_stats_header, rubik.className].join(' ')}>
            Top Students
          </span>
          {(fetchingData) ? 
            <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
            :
            ((profileData.scoreboard?.length === 0) || (profileData.scoreboard?.length === undefined)) ?
              <span className={[styles.no_datas, nunito.className].join(' ')} >
                Currently there is no Scoreboard
              </span>
              :
              <div className={[styles.top_students_div, rubik.className].join(' ')}>
                <div className={styles.top_students_header}>
                  {top_students_header.map(header => (
                    <span style={{ fontWeight: '500' }} className={styles.top_students_div_data} key={header}>
                      {header}
                    </span>
                  ))}
                </div>
                <div className={styles.top_students_datas_div}>
                  {profileData.scoreboard.map((scores: any, index: number) => (
                    <div className={styles.top_students_inner_div} key={index}>
                      <span className={styles.top_students_div_data}>
                        {index + 1}
                      </span>
                      <span className={styles.top_students_div_data}>
                        {scores.name}
                      </span>
                      <span className={styles.top_students_div_data}>
                        {scores.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
          }
        </div>
      </div>
    </div>
  )
}
