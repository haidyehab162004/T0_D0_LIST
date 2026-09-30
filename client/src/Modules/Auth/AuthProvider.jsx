import { useEffect, useState } from 'react'
import { authApi } from './authApi.js'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await authApi.getMe()
        setUser(response.data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  async function login(credentials) {
    const response = await authApi.login(credentials)
    setUser(response.data.user)
    return response.data
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }

  async function refreshUser() {
    try {
      const response = await authApi.getMe()
      setUser(response.data.user)
      return response.data.user
    } catch {
      setUser(null)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
