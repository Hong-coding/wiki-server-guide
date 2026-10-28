---
title: 빌드와 미리보기
---

# 빌드와 미리보기

<LessonMeta level="중급" :minutes="30" prev="테마를 확장해 LessonMeta · PartLessons · ProgressChecklist 컴포넌트를 만들었다" />

## 이번에 배울 것

- `npm run build`가 무엇을 만드는지 `docs/.vitepress/dist` 폴더를 열어 설명할 수 있다.
- 개발 서버가 보내는 HTML과 빌드된 HTML의 차이(미리 그려 둔 본문)를 직접 확인할 수 있다.
- `npm run preview`(포트 5191)로 배포본과 같은 결과를 내 PC에서 확인할 수 있다.
- `base` 옵션과 환경 변수 `WIKI_BASE`로 하위 경로(`/my-wiki/`) 배포를 체험하고, 어긋나면 무엇이 깨지는지 안다.
- 빌드 실패 메시지에서 "어느 파일·무엇이 문제인지"를 찾아 읽을 수 있다.

## 먼저 알아 둘 것

- [진도 체크리스트 컴포넌트 만들기](./05-components)까지 마친 `my-wiki`
- 빌드·정적 사이트 개념: [정적 사이트 생성기(SSG)와 빌드](../part1-concepts/05-ssg), [정적 사이트와 동적 서버](../part1-concepts/02-static-vs-dynamic)
- 환경 변수와 GitHub Pages 주소 구조는 [GitHub Pages 자동 배포](../part6-serve/05-github-pages)에서 더 자세히 다룹니다.

## 비유로 이해하기

지금까지의 개발 서버는 **주문을 받을 때마다 즉석에서 요리하는 주방**이었습니다. 손님(브라우저)이 오면 그 자리에서 마크다운을 읽어 화면을 만들었습니다. 맛을 보며 레시피를 고치기에는 최고지만, 손님이 많은 가게에서 매번 이렇게 할 수는 없습니다.

- **빌드(`build`)** 는 영업 전에 모든 메뉴를 **도시락으로 미리 싸 두는 일**입니다. 결과물(`dist`)은 HTML·CSS·JS 파일 묶음이라, 어떤 웹 서버든 꺼내 건네기만 하면 됩니다. 이때 주방장(Node.js)이 직접 도시락을 싸므로, 손님 자리에만 있는 물건(`localStorage`)을 찾으면 문제가 됩니다(5-5).
- **미리보기(`preview`)** 는 싸 둔 도시락을 **가게에 내놓기 전에 한 번 먹어 보는 일**입니다.
- **`base`** 는 도시락에 붙이는 **배달 주소의 동·호수**입니다. 건물 1층(`/`)이 아니라 3층 `my-wiki`호(`/my-wiki/`)로 배달할 거라면, 도시락 안의 "반찬은 옆 칸에" 같은 안내도 모두 `/my-wiki/` 기준으로 적혀 있어야 합니다.

## 따라 하기

이 레슨은 개발 서버를 **꺼 둔 상태**에서 진행합니다(빌드와 미리보기는 개발 서버가 필요 없습니다).

### 1단계. 빌드하기

```bash
npm run build
```

실제 출력:

```text
> my-wiki@1.0.0 build
> vitepress build docs


  vitepress v1.6.3

- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
✓ rendering pages...
build complete in 6.66s.
```

빌드는 두 단계로 진행됩니다.

1. **building client + server bundles** — 테마·컴포넌트·페이지를 브라우저용 JS(client)와 Node.js용 JS(server) 두 벌로 묶습니다. 이 단계에서 dead link 검사(5-2)와 설정 파일 문법 검사가 일어납니다.
2. **rendering pages** — server 묶음을 Node.js에서 실행해 페이지마다 **HTML을 미리 그립니다**(SSR). 5-5의 `localStorage` 오류가 난 곳이 여기입니다.

**확인 방법**: 마지막 줄이 `build complete in ...s.`이고, 그 위에 `Error`나 `(!)`로 시작하는 줄이 없으면 성공입니다.

### 2단계. `dist` 폴더 살펴보기

결과물은 `docs/.vitepress/dist`에 생깁니다. 실제 구성(글꼴 파일 등 `assets` 안쪽은 아래에서 따로 봅니다):

