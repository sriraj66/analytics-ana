'use client';
import Link from 'next/link'
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import styles from './page.module.css'
import request from '@/utils/customFetch';
import { Actor, Roboto, Rubik } from 'next/font/google'
import { romanize } from 'romans'
import Spinner from '@/components/misc/loaders/spinner';
import displayDate from '@/utils/dateRender';
import { BiTimeFive, BiSolidInstitution } from 'react-icons/bi'
import { MdOutlineSchool, MdOutlineEvent } from 'react-icons/md'

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

interface examDataArray {
  _id: string,
  title: string,
  college: string,
  department: string,
  year:number,
  semester: number,
  section: string,
  date: string,
  start: string,
  end: string,
  category: string,
  status: string
}

interface eventDataArray {
  _id: string,
  username: string,
  title: string,
  college: string,
  department: string,
  year: number,
  semester: number,
  section: string,
  date: string,
  eventlink: string,
  image: string
}

export default function SuperAdminDashboard() {
  const [cookie, setCookie, getCookie] = useCookies()
  const [currentUser, setCurrentUser] = useState("")
  const [eventFetchingData, setEventFetchingData] = useState(true)
  const [examFetchingData, setExamFetchingData] = useState(true)
  const [profileFetchingData, setProfileFetchingData] = useState(true)
  const [profileDatas, setProfileDatas] = useState<any>(Object())
  const [examDatas, setExamDatas] = useState<Array<examDataArray>>([])
  const [eventDatas, setEventDatas] = useState<Array<eventDataArray>>([])

  const score_headers = [
    'Name',
    'College & Department',
    'Score'
  ]
  
  useEffect(() => {
    setCurrentUser((cookie.currentUser === undefined) ? '' : cookie.currentUser)
  }, [])

  useEffect(() => {  
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/exams`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let data = await response.json();
        data = data.exams.filter((a: examDataArray) => (a.status === "ongoing"))
        setExamDatas(data);
        setExamFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setExamFetchingData(false)
      }
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/dashboard`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setProfileDatas(data);
        setProfileFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setProfileFetchingData(false)
      }
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/event`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let data = await response.json();
        setEventDatas(data.event);
        setEventFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setEventFetchingData(false)
      }
    }
    if ((eventFetchingData) || (examFetchingData)) {
      fetchDatas();
    }
  }, [examDatas])

  return (
    <div className={styles.admin_main_contents}>
      <span style={{ display: (currentUser === "") ? 'none' : 'block' }} className={[styles.welcome_user, rubik.className].join(' ')}>
        Welcome <span className={styles.welcome_user_gradient}>{currentUser.slice(0, 1).toUpperCase() + currentUser.slice(1, currentUser.length)}</span>
      </span>
      <div className={[styles.coloredButton, styles.light_gray_div].join(' ')}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Ongoing Exams
          </span>
          <Link href='/sadmin/exams' className={[styles.iconButton_div, roboto.className].join(' ')}>
            <span>All Exams</span>
            <MdOutlineEvent className={styles.iconButton_icon} />
          </Link>
        </div>
        {(examFetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (examDatas.length === 0) ?
            <span className={[styles.no_datas, actor.className].join(' ')}>
              Currently there are No Ongoing Exams
            </span> :
            <div style={{ gap: '6px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }} className={styles.event_main_div}>
              {examDatas.map((exam: examDataArray) =>
                <Link href={`/sadmin/exams/${exam._id}`} style={{ width: '100%', borderLeft: '10px solid var(--navy)' }} className={[styles.exam_main_div, rubik.className].join(' ')} key={exam._id}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}  className={styles.exam_details_title}>
                    <span style={{ fontSize: '20px' }}>
                      {exam.title}
                    </span>
                    <span style={{ fontSize: '15px', backgroundColor: "#2334A6", color: "white", paddingInline: "10px", paddingBlock: '2px', borderRadius: "10px" }}>
                      {exam.category}
                    </span>
                  </span>
                  <div className={[styles.exam_details_div].join(' ')}>
                    <span className={styles.exam_details_data}>
                      <BiSolidInstitution style={{ fontSize: '22px' }} />
                      {exam.college} - {exam.department.split(' ').map((data: string) => data.slice(0, 1).toUpperCase()).join('')}
                    </span>
                    <span className={styles.exam_details_data}>
                      <MdOutlineSchool style={{ fontSize: '22px' }} />
                      {romanize(exam.year)} Year | {romanize(exam.semester)} Sem | {exam.section} Sec
                    </span>
                    <span className={styles.exam_details_data}>
                      <BiTimeFive style={{ fontSize: '22px' }} />
                      {displayDate(exam.start)} - {displayDate(exam.end)}
                    </span>
                  </div>
                </Link>
              )}
            </div>
        }
      </div>
      <div style={{ padding: '16px' }} className={[styles.coloredButton, styles.light_gray_div].join(' ')}>
        <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
          Scoreboard
        </span>
        <div>
          {(profileFetchingData) ? 
            <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
            :
            profileDatas.scoreboard.length === 0 ? 
              <span className={[styles.no_datas, actor.className].join(' ')} >
                Currently there is no Scoreboard
              </span> :
              <div className={styles.scoreboard_table}>
                <div className={[styles.scoreboard_table_header, rubik.className].join(' ')}>
                  {score_headers.map(header => (
                    <span className={[styles.scoreboard_table_header_inner].join(' ')} key={header}>
                      {header}
                    </span>
                  ))}
                </div>
                {profileDatas.scoreboard.map((score: any) => 
                  <span className={[styles.score_list, rubik.className].join(' ')} key={score.name + score.college}>
                    <span className={styles.score_inner_data}>
                      {score.name}
                    </span>
                    <span className={styles.score_inner_data}>
                      {score.college} - {score.department.split(' ').map((data: string) => data.slice(0, 1).toUpperCase()).join('')}
                    </span>
                    <span className={styles.score_inner_data}>
                      {score.score}
                    </span>
                  </span>
                )}
                </div>
            }
        </div>
      </div>
      <div className={[styles.coloredButton, styles.light_gray_div].join(' ')}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Events
          </span>
          <Link href='/sadmin/events' className={[styles.iconButton_div, roboto.className].join(' ')}>
            <span>All Events</span>
            <MdOutlineEvent className={styles.iconButton_icon} />
          </Link>
        </div>
        <div className={styles.events_div}>
        {(eventFetchingData) ? 
            <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
            :
            eventDatas.length === 0 ? 
              <span className={[styles.no_datas, actor.className].join(' ')} >
                Currently there are No Active events 
              </span> : 
              <div className={styles.event_main_div}>
                {eventDatas.map((event: eventDataArray) => 
                  <Link href={`/sadmin/events/${event._id}`} className={styles.event_div} key={event._id}>
                    <Image alt={event.title} width={150} height={100} className={styles.event_banner_img} src={event.image} key={event._id} />
                    <div className={[styles.event_details_div, rubik.className].join(' ')}>
                      <span>
                        <span className={styles.event_details_title}>
                          {event.title}
                        </span>
                        &nbsp;-&nbsp;
                        <span className={styles.event_details_date}>
                          {displayDate(event.date)}
                        </span>
                      </span>                      
                      <span className={styles.event_details_college}>
                        {event.college}
                      </span>
                    </div>
                  </Link>
                )}
              </div>
          }
        </div>
      </div>
    </div>
  )
}