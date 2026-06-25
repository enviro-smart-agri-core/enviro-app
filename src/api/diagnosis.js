import { io } from 'socket.io-client'
import { ENV } from '../config/env'

async function hashFile(file) {
  const buf     = await file.arrayBuffer()
  const hashBuf = await crypto.subtle.digest('SHA-256', buf)
  const hashArr = Array.from(new Uint8Array(hashBuf))
  return hashArr.map(b => b.toString(16).padStart(2, '0')).join('')
}

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('enviro_user') || '{}')
    return u.id || u._id || null
  } catch { return null }
}

const PLANT_TYPE_MAP = {
  // Capitalized (from display names)
  'Tomato':             'tomato',
  'Strawberry':         'strawberry',
  'Potato':             'potato',
  'Pepper':             'pepper',
  'Corn':               'corn',
  'Wheat':              'wheat',
  'Rose':               'rose',
  'Basil':              'basil',
  'Monstera Deliciosa': 'monstera',
  'Unknown Plant':      'tomato',
  // Lowercase (from generic selection)
  'tomato':             'tomato',
  'strawberry':         'strawberry',
  'potato':             'potato',
  'pepper':             'pepper',
  'corn':               'corn',
  'wheat':              'wheat',
  'rose':               'rose',
  'basil':              'basil',
  'unknown':            'tomato',
  'unkn':               'tomato',
}

function parseResult(raw, plantType) {
  if (!raw) return null
  console.log('[Diagnosis] parsing:', JSON.stringify(raw))

  const d       = raw.data || raw
  const pr      = d.predictionResult || {}
  const details = pr.details || d.details || {}

  let diseaseName = pr.prediction || d.prediction
    || d.diseaseName || d.disease || d.label || d.class || null

  if (diseaseName) {
    diseaseName = diseaseName.replace(/_/g, ' ')
                             .replace(/\b\w/g, c => c.toUpperCase())
  }

  let confidence = d.confidence || d.score || 0
  if (confidence > 0 && confidence <= 1) confidence = Math.round(confidence * 100)
  else confidence = Math.round(confidence) || 88

  const isHealthy = !diseaseName
    || String(diseaseName).toLowerCase().includes('healthy')
    || d.isHealthy === true

  const severity = isHealthy ? 'none' : (d.severity || 'medium')

  return {
    name:        isHealthy ? `Healthy ${plantType}` : (diseaseName || 'Disease Detected'),
    confidence,
    disease:     isHealthy ? null : diseaseName,
    severity,
    gameStatus:  pr.gameStatus  || d.gameStatus  || null,
    cause:       details.cause       || null,
    description: details.description || null,
    treatment:   details.treatment   || null,
    prevention:  details.prevention  || null,

    advice: details.treatment || details.description || d.advice || d.message
      || (isHealthy
        ? `Your ${plantType} looks healthy! Keep up the good care.`
        : `Disease detected: ${diseaseName}. Consult a plant specialist.`),
  }
}