```text
docs/.vitepress/dist/
├─ 404.html                       ← 없는 주소일 때 보여 줄 페이지
├─ index.html                     ← docs/index.md (홈)
├─ guide/
│  └─ checklist.html
├─ part1-basics/
│  ├─ index.html                  ← docs/part1-basics/index.md
│  ├─ 01-hello.html
│  ├─ 02-markdown.html
│  └─ 03-frontmatter.html
├─ part2-deploy/
│  ├─ index.html
│  └─ 01-build.html
├─ logo.svg                       ← docs/public/logo.svg 그대로 복사
├─ vp-icons.css                   ← 기본 테마 아이콘
├─ hashmap.json                   ← 페이지별 JS 파일 이름표
└─ assets/
   ├─ app.C4fO6l-6.js             ← 사이트 시작 코드
   ├─ style.BEAZW-aZ.css          ← 기본 테마 + custom.css + 컴포넌트 CSS를 합친 것
   ├─ index.md.BMSCIB3N.js        ← 페이지마다 .js 와 .lean.js 한 쌍
   ├─ index.md.BMSCIB3N.lean.js
   ├─ part1-basics_01-hello.md.DP0lwJCV.js
   ├─ ...
   ├─ inter-roman-latin.Di8DUHzh.woff2   ← 기본 테마 글꼴(Inter) 14개
   ├─ ...
   └─ chunks/
      ├─ framework.syFPz4N3.js             ← Vue 등 공통 코드
      ├─ theme.DI5RVjm1.js                 ← 테마와 우리 컴포넌트
      ├─ VPLocalSearchBox.Dm0V54OT.js      ← 검색 창
      └─ @localSearchIndexroot.BuU7aj_T.js ← 검색 색인(모든 페이지 글자)
```

전체 크기는 약 1.2MB였습니다(`du -sh`로 확인). 읽는 법:

- **`.md` 하나 → `.html` 하나.** 5-2의 라우팅 표가 그대로 파일이 되었습니다. `cleanUrls`를 켰으므로 링크는 `/part1-basics/01-hello`이고, 웹 서버가 이 요청에 `01-hello.html`을 돌려줍니다.
- **`public/`의 파일은 맨 위에 그대로** 복사됩니다(`logo.svg`).
- **파일 이름 속 `.DP0lwJCV` 같은 글자는 해시(hash)** 입니다. 내용으로 계산한 지문이라, 내용이 바뀌면 이름도 바뀝니다. 브라우저가 옛 파일을 캐시(임시 저장)해 두었다가 새 내용을 못 보는 문제를 막아 줍니다. 그래서 빌드할 때마다 이름이 조금씩 달라지는 것이 정상입니다.
- **검색 색인도 파일**입니다(`@localSearchIndexroot...js`). 5-3에서 말한 "서버 없이 브라우저 안에서 검색"이 이 파일 덕분입니다.

`dist`는 빌드할 때마다 **통째로 다시 만들어지는 결과물**이라 직접 고치지 않고, git에도 올리지 않습니다(4단계의 `.gitignore`).

### 3단계. 개발 서버 HTML과 빌드 HTML 비교

개발 서버(`npm run dev`)를 켜고 `curl`로 첫 레슨 HTML을 받아 보면, 실제로 본문이 비어 있었습니다.

```text
  <body>
    <div id="app"></div>
    <script type="module" src="/@fs/.../node_modules/vitepress/dist/client/app/index.js"></script>
  </body>
```

개발 서버는 빈 상자(`div id="app"`)만 주고, 브라우저가 JS를 받아 그 자리에서 화면을 그립니다. 반면 빌드된 `dist/part1-basics/01-hello.html`에는 본문이 **이미 들어 있습니다**.

```powershell
# Windows (PowerShell)
Select-String -Path docs\.vitepress\dist\part1-basics\01-hello.html -Pattern '<h2 id="[^"]*"' -AllMatches | ForEach-Object { $_.Matches.Value }
```

```bash
# macOS / Linux / Git Bash
grep -o '<h2 id="[^"]*"' docs/.vitepress/dist/part1-basics/01-hello.html
```

```text
<h2 id="이번에-배울-것"
<h2 id="다음-레슨"
```

미리 그려 둔 HTML 덕분에 JS가 늦게 받아져도 글이 바로 보이고, 검색 엔진도 내용을 읽을 수 있습니다. 브라우저는 이 HTML을 먼저 보여 준 뒤 JS로 화면을 "살려" 냅니다(hydration, 수분 공급이라는 뜻으로 정적인 HTML에 동작을 입히는 과정). 이때 `onMounted`가 실행되어 진도 체크리스트가 저장된 값으로 바뀝니다.

### 4단계. `.gitignore` 만들기

프로젝트 루트(`my-wiki/`)에 `.gitignore`를 만듭니다. git(버전 관리 도구)에 올리지 않을 파일 목록입니다.

```text
node_modules/
docs/.vitepress/dist/
docs/.vitepress/cache/
```

