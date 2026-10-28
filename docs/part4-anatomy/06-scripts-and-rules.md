---
title: 보조 스크립트와 문서 작성 규칙
---

# 보조 스크립트와 문서 작성 규칙

<LessonMeta level="중급" :minutes="30" prev="기본 테마를 extends로 이어받고, withBase와 onMounted를 지키는 컴포넌트 4개를 전역 등록했다" />

## 이번에 배울 것

- `scripts/fix-frontmatter.mjs` 30줄을 읽고, 정규식이 무엇을 찾아 어떻게 고치는지 설명할 수 있다.
- frontmatter `title`의 콜론이 왜 빌드를 깨뜨리는지 실제 에러로 재현할 수 있다.
- `docs/guide/writing-guide.md`의 빌드 규칙(꺾쇠, 이중 중괄호, 죽은 링크)이 왜 생겼는지 실제 에러 메시지로 설명할 수 있다.
- `README.md`가 저장소에서 맡는 역할을 말할 수 있다.

## 먼저 알아 둘 것

- 마크다운 frontmatter(파일 맨 위 `---`로 감싼 설정 구역) → [VitePress: 설정 · 라우팅 · 테마](../part3-libraries/01-vitepress)
- VitePress가 마크다운을 Vue 템플릿으로 처리한다는 것 → [마크다운 확장과 코드 하이라이트](../part3-libraries/03-markdown-it-shiki)
- 정규식(정규 표현식, 문자열 패턴을 표현하는 작은 언어)을 처음 본다면, 이 레슨에서 기호 하나씩 풀어 읽습니다.

## 비유로 이해하기

공장에 **검수 규칙집**과 **자동 교정기**가 있다고 해 봅시다. 규칙집(`writing-guide.md`)에는 "이런 부품은 기계에 넣으면 걸린다"는 경험이 적혀 있고, 자동 교정기(`fix-frontmatter.mjs`)는 그중 가장 자주 나는 실수 하나를 기계가 대신 고쳐 줍니다. 규칙 하나하나에는 **실제로 기계가 멈췄던 사고**가 뒤에 있습니다. 이번 레슨은 그 사고를 일부러 다시 일으켜 보는 시간입니다.

## 개념 설명

### 0단계: 실험용 작은 프로젝트 만들기

ts-wiki 전체 빌드는 2~3분이 걸려서, 에러를 재현하기에는 너무 느립니다. 페이지 1~2개짜리 실험장을 만듭니다.

Windows(PowerShell):

```powershell
mkdir vp-lab; cd vp-lab
npm init -y
npm pkg set type=module
npm install -D -E vitepress@1.6.3 vue@3.5.13
mkdir docs
Set-Content -Encoding utf8 docs/index.md '# 실험장'
npx vitepress build docs
```

macOS/Linux(bash):

```bash
mkdir vp-lab && cd vp-lab
npm init -y
npm pkg set type=module
npm install -D -E vitepress@1.6.3 vue@3.5.13
mkdir docs
printf '# 실험장\n' > docs/index.md
npx vitepress build docs
```

작성 시점 실제 출력(끝부분):

```text
✓ rendering pages...
build complete in 5.70s.
```

- `-E`(`--save-exact`)를 빼면 `package.json`에 `"^1.6.3"`처럼 `^`가 붙어 기록됩니다. 실제로 `-E` 없이 설치했더니 `"vitepress": "^1.6.3"`으로 적혔습니다. ts-wiki처럼 정확한 버전으로 남기려면 `-E`를 붙입니다([4-2](./02-package-json) 참고).
- 설치가 끝나면 `npm audit`(알려진 보안 취약점 검사) 안내가 나옵니다. 작성 시점에 이 두 버전 조합에서 5건(moderate 2, high 3)이 보고되었습니다. 실험장은 내 PC에서만 쓰므로 그대로 진행해도 되지만, 실제 위키는 [4-2](./02-package-json)의 방법으로 버전 업데이트를 검토해야 합니다.
- 이제부터 실험 파일을 `docs/` 아래에 하나씩 넣고 `npx vitepress build docs`로 빌드한 뒤, 실험이 끝나면 그 파일을 지웁니다.

**확인 방법:** `build complete`가 나오고 `docs/.vitepress/dist/index.html`이 생기면 실험장 준비 완료입니다. 종료 코드는 PowerShell에서 `$LASTEXITCODE`, bash에서 `echo $?`로 봅니다. 0이면 성공, 1이면 실패입니다.

