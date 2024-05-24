'use client';
import { useCookies } from 'react-cookie';
import styles from '../page.module.css'
import request from '@/utils/customFetch';
import { Space_Grotesk, Rubik } from 'next/font/google'
import { romanize } from 'romans'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';

const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

interface scoreboardDataArray {
  rollno: string,
  name: string,
  department: string,
  year: number,
  semester: number,
  section: string,
  score: number
}

export default function StudentScoreBoard() {
  const [cookie, setCookie, getCookie] = useCookies()
  const data_headers = [
    'Enroll',
    'Name',
    'Department',
    'Year/Sem/Sec',
    'Score'
  ]
  const [scoreboardData, setScoreboardData] = useState<Array<scoreboardDataArray>>([])
  const [fetchingData, setFetchingData] = useState(true)


  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/scoreboard`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        const score_data = data.score.sort((a: scoreboardDataArray, b: scoreboardDataArray) => (a.score > b.score) ? -1 : 1)
        setScoreboardData(score_data)
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [scoreboardData])

  return (
    <div className={styles.dashboard_main_contents}>
      <div className={[styles.light_white_div].join(' ')}>
        <div className={styles.table_decoration}>
          <span className={[styles.heading_text, rubik.className].join(' ')}>
            Scoreboard
          </span>
          {(fetchingData) ? 
            <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
            :
            (scoreboardData.length === 0) ?
              <span className={[styles.no_datas, space_grotesk.className].join(' ')}>
                Currently there's no Scoreboard to Display
              </span>
              :
              <div className={styles.table_div}>
                <div className={[styles.table_headers, rubik.className].join(' ')}>
                  {data_headers.map(header => 
                    <span key={Math.random()} className={styles.table_values}>
                      {header}
                    </span>
                  )}
                </div>
                {scoreboardData.map(data => 
                  <a className={[styles.table_headers, styles.table_active_div, rubik.className].join(' ')} key={Math.random()}>
                    <span className={styles.table_values}>
                      {data.rollno}
                    </span>
                    <span className={styles.table_values}>
                      {data.name}
                    </span>
                    <span className={styles.table_values}>
                      {data.department}
                    </span>
                    <span className={styles.table_values}>
                      {romanize(data.year)} / {romanize(data.semester)} / {data.section}
                    </span>
                    <span className={styles.table_values}>
                      {data.score}
                    </span>
                  </a>
                )}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
