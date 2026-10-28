---
title: 내비게이션 · 사이드바 · 검색
---

# 내비게이션 · 사이드바 · 검색

<LessonMeta level="중급" :minutes="45" prev="레슨 페이지와 홈 화면을 만들고, dead link가 빌드를 막는 것을 확인했다" />

## 이번에 배울 것

- `docs/.vitepress/config.mts`를 만들고 `defineConfig`로 사이트 설정을 쓸 수 있다.
- 상단 메뉴(nav)와 왼쪽 사이드바(sidebar)를 손으로 적어 만들 수 있다.
- 오른쪽 목차(outline), 로컬 검색, 다크 모드 스위치의 문구를 한국어로 바꿀 수 있다.
- `cleanUrls`가 주소에서 `.html`을 없애는 원리를 설명할 수 있다.
- 설정 파일을 **처음 만들 때**와 **고칠 때** 개발 서버가 어떻게 다르게 반응하는지 안다.

## 먼저 알아 둘 것

- [첫 페이지와 홈 화면](./02-first-pages)까지 마친 `my-wiki`
- 설정 항목의 전체 뜻: [VitePress: 설정 · 라우팅 · 테마](../part3-libraries/01-vitepress)
- 검색이 동작하는 원리: [로컬 검색 (MiniSearch)](../part3-libraries/04-local-search)
- `.mts`를 TypeScript로 쓰는 이유: [설정과 컴포넌트를 왜 TypeScript로 쓰나](../part2-choices/04-why-typescript)

## 비유로 이해하기

지금까지 만든 위키는 **안내판 없는 건물**입니다. 방(페이지)은 있지만 방 번호(주소)를 외워야만 들어갈 수 있습니다.

- **config.mts**는 건물 관리 사무소의 **운영 규칙서**입니다. 건물 이름, 안내판 위치, 층별 안내도를 한 곳에 적습니다.
- **nav(상단 메뉴)** 는 로비의 큰 안내판: 자주 가는 곳 몇 군데만 적습니다.
- **sidebar(사이드바)** 는 층별 안내도: 모든 방을 순서대로 보여 줍니다.
- **outline(목차)** 은 방 문에 붙은 "이 방 안의 구역" 안내입니다.
- **검색**은 안내 데스크: 단어를 말하면 그 단어가 있는 방을 알려 줍니다.

규칙서는 관리 사무소(개발 서버)가 **문을 열 때 읽습니다**. 규칙서가 없을 때 문을 열었다면, 나중에 규칙서를 새로 가져다 놓아도 관리인이 모릅니다. 이것이 1단계에서 서버를 다시 켜는 이유입니다.

## 따라 하기

### 1단계. `config.mts` 만들기와 서버 재시작

`docs/.vitepress/` 폴더(5-1에서 `cache`와 함께 생긴 폴더) 안에 `config.mts` 파일을 만듭니다.

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ko-KR',
  title: '나의 학습 위키',
  description: '빈 폴더에서 시작해 만든 VitePress 위키',
})
```

| 줄 | 뜻 |
|---|---|
| `import { defineConfig } from 'vitepress'` | VitePress가 제공하는 도우미 함수를 가져옵니다. |
| `export default defineConfig({...})` | 이 파일의 대표 값(=설정 객체)을 내보냅니다. `defineConfig`는 값을 바꾸지 않고 그대로 돌려주지만, **편집기가 설정 항목 이름을 자동 완성하고 오타를 빨간 줄로 알려 주게** 합니다. |
| `lang: 'ko-KR'` | HTML의 언어를 한국어로 표시합니다(화면 읽기 프로그램·검색 엔진이 참고). |
| `title` | 왼쪽 위 사이트 이름이자, 브라우저 탭 제목에서 세로줄 기호 뒤에 붙는 이름입니다. |
| `description` | 검색 엔진에 보이는 사이트 설명(`meta description`)입니다. |

확장자 `.mts`는 "ESM 방식(`import`/`export`)으로 쓰는 TypeScript 파일"이라는 뜻입니다. VitePress는 이 파일을 직접 읽어 실행하므로 따로 컴파일할 필요가 없습니다.

::: warning 처음 만든 설정 파일은 서버를 껐다 켜야 읽힙니다
실제로 개발 서버를 켜 둔 채 `config.mts`를 **새로 만들면**, 터미널에 아무 반응이 없고 사이트 이름도 그대로 "VitePress"입니다. 서버가 시작할 때 설정 파일이 없었으므로 그 파일을 지켜보고 있지 않기 때문입니다.

서버 터미널에서 `Ctrl+C`로 끄고 다시 `npm run dev`를 실행합니다.
:::

```text
> my-wiki@1.0.0 dev
> vitepress dev docs --port 5190

