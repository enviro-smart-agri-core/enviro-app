import { useNavigate } from 'react-router-dom'
import {
  UserCircle, User, Lock, Bell,
  Info, LogOut, ChevronRight, Camera,
} from 'lucide-react'
import BottomNav from '../components/BottomNav'
import { useAuthContext } from '../context/AuthContext'
import styles from '../styles/Profile.module.css'

const fadeUp = (delay = 0) => ({
  animation: `fadeUp 0.42s cubic-bezier(0.25, 0.8, 0.25, 1) ${delay}s both`,
})

function Row({ Icon, label, to }) {
  const nav = useNavigate()
  return (
    <div className={styles.card3} onClick={() => nav(to)}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gp)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={19} color="#0f5c3a" strokeWidth={1.8} />
      </div>
      <span className={styles.nav3}>{label}</span>
      <ChevronRight size={17} color="var(--mu)" />
    </div>
  )
}

export default function Profile() {
  const nav = useNavigate()
  const { bro, yeetBro } = useAuthContext()

  function handleLogout() {
    yeetBro()
    nav('/signin', { replace: true })
  }

  const displayUsername = bro?.username
    ? `@${bro.username}`
    : bro?.name
      ? `@${bro.name.toLowerCase().replace(/\s+/g, '')}`
      : '@user'

  return (
    <div className="page">

      {}
      <div className="grid" style={{ paddingBottom: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22 }}>Profile</h1>
      </div>

      <div className="content">

        {}
        <div
          className={styles.left3}
          style={{ ...fadeUp(0.06) }}
        >
          <div style={{ flexShrink: 0, width: 62, height: 62 }}>
            <div style={{
              width: 62, height: 62, borderRadius: '50%',
              border: '2.5px solid #0f5c3a',
              overflow: 'hidden', background: '#e8f7ee',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {bro?.avatar
                ? <img src={bro.avatar} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <UserCircle size={40} color="#aab8aa" strokeWidth={1.2} />
              }
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1a2a1a' }}>
              {displayUsername}
            </div>
            <div style={{ fontSize: 13, color: '#8aaa8a', marginTop: 3 }}>
              {bro?.email || 'example@gmail.com'}
            </div>
          </div>
        </div>

        {}
        <p className={styles.surface3} style={fadeUp(0.13)}>Account</p>
        <div className={styles.row3} style={fadeUp(0.16)}>
          <Row Icon={Lock} label="Change Password" to="/profile/password" />
          <Row Icon={Bell} label="Notifications"   to="/profile/notifications" />
        </div>

        {}
        <p className={styles.surface3} style={fadeUp(0.22)}>Support</p>
        <div className={styles.row3} style={fadeUp(0.25)}>
          <Row Icon={Info} label="About Enviro" to="/profile/about" />
        </div>

        {}
        <button
          className="drip1"
          style={{
            background: '#fff0f0', color: '#c0392b',
            border: '0.5px solid #f5c6c6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            ...fadeUp(0.30),
          }}
          onClick={handleLogout}
        >
          <LogOut size={18} strokeWidth={2} />
          Log Out
        </button>

      </div>

      <BottomNav />
    </div>
  )
}
