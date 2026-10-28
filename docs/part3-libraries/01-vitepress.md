---
title: 'VitePress: 설정 · 라우팅 · 테마'
---

# VitePress: 설정 · 라우팅 · 테마

<LessonMeta level="초급" :minutes="60" prev="ts-wiki가 VitePress · GitHub Pages · Docker(nginx)를 고른 이유를 대안과 비교했습니다." />

## 이번에 배울 것

- VitePress가 무엇이고, 어떤 일을 대신해 주는지 설명할 수 있다.
- 파일 경로가 곧 주소가 되는 **파일 기반 라우팅** 규칙을 말할 수 있다.
- frontmatter와 `config.mts`의 주요 옵션(`title`, `base`, `cleanUrls`, `themeConfig`, `markdown`)을 읽고 고칠 수 있다.
- `::: tip`, `::: details` 같은 컨테이너와 커스텀 컴포넌트를 마크다운에서 쓸 수 있다.
- `vitepress dev` · `build` · `preview` 세 명령의 차이를 실제 결과로 구분할 수 있다.

## 먼저 알아 둘 것

- [Node.js와 npm: 패키지와 스크립트](../part1-concepts/04-node-npm) — `npm install`, `npm run`이 무엇인지
- [정적 사이트 생성기(SSG)와 빌드](../part1-concepts/05-ssg) — "빌드"가 무엇인지
- [왜 VitePress인가](../part2-choices/02-why-vitepress) — 이 레슨은 "어떻게 쓰나"를 다룹니다

## 비유로 이해하기

VitePress는 **출판사**와 비슷합니다.

- 작가(나)는 원고(마크다운 파일)만 씁니다.
- 출판사는 원고를 받아 표지(홈 화면), 목차(사이드바), 머리말(상단 메뉴), 찾아보기(검색), 쪽 번호(이전·다음 레슨 링크)를 붙여 **책(웹사이트)** 으로 만들어 줍니다.
- 책의 판형과 디자인(테마)은 출판사의 기본값을 쓰되, 표지 색을 바꾸거나 특별한 페이지(커스텀 컴포넌트)를 끼워 넣을 수도 있습니다.
- "출판 설정서"가 `config.mts`입니다. 책 제목, 목차 구성, 찾아보기를 넣을지 같은 것을 여기에 적습니다.

## 이게 뭔가

**VitePress**는 마크다운 파일을 모아 **문서 웹사이트**를 만들어 주는 정적 사이트 생성기(SSG, Static Site Generator)입니다. Vue 팀이 만들었고, 이름 그대로 **Vite**(빠른 개발 서버·번들러)와 **Vue**(UI 프레임워크) 위에서 동작합니다. 라이선스는 MIT입니다(`node_modules/vitepress/LICENSE`에서 확인).

VitePress가 대신해 주는 일을 나열하면 이렇습니다.

| 하는 일 | VitePress가 없다면 |
|---|---|
| 마크다운 → HTML 변환 | 페이지마다 HTML을 직접 써야 합니다 |
| 상단 메뉴·사이드바·목차·이전/다음 링크 | 모든 페이지에 같은 HTML을 복사해 넣어야 합니다 |
| 코드 블록 색칠, 복사 버튼, 줄 번호 | 하이라이트 라이브러리를 따로 붙여야 합니다 |
| 검색 | 검색 서버를 따로 만들거나 외부 서비스를 써야 합니다 |
| 다크 모드, 모바일 화면 | CSS를 직접 짜야 합니다 |
| 저장하면 바로 반영되는 개발 서버 | 매번 새로 고침해야 합니다 |

## 왜 필요한가

ts-wiki는 레슨 75개에 파트 소개·가이드 페이지까지 합쳐 `docs` 아래 마크다운 파일이 97개입니다. 이걸 HTML로 하나하나 만들고, 레슨을 하나 추가할 때마다 모든 페이지의 사이드바를 고친다면 유지할 수가 없습니다. VitePress를 쓰면 **마크다운 파일 하나를 추가하고 설정 한 줄만 고치면** 메뉴·검색·이전/다음 링크가 모두 따라옵니다.

## 설치

빈 폴더에서 시작하는 경우입니다. 연습용 폴더(예: `mini`)를 하나 만들고 그 안에서 실행합니다.

