import { useLogbookActions, useLogbookState } from '../../state/store'
import PlanCard from './PlanCard'
import ChecklistEditorCard from './ChecklistEditorCard'

export default function PlansScreen() {
  const s = useLogbookState()
  const a = useLogbookActions()
  return (
    <>
      <button type="button" className="new-plan-btn" onClick={a.addPlan}>
        + NEW PLAN
      </button>
      {s.templates.map((t) => (
        <PlanCard key={t.id} tmpl={t} />
      ))}
      <ChecklistEditorCard which="warmup" title="WARMUP CHECKLIST" />
      <ChecklistEditorCard which="rehab" title="PREHAB / REHAB CHECKLIST" />
    </>
  )
}
