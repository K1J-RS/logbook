export type Unit = 'kg' | 'lb'

export interface Exercise {
  id: string
  name: string
  target: string
  desc: string
  video: string
}

export interface Template {
  id: string
  name: string
  exercises: Exercise[]
}

export interface ChecklistItem {
  id: string
  name: string
  target: string
  desc?: string
  video?: string
  /** rehab only — drives grouping on the Prehab/Rehab tab */
  group?: string
}

export interface SetEntry {
  weight: string
  reps: string
}

export interface DraftEntry {
  exId: string
  name: string
  target: string
  desc: string
  video: string
  sets: SetEntry[]
  skipped: boolean
  carriedFrom: string | null
}

export interface Draft {
  date: string // YYYY-MM-DD
  time: string // HH:MM, session start
  templateId: string
  templateName: string
  notes: string
  warmupDone: Record<string, boolean>
  rehabDone: Record<string, boolean>
  entries: DraftEntry[]
}

export interface SessionLogEntry {
  exId: string
  name: string
  target: string
  skipped: boolean
  carriedFrom: string | null
  sets: SetEntry[]
}

export interface SessionLog {
  id: string
  date: string
  time: string
  endTime: string
  durationMin: number | null
  templateId: string
  templateName: string
  notes: string
  warmupDone: string[]
  rehabDone: string[]
  entries: SessionLogEntry[]
}

export interface CarryoverItem {
  id: string
  name: string
  target: string
  desc: string
  video: string
  fromDate: string
}

export interface LibraryEntry {
  id: string
  name: string
  desc: string
  video: string
}

export type ViewName = 'log' | 'history' | 'progress' | 'plans' | 'library'
export type PrepView = 'warmup' | 'rehab' | null