Re-optimizing dependencies because vite config has changed

  vitepress v1.6.3

  ➜  Local:   http://localhost:5190/
  ➜  Network: use --host to expose
```

`Re-optimizing dependencies because vite config has changed`는 "설정이 바뀌었으니 미리 준비해 둔 파일(`cache`)을 다시 만든다"는 안내이며 오류가 아닙니다.

**확인 방법**: 아무 레슨 페이지나 열었을 때 왼쪽 위 이름이 **나의 학습 위키**로, 탭 제목이 **첫 레슨, 안녕 위키 | 나의 학습 위키**로 바뀌었으면 성공입니다.

### 2단계. 로고와 상단 메뉴(nav)

`defineConfig({...})` 안에 `themeConfig`를 추가합니다. `themeConfig`는 **기본 테마의 화면 구성**(메뉴·사이드바·문구)을 정하는 칸이고, 바깥쪽 `title`·`lang` 같은 항목은 **사이트 전체** 설정입니다.

```ts
export default defineConfig({
  lang: 'ko-KR',
  title: '나의 학습 위키',
  description: '빈 폴더에서 시작해 만든 VitePress 위키',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '홈', link: '/' },
      { text: '첫 레슨', link: '/part1-basics/01-hello' },
    ],
  },
})
```

- `logo: '/logo.svg'` — 5-2에서 `docs/public/`에 넣은 그림이 사이트 이름 왼쪽에 붙습니다.
- `nav`는 배열(`[ ]`, 여러 개를 순서대로 담는 상자)이고, 항목마다 `text`(보이는 글자)와 `link`(주소)를 씁니다. 주소는 `docs/` 기준 절대 경로이고 `.md`는 생략합니다.

저장하면 이번에는 서버가 스스로 다시 시작합니다. 실제 터미널 출력:

```text
AM 9:08:57 [vitepress] docs\.vitepress\config.mts changed, restarting server...


  vitepress v1.6.3

  ➜  Local:   http://localhost:5190/
```

1단계와 달리 서버를 켤 때부터 있던 파일이라 변경을 감지한 것입니다.

**확인 방법**: 화면 오른쪽 위에 **홈**, **첫 레슨** 두 메뉴가 보이고, 사이트 이름 왼쪽에 W 로고가 붙으면 성공입니다. 지금 보고 있는 페이지의 메뉴는 브랜드 색으로 강조됩니다.

### 3단계. 사이드바(sidebar) 손으로 적기

`themeConfig` 안, `nav` 아래에 `sidebar`를 추가합니다.

```ts
    sidebar: [
      {
        text: 'Part 1. 기초',
        items: [
          { text: '1-1. 첫 레슨, 안녕 위키', link: '/part1-basics/01-hello' },
          { text: '1-2. 마크다운 기본 문법', link: '/part1-basics/02-markdown' },
        ],
      },
    ],
```

- 바깥 배열의 항목 하나가 **묶음(그룹)** 하나입니다. `text`는 묶음 제목, `items`는 그 안의 링크 목록입니다.
- 링크 순서가 곧 사이드바 순서이고, 페이지 아래쪽 **이전/다음** 버튼의 순서이기도 합니다.

**확인 방법**: 레슨 페이지 왼쪽에 **Part 1. 기초** 묶음과 레슨 두 개가 보이고, 지금 보고 있는 레슨이 브랜드 색으로 강조되면 성공입니다. 본문 맨 아래에는 다음 레슨으로 가는 버튼(지금은 영어로 `Next page`)이 생깁니다. 이 문구는 5단계에서 바꿉니다.

::: info 홈 화면에는 사이드바가 없습니다
`layout: home`인 `docs/index.md`는 사이드바 없이 넓게 보이는 것이 정상입니다.
:::

### 4단계. 로컬 검색 켜고 한국어로 바꾸기

`themeConfig` 안에 `search`를 추가합니다.

```ts
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

- `provider: 'local'` — 외부 검색 서비스 없이 **빌드할 때 모든 페이지의 글자를 모아 색인(index)을 만들고**, 브라우저 안에서 그 색인을 뒤집니다. 서버가 따로 필요 없어 정적 사이트와 잘 맞습니다. 이 기능 하나 때문에 따로 설치할 패키지는 없습니다(VitePress에 MiniSearch가 들어 있습니다).
- `translations` — 검색 버튼과 검색 창의 영어 문구를 바꿉니다. `button`은 상단 검색 버튼, `modal`은 눌렀을 때 뜨는 창입니다.

