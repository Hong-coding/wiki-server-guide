---
title: 정적 사이트 생성기(SSG)와 빌드
---

# 정적 사이트 생성기(SSG)와 빌드

<LessonMeta level="입문" :minutes="30" prev="package.json의 scripts, node_modules, package-lock.json, npm ci와 npm install" />

## 이번에 배울 것

- 정적 사이트 생성기(SSG)가 무엇이고 "빌드"가 무엇을 만드는 일인지 설명할 수 있다.
- 마크다운을 HTML로 바꾸는 아주 작은 생성기를 직접 만들어 실행할 수 있다.
- VitePress로 빌드한 결과 폴더(`dist`)의 구성을 읽을 수 있다.
- 개발 서버가 보내는 HTML과 빌드 결과 HTML이 어떻게 다른지 직접 비교할 수 있다.
- ts-wiki의 빌드가 언제, 어디서(내 PC · Docker · GitHub Actions) 일어나는지 말할 수 있다.

## 먼저 알아 둘 것

- [정적 사이트와 동적 서버](./02-static-vs-dynamic): 응답을 "언제" 만드는가
- [Node.js와 npm](./04-node-npm): `npm run build`, `npx`

## 비유로 이해하기

**인쇄소**를 떠올려 봅시다.

- 작가는 원고(마크다운)를 씁니다.
- 인쇄소(SSG)는 원고와 디자인 규칙(설정·테마)을 받아 **책을 한꺼번에 찍어 냅니다.** 표지, 목차, 쪽 번호, 색인까지 이때 모두 만들어집니다.
- 서점(nginx·GitHub Pages)은 찍혀 나온 책을 진열하고 건네기만 합니다. 서점 직원은 인쇄할 줄 몰라도 됩니다.
- 원고에 오타가 있으면 **다시 찍어야** 합니다. 인쇄된 책에 볼펜으로 고치지 않습니다.

그리고 인쇄소에는 **교정쇄**(시험 인쇄)가 있습니다. 작가가 원고를 고칠 때마다 그 쪽만 바로 뽑아 보여 주는 것입니다. 이것이 **개발 서버**입니다. 교정쇄는 빠르지만 서점에 내놓는 책은 아닙니다.

## 개념 설명

### SSG = 빌드할 때 HTML을 미리 만드는 프로그램

**정적 사이트 생성기**(Static Site Generator, SSG)는 원고 파일들을 읽어 **웹 페이지(HTML) 파일들을 미리 만들어 두는** 프로그램입니다. VitePress, Docusaurus, MkDocs, Hugo, Jekyll 등이 모두 SSG입니다. 이 "미리 만드는" 작업을 **빌드**(build)라고 합니다.

```text
[빌드 시점: 한 번]                              [요청 시점: 매번]
docs/*.md  ─┐                                  브라우저
config.mts ─┼─▶ SSG ─▶ dist/*.html ─▶ 파일 서버 ─▶ (파일을 그대로 받음)
theme/*.vue─┘          dist/assets/*.js,*.css
```

[정적 사이트와 동적 서버](./02-static-vs-dynamic)의 동적 서버는 **요청 시점**에 HTML을 만들었습니다. SSG는 그 일을 **빌드 시점**으로 앞당긴 것입니다. 1,000명이 방문해도 HTML을 만드는 일은 빌드할 때 한 번뿐입니다.

### 따라 하기 1: 20줄짜리 SSG 만들기

SSG가 하는 일은 원리만 보면 단순합니다. "폴더의 `.md` 파일을 하나씩 읽어, HTML로 바꿔, 같은 이름의 `.html`로 저장한다." 이것을 직접 만들어 봅니다.

실습 폴더(예: `D:\practice\mini-ssg`)를 만들고, 그 안에 `docs` 폴더와 원고 두 개를 만듭니다.

`docs/index.md`:

```md
# 한빛 카페 메뉴

- 아메리카노 3,000원
- 카페라테 3,500원
```

`docs/about.md`:

```md
# 가게 소개

동네 골목에 있는 작은 카페입니다.
```

그리고 `mini-ssg` 폴더에 생성기 `build.mjs`를 만듭니다.

