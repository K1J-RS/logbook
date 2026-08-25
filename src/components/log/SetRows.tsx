import { useLogbookActions } from '../../state/store'
import type { SetEntry } from '../../types'

interface Props {
  ei: number
  sets: SetEntry[]
  variant: 'overview' | 'focus'
}

export default function SetRows({ ei, sets, variant }: Props) {
  const a = useLogbookActions()
  const gridClass = variant === 'focus' ? 'focus-set-grid' : 'set-grid'
  const inputClass = variant === 'focus' ? 'focus-set-input' : 'set-input'

  return (
    <>
      {sets.map((set, si) => (
        <div className={gridClass} key={si}>
          <div className="set-num">{si + 1}</div>
          <input
            className={`${inputClass}${set.weight !== '' ? ' filled' : ''}`}
            type="number"
            inputMode="decimal"
            step="0.5"
            placeholder="kg"
            value={set.weight}
            onChange={(e) => a.setSetField(ei, si, 'weight', e.target.value)}
          />
          <input
            className={`${inputClass}${set.reps !== '' ? ' filled' : ''}`}
            type="number"
            inputMode="numeric"
            placeholder="reps"
            value={set.reps}
            onChange={(e) => a.setSetField(ei, si, 'reps', e.target.value)}
          />
          <button type="button" className="set-remove" onClick={() => a.removeSet(ei, si)} aria-label="Remove set">
            ×
          </button>
        </div>
      ))}
    </>
  )
}
