'use client';
import Link from 'next/link';
import { useCookies } from 'react-cookie';
import styles from './page.module.css'
import request from '@/utils/customFetch';
import { BiTimeFive } from 'react-icons/bi'
import { HiExternalLink } from 'react-icons/hi'
import { Space_Grotesk, Nunito, Rubik } from 'next/font/google'
import { useEffect, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';
import displayDate from '@/utils/dateRender';

const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] })
const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default function StudentMeeting() {
  const [cookie, setCookie, getCookie] = useCookies()
  const [meetingDatas, setMeetingDatas] = useState([])
  const [fetchingData, setFetchingData] = useState(true)

  useEffect(() => {
    const fetchDatas = async () => {  
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/meeting`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setMeetingDatas(data.meeting)
        setFetchingData(false)
      } catch {
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [])

  return (
    <div className={styles.dashboard_main_contents}>
      <div className={[styles.light_white_div].join(' ')}>
        <div className={styles.table_decoration}>
          <span className={[styles.heading_text, rubik.className].join(' ')}>
            Meeting
          </span>
          {(fetchingData) ? 
            <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
            :
            (meetingDatas.length === 0) ?
              <span className={[styles.no_datas, space_grotesk.className].join(' ')}>
                Currently there's no Meeting
              </span>
              :
              <div className={styles.meeting_main_div}>
                {meetingDatas.sort((a: any, b: any) => (new Date() > a.date ? -1 : 1)).map((data: any) =>
                  <div className={[styles.meeting_div, nunito.className].join(' ')} key={data._id}>
                    <div className={styles.meeting_title}>
                      <span>{data?.name}</span>
                    </div>
                    <div className={[styles.meeting_details_div, rubik.className].join(' ')}>
                      <span className={[styles.meeting_details_inner_div].join(' ')}>
                        <span style={{ color: '#1b238d', fontWeight: '500', fontSize: '20px' }} className={styles.meeting_details_inner_div}>
                          {data.title}
                        </span>
                      </span>
                      <span className={[styles.meeting_details_inner_div].join(' ')}>
                        <span style={{ fontWeight: '500' }} className={styles.meeting_details_inner_div}>
                          <BiTimeFive style={{ fontSize: '22px' }} />
                        </span>
                        {displayDate(data?.date)}
                      </span>
                      <Link href={data.link} target='_blank' className={[styles.meeting_details_inner_div, styles.attend_button].join(' ')}>
                        <span style={{ fontWeight: '500' }} className={styles.meeting_details_inner_div}>
                          <HiExternalLink style={{ color: 'white', fontSize: '20px' }} />
                        </span>
                        Attend Now
                      </Link>
                   </div>
                  </div>
                )}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
