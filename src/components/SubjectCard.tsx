import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Subject } from '../types'

const CATEGORY_LABELS: Record<string, string> = {
  '수학': 'Mathematics', '영어': 'English', '국어': 'Korean Literature',
  '사회': 'Social Studies', '과학': 'Science', '물리': 'Physics',
  '화학': 'Chemistry', '생명': 'Biology', '지구': 'Earth Science',
  '역사': 'History', '도덕': 'Ethics', '음악': 'Music',
  '미술': 'Art', '체육': 'Physical Education', '정보': 'Informatics',
}

function getCategoryLabel(name: string): string {
  for (const [key, value] of Object.entries(CATEGORY_LABELS)) {
    if (name.includes(key)) return value
  }
  return 'Subject'
}

interface Props {
  subject: Subject
  isInCart: boolean
  onToggleCart: (subject: Subject) => void
}

export default function SubjectCard({ subject, isInCart, onToggleCart }: Props) {
  const navigate = useNavigate()
  const [editingLocation, setEditingLocation] = useState(false)
  const [customLocation, setCustomLocation] = useState(subject.classroom ?? '')

  const categoryLabel = getCategoryLabel(subject.subject_name)
  const displayLocation = customLocation || subject.classroom

  if (isInCart) {
    return (
      <div className="bg-[#dee0ff] p-4 rounded-xl shadow-[0_4px_12px_rgba(36,56,156,0.12)] border-2 border-[#24389c] flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium tracking-wider text-[#293ca0] uppercase">{categoryLabel}</span>
            <h3 className="text-[20px] font-semibold leading-7 text-[#00105c]">{subject.subject_name}</h3>
          </div>
          <span className="bg-[#24389c] text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            담김
          </span>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-[#293ca0]">
            <span className="material-symbols-outlined text-[18px]">school</span>
            <span className="text-[14px]">{subject.grade}학년</span>
          </div>
          <div className="flex items-center gap-1 text-[#293ca0]">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            {editingLocation ? (
              <input
                autoFocus
                className="border-b border-[#24389c] bg-transparent text-[14px] text-[#00105c] outline-none w-28"
                value={customLocation}
                onChange={e => setCustomLocation(e.target.value)}
                onBlur={() => setEditingLocation(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingLocation(false)}
                placeholder="수업 장소 입력"
              />
            ) : (
              <button
                className="text-[14px] underline decoration-dotted"
                onClick={() => setEditingLocation(true)}
              >
                {displayLocation || '장소 입력'}
              </button>
            )}
          </div>
          {subject.is_mobile && (
            <span className="text-[10px] font-bold bg-[#8bf1e6] text-[#006f67] px-2 py-0.5 rounded-full">이동수업</span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            className="flex-1 bg-[#00105c] text-white py-3 rounded-lg text-[14px] font-semibold active:scale-95 transition-transform"
            onClick={() => onToggleCart(subject)}
          >
            취소하기
          </button>
          <button
            className="p-3 rounded-lg border border-[#c5c5d4] text-[#757684] hover:bg-[#edeeef] transition-colors"
            onClick={() => navigate(`/subject/${subject.id}`)}
          >
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-[0_4px_12px_rgba(36,56,156,0.06)] border border-[#c5c5d4]/30 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium tracking-wider text-[#24389c] uppercase">{categoryLabel}</span>
          <h3 className="text-[20px] font-semibold leading-7 text-[#191c1d]">{subject.subject_name}</h3>
        </div>
        {subject.is_mobile && (
          <span className="bg-[#8bf1e6] text-[#006f67] px-2 py-1 rounded-full text-[10px] font-bold">이동 수업</span>
        )}
      </div>

      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1 text-[#454652]">
          <span className="material-symbols-outlined text-[18px]">school</span>
          <span className="text-[14px]">{subject.grade}학년</span>
        </div>
        {displayLocation && (
          <div className="flex items-center gap-1 text-[#454652]">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span className="text-[14px]">{displayLocation}</span>
          </div>
        )}
        {!displayLocation && (
          <button
            className="flex items-center gap-1 text-[#454652] underline decoration-dotted"
            onClick={() => setEditingLocation(true)}
          >
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span className="text-[14px]">장소 직접 입력</span>
          </button>
        )}
      </div>

      {editingLocation && (
        <input
          autoFocus
          className="border border-[#c5c5d4] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#24389c]"
          value={customLocation}
          onChange={e => setCustomLocation(e.target.value)}
          onBlur={() => setEditingLocation(false)}
          onKeyDown={e => e.key === 'Enter' && setEditingLocation(false)}
          placeholder="수업 장소를 입력하세요"
        />
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          className="flex-1 bg-[#24389c] text-white py-3 rounded-lg text-[14px] font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
          onClick={() => onToggleCart(subject)}
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          담기
        </button>
        <button
          className="p-3 rounded-lg border border-[#c5c5d4] text-[#757684] hover:bg-[#edeeef] transition-colors"
          onClick={() => navigate(`/subject/${subject.id}`)}
        >
          <span className="material-symbols-outlined">info</span>
        </button>
      </div>
    </div>
  )
}
