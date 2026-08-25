import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { kvGet, kvSet } from '../db'
import { uid } from '../lib/id'
import { todayDate, nowTime, durationMinutes } from '../lib/format'
import { DEFAULT_LIBRARY, DEFAULT_REHAB, DEFAULT_TEMPLATES, DEFAULT_WARMUP } from '../seed'
import type {
  CarryoverItem,
  ChecklistItem,
  Draft,
  DraftEntry,
  LibraryEntry,
  PrepView,
  SessionLog,
  SetEntry,
  Template,
  ViewName,
} from '../types'

interface AppState {
  loaded: boolean
  // persisted
  templates: Template[]
  logs: SessionLog[]
  carryover: CarryoverItem[]
  library: LibraryEntry[]
  warmup: ChecklistItem[]
  rehab: ChecklistItem[]
  draft: Draft | null
  activeTemplateId: string | null
  // per-view UI state
  view: ViewName
  prepView: PrepView
  focus: number | null
  detail: SessionLog | null
  summary: { log: SessionLog; prevVolume: number | null } | null
  toast: string | null
  listening: string | null
  openPlans: Record<string, boolean>
  libQuery: string
  missingOnly: boolean
  progressEx: string | null
}

function newDraftFromTemplate(tmpl: Template, carryover: CarryoverItem[]): Draft {
  const templateNames = new Set(tmpl.exercises.map((e) => e.name))
  const carriedEntries: DraftEntry[] = carryover
    .filter((c) => !templateNames.has(c.name))
    .map((c) => ({
      exId: 'carry-' + c.id,
      name: c.name,
      target: c.target,
      desc: c.desc || '',
      video: c.video || '',
      sets: [{ weight: '', reps: '' }],
      skipped: false,
      carriedFrom: c.fromDate,
    }))
  const ownEntries: DraftEntry[] = tmpl.exercises.map((ex) => ({
    exId: ex.id,
    name: ex.name,
    target: ex.target,
    desc: ex.desc || '',
    video: ex.video || '',
    sets: [{ weight: '', reps: '' }] as SetEntry[],
    skipped: false,
    carriedFrom: null,
  }))

  return {
    date: todayDate(),
    time: nowTime(),
    templateId: tmpl.id,
    templateName: tmpl.name,
    notes: '',
    warmupDone: {},
    rehabDone: {},
    // carried-over exercises are prepended so they're the first thing seen (README: "Carry-over rule")
    entries: carriedEntries.concat(ownEntries),
  }
}

const initialState: AppState = {
  loaded: false,
  templates: [],
  logs: [],
  carryover: [],
  library: [],
  warmup: [],
  rehab: [],
  draft: null,
  activeTemplateId: null,
  view: 'log',
  prepView: null,
  focus: null,
  detail: null,
  summary: null,
  toast: null,
  listening: null,
  openPlans: {},
  libQuery: '',
  missingOnly: false,
  progressEx: null,
}

interface Actions {
  toast: (msg: string) => void
  setView: (v: ViewName) => void
  selectLogTab: (tabKey: string) => void
  setDraftDate: (date: string) => void
  setDraftTime: (time: string) => void
  setSetField: (ei: number, si: number, field: 'weight' | 'reps', value: string) => void
  addSet: (ei: number) => void
  removeSet: (ei: number, si: number) => void
  toggleSkip: (ei: number) => void
  toggleWarmupDone: (itemId: string) => void
  toggleRehabDone: (itemId: string) => void
  setNotes: (value: string) => void
  appendNotesFromVoice: (transcript: string) => void
  voiceForSet: (ei: number, transcript: string) => void
  setListening: (key: string | null) => void
  saveSession: () => void
  openFocus: () => void
  closeFocus: () => void
  focusNext: () => void
  focusPrev: () => void
  openDetail: (log: SessionLog) => void
  closeDetail: () => void
  deleteLog: (logId: string) => void
  closeSummary: () => void
  viewSummaryEntry: () => void
  setProgressEx: (name: string) => void
  addPlan: () => void
  togglePlanOpen: (id: string) => void
  renamePlan: (id: string, name: string) => void
  deletePlan: (id: string) => void
  addExercise: (planId: string) => void
  updateExerciseField: (planId: string, exId: string, field: 'name' | 'target' | 'desc' | 'video', value: string) => void
  deleteExercise: (planId: string, exId: string) => void
  moveExercise: (planId: string, exId: string, dir: -1 | 1) => void
  addChecklistItem: (which: 'warmup' | 'rehab') => void
  updateChecklistItemField: (which: 'warmup' | 'rehab', id: string, field: 'name' | 'target' | 'desc' | 'video' | 'group', value: string) => void
  deleteChecklistItem: (which: 'warmup' | 'rehab', id: string) => void
  moveChecklistItem: (which: 'warmup' | 'rehab', id: string, dir: -1 | 1) => void
  setLibQuery: (q: string) => void
  setMissingOnly: (v: boolean) => void
  addLibraryEntry: () => void
  updateLibraryField: (id: string, field: 'name' | 'desc' | 'video', value: string) => void
  deleteLibraryEntry: (id: string) => void
}

