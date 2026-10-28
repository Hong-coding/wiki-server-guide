---
title: 커리큘럼 파일로 사이드바 자동 생성
---

# 커리큘럼 파일로 사이드바 자동 생성

<LessonMeta level="중급" :minutes="50" prev="config.mts로 메뉴·손으로 적은 사이드바·검색·한국어 문구를 갖췄다" />

## 이번에 배울 것

- 레슨 목록을 `curriculum.mts` 한 파일에 **데이터**로 정의하고, 그 모양을 `interface`로 정할 수 있다.
- `config.mts`에서 `import`와 `map`으로 커리큘럼 데이터를 사이드바 형식으로 바꿀 수 있다.
- 레슨 하나를 추가할 때 **한 줄**만 고치면 사이드바·번호·이전/다음 버튼이 모두 따라오는 것을 확인할 수 있다.
- 파트 소개 페이지(`partN-xxx/index.md`)를 만들고, 사이드바 링크는 빌드가 검사해 주지 않는다는 점을 안다.

## 먼저 알아 둘 것

- [내비게이션 · 사이드바 · 검색](./03-nav-sidebar-search)까지 마친 `my-wiki`
- 단일 출처 설계의 배경: [단일 출처 설계: curriculum.mts](../part4-anatomy/04-curriculum)
- 배열·객체·`map`이 낯설다면 위 레슨의 설명을 먼저 읽습니다. 이 레슨에서도 필요한 만큼 다시 풀어 씁니다.

## 비유로 이해하기

학교의 **시간표 원본**을 떠올려 봅시다.

- 지난 레슨의 사이드바는 각 교실 문에 시간표를 **손으로 베껴 붙인** 것과 같습니다. 과목이 하나 바뀌면 모든 문을 돌아다니며 고쳐야 하고, 한 군데라도 빠뜨리면 서로 다른 시간표가 붙어 있게 됩니다.
- 이번 레슨에서는 교무실에 **원본 시간표 한 장**(`curriculum.mts`)만 두고, 각 교실 시간표는 그 원본을 **복사기**(`map`)로 뽑아 붙입니다. 원본만 고치면 모든 사본이 같이 바뀝니다.
- 원본 양식(`interface`)도 정해 둡니다. "과목마다 이름·시간이 꼭 있어야 한다"는 양식이 있으면, 시간 칸을 비워 둔 채 제출하는 실수를 TypeScript가 잡아 줍니다.

이렇게 "같은 정보는 한 곳에만 두고, 나머지는 거기서 만들어 쓴다"는 원칙을 **단일 출처(single source of truth)** 라고 합니다.

## 따라 하기

개발 서버(`npm run dev`)를 켜 둔 채 진행합니다.

### 1단계. `curriculum.mts` 만들기

`docs/.vitepress/curriculum.mts`를 새로 만듭니다.

```ts
// 커리큘럼 단일 정의 파일
// 사이드바·파트 소개·진도 체크리스트가 모두 이 파일을 기준으로 만들어지므로, 레슨을 추가·이동할 때는 여기만 고칩니다.

export interface Lesson {
  /** 파일 이름(확장자 제외). 예: '01-hello' */
  slug: string
  title: string
  /** 예상 학습 시간(분) */
  minutes: number
}

export interface Part {
  /** 폴더 이름. 예: 'part1-basics' */
  dir: string
  no: number
  title: string
  /** 이 파트를 마치면 할 수 있게 되는 것 */
  goal: string
  lessons: Lesson[]
}

export const curriculum: Part[] = [
  {
    dir: 'part1-basics',
    no: 1,
    title: '기초',
    goal: '마크다운으로 페이지를 쓰고 서로 링크할 수 있다.',
    lessons: [
      { slug: '01-hello', title: '첫 레슨, 안녕 위키', minutes: 10 },
      { slug: '02-markdown', title: '마크다운 기본 문법', minutes: 20 },
    ],
  },
]
```

위에서부터 읽어 봅니다.

- **`interface Lesson`** — "레슨 하나는 `slug`(문자열), `title`(문자열), `minutes`(숫자)를 **반드시** 가진다"는 양식입니다. `slug`는 파일 이름에서 `.md`를 뺀 것이고, 주소의 마지막 부분이 됩니다.
- **`interface Part`** — 파트 하나의 양식입니다. `dir`(폴더 이름), `no`(파트 번호), `title`, `goal`, 그리고 `lessons: Lesson[]`(레슨 양식을 따르는 것들의 배열).
- **`/** ... */`** — 문서 주석입니다. VS Code에서 `slug`에 마우스를 올리면 이 설명이 뜹니다.
- **`export const curriculum: Part[]`** — 실제 데이터입니다. `: Part[]`는 "이 배열의 모든 항목은 `Part` 양식을 따라야 한다"는 표시입니다. `export`가 붙어 있어 다른 파일에서 가져다 쓸 수 있습니다.

