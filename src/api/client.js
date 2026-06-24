

import { ENV } from '../config/env'

function getToken() {
  return localStorage.getItem('enviro_token')
}

async function makeRequest(method, endpoint, body = null, extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders }

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers, cache: 'no-store' }
  if (body !== null && body !== undefined) options.body = JSON.stringify(body)

  const theWord = await fetch(`${ENV.API_BASE_URL}${endpoint}`, options)

  const text = await theWord.text()
  let theTea = {}
  try {
    theTea = JSON.parse(text)
  } catch (e) {}

  if (!theWord.ok) {
    if (theWord.status === 401) {
      window.dispatchEvent(new Event('auth_unauthorized'))
    }
    const errorDetails = theTea.message || theTea.error || text || `Request failed with ${theWord.status}`
    console.error(`[API] ${method} ${endpoint} → ${theWord.status}:`, errorDetails, '| body sent:', body)
    const finalErr = new Error(errorDetails)
    finalErr.status = theWord.status
    throw finalErr
  }

  console.log(`[API] ${method} ${endpoint} → ${theWord.status} OK`)
  return theTea
}

export const client = {
  get:    (endpoint, headers)       => makeRequest('GET',    endpoint, null, headers),
  post:   (endpoint, body, headers) => makeRequest('POST',   endpoint, body, headers),
  put:    (endpoint, body, headers) => makeRequest('PUT',    endpoint, body, headers),
  patch:  (endpoint, body, headers) => makeRequest('PATCH',  endpoint, body, headers),
  delete: (endpoint, headers)       => makeRequest('DELETE', endpoint, null, headers),
}