::: code-group

```powershell [Windows (PowerShell)]
mkdir mini
cd mini
npm init -y
npm install -D vitepress@1.6.3 vue@3.5.13
```

```bash [macOS / Linux]
mkdir mini && cd mini
npm init -y
npm install -D vitepress@1.6.3 vue@3.5.13
```

:::

- `npm init -y`는 `package.json`을 기본값으로 만듭니다.
- `-D`는 `devDependencies`에 넣으라는 뜻입니다. 위키는 빌드해서 HTML로 내보내므로 실행할 때 필요한 패키지(`dependencies`)가 없습니다.
- `@1.6.3`처럼 버전을 **고정**하면 다른 PC에서도 똑같은 결과가 나옵니다. ts-wiki도 `"vitepress": "1.6.3"`처럼 `^` 없이 고정했습니다.

**확인 방법**: 설치된 버전을 봅니다.

```bash
npm ls vitepress
```

```text
mini@1.0.0 ...\mini
`-- vitepress@1.6.3
```

::: warning `npx vitepress --version`은 버전을 보여 주지 않습니다
VitePress 1.6.3에서 `npx vitepress --version`이나 `npx vitepress --help`를 실행하면, 옵션을 명령으로 알아듣지 못하고 **현재 폴더를 루트로 개발 서버를 띄워 버립니다**(실제로 `Local: http://localhost:5174/`가 떴습니다). 버전은 `npm ls vitepress`로 확인하고, 실수로 띄웠다면 그 터미널에서 `Ctrl+C`로 끕니다.
:::

## 핵심 사용법

### 1단계. 폴더 구조 만들기

VitePress는 **문서 폴더 하나**를 루트로 삼습니다. 관례상 `docs`라고 이름 짓습니다.

```text
mini/
├─ package.json
└─ docs/                    ← 문서 루트 (vitepress dev docs 의 "docs")
   ├─ index.md              → /
   ├─ guide/
   │  ├─ index.md           → /guide/
   │  └─ recipe.md          → /guide/recipe
   ├─ public/               ← 그대로 복사되는 파일 (favicon 등)
   └─ .vitepress/
      ├─ config.mts         ← 사이트 설정
      └─ theme/             ← 테마 확장 (선택)
         ├─ index.ts
         ├─ Hello.vue
         └─ custom.css
```

`package.json`에는 스크립트(자주 쓰는 명령의 별명)를 넣습니다. 연습 프로젝트는 ts-wiki(5180)·이 가이드(5181)와 겹치지 않게 5190번대 포트를 씁니다.

```json
{
  "name": "mini-wiki",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vitepress dev docs --port 5190",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs --port 5191"
  },
  "devDependencies": {
    "vitepress": "1.6.3",
    "vue": "3.5.13"
  }
}
```

`"type": "module"`은 이 프로젝트의 `.js` 파일을 최신 방식(ES 모듈, `import`/`export`)으로 읽으라는 뜻입니다. VitePress 설정 파일이 `import`를 쓰므로 필요합니다.

### 2단계. 파일 기반 라우팅

**라우팅**(routing)은 "어떤 주소로 들어오면 어떤 페이지를 보여 줄지" 정하는 일입니다. VitePress는 이것을 **파일 경로**로 정합니다. 따로 등록하지 않아도 파일을 만들면 주소가 생깁니다.

| 파일 (`docs` 기준) | 주소 (`cleanUrls: true`일 때) | 빌드 결과 파일 |
|---|---|---|
| `index.md` | `/` | `index.html` |
| `guide/index.md` | `/guide/` | `guide/index.html` |
| `guide/recipe.md` | `/guide/recipe` | `guide/recipe.html` |
| (없는 파일) | `/nope` | `404.html`을 보여 줌 |

규칙은 세 가지입니다.

1. `.md`를 떼면 주소가 됩니다.
2. `index.md`는 그 폴더의 대표 페이지입니다(주소가 `/`로 끝남).
3. 링크를 걸 때는 `.md`를 떼고 씁니다. 예: `[레시피](./recipe)`. 없는 페이지로 링크하면 `build`가 실패합니다(이 가이드의 [문서 작성 규칙](../guide/writing-guide) 7번).

