import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import styles from '../styles/Auth.module.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetBroPwd, spinning, fuckshit } = useAuthContext()

  const token = searchParams.get('token')
  const userId = searchParams.get('userId')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [formErr, setFormErr] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleReset() {
    setFormErr('')
    if (!password) return setFormErr('Please enter a new password')
    if (password.length < 6) return setFormErr('Password needs to be at least 6 characters')
    if (password !== confirm) return setFormErr("Passwords don't match")
    if (!token || !userId) return setFormErr('Invalid reset link. Please request a new one.')

    const ok = await resetBroPwd(userId, token, password)
    if (ok) {
      setSuccess(true)
      setTimeout(() => {
        navigate('/signin', { replace: true })
      }, 2000)
    }
  }

  const iconPos = { position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)' }
  const eyePos  = { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }

  return (
    <div className={`page ${styles.left2}`}>
      <div className={styles.right2}>

        <div className={`${styles['peak2']} slay`} style={{ marginTop: '2rem' }}>
          <img src="/images/signin.png" alt="Reset Password" />
        </div>

        <h2 className={`${styles.surface2} dope3 based`}>New Password</h2>

        {(formErr || fuckshit) && (
          <p className="dope3" style={{ color: '#e74c3c', fontSize: 14, textAlign: 'center', fontWeight: 600, marginBottom: 10 }}>
            {formErr || fuckshit}
          </p>
        )}

        {success ? (
          <div className="dope3" style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#27ae60', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
              Password reset successfully!
            </p>
            <p style={{ color: '#666', fontSize: 14 }}>Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div className="sus1 dope3 mid">
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="rgba(255,255,255,0.6)" style={iconPos} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="slay1"
                  placeholder="New Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                />
                <button onClick={() => setShowPass(p => !p)} style={eyePos}>
                  {showPass ? <EyeOff size={18} color="rgba(255,255,255,0.6)" /> : <Eye size={18} color="rgba(255,255,255,0.6)" />}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} color="rgba(255,255,255,0.6)" style={iconPos} />
                <input
                  type={showConf ? 'text' : 'password'}
                  className="slay1"
                  placeholder="Confirm New Password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                />
                <button onClick={() => setShowConf(p => !p)} style={eyePos}>
                  {showConf ? <EyeOff size={18} color="rgba(255,255,255,0.6)" /> : <Eye size={18} color="rgba(255,255,255,0.6)" />}
                </button>
              </div>
            </div>

            <button className="drip1 ghost1 chill box" onClick={handleReset} disabled={spinning} style={spinning ? { opacity: 0.7 } : {}}>
              {spinning ? 'Saving...' : 'Reset Password'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}