### 1단계: frontmatter 콜론 사고 재현

frontmatter는 **YAML**(사람이 읽기 쉬운 설정 파일 형식)로 쓰입니다. YAML에서 `이름: 값`의 콜론+공백은 "여기서 이름과 값을 나눈다"는 뜻입니다. 그런데 레슨 제목에는 콜론이 자주 들어갑니다. 실험장에 이 파일을 넣고 빌드했습니다.

```md
---
title: 프로젝트 1: 콘솔 가계부
---

# 가계부
```

```text
  vitepress v1.6.3

- building client + server bundles...
x Build failed in 432ms
✖ building client + server bundles...
build error:
[vitepress] incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line at line 2, column 14:
    title: 프로젝트 1: 콘솔 가계부
                 ^
file: .../docs/a.md
```

종료 코드는 1(실패)이었습니다. 메시지를 풀어 읽으면 이렇습니다.

- `incomplete explicit mapping pair; a key node is missed`: "이름: 값 쌍이 불완전하다, 이름이 빠졌다". YAML은 `title: 프로젝트 1`까지를 한 쌍으로 읽고, 두 번째 `: 콘솔 가계부`를 새 쌍의 시작으로 보려다 이름이 없어서 멈춘 것입니다.
- `at line 2, column 14` 와 `^` 표시: frontmatter 2번째 줄, 문제의 두 번째 콜론 근처를 가리킵니다.

고치는 방법은 값을 따옴표로 감싸는 것입니다. 작은따옴표 안에서는 콜론이 그냥 글자입니다.

```yaml
title: '프로젝트 1: 콘솔 가계부'
```

#### 더 위험한 것: 에러 없이 망가지는 `#`

같은 실험장에서 제목이 `#`으로 시작하는 파일도 빌드했습니다.

```md
---
title: #해시로 시작
---

본문만 있음
```

이번에는 **빌드가 성공(종료 코드 0)**했습니다. 그런데 결과 HTML의 `<title>`은 `mini`(사이트 제목)뿐이었습니다. YAML에서 공백 뒤의 `#`은 **주석의 시작**이라, 제목 값이 통째로 사라진 것입니다. 에러가 안 나니 더 알아채기 어렵습니다. 이것이 스크립트가 콜론뿐 아니라 `#`도 검사하는 이유입니다.

### 2단계: `fix-frontmatter.mjs` 한 줄씩 읽기

ts-wiki는 레슨 75개의 제목 중 콜론이 든 것이 많아(예: `'왜 TypeScript인가: 타입이 막아 주는 실수들'`), 이 실수를 사람이 매번 찾지 않도록 스크립트를 만들었습니다. 전체 30줄입니다.

```js:line-numbers
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
```

#### 3~4줄: Node.js 기본 모듈

`node:fs`(파일 읽기·쓰기), `node:path`(경로 이어 붙이기)는 Node.js에 들어 있는 모듈이라 설치가 필요 없습니다. 앞의 `node:`는 "npm 패키지가 아니라 Node 내장 모듈"임을 분명히 하는 표기입니다.

#### 6줄: 스크립트 위치에서 `docs` 폴더 찾기

- `import.meta.url`: **지금 실행 중인 이 파일**의 주소(`file:///...`). ESM에서만 쓸 수 있습니다(확장자가 `.mjs`인 이유).
- `new URL('../docs', ...)`: 이 파일 기준으로 한 단계 위의 `docs`. 그래서 어느 폴더에서 `node scripts/fix-frontmatter.mjs`를 실행해도 항상 프로젝트의 `docs`를 찾습니다.
- `.pathname`: URL에서 경로 부분만. 그런데 Windows에서는 앞에 슬래시가 하나 더 붙습니다.

```bash
node -e "console.log(new URL('../docs', 'file:///C:/x/scripts/fix.mjs').pathname)"
```

```text
/C:/x/docs
```

- `.replace(/^\/([A-Za-z]:)/, '$1')`: 정규식으로 "맨 앞의 `/` 다음에 드라이브 문자와 콜론(`C:`)이 오면, 슬래시를 떼고 `C:`만 남겨라". `([A-Za-z]:)`의 괄호는 **그룹**이고, `$1`은 "첫 번째 그룹이 찾은 글자"입니다. macOS·Linux 경로(`/home/...`)는 이 패턴에 맞지 않아 그대로 둡니다.

#### 8~14줄: `walk` — 폴더를 끝까지 내려가며 `.md` 모으기

