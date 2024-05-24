'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import styles from '../page.module.css'
import { MdOutlineEvent } from 'react-icons/md'
import request from '@/utils/customFetch';
import { Actor, Roboto, Rubik } from 'next/font/google'
import Spinner from '@/components/misc/loaders/spinner';
import displayDate from '@/utils/dateRender';

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

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

export default function SuperAdminEventList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const [eventDatas, setEventDatas] = useState<Array<eventDataArray>>([])
  const [fetchingData, setFetchingData] = useState(true)

  useEffect(() => {  
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/event`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let data = await response.json();
        setEventDatas(data.event);
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [eventDatas])

  return (
    <div className={styles.admin_main_contents}>
      <div className={styles.light_gray_div}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Events
          </span>
          <Link href='/sadmin/events/add' className={[styles.iconButton_div, roboto.className].join(' ')}>
            <span>Add Event</span>
            <MdOutlineEvent className={styles.iconButton_icon} />
          </Link>
        </div>
        <div className={styles.events_div}>
          {(fetchingData) ? 
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
