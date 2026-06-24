import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Cpu, Droplets, Thermometer,
  Wind, Activity, ChevronRight, Wifi, WifiOff,
  CheckCircle, AlertTriangle, Info,
} from 'lucide-react'
import BottomNav from '../components/BottomNav'
import { usePlantList } from '../hooks/usePlantDashboard'
import { ENV } from '../config/env'

function getImageUrl(url) {
  if (!url) return '/images/leaf.png'
  if (url.startsWith('http')) return url
  return `${ENV.API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

function OnlinePill({ alive }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 600, padding: '3px 10px',
      borderRadius: 999,
      background: alive ? '#d4f0e0' : '#f5f5f5',
      color:      alive ? '#0f5c3a' : '#999',
    }}>
      {alive ? <Wifi size={11} strokeWidth={2.5} /> : <WifiOff size={11} strokeWidth={2.5} />}
      {alive ? 'Online' : 'Offline'}
    </span>
  )
}

function PlantCard({ plant, onTap }) {
  const liveReadings = plant.sensorState?.sensor_details_screen?.live_readings || {}
  const moistureVal  = liveReadings.soil_moisture?.value
  const tempVal      = liveReadings.temperature?.value
  const hasLiveReadings = !!(moistureVal || tempVal)

  return (
    <div className="col dope3" onClick={() => onTap(plant)} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '14px' }}>

        <div style={{
          width: '74px', borderRadius: '14px',
          background: '#e8f7ee',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden'
        }}>
          {plant.pictureUrl
            ? <img src={getImageUrl(plant.pictureUrl)} alt="plant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <img src="/images/leaf.png" alt="plant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          }
        </div>

        <div style={{ flex: 1, padding: '2px 0' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1a2a1a' }}>{plant.plantName || plant.plantType}</div>
          <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 2 }}>Age: {plant.daysOld ?? 0} Days</div>

          {hasLiveReadings ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: '#0f5c3a', fontWeight: 600 }}>
                <Droplets size={12} strokeWidth={2.5} /> {moistureVal}
              </div>
              <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: '#e67e22', fontWeight: 600 }}>
                <Thermometer size={12} strokeWidth={2.5} /> {tempVal}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, color: plant.healthStatus === 'HEALTHY' ? '#1a7a50' : '#c0392b', fontWeight: 600 }}>
              <Activity size={12} strokeWidth={2.5} />
              {plant.healthStatus === 'HEALTHY' ? 'Healthy' : plant.healthStatus || 'Unknown'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', borderLeft: '1px solid var(--gp)', paddingLeft: '12px' }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--mu)', fontWeight: 600 }}>Sensor</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2a1a', marginTop: 2, marginBottom: 6 }}>{plant.hardwareId || 'None'}</span>
          <OnlinePill alive={!!plant.hardwareId} />
        </div>
      </div>
    </div>
  )
}

function AddGadgetBox() {
  const nav = useNavigate()

  function poke() {
    nav('/sensors/add')
  }

  return (
    <div
      onClick={poke}
      style={{
        border: '2px dashed #c0d0c0', borderRadius: 20,
        padding: '28px 20px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 10, cursor: 'pointer',
      }}
    >
      <div style={{ width: 52, height: 52, background: '#e8f7ee', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PlusCircle size={28} color="#0f5c3a" strokeWidth={1.6} />
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#0f5c3a' }}>Add Device</span>
      <span style={{ fontSize: 13, color: 'var(--mu)', textAlign: 'center' }}>
        Pair a new sensor to start monitoring your farm
      </span>
    </div>
  )
}

export default function Sensors() {
  const nav = useNavigate()
  const { plants: myPlants, loading, error, reload: loadPlants } = usePlantList()

  function openPlant(plant) {
    const id = plant._id || plant.id
    nav(`/sensors/${id}`)
  }

  return (
    <div className="page">

      <div className="grid drip4">
        <h1>Plants & Sensors</h1>
        <p>Monitor your connected plants</p>
      </div>

      <div className="content">
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="grid1" style={{ width: 30, height: 30, borderWidth: 3 }} />
          </div>
        )}

        {error && !loading && (
          <div className="col dope3" style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ fontSize: 14, color: '#e74c3c', marginBottom: 12 }}>{error}</p>
            <button className="drip1 bussin1" onClick={loadPlants}>Try Again</button>
          </div>
        )}

        {!loading && !error && myPlants.length === 0 && (
          <div className="col dope3" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <Cpu size={40} color="#ddd" strokeWidth={1.5} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#bbb', marginBottom: 6 }}>No plants yet</p>
            <p style={{ fontSize: 13, color: '#ccc' }}>
              Add your first device to start monitoring your farm.
            </p>
          </div>
        )}

        {!loading && !error && myPlants.map((plant, i) => (
          <div key={plant._id || plant.id} style={{ animationDelay: `${i * 0.08}s` }}>
            <PlantCard plant={plant} onTap={openPlant} />
          </div>
        ))}

        <AddGadgetBox />
      </div>

      <BottomNav />
    </div>
  )
}
