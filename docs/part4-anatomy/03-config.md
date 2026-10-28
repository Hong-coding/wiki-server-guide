---
title: config.mts 한 줄씩 읽기
---

# config.mts 한 줄씩 읽기

<LessonMeta level="중급" :minutes="60" prev="package.json의 scripts가 vitepress dev docs를 실행하고, 버전은 lock 파일로 고정된다" />

## 이번에 배울 것

- ts-wiki `docs/.vitepress/config.mts` 83줄의 각 줄이 무슨 일을 하는지 설명할 수 있다.
- `base`와 환경 변수 `WIKI_BASE`가 GitHub Pages 배포에서 왜 필요한지 설명할 수 있다.
- 사이드바를 만드는 `map`·삼항 연산자·템플릿 리터럴 코드를 읽고 결과를 예측할 수 있다.
- `cleanUrls`와 nginx `try_files`, `lastUpdated`와 Actions `fetch-depth: 0`의 관계를 설명할 수 있다.
- 복사본에서 옵션을 바꾸고 빌드해, 결과 HTML의 차이를 직접 확인할 수 있다.

## 먼저 알아 둘 것

- VitePress 설정 파일의 기본 구조 → [VitePress: 설정 · 라우팅 · 테마](../part3-libraries/01-vitepress)
- 로컬 검색 → [로컬 검색 (MiniSearch)](../part3-libraries/04-local-search)
- nginx의 `location`, `try_files` → [nginx: 정적 파일 웹 서버](../part3-libraries/05-nginx)
- GitHub Actions 워크플로 → [GitHub Actions와 Pages 배포 액션](../part3-libraries/07-github-actions)
- JavaScript 배열의 `map`, 화살표 함수를 본 적이 있으면 좋습니다. 없어도 이 레슨에서 풀어 설명합니다.

## 비유로 이해하기

`config.mts`는 **건물의 설계 도면 표지**입니다. 방 하나하나(마크다운 페이지)는 각자 그려져 있지만, 표지에는 "이 건물은 어느 주소에 있나(`base`), 간판은 무엇인가(`title`), 층별 안내판은 어떻게 생겼나(`nav`, `sidebar`), 안내 데스크(검색)는 어떤 말로 안내하나"가 적혀 있습니다. 표지를 바꾸면 방은 그대로인데 건물 전체의 모습이 바뀝니다.

## 개념 설명

### 0단계: 전체 파일과 구역 나누기

먼저 전체를 봅니다. 줄 번호는 실제 파일과 같습니다.

```ts:line-numbers
import { defineConfig, type DefaultTheme } from 'vitepress'
import { curriculum } from './curriculum.mts'

// GitHub Pages(프로젝트 페이지)에 올릴 때는 /저장소이름/ 아래에서 서비스되므로 base를 환경 변수로 받습니다.
const base = process.env.WIKI_BASE ?? '/'

// 커리큘럼 정의에서 사이드바를 만들어, 문서 목록을 한 곳(curriculum.mts)에서만 관리합니다.
const curriculumSidebar: DefaultTheme.SidebarItem[] = curriculum.map((part) => ({
  text: part.dir === 'appendix' ? part.title : `Part ${part.no}. ${part.title}`,
  collapsed: part.no > 1,
  items: [
    { text: '📌 파트 소개', link: `/${part.dir}/` },
    ...part.lessons.map((lesson, i) => ({
      text: `${part.dir === 'appendix' ? '' : `${part.no}-${i + 1}. `}${lesson.title}`,
      link: `/${part.dir}/${lesson.slug}`,
    })),
  ],
}))

export default defineConfig({
  lang: 'ko-KR',
  title: 'TypeScript 마스터 위키',
  description: '프로그래밍을 처음 배우는 사람이 TypeScript를 마스터하기까지의 단계별 학습 위키',
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: `${base}favicon.svg` }]],
  markdown: {
    lineNumbers: true,
  },
  // 로컬 검색 인덱스가 한 청크에 들어가 500kB를 넘으므로 경고 기준만 올립니다.
  vite: {
    build: { chunkSizeWarningLimit: 4000 },
  },
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '학습 가이드', link: '/guide/roadmap' },
      { text: '전체 목차', link: '/guide/toc' },
      { text: '12주 학습 계획', link: '/guide/study-plan' },
      { text: '치트시트', link: '/appendix/02-cheatsheet' },
    ],
    sidebar: [
      {
        text: '학습 가이드',
        items: [
          { text: '학습 로드맵', link: '/guide/roadmap' },
          { text: '전체 목차', link: '/guide/toc' },
          { text: '이 위키로 공부하는 법', link: '/guide/how-to-study' },
          { text: '12주 학습 계획', link: '/guide/study-plan' },
          { text: '진도 체크리스트', link: '/guide/checklist' },
          { text: '문서 작성 규칙', link: '/guide/writing-guide' },
        ],
      },
      ...curriculumSidebar,
    ],
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
    lastUpdated: { text: '마지막 수정' },
    darkModeSwitchLabel: '다크 모드',
    sidebarMenuLabel: '메뉴',
    returnToTopLabel: '맨 위로',
    editLink: {
      pattern: 'https://github.com/Hong-coding/ts-wiki/edit/main/docs/:path',
      text: 'GitHub에서 이 페이지 고치기',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Hong-coding/ts-wiki' }],
    footer: { message: 'TypeScript 5.x · strict 모드 기준', copyright: 'TypeScript 마스터 위키' },
  },
})
```

