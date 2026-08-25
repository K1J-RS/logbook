export interface ParsedSetVoice {
  weight: string | null
  reps: string | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

interface SpeechRecognitionLike extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start(): void
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as SpeechRecognitionCtor | null
}

export function isVoiceSupported(): boolean {
  return getSpeechRecognitionCtor() !== null
}

/** Parses phrases like "sixty kilos for eight reps", "60 for 8", "8 reps at 60 kg". */
export function parseVoiceEntry(transcript: string): ParsedSetVoice {
  const t = transcript.toLowerCase()
  let weight: string | null = null
  let reps: string | null = null
  const repMatch = t.match(/(\d+(\.\d+)?)\s*rep/)
  if (repMatch) reps = repMatch[1]
  const weightMatch = t.match(/(\d+(\.\d+)?)\s*(kg|kilo|kilos|kilogram|pound|pounds|lb|lbs)/)
  if (weightMatch) weight = weightMatch[1]
  const nums = t.match(/\d+(\.\d+)?/g) ?? []
  if (weight == null && nums.length) weight = nums[0] ?? null
  if (reps == null && nums.length > 1) reps = nums[1] ?? null
  return { weight, reps }
}

export function startVoiceCapture(onResult: (transcript: string) => void, onEnd: () => void, onUnsupported: () => void): void {
  const Ctor = getSpeechRecognitionCtor()
  if (!Ctor) {
    onUnsupported()
    return
  }
  const recognition = new Ctor()
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }
  recognition.onerror = () => onEnd()
  recognition.onend = () => onEnd()
  recognition.start()
}
