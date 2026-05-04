import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Subject, ClassReview, ExamInfo, ChatMessage } from '../types'

type Tab = 'reviews' | 'exams' | 'chat'

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [tab, setTab] = useState<Tab>('reviews')
  const [reviews, setReviews] = useState<ClassReview[]>([])
  const [exams, setExams] = useState<ExamInfo[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [newReview, setNewReview] = useState({ rating: 5, content: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) { loadSubject(); loadReviews(); loadExams(); loadMessages() }
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`chat:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `subject_id=eq.${id}` },
        payload => setMessages(prev => [...prev, payload.new as ChatMessage])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function loadSubject() {
    const { data } = await supabase.from('subjects').select('*').eq('id', id).single()
    setSubject(data)
  }
  async function loadReviews() {
    const { data } = await supabase.from('class_reviews').select('*, profile:profiles(nickname)').eq('subject_id', id).order('created_at', { ascending: false })
    setReviews(data ?? [])
  }
  async function loadExams() {
    const { data } = await supabase.from('exam_info').select('*, profile:profiles(nickname)').eq('subject_id', id).order('exam_date', { ascending: true })
    setExams(data ?? [])
  }
  async function loadMessages() {
    const { data } = await supabase.from('chat_messages').select('*, profile:profiles(nickname)').eq('subject_id', id).order('created_at')
    setMessages(data ?? [])
  }

  async function sendMessage() {
    if (!newMsg.trim() || !user) return
    await supabase.from('chat_messages').insert({ subject_id: id, user_id: user.id, message: newMsg.trim() })
    setNewMsg('')
  }

  async function submitReview() {
    if (!newReview.content.trim() || !user) return
    await supabase.from('class_reviews').insert({ subject_id: id, user_id: user.id, ...newReview })
    setNewReview({ rating: 5, content: '' })
    setShowReviewForm(false)
    loadReviews()
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm flex items-center gap-3 px-5 h-16">
        <button onClick={() => navigate(-1)} className="p-1">
          <span className="material-symbols-outlined text-[#454652]">arrow_back</span>
        </button>
        <div className="flex-1">
          <p className="text-[20px] font-semibold text-[#191c1d]">{subject?.subject_name}</p>
          <p className="text-[12px] text-[#454652]">{subject?.grade}학년 {subject?.classroom && `· ${subject.classroom}`}</p>
        </div>
        {subject?.is_mobile && (
          <span className="bg-[#8bf1e6] text-[#006f67] px-2 py-1 rounded-full text-[10px] font-bold">이동수업</span>
        )}
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[#e1e3e4] bg-white px-5">
        {(['reviews', 'exams', 'chat'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[14px] font-semibold border-b-2 transition-colors ${tab === t ? 'border-[#24389c] text-[#24389c]' : 'border-transparent text-[#454652]'}`}
          >
            {t === 'reviews' ? `평가 ${avgRating ? `★${avgRating}` : ''}` : t === 'exams' ? '시험정보' : '채팅'}
          </button>
        ))}
      </div>

      <div className="px-5 pt-4 pb-32 max-w-2xl mx-auto">
        {tab === 'reviews' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full bg-[#24389c] text-white py-3 rounded-xl text-[14px] font-semibold active:scale-95 transition-transform"
            >
              평가 작성하기
            </button>
            {showReviewForm && (
              <div className="bg-white p-4 rounded-xl border border-[#c5c5d4]/40">
                <div className="flex gap-2 mb-3">
                  {[1,2,3,4,5].map(r => (
                    <button key={r} onClick={() => setNewReview(p => ({ ...p, rating: r }))}
                      className={`text-[24px] ${newReview.rating >= r ? 'text-yellow-400' : 'text-[#c5c5d4]'}`}>★</button>
                  ))}
                </div>
                <textarea
                  className="w-full border border-[#c5c5d4]/40 rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#24389c] resize-none"
                  rows={3} placeholder="수업 후기를 남겨주세요"
                  value={newReview.content}
                  onChange={e => setNewReview(p => ({ ...p, content: e.target.value }))}
                />
                <button onClick={submitReview} className="mt-2 bg-[#24389c] text-white px-4 py-2 rounded-lg text-[14px] font-semibold">등록</button>
              </div>
            )}
            {reviews.map(r => (
              <div key={r.id} className="bg-white p-4 rounded-xl border border-[#c5c5d4]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-semibold text-[#454652]">{r.profile?.nickname ?? '익명'}</span>
                  <span className="text-yellow-400 text-[14px]">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p className="text-[14px] text-[#191c1d]">{r.content}</p>
                <p className="text-[11px] text-[#757684] mt-1">{new Date(r.created_at).toLocaleDateString('ko-KR')}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'exams' && (
          <div className="flex flex-col gap-3">
            {exams.map(e => (
              <div key={e.id} className="bg-white p-4 rounded-xl border border-[#c5c5d4]/30">
                <div className="flex justify-between items-start">
                  <p className="text-[16px] font-semibold text-[#191c1d]">{e.title}</p>
                  {e.exam_date && (
                    <span className="bg-[#dee0ff] text-[#24389c] px-2 py-0.5 rounded-full text-[11px] font-semibold">
                      {new Date(e.exam_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                {e.content && <p className="text-[14px] text-[#454652] mt-2">{e.content}</p>}
                <p className="text-[11px] text-[#757684] mt-2">{e.profile?.nickname ?? '익명'}</p>
              </div>
            ))}
            {exams.length === 0 && (
              <div className="text-center py-16 text-[#454652]">
                <span className="material-symbols-outlined text-[48px] text-[#c5c5d4] block mb-2">event_note</span>
                아직 등록된 시험 정보가 없어요
              </div>
            )}
          </div>
        )}

        {tab === 'chat' && (
          <div className="flex flex-col gap-2">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${m.user_id === user?.id ? 'bg-[#24389c] text-white rounded-br-sm' : 'bg-white text-[#191c1d] rounded-bl-sm'}`}>
                  {m.user_id !== user?.id && (
                    <p className="text-[10px] font-semibold mb-0.5 opacity-60">{m.profile?.nickname ?? '익명'}</p>
                  )}
                  <p className="text-[14px]">{m.message}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {tab === 'chat' && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#e1e3e4] px-4 py-3 flex gap-2">
          <input
            className="flex-1 bg-[#f3f4f5] rounded-xl px-4 py-2.5 text-[14px] outline-none"
            placeholder="메시지 입력..."
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 bg-[#24389c] text-white rounded-xl flex items-center justify-center active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      )}
    </div>
  )
}
