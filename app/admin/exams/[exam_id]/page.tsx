'use client';
import { useCookies } from 'react-cookie';
import { romanize } from 'romans'
import styles from '../../page.module.css'
import request from '@/utils/customFetch';
import { Roboto } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';
import displayDate from '@/utils/dateRender';

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

interface examDataArray {
  category: string,
  date: string,
  start: string,
  end: string
}

export default function AdminExamResultsView({ params }: { params: { exam_id: string } }) {
  const [cookie, setCookie, getCookie] = useCookies()
  const data_headers = [
    "Enroll",
    "Name",
    "Email",
    "Points"
  ]

  const [fetchingData, setFetchingData] = useState(true)
  const [examTitle, setExamTitle] = useState<string>("")
  const [collegeName, setCollegeName] = useState<string>("")
  const [examData, setExamData] = useState<examDataArray>(Object())
  const [studentDatas, setStudentDatas] = useState<Array<studentDataArray>>([])
  const [departmentDetails, setDepartmentDetails] = useState<departmentDataArray>(Object())

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/exams/${params.exam_id}`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setDepartmentDetails({
          department: data.department,
          year: data.year,
          semester: data.semester,
          section: data.section
        })
        setExamData({
          category: data.category,
          date: data.date,
          start: data.start,
          end: data.end      
        })
        setExamTitle(data.title);
        setCollegeName(data.college);
        const student_datas: Array<studentDataArray> = data.students.sort((data: studentDataArray, data_: studentDataArray) => ((data.OAScore === undefined) ? (data.rollno < data_.rollno) : (data.OAScore > data_.OAScore)) ? -1 : 1)
        setStudentDatas(student_datas);
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
          {(!fetchingData) &&
            <div style={{ textAlign: 'end' }} className={styles.heading_college}>
              <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
                {examData.category}
              </span>
              <span className={[styles.college_name, roboto.className].join(' ')}>
                {examData.date}
              </span>
              <span className={[styles.college_name, roboto.className].join(' ')}>
                {displayDate(examData.start)} - {displayDate(examData.end)}
              </span>
            </div>
          }
          </div>
        {(fetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (studentDatas.length === 0) ?
            <span className={[styles.no_datas, roboto.className].join(' ')}>
              Students have not yet started the Exams
            </span> :
            <div className={[styles.table_div, roboto.className].join(' ')}>  
              <table>
                <thead>
                  <tr>
                    {data_headers.map(data => (
                      <td key={data}>{data}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentDatas.map(data =>
                    <tr>
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
                        {(data.OAScore === undefined) ? '-' : data.OAScore}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  )
}
