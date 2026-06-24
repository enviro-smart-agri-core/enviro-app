import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { getWeatherByCoordsFull } from '../api/weather'

const SkyVibesContext = createContext(null)

const ALEX_FALLBACK   = { lat: 31.2001, lon: 29.9187 }
const STALE_AFTER     = 15 * 60 * 1000
const CACHE_KEY       = 'enviro_last_gps'

function loadCachedGPS() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { lat, lon, ts } = JSON.parse(raw)

    if (Date.now() - ts < 60 * 60 * 1000) return { lat, lon }
  } catch {}
  return null
}

function saveCachedGPS(lat, lon) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ lat, lon, ts: Date.now() }))
  } catch {}
}

export function WeatherProvider({ children }) {
  const [skyData,    setSkyData]    = useState(null)
  const [fetching,   setFetching]   = useState(true)
  const [weatherErr, setWeatherErr] = useState(null)
  const [gotRealGPS, setGotRealGPS] = useState(false)

  const lastKnownSpot = useRef(null)
  const fetchingRef   = useRef(false)

  async function grabWeather(lat, lon, isActualGPS) {
    fetchingRef.current = true
    setFetching(true)
    setWeatherErr(null)
    setGotRealGPS(isActualGPS)
    lastKnownSpot.current = { lat, lon }

    try {
      const freshSky = await getWeatherByCoordsFull(lat, lon)
      setSkyData(freshSky)
    } catch {

      if (!skyData) {
        try {
          const alexSky = await getWeatherByCoordsFull(ALEX_FALLBACK.lat, ALEX_FALLBACK.lon)
          setSkyData(alexSky)
          setGotRealGPS(false)
          lastKnownSpot.current = ALEX_FALLBACK
        } catch {
          setWeatherErr('Weather API is being difficult. Check your connection.')
        }
      }
    } finally {
      setFetching(false)
      fetchingRef.current = false
    }
  }

  async function tryGPS() {

    const cached = loadCachedGPS()
    if (cached) {

      grabWeather(cached.lat, cached.lon, true)
    } else {

      grabWeather(ALEX_FALLBACK.lat, ALEX_FALLBACK.lon, false)
    }

    let gotRealPosition = false

    try {
      const { Geolocation } = await import('@capacitor/geolocation')
      const perm = await Geolocation.requestPermissions()
      if (perm.location === 'granted' || perm.coarseLocation === 'granted') {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout:            15000,
        })
        const { latitude: lat, longitude: lon } = pos.coords
        saveCachedGPS(lat, lon)
        gotRealPosition = true
        grabWeather(lat, lon, true)
      }
    } catch {

    }

    if (!gotRealPosition && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude: lat, longitude: lon } = pos.coords
          saveCachedGPS(lat, lon)
          grabWeather(lat, lon, true)
        },
        () => {  },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    }
  }

  function punchRefresh() {
    const spot = lastKnownSpot.current
    if (spot) grabWeather(spot.lat, spot.lon, gotRealGPS)
    else tryGPS()
  }

  useEffect(() => { tryGPS() }, [])

  useEffect(() => {
    const ticker = setInterval(() => {
      const spot = lastKnownSpot.current
      if (spot) grabWeather(spot.lat, spot.lon, gotRealGPS)
    }, STALE_AFTER)
    return () => clearInterval(ticker)
  }, [gotRealGPS])

  return (
    <SkyVibesContext.Provider value={{
      skyVibes: skyData,
      spinning: fetching,
      fuckshit: weatherErr,
      usingGPS: gotRealGPS,
      refresh:  punchRefresh,
    }}>
      {children}
    </SkyVibesContext.Provider>
  )
}

export function useWeatherContext() {
  return useContext(SkyVibesContext)
}
