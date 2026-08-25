import { useLogbookActions, useLogbookState } from '../../state/store'
import { volume, totalReps, totalSets, topSetWeightInLog } from '../../lib/derive'
import { formatThousands } from '../../lib/format'

export default function SummarySplash() {
  const s = useLogbookState()
  const a = useLogbookActions()
  if (!s.summary) return null
  const { log, prevVolume } = s.summary

  const vol = volume(log)
  const sets = totalSets(log)
  const reps = totalReps(log)
  const top = topSetWeightInLog(log)
  const skipped = log.entries.filter((e) => e.skipped)

  let deltaPct: number | null = null
  if (prevVolume !== null && prevVolume > 0) {
    deltaPct = Math.round(((vol - prevVolume) / prevVolume) * 100)
  }

  return (
    <div className="summary-overlay">
      <div className="summary-inner">
        <div>
          <div className="summary-head__title">
            <div className="summary-head__dot" />
            SESSION LOGGED
          </div>
          <div className="summary-head__meta">
            {log.date} &nbsp; {log.time}–{log.endTime} &nbsp;·&nbsp; {log.durationMin ?? 0} MIN
            <br />
            {log.templateName}
          </div>
        </div>

        <div className="summary-hero">
          <div className="summary-hero__label">TOTAL VOLUME LIFTED</div>
          <div className="summary-hero__value">{formatThousands(vol)}</div>
          <div className="summary-hero__unit">KG MOVED</div>
          {deltaPct !== null && (
            <div className={`summary-hero__delta ${deltaPct >= 0 ? 'positive' : 'negative'}`}>
              {deltaPct >= 0 ? '▲' : '▼'} {deltaPct >= 0 ? '+' : ''}
              {deltaPct}% VS LAST SESSION
            </div>
          )}
        </div>

        <div className="summary-tiles">
          <div className="summary-tile">
            <div className="summary-tile__value">{sets}</div>
            <div className="summary-tile__label">SETS</div>
          </div>
          <div className="summary-tile">
            <div className="summary-tile__value">{reps}</div>
            <div className="summary-tile__label">TOTAL REPS</div>
          </div>
          <div className="summary-tile">
            <div className="summary-tile__value" style={{ color: 'var(--amber)' }}>
              {top ?? '—'}
            </div>
            <div className="summary-tile__label">TOP KG</div>
          </div>
        </div>

        {skipped.length > 0 && (
          <div className="summary-carry">
            <div className="summary-carry__title">↺ CARRIED TO NEXT SESSION</div>
            {skipped.map((e) => (
              <div className="summary-carry__item" key={e.exId}>
                {e.name}
              </div>
            ))}
          </div>
        )}

        <div className="summary-footer">
          <button type="button" className="summary-btn secondary" onClick={a.viewSummaryEntry}>
            VIEW ENTRY
          </button>
          <button type="button" className="summary-btn primary" onClick={a.closeSummary}>
            DONE
          </button>
        </div>
      </div>
    </div>
  )
}
