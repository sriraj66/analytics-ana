'use client';
import { useState } from 'react'
import { useCookies } from 'react-cookie';
import styles2 from './page.module.css'
import styles from '../../../../page.module.css'
import { useRouter } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io'
import request from '@/utils/customFetch';
import Spinner from '@/components/misc/loaders/spinner';
import { Roboto, Inter } from 'next/font/google'

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const inter = Inter({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default function AdminStudentAdd({ params }: { params: { college_id: string, department_id: string } }) {
  const router = useRouter()
  const [cookie, setCookie, getCookie] = useCookies()
  const [submittingState, setSubmittingState] = useState(false)
  const studentInputs = [
    {name: 'name', title: 'Name', placeholder: 'Enter the Student Name', type: 'text'},
    {name: 'username', title: 'Username', placeholder: 'Enter the Student Username', type: 'text'},
    {name: 'password', title: 'Password', placeholder: 'Enter the Student Password', type: 'text'},
    {name: 'email', title: 'Email', placeholder: 'Enter the Student Email', type: 'text'},
    {name: 'rollno', title: 'RollNo', placeholder: 'Enter the Student RollNo', type: 'number'},
  ]
  async function submitData(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingState(true)
    const form = event.currentTarget;
    const formDataObject = Object.fromEntries(new FormData(form).entries());
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges/${params.college_id}/${params.department_id}/add`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({users: [formDataObject]})})
      router.push(`/admin/colleges/${params.college_id}/${params.department_id}`)
      router.refresh()
    } catch(error) {
      console.error("Error while Posting the Data")
      setSubmittingState(false)
    }
  }
  return (
    <div className={styles.admin_main_contents}>
      <div className={styles.light_gray_div}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            New Student
          </span>
        </div>
        <form onSubmit={submitData} className={[styles.coloredButton, styles2.department_div].join(' ')}>
          <div className={[styles.details_main_div, roboto.className].join(' ')}>
            {studentInputs.map(student =>
              <div className={[styles.details_inner_div, roboto.className].join(' ')} key={student.name}>
                <span className={styles.details_header}>{student.title}</span>
                <input name={student.name} className={[styles.details_value, inter.className].join(' ')} placeholder={student.placeholder} type={student.type} required/>
              </div>
            )}
          </div>
            <button disabled={submittingState} style={submittingState ? { cursor: 'no-drop', backgroundColor: '#1b238d' } : {}} className={[styles2.add_event_button, styles.iconButton_div, roboto.className].join(' ')} type='submit'>
              <span>Add Student</span>
              {submittingState ?
                <Spinner />
                :
                <IoMdAdd className={styles.iconButton_icon} />
              }
            </button>
          </form>
      </div>
    </div>
  )
}
