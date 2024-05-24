import Link from 'next/link'
import styles from './page.module.css'
import { Poppins } from 'next/font/google'
import { GoMail } from 'react-icons/go'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import { BsTelephone } from 'react-icons/bs'
import { FaLinkedin, FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa'

const poppins = Poppins({ weight: ['400', '500', '600'], subsets: ['latin'] })

const footer_icons = [
  {icon: <FaFacebook />, url: '/'},
  {icon: <FaInstagram />, url: '/'},
  {icon: <FaTwitter />, url: '/'},
  {icon: <FaLinkedin />, url: '/'},
]

export default function Footer() {
  return (
    <footer className={[styles.footer_main_element, poppins.className].join(' ')}>
      <div className={styles.footer_main}>
        <div className={styles.footer_div}>
          <span className={styles.footer_heading}>Analyticsedify</span>
          <Link href={'/#top'}>Home</Link>
          <Link href={'/#about'}>About</Link>
          <Link href={'/#contact'}>Contact Us</Link>
        </div>
        <div className={styles.footer_div}>
          <span style={{ alignSelf: 'center' }} className={styles.footer_heading}>Reach Us</span>
          <div className={styles.icon_footer}>
            <HiOutlineLocationMarker /> <span>No.5, Gundamedu,<br />Thirumazhisai,<br/>Chennai - 600124</span>
          </div>
          <div className={styles.icon_footer}>
            <GoMail /> <span>projects@analyticsedify.com</span>
          </div>
          <div className={styles.icon_footer}>
            <BsTelephone /> <span>82205 18055 / 9841325855</span>
          </div>
        </div>
        <div style={{ alignItems: 'center' }} className={styles.footer_div}>
          <span className={styles.company_text}>
            Analytics
          </span>          
          <div className={styles.footer_social_icons}>
            {footer_icons.map((icons, index) =>
              <Link key={index} href={icons.url}>{icons.icon}</Link>
            )}
          </div>
        </div>
      </div>
      <span className={styles.seperator_header}></span>
      <span className={styles.copyright_bottom}>
        Ⓒ Copyright {new Date().getFullYear()} Analyticsedify
      </span>
    </footer>
  )
}