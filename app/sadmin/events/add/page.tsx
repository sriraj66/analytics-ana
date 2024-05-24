'use client';
import { useCookies } from 'react-cookie';
import { useRef, useState } from 'react'
import styles from '../../page.module.css'
import styles2 from './page.module.css'
import { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MdOutlineEvent } from 'react-icons/md'
import request from '@/utils/customFetch';
import Spinner from '@/components/misc/loaders/spinner';
import { Roboto, Inter, JetBrains_Mono } from 'next/font/google'

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const jet_brains_mono = JetBrains_Mono({ weight: ['400', '500', '600'], subsets: ['latin'] })
const inter = Inter({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default function SuperAdminEventAdd() {
  const router = useRouter()
  const [cookie, setCookie, getCookie] = useCookies()
  const [submittingState, setSubmittingState] = useState(false)
  const fileInput = useRef<HTMLInputElement | null>(null)
  const [eventImg, setEventImg] = useState<File | null>(null)
  const [eventImgURL, setEventImgURL] = useState<string | null>(null);
  const eventInputs = [
    {name: 'username', title: 'Name', placeholder: 'Event Organizer Name'},
    {name: 'title', title: 'Title', placeholder: 'Event Title'},
    {name: 'college', title: 'College', placeholder: 'Event College'},
    {name: 'department', title: 'Department', placeholder: 'Event Organizer Department'},
    {name: 'year', title: 'Year', placeholder: 'Event Organizer Year'},
    {name: 'semester', title: 'Semester', placeholder: 'Event Organizer Semester'},
    {name: 'section', title: 'Section', placeholder: 'Event Organizer Section'},
    {name: 'eventlink', title: 'Link', placeholder: 'Event Link'},
  ]

  function handleImgChange(event: ChangeEvent<HTMLInputElement>) {
    const ImgFile = event.target.files?.[0];
    const imgReader = new FileReader();
    setEventImg(ImgFile || null);
    imgReader.onload = function (e: any) {
      const base64String = e.target.result;
      setEventImgURL(base64String);
    };
    if (ImgFile) {
      imgReader.readAsDataURL(ImgFile)
    }
  }

  async function submitEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingState(true)
    const form = event.currentTarget;
    let formDataObject: any = Object.fromEntries(new FormData(form).entries());
    formDataObject.image = eventImgURL
    formDataObject.eventlink = (formDataObject.eventlink.startsWith('https://') || formDataObject.eventlink.startsWith('http://')) ? formDataObject.eventlink : `https://${formDataObject.eventlink}`
    formDataObject = formDataObject
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/superadmin/event`, {method: 'POST', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(formDataObject)})
      router.push('/sadmin/events')
      router.refresh()
    } catch(error) {
      console.error("Error while Posting the Event")
      setSubmittingState(false)
    }
  }
  
  return (
    <div className={styles.admin_main_contents}>
      <div className={styles.light_gray_div}>
        <div className={styles.light_gray_heading_div}>
          <span className={[styles.light_gray_heading, roboto.className].join(' ')}>
            Add Event
          </span>
        </div>
        <form onSubmit={submitEvent} className={[styles.coloredButton, styles2.event_div].join(' ')}>
          <input name='image' accept='image/png, image/jpg, image/jpeg' required onChange={handleImgChange} style={{ display: 'none' }} ref={fileInput} type='file' />
          {(eventImgURL === null) ?
            <span onClick={() => {(fileInput.current !== null) && fileInput.current.click()}} className={[styles2.event_banner_input, styles2.event_banner_img, styles.event_banner_img, jet_brains_mono.className].join(' ')}>
              Upload the Event Image
            </span>
            :
            <img onClick={() => {(fileInput.current !== null) && fileInput.current.click()}} src={eventImgURL} className={[styles2.event_banner_input, styles2.event_banner_img, styles.event_banner_img].join(' ')} />
          }
          <div className={[styles.details_main_div, roboto.className].join(' ')}>
            {eventInputs.map(event =>
              <div className={[styles.details_inner_div, roboto.className].join(' ')} key={event.name}>
                <span className={styles.details_header}>{event.title}</span>
                <input name={event.name} className={[styles.details_value, inter.className].join(' ')} placeholder={event.placeholder} required />
              </div>
            )}
          </div>
          <button disabled={submittingState} style={submittingState ? { cursor: 'no-drop', backgroundColor: '#1b238d' } : {}} className={[styles2.add_event_button, styles.iconButton_div, roboto.className].join(' ')} type='submit'>
            <span>Add Event</span>
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