**확인 방법**:

1. 상단에 **검색** 버튼과 `Ctrl K` 표시가 보입니다.
2. `Ctrl+K`(macOS는 `Cmd+K`)를 누르고 **마크다운**을 입력하면 `마크다운 기본 문법`, `마크다운 기본 문법 > 표`, `마크다운 기본 문법 > 코드 블록`처럼 **페이지와 소제목 단위** 결과가 뜹니다.
3. 창 아래쪽 안내가 **이동 · 선택 · 닫기**로 보이면 성공입니다.

검색 결과가 소제목(`##`) 단위로 나오는 이유는, 색인을 만들 때 페이지를 제목 기준 구역으로 잘라 저장하기 때문입니다. 제목을 잘 나눠 쓰면 검색도 정확해집니다.

### 5단계. 목차·페이지 이동·다크 모드 문구, 그리고 cleanUrls

마지막으로 나머지 한국어 문구와 `cleanUrls`를 추가합니다. `cleanUrls`는 `themeConfig` **바깥**(사이트 설정)에, 나머지는 `themeConfig` **안**에 씁니다.

```ts
  cleanUrls: true,
  themeConfig: {
    // ... logo, nav, sidebar, search ...
    outline: { level: [2, 3], label: '이 페이지 목차' },
    docFooter: { prev: '이전 레슨', next: '다음 레슨' },
    darkModeSwitchLabel: '다크 모드',
    sidebarMenuLabel: '메뉴',
    returnToTopLabel: '맨 위로',
  },
```

| 설정 | 하는 일 |
|---|---|
| `outline.level: [2, 3]` | 오른쪽 목차에 `##`(2단계)와 `###`(3단계) 제목을 보여 줍니다. 기본값은 `##`만입니다. |
| `outline.label` | 목차 제목(기본 `On this page`) |
| `docFooter` | 본문 아래 이전/다음 버튼 문구(기본 `Previous page` / `Next page`) |
| `darkModeSwitchLabel` | 좁은 화면 메뉴 안의 다크 모드 항목 이름(기본 `Appearance`) |
| `sidebarMenuLabel` | 좁은 화면에서 사이드바를 여는 버튼 이름(기본 `Menu`) |
| `returnToTopLabel` | 좁은 화면에서 맨 위로 가는 버튼 이름(기본 `Return to top`) |
| `cleanUrls: true` | 링크 주소에서 `.html`을 뺍니다. |

**cleanUrls 확인**: 5-2에서 빌드했을 때 `01-hello.html` 안의 링크는 `href="./02-markdown.html"`이었습니다. `cleanUrls: true`를 넣고 다시 빌드하면 실제로 `href="./02-markdown"`으로 바뀝니다. 주소창에 `.html`이 보이지 않아 깔끔하고, 나중에 다른 도구로 옮겨도 주소가 바뀌지 않습니다. 다만 **배포하는 웹 서버가 `/02-markdown` 요청에 `02-markdown.html`을 돌려주도록** 설정되어 있어야 합니다. GitHub Pages와 VitePress `preview`는 그렇게 동작하고, nginx는 설정이 필요합니다([Docker 이미지로 묶기](../part6-serve/03-docker-nginx)에서 다룹니다).

**다크 모드 확인**: 상단 오른쪽의 동그란 스위치를 누르면 화면이 어두워집니다. 이때 브라우저 개발자 도구(F12)로 보면

- `html` 태그에 `class="dark"`가 붙고,
- localStorage(브라우저가 사이트별로 값을 저장하는 작은 저장소)에 `vitepress-theme-appearance` = `dark`가 저장됩니다(실제로 확인한 값).

그래서 새로 고침해도 어두운 화면이 유지됩니다. 다크 모드 스위치는 설정하지 않아도 기본으로 켜져 있습니다. 끄거나 처음부터 어둡게 시작하려면 사이트 설정의 `appearance`를 씁니다(`false`, `'dark'` 등. VitePress 1.6.3 타입 정의 기준). 5-5에서는 `.dark` 클래스를 이용해 다크 모드일 때의 색을 따로 정합니다.

