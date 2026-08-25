import { useLogbookState } from '../../state/store'
import SessionTabs from './SessionTabs'
import DateStartRow from './DateStartRow'
import FocusCTA from './FocusCTA'
import ExerciseListCard from './ExerciseListCard'
import ChecklistTab from './ChecklistTab'
import NotesCard from './NotesCard'
import SaveBar from './SaveBar'
import FocusMode from '../focus/FocusMode'

export default function LogScreen() {
  const s = useLogbookState()

  if (!s.templates.length || !s.draft) {
    return (
      <div className="empty-state">
        <span className="empty-state__label">NO PLANS</span>
        Go to Plans to add a workout.
      </div>
    )
  }

  return (
    <>
      <SessionTabs />
      {s.prepView ? (
        <ChecklistTab which={s.prepView} />
      ) : (
        <>
          <DateStartRow />
          <FocusCTA />
          <ExerciseListCard />
        </>
      )}
      <NotesCard />
      <SaveBar />
      {s.focus !== null && <FocusMode />}
    </>
  )
}
