import { useNavigate } from 'react-router-dom'
import type { UserSubject } from '../types'

interface Props {
  cart: UserSubject[]
}

export default function CartBadge({ cart }: Props) {
  const navigate = useNavigate()
  if (cart.length === 0) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-lg z-40">
      <div className="basket-blur bg-indigo-900/90 rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/10 ring-1 ring-white/20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-[#3f51b5] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[28px]">shopping_basket</span>
            </div>
            <span className="absolute -top-2 -right-2 bg-[#ba1a1a] text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-indigo-900">
              {cart.length}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-[14px]">내 수업함</span>
            <span className="text-indigo-200 text-[12px]">{cart.length}개의 과목이 담겨있습니다</span>
          </div>
        </div>
        <button
          className="bg-white text-[#24389c] px-5 py-2.5 rounded-xl font-semibold text-[14px] shadow-lg active:scale-95 transition-transform"
          onClick={() => navigate('/cart')}
        >
          수업함 보기
        </button>
      </div>
    </div>
  )
}
