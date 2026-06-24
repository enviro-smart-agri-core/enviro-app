import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Droplets, CloudRain, ShieldAlert, Cpu } from 'lucide-react'

const NOTIF_KEY = 'enviro_notifications'

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) || {} } catch { return {} }
}

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{ width: 48, height: 26, borderRadius: 999, background: on ? '#0f5c3a' : '#e0e0e0', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: 3, left: on ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
    </div>
  )
}

const groups = [
  {
    title: 'Farm Alerts',
    items: [
      { key: 'disease_alert',  Icon: ShieldAlert, label: 'Disease Alerts',    desc: 'Notify when disease is detected nearby' },
      { key: 'sensor_offline', Icon: Cpu,         label: 'Sensor Offline',    desc: 'Notify when a sensor goes offline' },
      { key: 'soil_low',       Icon: Droplets,    label: 'Low Soil Moisture', desc: 'Notify when soil moisture drops below safe level' },
    ],
  },
  {
    title: 'Weather',
    items: [
      { key: 'weather_storm', Icon: CloudRain, label: 'Storm Warnings', desc: 'Notify when a storm is approaching' },
      { key: 'weather_daily', Icon: Bell,      label: 'Daily Weather',  desc: "Morning summary of the day's forecast" },
    ],
  },
  {
    title: 'General',
    items: [
      { key: 'shop_orders', Icon: Bell, label: 'Order Updates', desc: 'Track your shop orders' },
      { key: 'app_updates', Icon: Bell, label: 'App Updates',   desc: 'New features and improvements' },
    ],
  },
]

export default function Notifications() {
  const nav = useNavigate()

  const [prefs, setPrefs] = useState(() => {
    const saved = loadPrefs()
    const defaults = {}
    groups.forEach(g => g.items.forEach(i => {
      defaults[i.key] = saved[i.key] !== undefined ? saved[i.key] : true
    }))
    return defaults
  })

  function toggle(key, val) {
    const updated = { ...prefs, [key]: val }
    setPrefs(updated)
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated))

  }

  return (
    <div className="page" style={{ background: '#fff' }}>

      <div style={{ background: '#0f5c3a', padding: '52px 20px 20px' }}>
        <button onClick={() => nav(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          <ArrowLeft size={16} strokeWidth={2.5} /> Back
        </button>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Notifications</h1>
      </div>

      <div className="content" style={{ paddingTop: 20 }}>
        {groups.map((group, gi) => (
          <div key={group.title} className="dope3" style={{ animationDelay: `${gi * 0.1}s` }}>
            <p className="stitle">{group.title}</p>
            <div className="mcard">
              {group.items.map(({ key, Icon, label, desc }, i) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < group.items.length - 1 ? '0.5px solid var(--br)' : 'none' }}>
                  <div style={{ width: 38, height: 38, background: 'var(--gp)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={19} color="#0f5c3a" strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a2a1a' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                  </div>
                  <Toggle on={prefs[key]} onChange={val => toggle(key, val)} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <p style={{ fontSize: 12, color: 'var(--mu)', textAlign: 'center', lineHeight: 1.6 }}>
          Push notifications require the app to be installed on your device.
        </p>
      </div>
    </div>
  )
}