이 파일은 **사이드바를 어떻게 그릴지는 전혀 모릅니다**. 순수하게 "어떤 파트에 어떤 레슨이 어떤 순서로 있는가"만 적은 데이터입니다. 그래서 사이드바뿐 아니라 파트 소개 목록, 진도 체크리스트(5-5)도 이 데이터 하나로 만들 수 있습니다.

**확인 방법**: 저장해도 화면은 아직 그대로입니다(아무도 이 파일을 쓰지 않으므로). VS Code에서 `minutes: 10`을 지워 보면 `lessons` 줄에 빨간 줄이 생기는지 확인하고 되돌립니다.

### 2단계. `config.mts`에서 사이드바를 만들어 내기

`docs/.vitepress/config.mts`의 맨 위(첫 줄 `import`부터 `export default` 바로 앞까지)를 아래처럼 바꿉니다.

```ts
import { defineConfig, type DefaultTheme } from 'vitepress'
import { curriculum } from './curriculum.mts'

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
```

그리고 `themeConfig` 안의 손으로 적은 `sidebar: [ ... ],` 덩어리 전체를 한 줄로 바꿉니다.

```ts
    sidebar: curriculumSidebar,
```

한 조각씩 풀어 봅니다.

| 조각 | 뜻 |
|---|---|
| `type DefaultTheme` | 기본 테마가 쓰는 타입 묶음. `type`을 붙이면 "값이 아니라 타입만 가져온다"는 표시입니다. |
| `import { curriculum } from './curriculum.mts'` | 1단계 데이터를 가져옵니다. 같은 폴더라 `./`입니다. |
| `: DefaultTheme.SidebarItem[]` | 결과가 "사이드바 항목 배열" 모양이어야 한다고 못 박습니다. `item`을 `items`로 잘못 쓰면 바로 빨간 줄이 생깁니다. |
| `curriculum.map((part) => ({ ... }))` | `map`은 배열의 각 항목을 **같은 개수의 새 항목으로 바꾼** 배열을 돌려줍니다. 파트 1개 → 사이드바 묶음 1개. `=> ({`의 괄호는 "중괄호를 함수 본문이 아니라 객체로 읽어라"는 뜻입니다. |
| `` `Part ${part.no}. ${part.title}` `` | 템플릿 문자열. 백틱 안의 `${...}` 자리에 값이 들어가 `Part 1. 기초`가 됩니다. |
| `collapsed: false` | 접기 화살표를 달되 펼친 채로 시작합니다. |
| `items`의 첫 줄 `'파트 소개'` | 묶음 맨 위에 파트 소개 페이지(`/part1-basics/` 같은 폴더 주소) 링크를 고정으로 넣습니다. |
| `...part.lessons.map((lesson, i) => ...)` | 레슨마다 링크 하나를 만들고, `...`(펼치기)로 배열 안에 풀어 넣습니다. `i`는 0부터 세는 순번이라 `i + 1`로 1부터 표시합니다. |
| `` `${part.no}-${i + 1}. ${lesson.title}` `` | `1-1. 첫 레슨, 안녕 위키` 같은 번호 붙은 제목 |
| `` `/${part.dir}/${lesson.slug}` `` | `/part1-basics/01-hello` 같은 주소 |

저장하면 터미널에 `config.mts changed, restarting server...`가 찍힙니다.

**확인 방법**: 브라우저를 새로 고치면 사이드바가 이렇게 보이면 성공입니다.

```text
Part 1. 기초            (접기 화살표)
  파트 소개
  1-1. 첫 레슨, 안녕 위키
  1-2. 마크다운 기본 문법
```

지난 레슨과 다른 점은 맨 위 **파트 소개** 줄과 접기 화살표뿐입니다. 결과는 같은데 **만드는 방법**이 바뀌었습니다. 개발자 도구 콘솔에서 확인해 보면 링크 주소도 `/part1-basics/`, `/part1-basics/01-hello`, `/part1-basics/02-markdown`으로 생성된 것을 볼 수 있습니다.

### 3단계. 파트 소개 페이지 만들기

