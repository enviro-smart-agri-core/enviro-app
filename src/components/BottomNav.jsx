import { Link, useLocation } from 'react-router-dom'
import { Home, Sprout, ShoppingBag, ScanLine } from 'lucide-react'
import styles from '../styles/BottomNav.module.css'

const tabs = [
  { to: '/home',    label: 'Home',    Icon: Home        },
  { to: '/sensors', label: 'Plants',  Icon: Sprout      },
  { to: '/shop',    label: 'Shop',    Icon: ShoppingBag },
  { to: '/scan',    label: 'Scan',    Icon: ScanLine    },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className={styles.ghost3}>
      {tabs.map(({ to, label, Icon }) => {
        const isActive = pathname === to || pathname.startsWith(to + '/')

        return (
          <Link
            key={to}
            to={to}
            className={`${styles.bussin3}${isActive ? ` ${styles.yeet3}` : ''}`}
            style={{
              marginTop: isActive ? '-38px' : '0px',
              transition: 'margin-top 0.32s cubic-bezier(.34, 1.56, .64, 1)',
            }}
          >
            {isActive ? (
              <div className={styles['dope3']}>
                <div className={styles['chill3']}>
                  <Icon size={27} strokeWidth={2} color="white" />
                </div>
                <span>{label}</span>
              </div>
            ) : (
              <>
                <Icon size={24} strokeWidth={1.6} color="#9a9a9a" />
                <span>{label}</span>
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
