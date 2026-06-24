import { createContext, useContext, useState } from 'react'

const PhonePrivacyContext = createContext(null)

export function PermissionsProvider({ children }) {

  const [vibe, setVibe] = useState(() =>
    localStorage.getItem('enviro_perms_sorted') === 'yep' ? 'done' : 'pending'
  )

  const [whatWeGot, setWhatWeGot] = useState({
    location: 'dunno',
    camera:   'dunno',
  })

  async function askNicely() {
    setVibe('asking')

    const result = { location: 'dunno', camera: 'dunno' }

    await Promise.all([

      new Promise(done => {
        if (!navigator.geolocation) { done(); return }
        navigator.geolocation.getCurrentPosition(
          () => { result.location = 'yep';  done() },
          () => { result.location = 'nope'; done() },
          { timeout: 3000, maximumAge: 60000, enableHighAccuracy: false }
        )
      }),

      (async () => {
        if (!navigator.mediaDevices?.getUserMedia) return
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          stream.getTracks().forEach(t => t.stop())
          result.camera = 'yep'
        } catch {
          result.camera = 'nope'
        }
      })(),
    ])

    setWhatWeGot(result)
    setVibe('done')
    localStorage.setItem('enviro_perms_sorted', 'yep')
  }

  function nvm() {

    setVibe('done')
    localStorage.setItem('enviro_perms_sorted', 'yep')
  }

  function resetForTesting() {
    localStorage.removeItem('enviro_perms_sorted')
    setVibe('pending')
  }

  return (
    <PhonePrivacyContext.Provider value={{
      vibe:       vibe,
      whatWeGot:  whatWeGot,
      askNicely:  askNicely,
      nvm:        nvm,
      reset:      resetForTesting,
    }}>
      {children}
    </PhonePrivacyContext.Provider>
  )
}

export function usePermissions() {
  return useContext(PhonePrivacyContext)
}
