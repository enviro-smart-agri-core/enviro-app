import { MapPin, Camera, Images, Leaf } from 'lucide-react'
import { usePermissions } from '../context/PermissionsContext'

const permissionItems = [
  {
    Icon: MapPin,
    title: 'Location',
    desc: 'Shows real weather for your farm so you know when it is safe to water or harvest.',
  },
  {
    Icon: Camera,
    title: 'Camera',
    desc: 'Needed for the Disease Scan feature — take a photo of your plant to detect diseases.',
  },
  {
    Icon: Images,
    title: 'Photos',
    desc: 'So you can pick a photo from your gallery for scanning if you prefer.',
  },
]

export default function Permissions() {
  const { vibe, askNicely, nvm } = usePermissions()

  const isAsking = vibe === 'asking'

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 28px',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          background: '#e8f7ee',
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Leaf size={40} color="#0f5c3a" strokeWidth={1.8} />
      </div>

      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#0f5c3a',
          textAlign: 'center',
          marginBottom: 10,
        }}
      >
        Before we start
      </h1>

      <p
        style={{
          fontSize: 15,
          color: '#4a6a4a',
          textAlign: 'center',
          lineHeight: 1.65,
          marginBottom: 32,
        }}
      >
        Enviro needs a couple of permissions to work properly.
        We only use them to help your farm.
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {permissionItems.map(({ Icon, title, desc }) => (
          <div
            key={title}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              background: '#e8f7ee',
              borderRadius: 16,
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: '#fff',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={20} color="#0f5c3a" strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f5c3a', marginBottom: 4 }}>
                {title}
              </div>
              <div style={{ fontSize: 13, color: '#4a6a4a', lineHeight: 1.5 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="drip1 flex1"
        onClick={askNicely}
        disabled={isAsking}
        style={{ opacity: isAsking ? 0.7 : 1 }}
      >
        {isAsking ? 'Requesting permissions...' : 'Allow Permissions'}
      </button>

      <button
        onClick={nvm}
        disabled={isAsking}
        style={{
          marginTop: 14,
          background: 'none',
          border: 'none',
          fontSize: 14,
          color: '#8aaa8a',
          cursor: 'pointer',
          padding: 8,
          fontWeight: 600,
        }}
      >
        Skip for now
      </button>

      <p
        style={{
          fontSize: 12,
          color: '#b0c0b0',
          textAlign: 'center',
          marginTop: 20,
          lineHeight: 1.6,
        }}
      >
        You can change permissions anytime in your phone settings.
      </p>
    </div>
  )
}