- `node_modules/` — `npm install`로 언제든 다시 받을 수 있고, 크기가 큽니다.
- `docs/.vitepress/dist/` — `npm run build`로 언제든 다시 만듭니다.
- `docs/.vitepress/cache/` — 개발 서버 임시 파일입니다.

원본(마크다운·설정·컴포넌트·`package.json`·`package-lock.json`)만 저장해 두면 나머지는 모두 명령으로 되살릴 수 있다는 것이 핵심입니다.

### 5단계. 미리보기: `npm run preview`

```bash
npm run preview
```

실제 출력:

```text
> my-wiki@1.0.0 preview
> vitepress preview docs --port 5191

Built site served at http://localhost:5191/
```

`preview`는 마크다운을 읽지 않고 **`dist` 폴더의 파일만** 서비스하는 간이 웹 서버입니다. 그래서 반드시 `build`를 먼저 해야 하고, 마크다운을 고쳐도 다시 빌드하기 전에는 바뀌지 않습니다. 개발 서버와 동시에 띄워 비교할 수 있도록 포트를 5191로 나눠 두었습니다.

**확인 방법**: 브라우저에서 `http://localhost:5191/`을 열어 개발 서버와 같은 화면(초록 테마, 사이드바, 검색, 진도 체크)이 보이면 성공입니다. 새 터미널에서 주소별 응답 코드를 확인해 보면 실제로 다음과 같았습니다.

| 주소 | 응답 | 뜻 |
|---|---|---|
| `/` | 200 | `index.html` |
| `/part1-basics/01-hello` | 200 | `.html` 없이도 `01-hello.html`을 줌(cleanUrls) |
| `/part1-basics/01-hello.html` | 200 | `.html`을 붙여도 열림 |
| `/part1-basics/` | 200 | 폴더의 `index.html` |
| `/logo.svg` | 200 | `public`에서 복사된 파일 |
| `/nope` | 404 | 없는 주소 → `404.html` |

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5191/part1-basics/01-hello
```

Windows PowerShell 5.1에서 `curl`은 다른 명령(`Invoke-WebRequest`)의 별명이므로 `curl.exe`로 씁니다.

```powershell
curl.exe -s -o NUL -w "%{http_code}\n" http://localhost:5191/part1-basics/01-hello
```

다 봤으면 미리보기 터미널에서 `Ctrl+C`로 끕니다.

### 6단계. 하위 경로 배포 체험: `base`와 `WIKI_BASE`

지금까지 사이트는 주소 맨 앞(`/`)에 있었습니다. 그런데 GitHub Pages의 프로젝트 페이지는 `https://<사용자>.github.io/my-wiki/`처럼 **저장소 이름 아래**에서 서비스됩니다. 이때 HTML 안의 `/assets/style....css` 같은 주소는 `/my-wiki/assets/style....css`가 되어야 합니다. 이것을 정하는 설정이 `base`입니다.

`config.mts`의 위쪽과 사이트 설정 부분을 이렇게 바꿉니다(바뀐 줄만).

```ts
import { defineConfig, type DefaultTheme } from 'vitepress'
import { curriculum } from './curriculum.mts'

// 하위 경로(예: https://<사용자>.github.io/my-wiki/)에 올릴 때는 base를 환경 변수로 받습니다.
const base = process.env.WIKI_BASE ?? '/'
```

```ts
  base,
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: `${base}logo.svg` }]],
```

- `process.env.WIKI_BASE` — 명령을 실행할 때 넘긴 **환경 변수**(프로그램 바깥에서 넣어 주는 설정 값)를 읽습니다.
- `?? '/'` — 값이 없으면 `/`를 씁니다. 그래서 평소처럼 `npm run build`만 하면 지금까지와 똑같습니다.
- `base,` — `base: base,`의 줄임입니다.
- `head` — HTML 머리에 탭 아이콘(favicon) 태그를 넣습니다. `logo: '/logo.svg'`나 마크다운 링크는 VitePress가 `base`를 자동으로 붙여 주지만, `head`에 직접 쓰는 주소는 **붙여 주지 않으므로** `${base}`를 직접 앞에 붙입니다.

::: tip 편집기에 `process` 빨간 줄이 생긴다면
`tsc`로 검사하면 `Cannot find name 'process'. Do you need to install type definitions for node?`가 나옵니다(실제로 확인). Node.js 타입 정의(`@types/node`)를 설치하지 않았기 때문이며, VitePress 실행·빌드에는 영향이 없습니다. ts-wiki도 같은 상태입니다. 빨간 줄이 거슬리면 `npm install -D -E @types/node`로 타입 정의를 추가할 수 있습니다.
:::

이제 `/my-wiki/` 기준으로 빌드합니다. **셸마다 환경 변수 넣는 법이 다릅니다.**