### 3단계. 마크다운과 frontmatter

**frontmatter**는 마크다운 파일 맨 위 `---` 두 줄 사이에 쓰는 **페이지 설정**입니다. YAML(들여쓰기로 구조를 표현하는 설정 형식)로 씁니다.

```md
---
title: 시작하기
---

# 시작하기

<Hello name="바리스타" />

::: tip 알아 두기
이 박스는 tip 컨테이너입니다.
:::

::: details 정답 보기
접혀 있다가 누르면 펼쳐집니다.
:::
```

자주 쓰는 frontmatter 키는 다음과 같습니다.

| 키 | 뜻 | 예 |
|---|---|---|
| `title` | 브라우저 탭 제목. `제목 \| 사이트 제목` 형태가 됩니다 | `title: 레시피` |
| `description` | 검색 엔진용 설명 | `description: 음료 레시피` |
| `layout` | 페이지 모양. `doc`(기본), `home`(홈 화면), `page`(사이드바 없음) | `layout: home` |
| `outline` | 오른쪽 목차 깊이 | `outline: [2, 3]` |
| `sidebar` | 이 페이지에서 사이드바 숨기기 | `sidebar: false` |
| `search` | 이 페이지를 검색에서 빼기 | `search: false` |

::: warning 제목에 콜론이 있으면 작은따옴표
`title: VitePress: 설정`처럼 콜론(`:`)이 두 번 나오면 YAML이 "키: 값" 구분을 헷갈립니다. `title: 'VitePress: 설정'`처럼 작은따옴표로 감쌉니다. 이 레슨 파일의 맨 위도 그렇게 되어 있습니다.
:::

홈 화면은 `layout: home`과 `hero`·`features`로 만듭니다. 본문 없이 frontmatter만으로 화면이 완성됩니다.

```yaml
---
layout: home
hero:
  name: 한빛 카페 위키
  tagline: 바리스타 교육 자료 모음
  actions:
    - theme: brand
      text: 시작하기
      link: /guide/
features:
  - title: 레시피
    details: 음료 레시피를 정리합니다.
  - title: 매장 운영
    details: 오픈·마감 절차를 정리합니다.
---
```

### 4단계. 컨테이너(강조 박스)

VitePress는 `:::`로 시작하는 **컨테이너** 문법을 지원합니다. 일반 마크다운에는 없는 VitePress 확장입니다.

| 문법 | 모양 | 쓰는 때 |
|---|---|---|
| `::: info` | 회색 박스 | 참고 정보 |
| `::: tip` | 초록 박스 | 도움이 되는 팁 |
| `::: warning` | 노란 박스 | 주의 |
| `::: danger` | 빨간 박스 | 데이터 손실 등 위험 |
| `::: details 제목` | 접기 블록 | 정답·긴 출력 숨기기 |
| `::: code-group` | 탭으로 묶인 코드 블록 | Windows / macOS 명령 나란히 |

`:::` 뒤에 적은 글자가 박스 제목이 됩니다. 실제 빌드 결과를 열어 보면 이렇게 바뀌어 있습니다.

```text
::: tip 알아 두기     →  <div class="tip custom-block">
::: details 정답 보기  →  <details class="details custom-block">
```

`details`는 HTML의 `<details>` 태그로 바뀌기 때문에 자바스크립트 없이도 접고 펼 수 있습니다.

### 5단계. config.mts — 사이트 설정