83줄은 크게 네 구역입니다.

| 줄 | 구역 | 하는 일 |
|---|---|---|
| 1~2 | 불러오기 | VitePress의 도우미 함수·타입, 커리큘럼 데이터 |
| 4~18 | 준비 계산 | `base` 값 정하기, 사이드바 배열 만들기 |
| 20~34 | 사이트 설정 | 언어, 제목, 주소 규칙, `<head>`, 마크다운, Vite |
| 35~82 | 테마 설정(`themeConfig`) | 기본 테마가 그리는 메뉴·사이드바·검색·문구 |

"사이트 설정"은 **어떤 테마를 쓰든** 적용되는 것이고, `themeConfig`는 **기본 테마(DefaultTheme)**가 읽어서 화면에 그리는 값입니다. 테마를 통째로 바꾸면 `themeConfig`의 의미도 바뀝니다.

### 1단계: 불러오기 (1~2줄)

```ts:line-numbers
import { defineConfig, type DefaultTheme } from 'vitepress'
import { curriculum } from './curriculum.mts'
```

- `defineConfig`: 설정 객체를 그대로 돌려주는 함수입니다. 실행에는 아무 영향이 없지만, **편집기가 옵션 이름과 값의 타입을 알려 주고 오타를 빨간 줄로 표시**하게 해 줍니다. `cleanUrl`(s 빠짐)처럼 틀리면 VS Code가 바로 알려 줍니다.
- `type DefaultTheme`: 앞의 `type`은 "타입으로만 쓰고, 실행 코드에는 남기지 말라"는 표시입니다. 8줄에서 사이드바 배열의 타입(`DefaultTheme.SidebarItem[]`)을 적을 때 씁니다.
- `./curriculum.mts`: 파트·레슨 목록입니다. 확장자 `.mts`까지 적은 점에 주목하세요. ESM에서는 불러올 파일의 확장자를 생략하지 않는 것이 원칙입니다. 이 파일은 [4-4](./04-curriculum)에서 해부합니다.

### 2단계: `base`와 `WIKI_BASE` (4~5줄, 24줄)

```ts:line-numbers=4
// GitHub Pages(프로젝트 페이지)에 올릴 때는 /저장소이름/ 아래에서 서비스되므로 base를 환경 변수로 받습니다.
const base = process.env.WIKI_BASE ?? '/'
```

**`base`는 사이트가 도메인의 어느 경로 아래에 놓이는지**를 정합니다.

| 띄우는 곳 | 홈 주소 | 필요한 base |
|---|---|---|
| 개발 서버, Docker(8090) | `http://localhost:8090/` | `/` |
| GitHub Pages(프로젝트 페이지) | `https://hong-coding.github.io/ts-wiki/` | `/ts-wiki/` |

GitHub Pages는 저장소 이름을 경로 앞에 붙여 서비스합니다. 그런데 사이트 안의 링크가 `/guide/roadmap`이면 브라우저는 `https://hong-coding.github.io/guide/roadmap`(저장소 이름이 빠진 주소)으로 가서 404가 납니다. 그래서 Pages용으로 빌드할 때만 base를 `/ts-wiki/`로 바꿔야 합니다.

코드를 풀어 읽으면 이렇습니다.

- `process.env.WIKI_BASE`: 환경 변수(environment variable, 프로그램을 실행할 때 바깥에서 넣어 주는 설정 값) `WIKI_BASE`를 읽습니다. 없으면 `undefined`입니다.
- `??`(널 병합 연산자): 왼쪽이 `null`이나 `undefined`이면 오른쪽 값을 씁니다. 즉 "`WIKI_BASE`가 있으면 그 값, 없으면 `/`".

설정 파일에 `/ts-wiki/`를 직접 적지 않고 환경 변수로 받은 이유는, **같은 소스로 두 곳에 배포**하기 위해서입니다. Docker는 환경 변수 없이 빌드해 `/`가 되고, Actions는 `WIKI_BASE`를 넣어 빌드합니다. 저장소 이름을 바꿔도 설정 파일을 고칠 필요가 없습니다(Actions가 저장소 이름을 자동으로 넣기 때문).

24줄의 `base,`는 `base: base,`의 줄임말(속성 이름과 변수 이름이 같을 때 쓰는 단축 문법)입니다.

#### 실험: base를 바꿔 빌드하기

복사본에서 base 없이 한 번, `WIKI_BASE=/ts-wiki/`로 한 번 빌드해 결과 HTML을 비교했습니다.

Windows(PowerShell):

