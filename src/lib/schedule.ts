import type { DoctorSchedule } from '@/types'
import { buildTimeRange, addMinutesToTime } from './date'

export interface SlotWindow {
  startTime: string
  endTime: string
}

/** Every bookable slot in a schedule row, skipping any slot that overlaps the break. */
export function buildScheduleSlots(schedule: DoctorSchedule): SlotWindow[] {
  if (!schedule.isAvailable) return []
  return buildTimeRange(schedule.startTime, schedule.endTime, schedule.slotDuration)
    .map((startTime) => ({ startTime, endTime: addMinutesToTime(startTime, schedule.slotDuration) }))
    .filter((slot) => slot.endTime <= schedule.endTime)
    .filter(
      (slot) =>
        !schedule.breakStart ||
        !schedule.breakEnd ||
        slot.endTime <= schedule.breakStart ||
        slot.startTime >= schedule.breakEnd,
    )
}

/** Two "HH:mm" ranges overlap (end-exclusive). */
export const timesOverlap = (a: SlotWindow, b: SlotWindow) => a.startTime < b.endTime && b.startTime < a.endTime
