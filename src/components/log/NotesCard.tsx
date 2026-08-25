import { useLogbookActions, useLogbookState } from '../../state/store'
import MicButton from '../MicButton'

export default function NotesCard() {
  const s = useLogbookState()
  const a = useLogbookActions()
  if (!s.draft) return null
  return (
    <div className="card notes-card">
      <div className="notes-card__head">
        <span className="mono-label" style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-secondary)' }}>
          SESSION NOTES
        </span>
        <MicButton listenKey="notes" idleLabel="🎤 DICTATE" onTranscript={(t) => a.appendNotesFromVoice(t)} className="sm" />
      </div>
      <textarea
        className="textarea"
        rows={3}
        placeholder="How did it feel? Anything to remember."
        value={s.draft.notes}
        onChange={(e) => a.setNotes(e.target.value)}
      />
    </div>
  )
}
