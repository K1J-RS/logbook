import { useLogbookActions, useLogbookState } from '../../state/store'
import { planShortName } from '../../lib/format'

export default function SessionTabs() {
  const s = useLogbookState()
  const a = useLogbookActions()
  if (!s.draft) return null

  const warmupCount = s.warmup.filter((w) => s.draft!.warmupDone[w.id]).length
  const rehabCount = s.rehab.filter((r) => s.draft!.rehabDone[r.id]).length

  return (
    <div className="session-tabs" data-scrollrow>
      {s.templates.map((t) => {
        const active = !s.prepView && s.draft!.templateId === t.id
        return (
          <button key={t.id} className={`tab-chip${active ? ' is-active' : ''}`} onClick={() => a.selectLogTab(t.id)}>
            {planShortName(t.name).toUpperCase()}
          </button>
        )
      })}
      <button className={`tab-chip${s.prepView === 'warmup' ? ' is-active' : ''}`} onClick={() => a.selectLogTab('warmup')}>
        WARMUP <span className={`tab-chip__badge${warmupCount > 0 ? ' is-active' : ''}`}>{warmupCount}/{s.warmup.length}</span>
      </button>
      <button className={`tab-chip${s.prepView === 'rehab' ? ' is-active' : ''}`} onClick={() => a.selectLogTab('rehab')}>
        PREHAB / REHAB <span className={`tab-chip__badge${rehabCount > 0 ? ' is-active' : ''}`}>{rehabCount}/{s.rehab.length}</span>
      </button>
    </div>
  )
}
