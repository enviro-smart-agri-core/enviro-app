

import { useState } from 'react'
import { authApi } from '../api/auth'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function login(email, password) {
    setLoading(true); setError(null)
    try {
      const data = await authApi.login(email, password)
      localStorage.setItem('enviro_token', data.token)
      setUser(data.user)
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function register(email, password) {
    setLoading(true); setError(null)
    try {
      const data = await authApi.register(email, password)
      localStorage.setItem('enviro_token', data.token)
      setUser(data.user)
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('enviro_token')
    setUser(null)
  }

  return { user, loading, error, login, register, logout }
}
