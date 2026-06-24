import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, ShieldAlert, Wind, Droplets,
  Thermometer, CloudRain, Sun, Cloud,
  CloudLightning, Snowflake, CloudDrizzle,
  Medal, Sprout, UserCircle, RefreshCw, Bot,
} from 'lucide-react'
import BottomNav from '../components/BottomNav'
import { useWeatherContext } from '../context/WeatherContext'
import { useAuthContext }    from '../context/AuthContext'
import styles from '../styles/Home.module.css'
import { plantApi } from '../api/plant'

function SkyIcon({ condition, bigness = 40 }) {
  const lookup = {
    Clear:        <Sun size={bigness} color="#f5a623" strokeWidth={1.8} />,
    Clouds:       <Cloud size={bigness} color="#7f8c8d" strokeWidth={1.8} />,
    Rain:         <CloudRain size={bigness} color="#2980b9" strokeWidth={1.8} />,
    Drizzle:      <CloudDrizzle size={bigness} color="#5dade2" strokeWidth={1.8} />,
    Thunderstorm: <CloudLightning size={bigness} color="#8e44ad" strokeWidth={1.8} />,
    Snow:         <Snowflake size={bigness} color="#85c1e9" strokeWidth={1.8} />,
    Fog:          <Cloud size={bigness} color="#aab7b8" strokeWidth={1.8} />,
  }
  return lookup[condition] || <Sun size={bigness} color="#f5a623" strokeWidth={1.8} />
}