- `readdirSync(dir)`: 폴더 안의 이름 목록.
- `flatMap`: `map`을 한 뒤 결과 배열을 한 단계 **펼칩니다**. 각 이름이 `[]`(빈 배열, 건너뜀), `[p]`(파일 하나), `walk(p)`(하위 폴더의 파일들)를 돌려주면 그것들이 하나의 평평한 배열로 합쳐집니다.
- 10줄: `.vitepress`(설정 폴더)와 `node_modules`는 건너뜁니다.
- 12줄: 폴더면 그 안으로 다시 `walk`(재귀, 자기 자신을 다시 부르기), `.md` 파일이면 담고, 나머지는 버립니다. 삼항 연산자가 두 번 이어진 형태입니다.

#### 19줄: 첫 번째 정규식 — `title:` 줄 찾기

```text
/^(---\r?\n[\s\S]*?^title: )(.+)$/m
```

| 조각 | 뜻 |
|---|---|
| 끝의 `m` | 여러 줄 모드. `^`·`$`가 파일 처음·끝이 아니라 **각 줄의** 처음·끝에 맞습니다 |
| `^---` | 줄 맨 앞의 `---`(frontmatter 시작) |
| `\r?\n` | 줄바꿈. `\r?`는 "CR이 있어도 되고 없어도 된다" → LF·CRLF 파일 모두 처리 |
| `[\s\S]*?` | 아무 글자나(줄바꿈 포함) **최소한으로**. `?`가 붙어 가장 가까운 `title:`에서 멈춥니다 |
| `^title: ` | 줄 맨 앞의 `title: ` |
| 첫 번째 괄호 그룹 | 여기까지를 `head`로 받습니다(그대로 다시 붙이기 위해) |
| `(.+)$` | 그 줄의 나머지 = 제목 값. `value`로 받습니다 |

`.replace(정규식, 함수)`는 맞는 부분을 찾으면 함수를 불러, 함수가 돌려준 문자열로 바꿉니다. 함수는 `(전체, 그룹1, 그룹2)`를 받으므로 `(all, head, value)`입니다.

#### 21줄: 두 번째 정규식 — 고쳐야 하는 값인가?

```text
/^['"]/.test(v) || !/[:#]|^[-?[\]{}&*!|>%@`]/.test(v)
```

이 조건이 참이면 `return all`(아무것도 안 바꿈)입니다.

- `/^['"]/`: 이미 작은따옴표나 큰따옴표로 시작하면 → 이미 감쌌으니 건너뜀.
- `` /[:#]|^[-?[\]{}&*!|>%@`]/ ``: 둘 중 하나라도 맞으면 "위험한 값"
  - `[:#]`: 어디든 콜론이나 `#`이 있음
  - `^[...]`: **맨 앞 글자**가 `-`, `?`, `[`, `]`, `{`, `}`, `&`, `*`, `!`, `|`, `>`, `%`, `@`, 백틱 중 하나. 모두 YAML에서 줄 맨 앞에 오면 특별한 뜻(목록, 배열, 객체, 참조 등)이 되는 기호입니다. `[` 안에서 `]`를 글자로 쓰려고 `\]`로 이스케이프했습니다.
- 앞의 `!`가 "위험하지 **않으면**"으로 뒤집습니다. 즉 "이미 감쌌거나, 위험한 글자가 없으면 그대로 둔다".

#### 22줄: 작은따옴표로 감싸기

```js
return `${head}'${v.replace(/'/g, "''")}'`
```

YAML 작은따옴표 문자열 안에서 작은따옴표 자체는 **두 번**(`''`) 써야 합니다. `/'/g`의 `g`는 "모두 바꾸기"입니다. 제목에 `'a'` 같은 글자가 있어도 깨지지 않습니다.

#### 24~30줄: 바뀐 파일만 저장하고 개수 출력

바뀌지 않은 파일은 쓰지 않습니다. 쓸데없이 파일을 다시 쓰면 git이 "변경됨"으로 보거나 개발 서버가 불필요하게 새로 고칠 수 있기 때문입니다.

#### 실제로 실행하기

실험장에 `scripts/fix-frontmatter.mjs`를 복사하고, 여러 경우의 파일을 만들어 실행했습니다(경로는 줄임).

```bash
node scripts/fix-frontmatter.mjs
```

```text
fixed ...\docs\a.md
fixed ...\docs\h.md
fixed ...\docs\s.md
3 file(s) fixed
```

