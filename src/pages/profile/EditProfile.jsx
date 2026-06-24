import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Save, Camera, UserCircle } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'

const fadeUpStyle = (delay = 0) => ({
  animation: `fadeUp 0.42s cubic-bezier(0.25, 0.8, 0.25, 1) ${delay}s both`,
})

export default function EditProfile() {
  const nav = useNavigate()
  const { bro, tweakBro, swapBroAvatar, spinning } = useAuthContext()

  const [name,     setName]     = useState(bro?.name  || '')
  const [email,    setEmail]    = useState(bro?.email || '')
  const [preview,  setPreview]  = useState(bro?.avatar || null)
  const [saved,    setSaved]    = useState(false)
  const [photoErr, setPhotoErr] = useState('')

  const fileInput = useRef(null)

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoErr('')

    if (!file.type.startsWith('image/')) {
      setPhotoErr('Please pick an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoErr('Image too large — pick something under 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = async ev => {
      const base64 = ev.target.result
      setPreview(base64)
      await swapBroAvatar(base64)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleSave() {
    if (!name.trim() || !email.trim()) return
    const ok = await tweakBro(name.trim(), email.trim())
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="page" style={{ background: '#fff' }}>

      {}
      <div style={{ background: '#0f5c3a', padding: '52px 20px 20px', flexShrink: 0 }}>
        <button
          onClick={() => nav(-1)}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16 }}
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> Back
        </button>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Edit Profile</h1>
      </div>

      <div className="content" style={{ paddingTop: 24 }}>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8, ...fadeUpStyle(0.05) }}>
          <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />

          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <div
              onClick={() => fileInput.current?.click()}
              style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid #0f5c3a', overflow: 'hidden', background: '#e8f7ee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {preview
                ? <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <UserCircle size={56} color="#0f5c3a" strokeWidth={1.2} />
              }
            </div>

            <div
              onClick={() => fileInput.current?.click()}
              style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, background: '#0f5c3a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2.5px solid white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
            >
              <Camera size={13} color="white" strokeWidth={2.2} />
            </div>
          </div>

          <p
            onClick={() => fileInput.current?.click()}
            style={{ fontSize: 13, color: '#0f5c3a', fontWeight: 600, marginTop: 12, cursor: 'pointer' }}
          >
            Change Photo
          </p>

          {photoErr && (
            <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 4, textAlign: 'center' }}>{photoErr}</p>
          )}
        </div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div style={fadeUpStyle(0.12)}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--tm)', marginBottom: 8, display: 'block' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={17} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="slay1"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>

          {}
          <div style={fadeUpStyle(0.18)}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--tm)', marginBottom: 8, display: 'block' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="slay1"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                autoComplete="email"
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>

        </div>

        {}
        {saved && (
          <div style={{ padding: '12px 16px', background: '#e8f7ee', borderRadius: 12, border: '1px solid #b2dfd0', fontSize: 14, fontWeight: 600, color: '#0f5c3a', display: 'flex', alignItems: 'center', gap: 8, animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.3, 0.64, 1) both' }}>
            <Save size={16} strokeWidth={2.5} /> Saved!
          </div>
        )}

        {}
        <button
          className="drip1 flex1"
          onClick={handleSave}
          disabled={spinning}
          style={{ opacity: spinning ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...fadeUpStyle(0.24) }}
        >
          <Save size={17} strokeWidth={2} />
          {spinning ? 'Saving...' : 'Save Changes'}
        </button>

      </div>
    </div>
  )
}
