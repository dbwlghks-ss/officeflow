import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const inputPath = path.join(__dirname, '../public/officeflow-logo.png')

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function isBackgroundPixel(r, g, b, bgR, bgG, bgB, tolerance = 42) {
  return colorDistance(r, g, b, bgR, bgG, bgB) <= tolerance
}

const image = sharp(inputPath)
const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height } = info
const visited = new Uint8Array(width * height)
const queue = []

function sampleCorner(x, y) {
  const index = (y * width + x) * 4
  return [data[index], data[index + 1], data[index + 2]]
}

const cornerSamples = [
  sampleCorner(0, 0),
  sampleCorner(width - 1, 0),
  sampleCorner(0, height - 1),
  sampleCorner(width - 1, height - 1),
]

const bgR = Math.round(cornerSamples.reduce((sum, sample) => sum + sample[0], 0) / 4)
const bgG = Math.round(cornerSamples.reduce((sum, sample) => sum + sample[1], 0) / 4)
const bgB = Math.round(cornerSamples.reduce((sum, sample) => sum + sample[2], 0) / 4)

function pushIfBackground(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return
  const pixel = y * width + x
  if (visited[pixel]) return

  const index = pixel * 4
  const r = data[index]
  const g = data[index + 1]
  const b = data[index + 2]

  if (!isBackgroundPixel(r, g, b, bgR, bgG, bgB)) return

  visited[pixel] = 1
  queue.push(pixel)
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (x !== 0 && y !== 0 && x !== width - 1 && y !== height - 1) continue
    pushIfBackground(x, y)
  }
}

while (queue.length > 0) {
  const pixel = queue.pop()
  if (pixel === undefined) continue

  const x = pixel % width
  const y = Math.floor(pixel / width)
  const index = pixel * 4
  data[index + 3] = 0

  pushIfBackground(x - 1, y)
  pushIfBackground(x + 1, y)
  pushIfBackground(x, y - 1)
  pushIfBackground(x, y + 1)
}

for (let i = 0; i < data.length; i += 4) {
  const alpha = data[i + 3]
  if (alpha === 0) continue

  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const distance = colorDistance(r, g, b, bgR, bgG, bgB)

  if (distance <= 18) {
    data[i + 3] = 0
  } else if (distance <= 36) {
    data[i + 3] = Math.round(255 * ((distance - 18) / 18))
  }
}

await sharp(data, {
  raw: {
    width,
    height,
    channels: 4,
  },
})
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(inputPath)

const meta = await sharp(inputPath).metadata()
console.log(`Transparent logo updated: ${meta.width}x${meta.height}, bg=${bgR},${bgG},${bgB}`)