| 파일 | 실행 전 | 실행 후 |
|---|---|---|
| `a.md` | `title: 프로젝트 1: 콘솔 가계부` | `title: '프로젝트 1: 콘솔 가계부'` |
| `q.md` | `title: '이미 감싼: 제목'` | 그대로(이미 따옴표) |
| `h.md` | `title: #해시로 시작` | `title: '#해시로 시작'` |
| `p.md` | `title: 평범한 제목` | 그대로(위험한 글자 없음) |
| `s.md` | `title: 리터럴 타입: 'a' \| 'b'` | `title: '리터럴 타입: ''a'' \| ''b'''` |

한 번 더 실행하면 `0 file(s) fixed`가 나옵니다. 여러 번 실행해도 결과가 같은 성질(멱등성, idempotence)이 있어서 안심하고 아무 때나 돌릴 수 있습니다.

ts-wiki에서는 `npm run fix:frontmatter`로 실행합니다.

**확인 방법:** 고친 `a.md`로 다시 빌드하면 `build complete`가 나와야 합니다.

#### 이 스크립트의 한계 (실험으로 찾은 것)

실험하다 두 가지 한계를 발견했습니다. ts-wiki 원본은 고치지 않았고, 개선 방법만 적습니다.

1. **본문의 코드 블록도 고칠 수 있습니다.** frontmatter에 `title`이 없는 파일(예: `layout: home`만 있는 홈)에서, 본문 코드 블록에 `title: 예시: 값` 같은 줄이 있으면 그 줄이 `'예시: 값'`으로 바뀌었습니다. 19줄 정규식의 `^---`가 여러 줄 모드라 frontmatter를 닫는 `---` 줄에서도 다시 시작할 수 있기 때문입니다.
2. **경로에 한글이나 공백이 있으면 실패합니다.** `.pathname`은 한글·공백을 `%ED%95%9C`, `%20` 같은 퍼센트 인코딩으로 돌려줍니다. 실험장을 `한글 폴더` 아래에 두고 실행했더니 이렇게 멈췄습니다.

   ```text
   Error: ENOENT: no such file or directory, scandir '...\g-d\%ED%95%9C%EA%B8%80%20%ED%8F%B4%EB%8D%94\docs'
   ```

두 문제를 고친 버전을 스크래치에서 만들어 확인했습니다(LF·CRLF 파일, 코드 블록 파일, 한글 경로 모두 통과).

```js
import { fileURLToPath } from 'node:url'

// 한글·공백이 든 경로도 올바르게 바뀌도록 fileURLToPath를 씁니다.
const root = fileURLToPath(new URL('../docs', import.meta.url))

// (walk 함수는 같음)

for (const file of walk(root)) {
  const src = readFileSync(file, 'utf8')
  // 파일 맨 앞의 frontmatter 블록(--- ~ ---)만 잘라 그 안에서만 title을 고칩니다.
  const fm = src.match(/^---\r?\n[\s\S]*?\r?\n---/)
  if (!fm) continue
  const fixedFm = fm[0].replace(/^(title: )(.+?)(\r?)$/m, (all, head, value, cr) => {
    const v = value.trim()
    if (/^['"]/.test(v) || !/[:#]|^[-?[\]{}&*!|>%@`]/.test(v)) return all
    return `${head}'${v.replace(/'/g, "''")}'${cr}`
  })
  const out = fixedFm + src.slice(fm[0].length)
  // (저장·출력 부분은 같음)
}
```

- `fileURLToPath`: `file:///` 주소를 운영체제에 맞는 경로로 정확히 바꾸는 Node 내장 함수입니다. 퍼센트 인코딩 해제와 Windows 드라이브 문자 처리를 모두 해 줍니다. 6줄의 손으로 만든 `replace`가 하던 일을 대신합니다.
- `src.match(/^---.../)`는 `m` 플래그가 없어서 `^`가 **파일의 맨 처음**에만 맞습니다. frontmatter 바깥은 건드리지 않습니다.

이 가이드 사이트의 스크립트는 ts-wiki 것을 그대로 쓰고 있으므로, 두 한계가 문제 되는 상황(한글 경로, 본문에 `title:` 코드)에서는 개선판을 참고하세요.

### 3단계: 작성 규칙이 생긴 이유 — 마크다운은 Vue 템플릿이다

ts-wiki `docs/guide/writing-guide.md` 56줄은 이렇게 시작합니다.