const StateCtx = createContext<AppState | null>(null)
const ActionsCtx = createContext<Actions | null>(null)

function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = index + dir
  if (next < 0 || next >= arr.length) return arr
  const copy = arr.slice()
  ;[copy[index], copy[next]] = [copy[next], copy[index]]
  return copy
}

export function LogbookProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)
  const toastTimer = useRef<number | null>(null)

  // ---------- initial load ----------
  useEffect(() => {
    let cancelled = false
    async function load() {
      const [templates, logs, carryover, library, warmup, rehab, draft, activeTemplateId] = await Promise.all([
        kvGet<Template[]>('templates'),
        kvGet<SessionLog[]>('logs'),
        kvGet<CarryoverItem[]>('carryover'),
        kvGet<LibraryEntry[]>('library'),
        kvGet<ChecklistItem[]>('warmup'),
        kvGet<ChecklistItem[]>('rehab'),
        kvGet<Draft | null>('draft'),
        kvGet<string | null>('activeTemplateId'),
      ])
      if (cancelled) return
      const tpl = templates && templates.length ? templates : DEFAULT_TEMPLATES.slice()
      const carry = carryover ?? []
      const activeId = activeTemplateId && tpl.some((t) => t.id === activeTemplateId) ? activeTemplateId : tpl[0]?.id ?? null
      const activeTpl = tpl.find((t) => t.id === activeId) ?? tpl[0]
      const resolvedDraft = draft && activeTpl && draft.templateId === activeId ? draft : activeTpl ? newDraftFromTemplate(activeTpl, carry) : null
      setState((s) => ({
        ...s,
        templates: tpl,
        logs: logs ?? [],
        carryover: carry,
        library: library && library.length ? library : DEFAULT_LIBRARY.slice(),
        warmup: warmup && warmup.length ? warmup : DEFAULT_WARMUP.slice(),
        rehab: rehab && rehab.length ? rehab : DEFAULT_REHAB.slice(),
        draft: resolvedDraft,
        activeTemplateId: activeId,
        loaded: true,
      }))
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // ---------- persistence ----------
  usePersist('templates', state.templates, state.loaded)
  usePersist('logs', state.logs, state.loaded)
  usePersist('carryover', state.carryover, state.loaded)
  usePersist('library', state.library, state.loaded)
  usePersist('warmup', state.warmup, state.loaded)
  usePersist('rehab', state.rehab, state.loaded)
  usePersist('draft', state.draft, state.loaded)
  usePersist('activeTemplateId', state.activeTemplateId, state.loaded)

  // ---------- toast auto-dismiss ----------
  useEffect(() => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    if (state.toast) {
      toastTimer.current = window.setTimeout(() => {
        setState((s) => ({ ...s, toast: null }))
      }, 1900)
    }
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [state.toast])

  const showToast = useCallback((msg: string) => setState((s) => ({ ...s, toast: msg })), [])

  const actions = useMemo<Actions>(() => {
    return {
      toast: showToast,

      setView: (v) => setState((s) => ({ ...s, view: v, prepView: null, detail: null })),

      selectLogTab: (tabKey) =>
        setState((s) => {
          if (tabKey === 'warmup' || tabKey === 'rehab') {
            return { ...s, prepView: tabKey }
          }
          const tmpl = s.templates.find((t) => t.id === tabKey)
          if (!tmpl) return s
          return { ...s, activeTemplateId: tmpl.id, draft: newDraftFromTemplate(tmpl, s.carryover), prepView: null, focus: null }
        }),

      setDraftDate: (date) => setState((s) => (s.draft ? { ...s, draft: { ...s.draft, date } } : s)),
      setDraftTime: (time) => setState((s) => (s.draft ? { ...s, draft: { ...s.draft, time } } : s)),

      setSetField: (ei, si, field, value) =>
        setState((s) => {
          if (!s.draft) return s
          const entries = s.draft.entries.slice()
          const entry = entries[ei]
          const sets = entry.sets.slice()
          sets[si] = { ...sets[si], [field]: value }
          entries[ei] = { ...entry, sets }
          return { ...s, draft: { ...s.draft, entries } }
        }),

      addSet: (ei) =>
        setState((s) => {
          if (!s.draft) return s
          const entries = s.draft.entries.slice()
          const entry = entries[ei]
          const last = entry.sets[entry.sets.length - 1] ?? { weight: '', reps: '' }
          entries[ei] = { ...entry, sets: [...entry.sets, { weight: last.weight, reps: last.reps }] }
          return { ...s, draft: { ...s.draft, entries } }
        }),

      removeSet: (ei, si) =>
        setState((s) => {
          if (!s.draft) return s
          const entries = s.draft.entries.slice()
          const entry = entries[ei]
          if (entry.sets.length <= 1) return s
          entries[ei] = { ...entry, sets: entry.sets.filter((_, i) => i !== si) }
          return { ...s, draft: { ...s.draft, entries } }
        }),

      toggleSkip: (ei) =>
        setState((s) => {
          if (!s.draft) return s
          const entries = s.draft.entries.slice()
          entries[ei] = { ...entries[ei], skipped: !entries[ei].skipped }
          return { ...s, draft: { ...s.draft, entries } }
        }),

      toggleWarmupDone: (itemId) =>
        setState((s) => (s.draft ? { ...s, draft: { ...s.draft, warmupDone: { ...s.draft.warmupDone, [itemId]: !s.draft.warmupDone[itemId] } } } : s)),

      toggleRehabDone: (itemId) =>
        setState((s) => (s.draft ? { ...s, draft: { ...s.draft, rehabDone: { ...s.draft.rehabDone, [itemId]: !s.draft.rehabDone[itemId] } } } : s)),

      setNotes: (value) => setState((s) => (s.draft ? { ...s, draft: { ...s.draft, notes: value } } : s)),

      appendNotesFromVoice: (transcript) =>
        setState((s) => {
          if (!s.draft) return s
          const existing = s.draft.notes || ''
          const notes = existing ? existing.trim() + ' ' + transcript : transcript
          return { ...s, draft: { ...s.draft, notes }, toast: 'Note appended' }
        }),

      voiceForSet: (ei, transcript) =>
        setState((s) => {
          if (!s.draft) return s
          const weightMatch = transcript.toLowerCase().match(/(\d+(\.\d+)?)\s*(kg|kilo|kilos|kilogram|pound|pounds|lb|lbs)/)
          const repMatch = transcript.toLowerCase().match(/(\d+(\.\d+)?)\s*rep/)
          const nums = transcript.toLowerCase().match(/\d+(\.\d+)?/g) ?? []
          let weight: string | null = weightMatch ? (weightMatch[1] ?? null) : null
          let reps: string | null = repMatch ? (repMatch[1] ?? null) : null
          if (weight == null && nums.length) weight = nums[0] ?? null
          if (reps == null && nums.length > 1) reps = nums[1] ?? null
          if (weight == null && reps == null) {
            return { ...s, toast: `No numbers in "${transcript}"` }
          }
          const entries = s.draft.entries.slice()
          const entry = entries[ei]
          const sets = entry.sets.slice()
          const lastIdx = sets.length - 1
          const last = sets[lastIdx]
          if (last && last.weight === '' && last.reps === '') {
            sets[lastIdx] = { weight: weight ?? '', reps: reps ?? '' }
          } else {
            sets.push({ weight: weight ?? '', reps: reps ?? '' })
          }
          entries[ei] = { ...entry, sets }
          return { ...s, draft: { ...s.draft, entries }, toast: `Logged ${weight ?? '—'} × ${reps ?? '—'}` }
        }),

      setListening: (key) => setState((s) => ({ ...s, listening: key })),

      saveSession: () =>
        setState((s) => {
          const d = s.draft
          if (!d) return s
          const hasData = d.entries.some((e) => e.skipped || e.sets.some((set) => set.weight !== '' || set.reps !== ''))
          if (!hasData) return { ...s, toast: 'Log a set or mark a skip first' }

          const cleanedEntries = d.entries
            .map((e) => ({
              exId: e.exId,
              name: e.name,
              target: e.target,
              skipped: e.skipped,
              carriedFrom: e.carriedFrom,
              sets: e.skipped ? [] : e.sets.filter((set) => set.weight !== '' || set.reps !== ''),
            }))
            .filter((e) => e.skipped || e.sets.length)

          const endTime = nowTime()
          const warmupDoneNames = s.warmup.filter((w) => d.warmupDone[w.id]).map((w) => w.name)
          const rehabDoneNames = s.rehab.filter((r) => d.rehabDone[r.id]).map((r) => r.name)

          const log: SessionLog = {
            id: uid(),
            date: d.date,
            time: d.time,
            endTime,
            durationMin: durationMinutes(d.time, endTime),
            templateId: d.templateId,
            templateName: d.templateName,
            notes: (d.notes || '').trim(),
            warmupDone: warmupDoneNames,
            rehabDone: rehabDoneNames,
            entries: cleanedEntries,
          }

          const logs = [...s.logs, log]

          // carryover bookkeeping
          let carryover = s.carryover.slice()
          for (const e of cleanedEntries) {
            const idx = carryover.findIndex((c) => c.name === e.name)
            if (e.skipped) {
              const draftEntry = d.entries.find((de) => de.name === e.name)
              const item: CarryoverItem = {
                id: idx >= 0 ? carryover[idx].id : uid(),
                name: e.name,
                target: e.target,
                desc: draftEntry?.desc ?? '',
                video: draftEntry?.video ?? '',
                fromDate: d.date,
              }
              if (idx >= 0) carryover[idx] = item
              else carryover.push(item)
            } else if (idx >= 0) {
              carryover = carryover.filter((_, i) => i !== idx)
            }
          }

          // volume comparison: most recent earlier session of same plan with volume > 0
          const sameplanEarlier = logs
            .filter((l) => l.id !== log.id && l.templateId === log.templateId)
            .filter((l) => volumeOf(l) > 0)
            .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
          const prevVolume = sameplanEarlier.length ? volumeOf(sameplanEarlier[0]) : null

          const tmpl = s.templates.find((t) => t.id === d.templateId)
          const freshDraft = tmpl ? newDraftFromTemplate(tmpl, carryover) : null

          return {
            ...s,
            logs,
            carryover,
            draft: freshDraft,
            focus: null,
            prepView: null,
            summary: { log, prevVolume },
          }
        }),

      openFocus: () =>
        setState((s) => {
          if (!s.draft) return s
          const idx = s.draft.entries.findIndex((e) => !e.skipped && !e.sets.some((set) => set.weight !== '' || set.reps !== ''))
          return { ...s, focus: idx === -1 ? 0 : idx }
        }),
      closeFocus: () => setState((s) => ({ ...s, focus: null })),
      focusNext: () =>
        setState((s) => {
          if (!s.draft || s.focus === null) return s
          if (s.focus >= s.draft.entries.length - 1) {
            return { ...s, focus: null, toast: 'All exercises reviewed' }
          }
          return { ...s, focus: s.focus + 1 }
        }),
      focusPrev: () =>
        setState((s) => {
          if (s.focus === null || s.focus <= 0) return s
          return { ...s, focus: s.focus - 1 }
        }),

      openDetail: (log) => setState((s) => ({ ...s, detail: log })),
      closeDetail: () => setState((s) => ({ ...s, detail: null })),
      deleteLog: (logId) =>
        setState((s) => ({
          ...s,
          logs: s.logs.filter((l) => l.id !== logId),
          detail: s.detail && s.detail.id === logId ? null : s.detail,
          toast: 'Entry deleted',
        })),

      closeSummary: () => setState((s) => ({ ...s, summary: null })),
      viewSummaryEntry: () =>
        setState((s) => {
          if (!s.summary) return s
          return { ...s, view: 'history', detail: s.summary.log, summary: null }
        }),

      setProgressEx: (name) => setState((s) => ({ ...s, progressEx: name })),

      addPlan: () =>
        setState((s) => {
          const id = uid()
          const tmpl: Template = { id, name: 'New Plan', exercises: [{ id: uid(), name: 'Exercise 1', target: '3 x 8', desc: '', video: '' }] }
          return { ...s, templates: [tmpl, ...s.templates], openPlans: { ...s.openPlans, [id]: true } }
        }),
      togglePlanOpen: (id) => setState((s) => ({ ...s, openPlans: { ...s.openPlans, [id]: !s.openPlans[id] } })),
      renamePlan: (id, name) => setState((s) => ({ ...s, templates: s.templates.map((t) => (t.id === id ? { ...t, name } : t)) })),
      deletePlan: (id) =>
        setState((s) => {
          if (s.templates.length <= 1) return { ...s, toast: 'Keep at least one plan' }
          const templates = s.templates.filter((t) => t.id !== id)
          let activeTemplateId = s.activeTemplateId
          let draft = s.draft
          if (activeTemplateId === id) {
            activeTemplateId = templates[0]?.id ?? null
            draft = templates[0] ? newDraftFromTemplate(templates[0], s.carryover) : null
          }
          return { ...s, templates, activeTemplateId, draft }
        }),

      addExercise: (planId) =>
        setState((s) => ({
          ...s,
          templates: s.templates.map((t) =>
            t.id === planId ? { ...t, exercises: [...t.exercises, { id: uid(), name: '', target: '', desc: '', video: '' }] } : t,
          ),
        })),
      updateExerciseField: (planId, exId, field, value) =>
        setState((s) => ({
          ...s,
          templates: s.templates.map((t) =>
            t.id === planId ? { ...t, exercises: t.exercises.map((ex) => (ex.id === exId ? { ...ex, [field]: value } : ex)) } : t,
          ),
        })),
      deleteExercise: (planId, exId) =>
        setState((s) => ({
          ...s,
          templates: s.templates.map((t) => (t.id === planId ? { ...t, exercises: t.exercises.filter((ex) => ex.id !== exId) } : t)),
        })),
      moveExercise: (planId, exId, dir) =>
        setState((s) => ({
          ...s,
          templates: s.templates.map((t) => {
            if (t.id !== planId) return t
            const idx = t.exercises.findIndex((ex) => ex.id === exId)
            if (idx === -1) return t
            return { ...t, exercises: move(t.exercises, idx, dir) }
          }),
        })),

      addChecklistItem: (which) =>
        setState((s) => {
          const list = s[which]
          const lastGroup = which === 'rehab' && list.length ? list[list.length - 1].group : undefined
          const item: ChecklistItem = { id: uid(), name: '', target: '', desc: '', video: '', ...(which === 'rehab' ? { group: lastGroup } : {}) }
          return { ...s, [which]: [...list, item] }
        }),
      updateChecklistItemField: (which, id, field, value) =>
        setState((s) => ({ ...s, [which]: s[which].map((it) => (it.id === id ? { ...it, [field]: value } : it)) })),
      deleteChecklistItem: (which, id) => setState((s) => ({ ...s, [which]: s[which].filter((it) => it.id !== id) })),
      moveChecklistItem: (which, id, dir) =>
        setState((s) => {
          const idx = s[which].findIndex((it) => it.id === id)
          if (idx === -1) return s
          return { ...s, [which]: move(s[which], idx, dir) }
        }),

      setLibQuery: (q) => setState((s) => ({ ...s, libQuery: q })),
      setMissingOnly: (v) => setState((s) => ({ ...s, missingOnly: v })),
      addLibraryEntry: () => setState((s) => ({ ...s, library: [{ id: uid(), name: '', desc: '', video: '' }, ...s.library] })),
      updateLibraryField: (id, field, value) =>
        setState((s) => ({ ...s, library: s.library.map((l) => (l.id === id ? { ...l, [field]: value } : l)) })),
      deleteLibraryEntry: (id) => setState((s) => ({ ...s, library: s.library.filter((l) => l.id !== id) })),
    }
  }, [showToast])

  return (
    <StateCtx.Provider value={state}>
      <ActionsCtx.Provider value={actions}>{children}</ActionsCtx.Provider>
    </StateCtx.Provider>
  )
}

function volumeOf(log: SessionLog): number {
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

function usePersist<T>(key: string, value: T, loaded: boolean) {
  const first = useRef(true)
  useEffect(() => {
    if (!loaded) return
    if (first.current) {
      first.current = false
      return
    }
    const handle = window.setTimeout(() => {
      kvSet(key, value)
    }, 250)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value, loaded])
}

export function useLogbookState(): AppState {
  const ctx = useContext(StateCtx)
  if (!ctx) throw new Error('useLogbookState must be used within LogbookProvider')
  return ctx
}

export function useLogbookActions(): Actions {
  const ctx = useContext(ActionsCtx)
  if (!ctx) throw new Error('useLogbookActions must be used within LogbookProvider')
  return ctx
}
