'use client';
import Link from 'next/link';
import Image from 'next/image'
import styles from './page.module.css'
import { usePathname } from 'next/navigation';
import { TiThMenu } from 'react-icons/ti'
import { IoMdLogOut } from 'react-icons/io'
import { BiSolidInstitution, BiTask } from 'react-icons/bi'
import { RxDashboard } from 'react-icons/rx'
import { FaLaptopCode } from 'react-icons/fa'
import { SiGooglemeet } from 'react-icons/si'
import { RiAdminLine } from 'react-icons/ri'
import { SiSpringsecurity } from 'react-icons/si'
import { HiMiniComputerDesktop } from 'react-icons/hi2'
import { PiExamBold, PiStudentBold } from 'react-icons/pi'
import { MdOutlineEventAvailable, MdOutlineLeaderboard } from 'react-icons/md'
import { useCookies } from 'react-cookie';
import { SyntheticEvent, RefObject } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Roboto } from 'next/font/google'
import request from '@/utils/customFetch';

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

export default function NavBar({ name, role }: { name: string | any, role: string }) {
  const [currentUser, setCurrentUser] = useState((name === undefined) ? '' : name)
  const [cookie, setCookie, getCookie] = useCookies()
  const hamMenu = useRef(null)
  const pathname = usePathname()
  const path = pathname.split('/').slice(0, 3).join('/')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  function HandleHamMenu(event: SyntheticEvent, hamMenu: RefObject<HTMLElement>) {
    if (hamMenu.current) {
      hamMenu.current.style.display = (hamMenu.current.style.display === 'flex') ? 'none' : 'flex';
    }
  }
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

  let navbar_options = []
  if (role === 'admin') {
    navbar_options = [
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
    navbar_options = [
      {name: 'Dashboard', url: '/sadmin', icon: <RxDashboard />},
      {name: 'Exams', url: '/sadmin/exams', icon: <PiExamBold />},
      {name: 'Departments', url: '/sadmin/departments', icon: <BiSolidInstitution />},
      {name: 'Events', url: '/sadmin/events', icon: <MdOutlineEventAvailable />},
      {name: 'Scoreboard', url: '/sadmin/scoreboard', icon: <MdOutlineLeaderboard />},
      {name: 'Meetings', url: '/sadmin/meetings', icon: <SiGooglemeet />},
      {name: 'Students', url: '/sadmin/students', icon: <PiStudentBold />},
    ]
  } else {
    navbar_options = [
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
    <div className={[styles.navbar, ((role === 'student') && (pathname.split('/').includes('exams')) && (pathname.split('/').length >= 4)) ? "": styles.hide_pc].join(' ')}>
      <div className={styles.navbar_elements}>
        {(!((role === 'student') && (pathname.split('/').includes('exams')) && (pathname.split('/').length >= 4))) &&
          <div onClick={(event) => HandleHamMenu(event, hamMenu)} className={[styles.ham_icon].join(' ')}>
            <TiThMenu />
          </div>
        }
        <Link href={(role === 'student') ? '/dashboard' : (role === 'admin') ? '/admin' : '/sadmin'}>
          <Image alt='logo' height={40} width={130} src="/analytics.png" />
        </Link>
        {(!((role === 'student') && (pathname.split('/').includes('exams')) && (pathname.split('/').length >= 4))) ?
          <Link href={(role === 'student') ? '/dashboard/profile' : (role === 'admin') ? '/admin/profile' : '/sadmin/profile'} className={[styles.profile_text, roboto.className].join(' ')} style={((userAvatar === null) || (userAvatar === undefined) || (userAvatar === '')) ? {} : { backgroundImage: `url(${userAvatar})` }}>
            {((userAvatar === null) || (userAvatar === '')) ? currentUser.split(' ').slice(0, 2).map((a: string) => a[0]).join('') : ''}
          </Link>
          :
          <div className={[styles.profile_text, roboto.className].join(' ')}>
            {((userAvatar === null) || (userAvatar === '')) ? currentUser.split(' ').slice(0, 2).map((a: string) => a[0]).join('') : ''}
          </div>
        }
      </div>
      <div style={{ display: 'none' }} className={[styles.navbar_bottom].join(' ')} ref={hamMenu}>
        <div className={styles.options_div}>
          {navbar_options.map(option =>
            <Link href={option.url} className={[styles.option_box, (path === option.url) ? styles.option_box_active: ''].join(' ')} key={option.url}>
              {option.icon}
              <span className={roboto.className}>{option.name}</span>
            </Link>
          )}
        </div>
        <Link onClick={(event) => localStorage.removeItem('userAvatar')} href='/logout' className={styles.logout_button}>
          <span className={roboto.className}>Logout</span>
          <IoMdLogOut />
        </Link>
      </div>
    </div>
  )
}