import { useEffect, useMemo, useRef } from 'react'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  type ChartConfiguration,
} from 'chart.js'
import { useLogbookActions, useLogbookState } from '../../state/store'
import { topSet } from '../../lib/derive'
import { formatDateShort } from '../../lib/format'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

export default function ProgressScreen() {
  const s = useLogbookState()
  const a = useLogbookActions()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  const exerciseNames = useMemo(() => {
    const seen = new Set<string>()
    const names: string[] = []
    for (const t of s.templates) for (const ex of t.exercises) if (!seen.has(ex.name)) (seen.add(ex.name), names.push(ex.name))
    for (const l of s.logs) for (const e of l.entries) if (!seen.has(e.name)) (seen.add(e.name), names.push(e.name))
    return names
  }, [s.templates, s.logs])

  const nameHasData = (name: string) => s.logs.some((l) => l.entries.some((e) => e.name === name && e.sets.some((set) => set.weight !== '')))

  useEffect(() => {
    if (s.progressEx || !exerciseNames.length) return
    const withData = exerciseNames.find(nameHasData)
    a.setProgressEx(withData ?? exerciseNames[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseNames, s.progressEx])

  const selected = s.progressEx ?? exerciseNames[0] ?? null

  const points = useMemo(() => {
    if (!selected) return []
    return s.logs
      .filter((l) => l.entries.some((e) => e.name === selected))
      .map((l) => ({ date: l.date, weight: topSet(l, selected) }))
      .filter((p): p is { date: string; weight: number } => p.weight !== null)
      .sort((x, y) => x.date.localeCompare(y.date))
  }, [s.logs, selected])

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()
    if (!points.length) return

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: points.map((p) => formatDateShort(p.date)),
        datasets: [
          {
            data: points.map((p) => p.weight),
            borderColor: '#6FC3D6',
            borderWidth: 2,
            backgroundColor: 'rgba(111,195,214,.10)',
            fill: true,
            pointBackgroundColor: '#E0A542',
            pointBorderColor: '#E0A542',
            pointRadius: 3.5,
            tension: 0.18,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: '#1B2024' },
            ticks: { color: '#6B767D', font: { family: "'IBM Plex Mono', monospace", size: 10 } },
          },
          y: {
            grid: { color: '#1B2024' },
            ticks: { color: '#6B767D', font: { family: "'IBM Plex Mono', monospace", size: 10 } },
          },
        },
      },
    }
    chartRef.current = new Chart(canvasRef.current, config)
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [points])

  if (!exerciseNames.length) {
    return (
      <div className="empty-state">
        <span className="empty-state__label">NO DATA</span>
        Log a few sessions and the trend line appears here.
      </div>
    )
  }

  const latest = points.length ? points[points.length - 1].weight : null
  const best = points.length ? Math.max(...points.map((p) => p.weight)) : null
  const change = points.length >= 2 ? points[points.length - 1].weight - points[0].weight : points.length === 1 ? 0 : null

  return (
    <>
      <div className="card picker-card">
        <span className="mono-label">EXERCISE</span>
        <select className="select-base" value={selected ?? ''} onChange={(e) => a.setProgressEx(e.target.value)}>
          {exerciseNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="card chart-card">
        <div style={{ height: 190 }}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      {points.length ? (
        <div className="progress-tiles">
          <div className="progress-tile">
            <div className="progress-tile__value">{latest}</div>
            <div className="progress-tile__label">LATEST KG</div>
          </div>
          <div className="progress-tile">
            <div className="progress-tile__value amber">{best}</div>
            <div className="progress-tile__label">BEST KG</div>
          </div>
          <div className="progress-tile">
            <div className={`progress-tile__value ${change !== null && change >= 0 ? 'positive' : 'negative'}`}>
              {change !== null ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}` : '—'}
            </div>
            <div className="progress-tile__label">CHANGE</div>
          </div>
        </div>
      ) : (
        <div className="progress-tiles">
          <div className="progress-tile">
            <div className="progress-tile__value" style={{ color: 'var(--text-dim)' }}>
              —
            </div>
            <div className="progress-tile__label">NO DATA</div>
          </div>
        </div>
      )}
    </>
  )
}
