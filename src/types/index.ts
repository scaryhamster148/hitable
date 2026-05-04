export interface School {
  id: string
  neis_code: string
  office_code: string
  name: string
  address: string | null
}

export interface Subject {
  id: string
  school_id: string
  grade: number
  subject_name: string
  subject_category: string | null
  classroom: string | null
  is_mobile: boolean
}

export interface Profile {
  id: string
  school_id: string | null
  grade: number | null
  class_num: number | null
  nickname: string | null
  school?: School
}

export interface UserSubject {
  id: string
  user_id: string
  subject_id: string
  custom_classroom: string | null
  subject?: Subject
}

export interface TimetableSlot {
  id: string
  user_id: string
  day_of_week: number
  period: number
  user_subject_id: string | null
  user_subject?: UserSubject
}

export interface ClassReview {
  id: string
  subject_id: string
  user_id: string
  rating: number
  content: string
  created_at: string
  profile?: { nickname: string | null }
}

export interface ExamInfo {
  id: string
  subject_id: string
  user_id: string
  title: string
  content: string | null
  exam_date: string | null
  created_at: string
  profile?: { nickname: string | null }
}

export interface ChatMessage {
  id: string
  subject_id: string
  user_id: string
  message: string
  created_at: string
  profile?: { nickname: string | null }
}

export interface NeisSchool {
  ATPT_OFCDC_SC_CODE: string
  SD_SCHUL_CODE: string
  SCHUL_NM: string
  LCTN_SC_NM: string
  ORG_RDNMA: string
  SCHUL_KND_SC_NM: string
}

export interface NeisTimetableItem {
  GRADE: string
  CLASS_NM: string
  PERIO: string
  ITRT_CNTNT: string
  CLRM_NM: string
}
