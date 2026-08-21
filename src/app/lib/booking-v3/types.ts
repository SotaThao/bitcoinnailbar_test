/**
 * Shape của Category/Service dùng cho màn Booking v3.
 *
 * Port từ `src/types/repositories.ts` của NEXORA TOUCH (vlink-nexora-fe,
 * branch `feature/800_pos-menu-upsell`) để component port sang giữ nguyên
 * hành vi. Giữ đúng tên field của POS gốc — `displayOrder`, `categoryIds`,
 * `tags` — vì engine upsell đọc metadata nhúng trong `description`.
 */

export type PosServiceStatus = 'Active' | 'Inactive'

export interface PosCategory {
  id: string
  name: string
  description?: string | null
  displayOrder: number
}

export interface PosService {
  id: string
  name: string
  price: number
  durationMinutes: number
  description?: string | null
  icon?: string | null
  photoUrl?: string | null
  status: PosServiceStatus
  displayOrder: number
  categoryIds: string[]
  tags: string[]
  memberPrice?: number
}
