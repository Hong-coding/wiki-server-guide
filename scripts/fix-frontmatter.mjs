// frontmatter의 title 값에 콜론 등 YAML 특수문자가 있으면 따옴표로 감싼다.
// 사용: node scripts/fix-frontmatter.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('../docs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name === '.vitepress' || name === 'node_modules') return []
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : []
  })
}

let fixed = 0
for (const file of walk(root)) {
  const src = readFileSync(file, 'utf8')
  const out = src.replace(/^(---\r?\n[\s\S]*?^title: )(.+)$/m, (all, head, value) => {
    const v = value.trim()
    if (/^['"]/.test(v) || !/[:#]|^[-?[\]{}&*!|>%@`]/.test(v)) return all
    return `${head}'${v.replace(/'/g, "''")}'`
  })
  if (out !== src) {
    writeFileSync(file, out)
    fixed++
    console.log('fixed', file)
  }
}
console.log(`${fixed} file(s) fixed`)
