interface Props {
  index: number
  total: number
  name: string
  target: string
  desc: string
  video: string
  group?: string
  showGroup?: boolean
  onChangeField: (field: 'name' | 'target' | 'desc' | 'video' | 'group', value: string) => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
}

export default function EditableItemRow({ index, total, name, target, desc, video, group, showGroup, onChangeField, onMove, onDelete }: Props) {
  return (
    <div className="edit-row">
      <div className="reorder-col">
        <button type="button" className="reorder-btn" disabled={index === 0} onClick={() => onMove(-1)}>
          ↑
        </button>
        <button type="button" className="reorder-btn" disabled={index === total - 1} onClick={() => onMove(1)}>
          ↓
        </button>
        <div className="reorder-index">{String(index + 1).padStart(2, '0')}</div>
      </div>
      <div className="edit-fields">
        <input className="input-base name" placeholder="exercise name" value={name} onChange={(e) => onChangeField('name', e.target.value)} />
        <input className="input-base target" placeholder="3 x 5" value={target} onChange={(e) => onChangeField('target', e.target.value)} />
        <input className="input-base cue" placeholder="cue / description" value={desc} onChange={(e) => onChangeField('desc', e.target.value)} />
        <input className="input-base video" placeholder="youtube link" value={video} onChange={(e) => onChangeField('video', e.target.value)} />
        {showGroup && (
          <input
            className="input-base group"
            placeholder="group — e.g. Stretches"
            value={group ?? ''}
            onChange={(e) => onChangeField('group', e.target.value)}
          />
        )}
      </div>
      <button type="button" className="edit-delete" onClick={onDelete} aria-label="Delete">
        ×
      </button>
    </div>
  )
}
