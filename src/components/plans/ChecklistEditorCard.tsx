import { useLogbookActions, useLogbookState } from '../../state/store'
import EditableItemRow from './EditableItemRow'

export default function ChecklistEditorCard({ which, title }: { which: 'warmup' | 'rehab'; title: string }) {
  const s = useLogbookState()
  const a = useLogbookActions()
  const items = s[which]
  const key = `checklist-${which}`
  const open = !!s.openPlans[key]

  return (
    <div className="card plan-card">
      <button type="button" className="plan-card__header" onClick={() => a.togglePlanOpen(key)}>
        <span className="plan-card__caret">{open ? '▾' : '▸'}</span>
        <span className="plan-card__name">{title}</span>
        <span className="plan-card__count">{items.length} ITEMS</span>
      </button>
      {open && (
        <div className="plan-card__body">
          {items.map((item, i) => (
            <EditableItemRow
              key={item.id}
              index={i}
              total={items.length}
              name={item.name}
              target={item.target}
              desc={item.desc ?? ''}
              video={item.video ?? ''}
              group={item.group}
              showGroup={which === 'rehab'}
              onChangeField={(field, value) => a.updateChecklistItemField(which, item.id, field, value)}
              onMove={(dir) => a.moveChecklistItem(which, item.id, dir)}
              onDelete={() => a.deleteChecklistItem(which, item.id)}
            />
          ))}
          <button type="button" className="add-item-btn" onClick={() => a.addChecklistItem(which)}>
            + ADD ITEM
          </button>
        </div>
      )}
    </div>
  )
}
