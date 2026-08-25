import { useLogbookActions, useLogbookState } from '../state/store'
import type { ViewName } from '../types'

const TABS: { view: ViewName; icon: string; label: string }[] = [
  { view: 'log', icon: '＋', label: 'LOG' },
  { view: 'history', icon: '▤', label: 'HIST' },
  { view: 'progress', icon: '◺', label: 'PROG' },
  { view: 'plans', icon: '✎', label: 'PLANS' },
  { view: 'library', icon: '⌗', label: 'LIB' },
]

export default function TabBar() {
  const s = useLogbookState()
  const a = useLogbookActions()
  return (
    <div className="tabbar">
      {TABS.map((t) => (
        <button key={t.view} className={`tabbar__btn${s.view === t.view ? ' is-active' : ''}`} onClick={() => a.setView(t.view)}>
          <span className="tabbar__icon">{t.icon}</span>
          <span className="tabbar__label">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