`docs/.vitepress/config.mts`가 사이트 전체의 설정입니다. `.mts`는 "ES 모듈로 읽는 TypeScript 파일"이라는 뜻의 확장자입니다.

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ko-KR',
  title: '한빛 카페 위키',
  description: '바리스타 교육 자료',
  cleanUrls: true,
  markdown: { lineNumbers: true },
  themeConfig: {
    nav: [{ text: '가이드', link: '/guide/' }],
    sidebar: [
      {
        text: '가이드',
        items: [
          { text: '시작하기', link: '/guide/' },
          { text: '레시피', link: '/guide/recipe' },
        ],
      },
    ],
    outline: { level: [2, 3], label: '이 페이지 목차' },
    search: { provider: 'local' },
  },
})
```

`defineConfig`는 아무 일도 하지 않고 객체를 그대로 돌려주는 함수입니다. 그런데도 감싸는 이유는 **에디터 자동 완성과 타입 검사** 때문입니다. 옵션 이름을 `cleanUrl`처럼 틀리게 쓰면 VS Code가 빨간 줄을 그어 줍니다. 이 파일은 `tsc --strict`로 타입 검사를 통과하는 것을 확인했습니다.

옵션은 크게 두 층으로 나뉩니다.

**사이트 옵션** (바깥쪽) — 빌드 방식과 HTML `<head>`에 영향을 줍니다.

| 옵션 | 뜻 | 기본값 |
|---|---|---|
| `lang` | HTML의 `lang` 속성. 화면 낭독기·번역기가 참고합니다 | `en-US` |
| `title` | 사이트 제목. 탭 제목 뒤에 붙고 왼쪽 위 로고 옆에 표시됩니다 | `VitePress` |
| `description` | 사이트 설명(`meta description`) | — |
| `base` | 사이트가 서비스될 **하위 경로**. GitHub Pages 프로젝트 사이트처럼 `https://계정.github.io/저장소/` 아래에 올릴 때 `/저장소/`로 씁니다 | `/` |
| `cleanUrls` | 주소에서 `.html`을 뗍니다. `/guide/recipe.html` 대신 `/guide/recipe` | `false` |
| `lastUpdated` | 페이지마다 git 커밋 시각으로 "마지막 수정"을 표시 | `false` |
| `head` | `<head>`에 넣을 태그(파비콘, 폰트 등) | — |
| `markdown` | 마크다운 변환 옵션. 예: `lineNumbers: true` → [3-3](./03-markdown-it-shiki) | — |
| `vite` | 밑에 있는 Vite에 넘길 설정 → [3-2](./02-vite-vue) | — |

**테마 옵션** (`themeConfig` 안) — 기본 테마의 화면 구성입니다.

| 옵션 | 뜻 |
|---|---|
| `nav` | 상단 메뉴. `{ text, link }` 배열 |
| `sidebar` | 왼쪽 사이드바. 그룹(`text`, `items`, `collapsed`)의 배열 |
| `outline` | 오른쪽 "이 페이지 목차". `level: [2, 3]`이면 `##`과 `###` 제목을 보여 줌 |
| `search` | 검색. `provider: 'local'`이면 MiniSearch 로컬 검색 → [3-4](./04-local-search) |
| `logo`, `socialLinks`, `footer` | 로고, 오른쪽 위 GitHub 아이콘, 바닥글 |
| `editLink` | "이 페이지 고치기" 링크. `:path`가 파일 경로로 바뀝니다 |
| `docFooter`, `darkModeSwitchLabel` 등 | 기본 테마 글자(영어)를 한국어로 바꾸는 옵션 |

::: tip `cleanUrls`는 서버 설정과 짝입니다
`cleanUrls: true`로 빌드해도 **파일 이름은 여전히 `recipe.html`** 입니다. 링크 주소만 `/guide/recipe`로 바뀝니다. 그래서 정적 파일 서버가 `/guide/recipe` 요청을 받았을 때 `recipe.html`을 찾아 주도록 설정해야 합니다. ts-wiki의 `nginx.conf`에 있는 `try_files $uri $uri.html ...`이 바로 그 일을 합니다 → [3-5 nginx](./05-nginx).
:::

### 6단계. 테마 확장과 커스텀 컴포넌트

기본 테마를 **통째로 다시 만들 필요 없이**, 기본 테마를 물려받아(extends) 필요한 것만 더할 수 있습니다. `docs/.vitepress/theme/index.ts` 파일이 있으면 VitePress가 자동으로 읽습니다.

```ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Hello from './Hello.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Hello', Hello)
  },
} satisfies Theme
```

- `extends: DefaultTheme` — 기본 테마의 모든 것(레이아웃, 사이드바, 검색 창)을 그대로 씁니다.
- `enhanceApp({ app })` — 앱이 만들어질 때 한 번 불립니다. `app.component('Hello', Hello)`로 컴포넌트를 **전역 등록**하면 모든 마크다운에서 `import` 없이 `<Hello />`를 쓸 수 있습니다.
- `import './custom.css'` — CSS 변수를 덮어써 색을 바꿉니다.
- `satisfies Theme` — "이 객체가 `Theme` 타입 모양에 맞는지 검사만 하라"는 TypeScript 문법(4.9 이상)입니다.