::: tip 스위치에 마우스를 올리면 영어가 보입니다
스위치의 툴팁(`Switch to dark theme` / `Switch to light theme`)은 `darkModeSwitchTitle`, `lightModeSwitchTitle`로 따로 바꿉니다. ts-wiki는 이 두 항목은 기본값 그대로 둡니다.
:::

**확인 방법**:

- 레슨 페이지 오른쪽에 **이 페이지 목차**가 보이고 `##` 제목들이 나열됩니다.
- 본문 아래 버튼이 **다음 레슨 / 이전 레슨**으로 바뀝니다.
- 다크 모드 스위치를 눌렀다가 새로 고침해도 어두운 상태가 유지됩니다.
- 브라우저 창을 좁게 줄이면 왼쪽 위에 **메뉴** 버튼이 생깁니다.

### 6단계. 메뉴 하나 더 추가해 보기

설정 파일은 서버가 지켜보고 있으므로, 이제 고칠 때마다 자동으로 반영됩니다. `nav`에 한 줄을 추가합니다.

```ts
    nav: [
      { text: '홈', link: '/' },
      { text: '첫 레슨', link: '/part1-basics/01-hello' },
      { text: '마크다운 문법', link: '/part1-basics/02-markdown' },
    ],
```

**확인 방법**: 저장 후 몇 초 안에 터미널에 `config.mts changed, restarting server...`가 찍히고, 브라우저를 새로 고치면 메뉴가 세 개로 늘어나 있으면 성공입니다.

### 7단계(선택). 타입 검사로 오타 잡기

`defineConfig` 덕분에 VS Code는 `cleanUrl`(s 빠짐) 같은 오타에 빨간 줄을 긋습니다. 터미널에서 직접 검사하려면 이미 설치한 TypeScript로 이렇게 실행합니다.

```bash
npx tsc --noEmit --strict --module nodenext --moduleResolution nodenext --target es2022 --skipLibCheck docs/.vitepress/config.mts
```

아무것도 출력되지 않고 끝나면 통과입니다(실제로 통과 확인). `--noEmit`은 "검사만 하고 `.js` 파일은 만들지 마"라는 뜻입니다. VitePress는 실행할 때 타입을 검사하지 **않으므로**, 타입이 틀려도 서버는 뜰 수 있습니다. 이상한 동작이 있을 때 한 번씩 돌려 보면 좋습니다.

### 이 단계까지의 전체 파일 상태

`docs/.vitepress/config.mts` 전체:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ko-KR',
  title: '나의 학습 위키',
  description: '빈 폴더에서 시작해 만든 VitePress 위키',
  cleanUrls: true,
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '홈', link: '/' },
      { text: '첫 레슨', link: '/part1-basics/01-hello' },
      { text: '마크다운 문법', link: '/part1-basics/02-markdown' },
    ],
    sidebar: [
      {
        text: 'Part 1. 기초',
        items: [
          { text: '1-1. 첫 레슨, 안녕 위키', link: '/part1-basics/01-hello' },
          { text: '1-2. 마크다운 기본 문법', link: '/part1-basics/02-markdown' },
        ],
      },
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
    darkModeSwitchLabel: '다크 모드',
    sidebarMenuLabel: '메뉴',
    returnToTopLabel: '맨 위로',
  },
})
```

폴더 구조:

```text
my-wiki/
├─ package.json
├─ package-lock.json
└─ docs/
   ├─ index.md
   ├─ part1-basics/
   │  ├─ 01-hello.md
   │  ├─ 02-markdown.md
   │  └─ 03-frontmatter.md     ← 5-2 과제 1에서 만들었다면 (아직 사이드바에는 없음)
   ├─ public/
   │  └─ logo.svg
   └─ .vitepress/
      ├─ config.mts            ← 새로 생김
      ├─ cache/
      └─ dist/
