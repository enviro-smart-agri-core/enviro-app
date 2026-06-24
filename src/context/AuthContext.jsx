import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth'

const WhoAmIContext = createContext(null)

export function AuthProvider({ children }) {
  const [me,        setMe]        = useState(null)
  const [appReady,  setAppReady]  = useState(false)
  const [spinning,  setSpinning]  = useState(false)
  const [oops,      setOops]      = useState(null)

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('enviro_token')
      localStorage.removeItem('enviro_user')
      localStorage.removeItem('enviro_pass')
      setMe(null)
    }
    window.addEventListener('auth_unauthorized', handleUnauthorized)

    const savedToken = localStorage.getItem('enviro_token')
    const savedDude  = localStorage.getItem('enviro_user')

    if (savedToken && savedDude) {
      try {
        setMe(JSON.parse(savedDude))
      } catch {
        handleUnauthorized()
      }
    }

    const verifyPassword = () => {
      const userStr = localStorage.getItem('enviro_user')
      const passStr = localStorage.getItem('enviro_pass')
      if (userStr && passStr) {
        try {
          const parsed = JSON.parse(userStr)
          authApi.letBroIn(parsed.email, passStr).catch(() => handleUnauthorized())
        } catch(e) {}
      }
    }

    if (savedDude) verifyPassword()

    setAppReady(true)

    return () => {
      window.removeEventListener('auth_unauthorized', handleUnauthorized)
    }
  }, [])

  async function login(email, password) {
    setSpinning(true)
    setOops(null)
    try {
      const theWord = await authApi.letBroIn(email, password)

      const token = theWord.token || theWord.data?.token
      if (!token) throw new Error('Server did not return a token — something is wrong')

      const serverUser = theWord.user || theWord.data?.user || {}
      const freshDude  = {
        id:       serverUser._id      || serverUser.id       || '?',
        name:     serverUser.name     || email.split('@')[0],
        username: serverUser.username || email.split('@')[0],
        email:    serverUser.email    || email,
        avatar:   serverUser.avatar   || null,
        dob:      serverUser.dob      || null,
      }

      localStorage.setItem('enviro_token', token)
      localStorage.setItem('enviro_user', JSON.stringify(freshDude))
      localStorage.setItem('enviro_pass', password)
      setMe(freshDude)

      return true
    } catch (e) {
      setOops(e.message)
      return false
    } finally {
      setSpinning(false)
    }
  }

  async function signUp(email, password, fullName = '', username = '') {
    setSpinning(true)
    setOops(null)
    try {
      await authApi.setupBroRequest(email, password, fullName, username)

      return true
    } catch (e) {
      setOops(e.message)
      return false
    } finally {
      setSpinning(false)
    }
  }

  async function verifyOTP(email, otp) {
    setSpinning(true)
    setOops(null)
    try {
      const theWord = await authApi.checkBallKnowledge(email, otp)
      const token = theWord.token || theWord.data?.token

      if (token) {
        const serverUser = theWord.user || theWord.data?.user || {}
        const newGuy = {
          id:       serverUser._id      || serverUser.id       || '?',
          name:     serverUser.name     || email.split('@')[0],
          username: serverUser.username || email.split('@')[0],
          email:    serverUser.email    || email,
          avatar:   null,
          dob:      null,
        }
        localStorage.setItem('enviro_token', token)
        localStorage.setItem('enviro_user', JSON.stringify(newGuy))
        setMe(newGuy)
      }
      return true
    } catch (e) {
      setOops(e.message)
      return false
    } finally {
      setSpinning(false)
    }
  }

  async function requestPasswordReset(email) {
    setSpinning(true)
    setOops(null)
    try {
      await authApi.broForgotPwd(email)
      return true
    } catch (e) {
      setOops(e.message)
      return false
    } finally {
      setSpinning(false)
    }
  }

  async function submitPasswordReset(userId, token, newPassword) {
    setSpinning(true)
    setOops(null)
    try {
      await authApi.resetBroPwd(userId, token, newPassword)
      return true
    } catch (e) {
      setOops(e.message)
      return false
    } finally {
      setSpinning(false)
    }
  }

  async function tweakProfile(newName, newEmail) {
    setSpinning(true)
    setOops(null)
    try {
      const patched = { ...me, name: newName, email: newEmail }
      localStorage.setItem('enviro_user', JSON.stringify(patched))
      setMe(patched)
      return true
    } catch (e) {
      setOops(e.message)
      return false
    } finally {
      setSpinning(false)
    }
  }

  async function swapAvatar(base64blob) {
    try {
      const patched = { ...me, avatar: base64blob }
      localStorage.setItem('enviro_user', JSON.stringify(patched))
      setMe(patched)
      return true
    } catch {
      return false
    }
  }

  async function changePassword(_oldPass, _newPass) {
    setSpinning(true)
    setOops(null)
    try {

      await new Promise(r => setTimeout(r, 800))
      return true
    } catch (e) {
      setOops(e.message)
      return false
    } finally {
      setSpinning(false)
    }
  }

  function kickOut() {

    localStorage.removeItem('enviro_token')
    localStorage.removeItem('enviro_user')
    localStorage.removeItem('enviro_pass')
    setMe(null)
  }

  return (
    <WhoAmIContext.Provider value={{
      bro:           me,
      vibeReady:     appReady,
      spinning:      spinning,
      fuckshit:      oops,
      letBroIn:      login,
      setupBro:      signUp,
      checkBallKnowledge: verifyOTP,
      broForgotPwd:  requestPasswordReset,
      resetBroPwd:   submitPasswordReset,
      yeetBro:       kickOut,
      tweakBro:      tweakProfile,
      swapBroAvatar: swapAvatar,
      changeBroPwd:  changePassword,
    }}>
      {children}
    </WhoAmIContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(WhoAmIContext)
}