export async function runDiagnosis(imageFile, plantType = 'Tomato', plantId = null) {
  const token  = localStorage.getItem('enviro_token')
  const userId = getUserId()

  if (!token)  throw new Error('You need to be logged in')
  if (!userId) throw new Error('Could not find user ID — log out and back in')

  // Normalize: map known types, fallback to the value itself, default 'tomato'
  const KNOWN = ['tomato', 'strawberry', 'potato', 'pepper', 'corn', 'wheat', 'rose', 'basil', 'monstera']
  const rawType = plantType.toLowerCase().trim()
  const pType   = KNOWN.includes(rawType)
    ? rawType
    : (PLANT_TYPE_MAP[plantType] || PLANT_TYPE_MAP[plantType.trim()] || 'tomato')

  console.log('[Diagnosis] plantType received:', plantType, '→ normalized:', pType, '| plantId:', plantId)

  const sha256 = await hashFile(imageFile)
  const ext    = imageFile.name?.split('.').pop()?.toLowerCase() || 'jpg'
  console.log('[Diagnosis] sha256:', sha256)

  const uploadBody = { sha256, fileExtension: ext, plantType: pType }
  if (plantId) uploadBody.plantId = plantId

  const urlTheWord = await fetch(`${ENV.API_BASE_URL}/api/v1/upload/upload-url`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },

    body: JSON.stringify(uploadBody),
  })

  const urlText = await urlTheWord.text()
  console.log('[Diagnosis] upload-url response:', urlTheWord.status, urlText)

  if (!urlTheWord.ok) {
    let msg = `Upload URL failed (${urlTheWord.status})`
    try { msg = JSON.parse(urlText)?.message || msg } catch {}
    throw new Error(msg)
  }

  let uploadData
  try { uploadData = JSON.parse(urlText) } catch {
    throw new Error('Server returned invalid JSON')
  }

  if (uploadData.status === 'COMPLETED' || uploadData.message === 'Image Already processed') {
    console.log('[Diagnosis] fast track — already processed!')
    const parsed = parseResult(uploadData, plantType)
    if (parsed) return parsed
  }

  const s3Url = uploadData.uploadeUrl || uploadData.uploadUrl
    || uploadData.url || uploadData.presignedUrl
    || uploadData.data?.uploadeUrl || uploadData.data?.uploadUrl

  if (!s3Url) {
    console.error('[Diagnosis] full response:', JSON.stringify(uploadData))
    throw new Error('Backend did not return an upload URL')
  }

  console.log('[Diagnosis] connecting socket, userId:', userId)

  const socket = io(ENV.API_BASE_URL, {
    query:        { userId },
    transports:   ['websocket', 'polling'],
    reconnection: false,
  })

  await new Promise(resolve => {
    const bail = setTimeout(() => {
      console.warn('[Diagnosis] socket slow to connect — continuing anyway')
      resolve()
    }, 8000)
    socket.on('connect', () => {
      clearTimeout(bail)
      console.log('[Diagnosis] socket connected ✓', socket.id)
      resolve()
    })
    socket.on('connect_error', err => {
      clearTimeout(bail)
      console.warn('[Diagnosis] socket error:', err.message)
      resolve()
    })
  })

  const socketResult = new Promise(resolve => {
    socket.on('diagnosis_complete', theTea => {
      console.log('[Diagnosis] diagnosis_complete event:', JSON.stringify(theTea))
      let d = theTea
      if (typeof d === 'string') { try { d = JSON.parse(d) } catch {} }
      socket.disconnect()
      resolve(d)
    })

    socket.onAny((name, theTea) => {
      if (['connect', 'disconnect', 'connect_error', 'diagnosis_complete'].includes(name)) return
      console.log('[Diagnosis] other socket event "' + name + '":', JSON.stringify(theTea))
      if (theTea && (theTea.prediction !== undefined || theTea.confidence !== undefined || theTea.status === 'COMPLETED')) {
        console.log('[Diagnosis] treating "' + name + '" as result')
        socket.disconnect()
        resolve(theTea)
      }
    })

    setTimeout(() => {
      console.warn('[Diagnosis] socket timeout — falling back to HTTP poll')
      socket.disconnect()
      resolve(null)
    }, 60000)
  })

  console.log('[Diagnosis] uploading to S3...')
  const s3TheWord = await fetch(s3Url, {
    method:  'PUT',
    headers: { 'Content-Type': imageFile.type || 'image/jpeg' },
    body:    imageFile,
  })

  if (!s3TheWord.ok) {
    socket.disconnect()
    throw new Error(`S3 upload failed (${s3TheWord.status})`)
  }
  console.log('[Diagnosis] S3 upload done ✓')

  const pollResult = async () => {
    const pollUrl = `${ENV.API_BASE_URL}/api/v1/upload/scans/${sha256}?plantType=${encodeURIComponent(pType)}`
    console.log('[Diagnosis] polling:', pollUrl)

    for (let i = 1; i <= 24; i++) {
      await new Promise(r => setTimeout(r, 5000))
      console.log(`[Diagnosis] poll ${i}/24`)
      try {
        const theWord  = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${token}` } })
        const text = await theWord.text()
        console.log(`[Diagnosis] poll ${i} →`, theWord.status, text.slice(0, 200))
        if (theWord.ok) {
          const theTea   = JSON.parse(text)
          const status = theTea.status || theTea.data?.status
          if (status === 'COMPLETED') return theTea
          console.log('[Diagnosis] status:', status)
        }
      } catch (e) {
        console.warn('[Diagnosis] poll error:', e.message)
      }
    }
    return null
  }

  const rawResult = await Promise.race([
    socketResult,
    pollResult(),
  ])

  console.log('[Diagnosis] raw result:', JSON.stringify(rawResult))

  const parsed = parseResult(rawResult, plantType)
  if (parsed) return parsed

  throw new Error('Diagnosis timed out. The AI is still processing — try scanning the same image again in a few seconds.')
}
