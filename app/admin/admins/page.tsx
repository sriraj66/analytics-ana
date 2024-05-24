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

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

interface adminDataArray {
  _id: string,
  username: string,
  role: string,
  name: string,
}

export default function AdminAdminsList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const data_headers = [
    'Username',
    'Name',
  ]

  const deletePopup = useRef<HTMLDivElement>(null)
  const [fetchingData, setFetchingData] = useState(true)
  const [adminDatas, setAdminDatas] = useState<Array<adminDataArray>>([])
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)

  async function deleteAdmin() {
    if ((currentAdmin === null) || (deletePopup.current === null)) return;
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/admins/${currentAdmin._id}`, {method: 'DELETE', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    deletePopup.current.style.display = 'none'
    setCurrentAdmin(null)
    setAdminDatas([])
    setFetchingData(true)
  }

  useEffect(() => {  
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/admins`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let data = await response.json();
        setAdminDatas(data.admins);
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [adminDatas])

  useEffect(() => {
    window.onclick = (event) => {
      if (deletePopup.current !== null) {
        if (event.target == deletePopup.current) {
          deletePopup.current.style.display = 'none'
          setCurrentAdmin(null)
        }
      }
    }
  }, [])

  return (
    <div className={styles.admin_main_contents}>
      <div className={[styles.coloredButton, styles.light_gray_div].join(' ')}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Admins
          </span>
          <Link href='/admin/admins/add' className={[styles.iconButton_div, roboto.className].join(' ')}>
            <IoMdAdd className={styles.iconButton_icon} />
            <span>Add Admin</span>
          </Link>
        </div>
        {(fetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (adminDatas.length === 0) ?
            <span className={[styles.no_datas, roboto.className].join(' ')}>
              Currently there are No Admins
            </span> :
            <div className={[styles.table_div, roboto.className].join(' ')}>  
              <table>
                <thead>
                  <tr>
                    {data_headers.map(data => (
                      <td key={data}>{data}</td>
                    ))}
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {adminDatas.map(data =>
                    <tr key={data._id}>
                      <td>
                        {data.username}
                      </td>
                      <td>
                        {data.name}
                      </td>
                      <td style={{ padding: 0 }}>
                        <button onClick={() => {setCurrentAdmin(data); if (deletePopup.current !== null) { deletePopup.current.style.display = 'block' }}} className={styles.delete_button}>
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
            <span onClick={(event) => {setCurrentAdmin(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}} className={styles.delete_popup_main_close}>&times;</span>
          </div>
          <span className={[styles.delete_popup_main_contents, nunito.className].join(' ')}>Do you really want to delete the data?</span>
          <div className={[styles.delete_buttons_div, nunito.className].join(' ')}>
            <button onClick={(event) => {setCurrentAdmin(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}}>Cancel</button>
            <button style={{ color: 'white', backgroundColor: '#DC3545' }} onClick={deleteAdmin}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}