```text
VitePress는 마크다운을 Vue 템플릿으로 처리합니다. 다음을 지키지 않으면 빌드가 깨집니다.
```

VitePress는 마크다운을 HTML로 바꾼 뒤, 그 HTML을 **Vue 컴포넌트의 템플릿**으로 컴파일합니다. 그래서 `<PartLessons />` 같은 컴포넌트를 마크다운에 바로 쓸 수 있는 것이지만, 반대로 **Vue가 특별하게 읽는 글자**를 본문에 쓰면 사고가 납니다. 대표적인 것이 꺾쇠와 이중 중괄호입니다. 실험장에서 하나씩 재현했습니다.

#### 사고 1: 꺾쇠 (규칙 1)

```md
# 꺾쇠

타입은 Array<string> 입니다.
```

```text
build error:
[vite:vue] [plugin vite:vue] docs/c.md (5:13): Element is missing end tag.
file: .../docs/c.md:5:13
```

종료 코드 1(실패). `<string>`을 HTML 태그로 읽었는데 닫는 태그(`</string>`)가 없어서 "요소의 끝 태그가 없다"고 멈췄습니다. `(5:13)`은 변환된 템플릿 기준 위치라 원본 줄 번호와 정확히 같지 않을 수 있습니다. 이럴 때는 **파일 이름을 먼저 보고**, 그 파일에서 꺾쇠를 찾습니다.

해결: 인라인 코드로 감쌉니다. 인라인 코드 안의 꺾쇠는 `&lt;`로 바뀌어 태그로 읽히지 않습니다.

```md
타입은 `Array<string>` 입니다.
```

#### 사고 2: 이중 중괄호 (규칙 2)

Vue 템플릿에서 이중 중괄호는 "안의 JavaScript 식을 계산해 그 자리에 넣어라"는 뜻입니다. 세 가지 경우를 실험했습니다.

```md
<!-- b.md: 인라인 코드 안, 정의되지 않은 이름 -->
값은 `{{ total }}` 입니다.

<!-- b4.md: 맨글자, 속성 접근 -->
값은 {{ github.event.repository.name }} 입니다.

<!-- b6.md: 인라인 코드 안, 속성 접근 -->
- 값은 `${{ github.event.repository.name }}` 입니다.
```

| 파일 | 빌드 결과 | 결과 HTML |
|---|---|---|
| `b.md` | **성공**(종료 코드 0) | `<p>값은 <code></code> 입니다.</p>` — 글자가 **사라짐** |
| `b4.md` | 실패(종료 코드 1) | — |
| `b6.md` | 실패(종료 코드 1) | — |

`b4.md`, `b6.md`의 에러는 같았습니다.

```text
- rendering pages...
✖ rendering pages...
build error:
Cannot read properties of undefined (reading 'event')
TypeError: Cannot read properties of undefined (reading 'event')
```

Vue가 `github.event...`를 계산하려 했는데 `github`라는 변수가 없어서(`undefined`) `.event`를 읽지 못한 것입니다. 파일 이름도 줄 번호도 알려 주지 않아, 페이지가 많으면 원인을 찾기가 매우 어렵습니다.

여기서 중요한 사실이 드러납니다.

- **인라인 코드(백틱 한 쌍)로 감싸도 Vue는 이중 중괄호를 계산합니다.** 계산이 에러 없이 끝나면(`b.md`) 빌드는 성공하지만 글자가 조용히 사라지고, 계산이 에러를 내면(`b6.md`) 빌드가 실패합니다.
- GitHub Actions 문서를 쓰다 보면 `deploy.yml` 32줄 같은 표현식을 본문에 인용하고 싶어지는데, 이것이 바로 `b6.md`의 경우입니다.
- **펜스 코드 블록**(백틱 세 개로 감싼 블록) 안은 VitePress가 Vue 해석을 막아 주므로 안전합니다. 이 페이지의 실험 코드도 모두 펜스 코드 블록 안에 있어서 빌드가 깨지지 않습니다.

::: warning ts-wiki 규칙과 이 가이드 규칙의 차이
ts-wiki `writing-guide.md` 59줄은 이중 중괄호를 "필요하면 인라인 코드로 감쌉니다"라고 적고 있습니다. 위 실험 결과처럼 인라인 코드는 안전하지 않습니다. 그래서 이 가이드의 [문서 작성 규칙](../guide/writing-guide) 2번은 "**코드 블록 안에만** 쓰고, 인라인 코드 안에서도 빌드가 깨진다"로 강화했습니다. 본문에서 꼭 보여야 하면 `<span v-pre>`로 감싸면 Vue 해석을 끌 수 있습니다(`v-pre`는 "이 안은 템플릿으로 해석하지 말라"는 Vue 지시어). 규칙은 실험으로 검증하며 고쳐 가는 것입니다.
:::

