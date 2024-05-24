'use client';
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import Link from 'next/link';
import Image from 'next/image'
import styles from './page.module.css'
import { usePathname } from 'next/navigation';
import { TbLogout2 } from 'react-icons/tb'
import { RxDashboard } from 'react-icons/rx'
import { FaLaptopCode } from 'react-icons/fa'
import { SiGooglemeet } from 'react-icons/si'
import { RiAdminLine } from 'react-icons/ri'
import { SiSpringsecurity } from 'react-icons/si'
import { HiMiniComputerDesktop } from 'react-icons/hi2'
import { PiExamBold, PiStudentBold } from 'react-icons/pi'
import { BiSolidInstitution, BiTask } from 'react-icons/bi'
import { RiAccountCircleFill } from 'react-icons/ri'
import { MdOutlineEventAvailable, MdOutlineLeaderboard } from 'react-icons/md'
import { Roboto, Space_Grotesk, Poppins } from 'next/font/google'
import request from '@/utils/customFetch';

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const poppins = Poppins({ weight: ['400', '500', '600'], subsets: ['latin'] })
const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default function SideMenu({ role, name }: { role: string, name: string| any }) {
  const pathname = usePathname()
  const path = pathname.split('/').slice(0, 3).join('/')
  const [cookie, setCookie, getCookie] = useCookies()
  const [currentUser, setCurrentUser] = useState((name === undefined) ? '' : name)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  useEffect(() => {
    async function loadMeta() {
      if (name === undefined) {
        setCurrentUser(cookie.currentUser)
      }
      const userImageResp = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/settings/${cookie.currentId}/image`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      const userImageData = await userImageResp.json()
      if (userImageData.image !== undefined) {
        setUserAvatar(userImageData.image)
        if ((localStorage.getItem('userAvatar') === null) || (userImageData.image !== localStorage.getItem('userAvatar'))) {
          try {
            localStorage.setItem('userAvatar', userImageData.image)
          } catch {}
        }
      }
    }
    loadMeta();
  }, [])

  let sidemenu_options = []
  if (role === 'admin') {
    sidemenu_options = [
      {name: 'Dashboard', url: '/admin', icon: <RxDashboard />},
      {name: 'Exams', url: '/admin/exams', icon: <PiExamBold />},
      {name: 'Colleges', url: '/admin/colleges', icon: <BiSolidInstitution />},
      {name: 'Events', url: '/admin/events', icon: <MdOutlineEventAvailable />},
      {name: 'Scoreboard', url: '/admin/scoreboard', icon: <MdOutlineLeaderboard />},
      {name: 'Meetings', url: '/admin/meetings', icon: <SiGooglemeet />},
      {name: 'Students', url: '/admin/students', icon: <PiStudentBold />},
      {name: 'Super Admins', url: '/admin/sadmins', icon: <RiAdminLine />},
      {name: 'Admins', url: '/admin/admins', icon: <SiSpringsecurity />},
    ]
  } else if (role === 'superadmin') {
    sidemenu_options = [
      {name: 'Dashboard', url: '/sadmin', icon: <RxDashboard />},
      {name: 'Exams', url: '/sadmin/exams', icon: <PiExamBold />},
      {name: 'Departments', url: '/sadmin/departments', icon: <BiSolidInstitution />},
      {name: 'Events', url: '/sadmin/events', icon: <MdOutlineEventAvailable />},
      {name: 'Scoreboard', url: '/sadmin/scoreboard', icon: <MdOutlineLeaderboard />},
      {name: 'Meetings', url: '/sadmin/meetings', icon: <SiGooglemeet />},
      {name: 'Students', url: '/sadmin/students', icon: <PiStudentBold />},
    ]
  } else {
    sidemenu_options = [
      {name: 'Dashboard', url: '/dashboard', icon: <RxDashboard />},
      {name: 'MCQ Exam', url: '/dashboard/mcqexam', icon: <BiTask style={{ fontSize: '22px' }} />},
      {name: 'Coding Exam', url: '/dashboard/codingexam', icon: <HiMiniComputerDesktop style={{ fontSize: '22px' }} />},
      {name: 'Events', url: '/dashboard/events', icon: <MdOutlineEventAvailable />},
      {name: 'Scoreboard', url: '/dashboard/scoreboard', icon: <MdOutlineLeaderboard />},
      {name: 'Meetings', url: '/dashboard/meetings', icon: <SiGooglemeet />},
      {name: 'Playgrounds', url: '/dashboard/playgrounds', icon: <FaLaptopCode />}
    ]
  }
  return (
    !((role === 'student') && (pathname.split('/').includes('exams')) && (pathname.split('/').length >= 4)) &&
      <div className={[styles.hide_mobile, styles.sidemenu].join(' ')}>
        <div className={[styles.sidemenu_bottom].join(' ')}>
          <div className={styles.sidemenu_seperated}>
            <Link href='/admin'>
              <Image alt='logo' height={50} width={160} src="/analytics.png" />
            </Link>
            <div className={styles.side_profile_div}>
              <div className={[styles.profile_text, roboto.className].join(' ')}>
                {((userAvatar === null) || (userAvatar === '')) ? currentUser.split(' ').slice(0, 2).map((a: string) => a[0]).join('') : ''}
              </div>
              <span className={[styles.side_profile_name, poppins.className].join(' ')}>
                {currentUser}
              </span>
            </div>
            <div className={styles.options_div}>
              {sidemenu_options.map(option =>
                <Link href={option.url} className={[(path === option.url) ? styles.option_box_active: styles.option_box].join(' ')} key={option.url}>
                  {option.icon}
                  <span className={roboto.className}>{option.name}</span>
                </Link>
              )}
            </div>
          </div>
          <div className={styles.bottom_buttons_div}>
            <Link onClick={(event) => localStorage.removeItem('userAvatar')} href='/logout' className={styles.logout_button}>
              <TbLogout2 style={{ fontSize: '26px' }} />
              <span className={roboto.className}>Logout</span>
            </Link>
            <Link href={(role === 'student') ? '/dashboard/profile' : (role === 'admin') ? '/admin/profile' : '/sadmin/profile'} className={styles.profile_button}>
              <RiAccountCircleFill style={{ fontSize: '26px' }} />
            </Link>
          </div>
        </div>
      </div>
  )
}