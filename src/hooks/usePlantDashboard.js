import { useState, useEffect, useCallback } from 'react'
import { plantApi } from '../api/plant'

export function usePlantDashboard(plantId) {
  const [plant, setPlant]           = useState(null)
  const [sensorState, setSensorState] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const load = useCallback(async () => {
    if (!plantId) return
    setLoading(true)
    setError(null)
    try {
      const plantRes  = await plantApi.getById(plantId)
      const plantData = plantRes.data || plantRes
      setPlant(plantData)

      try {
        const stateRes  = await plantApi.getState(plantId)
        const stateData = stateRes.data || stateRes
        setSensorState(stateData)
      } catch {
        setSensorState(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [plantId])

  useEffect(() => { load() }, [load])

  return { plant, sensorState, loading, error, reload: load }
}

export function usePlantList() {
  const [plants, setPlants]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res    = await plantApi.getAll()
      const list   = res.data?.plants || res.data || res.plants || (Array.isArray(res) ? res : [])

      const enriched = await Promise.all(list.map(async (p) => {
        const pId = p._id || p.id
        try {
          const stateRes = await plantApi.getState(pId)
          p.sensorState  = stateRes.data || stateRes
        } catch {
          p.sensorState = null
        }
        return p
      }))

      setPlants(enriched)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { plants, loading, error, reload: load }
}
