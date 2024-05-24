'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react'
import { useCookies } from 'react-cookie';
import styles from '../../page.module.css'
import styles2 from './page.module.css'
import request from '@/utils/customFetch';
import { MdDeleteOutline } from 'react-icons/md'
import Spinner from '@/components/misc/loaders/spinner';
import { Roboto, Actor, Nunito } from 'next/font/google'
import displayDate from '@/utils/dateRender';

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

interface meetingDataArray {
  _id: string,
  title: string,
  college: string,
  department: string,
  timing: string,
  link: string,
}

export default function SuperAdminMeetingView({ params }: { params: { meeting_id: string } }) {
  const [cookie, setCookie, getCookie] = useCookies()
  const [meetingData, setMeetingData] = useState<meetingDataArray>(Object())
  const [fetchingData, setFetchingData] = useState(true)
  const deletePopup = useRef<HTMLDivElement>(null)
  const router = useRouter()

  async function deleteEvent() {
    if (deletePopup.current === null) return;
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/meeting/${meetingData._id}`, {method: 'DELETE', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    deletePopup.current.style.display = 'none'
    router.push(`/sadmin/meetings`)
    router.refresh()
  }

  useEffect(() => {  
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/sadmin/meeting/${params.meeting_id}`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let data = await response.json();
        setMeetingData(data.meeting);
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [])

  return (
    <div className={styles.admin_main_contents}>
      <div className={styles.light_gray_div}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Meeting
          </span>
        </div>
        {(fetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (meetingData === undefined) ?
            <span className={[styles.no_datas, actor.className].join(' ')}>
              Meeting Not Found with this ID
            </span>
            :
            <div className={styles2.event_div}>
              <div className={[styles.details_main_div, roboto.className].join(' ')}>
                <div className={[styles.details_inner_div, roboto.className].join(' ')}>
                  <span className={styles.details_header}>Title</span>
                  <span className={styles.details_value}>{meetingData.title}</span>
                </div>
                <div className={styles.details_inner_div}>
                  <span className={styles.details_header}>Meeting Timing</span>
                  <span className={styles.details_value}>{displayDate(meetingData.timing)}</span>
                </div>
                <div className={styles.details_inner_div}>
                  <span className={styles.details_header}>Department</span>
                  <span className={styles.details_value}>{meetingData.department}</span>
                </div>
                <div className={styles.details_inner_div}>
                  <span className={styles.details_header}>Link</span>
                  <span className={styles.details_value}>{meetingData.link}</span>
                </div>
              </div>
              <button onClick={() => {if (deletePopup.current !== null) { deletePopup.current.style.display = 'block' }}} className={[styles2.event_delete, styles.iconButton_div, roboto.className].join(' ')}>
                <MdDeleteOutline style={{ color: 'white', fontSize: '18px' }} />
                <span>Delete</span>
              </button>
            </div>
        }
      </div>
      <div ref={deletePopup} className={styles.delete_popup_main}>
        <div className={styles.delete_popup_main_inner}>
          <div className={[styles.delete_popup_main_header, actor.className].join(' ')}>
            <span>Delete Confirmation</span>
            <span onClick={(event) => {if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}} className={styles.delete_popup_main_close}>&times;</span>
          </div>
          <span className={[styles.delete_popup_main_contents, nunito.className].join(' ')}>Do you really want to delete the data?</span>
          <div className={[styles.delete_buttons_div, nunito.className].join(' ')}>
            <button onClick={(event) => {if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}}>Cancel</button>
            <button style={{ color: 'white', backgroundColor: '#DC3545' }} onClick={deleteEvent}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}
