import { useMemo } from 'react'
import { useLogbookActions, useLogbookState } from '../../state/store'

export default function LibraryScreen() {
  const s = useLogbookState()
  const a = useLogbookActions()

  const missingCount = s.library.filter((l) => !l.video).length

  const shown = useMemo(() => {
    const q = s.libQuery.trim().toLowerCase()
    return s.library.filter((l) => {
      if (s.missingOnly && l.video) return false
      if (!q) return true
      return l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q)
    })
  }, [s.library, s.libQuery, s.missingOnly])

  return (
    <>
      <input
        className="search-input"
        placeholder="Search exercises…"
        value={s.libQuery}
        onChange={(e) => a.setLibQuery(e.target.value)}
      />
      <div className="lib-meta-row">
        <span className="lib-meta">
          {shown.length} OF {s.library.length} · {missingCount} MISSING VIDEO
        </span>
        <button type="button" className={`gaps-toggle${s.missingOnly ? ' is-on' : ''}`} onClick={() => a.setMissingOnly(!s.missingOnly)}>
          {s.missingOnly ? 'SHOWING GAPS' : 'GAPS ONLY'}
        </button>
      </div>

      <div className="lib-list">
        {shown.map((entry) => {
          const isGap = !entry.video
          return (
            <div className={`lib-card${isGap ? ' is-gap' : ''}`} key={entry.id}>
              <input
                className="lib-input-plain name"
                value={entry.name}
                placeholder="exercise name"
                onChange={(e) => a.updateLibraryField(entry.id, 'name', e.target.value)}
              />
              <input
                className="lib-input-plain desc"
                value={entry.desc}
                placeholder="description / cue"
                onChange={(e) => a.updateLibraryField(entry.id, 'desc', e.target.value)}
              />
              <input
                className={`lib-input-video${isGap ? ' missing' : ''}`}
                value={entry.video}
                placeholder="paste youtube link"
                onChange={(e) => a.updateLibraryField(entry.id, 'video', e.target.value)}
              />
              <div className="lib-footer-row">
                {entry.video ? (
                  <a className="watch-link" href={entry.video} target="_blank" rel="noopener noreferrer">
                    ▶ WATCH
                  </a>
                ) : (
                  <span className="no-video-flag">⚠ NO VIDEO YET</span>
                )}
                <button type="button" className="edit-delete" onClick={() => a.deleteLibraryEntry(entry.id)} aria-label="Delete">
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" className="new-plan-btn" style={{ marginTop: 10, marginBottom: 0 }} onClick={a.addLibraryEntry}>
        + ADD EXERCISE
      </button>
    </>
  )
}