```powershell
# Windows (PowerShell)
$env:WIKI_BASE = '/my-wiki/'
npm run build
Remove-Item Env:WIKI_BASE   # 다 쓰면 지웁니다. 안 지우면 이 창의 다음 빌드도 /my-wiki/로 됩니다.
```

```bash
# macOS / Linux
WIKI_BASE=/my-wiki/ npm run build
```

```bash
# Windows의 Git Bash
MSYS_NO_PATHCONV=1 WIKI_BASE=/my-wiki/ npm run build
```

::: warning Git Bash에서는 `/my-wiki/`가 `C:/Program Files/Git/my-wiki/`로 바뀝니다
Windows의 Git Bash에서 `WIKI_BASE=/my-wiki/ npm run build`를 그대로 실행하면, Git Bash가 `/`로 시작하는 값을 **Windows 경로로 자동 변환**해 버립니다. 실제로 해 보니 빌드된 HTML의 주소가 `href="C:/Program Files/Git/my-wiki/logo.svg"`처럼 망가졌습니다. 앞에 `MSYS_NO_PATHCONV=1`을 붙이면 변환을 끕니다. PowerShell·macOS·Linux에서는 이 문제가 없습니다.
:::

**확인 방법**: 빌드된 `dist/index.html`에서 주소를 찾아봅니다. PowerShell에서 실제로 확인한 결과입니다.

```powershell
Select-String -Path docs\.vitepress\dist\index.html -Pattern '<link rel="icon"[^>]*>' | ForEach-Object { $_.Matches.Value }
Select-String -Path docs\.vitepress\dist\index.html -Pattern 'href="[^"]*01-hello"' | ForEach-Object { $_.Matches[0].Value }
```

```text
<link rel="icon" href="/my-wiki/logo.svg">
href="/my-wiki/part1-basics/01-hello"
```

탭 아이콘, 홈 버튼 링크, CSS·JS 주소가 모두 `/my-wiki/`로 시작하면 성공입니다.

### 7단계. 하위 경로로 미리보기, 그리고 어긋났을 때

미리보기도 같은 `base`를 알아야 하므로 **같은 환경 변수를 넣고** 실행합니다.

```powershell
# Windows (PowerShell)
$env:WIKI_BASE = '/my-wiki/'
npm run preview
```

```bash
# macOS / Linux  (Git Bash는 앞에 MSYS_NO_PATHCONV=1)
WIKI_BASE=/my-wiki/ npm run preview
```

실제 출력:

```text
> my-wiki@1.0.0 preview
> vitepress preview docs --port 5191

Built site served at http://localhost:5191/my-wiki/
```

| 주소 | 응답 |
|---|---|
| `/my-wiki/` | 200 |
| `/my-wiki/part1-basics/01-hello` | 200 |
| `/my-wiki/logo.svg` | 200 |
| `/` | 404 |

**확인 방법**: `http://localhost:5191/my-wiki/part1-basics/`를 열어 초록 테마와 사이드바가 정상이고, `PartLessons` 목록의 링크가 `/my-wiki/part1-basics/01-hello`처럼 `/my-wiki/`로 시작하면 성공입니다(5-5에서 `withBase`로 감싼 효과). 실제 GitHub Pages에 올렸을 때와 같은 주소 구조를 내 PC에서 미리 본 것입니다.

이번에는 **일부러 어긋나게** 해 봅니다. 미리보기를 끄고, `/my-wiki/`로 빌드된 `dist`를 환경 변수 **없이** 미리보기 합니다(PowerShell이면 `Remove-Item Env:WIKI_BASE` 후 `npm run preview`).

```text
Built site served at http://localhost:5191/
```

`http://localhost:5191/`을 열면 HTML은 받아지지만, 그 안의 CSS 주소 `/my-wiki/assets/style....css`를 요청하면 실제로 **404**가 돌아왔습니다. 서버는 `/`에 있는데 HTML은 `/my-wiki/`에 있다고 믿기 때문입니다. 화면은 VitePress의 404 페이지가 뜨거나, 브라우저에 남은 캐시에 따라 스타일이 깨진 채로 보입니다. **"배포했더니 글자만 덩그러니 있고 디자인이 깨졌다"** 는 문제의 대부분이 이 `base` 불일치입니다.

확인이 끝나면 미리보기를 `Ctrl+C`로 끄고, 환경 변수 없이 다시 빌드해 원래대로 돌려 둡니다.

```bash
npm run build
```

### 8단계. 빌드 실패 메시지 읽기

빌드가 실패하면 출력의 **위쪽, `at ...` 줄이 시작되기 전**을 읽습니다. 이 파트에서 실제로 만난 네 가지 실패를 모았습니다.