색은 CSS 변수(이름이 `--`로 시작하는 CSS 값)를 덮어써서 바꿉니다.

```css
:root {
  --vp-c-brand-1: #b5651d;
}
```

컴포넌트 파일(`Hello.vue`)은 Vue 단일 파일 컴포넌트(SFC)입니다. 문법은 [3-2 Vite와 Vue](./02-vite-vue)에서 자세히 다룹니다.

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ name: string }>()
const count = ref(0)
const message = computed(() => `${props.name}님, ${count.value}번 눌렀습니다`)
</script>

<template>
  <button class="hello" @click="count++">{{ message }}</button>
</template>

<style scoped>
.hello {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
}
</style>
```

빌드한 HTML을 열어 보면 `<Hello name="바리스타" />` 자리에 `바리스타님, 0번 눌렀습니다`라는 글자가 **이미 들어가 있습니다**. 서버 쪽에서 미리 그려 둔 것입니다(SSR). 브라우저에서 버튼을 누르면 숫자가 올라갑니다.

### 7단계. dev · build · preview

세 명령은 하는 일이 다릅니다. 연습 프로젝트에서 실제로 실행한 결과입니다.

**개발 서버** — 글을 쓰는 동안 켜 둡니다.

```bash
npm run dev
```

```text
  vitepress v1.6.3

  ➜  Local:   http://localhost:5190/
  ➜  Network: use --host to expose
```

브라우저로 `http://localhost:5190/guide/recipe`를 열면 페이지가 보입니다. 그런데 이때 서버가 보낸 HTML을 직접 받아 보면 흥미로운 점이 있습니다.

```text
GET /             -> 200 text/html len=527   <title></title>
GET /guide/recipe -> 200 text/html len=527   <title></title>
GET /nope         -> 200 text/html len=527   <title></title>
```

어떤 주소든 **똑같은 527글자짜리 빈 껍데기 HTML**이 오고, 제목도 비어 있습니다. 개발 서버는 미리 HTML을 만들어 두지 않고, 브라우저가 자바스크립트를 받아 그 자리에서 마크다운을 화면으로 바꿉니다. 덕분에 파일을 저장하면 즉시 반영됩니다(HMR, [3-2](./02-vite-vue)에서 설명).

**빌드** — 배포할 HTML 파일을 만듭니다.

```bash
npm run build
```

```text
  vitepress v1.6.3

- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
✓ rendering pages...
build complete in 12.37s.
```

결과는 `docs/.vitepress/dist` 폴더에 생깁니다(연습 프로젝트 기준 약 1.1MB).

```text
404.html
index.html
guide/index.html
guide/recipe.html
hashmap.json
vp-icons.css
assets/app.PezQ6Olt.js
assets/style.DyxI-k7m.css
assets/guide_recipe.md.DX_txGrW.js
assets/chunks/framework.CUEjfHs4.js
assets/chunks/@localSearchIndexroot.BrYSqj51.js
assets/inter-roman-latin.Di8DUHzh.woff2
...
```

- 마크다운 파일마다 `.html`이 하나씩 생겼습니다. `cleanUrls`를 켜도 파일 이름은 `.html`입니다.
- `assets/` 파일 이름 가운데의 `PezQ6Olt` 같은 글자는 **내용 해시**(파일 내용으로 계산한 지문)입니다. 내용이 바뀌면 이름도 바뀌므로 브라우저 캐시를 오래 걸어도 안전합니다. nginx의 `expires 30d`가 이것을 이용합니다.
- `@localSearchIndexroot...js`가 검색 인덱스입니다([3-4](./04-local-search)).

**미리보기** — 빌드 결과를 실제 배포처럼 띄웁니다.

```bash
npm run preview
```

```text
Built site served at http://localhost:5191/
```

이번에는 페이지마다 다른, 내용이 꽉 찬 HTML이 옵니다.

```text
GET /             -> 200  <title>한빛 카페 위키</title>
GET /guide/       -> 200  <title>시작하기 | 한빛 카페 위키</title>
GET /guide/recipe -> 200  <title>레시피 | 한빛 카페 위키</title>
GET /nope         -> 404  <title>404 | 한빛 카페 위키</title>
```

