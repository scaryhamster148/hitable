import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { UserSubject, TimetableSlot } from '../types'

const DAYS = ['월', '화', '수', '목', '금']
const PERIODS = [1, 2, 3, 4, 5, 6, 7]

export default function TimetablePage() {
  const { user } = useAuth()
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [cart, setCart] = useState<UserSubject[]>([])
  const [selecting, setSelecting] = useState<{ day: number; period: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) { loadSlots(); loadCart() }
  }, [user])

  async function loadSlots() {
    const { data } = await supabase
      .from('timetable_slots')
      .select('*, user_subject:user_subjects(*, subject:subjects(*))')
      .eq('user_id', user!.id)
    setSlots(data ?? [])
    setLoading(false)
  }

  async function loadCart() {
    const { data } = await supabase
      .from('user_subjects')
      .select('*, subject:subjects(*)')
      .eq('user_id', user!.id)
    setCart(data ?? [])
  }

  function getSlot(day: number, period: number) {
    return slots.find(s => s.day_of_week === day && s.period === period)
  }

  async function assignSubject(day: number, period: number, userSubjectId: string | null) {
    const existing = getSlot(day, period)
    if (existing) {
      if (userSubjectId === null) {
        await supabase.from('timetable_slots').delete().eq('id', existing.id)
        setSlots(prev => prev.filter(s => s.id !== existing.id))
      } else {
        await supabase.from('timetable_slots').update({ user_subject_id: userSubjectId }).eq('id', existing.id)
        await loadSlots()
      }
    } else if (userSubjectId !== null) {
      await supabase.from('timetable_slots').insert({
        user_id: user!.id, day_of_week: day, period, user_subject_id: userSubjectId,
      })
      await loadSlots()
    }
    setSelecting(null)
  }

  const COLORS = [
    'bg-[#dee0ff] text-[#00105c]', 'bg-[#8bf1e6] text-[#00201d]',
    'bg-[#ffddba] text-[#2b1700]', 'bg-[#ffdad6] text-[#93000a]',
    'bg-[#e1e3e4] text-[#191c1d]',
  ]

  const subjectColorMap = new Map<string, string>()
  cart.forEach((us, i) => {
    subjectColorMap.set(us.id, COLORS[i % COLORS.length])
  })

  return (
    <Layout title="시간표">
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#24389c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full border-separate border-spacing-1 min-w-[340px]">
            <thead>
              <tr>
                <th className="w-8" />
                {DAYS.map(d => (
                  <th key={d} className="text-[12px] font-semibold text-[#454652] pb-2">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period}>
                  <td className="text-[11px] text-[#757684] font-medium text-center pr-1">{period}</td>
                  {DAYS.map((_, dayIdx) => {
                    const day = dayIdx + 1
                    const slot = getSlot(day, period)
                    const us = slot?.user_subject
                    const colorClass = us ? (subjectColorMap.get(us.id) ?? COLORS[0]) : ''
                    return (
                      <td key={day}>
                        <button
                          onClick={() => setSelecting({ day, period })}
                          className={`w-full h-14 rounded-lg text-[10px] font-semibold transition-all active:scale-95 ${
                            us
                              ? `${colorClass} shadow-sm`
                              : 'bg-white border border-[#c5c5d4]/30 text-[#c5c5d4] hover:border-[#24389c]/40'
                          }`}
                        >
                          {us ? (
                            <span className="leading-tight px-1 block">{us.subject?.subject_name}</span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subject picker modal */}
      {selecting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelecting(null)}>
          <div
            className="bg-white w-full rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[16px] font-semibold text-[#191c1d]">
                {DAYS[selecting.day - 1]}요일 {selecting.period}교시
              </h3>
              {getSlot(selecting.day, selecting.period) && (
                <button
                  className="text-[12px] text-[#ba1a1a] font-semibold"
                  onClick={() => assignSubject(selecting.day, selecting.period, null)}
                >
                  비우기
                </button>
              )}
            </div>
            {cart.length === 0 ? (
              <p className="text-[14px] text-[#454652] text-center py-8">수업함에 과목을 먼저 담아주세요</p>
            ) : (
              <div className="flex flex-col gap-2">
                {cart.map(us => (
                  <button
                    key={us.id}
                    onClick={() => assignSubject(selecting.day, selecting.period, us.id)}
                    className="p-3 bg-[#f3f4f5] rounded-xl text-left hover:bg-[#dee0ff] transition-colors active:scale-[0.99]"
                  >
                    <p className="text-[14px] font-semibold text-[#191c1d]">{us.subject?.subject_name}</p>
                    {(us.custom_classroom || us.subject?.classroom) && (
                      <p className="text-[12px] text-[#454652]">{us.custom_classroom || us.subject?.classroom}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
