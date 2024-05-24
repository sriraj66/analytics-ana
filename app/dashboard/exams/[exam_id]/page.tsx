'use client';
import { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";
import styles from './../../page.module.css'
import styles2 from './page.module.css'
import Spinner from '@/components/misc/loaders/spinner';
import request from '@/utils/customFetch';
import { Space_Grotesk } from 'next/font/google'
import dynamic from 'next/dynamic';

const ExamInstance = dynamic(() => import('./exam_instance'), { ssr: false });

const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

interface examDatasArray {
  title: string,
  college: string,
  department: string,
  year: number,
  semester: number,
  category: string,
  questions: Array<any>,
  attended: Array<any>,
  date: string,
  hours: number,
  minutes: number,
  start: string,
  end: string
}

export default function StudentExamStart({ params }: { params: { exam_id: string } }) {
  const [cookie, setCookie, getCookie] = useCookies()
  let [examDataError, setExamDataError] = useState(false)
  let [examData, setExamData] = useState<examDatasArray>(Object())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/exams/${params.exam_id}/start`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const data = await response.json();
        setExamData(data)
        const expiryTime = new Date();
        expiryTime.setSeconds(expiryTime.getSeconds() + ((data.hours * 3600) + (data.minutes * 60)));      
        if (data.questions === undefined) {
          setExamDataError(true)
          setTimeout(() => {
            document.location.replace(`/dashboard/exams`)
          }, 2500)
        }
      } catch {
        setExamDataError(true)
        console.error('Error fetching data');
      }  
    };
    fetchData();
  }, []);

  return (
    ((examData.questions === undefined) || (examData.questions.length === 0)) ?
      (examDataError) ?
        <div className={styles.dashboard_code_contents}>
          <div className={[styles2.exam_split_div, styles.light_white_div].join(' ')}>
            <span className={[styles.no_datas, space_grotesk.className].join(' ')}>
              No Active Exam Found with this ID
            </span>
          </div>
        </div>
        :
        <div className={styles.dashboard_code_contents}>
          <div className={[styles2.exam_split_div, styles.light_white_div].join(' ')}>
            <span style={{ alignSelf: 'center', padding: '15px' }} className={[styles.no_datas, space_grotesk.className].join(' ')}>
              <Spinner color='#1b238d' size={45} />
            </span>
          </div>
        </div>
      :
        <ExamInstance exam_id={params.exam_id} token={cookie.token} examData={examData} />
  )
}
