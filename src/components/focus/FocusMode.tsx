import { useLogbookActions, useLogbookState } from '../../state/store'
import { lastValueFor } from '../../lib/derive'
import { planShortName } from '../../lib/format'
import MicButton from '../MicButton'
import SetRows from '../log/SetRows'

export default function FocusMode() {
  const s = useLogbookState()
  const a = useLogbookActions()
  const draft = s.draft
  if (!draft || s.focus === null) return null

  const ei = s.focus
  const entry = draft.entries[ei]
  if (!entry) return null

  const last = lastValueFor(s.logs, entry.name)
  const isLast = ei === draft.entries.length - 1
  const hasData = (e: typeof entry) => e.skipped || e.sets.some((set) => set.weight !== '' || set.reps !== '')

  return (
    <div className="focus-overlay">
      <div className="focus-inner">
        <div className="focus-header">
          <div>
            <div className="focus-header__plan">{planShortName(draft.templateName).toUpperCase()}</div>
            <div className="focus-header__meta">
              EXERCISE {ei + 1} OF {draft.entries.length} · STARTED {draft.time}
            </div>
          </div>
          <button type="button" className="focus-header__overview" onClick={a.closeFocus}>
            OVERVIEW
          </button>
        </div>

        <div className="focus-progress">
          {draft.entries.map((e, i) => (
            <div
              key={e.exId}
              className={`focus-progress__seg${i === ei ? ' is-current' : hasData(e) ? ' is-done' : ''}`}
            />
          ))}
        </div>

        <div className="focus-body">
          <div className="focus-title">{entry.name}</div>
          {entry.carriedFrom && <div className="carry-badge">↺ CARRIED OVER FROM {entry.carriedFrom}</div>}
          {entry.video && (
            <a className="video-btn lg" href={entry.video} target="_blank" rel="noopener noreferrer" aria-label="Watch demo">
              ▶
            </a>
          )}

          <div className="focus-stats">
            <div className="focus-stats__card">
              <div className="focus-stats__label">TARGET</div>
              <div className="focus-stats__value">{entry.target || '—'}</div>
            </div>
            <div className="focus-stats__card">
              <div className="focus-stats__label">LAST</div>
              <div className="focus-stats__value amber">{last ? `${last.weight} kg` : '—'}</div>
            </div>
          </div>

          {entry.desc && <div className="focus-cue">{entry.desc}</div>}

          {!entry.skipped && (
            <>
              <SetRows ei={ei} sets={entry.sets} variant="focus" />
              <div className="set-actions-row">
                <button type="button" className="btn-addset lg" onClick={() => a.addSet(ei)}>
                  + SET
                </button>
                <MicButton listenKey={`focus-${ei}`} idleLabel="🎤 VOICE" onTranscript={(t) => a.voiceForSet(ei, t)} className="lg" />
              </div>
            </>
          )}

          <button type="button" className={`skip-toggle lg${entry.skipped ? ' is-skipped' : ''}`} onClick={() => a.toggleSkip(ei)}>
            {entry.skipped ? '↺ SKIPPED — WILL CARRY OVER' : 'SKIP THIS EXERCISE'}
          </button>
        </div>

        <div className="focus-footer">
          <button type="button" className="focus-back" disabled={ei === 0} onClick={a.focusPrev}>
            ←
          </button>
          <button type="button" className="focus-next" onClick={a.focusNext}>
            {isLast ? 'DONE · REVIEW SESSION' : 'DONE · NEXT EXERCISE →'}
          </button>
        </div>
      </div>
    </div>
  )
}