```powershell
$env:WIKI_BASE = '/ts-wiki/'
npx vitepress build docs
Remove-Item Env:WIKI_BASE   # 실험이 끝나면 환경 변수를 지웁니다
```

macOS/Linux(bash):

```bash
WIKI_BASE=/ts-wiki/ npx vitepress build docs
```

빌드 뒤 `docs/.vitepress/dist`에서 링크를 찾아봤습니다.

```bash
grep -o 'href="[^"]*roadmap[^"]*"' docs/.vitepress/dist/guide/toc.html | sort | uniq -c
grep -o 'rel="icon" href="[^"]*"' docs/.vitepress/dist/index.html
```

| 확인한 것 | base 없음 | `WIKI_BASE=/ts-wiki/` |
|---|---|---|
| 목차 페이지의 로드맵 링크 | `href="/guide/roadmap"` | `href="/ts-wiki/guide/roadmap"` |
| 파비콘 `<link>` | `href="/favicon.svg"` | `href="/ts-wiki/favicon.svg"` |
| 로고 이미지 | `src="/favicon.svg"` | `src="/ts-wiki/favicon.svg"` |
| 스크립트 파일 | `/assets/app.….js` | `/ts-wiki/assets/app.B4WKxHbC.js` |
| `dist` 안의 파일 위치 | `dist/guide/toc.html` | `dist/guide/toc.html` (같음) |

마지막 줄이 중요합니다. **base는 파일 위치를 바꾸지 않고, HTML 안의 링크 주소만 바꿉니다.** `dist` 폴더를 `/ts-wiki/` 아래에 올리는 일은 GitHub Pages가 합니다.

**확인 방법:** 두 빌드 결과에서 위 표와 같은 차이가 보이면 성공입니다. 빌드에 2~3분이 걸리므로 한 번 빌드한 `dist`를 다른 이름으로 옮겨 두고 비교하세요.

::: warning Git Bash에서 `/ts-wiki/`가 이상한 경로로 바뀌는 문제
Windows의 **Git Bash**에서 `WIKI_BASE=/ts-wiki/ npx vitepress build docs`를 그대로 실행했더니 다음 경고가 나왔습니다.

```text
(!) "base" option should start with a slash.
```

결과 HTML의 파비콘 주소는 `C:/Program Files/Git/ts-wiki/favicon.svg`가 되어 있었습니다. Git Bash가 `/`로 시작하는 값을 "리눅스식 경로"로 보고 Windows 경로로 자동 변환했기 때문입니다. Git Bash에서는 `MSYS_NO_PATHCONV=1 WIKI_BASE=/ts-wiki/ npx vitepress build docs`처럼 변환을 끄거나, PowerShell을 씁니다. GitHub Actions는 Linux(`ubuntu-latest`)에서 돌기 때문에 이 문제가 없습니다.
:::

### 3단계: 사이드바 생성 코드 (7~18줄)

```ts:line-numbers=7
// 커리큘럼 정의에서 사이드바를 만들어, 문서 목록을 한 곳(curriculum.mts)에서만 관리합니다.
const curriculumSidebar: DefaultTheme.SidebarItem[] = curriculum.map((part) => ({
  text: part.dir === 'appendix' ? part.title : `Part ${part.no}. ${part.title}`,
  collapsed: part.no > 1,
  items: [
    { text: '📌 파트 소개', link: `/${part.dir}/` },
    ...part.lessons.map((lesson, i) => ({
      text: `${part.dir === 'appendix' ? '' : `${part.no}-${i + 1}. `}${lesson.title}`,
      link: `/${part.dir}/${lesson.slug}`,
    })),
  ],
}))
```

이 12줄이 이 파일에서 가장 어렵습니다. 문법 네 가지로 나눠 읽습니다.

#### (1) `map`: 배열을 다른 배열로 바꾸기

`배열.map(함수)`는 배열의 원소 하나하나에 함수를 적용해 **같은 길이의 새 배열**을 만듭니다. `curriculum`에는 파트가 11개(Part 0~9 + 부록) 있으므로, `curriculumSidebar`도 11개 묶음이 됩니다.

```ts
[1, 2, 3].map((n) => n * 10) // [10, 20, 30]
```

8줄의 `(part) => ({ ... })`에서 괄호로 감싼 중괄호 `({ ... })`는 "객체를 돌려준다"는 뜻입니다. 괄호 없이 `=> { ... }`라고 쓰면 JavaScript는 중괄호를 함수 본문으로 읽어 버립니다.

13줄의 `part.lessons.map((lesson, i) => ...)`는 안쪽에서 한 번 더 `map`을 씁니다. 두 번째 매개변수 `i`는 0부터 시작하는 순번입니다.

#### (2) 삼항 연산자: `조건 ? 참일 때 : 거짓일 때`

9줄은 "부록이면 제목만(`부록`), 아니면 `Part 번호. 제목`"을 고릅니다. 14줄도 "부록이면 빈 문자열, 아니면 `0-1. ` 같은 번호"를 고릅니다. 부록은 순서대로 공부하는 파트가 아니라 번호를 붙이지 않는 것입니다.