사이드바의 **파트 소개**를 눌러 보면 아직 404입니다. `docs/part1-basics/index.md`를 만듭니다.

```md
---
title: Part 1. 기초
---

# Part 1. 기초

마크다운으로 페이지를 쓰고, 페이지끼리 링크하는 법을 익힙니다.

- [1-1. 첫 레슨, 안녕 위키](./01-hello)
- [1-2. 마크다운 기본 문법](./02-markdown)
```

폴더의 `index.md`이므로 주소는 `/part1-basics/`입니다(5-2의 라우팅 규칙).

::: warning 사이드바 링크는 빌드가 검사하지 않습니다
이 파일을 만들기 **전에** `npm run build`를 해 보면, 사이드바의 `/part1-basics/` 링크가 없는 페이지를 가리키는데도 실제로 `build complete`로 성공합니다. 5-2에서 본 dead link 검사는 **마크다운 본문의 링크**만 봅니다. 설정 파일로 만든 링크(nav, sidebar)는 직접 눌러 확인해야 합니다. 그래서 `map`으로 주소를 **규칙적으로 만들어 내는** 방식이 손으로 적는 것보다 안전합니다.
:::

**확인 방법**: 사이드바의 **파트 소개**를 누르면 제목 **Part 1. 기초**와 레슨 링크 두 개가 보이고, 아래쪽 **다음 레슨** 버튼이 `1-1. 첫 레슨, 안녕 위키`를 가리키면 성공입니다.

### 4단계. 레슨 추가는 한 줄: `03-frontmatter`

5-2 과제 1에서 만든 `docs/part1-basics/03-frontmatter.md`가 있다면 그대로 쓰고, 없다면 지금 만듭니다.

```md
---
title: frontmatter로 페이지 정보 적기
---

# frontmatter로 페이지 정보 적기

파일 맨 위 `---` 두 줄 사이에 적는 내용을 frontmatter라고 합니다.

## title

브라우저 탭 제목이 됩니다.
```

이제 `curriculum.mts`의 `lessons` 배열에 **한 줄**만 추가합니다.

```ts
    lessons: [
      { slug: '01-hello', title: '첫 레슨, 안녕 위키', minutes: 10 },
      { slug: '02-markdown', title: '마크다운 기본 문법', minutes: 20 },
      { slug: '03-frontmatter', title: 'frontmatter로 페이지 정보 적기', minutes: 15 },
    ],
```

저장하면 터미널에 실제로 이런 줄이 찍힙니다. `curriculum.mts`는 `config.mts`가 가져다 쓰는 파일이라, 서버가 함께 지켜보고 있습니다.

```text
AM 9:13:11 [vitepress] docs\.vitepress\curriculum.mts changed, restarting server...
```

**확인 방법**: 새로 고침하면

- 사이드바에 **1-3. frontmatter로 페이지 정보 적기**가 생기고,
- `1-2` 페이지 아래쪽 **다음 레슨** 버튼이 `1-3`을 가리키면 성공입니다.

`config.mts`는 손대지 않았습니다. 번호(`1-3`)도 순서로 자동 계산됐습니다. 레슨 순서를 바꾸고 싶으면 배열 안의 줄 순서만 바꾸면 됩니다.

::: tip 파트 소개 목록은 아직 손으로 적은 것
`part1-basics/index.md`의 목록에는 `1-3`이 없습니다. 이 목록은 우리가 손으로 적었기 때문입니다. 5-5에서 `curriculum.mts`를 읽어 목록을 그리는 `PartLessons` 컴포넌트를 만들어 이 마지막 손 작업도 없앱니다.
:::

### 5단계. 파트 추가도 객체 하나: Part 2

`curriculum` 배열 끝(마지막 `]` 바로 앞)에 파트 하나를 추가합니다.

```ts
  {
    dir: 'part2-deploy',
    no: 2,
    title: '배포',
    goal: '만든 위키를 빌드해 다른 사람에게 보여 줄 수 있다.',
    lessons: [{ slug: '01-build', title: '빌드해 보기', minutes: 20 }],
  },
```

그리고 파일 두 개를 만듭니다.

`docs/part2-deploy/index.md`:

```md
---
title: Part 2. 배포
---

# Part 2. 배포

만든 위키를 빌드해 다른 사람에게 보여 주는 법을 익힙니다.
```

`docs/part2-deploy/01-build.md`:

```md
---
title: 빌드해 보기
---

# 빌드해 보기

`npm run build`를 실행하면 `docs/.vitepress/dist` 폴더에 HTML 파일이 생깁니다.
```