```js
// 아주 작은 정적 사이트 생성기: docs/*.md → dist/*.html
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'

// 마크다운 한 줄을 HTML 한 줄로 바꿉니다. (제목·목록·문단만 지원)
function toHtml(line) {
  if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`
  if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`
  if (line.trim() === '') return ''
  return `<p>${line}</p>`
}

mkdirSync('dist', { recursive: true })

for (const file of readdirSync('docs')) {
  if (!file.endsWith('.md')) continue
  const markdown = readFileSync(`docs/${file}`, 'utf8')
  const body = markdown.split('\n').map(toHtml).join('\n')
  const html = `<!DOCTYPE html>\n<html lang="ko">\n<meta charset="utf-8">\n<body>\n${body}\n</body>\n</html>\n`
  const outFile = file.replace(/\.md$/, '.html')
  writeFileSync(`dist/${outFile}`, html)
  console.log(`docs/${file} → dist/${outFile}`)
}
```

하는 일을 순서대로 보면:

1. `readdirSync('docs')`: `docs` 폴더의 파일 목록을 읽습니다.
2. `readFileSync(...)`: 마크다운 원고를 글자로 읽습니다.
3. `toHtml`: 한 줄씩 `# ` → `<h1>`, `- ` → `<li>`, 나머지 → `<p>`로 바꿉니다. 이것이 **마크다운 변환**입니다.
4. 앞뒤에 `<!DOCTYPE html>`, `<body>` 같은 공통 틀을 붙입니다. 이것이 **레이아웃(테마)** 입니다.
5. `writeFileSync('dist/...')`: 결과를 `dist` 폴더에 HTML 파일로 저장합니다. 이것이 **결과물**입니다.

실행합니다.

```bash
node build.mjs
```

```text
docs/about.md → dist/about.html
docs/index.md → dist/index.html
```

결과를 봅니다.

```bash
cat dist/index.html
```

(PowerShell에서는 `Get-Content dist/index.html`, `cat`도 동작합니다.)

```text
<!DOCTYPE html>
<html lang="ko">
<meta charset="utf-8">
<body>
<h1>한빛 카페 메뉴</h1>

<li>아메리카노 3,000원</li>
<li>카페라테 3,500원</li>

</body>
</html>
```

**확인 방법**: `dist` 폴더에 `index.html`, `about.html`이 생기고, 안에 `<h1>한빛 카페 메뉴</h1>`가 보이면 성공입니다. 탐색기에서 `dist/index.html`을 더블클릭하면 브라우저에 메뉴가 뜹니다. **이 HTML은 이제 Node.js 없이도** 어느 웹 서버에 올려도 됩니다. SSG의 결과물이 "정적"인 이유입니다.

진짜 SSG는 여기에 다음을 더한 것입니다.

| 내 20줄 생성기 | VitePress |
|---|---|
| `#`, `-`만 변환 | 표·코드 블록·링크·강조 박스 등 전부(markdown-it) |
| 코드 색칠 없음 | 코드 하이라이트(Shiki) |
| 공통 틀이 `<body>` 하나 | 사이드바·상단 메뉴·다크 모드가 있는 기본 테마(Vue 컴포넌트) |
| 페이지 사이 링크 검사 없음 | 없는 페이지로 가는 링크를 찾으면 **빌드 실패** |
| 검색 없음 | 모든 페이지를 모아 검색 색인 생성 |
| 페이지 이동 시 새로 고침 | 첫 페이지 후에는 JS로 빠르게 페이지 전환 |

이 라이브러리들은 [Part 3 라이브러리 사전](../part3-libraries/)에서 하나씩 다룹니다.

### 따라 하기 2: 같은 원고를 VitePress로 빌드하기

같은 원고 두 개를 VitePress로 빌드해 봅니다. ts-wiki 실습용 복사본에는 이미 VitePress가 설치되어 있으니, 복사본 안에 `mini` 폴더를 만들고 위의 `index.md`, `about.md`를 넣습니다. (복사본 안에 만드는 이유: VitePress는 `node_modules`를 위쪽 폴더로 올라가며 찾는데, 복사본 바깥 폴더에서는 VitePress가 의존하는 `vue` 패키지를 찾지 못해 빌드가 실패했습니다.)

