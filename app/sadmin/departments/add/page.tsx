'use client';
import { useState } from 'react'
import { useCookies } from 'react-cookie';
import styles from '../../page.module.css'
import styles2 from './page.module.css'
import { useRouter } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io'
import request from '@/utils/customFetch';
import Spinner from '@/components/misc/loaders/spinner';
import { Roboto, Inter } from 'next/font/google'

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const inter = Inter({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default function SuperAdminDepartmentAdd() {
  const router = useRouter()
  const [cookie, setCookie, getCookie] = useCookies()
  const [submittingState, setSubmittingState] = useState(false)
  const departmentInputs = [
    {name: 'department', title: 'Department', placeholder: 'Enter the Department Name', type: 'text', maxlength: Infinity},
    {name: 'year', title: 'Year', placeholder: 'Enter the Year', type: 'number', maxlength: 1},
    {name: 'semester', title: 'Semester', placeholder: 'Enter the Semester', type: 'number', maxlength: 1},
    {name: 'section', title: 'Section', placeholder: 'Enter the Section', type: 'text', maxlength: 1},
  ]
  async function submitData(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingState(true)
    const form = event.currentTarget;
    const formDataObject = Object.fromEntries(new FormData(form).entries());
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/department/add`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(formDataObject)})
      router.push(`/sadmin/departments`)
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
            New Department
          </span>
        </div>
        <form onSubmit={submitData} className={[styles.coloredButton, styles2.department_div].join(' ')}>
          <div className={[styles.details_main_div, roboto.className].join(' ')}>
            <div className={[styles.details_inner_div, roboto.className].join(' ')}>
              <span className={styles.details_header}>{departmentInputs[0].title}</span>
              <input name={departmentInputs[0].name} className={[styles.details_value, inter.className].join(' ')} placeholder={departmentInputs[0].placeholder} type={departmentInputs[0].type} maxLength={departmentInputs[0].maxlength} required />
            </div>
            <div className={styles2.splitted_options_row_div}>
              {departmentInputs.slice(1).map(department =>
                <div style={{ flexDirection: 'column' }} className={[styles.details_inner_div, roboto.className].join(' ')} key={department.name}>
                  <span style={{ width: '100%' }} className={styles.details_header}>{department.title}</span>
                  <input name={department.name} className={[styles.details_value, inter.className].join(' ')} placeholder={department.placeholder} type={department.type} maxLength={department.maxlength} required />
                </div>
              )}
            </div>
          </div>
          <button disabled={submittingState} style={submittingState ? { cursor: 'no-drop', backgroundColor: '#1b238d' } : {}} className={[styles2.add_event_button, styles.iconButton_div, roboto.className].join(' ')} type='submit'>
            <span>Add Department</span>
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
