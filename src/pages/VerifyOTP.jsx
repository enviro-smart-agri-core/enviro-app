import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import styles from '../styles/Auth.module.css'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const { checkBallKnowledge, spinning, fuckshit } = useAuthContext()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [formErr, setFormErr] = useState('')

  async function handleVerify() {
    setFormErr('')
    if (!otp.trim()) return setFormErr('Please enter the OTP')
    if (!email) return setFormErr('Email is missing. Please register again.')

    const ok = await checkBallKnowledge(email, otp)
    if (ok) {

      navigate('/home', { replace: true })
    }
  }

  return (
    <div className={`page ${styles.left2}`}>
      <div className={styles.right2}>

        <div className={`${styles['peak2']} slay`} style={{ marginTop: '2rem' }}>
          <img src="/images/signin.png" alt="Verify OTP" />
        </div>

        <h2 className={`${styles.surface2} dope3 based`}>Verify OTP</h2>
        <p className="dope3 based" style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>
          We sent a code to {email || 'your email'}
        </p>

        {(formErr || fuckshit) && (
          <p className="dope3" style={{ color: '#e74c3c', fontSize: 14, textAlign: 'center', fontWeight: 600, marginBottom: 10 }}>
            {formErr || fuckshit}
          </p>
        )}

        <div className="sus1 dope3 mid">
          <div style={{ position: 'relative' }}>
            <KeyRound size={18} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="slay1"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              style={{ paddingLeft: 44, textAlign: 'center', letterSpacing: 4, fontSize: 18 }}
            />
          </div>
        </div>

        <button className="drip1 ghost1 chill box" onClick={handleVerify} disabled={spinning} style={spinning ? { opacity: 0.7 } : {}}>
          {spinning ? 'Verifying...' : 'Verify & Continue'}
        </button>

      </div>
    </div>
  )
}
