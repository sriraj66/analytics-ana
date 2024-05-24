'use client';
import { useCookies } from 'react-cookie';
import Link from 'next/link';
import styles from '../page.module.css'
import { IoMdAdd } from 'react-icons/io'
import request from '@/utils/customFetch';
import { Actor, Roboto, Nunito } from 'next/font/google'
import { MdDeleteOutline } from 'react-icons/md'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';
import { LiaExternalLinkAltSolid } from 'react-icons/lia'

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

interface collegeDataArray {
  _id: string,
  college: string
}

export default function AdminCollegeList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const data_headers = [
    'College Name'
  ]
  const deletePopup = useRef<HTMLDivElement>(null)
  const [fetchingData, setFetchingData] = useState(true)
  const [collegeDatas, setCollegeDatas] = useState<Array<collegeDataArray>>([])
  const [currentCollege, setCurrentCollege] = useState<any>(null)

  async function deleteCollege() {
    if ((currentCollege === null) || (deletePopup.current === null)) return;
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges/${currentCollege._id}`, {method: 'DELETE', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    deletePopup.current.style.display = 'none'
    setCurrentCollege(null)
    setCollegeDatas([])
    setFetchingData(true)
  }

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setCollegeDatas(data.colleges);
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [collegeDatas])

  useEffect(() => {
    window.onclick = (event) => {
      if (deletePopup.current !== null) {
        if (event.target == deletePopup.current) {
          deletePopup.current.style.display = 'none'
          setCurrentCollege(null)
        }
      }
    }
  }, [])

  return (
    <div className={styles.admin_main_contents}>
      <div className={[styles.coloredButton, styles.light_gray_div].join(' ')}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Colleges
          </span>
          <Link href="/admin/colleges/add" className={[styles.iconButton_div, roboto.className].join(' ')}>
            <IoMdAdd className={styles.iconButton_icon} />
            <span>Add College</span>
          </Link>
        </div>
        {(fetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (collegeDatas.length === 0) ?
            <span style={{ fontWeight: '800' }} className={[styles.no_datas, actor.className].join(' ')}>
              Currently there are no College
            </span>
            :
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
                  {collegeDatas.map(data =>
                    <tr key={data._id}>
                      <td>
                        {data.college}
                      </td>
                      <td style={{ padding: 0 }}>
                        <Link href={`/admin/colleges/${data._id}`} className={styles.delete_button} key={data._id}>
                          <LiaExternalLinkAltSolid style={{ color: '#1b238d' }} />
                        </Link> 
                      </td>                        
                      <td style={{ padding: 0 }}>
                        <button onClick={() => {setCurrentCollege(data); if (deletePopup.current !== null) { deletePopup.current.style.display = 'block' }}} className={styles.delete_button}>
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
            <span onClick={(event) => {setCurrentCollege(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}} className={styles.delete_popup_main_close}>&times;</span>
          </div>
          <span className={[styles.delete_popup_main_contents, nunito.className].join(' ')}>Do you really want to delete the data?</span>
          <div className={[styles.delete_buttons_div, nunito.className].join(' ')}>
            <button onClick={(event) => {setCurrentCollege(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}}>Cancel</button>
            <button style={{ color: 'white', backgroundColor: '#DC3545' }} onClick={deleteCollege}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}