#### 사고 3: 죽은 링크 (규칙 8)

```md
# 링크

[다음 레슨](./02-nothing)
```

```text
(!) Found dead link ./02-nothing in file d.md

If this is expected, you can disable this check via config. Refer: https://vitepress.dev/reference/site-config#ignoredeadlinks

x Build failed in 7.57s
✖ building client + server bundles...
build error:
[vitepress] 1 dead link(s) found.
```

종료 코드 1(실패). **죽은 링크**(dead link, 없는 페이지를 가리키는 링크)를 VitePress가 빌드 때 검사해 멈춘 것입니다. 이번에는 메시지가 친절해서 파일 이름(`d.md`)과 링크(`./02-nothing`)를 정확히 알려 줍니다. 안내문처럼 `ignoreDeadLinks` 설정으로 검사를 끌 수도 있지만, ts-wiki는 끄지 않았습니다. 레슨 끝의 "다음 단계" 링크가 하나라도 틀리면 **배포 전에** 알 수 있기 때문입니다. 이 검사는 실패가 오히려 고마운 안전장치입니다.

[4-4](./04-curriculum) 7단계에서 본 것처럼, 이 검사는 **마크다운 본문 링크만** 봅니다. 사이드바나 컴포넌트가 만든 링크는 검사하지 않습니다.

#### 정리: 사고와 규칙의 대응

| ts-wiki 규칙(`writing-guide.md`) | 막는 사고 | 빌드 결과 |
|---|---|---|
| 1. 타입 문법은 인라인 코드로(58줄) | 꺾쇠 → `Element is missing end tag.` | 실패 |
| 2. 이중 중괄호를 맨글자로 쓰지 않음(59줄) | 식 계산 → `TypeError` 또는 글자 사라짐 | 실패 또는 **조용한 오류** |
| 3. 코드 블록 언어 지정(60줄) | 하이라이트 없음, 읽기 어려움 | 성공(품질 문제) |
| 7. title 콜론은 작은따옴표로(77줄) | YAML → `incomplete explicit mapping pair` | 실패 |
| 8. 내부 링크는 상대 경로, `.md` 생략(78줄) | 없는 페이지 → `dead link(s) found` | 실패 |

"조용한 오류"가 가장 위험합니다. 빌드가 성공하니 아무도 모르고 배포됩니다. [4-5](./05-theme-components)의 `localStorage` SSR 에러, 1단계의 `#` 제목도 같은 부류입니다.

**확인 방법:** 실험장에서 위 사고 세 가지를 직접 일으켜 같은 메시지가 나오는지 보고, 규칙대로 고쳐 `build complete`가 나오는지 확인합니다.

### 4단계: `README.md`의 역할

`README.md`(49줄)는 위키 페이지가 아니라 **저장소의 첫 화면**입니다. GitHub에서 저장소 주소를 열면 파일 목록 아래에 자동으로 보여 줍니다.

| 줄 | 구역 | 내용 |
|---|---|---|
| 1~7 | 소개 | 무엇인지, 규모(10개 파트 · 75개 레슨), 단일 정의 파일과 작성 규칙 링크 |
| 9~18 | 로컬에서 실행 | `npm install`, `npm run dev`, 접속 주소 |
| 20~27 | 정적 빌드 | `npm run build`, `npm run preview`, "죽은 링크면 빌드 실패" 경고 |
| 29~35 | Docker | `docker compose up -d --build`, 8090 포트 |
| 37~39 | GitHub Pages | main에 push하면 Actions가 배포 |
| 41~43 | 실습 예제 | `examples/projects/` 안내 |
| 45~49 | 문서 추가 방법 | curriculum → 마크다운 → 빌드 확인 |

README는 "처음 온 사람이 **5분 안에** 실행해 볼 수 있게" 쓰는 것이 원칙입니다. 자세한 설명은 위키 본문에 맡기고, README에는 실행 명령과 중요한 파일의 위치만 둡니다. 6~7줄이 `curriculum.mts`와 `writing-guide.md`를 링크해, 기여하려는 사람이 가장 먼저 읽어야 할 두 파일로 바로 안내하는 점도 눈여겨보세요.

