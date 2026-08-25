import { useLogbookActions, useLogbookState } from '../../state/store'

export default function DateStartRow() {
  const s = useLogbookState()
  const a = useLogbookActions()
  if (!s.draft) return null
  return (
    <div className="date-start-grid">
      <div className="field-card">
        <div className="mono-label">DATE</div>
        <input className="field-card__value" type="date" value={s.draft.date} onChange={(e) => a.setDraftDate(e.target.value)} />
      </div>
      <div className="field-card">
        <div className="mono-label">START</div>
        <input className="field-card__value" type="time" value={s.draft.time} onChange={(e) => a.setDraftTime(e.target.value)} />
      </div>
    </div>
  )
}
