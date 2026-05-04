import type { NeisSchool, NeisTimetableItem } from '../types'

const API_KEY = import.meta.env.VITE_NEIS_API_KEY
const BASE = 'https://open.neis.go.kr/hub'

async function fetchNeis<T>(endpoint: string, params: Record<string, string>): Promise<T[]> {
  const query = new URLSearchParams({ KEY: API_KEY, Type: 'json', pIndex: '1', pSize: '1000', ...params })
  const res = await fetch(`${BASE}/${endpoint}?${query}`)
  const data = await res.json()
  if (data.RESULT?.CODE === 'INFO-200') return []
  return data[endpoint]?.[1]?.row ?? []
}

export async function searchSchools(name: string): Promise<NeisSchool[]> {
  return fetchNeis<NeisSchool>('schoolInfo', {
    SCHUL_NM: name,
    SCHUL_KND_SC_NM: '고등학교',
  })
}

export async function fetchTimetable(
  officeCode: string,
  schoolCode: string,
  grade: number
): Promise<NeisTimetableItem[]> {
  const year = new Date().getFullYear().toString()
  const sem = new Date().getMonth() < 7 ? '1' : '2'
  return fetchNeis<NeisTimetableItem>('hisTimetable', {
    ATPT_OFCDC_SC_CODE: officeCode,
    SD_SCHUL_CODE: schoolCode,
    AY: year,
    SEM: sem,
    GRADE: grade.toString(),
  })
}

export function extractUniqueSubjects(items: NeisTimetableItem[]): Array<{
  subject_name: string
  classroom: string | null
  is_mobile: boolean
}> {
  const map = new Map<string, { classroom: string | null; is_mobile: boolean }>()
  for (const item of items) {
    const name = item.ITRT_CNTNT?.trim()
    if (!name) continue
    const classroom = item.CLRM_NM?.trim() || null
    const is_mobile = !!classroom
    if (!map.has(name)) {
      map.set(name, { classroom, is_mobile })
    } else if (classroom && !map.get(name)?.classroom) {
      map.set(name, { classroom, is_mobile })
    }
  }
  return Array.from(map.entries()).map(([subject_name, info]) => ({ subject_name, ...info }))
}
