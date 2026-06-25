import { useState, useRef, useEffect } from 'react'
import {
  Camera, FolderOpen, RotateCcw, ScanLine,
  ShieldAlert, X, ChevronDown, Leaf,
  AlertTriangle, CheckCircle, Info,
  Zap, Shield, BookOpen, Stethoscope, ChevronRight,
} from 'lucide-react'
import BottomNav from '../components/BottomNav'
import { runDiagnosis } from '../api/diagnosis'
import { plantApi } from '../api/plant'
import styles from '../styles/Scan.module.css'
import { ENV } from '../config/env'

const chipStyle = {
  healthy: { bg: '#d4f0e0', color: '#0f5c3a', icon: CheckCircle },
  disease: { bg: '#fee2e2', color: '#991b1b', icon: AlertTriangle },
}

/**
 * Maps a disease name from the AI result → avatar image (1–8)
 * 1 – Healthy Hero   2 – Suffocated (fungal)   3 – Melting (bacterial)
 * 4 – Glitch (viral) 5 – Itchy (pests)         6 – Thirsty (water/physio)
 * 7 – Hungry (nutrient)  8 – Sore (environmental)
 */
function getDiseaseImage(diagResult) {
  if (!diagResult) return 4
  if (!diagResult.disease) return 1 // healthy

  const d = (diagResult.disease || '').toLowerCase().replace(/_/g, ' ')

  // 2 – Fungal
  if (d.includes('powdery') || d.includes('mildew') || d.includes('blight')
    || d.includes('gray mold') || d.includes('grey mold') || d.includes('scorch')
    || d.includes('gray spot') || d.includes('grey spot') || d.includes('target spot')
    || d.includes('leaf scorch') || d.includes('rust') || d.includes('fungal')) return 2

  // 3 – Bacterial
  if (d.includes('bacterial') || d.includes('soft rot') || d.includes('common scab')
    || d.includes('angular') || d.includes('fire blight') || d.includes('canker')
    || d.includes('bacterial spot') || d.includes('rot')) return 3

  // 4 – Viral
  if (d.includes('virus') || d.includes('viral') || d.includes('mosaic')
    || d.includes('curl') || d.includes('pstvd') || d.includes('plrv')
    || d.includes('yellow leaf') || d.includes('leaf curl')) return 4

  // 5 – Pests / Insects
  if (d.includes('tuta') || d.includes('spider') || d.includes('mite')
    || d.includes('insect') || d.includes('nematode') || d.includes('pest')
    || d.includes('mining') || d.includes('aphid') || d.includes('whitefly')) return 5

  // 6 – Water / Physiological
  if (d.includes('cracking') || d.includes('blossom end') || d.includes('blossom')
    || d.includes('water') || d.includes('drought') || d.includes('wilting')) return 6

  // 7 – Nutrient deficiency
  if (d.includes('nutrient') || d.includes('deficien') || d.includes('chlorosis')
    || d.includes('calcium') || d.includes('magnesium') || d.includes('nitrogen')
    || d.includes('yellow') || d.includes('hungry')) return 7

  // 8 – Environmental / root / bruising
  if (d.includes('root') || d.includes('scurf') || d.includes('bruising')
    || d.includes('anthocyan') || d.includes('catface') || d.includes('pink rot')
    || d.includes('blackspot') || d.includes('environmental') || d.includes('sore')) return 8

  return 3 // default: melting (unclassified disease)
}

const SCAN_AVATAR_LABELS = {
  1: 'Healthy',
  2: 'Fungal Disease',
  3: 'Bacterial Disease',
  4: 'Viral Disease',
  5: 'Pest Infestation',
  6: 'Water Stress',
  7: 'Nutrient Deficiency',
  8: 'Environmental Stress',
}

// Actual filenames in /public/images/plants/
const SCAN_IMG = {
  1: 'healthy.png',
  2: 'The Suffocated.png',
  3: 'melting.png',
  4: 'glitch.png',
  5: 'itchy.png',
  6: 'thirsty.png',
  7: 'hungry.png',
  8: 'sore.png',
}

