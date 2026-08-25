import { useLogbookState } from '../state/store'

export default function Toast() {
  const s = useLogbookState()
  if (!s.toast) return null
  return <div className="toast">{s.toast}</div>
}
