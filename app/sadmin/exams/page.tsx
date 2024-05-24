'use client';
import { useCookies } from 'react-cookie';
import { romanize } from 'romans'
import Link from 'next/link';
import styles from '../page.module.css'
import { IoMdAdd } from 'react-icons/io'
import request from '@/utils/customFetch';
import { Roboto, Actor, Nunito } from 'next/font/google'
import { MdDeleteOutline } from 'react-icons/md'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';
import { LiaExternalLinkAltSolid } from 'react-icons/lia'
import displayDate from '@/utils/dateRender';

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600'], subsets: ['latin'] })
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

export default function SuperAdminExamsList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const data_headers = [
    'Title',
    'College',
    'Department',
    'Year/Sem/Sec',
    'Start Time',
    'End Time',
    'Format',
    'Status'
  ]

  const deletePopup = useRef<HTMLDivElement>(null)
  const [fetchingData, setFetchingData] = useState(true)
  const [examDatas, setExamDatas] = useState<Array<examDataArray>>([])
  const [currentExam, setCurrentExam] = useState<any>(null)

  async function deleteExam() {
    if ((currentExam === null) || (deletePopup.current === null)) return;
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/exams/${currentExam._id}`, {method: 'DELETE', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    deletePopup.current.style.display = 'none'
    setCurrentExam(null)
    setExamDatas([])
    setFetchingData(true)
  }

  useEffect(() => {  
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/exams`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let data = await response.json();
        data = data.exams
                    .sort((a: examDataArray, b: examDataArray) => ((new Date(a.start) > new Date(b.start)) ? -1 : 1))
                    .sort((a: examDataArray, b: examDataArray) => (a.date === "ongoing" ? -1 : 1))
        setExamDatas(data);
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [examDatas])

  useEffect(() => {
    window.onclick = (event) => {
      if (deletePopup.current !== null) {
        if (event.target == deletePopup.current) {
          deletePopup.current.style.display = 'none'
          setCurrentExam(null)
        }
      }
    }
  }, [])

  return (
    <div className={styles.admin_main_contents}>
      <div className={[styles.coloredButton, styles.light_gray_div].join(' ')}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Exams
          </span>
          <Link href='/sadmin/exams/add' className={[styles.iconButton_div, roboto.className].join(' ')}>
            <IoMdAdd className={styles.iconButton_icon} />
            <span>Add Exam</span>
          </Link>
        </div>
        {(fetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (examDatas.length === 0) ?
            <span className={[styles.no_datas, actor.className].join(' ')}>
              Currently there are No Exams 
            </span> :
            <div className={[styles.table_div, roboto.className].join(' ')}>  
              <table>
                <thead>
                  <tr>
                    {data_headers.map(data => (
                      <td key={data}>{data}</td>
                    ))}
                    <td></td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {examDatas.map(data =>
                    <tr key={data._id}>
                      <td>
                        {data.title}
                      </td>
                      <td>
                        {data.college}
                      </td>
                      <td>
                        {data.department}
                      </td>
                      <td>
                        {romanize(data.year)} / {romanize(data.semester)} / {data.section}
                      </td>
                      <td>
                        {displayDate(data.start)}
                      </td>
                      <td>
                        {displayDate(data.end)}
                      </td>
                      <td>
                        {data.category}
                      </td>
                      <td style={{ textTransform: 'capitalize', color: (data.status.toLowerCase() === 'ended') ? 'red' : (data.status.toLowerCase() === 'upcoming') ? 'blue' : 'green' }}>
                        {data.status}
                      </td>
                      <td style={{ padding: 0 }}>
                        <Link href={`/sadmin/exams/${data._id}`} className={[styles.delete_button].join(' ')} key={data._id}>
                          <LiaExternalLinkAltSolid style={{ color: '#1b238d' }} />
                        </Link> 
                      </td>                        
                      <td style={{ padding: 0 }}>
                        <button onClick={() => {setCurrentExam(data); if (deletePopup.current !== null) { deletePopup.current.style.display = 'block' }}} className={styles.delete_button}>
                          <MdDeleteOutline style={{ color: '#DC3545' }} />
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        }
      </div>
      <div ref={deletePopup} className={styles.delete_popup_main}>
        <div className={styles.delete_popup_main_inner}>
          <div className={[styles.delete_popup_main_header, actor.className].join(' ')}>
            <span>Delete Confirmation</span>
            <span onClick={(event) => {setCurrentExam(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}} className={styles.delete_popup_main_close}>&times;</span>
          </div>
          <span className={[styles.delete_popup_main_contents, nunito.className].join(' ')}>Do you really want to delete the data?</span>
          <div className={[styles.delete_buttons_div, nunito.className].join(' ')}>
            <button onClick={(event) => {setCurrentExam(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}}>Cancel</button>
            <button style={{ color: 'white', backgroundColor: '#DC3545' }} onClick={deleteExam}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}
