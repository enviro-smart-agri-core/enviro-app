import { useState, useRef } from 'react'
import {
  Camera, FolderOpen, RotateCcw, ScanLine,
  ShieldAlert, X, ChevronDown, Leaf,
  AlertTriangle, CheckCircle, Info,
  Zap, Shield, BookOpen, Stethoscope,
} from 'lucide-react'
import BottomNav from '../components/BottomNav'
import { runDiagnosis } from '../api/diagnosis'
import styles from '../styles/Scan.module.css'

const PLANT_TYPES = [
  'tomato',
  'potato',
  'strawberry',
]

const chipStyle = {
  healthy: { bg: '#d4f0e0', color: '#0f5c3a', icon: CheckCircle },
  disease: { bg: '#fee2e2', color: '#991b1b', icon: AlertTriangle },
}

function DetailBlock({ Icon, label, text, color = '#1a2a1a' }) {
  if (!text) return null
  return (
    <div style={{
      background: '#f7fbf8', borderRadius: 14,
      padding: '14px 16px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: '#e8f7ee',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={15} color="#0f5c3a" strokeWidth={2} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: 14, color, lineHeight: 1.65, margin: 0 }}>{text}</p>
    </div>
  )
}

export default function Scan() {
  const [scanStep, setScanStep] = useState('idle')
  const [plantPic, setPlantPic] = useState(null)
  const [plantFile, setPlantFile] = useState(null)
  const [diagResult, setDiagResult] = useState(null)
  const [borkMsg, setBorkMsg] = useState(null)
  const [plantType, setPlantType] = useState('tomato')

  const cameraInput = useRef(null)
  const galleryInput = useRef(null)

  function openChooser() { setScanStep('chooser') }
  function openCamera() { setScanStep('idle'); cameraInput.current?.click() }
  function openGallery() { setScanStep('idle'); galleryInput.current?.click() }

  function onFileSelected(e) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setPlantFile(picked)
    const reader = new FileReader()
    reader.onload = ev => { setPlantPic(ev.target.result); setScanStep('preview') }
    reader.readAsDataURL(picked)
    e.target.value = ''
  }

  async function diagnosePlant() {
    setScanStep('thinking')
    setBorkMsg(null)
    try {
      console.log('[Scan] starting for:', plantType)
      const result = await runDiagnosis(plantFile, plantType)
      console.log('[Scan] result:', result)
      setDiagResult(result)
      setScanStep('done')
    } catch (err) {
      console.error('[Scan] failed:', err.message)
      setBorkMsg(err.message)
      setScanStep('preview')
    }
  }

  function startOver() {
    setScanStep('idle')
    setPlantPic(null)
    setPlantFile(null)
    setDiagResult(null)
    setBorkMsg(null)
  }

  const isHealthy = diagResult && !diagResult.disease
  const chip = isHealthy ? chipStyle.healthy : chipStyle.disease
  const ChipIcon = chip?.icon || CheckCircle

  return (
    <div className="page">

      <div className="grid drip4">
        <h1>Disease Scan</h1>
        <p>Provide accurate photo for accurate results.</p>
      </div>

      <div className="content">
        <div className="col dope3 based">

          <input ref={cameraInput} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onFileSelected} />
          <input ref={galleryInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileSelected} />

          {scanStep === 'idle' && (
            <div className={styles.base3} onClick={openChooser}>
              <Camera size={52} color="#0f5c3a" strokeWidth={1.4} />
              <span style={{ fontSize: 18, fontWeight: 700, color: '#0f5c3a' }}>Tap to Scan</span>
              <span style={{ fontSize: 12, color: 'var(--mu)' }}>Camera or pick from gallery</span>
            </div>
          )}

          {scanStep === 'chooser' && (
            <div className="slay">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1a2a1a' }}>Choose source</span>
                <button onClick={() => setScanStep('idle')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={18} color="var(--mu)" strokeWidth={2} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={openCamera} style={{ flex: 1, padding: '22px 12px', background: '#e8f7ee', border: '2px solid #0f5c3a', borderRadius: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#0f5c3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={26} color="white" strokeWidth={1.8} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f5c3a' }}>Camera</div>
                    <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>Take a photo now</div>
                  </div>
                </button>
                <button onClick={openGallery} style={{ flex: 1, padding: '22px 12px', background: '#f7f9f7', border: '2px solid #dde', borderRadius: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderOpen size={26} color="#555" strokeWidth={1.8} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>Gallery</div>
                    <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>Pick from files</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {scanStep === 'preview' && (
            <div className="dope3">
              <img src={plantPic} alt="Plant" style={{ width: '100%', borderRadius: 14, objectFit: 'cover', maxHeight: 250, marginBottom: 14 }} />

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--mu)', display: 'block', marginBottom: 6 }}>
                  What plant is this?
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={plantType}
                    onChange={e => setPlantType(e.target.value)}
                    style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', border: '1.5px solid #d4e4d4', borderRadius: 12, padding: '11px 40px 11px 14px', fontSize: 14, fontFamily: 'inherit', background: '#fafafa', color: '#1a2a1a', outline: 'none', cursor: 'pointer' }}
                  >
                    {PLANT_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </select>
                  <ChevronDown size={16} color="#888" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              {borkMsg && (
                <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>⚠️ {borkMsg}</p>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="drip1 bussin1" style={{ flex: 1 }} onClick={openChooser}>
                  <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Retake
                </button>
                <button className="drip1 flex1" style={{ flex: 2 }} onClick={diagnosePlant}>
                  <ScanLine size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Analyze Plant
                </button>
              </div>
            </div>
          )}

          {scanStep === 'thinking' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
              {plantPic && (
                <img src={plantPic} alt="Analyzing" style={{ width: 110, height: 110, borderRadius: 12, objectFit: 'cover', opacity: 0.65, marginBottom: 4 }} />
              )}
              <div className="grid1" />
              <p style={{ fontSize: 14, color: 'var(--mu)', fontWeight: 600 }}>Analyzing your {plantType}...</p>
              <p style={{ fontSize: 12, color: 'var(--mu)', textAlign: 'center', lineHeight: 1.6 }}>
                AI is scanning for diseases.{'\n'}This usually takes 10–30 seconds.
              </p>
            </div>
          )}

          {scanStep === 'done' && diagResult && (
            <div className="dope3">

              {plantPic && (
                <img src={plantPic} alt="Result" style={{ width: '100%', borderRadius: 14, objectFit: 'cover', maxHeight: 200, marginBottom: 16 }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1, paddingRight: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mu)', marginBottom: 4 }}>
                    Scan Result
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: chip.color, lineHeight: 1.2 }}>
                    {diagResult.name}
                  </p>
                </div>

              </div>

              {diagResult.disease && (
                <div style={{
                  background: '#fff0f0', border: '1px solid #f5c6c6',
                  borderRadius: 12, padding: '10px 14px',
                  marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <AlertTriangle size={16} color="#c0392b" strokeWidth={2} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#c0392b' }}>
                    {diagResult.disease.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </div>
              )}

              {diagResult.gameStatus && (
                <div style={{
                  background: 'linear-gradient(135deg, #0a3d25, #1a6640)',
                  borderRadius: 12, padding: '10px 14px',
                  marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Zap size={15} color="#7aef9a" strokeWidth={2.5} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                    {diagResult.gameStatus}
                  </span>
                </div>
              )}

              <DetailBlock Icon={Info} label="What's happening" text={diagResult.cause} />
              <DetailBlock Icon={BookOpen} label="Description" text={diagResult.description} />
              <DetailBlock Icon={Stethoscope} label="Treatment" text={diagResult.treatment} color="#0f5c3a" />
              <DetailBlock Icon={Shield} label="Prevention" text={diagResult.prevention} />

              {!diagResult.cause && !diagResult.description && !diagResult.treatment && diagResult.advice && (
                <DetailBlock Icon={Leaf} label="Advice" text={diagResult.advice} />
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button className="drip1 bussin1" style={{ flex: 1 }} onClick={startOver}>
                  <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Scan Again
                </button>
                <button className="drip1 flex1" style={{ flex: 1 }} onClick={openChooser}>
                  <Camera size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />New Photo
                </button>
              </div>
            </div>
          )}

        </div>

        {scanStep !== 'done' && (
          <div className={`${styles.core3} dope3 mid`} style={{ background: '#f7fbf8', border: '1px solid #d4e4d4', borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info size={24} color="#0f5c3a" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: 15, display: 'block', marginBottom: 6, color: '#1a2a1a' }}>Photo Instructions</strong>
              <ul style={{ fontSize: 13, color: '#4a6a4a', paddingLeft: 18, margin: 0, lineHeight: 1.6 }}>
                <li>Make sure the picture looks good and clear.</li>
                <li>Avoid low quality or blurry shots.</li>
                <li>Take it in a bright spot, not in the dark.</li>
              </ul>

            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
