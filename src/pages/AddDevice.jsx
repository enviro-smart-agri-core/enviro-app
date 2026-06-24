import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Cpu, Camera, Plus, VideoOff } from 'lucide-react'
import styles from '../styles/AddDevice.module.css'
import { createPlantWithSensor, checkHardwareId } from '../api/plantDevice'

export default function AddDevice() {
  const nav = useNavigate()
  const [currentStepVibe, setCurrentStepVibe] = useState(1)
  const [isPairingRN, setIsPairingRN] = useState(false)
  const [isSubmittingFr, setIsSubmittingFr] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [scanError, setScanError] = useState('')

  const camRef = useRef(null)
  const [camStream, setCamStream] = useState(null)
  const [isCamLive, setIsCamLive] = useState(false)
  const [camBusted, setCamBusted] = useState(false)

  const [plantPic, setPlantPic] = useState(null)
  const [plantPicFile, setPlantPicFile] = useState(null)
  const [plantMoniker, setPlantMoniker] = useState('')
  const [plantVibeAge, setPlantVibeAge] = useState('')
  const [plantMainType, setPlantMainType] = useState('tomato')
  const [customVibeType, setCustomVibeType] = useState('')

  const [scannedHardwareId, setScannedHardwareId] = useState('')
  const [hwCheckResult, setHwCheckResult] = useState(null)

  const handlePicSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPlantPicFile(file)
      const imgUrl = URL.createObjectURL(file)
      setPlantPic(imgUrl)
    }
  }

  const goNextStep = () => setCurrentStepVibe(2)
  const goBackStep = () => {
    if (currentStepVibe === 1) nav(-1)
    else setCurrentStepVibe(currentStepVibe - 1)
  }

  const fakeScanVibe = async () => {
    killCam()
    setScanError('')
    setIsPairingRN(true)

    const hwId = scannedHardwareId.trim() || 'ESP32_Test'
    setScannedHardwareId(hwId)

    const result = await checkHardwareId(hwId)
    setHwCheckResult(result)

    setTimeout(() => {
      setIsPairingRN(false)
      setCurrentStepVibe(3)
    }, 1500)
  }

  const yeetToBackendFr = async () => {
    setIsSubmittingFr(true)
    setSubmitError('')
    try {
      const finalType = plantMainType === 'other' ? customVibeType.trim() || 'other' : plantMainType
      await createPlantWithSensor({
        plantType:      finalType,
        plantName:      plantMoniker.trim() || finalType,
        initialAgeDays: parseInt(plantVibeAge) || 0,
        plantPicFile,
        hardwareId:     scannedHardwareId.trim(),
      })
      nav('/sensors')
    } catch (err) {
      setSubmitError(err.message || 'Failed to create plant. Please try again.')
    } finally {
      setIsSubmittingFr(false)
    }
  }

  const sparkCam = async () => {
    try {
      setCamBusted(false)
      const streamObj = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setCamStream(streamObj)
      setIsCamLive(true)
      if (camRef.current) {
        camRef.current.srcObject = streamObj
      }
    } catch (err) {
      console.error("Camera busted fr:", err)
      setCamBusted(true)
    }
  }

  const killCam = () => {
    if (camStream) {
      camStream.getTracks().forEach(track => track.stop())
      setCamStream(null)
      setIsCamLive(false)
    }
  }

  useEffect(() => {
    if (currentStepVibe !== 2) killCam()
    return () => killCam()
  }, [currentStepVibe])

  return (
    <div className={`page ${styles.col1}`}>

      <div className={styles.btn1} />
      <div className={styles.top1} />

      <div className={styles.bot1}>
        <button onClick={goBackStep} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} color="#1a2a1a" />
        </button>
        <span className={styles.left1}>
          {currentStepVibe === 1 && 'Add Sensor'}
          {currentStepVibe === 2 && 'Scan QR Code'}
          {currentStepVibe === 3 && 'Add Plant Data'}
        </span>
      </div>

      <div className={`content ${styles.right1}`}>

        {currentStepVibe === 1 && (
          <div className={`dope3 ${styles.surface1}`}>
            <div className={styles.base1}>
              <div className={styles.core1}>
                <div className={styles.pulseRing1}></div>
                <div className={styles.pulseRing2}></div>
                <div className={styles.iconWrapper}>
                  <Cpu size={60} color="#0f5c3a" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className={styles.vibe2}>Connect New Sensor</h2>
              <p className={styles.drip2}>
                Get your new Enviro sensor ready. Ensure it is powered on and the LED is on.
              </p>
            </div>

            <div className={styles.bet2}>
              <button className="drip1 bussin1" onClick={() => nav(-1)} style={{ flex: 1 }}>Cancel</button>
              <button className="drip1 flex1" onClick={goNextStep} style={{ flex: 1 }}>Next</button>
            </div>
          </div>
        )}

        {currentStepVibe === 2 && (
          <div className={`dope3 ${styles.surface1}`}>
            <div className={styles.base1}>
              <p className={styles.goat2}>
                Point your camera at the QR code on the back of the device to pair it.
              </p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--mu)', display: 'block', marginBottom: 6 }}>
                  Or enter Hardware ID manually:
                </label>
                <input
                  type="text"
                  className="slay1"
                  placeholder="e.g., ESP32_WIFI_01"
                  value={scannedHardwareId}
                  onChange={e => setScannedHardwareId(e.target.value)}
                  style={{ fontSize: 14 }}
                />
              </div>

              <div className={styles.flex2} style={{ background: isCamLive ? '#000' : 'rgba(255,255,255,0.4)' }}>
                {isCamLive ? (
                  <video
                    ref={camRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    {camBusted ? (
                      <VideoOff size={44} color="#e74c3c" opacity={0.8} />
                    ) : (
                      <Camera size={44} color="var(--mu)" opacity={0.5} />
                    )}
                    <span className={styles.bussin2} style={{ color: camBusted ? '#e74c3c' : 'var(--mu)' }}>
                      {camBusted ? 'Camera Access Denied' : 'Camera Viewfinder'}
                    </span>
                    {!camBusted && (
                      <button onClick={sparkCam} className={styles.slay2}>
                        Open Camera
                      </button>
                    )}
                  </>
                )}

                <div className={styles.sus2} />
                <div className={styles.dope2} />
                <div className={styles.chill2} />
                <div className={styles.based2} />
              </div>

              {scanError && (
                <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', borderRadius: 12, padding: '10px 14px', marginTop: 16, fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
                  {scanError}
                </div>
              )}
            </div>

            <div className={styles.bet2}>
              <button className="drip1 flex1" onClick={fakeScanVibe} style={{ width: '100%' }}>
                {scannedHardwareId.trim() ? 'Pair Sensor' : 'Simulate Scan Success'}
              </button>
            </div>
          </div>
        )}

        {currentStepVibe === 3 && (
          <div className={`dope3 ${styles.surface1}`}>
            <div style={{ flex: 1 }}>

              {hwCheckResult?.isAssigned && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#856404', fontWeight: 600 }}>
                  ⚠️ This sensor is already linked to "{hwCheckResult.assignedPlantName}". It will be reassigned to your new plant.
                </div>
              )}

              <div className={styles.valid2}>
                <label className={styles.mid2} style={{ background: plantPic ? 'transparent' : 'rgba(255,255,255,0.6)', border: plantPic ? 'none' : '2px dashed #8aaa8a' }}>
                  <input type="file" accept="image/*" onChange={handlePicSelect} style={{ display: 'none' }} />

                  {plantPic ? (
                    <img src={plantPic} alt="plant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <Plus size={28} color="#0f5c3a" />
                      <span style={{ fontSize: '13px', color: '#0f5c3a', fontWeight: 'bold' }}>Add Photo</span>
                    </div>
                  )}
                </label>
              </div>

              <div className="sus1" style={{ marginBottom: '30px', gap: '16px' }}>
                <div>
                  <label className={styles.card2}>Plant Name</label>
                  <input
                    className={`slay1 ${styles.item2}`}
                    placeholder="e.g., Cherry Tomatoes"
                    value={plantMoniker}
                    onChange={e => setPlantMoniker(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label className={styles.card2}>Age (Days)</label>
                    <input
                      type="number"
                      className={`slay1 ${styles.item2}`}
                      placeholder="e.g., 45"
                      value={plantVibeAge}
                      onChange={e => setPlantVibeAge(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={styles.card2}>Plant Type</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        className={`slay1 ${styles.item2}`}
                        style={{ appearance: 'none', paddingRight: '30px' }}
                        value={plantMainType}
                        onChange={e => setPlantMainType(e.target.value)}
                      >
                        <option value="strawberry">Strawberry</option>
                        <option value="potato">Potato</option>
                        <option value="tomato">Tomato</option>
                        <option value="other">Other...</option>
                      </select>
                      <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--mu)' }}>
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {plantMainType === 'other' && (
                  <div className="dope3" style={{ marginTop: '16px' }}>
                    <label className={styles.card2}>Specify Other Type</label>
                    <input
                      className={`slay1 ${styles.item2}`}
                      placeholder="e.g., Mint, Basil..."
                      value={customVibeType}
                      onChange={e => setCustomVibeType(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {submitError && (
                <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
                  {submitError}
                </div>
              )}
            </div>

            <div className={styles.bet2}>
              <button className="drip1 bussin1" onClick={() => nav('/sensors')} style={{ flex: 1 }} disabled={isSubmittingFr}>Skip</button>
              <button className="drip1 flex1" onClick={yeetToBackendFr} style={{ flex: 2 }} disabled={isSubmittingFr}>
                {isSubmittingFr ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </div>
        )}

      </div>

      {isPairingRN && (
        <div className={`drip4 ${styles.main2}`}>
          <div className={styles.wrap2} />
          <div className={styles.grid2} />

          <div className={styles.row2}>

            <div className={styles.col2}>
              <div className={styles.btn2} />
              <div className={styles.nav2} />
              <div className={styles.top2}>
                <Cpu size={32} color="#fff" />
              </div>
            </div>

            <h3 style={{ color: '#1a2a1a', fontSize: '36px', marginBottom: '10px', fontWeight: 800, letterSpacing: '-0.5px' }}>Connecting</h3>
            <p style={{ color: '#556b5d', fontSize: '18px', fontWeight: 600 }}>Checking sensor status...</p>
          </div>

          <img src="/images/kitty.png" alt="kitty" className={styles.bot2} />
        </div>
      )}

    </div>
  )
}