#### (3) 템플릿 리터럴: 백틱 안의 `${...}`

백틱(`` ` ``)으로 감싼 문자열 안에서는 `${식}` 자리에 계산 결과가 들어갑니다. 14줄은 템플릿 리터럴 **안에 또 템플릿 리터럴**이 있어 복잡해 보입니다. 바깥부터 풀면 이렇습니다.

```ts
// 바깥: `${번호부분}${lesson.title}`
// 번호부분: part.dir === 'appendix' ? '' : `${part.no}-${i + 1}. `
// Part 0의 첫 레슨(i = 0)이면 → '0-1. ' + '프로그래밍과 JavaScript, 그리고 TypeScript'
```

`i + 1`인 이유는 `i`가 0부터 세기 때문입니다. 사람에게는 1번부터 보여야 합니다.

#### (4) 스프레드 `...`: 배열을 펼쳐 넣기

12줄의 "파트 소개" 한 항목 뒤에, 13줄 `...part.lessons.map(...)`의 결과 배열을 **펼쳐서** 이어 붙입니다. `...`가 없으면 배열 안에 배열이 통째로 하나 들어가 버립니다. 55줄의 `...curriculumSidebar`도 같은 원리로, 직접 쓴 "학습 가이드" 묶음 뒤에 11개 파트 묶음을 펼쳐 넣습니다.

#### 실제 결과 확인

같은 코드를 스크래치에서 실행해 결과를 출력해 봤습니다. Node 24.13.1은 `.mts` 파일을 별도 도구 없이 바로 실행합니다.

```bash
node sidebar-test.mts
```

```text
[
  {
    "text": "Part 0. 시작하기",
    "collapsed": false,
    "items": [
      {
        "text": "📌 파트 소개",
        "link": "/part0-start/"
      },
      {
        "text": "0-1. 프로그래밍과 JavaScript, 그리고 TypeScript",
        "link": "/part0-start/01-what-is-programming"
      },
      ...
    ]
  },
  ...
  {
    "text": "부록",
    "collapsed": true,
    "items": [
      {
        "text": "📌 파트 소개",
        "link": "/appendix/"
      },
      {
        "text": "용어집 (한/영)",
        "link": "/appendix/01-glossary"
      },
      ...
```

- 10줄 `collapsed: part.no > 1`: 비교 결과(`true`/`false`)가 그대로 값이 됩니다. Part 0·1은 `false`(펼친 채로 시작), Part 2부터는 `true`(접힌 채로 시작)입니다. 처음 온 사람이 앞 파트에 집중하게 하고, 사이드바가 너무 길어지지 않게 한 것입니다.
- 링크에 `.md`도 `base`도 없습니다. 확장자는 VitePress가, base는 VitePress가 링크를 그릴 때 알아서 붙입니다(2단계 실험의 `/ts-wiki/guide/roadmap` 참고).

**확인 방법:** 개발 서버에서 사이드바를 열어 Part 0·1은 펼쳐져 있고 Part 2부터는 접혀 있는지, 부록 레슨에는 번호가 없는지 봅니다.

### 4단계: 사이트 설정 (20~34줄)

```ts:line-numbers=20
export default defineConfig({
  lang: 'ko-KR',
  title: 'TypeScript 마스터 위키',
  description: '프로그래밍을 처음 배우는 사람이 TypeScript를 마스터하기까지의 단계별 학습 위키',
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: `${base}favicon.svg` }]],
  markdown: {
    lineNumbers: true,
  },
  // 로컬 검색 인덱스가 한 청크에 들어가 500kB를 넘으므로 경고 기준만 올립니다.
  vite: {
    build: { chunkSizeWarningLimit: 4000 },
  },
```

| 줄 | 옵션 | 하는 일 |
|---|---|---|
| 20 | `export default` | 이 객체를 파일의 "기본 내보내기"로 내보냅니다. VitePress가 이것을 읽습니다 |
| 21 | `lang` | `<html lang="ko-KR">`가 됩니다. 화면 낭독기·검색 엔진·브라우저 번역이 언어를 알게 됩니다 |
| 22 | `title` | 브라우저 탭 제목 뒤쪽과 왼쪽 위 사이트 이름 |
| 23 | `description` | `<meta name="description">`. 검색 결과 미리보기 문구 |
| 24 | `base` | 2단계 참고 |
| 25 | `cleanUrls` | 아래에서 따로 설명 |
| 26 | `lastUpdated` | 아래에서 따로 설명 |
| 27 | `head` | 모든 페이지의 `<head>`에 넣을 태그. 여기서는 파비콘 |
| 28~30 | `markdown.lineNumbers` | 모든 코드 블록에 줄 번호 표시 |
| 32~34 | `vite.build.chunkSizeWarningLimit` | 밑에서 일하는 Vite에 넘기는 설정. 경고 기준을 4000kB로 |

#### 27줄: 왜 파비콘에만 `${base}`를 직접 붙였나

36줄의 `logo: '/favicon.svg'`에는 base를 안 붙였는데, 27줄의 `head`에는 `${base}favicon.svg`로 직접 붙였습니다. 이유는 **`head`는 VitePress가 적힌 그대로 HTML에 넣기** 때문입니다. 반면 `logo`, `nav`, `sidebar`의 링크는 기본 테마가 그릴 때 base를 알아서 붙입니다. 2단계 실험 표에서 파비콘과 로고가 둘 다 `/ts-wiki/favicon.svg`로 바뀐 것이 이 두 가지 방식의 결과입니다.

`favicon.svg`는 `docs/public/`에 있습니다. `public` 폴더의 파일은 가공 없이 사이트 맨 위로 복사되므로 주소가 `/favicon.svg`가 됩니다.

#### 32~34줄: 경고를 끄지 않고 기준만 올린 이유

Vite는 빌드 결과 JS 파일 하나(청크, chunk)가 500kB를 넘으면 "너무 크다"고 경고합니다. ts-wiki는 로컬 검색 인덱스(75개 레슨 전체의 검색용 데이터)가 한 파일에 들어가서 이 기준을 넘습니다. 검색 인덱스는 검색 창을 열 때만 내려받으니 실제로는 문제가 없어서, 의미 없는 경고가 매번 나오지 않도록 기준만 올린 것입니다. 주석(31줄)에 그 이유를 적어 둔 것도 눈여겨보세요. 설정에서 "왜"를 적어 두지 않으면 나중에 누군가 지워 버립니다.

### 5단계: `cleanUrls`와 nginx `try_files`

`cleanUrls: true`는 **주소에서 `.html`을 빼는** 옵션입니다.

#### 실험: cleanUrls를 끄고 빌드하기

복사본의 25줄을 `cleanUrls: false,`로 바꿔 빌드한 뒤 같은 링크를 찾았습니다.

| 확인한 것 | `cleanUrls: true`(원래) | `cleanUrls: false` |
|---|---|---|
| 목차 페이지의 로드맵 링크 | `href="/guide/roadmap"` | `href="/guide/roadmap.html"` |
| `dist` 안의 파일 이름 | `guide/roadmap.html` | `guide/roadmap.html` (같음) |

base와 마찬가지로 **파일은 그대로 `roadmap.html`이고, 링크 모양만 바뀝니다.** 그러면 `/guide/roadmap`이라는 요청이 왔을 때 `roadmap.html` 파일을 찾아 주는 일은 누가 할까요? **웹 서버**가 해야 합니다. 그래서 ts-wiki의 `nginx.conf`에 이 줄이 있습니다.

```nginx:line-numbers=7
    # cleanUrls: /guide/roadmap → /guide/roadmap.html
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
```

`try_files`는 왼쪽부터 차례로 파일을 찾아봅니다.

1. `$uri`: 요청 경로 그대로(`/guide/roadmap`라는 파일). 없음.
2. `$uri.html`: `.html`을 붙인 `/guide/roadmap.html`. **있음 → 이 파일을 보냅니다.**
3. `$uri/`: 폴더로 보고 그 안의 `index.html`(`/part0-start/` 같은 파트 소개).
4. `=404`: 다 없으면 404.

즉 `config.mts` 25줄과 `nginx.conf` 9줄은 **한 쌍**입니다. 한쪽만 바꾸면 사이트가 깨집니다. `cleanUrls: true`인데 nginx에 `$uri.html`이 없으면, 첫 화면은 열리지만 **링크를 눌러 이동한 페이지에서 새로 고침하는 순간 404**가 납니다(처음 이동은 브라우저 안의 JavaScript가 처리해서 잘 되는 것처럼 보입니다). GitHub Pages는 `.html`을 붙여 찾아 주는 기능을 기본으로 갖고 있어(공식 문서 기준) 따로 설정할 것이 없습니다.

**확인 방법:** Docker로 띄운 위키에서 레슨 페이지를 열고 `F5`로 새로 고쳐도 404가 나지 않으면 한 쌍이 잘 맞은 것입니다. Docker 실습은 [Docker 이미지로 묶기](../part6-serve/03-docker-nginx)에서 합니다.

### 6단계: `lastUpdated`와 `fetch-depth: 0`

26줄 `lastUpdated: true`를 켜면 각 페이지 아래에 "마지막 수정: 날짜"가 나옵니다(문구는 72줄 `lastUpdated: { text: '마지막 수정' }`). 이 날짜는 파일의 저장 시각이 아니라 **git에 그 파일이 마지막으로 커밋된 시각**입니다. VitePress가 빌드할 때 파일마다 git 이력을 조회합니다(공식 문서 기준).

ts-wiki 원본에서 같은 정보를 git으로 직접 볼 수 있습니다.

```bash
git log -1 --pretty=%ai -- docs/guide/toc.md
```

```text
2026-10-28 07:08:01 +0900
```

그러면 git 이력이 없으면 어떻게 될까요? `.git` 폴더를 빼고 복사한 실습본에서 빌드한 뒤, 페이지 데이터 파일을 찾아봤습니다.

```bash
grep -o '.lastUpdated.:.\{0,20\}' docs/.vitepress/dist/assets/guide_toc.md.*.lean.js
```

```text
"lastUpdated":null}'),l={name:"gui
```

값이 `null`이고, 화면에도 "마지막 수정" 줄이 나오지 않습니다. 빌드는 실패하지 않고 **조용히 날짜만 사라집니다.**

이것이 `deploy.yml` 22~24줄의 이유입니다.

```yaml:line-numbers=22
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # lastUpdated(마지막 수정 시각) 표시에 git 이력이 필요합니다.
```

`actions/checkout`은 기본값으로 **최신 커밋 1개만** 받습니다(얕은 복제, shallow clone). 그러면 git에게는 모든 파일이 "그 한 커밋에서 마지막으로 바뀐 것"으로 보여, 모든 페이지의 수정 날짜가 마지막 배포 시각으로 똑같아집니다. `fetch-depth: 0`은 "이력 전체를 받아라"는 뜻이라, 파일마다 진짜 마지막 수정 시각이 나옵니다.

Docker 빌드에서는 `.dockerignore` 5줄이 `.git`을 빼므로, Docker로 띄운 ts-wiki에는 수정 날짜가 표시되지 않는 것이 정상입니다.

### 7단계: 테마 설정 (35~82줄)

#### 내비게이션과 사이드바 (36~56줄)

- 36줄 `logo`: 왼쪽 위 아이콘.
- 37~42줄 `nav`: 화면 맨 위 가로 메뉴. 자주 찾는 4개 페이지만 둡니다.
- 43~56줄 `sidebar`: 왼쪽 세로 메뉴. 맨 앞의 "학습 가이드" 묶음(44~54줄)은 직접 적고, 그 뒤에 `...curriculumSidebar`(55줄)를 펼칩니다. 가이드 페이지는 레슨이 아니라 `curriculum.mts`에 없기 때문에 직접 적은 것입니다.

사이드바를 **배열** 하나로 준 점도 의미가 있습니다. VitePress는 사이드바를 "경로별 객체"로 나눠 페이지마다 다른 사이드바를 보여 줄 수도 있는데, ts-wiki는 어느 페이지에서든 전체 커리큘럼이 보이도록 하나로 통일했습니다.

#### 페이지 목차 (57줄)

```ts:line-numbers=57
    outline: { level: [2, 3], label: '이 페이지 목차' },
```

오른쪽 "이 페이지 목차"에 `##`(2단계)와 `###`(3단계) 제목을 보여 줍니다. 기본값은 `##`만입니다(공식 문서 기준). ts-wiki 레슨은 `### 1단계` 같은 소제목을 많이 써서 3단계까지 넣었습니다.

#### 검색과 번역 (58~70줄)

```ts:line-numbers=58
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
```

- `provider: 'local'`: 외부 검색 서비스(Algolia 등) 없이, 빌드할 때 검색 인덱스를 만들어 사이트에 함께 넣는 방식입니다. 서버도 계정도 필요 없어서 사내 서버·Docker·Pages 어디서든 똑같이 동작합니다.
- `translations`: 검색 창의 영어 문구를 한국어로 바꿉니다. `button`은 상단의 검색 버튼, `modal`은 검색 창 안, `footer`는 검색 창 아래쪽 키보드 안내("↵ 선택, ↑↓ 이동, esc 닫기")입니다.
- `buttonAriaLabel`: 화면에 보이지 않고 화면 낭독기가 읽는 이름입니다. 보이는 글자와 함께 맞춰 두어야 시각 장애인 사용자도 같은 의미를 듣습니다.

#### 한국어 문구들 (71~75줄)

| 줄 | 옵션 | 바뀌는 곳 | 기본 영어 문구(공식 문서 기준) |
|---|---|---|---|
| 71 | `docFooter` | 페이지 맨 아래 이전/다음 버튼 | Previous page / Next page |
| 72 | `lastUpdated.text` | 수정 날짜 앞 문구 | Last updated |
| 73 | `darkModeSwitchLabel` | 모바일 메뉴의 다크 모드 스위치 | Appearance |
| 74 | `sidebarMenuLabel` | 모바일에서 사이드바 여는 버튼 | Menu |
| 75 | `returnToTopLabel` | 모바일의 맨 위로 버튼 | Return to top |

`lang: 'ko-KR'`(21줄)만으로는 이 문구들이 번역되지 않습니다. 기본 테마의 문구는 하나하나 직접 바꿔야 합니다.

#### 편집 링크 (76~79줄)

```ts:line-numbers=76
    editLink: {
      pattern: 'https://github.com/Hong-coding/ts-wiki/edit/main/docs/:path',
      text: 'GitHub에서 이 페이지 고치기',
    },
```

페이지 아래에 "GitHub에서 이 페이지 고치기" 링크가 생깁니다. `:path`는 **`docs/` 기준의 마크다운 파일 경로**로 바뀝니다. 예를 들어 `/guide/roadmap` 페이지에서는 다음 주소가 됩니다.

```text
https://github.com/Hong-coding/ts-wiki/edit/main/docs/guide/roadmap.md
```

`edit/main/`은 "main 브랜치의 파일을 편집하는 GitHub 화면"이고, 그 뒤에 저장소 안의 경로가 옵니다. 마크다운은 저장소의 `docs/` 아래 있으므로 패턴에 `docs/`를 붙였습니다. 내 위키에 쓸 때는 사용자 이름·저장소 이름·브랜치 이름을 바꿔야 합니다.

#### 소셜 링크와 바닥글 (80~81줄)

- 80줄 `socialLinks`: 오른쪽 위 GitHub 아이콘. `icon: 'github'`는 기본 테마에 내장된 아이콘 이름입니다.
- 81줄 `footer`: 맨 아래 문구. 기본 테마는 사이드바가 있는 페이지에서는 바닥글을 그리지 않으므로(공식 문서 기준), 주로 홈 화면에서 보입니다.

## ts-wiki에서는

- **환경에 따라 달라지는 값은 `base` 하나뿐**이고, 그것도 환경 변수로 받습니다. 그래서 개발 서버·Docker·Pages가 **같은 `config.mts`**를 씁니다. `deploy.yml` 31~32줄이 Actions에서 저장소 이름으로 `WIKI_BASE`를 채웁니다(이 표현식은 GitHub의 `github.event.repository.name` 값으로 `/ts-wiki/`를 만듭니다).
- **목록 데이터는 `curriculum.mts`에, 화면 규칙은 `config.mts`에** 있습니다. 레슨 하나를 추가해도 `config.mts`는 고치지 않습니다([4-4](./04-curriculum)).
- **설정 두 개는 다른 파일과 짝을 이룹니다.** 25줄 `cleanUrls` ↔ `nginx.conf` 9줄 `try_files`, 26줄 `lastUpdated` ↔ `deploy.yml` 24줄 `fetch-depth: 0`. 이런 짝을 잊지 않도록 짝이 되는 파일 쪽에 주석을 달아 두었습니다(`nginx.conf` 7줄, `deploy.yml` 24줄).
- 이 가이드(wiki-server-guide)의 `config.mts`도 1~34줄이 거의 같습니다. 두 파일을 나란히 열어 비교해 보면 "프로젝트마다 바뀌는 곳"(제목, nav, editLink 주소)과 "그대로 가져다 쓰는 곳"이 구분됩니다.

## 자주 하는 실수

### 1. Pages에 올렸더니 화면이 깨지고 CSS가 없음

- **증상**: `https://<사용자>.github.io/<저장소>/`에 글자만 나오고 스타일이 없습니다. 개발자 도구에 `/assets/...` 파일이 404로 보입니다.
- **원인**: base가 `/`인 채로 빌드해서, 스타일 파일을 저장소 이름 없는 주소에서 찾고 있습니다.
- **해결**: Pages용 빌드에서 `WIKI_BASE=/<저장소>/`를 넣었는지 확인합니다. 앞뒤 슬래시 둘 다 필요합니다.

### 2. `(!) "base" option should start with a slash.`

- **증상**: 빌드 때 위 경고가 나오고, 결과 HTML에 `C:/Program Files/Git/...` 같은 경로가 보입니다.
- **원인**: Git Bash가 `/ts-wiki/`를 Windows 경로로 바꿨거나, 실제로 슬래시 없이 `ts-wiki/`라고 썼습니다.
- **해결**: Git Bash에서는 `MSYS_NO_PATHCONV=1`을 앞에 붙이거나 PowerShell에서 `$env:WIKI_BASE = '/ts-wiki/'`로 넣습니다.

### 3. Docker로 띄운 위키에서 새로 고침하면 404

- **증상**: 홈에서 레슨으로 이동하는 것은 되는데, 레슨 페이지에서 `F5`를 누르면 nginx 404 화면이 나옵니다.
- **원인**: `cleanUrls: true`인데 nginx 설정에 `$uri.html`이 빠졌습니다.
- **해결**: `try_files $uri $uri.html $uri/ =404;`인지 확인합니다.

### 4. 모든 페이지의 "마지막 수정" 날짜가 같음 / 아예 안 나옴

- **증상**: Pages의 모든 페이지가 같은 날짜이거나, 날짜 줄이 없습니다.
- **원인**: Actions의 checkout에 `fetch-depth: 0`이 없어서 이력이 1개뿐이거나, `.git` 없는 폴더에서 빌드했습니다.
- **해결**: `deploy.yml`에 `fetch-depth: 0`을 넣습니다. Docker 빌드처럼 `.git`을 빼는 환경에서는 날짜가 안 나오는 것이 정상입니다.

### 5. 설정을 고쳤는데 개발 서버에 반영이 안 됨

- **증상**: `config.mts`를 저장했는데 화면이 그대로입니다.
- **원인**: 설정 파일이나 거기서 불러온 파일이 바뀌면 VitePress가 서버를 다시 시작하는데, 문법 오류가 있으면 재시작에 실패하고 예전 화면이 남습니다.
- **해결**: 개발 서버를 띄운 터미널에 빨간 오류가 있는지 봅니다. 그래도 안 되면 `Ctrl+C`로 끄고 `npm run dev`를 다시 실행합니다.

## 직접 해 보기

모든 실습은 [Part 4 소개](./)에서 만든 복사본(`ts-wiki-lab`)에서 합니다.

### 과제 1 ⭐ 문구 바꾸기

`docFooter`를 `{ prev: '← 이전', next: '다음 →' }`로 바꾸고 개발 서버에서 레슨 맨 아래를 확인하세요.

::: details 정답 보기
71줄을 고치고 저장하면 개발 서버가 재시작하며 반영됩니다. 레슨 페이지 맨 아래 버튼의 작은 글씨가 바뀌면 성공입니다.
:::

### 과제 2 ⭐⭐ 모든 파트 펼치기

모든 파트가 펼쳐진 채로 시작하게 하려면 몇 번째 줄을 어떻게 바꾸나요? 반대로, 지금 보고 있는 파트만 펼쳐지게 하려면요?

::: details 정답 보기
10줄을 `collapsed: false`로 바꿉니다. `collapsed` 속성을 아예 지우면 **접기 버튼 자체가 없는** 묶음이 됩니다(공식 문서 기준: `collapsed`가 있어야 접을 수 있음). 현재 파트만 펼치는 기능은 기본 테마에서 현재 페이지가 들어 있는 묶음을 자동으로 펼쳐 주므로, 모두 `true`로 두면 비슷한 효과가 납니다. 실제로 바꿔 보고 확인하세요.
:::

### 과제 3 ⭐⭐ cleanUrls 실험 재현

5단계처럼 `cleanUrls: false`로 빌드하고, `dist/guide/toc.html`에서 링크가 `.html`로 끝나는지 확인하세요.

::: details 정답 보기
```bash
grep -o 'href="[^"]*roadmap[^"]*"' docs/.vitepress/dist/guide/toc.html | sort | uniq -c
```

`3 href="/guide/roadmap.html"`이 나오면 성공입니다(작성 시점 실측). 실험이 끝나면 `true`로 되돌립니다.
:::

### 과제 4 ⭐⭐⭐ 내 저장소용 editLink

내 GitHub 아이디가 `<사용자>`, 저장소가 `my-wiki`, 기본 브랜치가 `master`, 마크다운이 `content/` 폴더에 있다면 `editLink.pattern`을 어떻게 써야 하나요?

::: details 정답 보기
```ts
pattern: 'https://github.com/<사용자>/my-wiki/edit/master/content/:path',
```

`:path`는 사이트 뿌리 폴더(`content`) 기준 경로이므로, 저장소 안의 위치를 맞추려면 `content/`를 앞에 붙여야 합니다.
:::

## 확인 퀴즈

1. `process.env.WIKI_BASE ?? '/'`에서 `WIKI_BASE`가 없으면 base는 무엇이 되나요?
2. base를 `/ts-wiki/`로 바꾸면 `dist` 폴더 안의 파일 위치도 바뀌나요?
3. 27줄 `head`에만 `${base}`를 직접 붙인 이유는?
4. `cleanUrls: true`일 때 nginx가 해 줘야 하는 일은?
5. `fetch-depth: 0`이 없으면 lastUpdated는 어떻게 보이나요?

::: details 정답 보기
1. `/`
2. 바뀌지 않습니다. HTML 안의 링크 주소만 바뀝니다.
3. `head`의 내용은 VitePress가 그대로 HTML에 넣고 base를 자동으로 붙이지 않기 때문입니다.
4. `/guide/roadmap` 요청에 `/guide/roadmap.html` 파일을 찾아 보내는 일(`try_files`의 `$uri.html`).
5. 이력이 최신 커밋 하나뿐이라 모든 페이지가 같은 날짜(마지막 커밋 시각)로 보입니다.
:::

## 정리

- `config.mts`는 불러오기(1~2줄) → 준비 계산(4~18줄) → 사이트 설정(20~34줄) → 테마 설정(35~82줄)으로 나뉩니다.
- `base`는 환경 변수 `WIKI_BASE`로 받아, 같은 소스를 `/`(Docker)와 `/ts-wiki/`(Pages)로 빌드합니다. base는 링크만 바꾸고 파일 위치는 바꾸지 않습니다.
- 사이드바는 `curriculum.map`과 삼항 연산자·템플릿 리터럴·스프레드로 자동 생성됩니다.
- `cleanUrls`는 nginx `try_files`와, `lastUpdated`는 Actions `fetch-depth: 0`과 짝입니다. 한쪽만 바꾸면 깨집니다.
- `themeConfig`의 한국어 문구, 검색 번역, editLink는 기본 테마의 영어 문구를 하나씩 바꾼 것입니다.

## 다음 단계

[단일 출처 설계: curriculum.mts](./04-curriculum)에서 사이드바·목차·체크리스트가 모두 읽는 레슨 목록 파일을 해부하고, 레슨을 하나 추가해 봅니다.