## ts-wiki에서는

- `package.json` 10줄 `"fix:frontmatter": "node scripts/fix-frontmatter.mjs"`로 스크립트를 등록해, `npm run fix:frontmatter` 한 줄로 실행합니다. 확장자를 `.mjs`로 지어 `import`·`import.meta.url`을 씁니다.
- `docs/guide/writing-guide.md` 77줄의 규칙 7번이 이 스크립트를 직접 언급합니다("`npm run fix:frontmatter`가 자동으로 고칩니다").
- 작성 규칙은 `docs/guide/` 안에 있어 **위키 페이지로도 보입니다**(사이드바 "학습 가이드 → 문서 작성 규칙", `config.mts` 52줄). 규칙을 저장소 깊은 곳이 아니라 사이트에 두어, 글 쓰는 사람이 화면에서 바로 찾게 했습니다.
- `README.md` 27줄 "존재하지 않는 페이지로 링크하면 빌드가 실패하므로, 문서를 고친 뒤에는 꼭 빌드해 봅니다"와 47~49줄의 "빌드로 오류가 없는지 확인하고 커밋"이 3단계 사고 3의 실전 대응입니다.

## 자주 하는 실수

### 1. `incomplete explicit mapping pair; a key node is missed ...`

- **증상**: 빌드가 시작하자마자 실패하고, 메시지 아래에 `title:` 줄이 표시됩니다.
- **원인**: frontmatter 값에 콜론+공백이 들어 있습니다.
- **해결**: `npm run fix:frontmatter`를 실행하거나, 값을 작은따옴표로 감쌉니다.

### 2. `Element is missing end tag.`

- **증상**: `[plugin vite:vue] docs/xxx.md (줄:칸): Element is missing end tag.`
- **원인**: 본문에 `Promise<T>`, `<div>` 같은 꺾쇠 표현을 맨글자로 썼습니다.
- **해결**: 그 파일에서 꺾쇠를 찾아 인라인 코드나 코드 블록으로 감쌉니다.

### 3. `Cannot read properties of undefined (reading '...')` (파일 이름 없음)

- **증상**: `rendering pages...` 단계에서 실패하고, 어느 파일인지 나오지 않습니다.
- **원인**: 본문(인라인 코드 포함)에 이중 중괄호 표현식이 있습니다.
- **해결**: 최근 고친 파일에서 이중 중괄호를 검색합니다. VS Code 전체 검색(`Ctrl+Shift+F`)에서 정규식 모드로 `\{\{`를 찾으면 빠릅니다. 코드 블록 안으로 옮기거나 `<span v-pre>`로 감쌉니다.

### 4. `[vitepress] 1 dead link(s) found.`

- **증상**: 위쪽에 `(!) Found dead link ./xxx in file yyy.md`가 함께 나옵니다.
- **원인**: 링크 대상 파일이 없거나 경로·철자가 틀렸습니다. 아직 안 쓴 레슨으로 미리 링크를 걸어 둔 경우도 많습니다.
- **해결**: 파일 이름과 상대 경로를 확인합니다. `./`는 같은 폴더, `../`는 한 단계 위입니다.

### 5. 제목이 사라졌는데 에러가 없음

- **증상**: 브라우저 탭 제목이 사이트 이름만 나옵니다.
- **원인**: `title: #...`처럼 값이 `#`으로 시작해 YAML 주석이 되었습니다.
- **해결**: 작은따옴표로 감싸거나 `npm run fix:frontmatter`를 실행합니다.

## 직접 해 보기

### 과제 1 ⭐ 콜론 사고 재현과 자동 수정

실험장에 1단계의 콜론 제목 파일을 만들어 빌드 실패를 확인하고, ts-wiki의 `scripts/fix-frontmatter.mjs`를 실험장 `scripts/`에 복사해 실행한 뒤 다시 빌드하세요.

::: details 정답 보기
`node scripts/fix-frontmatter.mjs` 출력에 `fixed ...a.md`와 `1 file(s) fixed`가 나오고, 다시 빌드하면 `build complete`가 나옵니다. 스크립트는 `../docs`를 찾으므로 반드시 `scripts/` 폴더 안에 두어야 합니다.
:::

### 과제 2 ⭐ 정규식 읽기

다음 제목 중 `fix-frontmatter.mjs`가 고치는 것은 무엇일까요? `C# 입문`, `-0과 +0`, `"따옴표로 시작"`, `배열 [1, 2]`

