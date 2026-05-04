import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import SubjectCard from '../components/SubjectCard'
import CartBadge from '../components/CartBadge'
import { supabase } from '../lib/supabase'
import { fetchTimetable, extractUniqueSubjects } from '../lib/neis'
import { useAuth } from '../contexts/AuthContext'
import type { Subject, UserSubject } from '../types'

export default function SubjectsPage() {
  const { user, profile } = useAuth()
  const [grade, setGrade] = useState(1)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [cart, setCart] = useState<UserSubject[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (profile?.school_id) loadSubjects()
  }, [grade, profile?.school_id])

  useEffect(() => {
    if (user) loadCart()
  }, [user])

  async function loadSubjects() {
    setLoading(true)
    const { data: cached } = await supabase
      .from('subjects')
      .select('*')
      .eq('school_id', profile!.school_id)
      .eq('grade', grade)
      .order('subject_name')

    if (cached && cached.length > 0) {
      setSubjects(cached)
      setLoading(false)
      return
    }

    // Fetch from NEIS and cache
    const school = profile!.school!
    const items = await fetchTimetable(school.office_code, school.neis_code, grade)
    const unique = extractUniqueSubjects(items)

    if (unique.length > 0) {
      const rows = unique.map(s => ({
        school_id: profile!.school_id,
        grade,
        subject_name: s.subject_name,
        subject_category: null,
        classroom: s.classroom,
        is_mobile: s.is_mobile,
      }))
      const { data: inserted } = await supabase.from('subjects').upsert(rows, {
        onConflict: 'school_id,grade,subject_name',
        ignoreDuplicates: false,
      }).select()
      setSubjects(inserted ?? [])
    }
    setLoading(false)
  }

  async function loadCart() {
    const { data } = await supabase
      .from('user_subjects')
      .select('*, subject:subjects(*)')
      .eq('user_id', user!.id)
    setCart(data ?? [])
  }

  async function toggleCart(subject: Subject) {
    const existing = cart.find(c => c.subject_id === subject.id)
    if (existing) {
      await supabase.from('user_subjects').delete().eq('id', existing.id)
      setCart(prev => prev.filter(c => c.id !== existing.id))
    } else {
      const { data } = await supabase
        .from('user_subjects')
        .insert({ user_id: user!.id, subject_id: subject.id, custom_classroom: null })
        .select('*, subject:subjects(*)')
        .single()
      if (data) setCart(prev => [...prev, data])
    }
  }

  const cartSubjectIds = new Set(cart.map(c => c.subject_id))
  const filtered = subjects.filter(s =>
    s.subject_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="과목 탐색">
      <div className="flex p-1 bg-[#edeeef] rounded-xl mb-6">
        {[1, 2, 3].map(g => (
          <button
            key={g}
            onClick={() => setGrade(g)}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all ${
              grade === g
                ? 'bg-white text-[#24389c] shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            {g}학년
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[20px]">search</span>
        <input
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#c5c5d4]/40 rounded-xl text-[14px] outline-none focus:border-[#24389c] transition-colors"
          placeholder="과목 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-[#24389c] border-t-transparent rounded-full animate-spin" />
          <span className="text-[14px] text-[#454652]">NEIS에서 과목 정보를 불러오는 중...</span>
        </div>
      ) : !profile?.school_id ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <span className="material-symbols-outlined text-[48px] text-[#c5c5d4]">school</span>
          <p className="text-[16px] font-semibold text-[#191c1d]">학교를 먼저 선택해주세요</p>
          <p className="text-[14px] text-[#454652]">홈에서 학교를 설정할 수 있어요</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="material-symbols-outlined text-[48px] text-[#c5c5d4]">search_off</span>
          <p className="text-[14px] text-[#454652]">과목을 찾을 수 없어요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              isInCart={cartSubjectIds.has(subject.id)}
              onToggleCart={toggleCart}
            />
          ))}
        </div>
      )}

      <CartBadge cart={cart} />
    </Layout>
  )
}
