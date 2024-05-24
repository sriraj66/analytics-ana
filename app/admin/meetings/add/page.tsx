'use client';
import { romanize } from 'romans';
import { useCookies } from 'react-cookie';
import { BaseSyntheticEvent, useEffect, useState } from 'react'
import styles from '../../page.module.css'
import styles2 from './page.module.css'
import { useRouter } from 'next/navigation';
import { MdOutlineEvent } from 'react-icons/md'
import request from '@/utils/customFetch';
import Spinner from '@/components/misc/loaders/spinner';
import { Roboto, Inter, JetBrains_Mono } from 'next/font/google'

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const jet_brains_mono = JetBrains_Mono({ weight: ['400', '500', '600'], subsets: ['latin'] })
const inter = Inter({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

interface collegeDataArray {
  _id: string,
  college: string,
  place: string
}

interface departmentDataArray {
  _id: string,
  department: string,
  year: number,
  semester: number,
  section: string
}

export default function AdminMeetingAdd() {
  const router = useRouter()
  const [cookie, setCookie, getCookie] = useCookies()
  const [submittingState, setSubmittingState] = useState(false)  
  const [collegeId, setCollegeId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [collegeList, setCollegeList] = useState<Array<collegeDataArray>>([])
  const [departmentList, setDepartmentList] = useState<Array<departmentDataArray>>([])

  async function submitMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingState(true)
    const form = event.currentTarget;
    const formDataObject: any = Object.fromEntries(new FormData(form).entries());
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/meeting/add`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({
        title: formDataObject.title,
        date: new Date(formDataObject.timing).getTime(),
        timing: new Date(formDataObject.timing).getTime(),
        link: (formDataObject.link.startsWith('https://') || formDataObject.link.startsWith('http://')) ? formDataObject.link : `https://${formDataObject.link}`,
        college: formDataObject.college,
        department: formDataObject.department
      })})
      router.push('/admin/meetings')
      router.refresh()
    } catch(error) {
      console.error("Error while Posting the Meeting")
      setSubmittingState(false)
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        if ((data.colleges.length !== 0) || (data.colleges.length !== undefined)) {
          setCollegeId(data.colleges[0]._id)
        }
        setCollegeList(data.colleges)
      } catch {
        console.error('Error fetching data');
      }
    };
    fetchData();
  }, [])
  
  useEffect(() => {
    async function fetchData() {
      try {
        const departmentResponse = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges/${collegeId}`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const departmentData = await departmentResponse.json();
        if ((departmentData.departments.length !== 0) || (departmentData.departments.length !== undefined)) {
          setDepartmentId(departmentData.departments[0]._id)
        }
        setDepartmentList(departmentData.departments)
      } catch {
        console.error('Error fetching data');
      }
    };
    if (collegeId !== '') {
      fetchData();
    }
  }, [collegeId])
  
  return (
    <div className={styles.admin_main_contents}>
      <div className={styles.light_gray_div}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Add Meeting
          </span>
        </div>
        <form onSubmit={submitMeeting} className={[styles.coloredButton, styles2.event_div].join(' ')}>
          <div className={[styles.details_main_div, roboto.className].join(' ')}>
            <div className={[styles.details_inner_div, roboto.className].join(' ')}>
              <span className={styles.details_header}>
                Title
              </span>
              <input name='title' className={[styles.details_value, inter.className].join(' ')} placeholder='Event Title' required />
            </div>
            <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
              <span className={[styles2.details_header, styles.details_header].join(' ')}>
                Timing
              </span>
              <input name='timing' placeholder='Select the Meeting Time' type='datetime-local' className={[styles.details_value, inter.className].join(' ')} onClick={(event) => event.currentTarget.showPicker()} required />
            </div>
            <div className={[styles.details_inner_div, roboto.className].join(' ')}>
              <span className={styles.details_header}>
                Link
              </span>
              <input name='link' className={[styles.details_value, inter.className].join(' ')} placeholder='Event Link' required />
            </div>
            <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
              <span className={[styles2.details_header, styles.details_header].join(' ')}>College Name</span>
              <select onChange={(value) => {setDepartmentList([]); setCollegeId(value.currentTarget.value)}} name='college' className={[styles.details_value, inter.className].join(' ')} required >
                {collegeList.map(college =>
                  <option value={college._id} key={college._id}>
                    {college.college}
                  </option>
                )}
              </select>
            </div>
            <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
              <span className={[styles2.details_header, styles.details_header].join(' ')}>Department</span>
              <select name='department' className={[styles.details_value, inter.className].join(' ')} required >
                {departmentList.map(department =>
                  <option value={department._id} key={department._id}>
                    {department.department} | {romanize(department.year)} / {romanize(department.semester)} / {department.section}
                  </option>
                )}                
              </select>
            </div>
          </div>
          <button disabled={submittingState} style={submittingState ? { cursor: 'no-drop', backgroundColor: '#1b238d' } : {}} className={[styles2.add_event_button, styles.iconButton_div, roboto.className].join(' ')} type='submit'>
            <span>Add Meeting</span>
            {submittingState ?
              <Spinner />
              :
              <MdOutlineEvent className={styles.iconButton_icon} />
            }
          </button>
        </form>
      </div>
    </div>
  )
}
