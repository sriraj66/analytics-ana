import styles from './page.module.css'
import { cookies } from 'next/headers';
import NavBar from '@/components/main/navbar';
import SideMenu from '@/components/main/sidemenu';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  return (
    <html lang="en">
      <body>
        <NavBar name={cookieStore.get('currentUser')?.value} role={'student'} />
        <div className={styles.side_menu_div}>
          <SideMenu role={'student'} name={cookieStore.get('currentUser')?.value} />
          {children}
        </div>
      </body>
    </html>
  )
}