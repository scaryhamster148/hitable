import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { UserSubject } from '../types'

export default function CartPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState<UserSubject[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadCart()
  }, [user])

  async function loadCart() {
    const { data } = await supabase
      .from('user_subjects')
      .select('*, subject:subjects(*)')
      .eq('user_id', user!.id)
      .order('created_at')
    setCart(data ?? [])
    setLoading(false)
  }

  async function removeFromCart(id: string) {
    await supabase.from('user_subjects').delete().eq('id', id)
    setCart(prev => prev.filter(c => c.id !== id))
  }

  async function saveLocation(id: string) {
    await supabase.from('user_subjects').update({ custom_classroom: editValue || null }).eq('id', id)
    setCart(prev => prev.map(c => c.id === id ? { ...c, custom_classroom: editValue || null } : c))
    setEditingId(null)
  }

  return (
    <Layout title="내 수업함">
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#24389c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-[64px] text-[#c5c5d4]">shopping_basket</span>
          <p className="text-[16px] font-semibold text-[#191c1d]">수업함이 비어있어요</p>
          <p className="text-[14px] text-[#454652]">과목 탐색에서 과목을 담아보세요</p>
          <button
            onClick={() => navigate('/subjects')}
            className="bg-[#24389c] text-white px-6 py-3 rounded-xl text-[14px] font-semibold mt-2 active:scale-95 transition-transform"
          >
            과목 탐색하기
          </button>
        </div>
      ) : (
        <>
          <p className="text-[12px] text-[#454652] mb-4">총 {cart.length}개 과목 · 시간표에서 배치해보세요</p>
          <div className="flex flex-col gap-3 mb-6">
            {cart.map(us => (
              <div key={us.id} className="bg-white p-4 rounded-xl border border-[#c5c5d4]/30 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[16px] font-semibold text-[#191c1d]">{us.subject?.subject_name}</p>
                    <p className="text-[12px] text-[#454652] mt-0.5">{us.subject?.grade}학년</p>
                  </div>
                  <button onClick={() => removeFromCart(us.id)} className="p-1 text-[#757684] hover:text-[#ba1a1a] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="material-symbols-outlined text-[16px] text-[#454652]">location_on</span>
                  {editingId === us.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        autoFocus
                        className="flex-1 border-b border-[#24389c] text-[14px] outline-none"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveLocation(us.id)}
                        placeholder="수업 장소 입력"
                      />
                      <button onClick={() => saveLocation(us.id)} className="text-[#24389c] text-[12px] font-semibold">저장</button>
                    </div>
                  ) : (
                    <button
                      className="text-[14px] text-[#454652] underline decoration-dotted"
                      onClick={() => { setEditingId(us.id); setEditValue(us.custom_classroom ?? us.subject?.classroom ?? '') }}
                    >
                      {us.custom_classroom || us.subject?.classroom || '장소 입력'}
                    </button>
                  )}
                  {us.subject?.is_mobile && !us.custom_classroom && (
                    <span className="text-[10px] font-bold bg-[#8bf1e6] text-[#006f67] px-2 py-0.5 rounded-full">이동수업</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/timetable')}
            className="w-full bg-[#24389c] text-white py-4 rounded-xl text-[14px] font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_view_week</span>
            시간표 구성하기
          </button>
        </>
      )}
    </Layout>
  )
}