function SkyCard({ skyData, fetching, skyErr, gotGPS, onRefresh }) {

  if (fetching) {
    return (
      <div className="col dope3 based">
        <div className="nav">Weather Safety</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          <div className="grid1" style={{ width: 22, height: 22, borderWidth: 3 }} />
          <span style={{ fontSize: 14, color: 'var(--mu)' }}>
            {gotGPS ? 'Getting your location...' : 'Loading weather...'}
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--mu)', marginTop: 2 }}>
          Falls back to Alexandria if GPS is slow
        </p>
      </div>
    )
  }

  if (skyErr && !skyData) {
    return (
      <div className="col dope3 based">
        <div className="nav">Weather Safety</div>
        <p style={{ fontSize: 13, color: '#e74c3c', marginBottom: 10 }}>
          Something went wrong loading the weather.
        </p>
        <button className="drip1 bussin1" style={{ padding: '10px 16px', fontSize: 14 }} onClick={onRefresh}>
          <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Try Again
        </button>
      </div>
    )
  }

  if (!skyData) return null

  const ShieldThing = skyData.safe ? ShieldCheck : ShieldAlert

  const statBoxes = [
    { Ico: Wind,        tag: 'Wind',       val: `${skyData.windKmh} km/h`         },
    { Ico: Droplets,    tag: 'Humidity',   val: `${skyData.humidity}%`             },
    { Ico: Thermometer, tag: 'Feels like', val: `${skyData.feelsLike}°C`           },
    { Ico: CloudRain,   tag: 'Precip',     val: `${skyData.precipitation ?? 0} mm` },
  ]

  return (
    <div className="col dope3 based">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div className="nav" style={{ marginBottom: 4 }}>
            Weather Safety
            {!gotGPS && (
              <span style={{ marginLeft: 8, fontSize: 10, background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                Alexandria
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <ShieldThing size={24} color={skyData.safetyColor} strokeWidth={2} />
            <span style={{ fontSize: 26, fontWeight: 800, color: skyData.safetyColor, lineHeight: 1 }}>
              {skyData.safetyStatus}
            </span>
          </div>

          <p style={{ fontSize: 16, color: 'var(--mu)' }}>{skyData.city}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>

          <button
            onClick={onRefresh}
            style={{
              background: 'var(--gp)', border: 'none',
              borderRadius: 10, padding: '6px 10px',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, color: '#0f5c3a',
            }}
          >
            <RefreshCw size={13} strokeWidth={2.5} />
            Refresh
          </button>

          <div style={{ textAlign: 'center' }}>
            <SkyIcon condition={skyData.condition} bigness={42} />
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--td)', marginTop: 4 }}>
              {skyData.temp}°C
            </div>
            <div style={{ fontSize: 11, color: 'var(--mu)', textTransform: 'capitalize' }}>
              {skyData.label}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <span className="left" style={skyData.isRain ? { background: '#dbeafe', color: '#1e40af' } : { background: 'var(--gl)', color: 'var(--gd)' }}>
          <CloudRain size={12} strokeWidth={2} style={{ marginRight: 5 }} />
          {skyData.isRain ? 'Rain' : 'No Rain'}
        </span>
        <span className="left" style={skyData.isStorm ? { background: '#fee2e2', color: '#991b1b' } : { background: 'var(--gl)', color: 'var(--gd)' }}>
          <CloudLightning size={12} strokeWidth={2} style={{ marginRight: 5 }} />
          {skyData.isStorm ? 'Storm!' : 'No Storms'}
        </span>
        <span className="left" style={skyData.isCloudy ? { background: '#f3f4f6', color: '#374151' } : { background: 'var(--gl)', color: 'var(--gd)' }}>
          {skyData.isCloudy
            ? <><Cloud size={12} strokeWidth={2} style={{ marginRight: 5 }} />Cloudy</>
            : <><Sun size={12} strokeWidth={2} style={{ marginRight: 5 }} />Clear</>
          }
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {statBoxes.map(({ Ico, tag, val }) => (
          <div key={tag} style={{ background: 'var(--gp)', borderRadius: 10, padding: '9px 11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--mu)', marginBottom: 3 }}>
              <Ico size={12} strokeWidth={2} /> {tag}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--td)' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [harvestBarWidth, setHarvestBarWidth] = useState(0)
  const [tomatoPlant,     setTomatoPlant]     = useState(null)
  const [cropStatus,      setCropStatus]      = useState(null)
  const [cropLoading,     setCropLoading]     = useState(true)

  const { skyVibes, spinning, fuckshit, usingGPS, refresh } = useWeatherContext()
  const { bro } = useAuthContext()
  const nav = useNavigate()

  useEffect(() => {
    async function loadTomato() {
      try {
        const res  = await plantApi.getAll()
        const list = res.data?.plants || res.data || res.plants || (Array.isArray(res) ? res : [])
        const tomato = list.find(p =>
          (p.plantType || '').toLowerCase().includes('tomato') ||
          (p.plantName || '').toLowerCase().includes('tomato')
        )
        if (!tomato) return
        setTomatoPlant(tomato)
        const pId = tomato._id || tomato.id
        try {
          const stateRes  = await plantApi.getState(pId)
          const stateData = stateRes.data || stateRes
          const crop = stateData?.garden_overview_screen?.crop_status_metric || null
          setCropStatus(crop)

          if (crop?.progress_percentage) {
            setTimeout(() => setHarvestBarWidth(crop.progress_percentage), 300)
          }
        } catch {  }
      } catch {  } finally {
        setCropLoading(false)
      }
    }
    loadTomato()

    const wiggle = setTimeout(() => setHarvestBarWidth(prev => prev || 50), 500)
    return () => clearTimeout(wiggle)
  }, [])

  return (
    <div className="page">

      <div className={styles.valid3}>
        <h1 className="dope3">Garden Overview</h1>

        <div
          className={`${styles.mid3} drip4`}
          onClick={() => nav('/profile')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <div className={styles.cap3} style={{ overflow: 'hidden' }}>
            {bro?.avatar
              ? <img src={bro.avatar} alt="you" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <UserCircle size={26} color="#4a6a4a" strokeWidth={1.5} />
            }
          </div>
          <span className={styles.box3}>{bro?.name || 'Profile'}</span>
        </div>
      </div>

      <div className="content">

        <SkyCard
          skyData={skyVibes}
          fetching={spinning}
          skyErr={fuckshit}
          gotGPS={usingGPS}
          onRefresh={refresh}
        />

        <div
          className="col dope3 mid"
          onClick={() => nav('/chat')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.card3}>
            <div>
              <div className="nav">Need Help?</div>
              <div className="bot" style={{ fontSize: '20px', marginTop: '4px' }}>Ask ChatAgent</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--mu)' }}>Tap to chat about your garden</span>
              </div>
            </div>
            <div className={`${styles.col} ${styles.item3}`}>
              <Bot size={24} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="col dope3 box">
          <div className="nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Crop Status</span>
            {tomatoPlant && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mu)' }}>
                {tomatoPlant.plantName || tomatoPlant.plantType}
              </span>
            )}
          </div>

          {cropLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
              <div className="grid1" style={{ width: 16, height: 16, borderWidth: 2 }} />
              <span style={{ fontSize: 13, color: 'var(--mu)' }}>Loading crop data…</span>
            </div>
          ) : (
            <div className={styles.card3}>
              <div style={{ flex: 1 }}>
                <div className="bot">
                  {cropStatus?.current_age_days
                    ? cropStatus.current_age_days
                    : tomatoPlant
                      ? `Day ${tomatoPlant.daysOld ?? 0}`
                      : 'No tomato plant'}
                </div>
                <div className="right">
                  <div
                    className="surface"
                    style={{
                      width: `${harvestBarWidth}%`,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
                <p style={{ fontSize: 14, color: '#4a6a4a', marginTop: 6 }}>
                  {cropStatus?.countdown_text
                    ? cropStatus.countdown_text
                    : tomatoPlant
                      ? `Age: ${tomatoPlant.daysOld ?? 0} days`
                      : 'Add a tomato plant to track progress'}
                </p>
                {cropStatus?.progress_percentage != null && (
                  <p style={{ fontSize: 11, color: 'var(--mu)', marginTop: 3 }}>
                    {cropStatus.progress_percentage}% complete
                  </p>
                )}
              </div>
              <div className={styles.col} style={{ marginLeft: 14 }}>
                <Sprout size={20} color="var(--gd)" strokeWidth={1.8} />
              </div>
            </div>
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
