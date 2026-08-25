import { useLogbookActions } from '../../state/store'

export default function SaveBar() {
  const a = useLogbookActions()
  return (
    <div className="save-bar">
      <button type="button" className="save-btn" onClick={a.saveSession}>
        SAVE SESSION
      </button>
    </div>
  )
}
