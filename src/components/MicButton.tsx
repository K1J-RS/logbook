import { startVoiceCapture } from '../lib/voice'
import { useLogbookActions, useLogbookState } from '../state/store'

interface Props {
  listenKey: string
  idleLabel: string
  onTranscript: (transcript: string) => void
  className?: string
}

export default function MicButton({ listenKey, idleLabel, onTranscript, className }: Props) {
  const s = useLogbookState()
  const a = useLogbookActions()
  const isListening = s.listening === listenKey

  function handleClick() {
    if (isListening) return
    a.setListening(listenKey)
    startVoiceCapture(
      (transcript) => onTranscript(transcript),
      () => a.setListening(null),
      () => {
        a.setListening(null)
        a.toast('Voice input not supported here')
      },
    )
  }

  return (
    <button type="button" className={`mic-btn${isListening ? ' is-listening' : ''} ${className ?? ''}`} onClick={handleClick}>
      {isListening ? '● LISTENING' : idleLabel}
    </button>
  )
}
