import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import styles from '../styles/Auth.module.css'
import { SocialButtons } from '../components/Illustrations'

export default function SignIn() {
  const navigate = useNavigate()
  const { letBroIn, spinning, fuckshit } = useAuthContext()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleLogin() {
    if (!email || !password) return
    const ok = await letBroIn(email, password)
    if (ok) navigate('/home', { replace: true })
  }

  return (
    <div className={`page ${styles.left2}`}>
      <div className={styles.right2}>

        <div className={`${styles['peak2']} slay`}>
          <img src="/images/signin.png" alt="Sign in" />
        </div>

        <h2 className={`${styles.surface2} dope3 based`}>Sign In</h2>

        {fuckshit && (
          <p className="dope3" style={{ color: '#e74c3c', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
            {fuckshit}
          </p>
        )}

        <div className="sus1 dope3 mid">

          <div style={{ position: 'relative' }}>
            <Mail size={18} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              className="slay1"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type={showPass ? 'text' : 'password'}
              className="slay1"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingLeft: 44, paddingRight: 44 }}
            />
            <button
              onClick={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {showPass ? <EyeOff size={18} color="rgba(255,255,255,0.6)" /> : <Eye size={18} color="rgba(255,255,255,0.6)" />}
            </button>
          </div>

          <Link to="/forgot-password" className={styles.core2}>Forgot password?</Link>

        </div>

        <button className="drip1 ghost1 chill box" onClick={handleLogin} disabled={spinning} style={spinning ? { opacity: 0.7 } : {}}>
          {spinning ? 'Signing in...' : 'Sign In'}
        </button>

        <div className={`${styles.vibe3} dope3 item`}>OR</div>

        <p className="dope3 item" style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#1a2a1a' }}>
          Sign in using
        </p>

        <div className="dope3 main">
          <SocialButtons />
        </div>

        <p className={`${styles.base2} dope3 main`}>
          Don't have an account? <Link to="/register">Sign UP!</Link>
        </p>

      </div>
    </div>
  )
}
undefined
