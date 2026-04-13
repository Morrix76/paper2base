import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { parseApiError } from '@/utils/apiError'

export function RegisterPage({ onGoLogin }: { onGoLogin: () => void }) {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Le password non coincidono.')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full rounded-2xl border border-gray-100 shadow-xs">
      <CardHeader>
        <CardTitle className="text-base">Registrazione</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="rounded-lg border-gray-200 focus-visible:ring-violet-500/30"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="rounded-lg border-gray-200 focus-visible:ring-violet-500/30"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm_password">Conferma password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="rounded-lg border-gray-200 focus-visible:ring-violet-500/30"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}
          <Button
            type="submit"
            disabled={
              loading || !email.trim() || !password.trim() || password !== confirmPassword
            }
            className="w-full rounded-lg bg-gray-900 py-3 text-white hover:bg-gray-700"
          >
            Crea account
          </Button>
          <button
            type="button"
            onClick={onGoLogin}
            className="w-full text-sm font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
          >
            Hai già un account? Login
          </button>
        </form>
      </CardContent>
    </Card>
  )
}

