import { useLogbookState } from '../../state/store'
import ExerciseRow from './ExerciseRow'

export default function ExerciseListCard() {
  const s = useLogbookState()
  if (!s.draft) return null
  const done = s.draft.entries.filter((e) => e.skipped || e.sets.some((set) => set.weight !== '' || set.reps !== '')).length

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-header">
        <span className="card-header__title">{s.draft.templateName}</span>
        <span className="card-header__meta">
          {done}/{s.draft.entries.length} DONE
        </span>
      </div>
      {s.draft.entries.map((entry, ei) => (
        <ExerciseRow key={entry.exId} entry={entry} ei={ei} />
      ))}
    </div>
  )
}