```bash
cd ts-wiki-practice
npx vitepress build mini
```

실제 출력:

```text
  vitepress v1.6.3

- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
✓ rendering pages...
build complete in 8.94s.
```

로그의 두 단계가 SSG가 하는 일입니다.

1. **building client + server bundles**: 브라우저용 JS(client)와, 빌드 중 HTML을 만들 때 쓸 JS(server)를 묶습니다(**번들**, 여러 파일을 몇 개로 합치기).
2. **rendering pages**: 페이지마다 Vue 컴포넌트를 실행해 **HTML 글자를 미리 만들어** 파일로 씁니다. 이렇게 서버 쪽에서 미리 HTML을 만들어 두는 것을 **SSR**(Server-Side Rendering)이라고 하는데, SSG에서는 이 SSR을 **빌드할 때 한 번** 실행하는 셈입니다.

결과 폴더:

```text
mini/.vitepress/dist/
├── 404.html
├── about.html
├── index.html
├── hashmap.json
├── vp-icons.css
└── assets/
    ├── about.md.Ce6qI3n4.js
    ├── about.md.Ce6qI3n4.lean.js
    ├── app.9xLeFB55.js
    ├── chunks/
    ├── index.md.BNUvmVZg.js
    ├── ...
    ├── inter-roman-latin.Di8DUHzh.woff2
    └── style.DFTx90Kk.css
```

| 파일 | 하는 일 |
|---|---|
| `index.html`, `about.html` | 원고마다 하나씩 생긴 HTML. 본문 글자가 **이미 들어 있음** |
| `404.html` | 없는 주소일 때 보여 줄 페이지 |
| `assets/*.js` | 브라우저에서 동작할 JS(사이드바 열기, 다크 모드, 페이지 전환) |
| `assets/*.css`, `*.woff2` | 스타일과 글꼴 |
| `hashmap.json` | 페이지 이름 → JS 파일 이름(지문 포함) 대응표 |

파일 이름 가운데 `Ce6qI3n4` 같은 부분이 **내용의 지문**(해시)입니다. 내용이 바뀌면 이름도 바뀌므로 [웹은 어떻게 동작하나](./01-web-and-server)에서 본 것처럼 "1년 동안 보관해도 안전"하다는 캐시 헤더를 붙일 수 있습니다.

본문이 HTML에 정말 들어 있는지 확인합니다.

```bash
grep -o '<h1[^>]*>[^<]*' mini/.vitepress/dist/index.html
```

```text
<h1 id="한빛-카페-메뉴" tabindex="-1">한빛 카페 메뉴
```

(PowerShell에서는 `Select-String -Path mini/.vitepress/dist/index.html -Pattern '한빛 카페 메뉴'`로도 볼 수 있습니다.) 내 생성기와 같은 `<h1>`이 들어 있고, VitePress는 제목에 `id`(목차 링크용 이름표)까지 붙였습니다.

### 따라 하기 3: 개발 서버의 HTML과 비교하기

이번에는 같은 페이지를 **개발 서버**에 요청해 봅니다. ts-wiki 복사본의 개발 서버를 실습용 포트로 켭니다.

```bash
npx vitepress dev docs --port 5198
```

다른 터미널에서 HTML을 받아 봅니다.

```bash
curl -s http://127.0.0.1:5198/part0-start/03-setup
```

실제 출력:

```text
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="/@vite/client"></script>

    <title></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/@fs/.../node_modules/vitepress/dist/client/app/index.js"></script>
  </body>
</html>
```

**본문이 없습니다.** `<title>`도 비어 있고, `<div id="app"></div>`라는 빈 상자와 JS 파일 주소만 있습니다. 개발 서버는 HTML을 미리 만들지 않고, 브라우저가 JS를 받아 **그 자리에서** 마크다운을 화면으로 그리게 합니다. 그래서 파일을 저장하면 바로 반영됩니다(`/@vite/client`가 파일 변경을 감시하다가 화면을 갈아 끼웁니다).

같은 페이지의 빌드 결과에는 본문 제목이 들어 있습니다.

