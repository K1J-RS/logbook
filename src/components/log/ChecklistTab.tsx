import { useLogbookActions, useLogbookState } from '../../state/store'
import type { ChecklistItem } from '../../types'

export default function ChecklistTab({ which }: { which: 'warmup' | 'rehab' }) {
  const s = useLogbookState()
  const a = useLogbookActions()
  if (!s.draft) return null

  const items = s[which]
  const doneMap = which === 'warmup' ? s.draft.warmupDone : s.draft.rehabDone
  const toggle = which === 'warmup' ? a.toggleWarmupDone : a.toggleRehabDone
  const doneCount = items.filter((it) => doneMap[it.id]).length

  const groups: { label: string; items: ChecklistItem[] }[] = []
  const groupIndex = new Map<string, number>()
  for (const it of items) {
    const label = it.group || (which === 'rehab' ? 'General' : '')
    if (!groupIndex.has(label)) {
      groupIndex.set(label, groups.length)
      groups.push({ label, items: [] })
    }
    groups[groupIndex.get(label)!].items.push(it)
  }

  return (
    <div>
      <div className="checklist-header">
        <span className="checklist-header__title">{which === 'warmup' ? 'Warmup' : 'Rehab / Prehab'}</span>
        <span className="checklist-header__meta">
          {doneCount}/{items.length} COMPLETE
        </span>
      </div>
      <div className="card checklist-card">
        {groups.map((g) => (
          <div key={g.label || 'default'}>
            {g.label && <div className="checklist-group-label">{g.label}</div>}
            {g.items.map((item) => {
              const checked = !!doneMap[item.id]
              return (
                <div className="checklist-item" key={item.id}>
                  <div
                    className={`checklist-checkbox${checked ? ' is-checked' : ''}`}
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(item.id)}
                  >
                    {checked && '✓'}
                  </div>
                  <div className="checklist-item__body" onClick={() => toggle(item.id)}>
                    <div className={`checklist-item__name${checked ? ' is-checked' : ''}`}>{item.name}</div>
                    {item.desc && <div className="checklist-item__cue">{item.desc}</div>}
                  </div>
                  {item.target && <div className="checklist-item__target">{item.target}</div>}
                  {item.video && (
                    <a
                      className="checklist-item__link"
                      href={item.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ▶
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
