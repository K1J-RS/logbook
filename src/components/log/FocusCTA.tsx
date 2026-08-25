import { useLogbookActions, useLogbookState } from '../../state/store'

export default function FocusCTA() {
  const s = useLogbookState()
  const a = useLogbookActions()
  if (!s.draft) return null
  const hasProgress = s.draft.entries.some((e) => e.skipped || e.sets.some((set) => set.weight !== '' || set.reps !== ''))
  return (
    <button type="button" className="focus-cta" onClick={a.openFocus}>
      {hasProgress ? '▸ RESUME SESSION — ONE AT A TIME' : '▸ START SESSION — ONE AT A TIME'}
    </button>
  )
}
