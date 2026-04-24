import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = process.cwd()

const oldChinaPath = path.join(projectRoot, 'src', 'echarts', 'map', 'js', 'china.js')
const oldProvinceDir = path.join(projectRoot, 'src', 'echarts', 'map', 'js', 'province')

const newGeoDir = path.join(projectRoot, 'src', 'echarts', 'geo')
const newProvinceDir = path.join(newGeoDir, 'province')

function ensureDir (dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function readFile (filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

function writeJson (filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function findMatchingBracket (text, startIndex) {
  let depth = 0
  let inString = false
  let stringQuote = ''
  let escaped = false

  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i]

    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === stringQuote) {
        inString = false
      }
      continue
    }

    if (ch === '"' || ch === "'") {
      inString = true
      stringQuote = ch
      continue
    }

    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) return i
    }
  }

  return -1
}

function extractGeoJson (content, fileName) {
  const start = content.indexOf('registerMap')
  if (start === -1) throw new Error(`找不到 registerMap: ${fileName}`)

  const objStart = content.indexOf('{', start)
  const objEnd = findMatchingBracket(content, objStart)

  if (objStart === -1 || objEnd === -1) {
    throw new Error(`JSON提取失败: ${fileName}`)
  }

  const objStr = content.slice(objStart, objEnd + 1)

  return new Function(`return (${objStr})`)()
}

function convertOne (inputPath, outputPath) {
  const content = readFile(inputPath)
  const json = extractGeoJson(content, inputPath)
  writeJson(outputPath, json)

  console.log('✅', path.basename(inputPath))
}

function main () {
  ensureDir(newGeoDir)
  ensureDir(newProvinceDir)

  if (fs.existsSync(oldChinaPath)) {
    convertOne(oldChinaPath, path.join(newGeoDir, 'china.json'))
  }

  if (fs.existsSync(oldProvinceDir)) {
    const files = fs.readdirSync(oldProvinceDir)
    for (const f of files) {
      if (f.endsWith('.js')) {
        convertOne(
          path.join(oldProvinceDir, f),
          path.join(newProvinceDir, f.replace('.js', '.json'))
        )
      }
    }
  }

  console.log('🎉 转换完成')
}

main()