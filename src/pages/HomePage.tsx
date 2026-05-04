import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { TimetableSlot } from '../types'

const DAYS = ['월', '화', '수', '목', '금']

export default function HomePage() {
  const { profile } = useAuth()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [today] = useState(new Date().getDay()) // 0=일, 1=월...5=금, 6=토
  const todayIndex = today >= 1 && today <= 5 ? today : 1

  useEffect(() => {
    if (user) loadTodaySlots()
  }, [user])

  async function loadTodaySlots() {
    const { data } = await supabase
      .from('timetable_slots')
      .select('*, user_subject:user_subjects(*, subject:subjects(*))')
      .eq('user_id', user!.id)
      .eq('day_of_week', todayIndex)
      .order('period')
    setSlots(data ?? [])
  }

  if (!profile?.school_id) {
    return (
      <Layout title="HiTable">
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 bg-[#dee0ff] rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[#24389c] text-[40px]">school</span>
          </div>
          <h2 className="text-[24px] font-semibold text-[#191c1d]">학교를 설정해주세요</h2>
          <p className="text-[14px] text-[#454652]">학교와 학년을 설정하면<br/>과목 탐색 및 시간표를 사용할 수 있어요</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-[#24389c] text-white px-8 py-3.5 rounded-xl text-[14px] font-semibold mt-2 active:scale-95 transition-transform"
          >
            학교 설정하기
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-[#24389c] uppercase tracking-wider mb-1">{profile.school?.name}</p>
        <h2 className="text-[24px] font-semibold text-[#191c1d]">{profile.grade}학년 {profile.class_num}반</h2>
      </div>

      {/* Today's timetable */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#c5c5d4]/20 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[16px] font-semibold text-[#191c1d]">오늘 ({DAYS[todayIndex - 1]}요일) 시간표</p>
          <button onClick={() => navigate('/timetable')} className="text-[12px] text-[#24389c] font-semibold">전체보기</button>
        </div>
        {slots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[14px] text-[#454652]">오늘 수업이 없거나 시간표를 아직 구성하지 않았어요</p>
            <button onClick={() => navigate('/timetable')} className="mt-3 text-[14px] text-[#24389c] font-semibold underline">시간표 구성하기</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {slots.map(slot => (
              <div key={slot.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f3f4f5] transition-colors">
                <span className="w-6 text-[12px] font-semibold text-[#24389c] text-center">{slot.period}</span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#191c1d]">{slot.user_subject?.subject?.subject_name}</p>
                  {(slot.user_subject?.custom_classroom || slot.user_subject?.subject?.classroom) && (
                    <p className="text-[12px] text-[#454652]">
                      {slot.user_subject?.custom_classroom || slot.user_subject?.subject?.classroom}
                    </p>
                  )}
                </div>
                {slot.user_subject?.subject?.is_mobile && (
                  <span className="text-[10px] font-bold bg-[#8bf1e6] text-[#006f67] px-2 py-0.5 rounded-full">이동</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/subjects')}
          className="bg-[#dee0ff] p-4 rounded-xl text-left active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[#24389c] text-[28px] mb-2 block">search</span>
          <p className="text-[14px] font-semibold text-[#00105c]">과목 탐색</p>
          <p className="text-[12px] text-[#293ca0]">수업 찾아보기</p>
        </button>
        <button
          onClick={() => navigate('/cart')}
          className="bg-[#8bf1e6] p-4 rounded-xl text-left active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[#006a63] text-[28px] mb-2 block">shopping_basket</span>
          <p className="text-[14px] font-semibold text-[#00201d]">내 수업함</p>
          <p className="text-[12px] text-[#00504a]">담은 과목 보기</p>
        </button>
      </div>
    </Layout>
  )
}
