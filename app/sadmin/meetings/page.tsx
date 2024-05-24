'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import styles from '../page.module.css'
import styles2 from './page.module.css'
import { BiTimeFive, BiSolidInstitution } from 'react-icons/bi'
import { MdOutlineSchool, MdOutlineEvent } from 'react-icons/md'
import request from '@/utils/customFetch';
import { Actor, Roboto, Rubik } from 'next/font/google'
import Spinner from '@/components/misc/loaders/spinner';
import displayDate from '@/utils/dateRender';

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

interface meetingDataArray {
  _id: string,
  title: string,
  college: string,
  department: string,
  date: string,
  link: string,
}

export default function SuperAdminMeetingList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const [meetingDatas, setMeetingDatas] = useState<Array<meetingDataArray>>([])
  const [fetchingData, setFetchingData] = useState(true)

  useEffect(() => {  
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/meeting`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let data = await response.json();
        setMeetingDatas(data.meeting);
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [meetingDatas])
  
  return (
    <div className={styles.admin_main_contents}>
      <div className={styles.light_gray_div}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Meetings
          </span>
          <Link href='/sadmin/meetings/add' className={[styles.iconButton_div, roboto.className].join(' ')}>
            <span>Add Meeting</span>
            <MdOutlineEvent className={styles.iconButton_icon} />
          </Link>
        </div>
        <div className={styles.events_div}>
          {(fetchingData) ? 
            <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
            :
            meetingDatas.length === 0 ? 
              <span className={[styles.no_datas, actor.className].join(' ')} >
                Currently there are No Active meetings 
              </span> : 
              <div style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }} className={styles.event_main_div}>
                {meetingDatas
                  .sort((a: meetingDataArray, b: meetingDataArray) => ((a.date > b.date) ? -1 : 1))
                  .map((meeting: meetingDataArray) =>
                  <Link href={`/sadmin/meetings/${meeting._id}`} style={{ width: '100%', borderTop: '10px solid var(--main-accent)' }} className={[styles2.meeting_div, rubik.className].join(' ')} key={meeting._id}>
                    <span className={styles2.meeting_details_title}>
                      {meeting.title}
                    </span>
                    <div className={[styles2.meeting_details_div].join(' ')}>
                      <span className={styles2.meeting_details_data}>
                        <BiSolidInstitution style={{ fontSize: '22px' }} />
                        {meeting.college}
                      </span>
                      <span className={styles2.meeting_details_data}>
                        <MdOutlineSchool style={{ fontSize: '22px' }} />
                        {meeting.department}
                      </span>
                      <span className={styles2.meeting_details_data}>
                        <BiTimeFive style={{ fontSize: '22px' }} />
                        {displayDate(meeting.date)}
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