```text
<h1 id="개발-환경-설치-node-js-·-vs-code-·-git" tabindex="-1">개발 환경 설치 (Node.js · VS Code · Git)
```

| | 개발 서버(`npm run dev`) | 빌드 결과(`npm run build`) |
|---|---|---|
| HTML에 본문이 | 없음(빈 상자 + JS) | **있음** |
| 만드는 때 | 브라우저가 요청할 때마다 | 빌드할 때 한 번 |
| 원고 수정 반영 | 저장 즉시 | 다시 빌드해야 |
| 필요한 것 | Node.js + `node_modules` | 아무 웹 서버 |
| 용도 | 글쓰기·확인(교정쇄) | 배포(출판된 책) |

**확인 방법**: 개발 서버 응답에는 `<div id="app"></div>`만, 빌드 결과에는 `<h1 ...>` 제목이 있으면 성공입니다. 끝나면 개발 서버를 `Ctrl+C`로 끕니다.

::: info 본문이 HTML에 미리 들어 있으면 좋은 점
- **첫 화면이 빠릅니다.** JS를 받아 실행하기 전에 글자가 먼저 보입니다.
- **검색 엔진이 읽기 쉽습니다.** 검색 로봇이 HTML만 읽어도 내용을 압니다.
- **JS가 꺼져 있어도 글은 읽힙니다.**

빌드된 HTML을 받은 뒤 브라우저는 JS를 실행해 사이드바·검색 같은 기능을 "살려" 냅니다. 이것을 **하이드레이션**(hydration, 말린 음식에 물을 부어 되살리듯 정적 HTML에 동작을 붙이는 것)이라고 합니다.
:::

### 빌드가 실패하는 경우: 죽은 링크

VitePress는 빌드하면서 페이지 사이의 링크를 모두 검사합니다. `mini/about.md` 끝에 없는 페이지로 가는 링크 `[지난 메뉴](./old-menu)`를 한 줄 추가하고 빌드하면 이렇게 됩니다(실제 출력, 색 코드 제거).

```text
  vitepress v1.6.3

- building client + server bundles...


(!) Found dead link ./old-menu in file about.md

If this is expected, you can disable this check via config. Refer: https://vitepress.dev/reference/site-config#ignoredeadlinks

x Build failed in 7.24s
✖ building client + server bundles...
build error:
[vitepress] 1 dead link(s) found.
```

어느 파일(`about.md`)의 어느 링크(`./old-menu`)가 문제인지 정확히 알려 줍니다. 개발 서버는 이 검사를 하지 않아서, **개발 서버에서 잘 보이던 사이트가 빌드에서 실패하는** 일이 생깁니다. 그래서 배포 전에 반드시 한 번 빌드해 봅니다. 이 실습 후에는 추가한 링크 줄을 지우고 다시 빌드해 둡니다. 빌드가 실패하면 이전 결과 폴더가 지워진 채로 남을 수 있습니다.

## ts-wiki에서는

### 빌드 명령과 결과 위치

`package.json`:

```json
    "build": "vitepress build docs",
```

`docs` 폴더를 원고 폴더로 삼아 빌드하고, 결과는 VitePress 기본값인 `docs/.vitepress/dist`에 생깁니다. `README.md`에도 "결과물은 `docs/.vitepress/dist`에 생깁니다."라고 적혀 있습니다. 작성 시점에 실습용 복사본에서 빌드해 본 결과는 다음과 같습니다.

```text
  vitepress v1.6.3

- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
✓ rendering pages...
build complete in 126.15s.
```

- 걸린 시간: 약 2분(작성 PC 기준, PC 성능에 따라 다름)
- `dist` 크기: 약 39MB, `assets` 안의 파일 211개
- 레슨마다 `part0-start/03-setup.html`처럼 HTML 파일이 하나씩

미니 예제(원고 2개)가 9초, ts-wiki(원고 약 100개, 검색 색인 포함)가 2분입니다. 빌드는 원고가 많을수록 오래 걸리지만, 방문자 수와는 상관이 없습니다.

### 빌드 때 결정되는 것들

