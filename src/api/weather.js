

const BASE = 'https://api.open-meteo.com/v1/forecast'

const WMO_CODES = {
  0:  { label: 'Clear Sky',       emoji: '☀️',  condition: 'Clear' },
  1:  { label: 'Mainly Clear',    emoji: '🌤️', condition: 'Clear' },
  2:  { label: 'Partly Cloudy',   emoji: '⛅',  condition: 'Clouds' },
  3:  { label: 'Overcast',        emoji: '☁️',  condition: 'Clouds' },
  45: { label: 'Foggy',           emoji: '🌫️', condition: 'Fog' },
  48: { label: 'Rime Fog',        emoji: '🌫️', condition: 'Fog' },
  51: { label: 'Light Drizzle',   emoji: '🌦️', condition: 'Drizzle' },
  53: { label: 'Drizzle',         emoji: '🌦️', condition: 'Drizzle' },
  55: { label: 'Heavy Drizzle',   emoji: '🌧️', condition: 'Drizzle' },
  56: { label: 'Freezing Drizzle',emoji: '🌨️', condition: 'Drizzle' },
  57: { label: 'Heavy Freezing Drizzle', emoji: '🌨️', condition: 'Drizzle' },
  61: { label: 'Light Rain',      emoji: '🌧️', condition: 'Rain' },
  63: { label: 'Moderate Rain',   emoji: '🌧️', condition: 'Rain' },
  65: { label: 'Heavy Rain',      emoji: '🌧️', condition: 'Rain' },
  66: { label: 'Freezing Rain',   emoji: '🌨️', condition: 'Rain' },
  67: { label: 'Heavy Freezing Rain', emoji: '🌨️', condition: 'Rain' },
  71: { label: 'Light Snow',      emoji: '❄️',  condition: 'Snow' },
  73: { label: 'Moderate Snow',   emoji: '❄️',  condition: 'Snow' },
  75: { label: 'Heavy Snow',      emoji: '❄️',  condition: 'Snow' },
  77: { label: 'Snow Grains',     emoji: '🌨️', condition: 'Snow' },
  80: { label: 'Light Showers',   emoji: '🌦️', condition: 'Rain' },
  81: { label: 'Showers',         emoji: '🌧️', condition: 'Rain' },
  82: { label: 'Heavy Showers',   emoji: '🌧️', condition: 'Rain' },
  85: { label: 'Snow Showers',    emoji: '❄️',  condition: 'Snow' },
  86: { label: 'Heavy Snow Showers', emoji: '❄️', condition: 'Snow' },
  95: { label: 'Thunderstorm',    emoji: '⛈️', condition: 'Thunderstorm' },
  96: { label: 'Thunderstorm w/ Hail', emoji: '⛈️', condition: 'Thunderstorm' },
  99: { label: 'Heavy Thunderstorm', emoji: '⛈️', condition: 'Thunderstorm' },
}

function getWmo(code) {
  return WMO_CODES[code] || { label: 'Unknown', emoji: '🌤️', condition: 'Clear' }
}

export async function getWeatherByCoords(lat, lon) {
  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'precipitation',
    ].join(','),
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  })

  const theWord  = await fetch(`${BASE}?${params}`)
  const theTea = await theWord.json()

  if (!theWord.ok || theTea.error) {
    throw new Error(theTea.reason || 'Weather fetch failed')
  }

  return parseWeather(theTea, lat, lon)
}

export async function getWeatherByCoordsFull(lat, lon) {

  const [skyVibes, cityName] = await Promise.all([
    getWeatherByCoords(lat, lon),
    getCityName(lat, lon),
  ])
  return { ...skyVibes, city: cityName }
}

async function getCityName(lat, lon) {
  try {
    const theWord  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const theTea = await theWord.json()
    return (
      theTea.address?.city ||
      theTea.address?.town ||
      theTea.address?.village ||
      theTea.address?.county ||
      'Your Location'
    )
  } catch {
    return 'Your Location'
  }
}

function parseWeather(data, lat, lon) {
  const c    = data.current
  const code = c.weather_code
  const wmo  = getWmo(code)

  const windKmh  = Math.round(c.wind_speed_10m)
  const isRain   = ['Rain', 'Drizzle'].includes(wmo.condition)
  const isStorm  = wmo.condition === 'Thunderstorm'
  const isCloudy = wmo.condition === 'Clouds'
  const isSnow   = wmo.condition === 'Snow'
  const safe     = !isStorm && windKmh < 50

  let safetyStatus = 'Safe'
  let safetyColor  = '#0f5c3a'
  if (isStorm)        { safetyStatus = 'Storm Warning!'; safetyColor = '#c0392b' }
  else if (windKmh >= 50) { safetyStatus = 'High Winds';    safetyColor = '#e67e22' }
  else if (isRain)    { safetyStatus = 'Rainy';          safetyColor = '#2980b9' }
  else if (isCloudy)  { safetyStatus = 'Cloudy';         safetyColor = '#7f8c8d' }

  return {
    city:         'Your Location',
    temp:         Math.round(c.temperature_2m),
    feelsLike:    Math.round(c.apparent_temperature),
    humidity:     c.relative_humidity_2m,
    windKmh,
    precipitation: c.precipitation,
    wmoCode:      code,
    label:        wmo.label,
    emoji:        wmo.emoji,
    condition:    wmo.condition,
    isRain, isStorm, isCloudy, isSnow,
    safe, safetyStatus, safetyColor,
  }
}
