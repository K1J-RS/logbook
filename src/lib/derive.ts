import type { SessionLog } from '../types'

export function volume(log: SessionLog): number {
  let v = 0
  for (const e of log.entries) {
    for (const s of e.sets) {
      const w = parseFloat(s.weight)
      const r = parseFloat(s.reps)
      if (!Number.isNaN(w) && !Number.isNaN(r)) v += w * r
    }
  }
  return Math.round(v)
}

export function topSet(log: SessionLog, exName: string): number | null {
  const entry = log.entries.find((e) => e.name === exName)
  if (!entry) return null
  let max: number | null = null
  for (const s of entry.sets) {
    const w = parseFloat(s.weight)
    if (!Number.isNaN(w) && (max === null || w > max)) max = w
  }
  return max
}

export function lastValueFor(logs: SessionLog[], exName: string): { date: string; weight: string } | null {
  const relevant = logs
    .filter((l) => l.entries.some((e) => e.name === exName))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  if (!relevant.length) return null
  const log = relevant[0]
  const entry = log.entries.find((e) => e.name === exName)
  if (!entry) return null
  const withWeight = entry.sets.filter((s) => s.weight !== '' && s.weight != null)
  if (!withWeight.length) return null
  return { date: log.date, weight: withWeight[withWeight.length - 1].weight }
}

export function totalReps(log: SessionLog): number {
  let n = 0
  for (const e of log.entries) for (const s of e.sets) {
    const r = parseFloat(s.reps)
    if (!Number.isNaN(r)) n += r
  }
  return n
}

export function totalSets(log: SessionLog): number {
  return log.entries.reduce((s, e) => s + e.sets.length, 0)
}

export function topSetWeightInLog(log: SessionLog): number | null {
  let max: number | null = null
  for (const e of log.entries) for (const s of e.sets) {
    const w = parseFloat(s.weight)
    if (!Number.isNaN(w) && (max === null || w > max)) max = w
  }
  return max
}
