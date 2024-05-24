import styles from './page.module.css'
import { cookies } from 'next/headers';
import NavBar from '@/components/main/navbar';
import SideMenu from '@/components/main/sidemenu';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  return (
    <html lang="en">
      <body>
        <NavBar name={cookieStore.get('currentUser')?.value} role={'admin'} />
        <div className={styles.side_menu_div}>
          <SideMenu role={'admin'} name={cookieStore.get('currentUser')?.value} />
          <div className={styles.side_menu_contents}>
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}