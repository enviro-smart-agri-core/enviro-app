import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SAFE_TABS = ['/home', '/sensors', '/shop', '/scan', '/profile']

export function useBackHandler() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const pathnameRef = useRef(location.pathname)

  pathnameRef.current = location.pathname

  useEffect(() => {
    let listener = null

    async function register() {
      try {

        const { App } = await import('@capacitor/app')

        listener = await App.addListener('backButton', ({ canGoBack }) => {
          const pathname  = pathnameRef.current
          const onMainTab = SAFE_TABS.includes(pathname)

          if (onMainTab) {

            return
          }

          navigate(-1)
        })
      } catch {

        function handlePopState() {
          const pathname  = pathnameRef.current
          const onMainTab = SAFE_TABS.includes(pathname)

          window.history.pushState({ backGuard: true }, '')

          if (!onMainTab) {
            navigate(-1)
          }
        }

        window.history.pushState({ backGuard: true }, '')
        window.addEventListener('popstate', handlePopState)
        listener = { remove: () => window.removeEventListener('popstate', handlePopState) }
      }
    }

    register()

    return () => {
      listener?.remove()
    }
  }, [navigate])
}