**① 깨진 링크** (5-2) — 파일과 링크를 정확히 알려 줍니다.

```text
(!) Found dead link ./03-missing in file part1-basics\01-hello.md
...
x Build failed in 8.07s
```

**② 설정 파일 문법 오류** — `config.mts`에서 `cleanUrls: true` 뒤 쉼표를 지웠을 때입니다. 파일·줄·칸과 해당 줄을 보여 줍니다.

```text
X [ERROR] Expected "}" but found "head"

    docs/.vitepress/config.mts:26:2:
      26 │   head: [['link', { rel: 'icon', href: `${base}logo.svg` }]],
         │   ~~~~
         ╵   }

failed to load config from ...\my-wiki\docs\.vitepress\config.mts
build error:
Build failed with 1 error:
docs/.vitepress/config.mts:26:2: ERROR: Expected "}" but found "head"
```

26번째 줄에서 이상한 것을 발견했다는 뜻이고, 빠진 쉼표는 바로 윗줄(25줄 `cleanUrls: true`) 끝에 있습니다.

**③ 마크다운 속 이중 중괄호** — `01-build.md`에 GitHub Actions 문법을 설명하려고 아래 줄을 인라인 코드로 넣었을 때입니다.

```md
저장소 이름은 `${{ github.event.repository.name }}`로 읽습니다.
```

```text
- rendering pages...
✖ rendering pages...
build error:
Cannot read properties of undefined (reading 'event')
TypeError: Cannot read properties of undefined (reading 'event')
```

VitePress는 마크다운을 Vue 템플릿으로 바꾸므로, 이중 중괄호를 **인라인 코드 안에 써도** Vue가 계산식으로 읽어 `github`이라는 값을 찾다가 실패합니다. 이 메시지는 **파일 이름을 알려 주지 않는다**는 점이 까다롭습니다. `reading 'event'`라는 단서로 프로젝트 전체에서 `github.event`를 검색해 찾습니다. 해결은 세 가지 중 하나입니다: ① 펜스 코드 블록(백틱 세 개로 감싼 블록) 안에만 쓴다, ② 중괄호 없이 이름만 쓴다, ③ 그 부분을 `<span v-pre>`로 감싼다. ts-wiki와 이 가이드의 작성 규칙(writing-guide)에 같은 규칙이 있는 이유입니다.

**④ 빌드는 성공했지만 로그에 오류** (5-5) — 가장 놓치기 쉽습니다.

```text
- rendering pages...
ReferenceError: localStorage is not defined
✓ rendering pages...
build complete in 11.06s.
```

종료 코드가 0이라 자동 배포도 통과해 버립니다. `build complete`만 보지 말고, 그 위에 `Error`가 섞여 있지 않은지 확인합니다.

::: tip 검색할 때 지워야 할 것
오류 문장을 인터넷에서 검색할 때는 내 PC 경로(`C:\Users\<사용자>\...`)와 해시 붙은 파일 이름을 지우고, `Cannot read properties of undefined vitepress`처럼 **오류 문장 + 도구 이름**으로 검색합니다. 경로에는 사용자 이름 같은 개인 정보가 들어 있으니 질문 글에 붙일 때도 지웁니다.
:::

### 완성: `my-wiki` 최종 파일 목록

`node_modules`, `dist`, `cache`를 뺀, 이 파트에서 직접 만든 파일 전체입니다.

```text
my-wiki/
├─ .gitignore                                   (3줄)  5-6
├─ package.json                                        5-1
├─ package-lock.json                                   5-1 (npm이 생성)
└─ docs/
   ├─ index.md                                         5-2 홈 (hero · features)
   ├─ guide/
   │  └─ checklist.md                                  5-5 진도 체크리스트 페이지
   ├─ part1-basics/
   │  ├─ index.md                                      5-4 파트 소개 → 5-5 PartLessons
   │  ├─ 01-hello.md                                   5-2 → 5-5 LessonMeta
   │  ├─ 02-markdown.md                                5-2 → 5-5 LessonMeta
   │  └─ 03-frontmatter.md                             5-2 과제 / 5-4
   ├─ part2-deploy/
   │  ├─ index.md                                      5-4 → 5-5 PartLessons
   │  └─ 01-build.md                                   5-4
   ├─ public/
   │  └─ logo.svg                                      5-2
   └─ .vitepress/
      ├─ config.mts                       (54줄)       5-3 → 5-4 → 5-5 → 5-6
      ├─ curriculum.mts                                5-4
      └─ theme/
         ├─ index.ts                      (16줄)       5-5
         ├─ custom.css                    (21줄)       5-5
         └─ components/
            ├─ LessonMeta.vue             (35줄)       5-5
            ├─ PartLessons.vue            (33줄)       5-5
            └─ ProgressChecklist.vue      (97줄)       5-5
```

