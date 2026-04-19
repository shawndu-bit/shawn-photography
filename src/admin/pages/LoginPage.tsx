import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuthContext } from '@/admin/context/AdminAuthContext'

export default function LoginPage() {
  const { login } = useAdminAuthContext()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = login(password)
    if (ok) {
      navigate('/admin', { replace: true })
    } else {
      setError('密码错误，请重试')
      setPassword('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0e0e] px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <p className="font-display text-xl tracking-[0.45em] text-white">SHAWN</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.4em] text-white/35">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">管理密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="输入密码…"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.06]"
            />
            {error && (
              <p className="text-[12px] text-red-400">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="rounded-full bg-white py-3 text-[13px] font-medium tracking-wide text-black transition hover:bg-white/90"
          >
            登录
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] text-white/25">
          默认密码：<span className="font-mono text-white/40">shawn2026</span>
        </p>
      </div>
    </div>
  )
}