SSG에서는 많은 것이 **빌드하는 순간** 결정되어 HTML에 굳어집니다. ts-wiki의 설정에서 찾아보면:

- **사이드바**: `config.mts`가 `curriculum.mts`를 읽어 사이드바를 만듭니다(7~18번째 줄). 레슨을 추가하고 다시 빌드해야 사이드바에 나타납니다.
- **검색 색인**: `search: { provider: 'local', ... }`. 빌드 때 모든 페이지 글을 모아 색인 파일을 만듭니다.
- **마지막 수정 시각**: `lastUpdated: true`. 빌드 때 Git 이력에서 읽습니다. 그래서 GitHub Actions는 `fetch-depth: 0`으로 전체 이력을 받아 옵니다.
- **사이트 기본 경로**(base): 5번째 줄.

```ts
// GitHub Pages(프로젝트 페이지)에 올릴 때는 /저장소이름/ 아래에서 서비스되므로 base를 환경 변수로 받습니다.
const base = process.env.WIKI_BASE ?? '/'
```

GitHub Pages에서 ts-wiki 주소는 `https://hong-coding.github.io/ts-wiki/`입니다. 사이트가 `/`가 아니라 `/ts-wiki/` 아래에 있으므로, HTML 안의 모든 링크와 파일 경로 앞에 `/ts-wiki/`가 붙어야 합니다. 이것도 **빌드 때 HTML에 새겨지는** 값입니다. 실습용 복사본에서 PowerShell로 `WIKI_BASE`를 주고 빌드해 비교해 보면(결과는 별도 폴더로):

```powershell
$env:WIKI_BASE = '/ts-wiki/'; npx vitepress build docs --outDir <별도 폴더>; Remove-Item Env:WIKI_BASE
```

| | `WIKI_BASE` 없이(`/`) | `WIKI_BASE=/ts-wiki/` |
|---|---|---|
| CSS 경로 | `href="/assets/style.BZYBsFKE.css"` | `href="/ts-wiki/assets/style.BjZkXpDW.css"` |
| 페이지 링크 | `href="/guide/roadmap"` | `href="/ts-wiki/guide/roadmap"` |

같은 원고라도 **어디에 올릴지에 따라 빌드 결과가 달라집니다.** 그래서 GitHub Actions는 빌드할 때 이 값을 넣어 줍니다(`.github/workflows/deploy.yml` 30~32번째 줄).

```yaml
      - run: npm run build
        env:
          WIKI_BASE: /${{ github.event.repository.name }}/
```

`github.event.repository.name`은 저장소 이름(`ts-wiki`)으로 바뀌는 GitHub Actions의 표현식입니다. 반면 Docker(`Dockerfile`)와 내 PC 빌드는 `WIKI_BASE`를 주지 않으므로 기본값 `/`로 빌드되어 `http://localhost:8090/`에서 바로 동작합니다.

### 빌드는 세 곳에서 일어난다

| 어디서 | 명령 | 결과물이 가는 곳 |
|---|---|---|
| 내 PC | `npm run build` | `docs/.vitepress/dist` → `npm run preview`로 확인 |
| Docker 이미지 안 | `Dockerfile`의 `RUN npm run build` | `/app/docs/.vitepress/dist` → nginx 폴더로 복사 |
| GitHub Actions | `deploy.yml`의 `npm run build` | `upload-pages-artifact`로 GitHub Pages에 업로드 |

세 곳 모두 같은 `npm run build`를 쓰고, 결과물(`dist`)은 Git에 올리지 않습니다(`.gitignore`의 `docs/.vitepress/dist/`). **원고만 올리면, 각자 그 자리에서 찍어 낸다**는 설계입니다. 같은 이유로 `.dockerignore`에도 `docs/.vitepress/dist`가 들어 있어, 내 PC에 남아 있던 옛 결과물이 이미지 안으로 섞여 들어가지 않습니다.

## 자주 하는 실수

### 1. 개발 서버에서는 되는데 빌드가 실패한다

