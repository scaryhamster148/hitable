import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { searchSchools } from '../lib/neis'
import { useAuth } from '../contexts/AuthContext'
import type { NeisSchool } from '../types'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState<'school' | 'grade'>('school')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NeisSchool[]>([])
  const [selected, setSelected] = useState<NeisSchool | null>(null)
  const [grade, setGrade] = useState<number>(1)
  const [classNum, setClassNum] = useState<number>(1)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    const data = await searchSchools(query)
    setResults(data)
    setSearching(false)
  }

  async function handleSelectSchool(school: NeisSchool) {
    // Upsert school into DB
    await supabase.from('schools').upsert({
      neis_code: school.SD_SCHUL_CODE,
      office_code: school.ATPT_OFCDC_SC_CODE,
      name: school.SCHUL_NM,
      address: school.ORG_RDNMA,
    }, { onConflict: 'neis_code' })
    setSelected(school)
    setStep('grade')
  }

  async function handleFinish() {
    if (!selected || !user) return
    setSaving(true)
    const { data: schoolRow } = await supabase
      .from('schools')
      .select('id')
      .eq('neis_code', selected.SD_SCHUL_CODE)
      .single()

    if (schoolRow) {
      await supabase.from('profiles').update({
        school_id: schoolRow.id,
        grade,
        class_num: classNum,
      }).eq('id', user.id)
    }
    await refreshProfile()
    navigate('/')
  }

  if (step === 'grade') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col px-5 pt-12">
        <button onClick={() => setStep('school')} className="flex items-center gap-1 text-[#454652] mb-6">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="text-[14px]">학교 다시 선택</span>
        </button>
        <h2 className="text-[24px] font-semibold text-[#191c1d] mb-1">{selected?.SCHUL_NM}</h2>
        <p className="text-[14px] text-[#454652] mb-8">학년과 반을 선택해주세요</p>

        <p className="text-[12px] font-semibold text-[#24389c] uppercase tracking-wider mb-3">학년</p>
        <div className="flex gap-3 mb-6">
          {[1, 2, 3].map(g => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`flex-1 py-3 rounded-xl text-[14px] font-semibold border-2 transition-all ${grade === g ? 'bg-[#24389c] text-white border-[#24389c]' : 'bg-white text-[#454652] border-[#c5c5d4]'}`}
            >
              {g}학년
            </button>
          ))}
        </div>

        <p className="text-[12px] font-semibold text-[#24389c] uppercase tracking-wider mb-3">반</p>
        <div className="grid grid-cols-5 gap-2 mb-10">
          {Array.from({ length: 15 }, (_, i) => i + 1).map(c => (
            <button
              key={c}
              onClick={() => setClassNum(c)}
              className={`py-2.5 rounded-lg text-[14px] font-semibold border-2 transition-all ${classNum === c ? 'bg-[#24389c] text-white border-[#24389c]' : 'bg-white text-[#454652] border-[#c5c5d4]'}`}
            >
              {c}반
            </button>
          ))}
        </div>

        <button
          onClick={handleFinish}
          disabled={saving}
          className="w-full bg-[#24389c] text-white py-4 rounded-xl text-[14px] font-semibold active:scale-95 transition-transform disabled:opacity-60"
        >
          {saving ? '저장 중...' : '시작하기'}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col px-5 pt-12">
      <div className="w-12 h-12 bg-[#24389c] rounded-2xl flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-white text-[24px]">school</span>
      </div>
      <h2 className="text-[24px] font-semibold text-[#191c1d] mb-1">학교 검색</h2>
      <p className="text-[14px] text-[#454652] mb-6">재학 중인 고등학교를 검색해주세요</p>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 px-4 py-3 bg-white border border-[#c5c5d4]/40 rounded-xl text-[14px] outline-none focus:border-[#24389c]"
          placeholder="학교 이름 검색 (예: 한국고등학교)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-4 bg-[#24389c] text-white rounded-xl active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
      </div>

      {searching && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#24389c] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {results.map(school => (
          <button
            key={school.SD_SCHUL_CODE}
            onClick={() => handleSelectSchool(school)}
            className="bg-white p-4 rounded-xl border border-[#c5c5d4]/40 text-left hover:border-[#24389c] transition-colors active:scale-[0.99]"
          >
            <p className="text-[16px] font-semibold text-[#191c1d]">{school.SCHUL_NM}</p>
            <p className="text-[12px] text-[#454652] mt-0.5">{school.LCTN_SC_NM} · {school.ORG_RDNMA}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
