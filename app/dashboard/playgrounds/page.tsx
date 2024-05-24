'use client';
import { useCookies } from 'react-cookie';
import Link from 'next/link';
import styles from './page.module.css'
import styles2 from './../page.module.css'
import request from '@/utils/customFetch';
import { MdDeleteOutline, MdOutlineDescription } from 'react-icons/md'
import { BiCodeAlt } from 'react-icons/bi'
import { IoMdAdd } from 'react-icons/io';
import { HiMiniComputerDesktop } from 'react-icons/hi2'
import { Space_Grotesk, Nunito, Rubik } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';
import markdownRenderer from '@/utils/mdrenderutil/mdRender';

const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] })
const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

interface playgroundDataArray {
  _id: string,
  name: string,
  userid: string,
  input: [],
  code: string,
  language: string,
  question: string,
}

export default function StudentPlaygroundList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const deletePopup = useRef<HTMLDivElement>(null)
  const [playgroundDatas, setPlaygroundDatas] = useState([])
  const [fetchingData, setFetchingData] = useState(true)
  const [currentPlayground, setCurrentPlayground] = useState<any>(null)

  async function deletePlayground() {
    if ((currentPlayground === null) || (deletePopup.current === null)) return;
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/playground/${currentPlayground._id}`, {method: 'DELETE', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    deletePopup.current.style.display = 'none'
    setCurrentPlayground(null)
    setPlaygroundDatas([])
    setFetchingData(true)
  }

  useEffect(() => {
    const fetchDatas = async () => {  
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/playground`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setPlaygroundDatas(data.playground)
        setFetchingData(false)
      } catch {
        setFetchingData(false)
      }
    }
    fetchDatas();
  }, [fetchingData])

  useEffect(() => {
    window.onclick = (event) => {
      if (deletePopup.current !== null) {
        if (event.target == deletePopup.current) {
          deletePopup.current.style.display = 'none'
          setCurrentPlayground(null)
        }
      }
    }
  }, [])

  return (
    <div className={styles.dashboard_main_contents}>
      <div className={[styles.light_white_div].join(' ')}>
        <div className={styles.table_decoration}>
          <div className={styles.header_div}>
            <span className={[styles.heading_text, rubik.className].join(' ')}>
              Personal Playgrounds
            </span>
            <Link href='playgrounds/create' className={[styles.header_button, rubik.className].join(' ')}>
              <IoMdAdd style={{ fontSize: '20px', color: 'white' }} />
              Create
            </Link>
          </div>
          {(fetchingData) ? 
            <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
            :
            (playgroundDatas.length === 0) ?
              <span className={[styles.no_datas, space_grotesk.className].join(' ')}>
                Currently there's no Playground
              </span>
              :
              <div className={styles.playground_main_div}>
                {playgroundDatas.map((data: playgroundDataArray) =>
                  <div className={[styles.playground_div, nunito.className].join(' ')} key={data._id}>
                    <div className={styles.playground_title}>
                      <span>{data.name}</span>
                    </div>
                    <div className={[styles.playground_details_div, rubik.className].join(' ')}>
                      <span style={{ gap: '8px' }} className={[styles.playground_details_inner_div].join(' ')}>
                        <HiMiniComputerDesktop style={{ fontSize: '22px' }} />
                        {data.language.slice(0, 1).toUpperCase() + data.language.slice(1)}
                      </span>
                      <div className={[styles.playground_control_div, rubik.className].join(' ')}>
                        <Link style={{ backgroundColor: '#1270DF' }} className={styles.playground_control} href={`playgrounds/${data._id}`}>
                          <BiCodeAlt /> Code
                        </Link>
                        <span style={{ backgroundColor: '#DC3545' }} className={[styles.playground_control, styles2.delete_button].join(' ')} onClick={() => {setCurrentPlayground(data); if (deletePopup.current !== null) { deletePopup.current.style.display = 'block' }}}>
                          <MdDeleteOutline /> Delete
                        </span>
                      </div>
                      {((data.question !== undefined) && (data.question !== '')) &&
                        <div className={styles.playground_question_description_main}>
                          <span className={styles.playground_question_description_heading}>
                            <MdOutlineDescription />
                            <span>Question</span>
                          </span>
                          <span className={[styles.playground_question_description, styles.playground_details_inner_div].join(' ')}>
                            {data.question}
                          </span>
                        </div>
                      }
                      <div className={styles.playground_code}>
                        {markdownRenderer(`${'```'}${data.language}\n${data.code}`)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
          }
        </div>
      </div>
      <div ref={deletePopup} className={styles2.delete_popup_main}>
        <div className={styles2.delete_popup_main_inner}>
          <div className={[styles2.delete_popup_main_header, nunito.className].join(' ')}>
            <span>Delete Confirmation</span>
            <span onClick={(event) => {setCurrentPlayground(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}} className={styles2.delete_popup_main_close}>&times;</span>
          </div>
          <span className={[styles2.delete_popup_main_contents, nunito.className].join(' ')}>Do you really want to delete the data?</span>
          <div className={[styles2.delete_buttons_div, nunito.className].join(' ')}>
            <button onClick={(event) => {setCurrentPlayground(null); if (deletePopup.current !== null) { deletePopup.current.style.display = 'none' }}}>Cancel</button>
            <button style={{ color: 'white', backgroundColor: '#DC3545' }} onClick={deletePlayground}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}
