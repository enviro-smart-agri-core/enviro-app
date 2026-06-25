import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Droplets, Thermometer, Wind,
  Activity, CheckCircle, AlertTriangle,
  Wifi, WifiOff, Clock, MapPin, Cpu, Camera, Trash2,
  CloudRain, CloudSun, Gauge, CalendarDays, RefreshCw
} from 'lucide-react'
import styles from '../styles/Profile.module.css'
import { usePlantDashboard } from '../hooks/usePlantDashboard'
import { deletePlant, updatePlantPhoto } from '../api/plantDevice'
import { ENV } from '../config/env'

/**
 * Maps real plant sensor / health data to avatar image (1–8).
 *
 * Image legend (matches renamed files):
 *  1 – Healthy Hero      → healthy plant, happy tomato
 *  2 – The Suffocated    → fungal diseases (powdery mildew, blight, gray mold…)
 *  3 – The Melting       → bacterial diseases (bacterial spot, soft rot…)
 *  4 – The Glitch        → viral diseases (leaf curl virus, mosaic…)
 *  5 – The Itchy         → insects & pests (spider mites, tuta absoluta…)
 *  6 – The Thirsty       → water / physiological stress (dry soil, fruit cracking…)
 *  7 – The Hungry        → nutrient deficiencies (chlorosis, calcium deficiency…)
 *  8 – The Sore          → environmental stress (root issues, bruising, cold damage…)
 */
function getGameImage({
  healthStatus,
  systemAlert,
  moistureTag,
  tempTag,
  humidityTag,
  soilAlertTag,
  hasHardware,
  hasSensorData,
  connStatus,
}) {
  const hs = (healthStatus  || '').toLowerCase()
  const sa = (systemAlert   || '').toLowerCase()
  const mt = (moistureTag   || '').toLowerCase()
  const tt = (tempTag       || '').toLowerCase()
  const ht = (humidityTag   || '').toLowerCase()
  const st = (soilAlertTag  || '').toLowerCase()

  // 8 – The Sore: no hardware linked at all (environmental / no-sensor state)
  if (!hasHardware && !hasSensorData) return 8

  // 6 – The Thirsty: dry/low soil moisture wins before anything else
  //     catches "Dry - critical" tag from the sensor
  if (mt.includes('dry') || mt.includes('thirst') || mt.includes('low')
    || st.includes('dry') || st.includes('thirst')) return 6

  // 3 – The Melting: only true system-level danger (not moisture tags)
  if (sa.includes('critical') || sa.includes('danger') || sa.includes('dying')
    || hs.includes('critical') || hs.includes('danger')) return 3

  // 7 – The Hungry: nutrient-related → temperature extremes cause similar
  //     yellow/pale look; also catches cold stress (burnt tips)
  if (tt.includes('cold') || tt.includes('cool') || tt.includes('frost')
    || hs.includes('yellow') || hs.includes('nutrient') || hs.includes('deficien')) return 7

  // 8 – The Sore: extreme heat / environmental damage (bruising, root stress)
  if (tt.includes('hot') || tt.includes('high') || tt.includes('extreme')
    || tt.includes('heat') || st.includes('brown') || st.includes('root')
    || hs.includes('sore') || hs.includes('environmental')) return 8

  // 5 – The Itchy: warning-level alerts, pest-like stress signals
  if (sa.includes('warning') || sa.includes('alert') || sa.includes('pest')
    || ht.includes('low') || hs.includes('stress') || hs.includes('warning')) return 5

  // 2 – The Suffocated: moisture not ideal but not dry; fungal-like humidity issue
  if ((mt && mt !== 'optimal' && mt !== 'good' && mt !== 'normal' && mt !== 'moist')
    || hs === 'needs care' || hs.includes('attention') || hs.includes('poor')
    || hs.includes('fungal') || hs.includes('mildew') || hs.includes('blight')) return 2

  // 1 – The Healthy Hero: explicitly healthy with good readings
  if ((hs === 'healthy' || hs.includes('good') || hs.includes('excellent'))
    && !sa
    && (mt.includes('optimal') || mt.includes('good') || mt.includes('moist') || mt.includes('normal') || !mt)) return 1

  // Has sensor data with no specific issue → still healthy
  if (hasSensorData && !sa) return 1

  return 4 // The Glitch: default fallback (confused/neutral)
}

