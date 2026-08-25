import { useLogbookActions, useLogbookState } from '../../state/store'
import { totalSets, volume } from '../../lib/derive'
import DetailSheet from './DetailSheet'

export default function HistoryScreen() {
  const s = useLogbookState()
  const a = useLogbookActions()

  if (!s.logs.length) {
    return (
      <div className="empty-state">
        <span className="empty-state__label">NO DATA</span>
        Nothing logged yet. Your first saved session shows up here.
      </div>
    )
  }

  const sorted = s.logs.slice().sort((x, y) => y.date.localeCompare(x.date) || y.id.localeCompare(x.id))

  return (
    <>
      <div className="hist-count">{s.logs.length} SESSIONS LOGGED</div>
      <div className="hist-list">
        {sorted.map((l) => {
          const vol = volume(l)
          const skippedCount = l.entries.filter((e) => e.skipped).length
          return (
            <button key={l.id} className="hist-card" onClick={() => a.openDetail(l)}>
              <div className="hist-card__row1">
                <span className="hist-card__date">
                  {l.date} {l.time}
                </span>
                <span className="hist-card__vol">{(vol / 1000).toFixed(1)}K kg</span>
              </div>
              <div className="hist-card__name">{l.templateName}</div>
              <div className="hist-card__row3">
                <span>
                  {totalSets(l)} SETS · {l.entries.length} EX · {l.durationMin ?? 0} MIN
                </span>
                {skippedCount > 0 && <span className="skipped">· {skippedCount} SKIPPED</span>}
                {l.notes && <span className="note">· NOTE</span>}
              </div>
            </button>
          )
        })}
      </div>
      {s.detail && <DetailSheet log={s.detail} />}
    </>
  )
}
