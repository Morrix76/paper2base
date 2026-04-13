import axios from 'axios'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiUrl } from '@/utils/apiUrl'

export type AuthUser = {
  id: string
  email: string
  credits: number
}

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isLoadingUser: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const TOKEN_KEY = 'paper2base.token'

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchMe(token: string): Promise<AuthUser> {
  const { data } = await axios.get(apiUrl('/api/v1/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data as AuthUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const t = window.localStorage.getItem(TOKEN_KEY)
    return t?.trim() ? t : null
  })

  const meQuery = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: async () => {
      if (!token) throw new Error('missing-token')
      return await fetchMe(token)
    },
    enabled: Boolean(token),
    retry: false,
  })

  const user = token ? meQuery.data ?? null : null

  const isAuthenticated = Boolean(token && user)

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  const refreshMe = useCallback(async () => {
    if (!token) return
    await meQuery.refetch()
  }, [meQuery, token])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await axios.post(apiUrl('/api/v1/auth/login'), { email, password })
    const accessToken = String((data as { access_token?: unknown }).access_token ?? '')
    if (!accessToken.trim()) throw new Error('missing-token')
    window.localStorage.setItem(TOKEN_KEY, accessToken)
    setToken(accessToken)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { data } = await axios.post(apiUrl('/api/v1/auth/register'), { email, password })
    const accessToken = String((data as { access_token?: unknown }).access_token ?? '')
    if (!accessToken.trim()) throw new Error('missing-token')
    window.localStorage.setItem(TOKEN_KEY, accessToken)
    setToken(accessToken)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated,
      isLoadingUser: meQuery.isLoading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [token, user, isAuthenticated, meQuery.isLoading, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AUTH_TOKEN_KEY = TOKEN_KEY