**확인 방법**: 사이드바에 **Part 2. 배포** 묶음이 생기고 그 안에 `파트 소개`, `2-1. 빌드해 보기`가 보이면 성공입니다. 실제로 생성된 사이드바 링크는 다음과 같았습니다.

```text
Part 1. 기초
  파트 소개                          /part1-basics/
  1-1. 첫 레슨, 안녕 위키            /part1-basics/01-hello
  1-2. 마크다운 기본 문법            /part1-basics/02-markdown
  1-3. frontmatter로 페이지 정보 적기 /part1-basics/03-frontmatter
Part 2. 배포
  파트 소개                          /part2-deploy/
  2-1. 빌드해 보기                   /part2-deploy/01-build
```

### 6단계. 타입이 잡아 주는 실수 확인

`Part 2`의 레슨에서 `minutes: 20`을 일부러 지우고 타입 검사를 해 봅니다. `config.mts`가 `.mts` 확장자를 붙여 `import`하므로 `--allowImportingTsExtensions`를 함께 줍니다.

```bash
npx tsc --noEmit --strict --module nodenext --moduleResolution nodenext --target es2022 --skipLibCheck --allowImportingTsExtensions docs/.vitepress/curriculum.mts
```

실제 출력:

```text
docs/.vitepress/curriculum.mts(39,15): error TS2741: Property 'minutes' is missing in type '{ slug: string; title: string; }' but required in type 'Lesson'.
```

"39번째 줄의 객체에 `Lesson` 양식이 요구하는 `minutes`가 없다"는 뜻입니다. VS Code에서는 저장하기 전부터 같은 위치에 빨간 줄이 보입니다. 개발 서버는 타입을 검사하지 않으므로 화면은 그대로 뜹니다. 그래서 **편집기의 빨간 줄**이 가장 빠른 경보입니다. `minutes: 20`을 되돌리고, 같은 명령으로 `config.mts`도 검사해 아무 출력 없이 끝나는지 확인합니다.

### 이 단계까지의 전체 파일 상태

`docs/.vitepress/curriculum.mts` 전체:

```ts
// 커리큘럼 단일 정의 파일
// 사이드바·파트 소개·진도 체크리스트가 모두 이 파일을 기준으로 만들어지므로, 레슨을 추가·이동할 때는 여기만 고칩니다.

export interface Lesson {
  /** 파일 이름(확장자 제외). 예: '01-hello' */
  slug: string
  title: string
  /** 예상 학습 시간(분) */
  minutes: number
}

export interface Part {
  /** 폴더 이름. 예: 'part1-basics' */
  dir: string
  no: number
  title: string
  /** 이 파트를 마치면 할 수 있게 되는 것 */
  goal: string
  lessons: Lesson[]
}

export const curriculum: Part[] = [
  {
    dir: 'part1-basics',
    no: 1,
    title: '기초',
    goal: '마크다운으로 페이지를 쓰고 서로 링크할 수 있다.',
    lessons: [
      { slug: '01-hello', title: '첫 레슨, 안녕 위키', minutes: 10 },
      { slug: '02-markdown', title: '마크다운 기본 문법', minutes: 20 },
      { slug: '03-frontmatter', title: 'frontmatter로 페이지 정보 적기', minutes: 15 },
    ],
  },
  {
    dir: 'part2-deploy',
    no: 2,
    title: '배포',
    goal: '만든 위키를 빌드해 다른 사람에게 보여 줄 수 있다.',
    lessons: [{ slug: '01-build', title: '빌드해 보기', minutes: 20 }],
  },
]
```

`docs/.vitepress/config.mts` 전체:

```ts
import { defineConfig, type DefaultTheme } from 'vitepress'
import { curriculum } from './curriculum.mts'

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
  cleanUrls: true,
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '홈', link: '/' },
      { text: '첫 레슨', link: '/part1-basics/01-hello' },
      { text: '마크다운 문법', link: '/part1-basics/02-markdown' },
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

폴더 구조:

```text
my-wiki/
├─ package.json
├─ package-lock.json
└─ docs/
   ├─ index.md
   ├─ part1-basics/
   │  ├─ index.md              ← 새로 생김 (파트 소개)
   │  ├─ 01-hello.md
   │  ├─ 02-markdown.md
   │  └─ 03-frontmatter.md
   ├─ part2-deploy/            ← 새로 생김
   │  ├─ index.md
   │  └─ 01-build.md
   ├─ public/
   │  └─ logo.svg
   └─ .vitepress/
      ├─ config.mts            ← 사이드바를 map으로 생성
      ├─ curriculum.mts        ← 새로 생김
      ├─ cache/
      └─ dist/