```

## ts-wiki에서는

ts-wiki의 `docs/.vitepress/config.mts`(83줄)에서 이 레슨과 같은 부분을 찾아봅니다.

- **1줄** `import { defineConfig, type DefaultTheme } from 'vitepress'` — 우리는 아직 `defineConfig`만 가져왔습니다. `DefaultTheme`(사이드바 항목의 타입)는 다음 레슨에서 씁니다.
- **21~25줄** `lang: 'ko-KR'`, `title: 'TypeScript 마스터 위키'`, `description`, `base`, `cleanUrls: true` — `base`를 뺀 나머지는 같습니다. `base`는 5-6에서 추가합니다.
- **36~42줄** `logo: '/favicon.svg'`와 `nav` 네 개(학습 가이드 · 전체 목차 · 12주 학습 계획 · 치트시트).
- **43~56줄** `sidebar` — 맨 앞 "학습 가이드" 묶음은 우리처럼 손으로 적었고, 55줄 `...curriculumSidebar`로 나머지 파트를 붙입니다. 이 부분이 다음 레슨의 주제입니다.
- **57~71줄, 73~75줄** `outline`, `search`의 `translations`, `docFooter`, `darkModeSwitchLabel`, `sidebarMenuLabel`, `returnToTopLabel` — 이 레슨에서 쓴 값과 **글자 하나까지 같습니다**(`docFooter`도 `'이전 레슨'`, `'다음 레슨'`).
- 우리가 아직 쓰지 않은 것: `lastUpdated`(마지막 수정 시각, git 기록을 읽음), `markdown.lineNumbers`(코드 블록 줄 번호), `editLink`(GitHub에서 고치기 링크), `socialLinks`, `footer`, `vite.build.chunkSizeWarningLimit`. 각 줄의 뜻은 [config.mts 한 줄씩 읽기](../part4-anatomy/03-config)에 있습니다.

## 자주 하는 실수

**1. `config.mts`를 만들었는데 아무것도 안 바뀜**

- 원인: 서버를 켠 뒤에 설정 파일을 **처음** 만들었습니다. 시작할 때 없던 파일은 감시 대상이 아닙니다.
- 해결: `Ctrl+C`로 끄고 `npm run dev`를 다시 실행합니다. 그다음부터는 고칠 때마다 자동으로 재시작됩니다.

**2. `X [ERROR] Expected "}" but found "themeConfig"` 같은 오류로 서버가 안 뜸**

- 원인: 객체 항목 사이 쉼표가 빠졌습니다. 예: `cleanUrls: true` 뒤에 쉼표 없이 다음 줄 `themeConfig:`가 옴. 메시지 아래에 `docs/.vitepress/config.mts:줄:칸`과 해당 줄이 표시됩니다.
- 해결: 표시된 줄 **바로 앞 줄** 끝에 쉼표를 붙입니다. 오류 위치는 "여기서 이상한 것을 발견했다"는 곳이라, 실제 빠진 쉼표는 한 줄 위에 있는 경우가 많습니다.

**3. 사이드바 링크를 눌렀는데 404**

- 원인: `link`에 `.md`를 붙였거나(`/part1-basics/01-hello.md`), 폴더 이름을 틀렸습니다. 사이드바 링크는 **빌드의 dead link 검사 대상이 아니라서** 빌드가 성공해도 틀린 링크가 남을 수 있습니다(5-4에서 실제로 확인합니다).
- 해결: `.md` 없이, `docs/` 기준 절대 경로(`/`로 시작)로 씁니다. 사이드바를 고친 뒤에는 항목을 하나씩 눌러 봅니다.

**4. `nav`나 `sidebar`를 썼는데 화면에 안 나옴**

- 원인: `themeConfig` **바깥**(사이트 설정 쪽)에 썼습니다. 반대로 `cleanUrls`를 `themeConfig` 안에 쓰면 동작하지 않습니다.
- 해결: 화면 구성(nav·sidebar·search·outline·문구)은 `themeConfig` 안, 사이트 전체 설정(lang·title·cleanUrls·base)은 바깥입니다. `defineConfig`를 썼다면 VS Code가 잘못된 위치에 빨간 줄을 그어 줍니다.

**5. `Re-optimizing dependencies because vite config has changed`가 떠서 오류인 줄 앎**

- 원인: 오류가 아닙니다. 설정이 바뀌어 개발 서버가 미리 묶어 둔 라이브러리 파일(`docs/.vitepress/cache`)을 다시 만든다는 안내입니다. 이때 첫 페이지 열기가 몇 초 느려질 수 있습니다.
- 해결: 아래에 `Local: http://localhost:5190/`이 이어서 나오면 정상입니다. 빨간 글씨나 `ERROR`, `failed`가 없는지만 봅니다.

## 직접 해 보기

**과제 1 ⭐** — 사이드바의 **Part 1. 기초** 묶음에 `collapsed: false`를 추가해 보세요. 무엇이 생기나요? `true`로 바꾸면요?

::: details 정답 보기
`collapsed`를 쓰면 묶음 제목 옆에 접기 화살표가 생깁니다. `false`는 펼친 채로 시작, `true`는 접힌 채로 시작합니다. 쓰지 않으면 접기 기능 자체가 없습니다.
:::