::: details 정답 보기
- `C# 입문` → 고침(`#` 포함)
- `-0과 +0` → 고침(맨 앞이 `-`)
- `"따옴표로 시작"` → 그대로(이미 따옴표로 시작)
- `배열 [1, 2]` → 그대로(`[`가 맨 앞이 아니고, 콜론·`#`도 없음)
:::

### 과제 3 ⭐⭐ 죽은 링크 찾기 연습

실험장 `docs/index.md`에 `[설치](./setup)`를 넣고 빌드해 실패를 확인한 뒤, 링크를 지우지 않고 빌드가 통과하게 만드세요.

::: details 정답 보기
`docs/setup.md`를 만듭니다. 링크를 지우거나 `ignoreDeadLinks`로 검사를 끄는 것은 "통과"는 되지만 이 과제의 정답이 아닙니다. 대상 페이지를 실제로 만드는 것이 근본 해결입니다.
:::

### 과제 4 ⭐⭐⭐ 이중 중괄호 실험

실험장에서 3단계의 `b.md`를 만들어 빌드가 성공하는지, 결과 HTML의 `<code>` 안이 비어 있는지 확인하세요. 그다음 같은 내용을 펜스 코드 블록으로 옮겨 글자가 그대로 나오는지 비교하세요.

::: details 힌트
결과는 `docs/.vitepress/dist/b.html`에서 `값은`을 검색해 확인합니다. 펜스 코드 블록 쪽은 하이라이트용 `<span>`들로 감싸져 나오지만 글자는 그대로 남아 있습니다.
:::

## 확인 퀴즈

1. `title: 왜 TypeScript인가: 타입이 막아 주는 실수들`이 빌드를 깨뜨리는 이유는?
2. `fix-frontmatter.mjs` 6줄의 `.replace(/^\/([A-Za-z]:)/, '$1')`는 무엇을 위한 것인가요?
3. 이중 중괄호를 인라인 코드로 감싸면 안전한가요?
4. 죽은 링크 검사를 끄지 않는 이유는?
5. 빌드가 "성공"했는데도 문제가 있을 수 있는 경우 두 가지는?

::: details 정답 보기
1. YAML이 두 번째 `: `를 새 이름-값 쌍의 시작으로 읽으려다 이름이 없어 실패하기 때문입니다.
2. Windows에서 `URL.pathname`이 `/C:/...`처럼 앞에 붙이는 슬래시를 떼기 위해서입니다.
3. 아닙니다. Vue가 계산하므로 글자가 사라지거나(에러 없음) 빌드가 실패합니다. 펜스 코드 블록 안에만 씁니다.
4. 틀린 링크를 배포 전에 빌드 단계에서 알 수 있기 때문입니다.
5. 이중 중괄호 식이 에러 없이 빈 값이 된 경우, `#`으로 시작하는 title, SSR 중 `localStorage` 에러, `curriculum.mts` 타입 오류나 없는 slug 등(이 중 두 가지).
:::

## 정리

- frontmatter는 YAML이라 콜론·`#`·맨 앞 특수기호가 든 값은 작은따옴표로 감싸야 합니다. `fix-frontmatter.mjs`가 이것을 자동으로, 여러 번 실행해도 안전하게 고칩니다.
- 스크립트에는 한계(본문 코드 블록, 한글 경로)가 있고, `fileURLToPath`와 frontmatter만 잘라 처리하는 방식으로 고칠 수 있습니다.
- VitePress는 마크다운을 Vue 템플릿으로 처리하므로, 꺾쇠는 인라인 코드로, 이중 중괄호는 펜스 코드 블록 안에만 씁니다.
- 죽은 링크 검사는 빌드를 실패시키는 고마운 안전장치입니다.
- 작성 규칙 하나하나 뒤에는 실제 사고가 있고, 빌드 로그를 읽는 습관이 "조용한 오류"를 잡습니다.
- `README.md`는 저장소 첫 화면으로, 실행 명령과 핵심 파일 위치만 짧게 담습니다.

## 다음 단계

Part 4를 마쳤습니다. 이제 ts-wiki의 모든 파일이 왜 거기 있는지 압니다. [Part 5. 처음부터 따라 만들기](../part5-build-along/)의 [빈 폴더에서 VitePress 시작하기](../part5-build-along/01-init)에서, 이번 레슨의 실험장과 비슷한 빈 폴더부터 시작해 나만의 위키를 직접 만듭니다.