const SCAN_AVATAR_COLORS = {
  1: { bg: 'linear-gradient(135deg,#d4f0e0,#a8e6c0)', border: '#27ae60', color: '#0a4a28' },
  2: { bg: 'linear-gradient(135deg,#f0f0f0,#d8d8d8)', border: '#7f8c8d', color: '#3a3a3a' },
  3: { bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', border: '#388e3c', color: '#1b5e20' },
  4: { bg: 'linear-gradient(135deg,#fff9c4,#fff176)', border: '#f9a825', color: '#5a4800' },
  5: { bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', border: '#e67e22', color: '#6a3a00' },
  6: { bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', border: '#1e88e5', color: '#0a3a6a' },
  7: { bg: 'linear-gradient(135deg,#fffde7,#fff9c4)', border: '#f9a825', color: '#5a4000' },
  8: { bg: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', border: '#8e24aa', color: '#4a0072' },
}


function getImageUrl(url) {
  if (!url) return '/images/leaf.png'
  if (url.startsWith('http')) return url
  return `${ENV.API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
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

  // Plant selection state
  const [myPlants, setMyPlants] = useState([])
  const [plantsLoading, setPlantsLoading] = useState(true)
  const [selectedPlant, setSelectedPlant] = useState({ _plantType: 'generic', plantType: 'tomato' })
  const [showPlantPicker, setShowPlantPicker] = useState(false)


  const cameraInput = useRef(null)
  const galleryInput = useRef(null)

  // Load user's plants on mount
  useEffect(() => {
    async function loadPlants() {
      try {
        const res = await plantApi.getAll()
        const list = res.data?.plants || res.data || res.plants || (Array.isArray(res) ? res : [])
        setMyPlants(list)
      } catch {
        setMyPlants([])
      } finally {
        setPlantsLoading(false)
      }
    }
    loadPlants()
  }, [])


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
      // Generic type selection → no plantId, just the type
      // My plant selection → has _id and plantType
      const isGeneric = selectedPlant?._plantType === 'generic'
      const plantType = (selectedPlant?.plantType || 'tomato').toLowerCase().trim()
      const plantId   = isGeneric ? null : (selectedPlant?._id || selectedPlant?.id || null)

      console.log('[Scan] starting for:', plantType, 'plantId:', plantId, 'generic:', isGeneric)
      const result = await runDiagnosis(plantFile, plantType, plantId)
      console.log('[Scan] result:', result)
      setDiagResult(result)
      setScanStep('done')

      // Only save game state if linked to a specific plant
      if (plantId) {
        const imgNum = getDiseaseImage(result)
        try {
          localStorage.setItem(`enviro_scan_state_${plantId}`, JSON.stringify({
            imgNum,
            gameStatus: result.gameStatus || SCAN_AVATAR_LABELS[imgNum],
            label:      SCAN_AVATAR_LABELS[imgNum],
            disease:    result.disease || null,
            timestamp:  Date.now(),
          }))
        } catch {}
      }
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

          {/* ── Plant Selector Dropdown ── */}
          {(scanStep === 'idle' || scanStep === 'preview') && (() => {
            const displayName = selectedPlant
              ? (selectedPlant._plantType === 'generic'
                  ? selectedPlant.plantType.charAt(0).toUpperCase() + selectedPlant.plantType.slice(1)
                  : (selectedPlant.plantName || selectedPlant.plantType))
              : 'Select plant'
            const displaySub = selectedPlant
              ? (selectedPlant._plantType === 'generic'
                  ? 'General scan — no plant linked'
                  : `${selectedPlant.plantType} · ${selectedPlant.daysOld ?? 0} days old`)
              : 'Choose plant type or one of your plants'

            return (
              <div style={{ marginBottom: 14, position: 'relative' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  Scanning which plant?
                </div>

                {/* Selector button */}
                <button
                  onClick={() => setShowPlantPicker(v => !v)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    background: '#f7fbf8', border: '1.5px solid #d4e4d4', borderRadius: 14,
                    padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                    background: '#e8f7ee', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selectedPlant?._plantType !== 'generic' && selectedPlant?.pictureUrl
                      ? <img src={getImageUrl(selectedPlant.pictureUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Leaf size={20} color="#0f5c3a" strokeWidth={1.8} />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2a1a' }}>{displayName}</div>
                    <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 1 }}>{displaySub}</div>
                  </div>
                  <ChevronDown size={16} color="#888" style={{ transform: showPlantPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {/* Dropdown */}
                {showPlantPicker && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                    border: '1.5px solid #e0e8e0', zIndex: 200, overflow: 'hidden',
                    maxHeight: 320, overflowY: 'auto',
                  }}>
                    {/* Group 1: Plant Type */}
                    <div style={{ padding: '10px 14px 6px', fontSize: 10, fontWeight: 800, color: '#0f5c3a', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#f0faf5' }}>
                      Plant Type
                    </div>
                    {['tomato', 'strawberry', 'potato'].map(type => {
                      const isSelected = selectedPlant?._plantType === 'generic' && selectedPlant?.plantType === type
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            setSelectedPlant({ _plantType: 'generic', plantType: type })
                            setShowPlantPicker(false)
                          }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                            background: isSelected ? '#e8f7ee' : 'white',
                            border: 'none', borderBottom: '1px solid #f0f4f0',
                            padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e8f7ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Leaf size={17} color="#0f5c3a" strokeWidth={1.8} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#0f5c3a' : '#1a2a1a' }}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 1 }}>General scan</div>
                          </div>
                          {isSelected && <CheckCircle size={15} color="#0f5c3a" strokeWidth={2.5} />}
                        </button>
                      )
                    })}

                    {/* Group 2: My Plants */}
                    <div style={{ padding: '10px 14px 6px', fontSize: 10, fontWeight: 800, color: '#0f5c3a', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#f0faf5', borderTop: '1.5px solid #e0e8e0' }}>
                      My Plants
                    </div>
                    {plantsLoading ? (
                      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="grid1" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        <span style={{ fontSize: 13, color: 'var(--mu)' }}>Loading...</span>
                      </div>
                    ) : myPlants.length === 0 ? (
                      <div style={{ padding: '12px 14px', fontSize: 13, color: '#bbb' }}>No plants saved yet</div>
                    ) : myPlants.map(p => {
                      const pid = p._id || p.id
                      const isSelected = selectedPlant?._plantType !== 'generic' && (selectedPlant?._id || selectedPlant?.id) === pid
                      return (
                        <button
                          key={pid}
                          onClick={() => { setSelectedPlant(p); setShowPlantPicker(false) }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                            background: isSelected ? '#e8f7ee' : 'white',
                            border: 'none', borderBottom: '1px solid #f0f4f0',
                            padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', background: '#e8f7ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {p.pictureUrl
                              ? <img src={getImageUrl(p.pictureUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <Leaf size={17} color="#0f5c3a" strokeWidth={1.8} />
                            }
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#0f5c3a' : '#1a2a1a' }}>
                              {p.plantName || p.plantType}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 1 }}>
                              {p.plantType} · {p.daysOld ?? 0} days old
                            </div>
                          </div>
                          {isSelected && <CheckCircle size={15} color="#0f5c3a" strokeWidth={2.5} />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}


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
              <p style={{ fontSize: 14, color: 'var(--mu)', fontWeight: 600 }}>
                Analyzing your {selectedPlant?.plantName || selectedPlant?.plantType || 'plant'}...
              </p>
              <p style={{ fontSize: 12, color: 'var(--mu)', textAlign: 'center', lineHeight: 1.6 }}>
                AI is scanning for diseases.{'\n'}This usually takes 10–30 seconds.
              </p>
            </div>
          )}

          {scanStep === 'done' && diagResult && (
            <div className="dope3">



              {plantPic && (
                <img src={plantPic} alt="Result" style={{ width: '100%', borderRadius: 14, objectFit: 'cover', maxHeight: 160, marginBottom: 12 }} />
              )}

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
                <DetailBlock Icon={Zap} label="Game State" text={diagResult.gameStatus} color="#0a4a28" />
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