**확인 방법**: 브라우저에서 `Ctrl+U`(페이지 소스 보기)를 눌러 봅니다. `preview`에서는 본문 글자가 HTML 안에 보이고, `dev`에서는 거의 비어 있으면 정상입니다. 끌 때는 각 터미널에서 `Ctrl+C`를 누릅니다.

| | `dev` | `build` | `preview` |
|---|---|---|---|
| 하는 일 | 개발 서버 실행 | `dist` 폴더에 HTML 생성 | `dist`를 서비스 |
| HTML | 빈 껍데기, 브라우저에서 그림 | — | 완성된 HTML |
| 저장 시 반영 | 즉시 | 다시 빌드해야 | 다시 빌드해야 |
| 깨진 링크 검사 | 안 함 | **함(실패)** | — |
| 언제 | 글 쓸 때 | 배포 전 | 배포 전 최종 확인 |

## ts-wiki에서는

`D:\workspace\ts-wiki\docs\.vitepress\config.mts`(83줄)를 연습 프로젝트와 비교하면 같은 뼈대에 옵션이 더 붙어 있습니다. 한 줄씩 자세히 읽는 것은 [config.mts 한 줄씩 읽기](../part4-anatomy/03-config)에서 하고, 여기서는 이 레슨에서 배운 옵션이 어디 있는지만 짚습니다.

| 줄 | 코드 | 이 레슨의 개념 |
|---|---|---|
| 5 | `const base = process.env.WIKI_BASE ?? '/'` | `base`를 환경 변수로 받습니다. 내 PC·Docker에서는 `/`, GitHub Pages에서는 `/ts-wiki/` |
| 8~18 | `const curriculumSidebar = curriculum.map(...)` | `sidebar`를 손으로 쓰지 않고 `curriculum.mts`에서 **만들어** 냅니다 |
| 21~23 | `lang`, `title`, `description` | 사이트 옵션 |
| 25 | `cleanUrls: true` | `.html` 없는 주소 → nginx `try_files`와 짝 |
| 26 | `lastUpdated: true` | "마지막 수정" 표시 → GitHub Actions에서 `fetch-depth: 0`이 필요한 이유 |
| 27 | `head: [['link', { rel: 'icon', href: ... }]]` | 파비콘. `base`를 앞에 붙여 하위 경로에서도 찾게 함 |
| 28~30 | `markdown: { lineNumbers: true }` | 코드 블록 줄 번호 → [3-3](./03-markdown-it-shiki) |
| 32~34 | `vite: { build: { chunkSizeWarningLimit: 4000 } }` | Vite 설정 → [3-4](./04-local-search)에서 이유 설명 |
| 37~42 | `nav` | 상단 메뉴 4개 |
| 43~56 | `sidebar` | "학습 가이드" 그룹 + `...curriculumSidebar` |
| 57 | `outline: { level: [2, 3], label: '이 페이지 목차' }` | 오른쪽 목차 |
| 58~70 | `search: { provider: 'local', options: { translations } }` | 로컬 검색과 한국어 번역 |
| 71~75 | `docFooter`, `lastUpdated`, `darkModeSwitchLabel` ... | 기본 테마 글자의 한국어화 |

테마 확장은 `docs/.vitepress/theme/index.ts`에 있으며, 연습 프로젝트와 모양이 똑같습니다. 차이는 전역 등록하는 컴포넌트가 네 개라는 점입니다.

```ts
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 모든 마크다운에서 import 없이 쓸 수 있도록 전역 등록합니다.
    app.component('LessonMeta', LessonMeta)
    app.component('CurriculumToc', CurriculumToc)
    app.component('PartLessons', PartLessons)
    app.component('ProgressChecklist', ProgressChecklist)
  },
} satisfies Theme
```

이 레슨 맨 위의 난이도·시간 배지가 바로 `LessonMeta` 컴포넌트입니다. 이 가이드(wiki-server-guide)도 ts-wiki와 같은 구조라서 똑같이 쓸 수 있습니다. `custom.css`는 브랜드 색을 TypeScript 공식 색(`#3178c6`)으로 바꾸고, 한국어 본문의 줄 간격을 넓히고(`line-height: 1.85`), 단어 중간에서 줄이 바뀌지 않게(`word-break: keep-all`) 합니다.