- **증상**: `npm run dev`에서는 잘 보이는데 `npm run build`에서 `(!) Found dead link ./old-menu in file about.md`와 `Build failed`가 나옵니다.
- **원인**: 없는 페이지로 가는 링크가 있습니다. 개발 서버는 링크 검사를 하지 않습니다.
- **해결**: 메시지의 파일과 링크를 찾아 고칩니다. 링크 대상 파일 이름(slug) 오타가 가장 흔합니다. 배포 전에는 반드시 `npm run build`를 해 봅니다.

### 2. dist 폴더를 직접 고친다

- **증상**: `dist/index.html`의 오타를 고쳤는데 다음 빌드 후 원래대로 돌아왔습니다.
- **원인**: `dist`는 빌드할 때마다 원고로부터 새로 만들어집니다.
- **해결**: 원고(`docs/**/*.md`)나 설정을 고치고 다시 빌드합니다.

### 3. GitHub Pages에서 CSS가 깨지고 링크가 404가 된다

- **증상**: 내 PC의 `npm run preview`에서는 멀쩡한데, GitHub Pages(`https://<사용자>.github.io/<저장소>/`)에 올리면 글자만 있고 모양이 없거나, 링크를 누르면 404가 납니다.
- **원인**: `base`가 `/`로 빌드되어, HTML이 `/assets/...`를 찾습니다. 실제 파일은 `/<저장소>/assets/...`에 있습니다.
- **해결**: 빌드할 때 `WIKI_BASE=/<저장소>/`를 줍니다. ts-wiki는 `deploy.yml`에서 자동으로 넣어 줍니다. 자세한 것은 [GitHub Pages 자동 배포](../part6-serve/05-github-pages)에서 다룹니다.

### 4. Git Bash에서 WIKI_BASE를 주었더니 경로가 이상해진다

- **증상**: Windows의 Git Bash에서 `WIKI_BASE=/ts-wiki/ npx vitepress build docs`로 빌드했더니, HTML 안 경로가 `href="C:/Program Files/Git/ts-wiki/assets/..."`처럼 되었습니다. 작성 중에 실제로 겪은 일입니다.
- **원인**: Git Bash는 `/`로 시작하는 값을 Windows 경로로 자동 변환하려고 합니다. `/ts-wiki/`를 "Git 설치 폴더 아래의 `ts-wiki`"로 바꿔 버렸습니다.
- **해결**: Windows에서는 PowerShell에서 `$env:WIKI_BASE = '/ts-wiki/'`로 설정합니다. GitHub Actions는 리눅스(`ubuntu-latest`)에서 돌기 때문에 이 문제가 없습니다.

## 직접 해 보기

### 과제 1 ⭐ 원고 추가하기

20줄 생성기의 `docs` 폴더에 `hours.md`(`# 영업시간`, `- 평일 08:00~20:00`, `- 주말 10:00~18:00`)를 추가하고 `node build.mjs`를 다시 실행합니다.

::: details 확인 방법
로그에 `docs/hours.md → dist/hours.html`이 추가되고, `dist/hours.html` 안에 `<h1>영업시간</h1>`과 `<li>` 두 줄이 있으면 성공입니다. 생성기 코드는 한 줄도 바꾸지 않았는데 페이지가 늘었습니다. 원고만 추가하면 되는 것이 SSG의 장점입니다.
:::

### 과제 2 ⭐ 원고 고치고 결과 비교

`docs/index.md`의 가격을 바꾸고, **빌드하기 전에** `dist/index.html`을 열어 봅니다. 그다음 빌드하고 다시 엽니다.

::: details 정답 보기
빌드 전에는 옛 가격, 빌드 후에는 새 가격이 보입니다. 정적 사이트는 빌드해야 반영된다는 것을 직접 확인한 것입니다.
:::

### 과제 3 ⭐⭐ 생성기에 링크 검사 넣기

`build.mjs`를 고쳐, 원고 안에 `(./이름)` 형태의 링크가 있는데 `docs/이름.md`가 없으면 에러를 내고 멈추게 만들어 봅니다.

::: details 정답 예시
`for` 반복문 안, `markdown`을 읽은 다음에 다음 코드를 넣습니다. 맨 위 `import`에 `existsSync`도 추가합니다.

```js
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
```

