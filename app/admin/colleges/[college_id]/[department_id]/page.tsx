'use client';
import { useCookies } from 'react-cookie';
import Link from 'next/link';
import { romanize } from 'romans'
import { IoMdAdd } from 'react-icons/io'
import styles from '../../../page.module.css'
import request from '@/utils/customFetch';
import { Actor, Roboto, Nunito } from 'next/font/google'
import { MdDeleteOutline } from 'react-icons/md'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

interface studentDataArray {
  _id: string,
  name: string,
  rollno: number,
  college: string,
  department: string,
  email: string,
  OAScore: number
}

interface departmentDataArray {
  department: string,
  year: number,
  semester: number,
  section: string
}

export default function AdminStudentView({ params }: { params: { college_id: string, department_id: string } }) {
  const [cookie, setCookie, getCookie] = useCookies()
  const data_headers = [
    "Enroll",
    "Name",
    "Email",
    "Overall Scores"
  ]
  
  const deletePopup = useRef<HTMLDivElement>(null)
  const [fetchingData, setFetchingData] = useState(true)
  const [collegeName, setCollegeName] = useState<string>("")
  const [studentDatas, setStudentDatas] = useState<Array<studentDataArray>>([])
  const [departmentDetails, setDepartmentDetails] = useState<departmentDataArray>(Object())
  const [currentStudent, setCurrentStudent] = useState<any>(null)
  
  async function deleteStudent() {
    if ((currentStudent === null) || (deletePopup.current === null)) return;
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges/${params.college_id}/${params.department_id}/${currentStudent._id}`, {method: 'DELETE', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    deletePopup.current.style.display = 'none'
    setCurrentStudent(null)
    setStudentDatas([])
    setFetchingData(true)
  }

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges/${params.college_id}/${params.department_id}`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setDepartmentDetails({
          department: data.department,
          year: data.year,
          semester: data.semester,
          section: data.section
        })
        setCollegeName(data.college);
        const student_datas = data.students.sort((data: studentDataArray, data_: studentDataArray) => (data.rollno < data_.rollno ? -1 : 1))
        setStudentDatas(student_datas);
        setFetchingData(false)
      } catch {
        setDepartmentDetails({
          department: '',
          year: 1,
          semester: 1,
          section: ''
        })
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
      <div className={[styles.coloredButton, styles.light_gray_div].join(' ')}>
        <div className={styles.light_gray_heading_div}>
          <div className={styles.heading_college}>
            <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
              Students Detail
            </span>
            {(!fetchingData) &&
              <>
                <span className={[styles.college_name, roboto.className].join(' ')}>
                  {collegeName}
                </span>
                <span className={[styles.college_name, roboto.className].join(' ')}>
                  {departmentDetails.department}
                </span>
                <span className={[styles.college_name, roboto.className].join(' ')}>
                  {romanize(departmentDetails.year)} / {romanize(departmentDetails.semester)} / {departmentDetails.section}
                </span>
              </>
            }
            </div>
          <Link href={`/admin/colleges/${params.college_id}/${params.department_id}/add`} className={[styles.iconButton_div, roboto.className].join(' ')}>
            <IoMdAdd className={styles.iconButton_icon} />
            <span>Add Student</span>
          </Link>
        </div>        
        {(fetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (studentDatas.length === 0) ?
            <span className={[styles.no_datas, actor.className].join(' ')}>
              Currently there are no Students
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
                  </tr>
                </thead>
                <tbody>
                  {studentDatas.map(data =>
                    <tr key={data._id}>
                      <td>
                        {data.rollno}
                      </td>
                      <td>
                        {data.name}
                      </td>
                      <td>
                        {data.email}
                      </td>
                      <td>
                        {data.OAScore}
                      </td>
                      <td style={{ padding: 0 }}>
                        <button onClick={() => {setCurrentStudent(data); if (deletePopup.current !== null) { deletePopup.current.style.display = 'block' }}} className={styles.delete_button}>
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
            <span onClick={(event) => {setCurrentStudent(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}} className={styles.delete_popup_main_close}>&times;</span>
          </div>
          <span className={[styles.delete_popup_main_contents, nunito.className].join(' ')}>Do you really want to delete the data?</span>
          <div className={[styles.delete_buttons_div, nunito.className].join(' ')}>
            <button onClick={(event) => {setCurrentStudent(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}}>Cancel</button>
            <button style={{ color: 'white', backgroundColor: '#DC3545' }} onClick={deleteStudent}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}
