'use client';
import { useCookies } from 'react-cookie';
import { romanize } from 'romans'
import styles from '../page.module.css'
import request from '@/utils/customFetch';
import { Roboto, Actor, Nunito } from 'next/font/google'
import { useEffect, useState } from 'react'
import Spinner from '@/components/misc/loaders/spinner';

const actor = Actor({ weight: ['400'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '500', '600'], subsets: ['latin'] })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

interface scoreboardDataArray {
  _id: string,
  name: string,
  college: string,
  department: string,
  year:number,
  semester: number,
  section: string,
  score: number
}

export default function SuperAdminScoreboardList() {
  const [cookie, setCookie, getCookie] = useCookies()
  const data_headers = [
    'Name',
    'College',
    'Department',
    'Year/Sem/Sec',
    'Score'
  ]

  const [fetchingData, setFetchingData] = useState(true)
  const [scoreboardDatas, setScoreboardDatas] = useState<Array<scoreboardDataArray>>([])
  const [currentExam, setCurrentExam] = useState<any>(null)

  useEffect(() => {  
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/dashboard`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        let data = await response.json();
        data = data.scoreboard.sort((a: scoreboardDataArray, b: scoreboardDataArray) => (a.score > b.score) ? -1 : 1)
        setScoreboardDatas(data);
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [scoreboardDatas])

  return (
    <div className={styles.admin_main_contents}>
      <div className={[styles.coloredButton, styles.light_gray_div].join(' ')}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Scoreboard
          </span>
        </div>
        {(fetchingData) ? 
          <span style={{ padding: '15px' }} className={[styles.no_datas].join(' ')}>
            <Spinner color='#1b238d' size={45} />
          </span>
          :
          (scoreboardDatas.length === 0) ?
            <span className={[styles.no_datas, actor.className].join(' ')}>
              Currently there is no Scoreboard
            </span> :
            <div className={[styles.table_div, roboto.className].join(' ')}>  
              <table>
                <thead>
                  <tr>
                    {data_headers.map((data, index) => (
                      <td key={index}>{data}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scoreboardDatas.map(data =>
                    <tr key={data._id}>
                      <td>
                        {data.name}
                      </td>
                      <td>
                        {data.college}
                      </td>
                      <td>
                        {data.department}
                      </td>
                      <td>
                        {romanize(data.year)} / {romanize(data.semester)} / {data.section}
                      </td>
                      <td>
                        {data.score}
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
