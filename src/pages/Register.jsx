import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, AtSign } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import styles from '../styles/Auth.module.css'
import { SocialButtons } from '../components/Illustrations'

export default function Register() {
  const navigate = useNavigate()
  const { setupBro, spinning, fuckshit } = useAuthContext()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [formErr, setFormErr] = useState('')

  async function handleRegister() {
    setFormErr('')

    if (!fullName.trim()) return setFormErr('Please enter your full name')
    if (!username.trim()) return setFormErr('Please enter a username')
    if (username.includes(' ')) return setFormErr('Username cannot have spaces')
    if (!email.trim()) return setFormErr('Please enter your email')
    if (password.length < 8) return setFormErr('Password must be at least 8 characters')
    if (!/[a-z]/.test(password)) return setFormErr('Password must include at least one lowercase letter')
    if (!/[A-Z]/.test(password)) return setFormErr('Password must include at least one capital letter')
    if (!/[0-9]/.test(password)) return setFormErr('Password must include at least one number')
    if (password !== confirm) return setFormErr("Passwords don't match")

    const ok = await setupBro(email, password, fullName, username)
    if (ok) navigate('/verify-otp', { state: { email } })
  }

  const iconPos = { position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)' }
  const eyePos = { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }

  return (
    <div className={`page ${styles.left2}`}>
      <div className={styles.right2}>

        <div className={`${styles['peak2']} slay`}>
          <img src="/images/register.png" alt="Register" />
        </div>

        <h2 className={`${styles.surface2} dope3 based`}>Create Account</h2>

        {(formErr || fuckshit) && (
          <p className="dope3" style={{ color: '#e74c3c', fontSize: 14, textAlign: 'center', fontWeight: 600, marginBottom: 4 }}>
            {formErr || fuckshit}
          </p>
        )}

        <div className="sus1 dope3 mid">

          <div style={{ position: 'relative' }}>
            <User size={18} color="rgba(255,255,255,0.6)" style={iconPos} />
            <input
              type="text"
              className="slay1"
              placeholder="Full Name"
              autoComplete="name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <AtSign size={18} color="rgba(255,255,255,0.6)" style={iconPos} />
            <input
              type="text"
              className="slay1"
              placeholder="Username"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
              style={{ paddingLeft: 44 }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={18} color="rgba(255,255,255,0.6)" style={iconPos} />
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
            <Lock size={18} color="rgba(255,255,255,0.6)" style={iconPos} />
            <input
              type={showPass ? 'text' : 'password'}
              className="slay1"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingLeft: 44, paddingRight: 44 }}
            />
            <button onClick={() => setShowPass(p => !p)} style={eyePos}>
              {showPass
                ? <EyeOff size={18} color="rgba(255,255,255,0.6)" />
                : <Eye size={18} color="rgba(255,255,255,0.6)" />
              }
            </button>
          </div>

          {password.length > 0 && (() => {
            const score =
              (password.length >= 8 ? 1 : 0) +
              (/[a-z]/.test(password) ? 1 : 0) +
              (/[A-Z]/.test(password) ? 1 : 0) +
              (/[0-9]/.test(password) ? 1 : 0)
            const barColor = score <= 1 ? '#e74c3c' : score === 2 ? '#f39c12' : score === 3 ? '#2ecc71' : '#27ae60'
            const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong'
            const rules = [
              { ok: password.length >= 8, text: '8+ characters' },
              { ok: /[a-z]/.test(password), text: 'Lowercase letter' },
              { ok: /[A-Z]/.test(password), text: 'Capital letter' },
              { ok: /[0-9]/.test(password), text: 'Number' },
            ]
            return (
              <div style={{ padding: '0 2px 8px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', flex: 1, gap: 4 }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 5, borderRadius: 99,
                        background: i < score ? barColor : 'rgba(255,255,255,0.12)',
                        transition: 'background 0.35s ease',
                      }} />
                    ))}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, minWidth: 52, textAlign: 'right',
                    color: barColor, transition: 'color 0.35s ease',
                  }}>{label}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
                  {rules.map(({ ok, text }) => (
                    <span key={text} style={{
                      fontSize: 12, fontWeight: 600,
                      color: ok ? '#2ecc71' : 'rgba(231,76,60,0.8)',
                      transition: 'color 0.3s ease',
                    }}>
                      {ok ? '✓' : '✗'} {text}
                    </span>
                  ))}
                </div>
              </div>
            )
          })()}

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="rgba(255,255,255,0.6)" style={iconPos} />
            <input
              type={showConf ? 'text' : 'password'}
              className="slay1"
              placeholder="Confirm Password"
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{ paddingLeft: 44, paddingRight: 44 }}
            />
            <button onClick={() => setShowConf(p => !p)} style={eyePos}>
              {showConf
                ? <EyeOff size={18} color="rgba(255,255,255,0.6)" />
                : <Eye size={18} color="rgba(255,255,255,0.6)" />
              }
            </button>
          </div>

        </div>

        <button
          className="drip1 ghost1 chill box"
          onClick={handleRegister}
          disabled={spinning}
          style={spinning ? { opacity: 0.7 } : {}}
        >
          {spinning ? 'Creating account...' : 'Create Account'}
        </button>

        <div className={`${styles.vibe3} dope3 item`}>OR</div>

        <p className="dope3 item" style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#1a2a1a' }}>
          Sign up using
        </p>

        <div className="dope3 main">
          <SocialButtons />
        </div>

        <p className={`${styles.base2} dope3 main`}>
          Already have an account? <Link to="/signin">Sign in!</Link>
        </p>

      </div>
    </div>
  )
}
