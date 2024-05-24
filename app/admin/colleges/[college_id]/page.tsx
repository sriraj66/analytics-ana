'use client';
import { useCookies } from 'react-cookie';
import Link from 'next/link';
import { romanize } from 'romans'
import { IoMdAdd } from 'react-icons/io'
import styles from '../../page.module.css'
import styles2 from './page.module.css'
import request from '@/utils/customFetch';
import { Actor, Roboto, Nunito } from 'next/font/google'
import { MdDeleteOutline } from 'react-icons/md'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';
import { LiaExternalLinkAltSolid } from 'react-icons/lia'

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

interface departmentDataArray {
  _id: string,
  college: string,
  department: string,
  year: number,
  semester: number,
  section: string
}

export default function AdminCollegeView({ params }: { params: { college_id: string } }) {
  const [cookie, setCookie, getCookie] = useCookies()
  const data_headers = [
    "Department",
    "Year",
    "Semester",
    "Section"
  ]

  const deletePopup = useRef<HTMLDivElement>(null)
  const [fetchingData, setFetchingData] = useState(true)
  const [collegeName, setCollegeName] = useState<string>('')
  const [groupedDepartmentDatas, setGroupedDepartmentDatas] = useState<Array<Array<departmentDataArray>>>([])
  const [currentDepartment, setCurrentDepartment] = useState<any>(null)

  async function deleteDepartment() {
    if ((currentDepartment === null) || (deletePopup.current === null)) return;
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges/${params.college_id}/${currentDepartment._id}`, {method: 'DELETE', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    deletePopup.current.style.display = 'none'
    setCurrentDepartment(null)
    setGroupedDepartmentDatas([])
    setFetchingData(true)
  }

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges/${params.college_id}`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setCollegeName(data.college);
        const grouped_datas = data.departments.slice().sort((a: any, b: any) => {
          if (a.year === b.year) { return a.semester - b.semester; }
          return a.year - b.year;
        }).reduce((acc: any, obj: any) => {
          if (!acc[obj.year]) {
            acc[obj.year] = [];
          }
          acc[obj.year].push(obj);
          return acc;
        }, {});
        setGroupedDepartmentDatas(grouped_datas);
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [groupedDepartmentDatas, fetchingData])

  useEffect(() => {
    window.onclick = (event) => {
      if (deletePopup.current !== null) {
        if (event.target == deletePopup.current) {
          deletePopup.current.style.display = 'none'
          setCurrentDepartment(null)
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
              Departments
            </span>
            <span className={[styles.college_name, roboto.className].join(' ')}>
              {collegeName}
            </span>
          </div>
          <Link href={`/admin/colleges/${params.college_id}/add`} className={[styles.iconButton_div, roboto.className].join(' ')}>
            <IoMdAdd className={styles.iconButton_icon} />
            <span>Add Class</span>
          </Link>
        </div>
        {(fetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (Object.keys(groupedDepartmentDatas).length === 0) ?
            <span style={{ fontWeight: '800' }} className={[styles.no_datas, actor.className].join(' ')}>
              Currently there are no Departments
            </span>
            :
            Object.keys(groupedDepartmentDatas).map((datas: any) =>
              <div className={styles2.groupedDepartment_div} key={datas}>
                <span className={[styles2.groupedDepartment_heading, roboto.className].join(' ')}>
                  {romanize(parseInt(datas))} Year
                </span>

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
                      {groupedDepartmentDatas[datas].map(data =>
                        <tr key={data._id}>
                          <td>
                            {data.department}
                          </td>
                          <td>
                            {romanize(data.year)}
                          </td>
                          <td>
                            {romanize(data.semester)}
                          </td>
                          <td>
                            {data.section}
                          </td>
                          <td style={{ padding: 0 }}>
                            <Link href={`/admin/colleges/${params.college_id}/${data._id}`} className={[styles.delete_button].join(' ')} key={data._id}>
                              <LiaExternalLinkAltSolid style={{ color: '#1b238d' }} />
                            </Link> 
                          </td>                        
                          <td style={{ padding: 0 }}>
                            <button onClick={() => {setCurrentDepartment(data); if (deletePopup.current !== null) { deletePopup.current.style.display = 'block' }}} className={styles.delete_button}>
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
            <span onClick={(event) => {setCurrentDepartment(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}} className={styles.delete_popup_main_close}>&times;</span>
          </div>
          <span className={[styles.delete_popup_main_contents, nunito.className].join(' ')}>Do you really want to delete the data?</span>
          <div className={[styles.delete_buttons_div, nunito.className].join(' ')}>
            <button onClick={(event) => {setCurrentDepartment(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}}>Cancel</button>
            <button style={{ color: 'white', backgroundColor: '#DC3545' }} onClick={deleteDepartment}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}
