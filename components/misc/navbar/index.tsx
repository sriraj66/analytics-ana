'use client';
import Link from 'next/link';
import Image from 'next/image'
import { useRef, useEffect } from 'react';
import styles from './page.module.css'
import { TiThMenu } from 'react-icons/ti'
import { FaChevronRight } from 'react-icons/fa'
import { SyntheticEvent } from 'react';
import { useState } from 'react';
import { useCookies } from "react-cookie";
import { BiUser } from 'react-icons/bi'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import request from '@/utils/customFetch';
import Spinner from '@/components/misc/loaders/spinner';
import { Rubik } from 'next/font/google'

const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })

export default function NavBar() {
  const [cookie, setCookie, removeCookie] = useCookies()
  const [loginError, setLoginError] = useState(false)
  const [loginErrorStatus, setLoginErrorStatus] = useState('')
  const [loggingInState, setLoggingInState] = useState(false)
  const [passwordShow, setPasswordShow] = useState("password")
  const hamMenu = useRef<HTMLDivElement>(null)
  const loginDiv = useRef<HTMLDivElement>(null)

  function HandleHamMenu(event: SyntheticEvent) {
    if (hamMenu.current) {
      hamMenu.current.style.opacity = (hamMenu.current.style.opacity === '1') ? '0' : '1';
      hamMenu.current.style.visibility = (hamMenu.current.style.visibility === 'visible') ? 'hidden' : 'visible';
    }
  }

  const navbar = [
    {name: 'Home', url: '#top'},
    {name: 'About', url: '#about'},
    {name: 'Contact us', url: '#contact'}
  ]

  async function userLogin(event: React.FormEvent<HTMLFormElement>) {
    setLoginError(false)
    setLoggingInState(true)
    event.preventDefault();
    const form = event.currentTarget;
    const formDataObject = Object.fromEntries(new FormData(form).entries());
    try {
      const loggedIn = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/login`, {method: 'POST', cache: 'no-cache', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(formDataObject)})
      const loggedData = await loggedIn.json()
      if ((loggedIn.status === 200) && (loggedData.response === undefined)) {
        removeCookie('token')
        setCookie('token', loggedData.token)
        document.location.replace('/dashboard')
        return;
      }
      setLoginError(true)
      setLoggingInState(false)
      if (loggedData.response !== undefined) {
        setLoginErrorStatus(loggedData.response)
      }
    } catch(error) {
      console.error("Error while Logging in to Analytics")
      setLoginError(true)
      setLoggingInState(false)
    }
  }

  useEffect(() => {
    window.onclick = (event) => {
      if (loggingInState) return;
      if (loginDiv.current !== null) {
        if (event.target == loginDiv.current) {
          loginDiv.current.style.display = 'none'
        }
      } 
    }  
  }, [])

  return (
    <>
      <div className={[styles.navbar, rubik.className].join(' ')}>
        <div className={styles.navbar_elements}>
          <Link href='/'>
            <Image alt='logo' height={45} width={140} src="/analytics.png" />
          </Link>
        </div>
        <div className={[styles.navbar_elements, styles.hide_mobile].join(' ')}>
          {navbar.map(nav =>
            <Link href={nav.url} className={styles.navbar_element} key={nav.name}>
              <span className={styles.a_main}>
                {nav.name}
              </span>
              <span className={styles.empty_border}></span>
            </Link>
          )}
        </div>
        <div className={[styles.navbar_elements, styles.hide_mobile].join(' ')}>
          <button onClick={() => {if (cookie.token !== undefined) { document.location.replace('/dashboard'); return } ; if (loginDiv.current !== null) { loginDiv.current.style.display = 'block' }}} className={styles.nav_signup_button}>
            Login
          </button>
        </div>
        <div onClick={(event) => HandleHamMenu(event)} className={[styles.navbar_elements, styles.ham_icon, styles.show_mobile].join(' ')}>
          <TiThMenu />
        </div>
        <div className={[styles.ham_menu].join(' ')} ref={hamMenu}>
          <div onClick={(event) => HandleHamMenu(event)} className={[styles.navbar_elements, styles.ham_icon, styles.show_mobile].join(' ')}>
            <FaChevronRight />
          </div>
          <div className={[styles.navbar_elements].join(' ')}>
            {navbar.map(nav =>
              <a href={nav.url} className={styles.navbar_element} key={nav.name}>
                <span className={styles.a_main}>
                  {nav.name}
                </span>
                <span className={styles.empty_border}></span>
              </a>
            )}
          </div>
          <div className={[styles.navbar_elements].join(' ')}>
            <button onClick={(event) => {HandleHamMenu(event); if (loginDiv.current !== null) { loginDiv.current.style.display = 'block' }}} className={styles.nav_signup_button}>
              Login
            </button>
          </div>
        </div>
      </div>
      <div ref={loginDiv} className={styles.login_main_div}>
        <div className={styles.login_inner_div}>
          <Image style={{ alignSelf: 'center' }} alt="logo" width={190} height={58} src={'/analytics.png'} />
          <span className={[styles.login_header, rubik.className].join(' ')}>
            Login
          </span>
          <form className={styles.login_div} onSubmit={userLogin}>
            <span className={[styles.user_input_div, rubik.className].join(' ')}>
              <BiUser style={{ fontSize: '20px' }} />
              <input name='username' className={[styles.user_input, rubik.className].join(' ')} placeholder='User Id' required />
            </span>
            <span style={{ paddingInline: '20px' }} className={[styles.user_input_div, rubik.className].join(' ')}>
              <FiLock style={{ fontSize: '20px' }} />
              <input name='password' className={[styles.user_input, rubik.className].join(' ')} placeholder='Password' type={passwordShow} required />
              {(passwordShow === 'password') ?
                <FiEyeOff onClick={() => setPasswordShow('text')} className={styles.passwordIcon} />
                :
                <FiEye onClick={() => setPasswordShow('password')} className={styles.passwordIcon} />
              }
            </span>
            <button disabled={loggingInState} style={loggingInState ? { cursor: 'no-drop', backgroundColor: '#282b4a' } : {}} className={[styles.user_input, styles.login_submit, rubik.className].join(' ')} type='submit'>
              Login
              {loggingInState &&
                <Spinner />
              }
            </button>
            {loginError &&
              <span className={[styles.user_input_div, styles.login_error, rubik.className].join(' ')}>
                {loginErrorStatus === '' ?
                  "Invalid Login Id or Password. Please try again."
                  :
                  loginErrorStatus
                }
              </span>
            }
          </form>
        </div>
      </div>
    </>
  )
}