import { useLogbookActions, useLogbookState } from '../../state/store'
import type { DraftEntry } from '../../types'
import { lastValueFor } from '../../lib/derive'
import MicButton from '../MicButton'
import SetRows from './SetRows'

export default function ExerciseRow({ entry, ei }: { entry: DraftEntry; ei: number }) {
  const s = useLogbookState()
  const a = useLogbookActions()
  const last = lastValueFor(s.logs, entry.name)

  return (
    <div className={`ex-row${entry.skipped ? ' is-skipped' : ''}`}>
      <div className="ex-row__head">
        <div className="ex-row__name-wrap">
          <span className="ex-row__name">{entry.name}</span>
          {entry.video && (
            <a className="video-btn" href={entry.video} target="_blank" rel="noopener noreferrer" aria-label="Watch demo">
              ▶
            </a>
          )}
        </div>
        <span className="ex-row__target">{entry.target}</span>
      </div>

      {entry.carriedFrom && <div className="carry-badge">↺ CARRIED OVER FROM {entry.carriedFrom}</div>}
      {entry.desc && <div className="ex-row__desc">{entry.desc}</div>}
      {last && (
        <div className="ex-row__last">
          LAST · <b>{last.weight}</b> kg · {last.date}
        </div>
      )}

      {!entry.skipped && (
        <>
          <SetRows ei={ei} sets={entry.sets} variant="overview" />
          <div className="set-actions-row">
            <button type="button" className="btn-addset" onClick={() => a.addSet(ei)}>
              + SET
            </button>
            <MicButton listenKey={`set-${ei}`} idleLabel="🎤 VOICE" onTranscript={(t) => a.voiceForSet(ei, t)} />
          </div>
        </>
      )}

      <button type="button" className={`skip-toggle${entry.skipped ? ' is-skipped' : ''}`} onClick={() => a.toggleSkip(ei)}>
        {entry.skipped ? '↺ SKIPPED — WILL CARRY OVER' : 'SKIP THIS EXERCISE'}
      </button>
    </div>
  )
}
