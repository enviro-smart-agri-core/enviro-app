import { createContext, useContext, useState } from 'react'

const BeenHereBeforeContext = createContext(null)

export function OnboardingProvider({ children }) {
  const [alreadySawIt, setAlreadySawIt] = useState(
    () => localStorage.getItem('enviro_onboarding_done') === 'true'
  )

  function finishedOnboarding() {
    localStorage.setItem('enviro_onboarding_done', 'true')
    setAlreadySawIt(true)
  }

  return (
    <BeenHereBeforeContext.Provider value={{ seen: alreadySawIt, markDone: finishedOnboarding }}>
      {children}
    </BeenHereBeforeContext.Provider>
  )
}

export function useOnboarding() {
  return useContext(BeenHereBeforeContext)
}
