import { useLogbookActions, useLogbookState } from '../../state/store'
import type { SessionLog } from '../../types'

export default function DetailSheet({ log }: { log: SessionLog }) {
  const s = useLogbookState()
  const a = useLogbookActions()

  return (
    <div className="sheet-scrim" onClick={(e) => e.target === e.currentTarget && a.closeDetail()}>
      <div className="sheet-panel">
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div>
            <div className="sheet-head__date">
              {log.date} &nbsp;·&nbsp; {log.time}–{log.endTime}
            </div>
            <div className="sheet-head__name">{log.templateName}</div>
            <div className="sheet-head__meta">
              {log.durationMin ?? 0} MIN · WARMUP {log.warmupDone.length}/{s.warmup.length} · REHAB {log.rehabDone.length}/{s.rehab.length}
            </div>
          </div>
          <button type="button" className="sheet-close" onClick={a.closeDetail}>
            ×
          </button>
        </div>

        {log.entries.map((e) => (
          <div className="sheet-entry" key={e.exId}>
            <div className="sheet-entry__head">
              <span className={`sheet-entry__name${e.skipped ? ' is-skipped' : ''}`}>{e.name}</span>
              <span className="sheet-entry__target">{e.target}</span>
            </div>
            {(e.skipped || e.carriedFrom) && (
              <div className="sheet-entry__badges">
                {e.skipped && <span className="carry-badge">SKIPPED · CARRIED OVER</span>}
                {e.carriedFrom && <span className="carry-badge cyan">↺ CARRIED IN FROM {e.carriedFrom}</span>}
              </div>
            )}
            {!e.skipped && (
              <div className="set-chips">
                {e.sets.map((set, i) => (
                  <span className="set-chip" key={i}>
                    {set.weight || '—'}kg × {set.reps || '—'}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {log.notes && (
          <div className="sheet-notes">
            <div className="sheet-notes__title">SESSION NOTES</div>
            <div className="sheet-notes__body">{log.notes}</div>
          </div>
        )}

        <button type="button" className="delete-entry-btn" onClick={() => a.deleteLog(log.id)}>
          DELETE ENTRY
        </button>
      </div>
    </div>
  )
}