`docs/.vitepress/config.mts` 최종본:

```ts
import { defineConfig, type DefaultTheme } from 'vitepress'
import { curriculum } from './curriculum.mts'

// 하위 경로(예: https://<사용자>.github.io/my-wiki/)에 올릴 때는 base를 환경 변수로 받습니다.
const base = process.env.WIKI_BASE ?? '/'

// 커리큘럼 정의에서 사이드바를 만들어, 레슨 목록을 curriculum.mts 한 곳에서만 관리합니다.
const curriculumSidebar: DefaultTheme.SidebarItem[] = curriculum.map((part) => ({
  text: `Part ${part.no}. ${part.title}`,
  collapsed: false,
  items: [
    { text: '파트 소개', link: `/${part.dir}/` },
    ...part.lessons.map((lesson, i) => ({
      text: `${part.no}-${i + 1}. ${lesson.title}`,
      link: `/${part.dir}/${lesson.slug}`,
    })),
  ],
}))

export default defineConfig({
  lang: 'ko-KR',
  title: '나의 학습 위키',
  description: '빈 폴더에서 시작해 만든 VitePress 위키',
  base,
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: `${base}logo.svg` }]],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '홈', link: '/' },
      { text: '첫 레슨', link: '/part1-basics/01-hello' },
      { text: '진도 체크', link: '/guide/checklist' },
    ],
    sidebar: curriculumSidebar,
    outline: { level: [2, 3], label: '이 페이지 목차' },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '검색', buttonAriaLabel: '검색' },
          modal: {
            noResultsText: '결과가 없습니다',
            resetButtonTitle: '지우기',
            footer: { selectText: '선택', navigateText: '이동', closeText: '닫기' },
          },
        },
      },
    },
    docFooter: { prev: '이전 레슨', next: '다음 레슨' },
    darkModeSwitchLabel: '다크 모드',
    sidebarMenuLabel: '메뉴',
    returnToTopLabel: '맨 위로',
  },
})
```

`curriculum.mts`는 5-4 끝, `theme/` 아래 파일들은 5-5 본문의 코드가 최종본입니다. 새 PC에서 이 위키를 되살리는 방법은 원본 파일을 복사한 뒤 `npm install` → `npm run dev` 두 줄이면 됩니다.

### 실습 서버 정리

이 파트에서 띄운 서버가 남아 있지 않은지 확인합니다. 개발 서버(5190)와 미리보기(5191) 터미널에서 모두 `Ctrl+C`를 눌렀다면 다음 명령에 아무것도 나오지 않아야 합니다.

```powershell
# Windows (PowerShell)
Get-NetTCPConnection -State Listen -LocalPort 5190,5191 -ErrorAction SilentlyContinue
```

```bash
# macOS / Linux
lsof -i :5190 -i :5191
```

무언가 나온다면 그 서버를 띄운 터미널을 찾아 `Ctrl+C`로 끕니다. 터미널 창을 그냥 닫으면 서버가 남는 경우가 있으므로 `Ctrl+C`로 끄는 습관을 들입니다.

## ts-wiki에서는

- **`package.json`** — `"build": "vitepress build docs"`, `"preview": "vitepress preview docs --host 0.0.0.0 --port 5180"`. 미리보기를 개발 서버와 같은 5180 포트로 띄우고, `--host 0.0.0.0`으로 다른 PC에서도 볼 수 있게 했습니다. 그래서 ts-wiki는 개발 서버와 미리보기를 동시에 띄우지 않습니다.
- **`docs/.vitepress/config.mts` 4~5줄** — 우리와 같은 `const base = process.env.WIKI_BASE ?? '/'`와 이유를 적은 주석. **24줄** `base,`, **27줄** `head: [['link', { rel: 'icon', href: `${base}favicon.svg` }]]`로 탭 아이콘에 `base`를 직접 붙입니다.
- **31~34줄** `vite.build.chunkSizeWarningLimit: 4000` — ts-wiki는 레슨이 많아 검색 색인 파일이 500kB를 넘고, Vite가 "파일이 크다"는 경고를 내므로 기준만 올려 두었습니다. 우리 `my-wiki`는 작아서 이 경고가 나오지 않았습니다.
- **GitHub Pages 배포** — `.github/workflows/deploy.yml`이 `main` push 때 `WIKI_BASE=/저장소이름/`을 넣고 `npm run build`를 실행해, `https://hong-coding.github.io/ts-wiki/` 아래에서 서비스합니다. 6단계에서 우리가 손으로 넣은 환경 변수를 Actions가 대신 넣는 것입니다.
- **Docker 배포** — `Dockerfile`이 node:22-alpine에서 `npm run build`로 `dist`를 만들고, nginx:1.27-alpine 이미지에 `dist`만 복사해 서비스합니다. 이때는 `/`에서 서비스하므로 `WIKI_BASE`를 넣지 않습니다. 같은 원본에서 `base`만 바꿔 두 곳에 배포하는 구조입니다.
- **`.gitignore`** — `node_modules/`, `docs/.vitepress/dist/`, `docs/.vitepress/cache/`가 우리 것과 같고, 그 밖에 `examples/**/dist/`, `.DS_Store`, `*.log`, `.env`, `.env.*`가 더 있습니다.

