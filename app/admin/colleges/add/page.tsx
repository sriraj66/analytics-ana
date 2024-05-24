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

export default function AdminCollegeAdd() {
  const router = useRouter()
  const [cookie, setCookie, getCookie] = useCookies()
  const [submittingState, setSubmittingState] = useState(false)
  const collegeInputs = [
    {name: 'college', title: 'College', placeholder: 'Enter the College Name'},
    {name: 'place', title: 'Place', placeholder: 'Enter the College Place'},
  ]
  async function submitData(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingState(true)
    const form = event.currentTarget;
    const formDataObject = Object.fromEntries(new FormData(form).entries());
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges/add`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(formDataObject)})
      router.push(`/admin/colleges`)
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
            New College
          </span>
        </div>
        <form onSubmit={submitData} className={[styles.coloredButton, styles2.college_div].join(' ')}>
          <div className={[styles.details_main_div, roboto.className].join(' ')}>
            {collegeInputs.map(college =>
              <div className={[styles.details_inner_div, roboto.className].join(' ')} key={college.name}>
                <span className={styles.details_header}>{college.title}</span>
                <input name={college.name} className={[styles.details_value, inter.className].join(' ')} placeholder={college.placeholder} required />
              </div>
            )}
          </div>
          <button disabled={submittingState} style={submittingState ? { cursor: 'no-drop', backgroundColor: '#1b238d' } : {}} className={[styles2.add_event_button, styles.iconButton_div, roboto.className].join(' ')} type='submit'>
            <span>Add College</span>
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
