import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

const faqs = [
  { q: 'How does the weather card work?',     a: 'The app uses your GPS to get your location, then fetches live data from Open-Meteo — a free weather API. If GPS is denied or slow, it falls back to Cairo. Weather refreshes every 15 minutes.' },
  { q: 'How do I add a sensor device?',       a: 'Go to the Sensors tab and tap "Add Device". Your device needs to be on WiFi and paired with the backend. Ask your system admin for the pairing key.' },
  { q: 'Why is my sensor showing offline?',   a: 'Check the sensor is powered on and on the correct WiFi network. Try restarting the sensor device.' },
  { q: 'How does the Disease Scan work?',     a: 'Tap the camera icon in the Scan tab, take a clear photo of the leaf, and tap Analyze. The image goes to the backend for AI analysis. Make sure the photo is well-lit.' },
  { q: 'Is my data secure?',                  a: 'Yes. All communication uses HTTPS. Passwords are hashed on the server. Authentication uses JWT tokens.' },
  { q: 'How do I reset my password?',         a: 'Go to Profile > Change Password. You need your current password. If you forgot it, use the Forgot Password link on Sign In.' },
  { q: 'Can I use the app offline?',          a: 'Sensor readings on your local network may work offline. Weather, disease scan, and shop need internet.' },
]

function FaqItem({ q, a, delay }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="dope3" style={{ borderBottom: '0.5px solid var(--br)', overflow: 'hidden', animationDelay: `${delay}s` }}>
      <div onClick={() => setOpen(p => !p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', cursor: 'pointer', background: open ? 'var(--gp)' : 'white' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2a1a', flex: 1, paddingRight: 12, lineHeight: 1.4 }}>{q}</span>
        {open ? <ChevronUp size={18} color="var(--gd)" strokeWidth={2} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color="var(--mu)" strokeWidth={2} style={{ flexShrink: 0 }} />}
      </div>
      {open && (
        <div style={{ padding: '0 18px 16px', fontSize: 13, color: 'var(--tm)', lineHeight: 1.65, background: 'var(--gp)' }}>{a}</div>
      )}
    </div>
  )
}

export default function HelpCenter() {
  const nav = useNavigate()
  return (
    <div className="page" style={{ background: '#fff' }}>
      <div style={{ background: '#0f5c3a', padding: '52px 20px 20px' }}>
        <button onClick={() => nav(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          <ArrowLeft size={16} strokeWidth={2.5} /> Back
        </button>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Help Center</h1>
      </div>

      <div className="content" style={{ paddingTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <HelpCircle size={20} color="#0f5c3a" strokeWidth={1.8} />
          <p className="stitle" style={{ margin: 0 }}>Frequently Asked Questions</p>
        </div>
        <div className="mcard" style={{ overflow: 'hidden' }}>
          {faqs.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} delay={i * 0.05} />)}
        </div>
        <div className="col dope3" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--tm)', marginBottom: 12, lineHeight: 1.6 }}>
            Can't find what you're looking for? Talk to our support team.
          </p>
          <button className="drip1 flex1" onClick={() => nav('/profile/chat')}>Chat with Support</button>
        </div>
      </div>
    </div>
  )
}