## 자주 하는 실수

**1. `npm run preview`를 했는데 고친 내용이 안 보임**

- 원인: 미리보기는 `dist`만 보여 줍니다. 마크다운을 고친 뒤 빌드를 다시 하지 않았습니다.
- 해결: `npm run build` → `npm run preview` 순서로 다시 실행합니다.

**2. 배포 후 글자만 보이고 디자인이 깨짐 / CSS·JS가 404**

- 원인: `base`가 실제 서비스 경로와 다릅니다. `/my-wiki/`에서 서비스하는데 `base` 없이 빌드했거나, 반대로 `/`에서 서비스하는데 `/my-wiki/`로 빌드했습니다.
- 해결: 서비스할 주소에 맞춰 `WIKI_BASE`를 넣고 다시 빌드합니다. 끝의 `/`까지 정확히 `/my-wiki/`로 씁니다.

**3. Git Bash에서 빌드한 HTML 주소가 `C:/Program Files/Git/my-wiki/...`**

- 원인: Git Bash가 `/`로 시작하는 값을 Windows 경로로 자동 변환했습니다.
- 해결: `MSYS_NO_PATHCONV=1 WIKI_BASE=/my-wiki/ npm run build`로 실행하거나 PowerShell을 씁니다.

**4. PowerShell에서 한 번 `$env:WIKI_BASE`를 넣은 뒤로 계속 `/my-wiki/`로 빌드됨**

- 원인: `$env:`로 넣은 값은 **그 PowerShell 창이 닫힐 때까지** 남아 있습니다.
- 해결: `Remove-Item Env:WIKI_BASE`로 지우거나 새 창을 엽니다. 지금 값은 `$env:WIKI_BASE`로 확인합니다.

**5. `Cannot read properties of undefined (reading '...')`로 rendering pages 실패, 파일 이름이 안 나옴**

- 원인: 마크다운 어딘가에 이중 중괄호가 들어가 Vue가 계산식으로 읽었습니다(인라인 코드 안이라도 마찬가지).
- 해결: 메시지 속 이름(`event` 등)으로 프로젝트를 검색해 찾고, 펜스 코드 블록으로 옮기거나 중괄호를 빼거나 `<span v-pre>`로 감쌉니다.

## 직접 해 보기

**과제 1 ⭐** — 레슨 하나를 고치고 `npm run preview`만 다시 실행해 보세요. 바뀌었나요? 그다음 `npm run build`를 하고 다시 확인해 보세요.

::: details 정답 보기
`preview`만 다시 실행하면 바뀌지 않습니다. `build`로 `dist`를 새로 만든 뒤에야 바뀝니다. 미리보기 서버를 켜 둔 채 빌드했다면 브라우저를 새로 고칩니다.
:::

**과제 2 ⭐** — `dist` 폴더를 통째로 지우고 `npm run build`를 다시 해 보세요. 똑같이 생기나요? 해시 이름은 같은가요?

::: details 정답 보기
같은 구성으로 다시 생깁니다. 원본이 그대로라면 해시도 대개 같지만, 그 사이 무언가를 고쳤다면 그 페이지와 관련된 파일 이름만 바뀝니다. `dist`는 언제든 다시 만들 수 있는 결과물이라 지워도 됩니다.
:::

**과제 3 ⭐⭐** — `WIKI_BASE=/wiki/`로 빌드하고 같은 값으로 미리보기 해서 `http://localhost:5191/wiki/`로 열리는지 확인하세요. 끝난 뒤 환경 변수를 지우고 다시 빌드해 둡니다.

::: details 힌트
PowerShell은 `$env:WIKI_BASE = '/wiki/'`, macOS·Linux는 `WIKI_BASE=/wiki/ npm run build`. 미리보기 출력이 `Built site served at http://localhost:5191/wiki/`이면 맞습니다.
:::

**과제 4 ⭐⭐** — `dist/part1-basics/01-hello.html`을 브라우저로 **직접 더블클릭**해서 열어 보세요(`file://` 주소). 미리보기와 무엇이 다른가요? 왜 그럴까요?

