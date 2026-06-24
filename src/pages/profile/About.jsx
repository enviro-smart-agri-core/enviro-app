import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Leaf, Globe, Github, Mail } from 'lucide-react'

export default function About() {
  const nav = useNavigate()

  return (
    <div className="page" style={{ background: '#fff' }}>
      <div style={{ background: '#0f5c3a', padding: '52px 20px 20px' }}>
        <button onClick={() => nav(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          <ArrowLeft size={16} strokeWidth={2.5} /> Back
        </button>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>About</h1>
      </div>

      <div className="content" style={{ paddingTop: 24 }}>

        <div className="slay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 12 }}>
          <div style={{ width: 80, height: 80, background: '#e8f7ee', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={42} color="#0f5c3a" strokeWidth={1.6} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f5c3a' }}>Enviro</div>
            <div style={{ fontSize: 13, color: 'var(--mu)', marginTop: 4 }}>Version 1.0.0</div>
          </div>
        </div>

        <div className="col dope3 based">
          <p style={{ fontSize: 14, color: 'var(--tm)', lineHeight: 1.7 }}>
            Enviro is a smart garden management app that helps you monitor your plants,
            control your irrigation, detect plant diseases, and stay on top of weather
            conditions all from your phone.
          </p>
        </div>

        <div className="mcard dope3 mid">
          {[
            { label: 'Version',       value: '1.0.0' },
            { label: 'Build',         value: '2026.05.16' },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: i < arr.length - 1 ? '0.5px solid var(--br)' : 'none' }}>
              <span style={{ fontSize: 15, color: 'var(--tm)' }}>{label}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1a2a1a' }}>{value}</span>
            </div>
          ))}
        </div>

        <p className="dope3 item" style={{ fontSize: 12, color: 'var(--mu)', textAlign: 'center', lineHeight: 1.6 }}>
          Made with care for gardeners everywhere.
        </p>
      </div>
    </div>
  )
}
