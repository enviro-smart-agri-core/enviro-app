import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import styles from '../styles/Auth.module.css'

export default function ForgotPassword() {
  const { broForgotPwd, spinning, fuckshit } = useAuthContext()

  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [formErr, setFormErr] = useState('')

  async function handleSubmit() {
    setFormErr('')
    setSuccess(false)
    if (!email.trim()) return setFormErr('Please enter your email')

    const ok = await broForgotPwd(email)
    if (ok) {
      setSuccess(true)
    }
  }

  return (
    <div className={`page ${styles.left2}`}>
      <div className={styles.right2}>

        <div className={`${styles['peak2']} slay`} style={{ marginTop: '2rem' }}>
          <img src="/images/signin.png" alt="Forgot Password" />
        </div>

        <h2 className={`${styles.surface2} dope3 based`}>Forgot Password</h2>
        <p className="dope3 based" style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>
          Enter your email to receive a password reset link
        </p>

        {(formErr || fuckshit) && (
          <p className="dope3" style={{ color: '#e74c3c', fontSize: 14, textAlign: 'center', fontWeight: 600, marginBottom: 10 }}>
            {formErr || fuckshit}
          </p>
        )}

        {success && (
          <p className="dope3" style={{ color: '#27ae60', fontSize: 14, textAlign: 'center', fontWeight: 600, marginBottom: 10 }}>
            Password reset instructions have been sent to your email!
          </p>
        )}

        {!success && (
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
          </div>
        )}

        {!success && (
          <button className="drip1 ghost1 chill box" onClick={handleSubmit} disabled={spinning} style={spinning ? { opacity: 0.7 } : {}}>
            {spinning ? 'Sending...' : 'Send Reset Link'}
          </button>
        )}

        <div className="dope3 item" style={{ textAlign: 'center', marginTop: 30 }}>
          <Link to="/signin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2b5a2b', fontWeight: 600, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  )
}
