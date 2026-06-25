import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchProfile(userId) {
    if (!supabase || !userId) return null

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      setError(profileError.message)
      setProfile(null)
      return null
    }

    if (!data) {
      setProfile(null)
      return null
    }

    setProfile(data)
    return data
  }

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      if (!supabase) {
        setError('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
        setLoading(false)
        return
      }

      const {
        data: { session: activeSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (!isMounted) return

      if (sessionError) {
        setError(sessionError.message)
      }

      setSession(activeSession)
      setUser(activeSession?.user ?? null)

      if (activeSession?.user) {
        await fetchProfile(activeSession.user.id)
      }

      if (isMounted) setLoading(false)
    }

    loadSession()

    if (!supabase) {
      return () => {
        isMounted = false
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)

      if (nextSession?.user) {
        await fetchProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function login(email, password) {
    setLoading(true)
    setError(null)

    if (!supabase) {
      const message = 'Supabase no esta configurado.'
      setError(message)
      setLoading(false)
      return { data: null, error: new Error(message), profile: null }
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return { data, error: loginError, profile: null }
    }

    const userProfile = await fetchProfile(data.user.id)
    setLoading(false)
    return { data, error: null, profile: userProfile }
  }

  async function register({ email, password, fullName, role, phone }) {
    setLoading(true)
    setError(null)

    if (!supabase) {
      const message = 'Supabase no esta configurado.'
      setError(message)
      setLoading(false)
      return { data: null, error: new Error(message), profile: null }
    }

    const { data, error: registerError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone,
        },
      },
    })

    if (registerError) {
      setError(registerError.message)
      setLoading(false)
      return { data, error: registerError, profile: null }
    }

    const userProfile = data.user ? await fetchProfile(data.user.id) : null
    setLoading(false)
    return { data, error: null, profile: userProfile }
  }

  async function logout() {
    setLoading(true)
    setError(null)

    if (!supabase) {
      setLoading(false)
      return { error: null }
    }

    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      setError(logoutError.message)
      setLoading(false)
      return { error: logoutError }
    }

    setSession(null)
    setUser(null)
    setProfile(null)
    setLoading(false)
    return { error: null }
  }

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      error,
      fetchProfile,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, session, profile, loading, error],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