::: details 정답 보기
본문 글자는 보이지만 디자인이 깨지거나 링크·검색이 동작하지 않습니다. HTML 안의 주소가 `/assets/...`처럼 사이트 맨 앞을 기준으로 쓰여 있는데, `file://`에서는 `/`가 사이트 맨 앞이 아니라 드라이브의 맨 앞을 가리키기 때문입니다. 빌드 결과물은 반드시 웹 서버(preview, nginx, GitHub Pages)로 서비스해야 합니다.
:::

**과제 5 ⭐⭐⭐** — 이 레슨의 실패 ③(이중 중괄호)을 직접 재현한 뒤, 세 가지 해결법(펜스 코드 블록, 중괄호 제거, `v-pre`)을 하나씩 적용해 각각 빌드가 통과하는지 확인하세요.

::: details 힌트
`v-pre`는 "이 태그 안은 Vue가 해석하지 말라"는 표시입니다. 마크다운 문단 안에서 해당 부분을 `span` 태그로 감싸고 `v-pre` 속성을 붙입니다. 확인이 끝나면 실습한 줄을 지우고 다시 빌드해 둡니다.
:::

## 확인 퀴즈

**1.** 빌드의 두 단계 `building client + server bundles`와 `rendering pages`는 각각 무엇을 하나요?

::: details 정답 보기
앞은 테마·페이지를 브라우저용과 Node.js용 JS로 묶고(이때 dead link·문법 오류 검사), 뒤는 Node.js에서 페이지마다 HTML을 미리 그립니다(SSR).
:::

**2.** `npm run preview`는 마크다운을 읽나요?

::: details 정답 보기
아닙니다. `dist` 폴더의 파일만 서비스합니다. 그래서 build를 먼저 해야 하고, 고친 내용은 다시 build해야 보입니다.
:::

**3.** `/my-wiki/` 아래에 배포할 사이트를 `base` 없이 빌드하면 무엇이 깨지나요?

::: details 정답 보기
HTML 안의 CSS·JS·링크 주소가 `/assets/...`, `/part1-basics/...`처럼 `/my-wiki/`가 빠진 채로 만들어져, 브라우저가 엉뚱한 곳을 요청하고 404를 받습니다. 디자인이 깨지고 링크가 동작하지 않습니다.
:::

**4.** `head`의 탭 아이콘 주소에만 `${base}`를 직접 붙인 이유는?

::: details 정답 보기
`logo`, 마크다운 링크, 사이드바 링크는 VitePress가 base를 자동으로 붙여 주지만, `head`에 직접 적은 태그 속성은 그대로 출력되기 때문입니다.
:::

**5.** `dist`와 `node_modules`를 git에 올리지 않아도 되는 이유는?

::: details 정답 보기
둘 다 원본(마크다운·설정·`package.json`·`package-lock.json`)에서 명령(`npm run build`, `npm install`)으로 언제든 똑같이 다시 만들 수 있기 때문입니다.
:::

## 정리

- `npm run build`는 번들링(검사 포함) → 페이지별 HTML 미리 그리기(SSR) 두 단계로 `docs/.vitepress/dist`를 만듭니다.
- `dist`에는 `.md`마다 `.html`, 해시 붙은 `assets`, 그대로 복사된 `public` 파일, 검색 색인이 들어 있고, 언제든 다시 만들 수 있으므로 git에 올리지 않습니다.
- `npm run preview`(5191)는 `dist`만 서비스하는 간이 서버로, 배포 전 최종 확인용입니다.
- `base`는 서비스 경로와 정확히 같아야 합니다. `WIKI_BASE` 환경 변수로 같은 원본을 `/`와 `/my-wiki/` 두 곳에 맞춰 빌드할 수 있습니다(Git Bash는 `MSYS_NO_PATHCONV=1`).
- 빌드 실패는 `at ...` 줄 위쪽을 읽습니다. 파일 이름이 안 나오는 오류는 메시지 속 단어로 검색하고, `build complete`여도 로그의 `Error`를 확인합니다.
- 띄운 서버는 `Ctrl+C`로 끄고, 포트가 비었는지 확인하고 마칩니다.

## 다음 단계

이것으로 Part 5를 마쳤습니다. 내 PC 안에서만 보이던 `my-wiki`를 이제 다른 사람도 볼 수 있게 띄울 차례입니다. [개발 서버: npm run dev와 포트](../part6-serve/01-dev-server)에서 `--host`와 포트를 더 깊이 살펴본 뒤, 같은 `dist`를 nginx·Docker·GitHub Pages로 서비스합니다.