```js
  // 원고 안의 ./이름 링크가 실제 원고 파일로 이어지는지 검사합니다.
  for (const match of markdown.matchAll(/\]\(\.\/([^)]+)\)/g)) {
    const target = `docs/${match[1]}.md`
    if (!existsSync(target)) {
      console.error(`죽은 링크: ${file} → ./${match[1]}`)
      process.exit(1)
    }
  }
```

`about.md`에 `[지난 메뉴](./old-menu)`를 넣고 실행하면 `죽은 링크: about.md → ./old-menu`를 출력하고 멈춥니다. VitePress의 dead link 검사가 하는 일을 아주 작게 흉내 낸 것입니다.
:::

### 과제 4 ⭐⭐⭐ 빌드 결과를 서버로 띄우기

ts-wiki 실습용 복사본에서 `npm run build` 후 `npx vitepress preview docs --port 5191`로 결과를 띄우고, `curl -s http://localhost:5191/guide/roadmap`의 HTML에 본문 제목이 들어 있는지 확인합니다. 같은 경로를 개발 서버(`npx vitepress dev docs --port 5198`)에도 요청해 비교합니다.

::: details 힌트와 정답
빌드 결과(preview)의 HTML에는 `<title>학습 로드맵 | TypeScript 마스터 위키</title>`와 본문이 들어 있고, 개발 서버의 HTML에는 빈 `<title></title>`과 `<div id="app"></div>`만 있습니다. 두 서버 모두 끝나면 `Ctrl+C`로 끕니다.
:::

## 확인 퀴즈

1. SSG는 HTML을 언제 만드나요? 동적 서버와 비교해 말해 보세요.
2. VitePress 빌드 로그의 두 단계 이름은 무엇인가요?
3. 개발 서버가 보내는 HTML에 본문이 없는데도 화면에 글이 보이는 이유는?
4. 개발 서버에서는 문제가 없었는데 빌드에서 실패하는 대표적인 원인은?
5. ts-wiki를 GitHub Pages용으로 빌드할 때 `WIKI_BASE`를 주는 이유는?

::: details 정답 보기
1. 빌드할 때 한 번 미리 만듭니다. 동적 서버는 요청이 올 때마다 만듭니다.
2. `building client + server bundles`(번들 만들기)와 `rendering pages`(페이지 HTML 만들기)입니다.
3. 브라우저가 JS를 받아 실행하면서 그 자리에서 마크다운을 화면으로 그리기 때문입니다.
4. 없는 페이지로 가는 링크(dead link)입니다. 개발 서버는 이 검사를 하지 않습니다.
5. 사이트가 `/ts-wiki/` 아래에서 서비스되므로, HTML 안의 모든 경로 앞에 `/ts-wiki/`를 붙여 빌드해야 하기 때문입니다.
:::

## 정리

- **SSG**는 원고를 읽어 HTML을 **빌드할 때 미리** 만들어 두는 프로그램이고, 원리는 "읽고 → 변환하고 → 틀에 넣고 → 파일로 쓰기"입니다.
- VitePress 빌드는 **번들 만들기 → 페이지 렌더링** 두 단계이며, 결과는 `docs/.vitepress/dist`에 HTML·JS·CSS·글꼴로 생깁니다.
- **빌드 결과 HTML에는 본문이 들어 있고**, 개발 서버의 HTML은 빈 상자 + JS입니다. 개발 서버는 교정쇄, 빌드는 출판입니다.
- 사이드바·검색 색인·마지막 수정 시각·`base` 경로가 모두 **빌드 때 결정**됩니다.
- 죽은 링크는 빌드에서만 잡히므로 배포 전에 꼭 `npm run build`를 해 봅니다.
- ts-wiki는 내 PC·Docker·GitHub Actions 세 곳에서 같은 `npm run build`로 각자 결과물을 만듭니다.

## 다음 단계

Part 1을 마쳤습니다. 이제 브라우저·서버·HTTP·포트·npm·빌드라는 부품의 이름과 역할을 압니다. [Part 2. 기술 선택의 이유](../part2-choices/)에서 ts-wiki가 왜 하필 VitePress·Markdown·TypeScript·GitHub Pages·Docker를 골랐는지, 대안과 비교해 봅니다.