// Actual filenames in /public/images/plants/
const GAME_IMG = {
  1: 'healthy.png',
  2: 'The Suffocated.png',
  3: 'melting.png',
  4: 'glitch.png',
  5: 'itchy.png',
  6: 'thirsty.png',
  7: 'hungry.png',
  8: 'sore.png',
}

const GAME_STATE_LABELS = {
  1: 'Healthy',
  2: 'The Suffocated',
  3: 'The Melting',
  4: 'The Glitch',
  5: 'The Itchy',
  6: 'The Thirsty',
  7: 'The Hungry',
  8: 'The Sore',
}

const GAME_STATE_COLORS = {
  1: { bg: 'linear-gradient(135deg,#d4f0e0,#a8e6c0)', color: '#0a4a28', badge: '#27ae60' },
  2: { bg: 'linear-gradient(135deg,#f0f0f0,#d8d8d8)', color: '#3a3a3a', badge: '#7f8c8d' },
  3: { bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', color: '#1b5e20', badge: '#388e3c' },
  4: { bg: 'linear-gradient(135deg,#fff9c4,#fff176)', color: '#5a4800', badge: '#f9a825' },
  5: { bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', color: '#6a3a00', badge: '#e67e22' },
  6: { bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', color: '#0a3a6a', badge: '#1e88e5' },
  7: { bg: 'linear-gradient(135deg,#fffde7,#fff9c4)', color: '#5a4000', badge: '#f9a825' },
  8: { bg: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', color: '#4a0072', badge: '#8e24aa' },
}

function getImageUrl(url) {
  if (!url) return '/images/leaf.png'
  if (url.startsWith('http')) return url
  return `${ENV.API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function SensorDetail() {
  const nav = useNavigate()
  const { id } = useParams()

  const { plant, sensorState, loading, error, reload } = usePlantDashboard(id)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!id) nav('/sensors', { replace: true })
  }, [id])

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      await reload()
    } finally {
      setIsRefreshing(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this plant?')) return
    setIsDeleting(true)
    try {
      await deletePlant(id)
      nav('/sensors')
    } catch (err) {
      alert('Failed to delete plant: ' + err.message)
      setIsDeleting(false)
    }
  }

  async function handlePhotoUpdate(e) {
    if (!e.target.files || !e.target.files[0]) return
    setIsUploading(true)
    try {
      await updatePlantPhoto(id, e.target.files[0])
      reload()
    } catch (err) {
      alert('Failed to update photo: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="grid1" style={{ width: 30, height: 30, borderWidth: 3 }} />
      </div>
    )
  }

  if (error || !plant) {
    return (
      <div className="page">
        <div style={{ background: '#0f5c3a', padding: '52px 20px 20px' }}>
          <button
            onClick={() => nav(-1)}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
              padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: 6, color: 'white', fontSize: 14, fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back
          </button>
        </div>
        <div className="content" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 14, color: '#e74c3c', marginBottom: 12 }}>{error || 'Plant not found'}</p>
          <button className="drip1 bussin1" onClick={() => nav('/sensors')}>Back to Sensors</button>
        </div>
      </div>
    )
  }

  const hasHardware   = !!plant.hardwareId
  const hasSensorData = !!sensorState
  const sensorScreen  = sensorState?.sensor_details_screen || {}
  const liveReadings  = sensorScreen.live_readings || {}
  const gardenScreen  = sensorState?.garden_overview_screen || {}
  const cropStatus    = gardenScreen.crop_status_metric || {}
  const climate       = gardenScreen.climate_metrics || {}
  const irrigation    = liveReadings.irrigation_report || {}

  const moistureData  = liveReadings.soil_moisture  || {}
  const humidityData  = liveReadings.air_humidity   || {}
  const tempData      = liveReadings.temperature    || {}
  const soilAlert     = liveReadings.soil_status_report || {}

  const systemAlert   = sensorState?.system_alerts || gardenScreen.system_alerts || null
  const isCritical    = systemAlert?.toLowerCase().includes('critical')
  const connStatus    = sensorScreen.connection_status || (hasHardware ? 'Linked' : 'No Sensor')
  const lastSeen      = sensorScreen.last_seen_timestamp || null

  const stats = [
    { Icon: Droplets,    label: 'Soil Moisture', value: moistureData.value || '—', tag: moistureData.status_tag, bad: moistureData.status_tag?.toLowerCase().includes('dry') || moistureData.status_tag?.toLowerCase().includes('critical') },
    { Icon: Wind,        label: 'Air Humidity',  value: humidityData.value || '—', tag: humidityData.status_tag, bad: humidityData.status_tag?.toLowerCase().includes('low') },
    { Icon: Thermometer, label: 'Temperature',   value: tempData.value     || '—', tag: tempData.status_tag,     bad: tempData.status_tag?.toLowerCase().includes('hot') || tempData.status_tag?.toLowerCase().includes('cold') },
  ]

  return (
    <div className="page">

      <div style={{ background: '#0f5c3a', padding: '52px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button
            onClick={() => nav(-1)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 14, fontWeight: 600 }}
          >
            <ArrowLeft size={16} strokeWidth={2.5} /> Back
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            title="Refresh sensor data"
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: isRefreshing || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 14, fontWeight: 600, opacity: isRefreshing || loading ? 0.6 : 1, transition: 'opacity 0.2s' }}
          >
            <RefreshCw size={16} strokeWidth={2.5} style={{ animation: isRefreshing || loading ? 'spin 0.8s linear infinite' : 'none' }} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <input type="file" accept="image/*" onChange={handlePhotoUpdate} disabled={isUploading} style={{ display: 'none' }} />
            {isUploading
              ? <div className="grid1" style={{ width: 22, height: 22, borderWidth: 2, borderColor: '#fff' }} />
              : plant.pictureUrl
                ? <img src={getImageUrl(plant.pictureUrl)} alt="plant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Cpu size={30} color="white" strokeWidth={1.6} />
            }
            {!isUploading && (
              <div style={{ position: 'absolute', bottom: 4, right: 4, background: '#0f5c3a', borderRadius: '50%', padding: 3 }}>
                <Camera size={10} color="white" strokeWidth={2.5} />
              </div>
            )}
          </label>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>{plant.plantName || plant.plantType}</h1>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 }}>
              {plant.plantType} · {cropStatus.current_age_days || `${plant.daysOld ?? 0} days old`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '4px 10px' }}>
                {connStatus === 'Online'
                  ? <Wifi size={12} color="#7fffb0" strokeWidth={2.5} />
                  : <WifiOff size={12} color="rgba(255,255,255,0.5)" strokeWidth={2.5} />
                }
                <span style={{ fontSize: 12, fontWeight: 700, color: connStatus === 'Online' ? '#7fffb0' : 'rgba(255,255,255,0.5)' }}>{connStatus}</span>
              </div>
              {lastSeen && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{lastSeen}</span>}
              {hasHardware && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, padding: '4px 10px' }}>
                  <Cpu size={11} color="rgba(255,255,255,0.6)" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{plant.hardwareId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="content">

        {/* ── Gamification Plant Avatar: ONLY from saved scan result ── */}
        {(() => {
          let scanState = null
          try {
            const raw = localStorage.getItem(`enviro_scan_state_${id}`)
            if (raw) {
              const parsed    = JSON.parse(raw)
              const ageMs     = Date.now() - (parsed.timestamp || 0)
              const sevenDays = 7 * 24 * 60 * 60 * 1000
              if (ageMs < sevenDays) scanState = parsed
            }
          } catch {}

          if (!scanState) {
            // No scan yet — show a clean placeholder
            return (
              <div style={{
                background: 'white',
                borderRadius: 24,
                padding: '28px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                border: '1.5px dashed #c0d0c0',
              }}>
                <img
                  src="/images/plants/glitch.png"
                  alt="No scan yet"
                  style={{ width: 120, height: 120, objectFit: 'contain', opacity: 0.25, filter: 'grayscale(1)' }}
                />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#bbb', marginTop: 4 }}>
                  No scan yet
                </div>
                <div style={{ fontSize: 11, color: '#ccc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Game State
                </div>
                <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', lineHeight: 1.5 }}>
                  Scan this plant to reveal its game state
                </div>
              </div>
            )
          }

          const imgNum  = scanState.imgNum
          const palette = GAME_STATE_COLORS[imgNum] || GAME_STATE_COLORS[4]
          const label   = scanState.label || GAME_STATE_LABELS[imgNum]
          return (
            <div style={{
              background: palette.bg,
              borderRadius: 24,
              padding: '24px 20px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 0, marginBottom: 4, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, transparent, ${palette.badge}, transparent)`,
                opacity: 0.6,
              }} />
              <img
                src={`/images/plants/${GAME_IMG[imgNum]}`}
                alt="Plant state"
                style={{
                  width: 160, height: 160, objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.13))',
                  animation: 'plantBob 3s ease-in-out infinite',
                }}
              />
              <div style={{ marginTop: 14, fontSize: 16, fontWeight: 800, color: palette.color, letterSpacing: '0.01em' }}>
                {label}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: palette.color, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Game State
              </div>
            </div>
          )
        })()}

        {systemAlert && (
          <div style={{ background: isCritical ? '#fff0f0' : '#fff8e1', border: `1.5px solid ${isCritical ? '#f5c6c6' : '#ffe082'}`, borderRadius: 16, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={17} color={isCritical ? '#c0392b' : '#b8860b'} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: isCritical ? '#c0392b' : '#7a5a00', lineHeight: 1.5 }}>{systemAlert}</span>
          </div>
        )}

        {hasSensorData ? (
          <>

            <p className={styles.surface3}>Live Readings</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { Icon: Droplets,    label: 'Soil Moisture', data: moistureData },
                { Icon: Wind,        label: 'Air Humidity',  data: humidityData },
                { Icon: Thermometer, label: 'Temperature',   data: tempData },
                { Icon: Activity,    label: 'Health',        data: { value: plant.healthStatus || '—', status_tag: plant.healthStatus } },
              ].map(({ Icon, label, data }) => {
                const isBad = data.status_tag?.toLowerCase().includes('dry')
                  || data.status_tag?.toLowerCase().includes('critical')
                  || data.status_tag?.toLowerCase().includes('hot')
                  || data.status_tag?.toLowerCase().includes('low')
                  || data.status_tag?.toLowerCase().includes('alert')
                return (
                  <div key={label} style={{ background: 'white', borderRadius: 20, padding: '16px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1.5px solid ${isBad ? '#ffd0d0' : '#e8f7ee'}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ width: 38, height: 38, background: isBad ? '#fff0f0' : '#e8f7ee', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={isBad ? '#c0392b' : '#0f5c3a'} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#1a2a1a', marginTop: 2, lineHeight: 1.1 }}>{data.value || '—'}</div>
                    </div>
                    {data.status_tag && (
                      <div style={{ fontSize: 11, fontWeight: 600, color: isBad ? '#c0392b' : '#0f5c3a', background: isBad ? '#fff0f0' : '#e8f7ee', borderRadius: 8, padding: '3px 8px', alignSelf: 'flex-start' }}>
                        {data.status_tag}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {soilAlert.status_tag && (
              <div style={{ background: '#fff0f0', border: '1.5px solid #f5c6c6', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#c0392b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>⚠ Soil Report</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#c0392b', lineHeight: 1.5 }}>{soilAlert.status_tag}</div>
              </div>
            )}

            {(irrigation.water_tank_percentage || irrigation.pump_status) && (
              <>
                <p className={styles.surface3}>Irrigation</p>
                <div style={{ background: 'white', borderRadius: 20, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1.5px solid #e8f7ee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Water Tank</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: parseFloat(irrigation.water_tank_percentage) < 20 ? '#c0392b' : '#1a2a1a', lineHeight: 1.1, marginTop: 4 }}>
                        {irrigation.water_tank_percentage || '—'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pump</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: irrigation.pump_status === 'ON' ? '#0f5c3a' : '#e67e22', marginTop: 4 }}>
                        {irrigation.pump_status || '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ height: 8, background: '#f0f0f0', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: irrigation.water_tank_percentage || '0%', height: '100%', background: `linear-gradient(90deg, ${parseFloat(irrigation.water_tank_percentage) < 20 ? '#c0392b' : '#0f5c3a'}, ${parseFloat(irrigation.water_tank_percentage) < 20 ? '#e74c3c' : '#27ae60'})`, borderRadius: 999, transition: 'width 0.6s ease' }} />
                  </div>
                  {irrigation.last_time_pump_opened && (
                    <div style={{ marginTop: 12, fontSize: 12, color: '#e67e22', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={13} strokeWidth={2.5} />
                      Next Run: {Object.values(irrigation.last_time_pump_opened)[0] || '—'}
                    </div>
                  )}
                </div>
              </>
            )}

            {cropStatus.countdown_text && (
              <>
                <p className={styles.surface3}>Crop Progress</p>
                <div style={{ background: 'white', borderRadius: 20, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1.5px solid #e8f7ee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a2a1a' }}>{cropStatus.current_age_days}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0f5c3a', background: '#e8f7ee', borderRadius: 999, padding: '4px 10px' }}>{cropStatus.countdown_text}</span>
                  </div>
                  <div style={{ height: 10, background: '#f0f0f0', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${cropStatus.progress_percentage || 0}%`, height: '100%', background: 'linear-gradient(90deg, #0f5c3a, #27ae60)', borderRadius: 999, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 8, textAlign: 'right', fontWeight: 600 }}>{cropStatus.progress_percentage || 0}% complete</div>
                </div>
              </>
            )}

            {gardenScreen.location_city && (
              <>
                <p className={styles.surface3}>Garden Overview</p>
                <div style={{ background: 'white', borderRadius: 20, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1.5px solid #e8f7ee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>{gardenScreen.location_city} · {gardenScreen.weather_condition_text}</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: '#1a2a1a', lineHeight: 1.1, marginTop: 4 }}>{gardenScreen.current_forecast_temp}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999, background: gardenScreen.weather_safety_status === 'Danger' ? '#fff0f0' : '#e8f7ee', color: gardenScreen.weather_safety_status === 'Danger' ? '#c0392b' : '#0f5c3a' }}>
                      {gardenScreen.weather_safety_status}
                    </div>
                  </div>
                  {climate.wind_speed && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {[
                        { Icon: Wind,        label: 'Wind',      val: climate.wind_speed },
                        { Icon: Droplets,    label: 'Humidity',  val: climate.humidity },
                        { Icon: Thermometer, label: 'Feels Like',val: climate.feels_like },
                        { Icon: CloudRain,   label: 'Rain',      val: climate.precipitation_depth },
                      ].map(({ Icon, label, val }) => (
                        <div key={label} style={{ background: '#f8fdf9', borderRadius: 12, padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <Icon size={16} color="#0f5c3a" strokeWidth={1.8} />
                          <div style={{ fontSize: 10, color: '#999', fontWeight: 600, textAlign: 'center' }}>{label}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#1a2a1a', textAlign: 'center' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ background: 'white', borderRadius: 20, padding: '40px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <WifiOff size={44} color="#ddd" strokeWidth={1.4} style={{ marginBottom: 14 }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#bbb', marginBottom: 6 }}>
              {hasHardware ? 'No sensor data yet' : 'No sensor linked'}
            </p>
            <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
              {hasHardware ? "The sensor hasn't sent any data yet. Make sure it's powered on." : 'Link a sensor device to this plant to see live readings.'}
            </p>
          </div>
        )}

        <div style={{ marginTop: 32, marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ background: '#fff0f0', border: '1.5px solid #f5c6c6', color: '#c0392b', padding: '14px 28px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: isDeleting ? 0.6 : 1, transition: 'opacity 0.2s' }}
          >
            {isDeleting
              ? <><div className="grid1" style={{ width: 16, height: 16, borderWidth: 2, borderColor: '#c0392b', borderTopColor: 'transparent' }} /> Deleting...</>
              : <><Trash2 size={17} strokeWidth={2.5} /> Delete Plant</>
            }
          </button>
        </div>

      </div>
    </div>
  )
}