**과제 2 ⭐** — `nav`에 외부 링크 `{ text: 'VitePress 공식 문서', link: 'https://vitepress.dev/' }`를 추가해 보세요. 내부 링크와 무엇이 다른가요?

::: details 정답 보기
글자 옆에 바깥으로 나가는 화살표 아이콘이 붙고 새 탭에서 열립니다. VitePress 1.6.3의 링크 컴포넌트(`VPLink.vue`)가 외부 주소를 구분해 `target="_blank"`를 붙이기 때문입니다.
:::

**과제 3 ⭐⭐** — `outline.level`을 `'deep'`으로 바꾸고, `02-markdown.md`에 `####` 제목을 하나 추가해 목차에 어떻게 나오는지 보세요. 확인 후 `[2, 3]`으로 되돌립니다.

::: details 힌트
`'deep'`은 `##`부터 `######`까지 모두 보여 줍니다. 목차가 너무 길어지는 문제가 있어 ts-wiki는 `[2, 3]`을 씁니다.
:::

**과제 4 ⭐⭐** — `config.mts`에서 일부러 쉼표 하나를 지워 서버 오류를 내고, 오류 메시지에서 파일 이름과 줄 번호를 찾아 고쳐 보세요.

::: details 힌트
오류 메시지의 `docs/.vitepress/config.mts:26:2` 같은 부분이 "26번째 줄 2번째 칸"이라는 뜻입니다. 빠진 쉼표는 대개 그 바로 윗줄 끝에 있습니다.
:::

**과제 5 ⭐⭐⭐** — 다크 모드 스위치를 숨기고 항상 밝은 화면으로 보이게 하려면 어느 설정을 어떻게 바꾸나요? 해 본 뒤 되돌리세요.

::: details 정답 보기
사이트 설정(`themeConfig` 바깥)에 `appearance: false`를 추가합니다. 스위치가 사라지고 밝은 화면만 쓰입니다. 이미 `vitepress-theme-appearance`가 저장된 브라우저에서 확인할 때는 새로 고침을 해 봅니다.
:::

## 확인 퀴즈

**1.** `defineConfig`는 설정 값을 바꾸나요? 그럼 왜 쓰나요?

::: details 정답 보기
바꾸지 않고 그대로 돌려줍니다. 편집기가 설정 항목의 이름과 타입을 알게 되어 자동 완성과 오타 표시를 해 주기 때문에 씁니다.
:::

**2.** `cleanUrls`와 `nav` 중 `themeConfig` 안에 써야 하는 것은?

::: details 정답 보기
`nav`입니다. `nav`는 기본 테마의 화면 구성이고, `cleanUrls`는 사이트 전체(주소 규칙) 설정이라 바깥에 씁니다.
:::

**3.** `provider: 'local'` 검색은 검색할 때 서버에 질문을 보내나요?

::: details 정답 보기
아닙니다. 빌드(또는 개발 서버) 때 만든 색인 파일을 브라우저가 받아 와서 브라우저 안에서 찾습니다. 그래서 정적 파일만 올리는 GitHub Pages에서도 동작합니다.
:::

**4.** 다크 모드를 켠 뒤 새로 고침해도 유지되는 이유는?

::: details 정답 보기
선택한 값이 브라우저 localStorage의 `vitepress-theme-appearance` 키에 저장되고, 페이지가 열릴 때 그 값을 읽어 `html`에 `dark` 클래스를 붙이기 때문입니다.
:::

## 정리

- 사이트 설정은 `docs/.vitepress/config.mts`에 `export default defineConfig({...})`로 씁니다.
- 처음 만든 설정 파일은 서버를 다시 켜야 읽히고, 그 뒤로는 저장할 때마다 자동 재시작됩니다.
- `themeConfig` 안에 `logo`·`nav`·`sidebar`·`outline`·`search`·각종 한국어 문구를 씁니다.
- `search.provider: 'local'`은 별도 서버 없이 브라우저 안에서 검색합니다.
- `cleanUrls: true`는 링크에서 `.html`을 빼고, 다크 모드는 `html.dark` 클래스와 localStorage로 동작합니다.
- 지금의 사이드바는 레슨을 추가할 때마다 손으로 고쳐야 합니다. 다음 레슨에서 이 수고를 없앱니다.

## 다음 단계

[커리큘럼 파일로 사이드바 자동 생성](./04-curriculum-sidebar) — 레슨 목록을 `curriculum.mts` 한 파일에 모으고, `map`으로 사이드바를 만들어 레슨 추가를 한 줄 수정으로 끝냅니다.