파일 기반 라우팅도 그대로입니다. `docs/part1-basics/01-values-and-variables.md`는 `/part1-basics/01-values-and-variables` 주소가 되고, 사이드바의 `link`도 이 규칙(`/${part.dir}/${lesson.slug}`)으로 만들어집니다.

## 자주 하는 실수

**1. 링크가 깨져 빌드 실패**

- 증상: `npm run build`에서 `(!) Found dead link ./recipee in file guide\recipe.md`와 `build error: [vitepress] 1 dead link(s) found.`가 나오며 실패(연습 프로젝트에서 실제로 낸 오류)
- 원인: 링크 대상 파일이 없거나 이름이 틀렸습니다. `dev`에서는 그냥 404 화면만 나와서 모르고 지나갑니다.
- 해결: 파일 이름을 확인합니다. 배포 전에는 반드시 `build`를 한 번 돌립니다.

**2. 마크다운 본문에 이중 중괄호를 써서 빌드 실패**

- 증상: `build error: Cannot read properties of undefined (reading 'event')`
- 원인: VitePress는 마크다운을 Vue 템플릿으로 바꾸므로, 본문(인라인 코드 포함)의 이중 중괄호를 Vue 표현식으로 실행하려 합니다. 연습 프로젝트에 GitHub Actions 표현식을 인라인 코드로 넣었더니 실제로 이 오류가 났습니다.
- 해결: 펜스 코드 블록(백틱 세 개) 안에만 씁니다. 이유는 [3-2](./02-vite-vue)와 [3-3](./03-markdown-it-shiki)에서 설명합니다.

**3. GitHub Pages에 올렸더니 CSS가 안 먹고 하얀 화면**

- 증상: `https://계정.github.io/저장소/`에서 글자만 보이고 디자인이 없음. 개발자 도구 Network 탭에 `/assets/style....css` 404
- 원인: `base`가 `/`라서 파일을 `https://계정.github.io/assets/...`에서 찾았습니다.
- 해결: `base: '/저장소/'`로 빌드합니다. ts-wiki는 Actions에서 `WIKI_BASE` 환경 변수로 넘깁니다.

**4. frontmatter 때문에 페이지가 통째로 이상함**

- 증상: 제목이 이상하게 잘리거나 `YAMLException`
- 원인: `title`에 콜론이 있는데 따옴표로 감싸지 않았습니다.
- 해결: 작은따옴표로 감쌉니다. ts-wiki는 `npm run fix:frontmatter`로 자동으로 고칩니다.

**5. 컴포넌트를 만들었는데 `<Hello />`가 그냥 사라짐**

- 증상: 개발 서버에서 브라우저 개발자 도구 콘솔에 `[Vue warn]: Failed to resolve component: Hello` 경고(Vue의 일반적인 경고 문구)
- 원인: `theme/index.ts`에서 `app.component`로 등록하지 않았거나, `theme` 폴더 이름·위치가 틀렸습니다(`docs/.vitepress/theme/index.ts`여야 함).
- 해결: 등록 코드와 경로를 확인하고 개발 서버를 다시 켭니다.

## 직접 해 보기

**과제 1 ⭐** 연습 프로젝트에 `docs/guide/closing.md`(마감 절차)를 추가하고 사이드바에 넣어 보세요. 주소는 무엇이 되나요?

::: details 힌트·정답 보기
`sidebar`의 `items`에 `{ text: '마감 절차', link: '/guide/closing' }`를 추가합니다. 주소는 `/guide/closing`이고, 빌드하면 `dist/guide/closing.html`이 생깁니다.
:::

**과제 2 ⭐** `cleanUrls`를 `false`로 바꾸고 빌드한 뒤 사이드바 링크 주소가 어떻게 달라지는지 확인하세요.

::: details 힌트·정답 보기
링크가 `/guide/recipe.html`처럼 `.html`이 붙은 주소로 바뀝니다. 생성되는 파일 이름은 똑같이 `recipe.html`입니다. 바뀌는 것은 "주소 표기"뿐입니다.
:::

