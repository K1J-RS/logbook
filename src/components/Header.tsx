import { useLogbookState } from '../state/store'
import { planShortName } from '../lib/format'

export default function Header() {
  const s = useLogbookState()

  let status: string
  let right: string
  if (s.view === 'log') {
    status = s.draft ? `${planShortName(s.draft.templateName).toUpperCase()} · READY` : 'LOG'
    right = s.draft?.date ?? ''
  } else {
    status = s.view.toUpperCase()
    right = `${s.logs.length} SESSIONS`
  }

  return (
    <div className="header">
      <div className="header__row">
        <div className="header__brand">
          <div className="header__dot" />
          <div>
            <div className="header__word">LOGBOOK</div>
            <div className="header__status">{status}</div>
          </div>
        </div>
        <div className="header__right">{right}</div>
      </div>
    </div>
  )
}
