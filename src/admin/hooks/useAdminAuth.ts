import { useState, useEffect } from 'react'

const AUTH_KEY = 'shawn-admin-authed'
const ADMIN_PASSWORD = 'shawn2026'

export function useAdminAuth() {
  const [authed, setAuthed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const val = sessionStorage.getItem(AUTH_KEY)
    setAuthed(val === 'true')
    setReady(true)
  }, [])

  function login(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setAuthed(true)
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthed(false)
  }

  return { authed, ready, login, logout }
}
