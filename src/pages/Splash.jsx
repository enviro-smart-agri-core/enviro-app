import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useOnboarding } from '../context/OnboardingContext'
import styles from '../styles/Splash.module.css'

export default function Splash() {
  const navigate = useNavigate()
  const { bro, vibeReady } = useAuthContext()
  const { seen } = useOnboarding()

  useEffect(() => {
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
  }, [])

  useEffect(() => {
    if (!vibeReady) return
    const timer = setTimeout(() => {
      if (bro) navigate('/home', { replace: true })
      else if (seen) navigate('/signin', { replace: true })
      else navigate('/onboarding1', { replace: true })
    }, 2200)
    return () => clearTimeout(timer)
  }, [vibeReady, bro, seen, navigate])

  return (
    <div className={styles.flex5}>
      <div className="slay">
        <img src="/images/leaf.png" alt="Enviro" className={styles.bussin5} style={{ width: 110, height: 110, objectFit: 'contain' }} />
      </div>
      <div className={`${styles.ghost5} dope3 mid`}>
        <span>Enviro</span>
      </div>
      <p className={`${styles.top3} dope3 box`}>Smart Farm Management</p>
    </div>
  )
}
