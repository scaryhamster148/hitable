import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          nickname,
          school_id: null,
          grade: null,
          class_num: null,
        })
        navigate('/onboarding')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#24389c] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-[36px]">calendar_view_week</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#191c1d]">HiTable</h1>
          <p className="text-[14px] text-[#454652] mt-1">우리 학교 과목 & 시간표</p>
        </div>

        <div className="flex p-1 bg-[#edeeef] rounded-xl mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-[#24389c] shadow-sm' : 'text-slate-500'}`}
          >
            로그인
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-[#24389c] shadow-sm' : 'text-slate-500'}`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <input
              className="w-full px-4 py-3 bg-white border border-[#c5c5d4]/40 rounded-xl text-[14px] outline-none focus:border-[#24389c]"
              placeholder="닉네임"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="w-full px-4 py-3 bg-white border border-[#c5c5d4]/40 rounded-xl text-[14px] outline-none focus:border-[#24389c]"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full px-4 py-3 bg-white border border-[#c5c5d4]/40 rounded-xl text-[14px] outline-none focus:border-[#24389c]"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-[12px] text-[#ba1a1a]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#24389c] text-white py-3.5 rounded-xl text-[14px] font-semibold mt-2 active:scale-95 transition-transform disabled:opacity-60"
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  )
}
