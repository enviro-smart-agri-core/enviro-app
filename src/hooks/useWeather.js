

import { useState, useEffect } from 'react'
import { getWeatherByCoordsFull } from '../api/weather'

export function useWeather() {
  const [skyVibes, setSkyVibes] = useState(null)
  const [spinning, setSpinning] = useState(true)
  const [fuckshit, setError]    = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchWeather(lat, lon) {
      try {
        const theTea = await getWeatherByCoordsFull(lat, lon)
        if (!cancelled) setSkyVibes(theTea)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setSpinning(false)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          if (!cancelled) fetchWeather(pos.coords.latitude, pos.coords.longitude)
        },
        () => {

          if (!cancelled) fetchWeather(30.0444, 31.2357)
        },
        { timeout: 8000 }
      )
    } else {
      fetchWeather(30.0444, 31.2357)
    }

    return () => { cancelled = true }
  }, [])

  return { skyVibes, spinning, fuckshit }
}
