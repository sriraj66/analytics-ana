'use client';
import { useCookies } from 'react-cookie';
import Link from 'next/link';
import { IoMdAdd } from 'react-icons/io'
import styles from '../page.module.css'
import styles2 from './page.module.css'
import request from '@/utils/customFetch';
import { Actor, Roboto, Nunito } from 'next/font/google'
import { MdDeleteOutline } from 'react-icons/md'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

interface superAdminDataArray {
  _id: string,
  college: string,
  name: string,
  username: number,
  email: string,
}

export default function AdminSuperAdminsList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const data_headers = [
    "Name",
    "Username",
    "Email",
    "College",
  ]

  const deletePopup = useRef<HTMLDivElement>(null)
  const [fetchingData, setFetchingData] = useState(true)
  const [groupedSuperAdminDatas, setGroupedSuperAdminDatas] = useState<Array<Array<superAdminDataArray>>>([])
  const [currentSuperAdmin, setCurrentSuperAdmin] = useState<any>(null)

  async function deleteDepartment() {
    if ((currentSuperAdmin === null) || (deletePopup.current === null)) return;
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/superadmins/${currentSuperAdmin._id}`, {method: 'DELETE', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    deletePopup.current.style.display = 'none'
    setCurrentSuperAdmin(null)
    setGroupedSuperAdminDatas([])
    setFetchingData(true)
  }

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/superadmins`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        const grouped_datas = data.superadmins.slice().reduce((acc: any, obj: any) => {
          if (!acc[obj.college]) {
            acc[obj.college] = [];
          }
          acc[obj.college].push(obj);
          return acc;
        }, {});
        setGroupedSuperAdminDatas(grouped_datas);
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [groupedSuperAdminDatas, fetchingData])

  useEffect(() => {
    window.onclick = (event) => {
      if (deletePopup.current !== null) {
        if (event.target == deletePopup.current) {
          deletePopup.current.style.display = 'none'
          setCurrentSuperAdmin(null)
        }
      }
    }
  })

  return (
    <div className={styles.admin_main_contents}>
      <div className={[styles.coloredButton, styles.light_gray_div].join(' ')}>
        <div className={styles.light_gray_heading_div}>
          <div className={styles.heading_college}>
            <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
              Super Admins
            </span>
          </div>
          <Link href={`/admin/sadmins/add`} className={[styles.iconButton_div, roboto.className].join(' ')}>
            <IoMdAdd className={styles.iconButton_icon} />
            <span>Add Super Admin</span>
          </Link>
        </div>
        {(fetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (Object.keys(groupedSuperAdminDatas).length === 0) ?
            <span style={{ fontWeight: '800' }} className={[styles.no_datas, actor.className].join(' ')}>
              Currently there are no SuperAdmins
            </span>
            :
            Object.keys(groupedSuperAdminDatas).map((datas: any) =>
              <div className={styles2.groupedDepartment_div} key={datas}>
                <span className={[styles2.groupedDepartment_heading, roboto.className].join(' ')}>
                  {datas}
                </span>
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
                      {groupedSuperAdminDatas[datas].map(data =>
                        <tr key={data._id}>
                          <td>
                            {data.name}
                          </td>
                          <td>
                            {data.username}
                          </td>
                          <td>
                            {data.email}
                          </td>
                          <td>
                            {data.college}
                          </td>
                          <td style={{ padding: 0 }}>
                            <button onClick={() => {setCurrentSuperAdmin(data); if (deletePopup.current !== null) { deletePopup.current.style.display = 'block' }}} className={styles.delete_button}>
                              <MdDeleteOutline style={{ color: '#DC3545' }} />
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          )
        }
      </div>
      <div ref={deletePopup} className={styles.delete_popup_main}>
        <div className={styles.delete_popup_main_inner}>
          <div className={[styles.delete_popup_main_header, actor.className].join(' ')}>
            <span>Delete Confirmation</span>
            <span onClick={(event) => {setCurrentSuperAdmin(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}} className={styles.delete_popup_main_close}>&times;</span>
          </div>
          <span className={[styles.delete_popup_main_contents, nunito.className].join(' ')}>Do you really want to delete the data?</span>
          <div className={[styles.delete_buttons_div, nunito.className].join(' ')}>
            <button onClick={(event) => {setCurrentSuperAdmin(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}}>Cancel</button>
            <button style={{ color: 'white', backgroundColor: '#DC3545' }} onClick={deleteDepartment}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}
