import styles from './page.module.css'

export default function Spinner({size = undefined, color = undefined}: {size?: number | undefined, color?: string | undefined}) {
  return (
    <div className={styles.lds_ring}>
      <div style={{ borderColor: (color !== undefined) ? `${color} transparent transparent transparent` : '', width: `${size}px`, height: `${size}px` }}></div>
    </div>
  )
}