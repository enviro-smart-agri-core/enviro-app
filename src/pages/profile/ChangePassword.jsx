import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, ShieldCheck, LogOut } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'

export default function ChangePassword() {
  const nav = useNavigate()
  const { broForgotPwd, spinning, bro, yeetBro } = useAuthContext()

  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  async function handleSendLink() {
    setErr('')
    if (!bro?.email) return setErr('No email found for your account.')
    const ok = await broForgotPwd(bro.email)
    if (ok) setDone(true)
    else setErr('Failed to send reset link. Try again later.')
  }

  const backBtn  = { background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16 }

  if (done) {
    return (
      <div className="page" style={{ background: '#fff' }}>
        <div style={{ background: '#0f5c3a', padding: '52px 20px 20px' }}>
          <button onClick={() => { yeetBro(); nav('/signin', { replace: true }) }} style={backBtn}>
            <ArrowLeft size={16} strokeWidth={2.5} /> Back
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
          <div className="slay" style={{ width: 72, height: 72, background: '#e8f7ee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={36} color="#0f5c3a" strokeWidth={1.8} />
          </div>
          <h2 className="dope3 based" style={{ fontSize: 22, fontWeight: 800, color: '#0f5c3a', textAlign: 'center' }}>Link Sent</h2>
          <p className="dope3 mid" style={{ fontSize: 14, color: 'var(--mu)', textAlign: 'center', lineHeight: 1.6 }}>We've sent a password reset link to your email <b>{bro?.email}</b>.</p>
          <p className="dope3 box" style={{ fontSize: 13, color: '#e67e22', textAlign: 'center', fontWeight: 600 }}>For security reasons, you will now be logged out.</p>
          <button className="drip1 flex1 chill item" style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => { yeetBro(); nav('/signin', { replace: true }) }}>
            <LogOut size={16} strokeWidth={2} />
            Log Out & Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ background: '#fff' }}>
      <div style={{ background: '#0f5c3a', padding: '52px 20px 20px' }}>
        <button onClick={() => nav(-1)} style={backBtn}><ArrowLeft size={16} strokeWidth={2.5} /> Back</button>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Reset Password</h1>
      </div>

      <div className="content" style={{ paddingTop: 24 }}>
        <p className="dope3 based" style={{ fontSize: 15, color: '#4a6a4a', lineHeight: 1.5, marginBottom: 20 }}>
          To change your password securely, we will send a reset link to your registered email address.
        </p>

        <div className="dope3 mid" style={{ background: '#f7fbf8', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, border: '1px solid #d4e4d4' }}>
          <div style={{ background: '#e8f7ee', padding: 10, borderRadius: 10 }}>
            <Mail size={20} color="#0f5c3a" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Email</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a2a1a', marginTop: 2 }}>{bro?.email || 'Unknown'}</div>
          </div>
        </div>

        {err && (
          <div className="dope3 box" style={{ padding: '12px 16px', background: '#fff0f0', borderRadius: 12, border: '1px solid #f5c6c6', fontSize: 14, color: '#c0392b', fontWeight: 600, marginBottom: 20 }}>
            {err}
          </div>
        )}

        <button className="drip1 flex1 chill box" onClick={handleSendLink} disabled={spinning} style={{ opacity: spinning ? 0.7 : 1 }}>
          {spinning ? 'Sending...' : 'Send Reset Link'}
        </button>
      </div>
    </div>
  )
}
