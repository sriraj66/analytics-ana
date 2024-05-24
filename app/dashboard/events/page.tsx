'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie';
import styles from '../page.module.css'
import request from '@/utils/customFetch';
import Spinner from '@/components/misc/loaders/spinner';
import { Space_Grotesk, Nunito, Rubik } from 'next/font/google'
import displayDate from '@/utils/dateRender';

const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] })
const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

interface eventDataArray {
  _id: string,
  title: string,
  college: string,
  department: string,
  date: string,
  eventlink: string,
  image: string
}

export default function StudentEventList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const [eventDatas, setEventDatas] = useState<Array<eventDataArray>>(Object())
  const [fetchingData, setFetchingData] = useState(true)

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/events`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const exam_data = await response.json();
        setEventDatas(exam_data.event)
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    };
    if (fetchingData) {
      fetchDatas();
    }
  }, [eventDatas])

  return (
    <div className={styles.dashboard_main_contents}>
      <div className={[styles.light_white_div].join(' ')}>
        <div className={styles.table_decoration}>
          <span className={[styles.heading_text, rubik.className].join(' ')}>
            Events
          </span>
          {(fetchingData) ? 
            <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
            :
            (eventDatas.length === 0) ?
              <span className={[styles.no_datas, space_grotesk.className].join(' ')}>
                Currently there's no Upcoming event
              </span>
              :
              <div className={styles.event_main_div}>
                {eventDatas.map((event: eventDataArray) => 
                  <Link href={event.eventlink} target='_blank' className={styles.event_div} key={event._id}>
                    <img className={styles.event_banner_img} src={event.image} key={event._id} />
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
