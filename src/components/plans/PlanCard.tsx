import { useLogbookActions, useLogbookState } from '../../state/store'
import type { Template } from '../../types'
import EditableItemRow from './EditableItemRow'

export default function PlanCard({ tmpl }: { tmpl: Template }) {
  const s = useLogbookState()
  const a = useLogbookActions()
  const open = !!s.openPlans[tmpl.id]

  return (
    <div className="card plan-card">
      <button type="button" className="plan-card__header" onClick={() => a.togglePlanOpen(tmpl.id)}>
        <span className="plan-card__caret">{open ? '▾' : '▸'}</span>
        <span className="plan-card__name">{tmpl.name}</span>
        <span className="plan-card__count">{tmpl.exercises.length} EXERCISES</span>
      </button>
      {open && (
        <div className="plan-card__body">
          <div className="plan-rename-row">
            <input className="input-base" value={tmpl.name} onChange={(e) => a.renamePlan(tmpl.id, e.target.value)} />
            <button type="button" className="del-btn" onClick={() => a.deletePlan(tmpl.id)}>
              DEL
            </button>
          </div>
          {tmpl.exercises.map((ex, i) => (
            <EditableItemRow
              key={ex.id}
              index={i}
              total={tmpl.exercises.length}
              name={ex.name}
              target={ex.target}
              desc={ex.desc}
              video={ex.video}
              onChangeField={(field, value) => {
                if (field === 'group') return
                a.updateExerciseField(tmpl.id, ex.id, field, value)
              }}
              onMove={(dir) => a.moveExercise(tmpl.id, ex.id, dir)}
              onDelete={() => a.deleteExercise(tmpl.id, ex.id)}
            />
          ))}
          <button type="button" className="add-item-btn" onClick={() => a.addExercise(tmpl.id)}>
            + ADD EXERCISE
          </button>
        </div>
      )}
    </div>
  )
}