**과제 3 ⭐⭐** 페이지 하나에 `::: warning`과 `::: details`를 넣고, 빌드한 HTML에서 각각 어떤 태그로 바뀌었는지 찾아보세요.

::: details 힌트·정답 보기
`dist/guide/해당파일.html`을 에디터로 열고 `custom-block`으로 검색합니다. `<div class="warning custom-block">`, `<details class="details custom-block">`이 보입니다.
:::

**과제 4 ⭐⭐** `base: '/mini/'`로 빌드하고 `preview`를 띄운 뒤 `http://localhost:5191/`과 `http://localhost:5191/mini/`에 각각 접속해 보세요.

::: details 힌트·정답 보기
`base`를 바꾸면 `preview`도 `/mini/` 아래에서 서비스합니다. 모든 링크와 `assets` 경로 앞에 `/mini/`가 붙어 있는지 페이지 소스에서 확인합니다. 확인 후 `base`는 원래대로 돌려 둡니다.
:::

**과제 5 ⭐⭐⭐** 클릭할 때마다 숫자가 올라가는 `Hello.vue`를 고쳐서, 숫자를 0으로 되돌리는 "초기화" 버튼을 추가해 보세요.

::: details 힌트·정답 보기
템플릿에 버튼을 하나 더 넣고 `@click="count = 0"`을 붙입니다. 템플릿에서는 `ref`를 `.value` 없이 씁니다. 자세한 문법은 3-2에서 다룹니다.
:::

## 확인 퀴즈

**1.** `docs/guide/index.md`의 주소는 무엇인가요?

::: details 정답 보기
`/guide/`입니다. `index.md`는 그 폴더의 대표 페이지입니다.
:::

**2.** `cleanUrls: true`로 빌드하면 `dist` 폴더의 파일 이름에서 `.html`이 사라지나요?

::: details 정답 보기
아니요. 파일은 여전히 `recipe.html`이고, 링크 주소만 `.html` 없이 표기됩니다. 그래서 서버(nginx)가 `/guide/recipe` 요청에 `recipe.html`을 찾아 주도록 설정해야 합니다.
:::

**3.** 사이트 옵션 `title`과 frontmatter `title`의 차이는?

::: details 정답 보기
사이트 `title`은 사이트 전체 이름이고, frontmatter `title`은 그 페이지의 제목입니다. 탭에는 `페이지 제목 | 사이트 제목`으로 합쳐 표시됩니다(예: `레시피 | 한빛 카페 위키`).
:::

**4.** 깨진 링크를 잡아 주는 명령은 `dev`, `build`, `preview` 중 무엇인가요?

::: details 정답 보기
`build`입니다. 그래서 배포 전에 반드시 `build`를 돌립니다.
:::

**5.** `enhanceApp`에서 `app.component(...)`로 등록하는 이유는?

::: details 정답 보기
전역 등록하면 모든 마크다운 파일에서 `import` 없이 컴포넌트 태그를 바로 쓸 수 있기 때문입니다.
:::

## 정리

- VitePress는 마크다운 폴더를 문서 사이트로 바꾸는 SSG이며, Vite와 Vue 위에서 동작합니다.
- 파일 경로가 곧 주소입니다. `index.md`는 폴더의 대표 페이지, 링크는 `.md`를 떼고 씁니다.
- frontmatter는 페이지 설정, `config.mts`는 사이트 설정(사이트 옵션 + `themeConfig`)입니다.
- `base`는 하위 경로 배포용, `cleanUrls`는 `.html` 없는 주소이며 서버 설정과 짝을 이룹니다.
- `theme/index.ts`에서 기본 테마를 `extends`하고 `enhanceApp`으로 컴포넌트를 전역 등록합니다.
- `dev`는 빈 껍데기 + 즉시 반영, `build`는 HTML 생성 + 링크 검사, `preview`는 빌드 결과 확인입니다.

## 다음 단계

[3-2. Vite와 Vue: VitePress 밑에서 일하는 것들](./02-vite-vue)에서 `dev`가 왜 빈 껍데기를 보내는지, `.vue` 파일 문법은 어떻게 되는지, 그리고 이중 중괄호가 왜 빌드를 깨뜨리는지 알아봅니다.