```

## ts-wiki에서는

- **`docs/.vitepress/curriculum.mts`** — 1~21줄의 주석과 `interface Lesson`, `interface Part`가 이 레슨의 1단계와 같은 모양입니다. 차이는 `Part`에 `level: '입문' | '초급' | '중급' | '고급' | '실전' | '마스터'`(정해진 글자 중 하나만 허용하는 타입)가 하나 더 있다는 점이고, 23줄 `export const curriculum: Part[] = [`부터 파트 10개와 부록이 이어집니다.
- **`docs/.vitepress/config.mts` 2줄** `import { curriculum } from './curriculum.mts'`
- **8~18줄** `curriculumSidebar` — 우리 코드와 같은 `map` 구조에, 부록(`appendix`)만 예외 처리가 들어 있습니다.

```ts
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

  - `collapsed: part.no > 1` — Part 0과 1만 펼치고 나머지는 접어서 시작합니다. 파트가 많을 때 사이드바가 너무 길어지는 것을 막습니다.
  - `조건 ? A : B`(삼항 연산자)로 부록(`no: 10`)은 `Part 10.` 같은 번호 없이 제목만 씁니다.
- **55줄** `...curriculumSidebar` — 손으로 적은 "학습 가이드" 묶음 뒤에 자동 생성 묶음을 펼쳐 붙입니다. 손으로 적은 것과 자동 생성을 섞어 쓸 수 있다는 예입니다.
- 이 가이드(wiki-server-guide)의 `curriculum.mts`도 같은 구조이며, 사이드바·전체 목차·파트 소개 표가 모두 이 파일에서 만들어집니다.

## 자주 하는 실수

**1. `X [ERROR] Could not resolve "./curriculum"`**

- 원인: `import { curriculum } from './curriculum'`처럼 확장자를 빼먹었습니다. VitePress가 설정 파일을 읽을 때는 `.mts` 확장자를 정확히 써야 찾습니다.
- 해결: `'./curriculum.mts'`로 씁니다(ts-wiki도 확장자를 붙여 씁니다).

**2. `error TS5097: An import path can only end with a '.mts' extension when 'allowImportingTsExtensions' is enabled.`**

- 원인: `tsc`로 `config.mts`를 검사할 때 생기는 오류입니다. TypeScript는 기본적으로 `.mts` 확장자를 붙인 `import`를 허락하지 않습니다. VitePress 실행에는 문제가 없습니다(실제로 확인).
- 해결: 검사 명령에 `--allowImportingTsExtensions`를 붙입니다.

**3. 레슨을 추가했는데 사이드바 링크를 누르면 404**

- 원인: `slug`와 실제 파일 이름이 다릅니다(`'03-front-matter'` vs `03-frontmatter.md`). 또는 파일을 다른 파트 폴더에 만들었습니다. 사이드바 링크는 빌드가 검사하지 않으므로 빌드도 성공합니다.
- 해결: `slug`는 파일 이름에서 `.md`만 뺀 것과 **글자 하나까지** 같아야 합니다. 레슨을 추가하면 사이드바에서 한 번 눌러 봅니다.

**4. 사이드바 번호가 `1-0`부터 시작함**

- 원인: `map`의 두 번째 인자 `i`는 0부터 셉니다. `${i}`를 그대로 쓰면 `1-0`이 됩니다.
- 해결: `${i + 1}`로 씁니다.

**5. `X [ERROR] Expected ";" but found ":"` (화살표 함수가 객체를 돌려줄 때)**

- 원인: `curriculum.map((part) => { text: ..., collapsed: false, ... })`처럼 객체를 감싸는 소괄호를 빼먹었습니다. 중괄호가 함수 본문으로 읽혀, 실제로 해 보면 `collapsed: false,` 줄에서 이 오류가 납니다.
- 해결: `=> ({ ... })`처럼 객체를 소괄호로 감쌉니다.

## 직접 해 보기

**과제 1 ⭐** — `03-frontmatter`와 `02-markdown`의 순서를 `curriculum.mts`에서 바꿔 보세요. 사이드바 번호와 이전/다음 버튼이 어떻게 바뀌나요? 확인 후 되돌립니다.

::: details 정답 보기
배열 줄 순서만 바꿨는데 `1-2. frontmatter로 ...`, `1-3. 마크다운 기본 문법`으로 번호가 다시 매겨지고, 이전/다음 버튼도 새 순서를 따릅니다. 파일 이름(`02-`, `03-`)은 주소일 뿐 순서를 정하지 않습니다.
:::

**과제 2 ⭐** — Part 2에 `02-preview` 레슨을 하나 더 추가해 보세요(파일 1개 + `curriculum.mts` 한 줄).

::: details 힌트
`lessons: [{ ... }]`를 여러 줄로 펼친 뒤 `{ slug: '02-preview', title: '미리보기', minutes: 15 }`를 추가하고, `docs/part2-deploy/02-preview.md`를 만듭니다.
:::

**과제 3 ⭐⭐** — ts-wiki처럼 `collapsed: part.no > 1`로 바꿔 보세요. 어떤 파트가 접혀서 시작하나요?

::: details 정답 보기
`part.no > 1`이 참인 Part 2만 접힌 채로 시작합니다. Part 1은 펼쳐져 있습니다. 단, 지금 보고 있는 페이지가 속한 묶음은 접혀 있어도 자동으로 펼쳐질 수 있습니다.
:::

**과제 4 ⭐⭐** — 사이드바 맨 위에 손으로 적은 "안내" 묶음(예: 홈 링크 하나)을 두고, 그 뒤에 자동 생성 묶음을 붙여 보세요.

::: details 정답 보기
```ts
    sidebar: [
      { text: '안내', items: [{ text: '홈', link: '/' }] },
      ...curriculumSidebar,
    ],
```
ts-wiki `config.mts` 43~56줄과 같은 방식입니다.
:::

**과제 5 ⭐⭐⭐** — `Lesson`에 선택 항목 `draft?: boolean`을 추가하고, `draft: true`인 레슨은 사이드바에서 빠지게 만들어 보세요.

::: details 힌트
`?`를 붙이면 "있어도 되고 없어도 되는 항목"입니다. `part.lessons.filter((lesson) => !lesson.draft).map(...)`처럼 `map` 앞에 `filter`를 끼웁니다. 다만 번호 `i`는 걸러진 뒤의 순서로 매겨진다는 점을 확인해 보세요.
:::

## 확인 퀴즈

**1.** 레슨을 하나 추가할 때 고쳐야 하는 파일은 무엇과 무엇인가요?

::: details 정답 보기
레슨 마크다운 파일(새로 만듦)과 `curriculum.mts`(한 줄 추가)입니다. `config.mts`는 고치지 않습니다.
:::

**2.** `curriculum.map(...)`의 결과 배열 길이는 `curriculum`과 어떤 관계인가요?

::: details 정답 보기
같습니다. `map`은 항목 하나를 새 항목 하나로 바꾸므로, 파트 2개 → 사이드바 묶음 2개입니다.
:::

**3.** 사이드바에 없는 페이지 주소가 들어 있어도 `npm run build`가 성공하는 이유는?

::: details 정답 보기
dead link 검사는 마크다운 본문 안의 링크만 대상으로 하고, 설정 파일로 만든 nav·sidebar 링크는 검사하지 않기 때문입니다.
:::

**4.** `interface Lesson`에서 `minutes`를 빼먹은 레슨이 있으면 개발 서버는 어떻게 되나요?

::: details 정답 보기
개발 서버는 타입을 검사하지 않으므로 그대로 뜹니다. 타입 오류는 편집기의 빨간 줄이나 `tsc` 검사로 알 수 있습니다.
:::

## 정리

- 레슨 목록은 `curriculum.mts`에 데이터로 한 번만 적고, `interface`로 모양을 정합니다.
- `config.mts`는 그 데이터를 `import`해 `map`으로 사이드바 항목을 만들어 냅니다.
- 레슨 추가 = 파일 하나 + 한 줄, 파트 추가 = 폴더 하나 + 객체 하나. 번호와 이전/다음 순서는 자동입니다.
- `curriculum.mts`를 고쳐도 개발 서버가 자동으로 재시작됩니다.
- 사이드바 링크는 빌드가 검사하지 않으므로, 규칙으로 만들어 내고 눌러서 확인합니다.

## 다음 단계

[진도 체크리스트 컴포넌트 만들기](./05-components) — 기본 테마를 확장해 Vue 컴포넌트를 등록하고, 같은 `curriculum.mts`를 읽어 파트 소개 목록과 진도 체크리스트를 그립니다.
