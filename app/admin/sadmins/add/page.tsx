'use client';
import { FiUpload } from 'react-icons/fi'
import { useCookies } from 'react-cookie';
import styles from '../../page.module.css'
import styles2 from './page.module.css'
import readXlsxFile from 'read-excel-file'
import { useRouter } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io'
import request from '@/utils/customFetch';
import { Roboto, Inter } from 'next/font/google'
import { MdDeleteOutline } from 'react-icons/md'
import Spinner from '@/components/misc/loaders/spinner';
import { ChangeEvent, useState, useEffect, useRef } from 'react'

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const inter = Inter({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

interface collegeDataArray {
  _id: string,
  college: string,
  place: string
}

interface superAdminDataArray {
  name: string,
  username: string,
  email: string,
  password: string,
  role: string
}

export default function SuperAdminUsersAdd() {
  const router = useRouter()
  const [cookie, setCookie, getCookie] = useCookies()
  const [submittingState, setSubmittingState] = useState(false)
  const uploadButton = useRef<HTMLInputElement>(null)
  const [collegeId, setCollegeId] = useState('')
  const [collegeList, setCollegeList] = useState<Array<collegeDataArray>>([])
  const [excelFileData, setExcelFileData] = useState<Array<superAdminDataArray>>([])
  
  const data_headers = [
    'Name',
    'Username',
    'Email',
    'Password',
    ''
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/colleges`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setCollegeList(data.colleges)
      } catch {
        console.error('Error fetching data');
      }
    };
    fetchData();
  }, [])

  function addSuperAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formDataObject: any = Object.fromEntries(new FormData(event.currentTarget).entries());
    setExcelFileData([{
      name: formDataObject.name,
      username: formDataObject.username,
      email: formDataObject.email,
      password: formDataObject.password,
      role: 'superadmin'
    }, ...excelFileData])
    event.currentTarget.reset()
  }

  async function submitData(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingState(true)
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/superadmin/${collegeId}/add`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({users: excelFileData})})
      router.push(`/admin/sadmins/${collegeId}`)
      router.refresh()
    } catch(error) {
      console.error(error)
      console.error("Error while Posting the Data")
      setSubmittingState(false)
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const excelFile: any = event.target.files?.[0];
    if (excelFile) {
      try {
        readXlsxFile(excelFile).then(data => {
          if (data[0].length === 4) {
            setExcelFileData([...excelFileData, ...data.slice(1).map((d: Array<any>) => Object(
              {
                name: d[0],
                username: d[1],
                email: d[2],
                password: d[3],
                role: 'superadmin'
              }
            ))])
          } else {
            setExcelFileData(excelFile)
          }
        })
      } catch {
        setExcelFileData(excelFile)
      }
    }
  }

  return (
    <div className={styles.admin_main_contents}>
      <div className={styles.light_gray_div}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Add Super Admins
          </span>
        </div>
        <form onSubmit={addSuperAdmin} className={[styles.coloredButton, styles2.department_div].join(' ')}>
          <div className={[styles.details_main_div, roboto.className].join(' ')}>
            <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
              <span className={[styles2.details_header, styles.details_header].join(' ')}>
                Name
              </span>
              <input name='name' className={[styles.details_value, inter.className].join(' ')} placeholder='Super Admin Name' required />
            </div>
            <div className={[styles.details_inner_div, roboto.className].join(' ')}>
              <span className={styles.details_header}>
                Username
              </span>
              <input name='username' className={[styles.details_value, inter.className].join(' ')} placeholder='Super Admin Username' required />
            </div>
            <div className={[styles.details_inner_div, roboto.className].join(' ')}>
              <span className={styles.details_header}>
                Email
              </span>
              <input name='email' className={[styles.details_value, inter.className].join(' ')} placeholder='Super Admin Email' required />
            </div>
            <div className={[styles.details_inner_div, roboto.className].join(' ')}>
              <span className={styles.details_header}>
                Password
              </span>
              <input name='password' className={[styles.details_value, inter.className].join(' ')} placeholder='Super Admin Password' required />
            </div>
          </div>
          <div className={styles2.splitted_add_buttons}>
            <div style={{ display: 'inline-flex', alignSelf: 'end', gap: '8px' }}>
              <input name='SuperAdminFile' onChange={handleFileChange} accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' ref={uploadButton} style={{ display: 'none' }} type='file'></input>
              <button type='button' onClick={() => { if (uploadButton) { if (uploadButton.current !== null) { uploadButton.current.value = "" }; uploadButton.current?.click() } }} className={[styles.iconButton_div, roboto.className].join(' ')}>
                <FiUpload className={styles.iconButton_icon} />
                <span>Upload</span>
              </button>
            </div>
            <button className={[styles2.add_event_button, styles.iconButton_div, roboto.className].join(' ')}>
              <span>Add Super Admin</span>
              {submittingState ?
                <Spinner />
                :
                <IoMdAdd className={styles.iconButton_icon} />
              }
            </button>
          </div>
        </form>
        {(excelFileData.length !== 0) &&
          <div style={{ width: '100%' }} className={[styles.table_div, roboto.className].join(' ')}>  
            <table>
              <thead>
                <tr>
                  {data_headers.map(data => (
                    <td key={data}>{data}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelFileData.map((data: any, index: number) =>
                  <tr key={data.rollno}>
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
                      {data.password}
                    </td>
                    <td>
                      <button onClick={() => setExcelFileData([...excelFileData.filter((_, i) => i !== index)])} className={styles.delete_button}>
                        <MdDeleteOutline style={{ color: '#DC3545' }} />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        }
        <form onSubmit={submitData} className={[styles.coloredButton, styles2.department_div].join(' ')}>
          <div className={[styles.details_inner_div, styles2.details_inner_div, roboto.className].join(' ')}>
            <span className={[styles2.details_header, styles.details_header].join(' ')}>College Name</span>
            <select onChange={(value) => {setCollegeId(value.currentTarget.value)}} name='college' className={[styles.details_value, inter.className].join(' ')} required>
              {collegeList.map(college =>
                <option value={college._id} key={college._id}>
                  {college.college}
                </option>
              )}
            </select>
          </div>
          <button disabled={submittingState} style={submittingState ? { cursor: 'no-drop', backgroundColor: '#1b238d' } : {}} className={[styles2.add_sadmin_button, styles.iconButton_div, roboto.className].join(' ')} type='submit'>
            <span>Submit</span>
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
