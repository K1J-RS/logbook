// One-off icon generator. Draws a small "loaded bar" glyph (matches the app's
// cyan instrument-panel accent) onto flat backgrounds. Pure JS (pngjs), no
// native deps, so it runs anywhere Node runs.
import { PNG } from 'pngjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const BG = [0x0b, 0x0d, 0x0f]
const CYAN = [0x6f, 0xc3, 0xd6]
const CYAN_DIM = [0x2a, 0x4a, 0x52]

function setPx(png, x, y, [r, g, b], a = 255) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return
  const idx = (png.width * y + x) << 2
  png.data[idx] = r
  png.data[idx + 1] = g
  png.data[idx + 2] = b
  png.data[idx + 3] = a
}

function fillRect(png, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) setPx(png, x, y, color)
}

function fillCircle(png, cx, cy, r, color) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) setPx(png, cx + x, cy + y, color)
    }
  }
}

// Draws a barbell glyph: a horizontal bar with a plate stack at each end.
function drawBarbell(png, size, scale) {
  const cx = size / 2
  const cy = size / 2
  const barH = Math.round(size * 0.055 * scale)
  const barHalfLen = Math.round(size * 0.30 * scale)
  fillRect(png, Math.round(cx - barHalfLen), Math.round(cy - barH / 2), barHalfLen * 2, barH, CYAN)

  const plateRs = [0.16, 0.115, 0.075].map((f) => Math.round(size * f * scale))
  const gaps = [0, Math.round(size * 0.045 * scale), Math.round(size * 0.085 * scale)]
  for (let side = -1; side <= 1; side += 2) {
    plateRs.forEach((r, i) => {
      const x = cx + side * (barHalfLen - gaps[i])
      fillCircle(png, Math.round(x), Math.round(cy), r, i === 0 ? CYAN : CYAN_DIM)
    })
  }
  // status dot (matches the header wordmark glyph) above the bar
  fillCircle(png, Math.round(cx), Math.round(cy - size * 0.20 * scale), Math.max(2, Math.round(size * 0.02 * scale)), CYAN)
}

function makeIcon(size, { maskable = false } = {}) {
  const png = new PNG({ width: size, height: size })
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = BG[0]
    png.data[i + 1] = BG[1]
    png.data[i + 2] = BG[2]
    png.data[i + 3] = 255
  }
  // maskable icons need generous safe-zone padding (content within ~66% center)
  drawBarbell(png, size, maskable ? 0.62 : 0.92)
  return png
}

function writePng(png, file) {
  const buf = PNG.sync.write(png)
  writeFileSync(path.join(outDir, file), buf)
  console.log('wrote', file)
}

writePng(makeIcon(192), 'icon-192.png')
writePng(makeIcon(512), 'icon-512.png')
writePng(makeIcon(192, { maskable: true }), 'icon-maskable-192.png')
writePng(makeIcon(512, { maskable: true }), 'icon-maskable-512.png')
writePng(makeIcon(32), 'icon-32.png')
