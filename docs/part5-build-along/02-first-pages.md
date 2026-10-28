---
title: 첫 페이지와 홈 화면
---

# 첫 페이지와 홈 화면

<LessonMeta level="중급" :minutes="40" prev="빈 폴더에서 VitePress를 설치하고 첫 페이지를 개발 서버로 띄웠다" />

## 이번에 배울 것

- 폴더와 파일 이름이 그대로 페이지 주소가 되는 규칙(파일 기반 라우팅)을 설명할 수 있다.
- frontmatter로 페이지 제목을 정하고, `layout: home`으로 홈 화면(hero·features)을 만들 수 있다.
- `docs/public/` 폴더에 이미지 같은 정적 파일을 넣고 `/logo.svg`처럼 쓸 수 있다.
- 페이지끼리 상대 경로로 링크하고, 없는 페이지로 링크했을 때 빌드가 실패하는 것을 직접 확인할 수 있다.

## 먼저 알아 둘 것

- [빈 폴더에서 VitePress 시작하기](./01-init)를 마쳐 `my-wiki`가 있어야 합니다.
- 마크다운 문법이 처음이라면: [왜 Markdown으로 쓰나](../part2-choices/03-why-markdown)
- 정적 사이트·빌드라는 말이 낯설다면: [정적 사이트 생성기(SSG)와 빌드](../part1-concepts/05-ssg)

## 비유로 이해하기

VitePress 위키는 **서류철 캐비닛**과 같습니다.

- 캐비닛 서랍(**폴더**)에 서류(**마크다운 파일**)를 꽂으면, 서랍 이름과 서류 이름이 곧 **찾아가는 주소**가 됩니다. `part1-basics` 서랍의 `01-hello` 서류 → `/part1-basics/01-hello`.
- 서류 맨 위에 붙이는 **표지 스티커**가 frontmatter입니다. "이 서류의 제목은 무엇", "이 서류는 표지(홈) 양식으로 꾸밀 것" 같은 정보를 적습니다.
- 캐비닛 옆의 **비품 상자**(`public/`)에 넣은 물건(로고 그림 등)은 손대지 않고 그대로 손님에게 건넵니다.
- 서류에 "3번 서류 참고"라고 적었는데 3번 서류가 없으면, 캐비닛 관리인(빌드)이 **출고를 거부**합니다. 이것이 dead link 검사입니다.

## 따라 하기

`my-wiki` 폴더에서 `npm run dev`로 개발 서버를 켜 두고 진행합니다. 파일을 저장할 때마다 브라우저에서 바로 확인할 수 있습니다.

### 1단계. 레슨 페이지 두 개 만들기

`docs` 안에 `part1-basics` 폴더를 만들고 파일 두 개를 만듭니다.

`docs/part1-basics/01-hello.md`:

```md
---
title: 첫 레슨, 안녕 위키
---

# 첫 레슨, 안녕 위키

이 페이지는 `docs/part1-basics/01-hello.md` 파일에서 만들어졌습니다.

## 이번에 배울 것

- 마크다운 파일 하나가 웹 페이지 하나가 된다는 것
- 다른 페이지로 링크하는 법

## 다음 레슨

[마크다운 기본 문법](./02-markdown)으로 넘어갑니다.
```

`docs/part1-basics/02-markdown.md`:

````md
---
title: 마크다운 기본 문법
---

# 마크다운 기본 문법

## 강조와 목록

**굵게**, *기울임*, `인라인 코드`를 쓸 수 있습니다.

1. 번호 목록
2. 두 번째 항목

## 표

| 기호 | 뜻 |
|---|---|
| `#` | 제목 |
| `-` | 목록 |

## 코드 블록

```ts
const greeting: string = '안녕하세요'
console.log(greeting)
```

## 강조 박스

::: tip 알아 두기
VitePress는 이런 상자를 기본으로 지원합니다.
:::

::: details 정답 보기
접기 블록 안의 내용은 눌러야 보입니다.
:::

[처음 레슨으로 돌아가기](./01-hello)
````

파일 이름 앞의 `01-`, `02-` 번호는 VitePress가 요구하는 것이 아니라 **사람이 순서를 알아보기 쉽게** 붙인 것입니다. 탐색기에서 이름순으로 정렬하면 레슨 순서대로 보입니다. ts-wiki도 같은 규칙을 씁니다.

**확인 방법**: 브라우저 주소창에 직접 입력해 봅니다.

- `http://localhost:5190/part1-basics/01-hello` → 제목 **첫 레슨, 안녕 위키**, 브라우저 탭 제목 **첫 레슨, 안녕 위키 | VitePress**
- `http://localhost:5190/part1-basics/02-markdown` → 표, 색이 입혀진 코드 블록, 초록색 tip 상자, 눌러서 펼치는 "정답 보기"가 보이면 성공입니다.

### 2단계. 파일 기반 라우팅 이해하기

라우팅(routing)은 "어떤 주소로 오면 어떤 페이지를 보여 줄지" 정하는 일입니다. VitePress는 따로 정하지 않아도 **파일 위치가 곧 주소**입니다.

| 파일 (`docs/` 기준) | 주소 |
|---|---|
| `index.md` | `/` |
| `part1-basics/01-hello.md` | `/part1-basics/01-hello` |
| `part1-basics/02-markdown.md` | `/part1-basics/02-markdown` |
| `part1-basics/index.md` (아직 없음) | `/part1-basics/` |

없는 주소(예: `/part1-basics/` — 아직 `index.md`가 없음)로 가면 VitePress 기본 **404 화면**(`404 PAGE NOT FOUND`, "Take me home" 버튼)이 나옵니다. 4단계에서 이 404를 일부러 만들어 봅니다.

::: info 파일 이름은 영문 소문자와 하이픈으로
파일 이름이 주소가 되므로, 한글이나 공백을 넣으면 주소가 `%EC%B2%AB...`처럼 인코딩되어 길고 읽기 어려워집니다. `01-hello.md`처럼 **영문 소문자·숫자·하이픈**을 씁니다. 화면에 보이는 한글 제목은 frontmatter의 `title`과 본문 `#` 제목으로 따로 정합니다.
:::

### 3단계. frontmatter 알아보기

1단계 파일 맨 위의 세 줄이 frontmatter입니다.

```md
---
title: 첫 레슨, 안녕 위키
---
```

- `---` 두 줄 사이는 본문이 아니라 **페이지 정보**이고, YAML(키: 값 형식의 설정 문법)로 씁니다.
- `title`은 브라우저 탭 제목과 검색 결과에 쓰입니다. 본문 `#` 제목과 같게 두는 것이 보통입니다.
- 값에 콜론(`:`)이 들어가면 YAML이 "키: 값"으로 착각하므로 작은따옴표로 감쌉니다. 예: `title: 'Part 1: 기초'`
- `title`을 빼먹으면 VitePress는 본문의 첫 `#` 제목을 탭 제목으로 대신 씁니다. 그래도 명시해 두는 편이 의도가 분명합니다.

**확인 방법**: `01-hello.md`의 `title`만 "안녕 위키 (수정)"으로 바꾸고 저장합니다. 본문 제목은 그대로인데 **브라우저 탭 제목만** 바뀌면 성공입니다. 확인 후 원래대로 돌려 둡니다.

### 4단계. 내부 링크와 dead link 체험

`01-hello.md` 끝의 링크 `[마크다운 기본 문법](./02-markdown)`은 **상대 경로**입니다. `./`는 "지금 파일과 같은 폴더"라는 뜻이고, `.md` 확장자는 생략합니다. 상위 폴더는 `../`로 올라갑니다.

이제 일부러 **없는 페이지로 링크**해 봅니다. `01-hello.md`의 마지막 줄을 이렇게 바꿉니다.

```md
[마크다운 기본 문법](./02-markdown) 또는 [아직 없는 레슨](./03-missing)으로 넘어갑니다.
```

개발 서버 화면에서 "아직 없는 레슨"을 누르면 404 화면이 나올 뿐, 다른 경고는 없습니다. 이번에는 **새 터미널**을 열어 빌드를 해 봅니다(빌드는 5-6에서 자세히 다룹니다).

```bash
npm run build
```

실제 출력(경로 줄은 줄였습니다):

```text
  vitepress v1.6.3

- building client + server bundles...


(!) Found dead link ./03-missing in file part1-basics\01-hello.md

If this is expected, you can disable this check via config. Refer: https://vitepress.dev/reference/site-config#ignoredeadlinks

x Build failed in 8.07s
✖ building client + server bundles...
build error:
[vitepress] 1 dead link(s) found.
    at Object.renderStart (file:///.../node_modules/vitepress/dist/node/chunk-Zsoi3j4v.js:45027:15)
    ...
```

읽는 법:

- `(!) Found dead link ./03-missing in file part1-basics\01-hello.md` — **가장 중요한 줄**입니다. 어떤 링크(`./03-missing`)가 어느 파일(`part1-basics\01-hello.md`)에 있는지 정확히 알려 줍니다.
- `Build failed`, `1 dead link(s) found` — 그래서 빌드를 멈췄다는 결과입니다. 명령의 종료 코드도 1(실패)입니다.
- `at ...`으로 시작하는 줄들은 VitePress 내부 위치라 읽지 않아도 됩니다.

개발 서버에서는 조용히 넘어가던 문제가 **빌드에서는 실패**로 드러납니다. 덕분에 깨진 링크가 있는 채로 배포되는 일을 막을 수 있습니다. 안내 문구의 `ignoreDeadLinks` 설정으로 검사를 끌 수도 있지만, 끄면 이 안전장치가 사라지므로 이 파트에서는 쓰지 않습니다.

이제 링크를 원래대로 되돌리고 다시 빌드합니다.

```md
[마크다운 기본 문법](./02-markdown)으로 넘어갑니다.
```

```bash
npm run build
```

```text
- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
✓ rendering pages...
build complete in 15.27s.
```

**확인 방법**: `build complete`가 나오면 성공입니다. 빌드가 만든 `docs/.vitepress/dist` 폴더는 5-6에서 살펴봅니다. 지금은 그대로 두어도 됩니다.

### 5단계. 정적 파일: `docs/public/`

로고 그림을 하나 만듭니다. `docs/public` 폴더를 만들고 `logo.svg`를 넣습니다(SVG는 글자로 된 그림 파일이라 메모장으로도 만들 수 있습니다).

`docs/public/logo.svg`:

```text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#10b981"/><text x="32" y="44" font-size="32" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="700">W</text></svg>
```

`public` 폴더는 특별한 폴더입니다. 안의 파일은 가공 없이 **사이트 맨 앞 주소**에 그대로 놓입니다. `docs/public/logo.svg` → `/logo.svg`. 주소에 `public`이 들어가지 않는 점에 주의합니다.

**확인 방법**: `http://localhost:5190/logo.svg`를 열었을 때 초록 바탕에 흰 W가 보이면 성공입니다.

### 6단계. 홈 화면 만들기: `layout: home`

`docs/index.md`를 통째로 아래 내용으로 바꿉니다. 이번에는 본문 없이 **frontmatter만** 있습니다.

```yaml
---
layout: home

hero:
  name: 나의 학습 위키
  text: 빈 폴더에서 시작한 VitePress 위키
  tagline: 마크다운 파일만 쓰면 사이드바·검색·진도 체크까지 갖춘 사이트가 됩니다.
  image:
    src: /logo.svg
    alt: 나의 학습 위키 로고
  actions:
    - theme: brand
      text: 첫 레슨 시작하기
      link: /part1-basics/01-hello
    - theme: alt
      text: 마크다운 문법 보기
      link: /part1-basics/02-markdown

features:
  - icon: 📝
    title: 마크다운으로 쓰기
    details: 글은 .md 파일로 씁니다. 저장하면 브라우저가 바로 바뀝니다.
  - icon: 🧭
    title: 길 잃지 않는 구조
    details: 파트와 레슨으로 나누고, 사이드바에서 순서대로 따라갑니다.
  - icon: ✅
    title: 진도 체크
    details: 다 읽은 레슨에 체크해 두면 이 브라우저에 기억됩니다.
---
```

| 키 | 화면에서 |
|---|---|
| `layout: home` | 일반 문서 대신 **홈 전용 배치**를 씁니다. |
| `hero.name` / `text` / `tagline` | 큰 글씨(이름 · 부제 · 설명). `name`은 브랜드 색(기본 테마는 남색 계열 indigo)으로 칠해집니다. 5-5에서 이 색을 바꿉니다. |
| `hero.image.src` | 오른쪽 그림. 5단계의 `/logo.svg`를 가리킵니다. |
| `hero.actions` | 버튼. `theme: brand`는 색이 채워진 주 버튼, `alt`는 보조 버튼입니다. |
| `features` | 아래쪽 카드 목록. 카드마다 `icon`(이모지), `title`, `details`를 씁니다. |

YAML은 **들여쓰기(공백 2칸)로 계층을 표현**합니다. `- theme:`의 `-`는 "목록의 한 항목"이라는 뜻입니다. 탭 문자를 쓰면 오류가 나므로 공백만 씁니다.

**확인 방법**: `http://localhost:5190/`에서

- 왼쪽에 브랜드 색의 큰 글씨 **나의 학습 위키**와 부제·설명, 오른쪽에 초록 W 로고,
- 그 아래 **첫 레슨 시작하기**(채워진 버튼)와 **마크다운 문법 보기**(테두리 버튼),
- 맨 아래 이모지 카드 3장이 보이고,
- **첫 레슨 시작하기**를 눌러 1단계 페이지로 이동하면 성공입니다.

### 이 단계까지의 전체 파일 상태

```text
my-wiki/
├─ package.json
├─ package-lock.json
└─ docs/
   ├─ index.md                 ← 홈 화면 (frontmatter만)
   ├─ part1-basics/
   │  ├─ 01-hello.md
   │  └─ 02-markdown.md
   ├─ public/
   │  └─ logo.svg
   └─ .vitepress/
      ├─ cache/                ← 개발 서버 임시 파일
      └─ dist/                 ← 4단계 빌드 결과물 (5-6에서 다룸)
```

아직 사이드바와 상단 메뉴가 없어, 페이지를 오가려면 주소를 직접 치거나 본문 링크를 눌러야 합니다. 다음 레슨에서 설정 파일로 해결합니다.

## ts-wiki에서는

- **홈 화면**: ts-wiki의 `docs/index.md`도 `layout: home`으로 시작하고, `hero`에 `name: TypeScript 마스터 위키`, `image.src: /favicon.svg`, 버튼 세 개(`처음이라면 여기서 시작` · `전체 목차 보기` · `12주 학습 계획`)를 둡니다. 구조는 6단계와 같고 버튼 수와 문구만 다릅니다.
- **정적 파일**: `docs/public/favicon.svg` 하나가 있습니다. 홈의 hero 그림과 브라우저 탭 아이콘으로 함께 쓰입니다(탭 아이콘 연결은 5-6에서 합니다).
- **폴더·파일 이름**: `docs/part0-start/01-what-is-programming.md`처럼 `partN-영문` 폴더와 `NN-영문` 파일 이름을 씁니다. 이 실습의 `part1-basics/01-hello.md`가 같은 규칙입니다.
- **dead link**: ts-wiki의 작성 규칙(`docs/guide/writing-guide.md`)에도 "없는 페이지로 링크하면 빌드가 실패합니다"가 적혀 있고, GitHub Actions 배포도 같은 `npm run build`를 거치므로 깨진 링크는 인터넷에 올라가기 전에 걸러집니다.

## 자주 하는 실수

**1. `(!) Found dead link /02-markdown in file part1-basics\01-hello.md`**

- 원인: 같은 폴더의 파일을 가리키려고 `/02-markdown`처럼 `/`로 시작해 썼습니다. `/`로 시작하면 **사이트 맨 앞**부터 찾으므로 `/part1-basics/`가 빠져 없는 페이지가 됩니다(실제로 빌드가 이 메시지로 실패합니다).
- 해결: 같은 폴더는 `./02-markdown`, 다른 폴더는 `../part2-xxx/01-yyy`처럼 상대 경로로 쓰거나, 절대 경로라면 `/part1-basics/02-markdown`처럼 전체를 씁니다.

**2. 페이지 위에 가로줄과 `title: ...`이라는 소제목이 그대로 보임**

- 원인: 첫 줄의 `---` 앞에 빈 줄이 있습니다. frontmatter는 **파일의 맨 첫 줄**에서 시작해야 인식됩니다. 실제로 빈 줄 하나를 넣고 빌드해 보면, 첫 `---`는 가로줄(`hr`)로, `title: ...` 줄은 소제목으로 바뀌어 본문에 나옵니다. 홈 화면이라면 `layout: home`이 적용되지 않아 hero 대신 이런 글자가 보입니다.
- 해결: 파일 맨 위에 `---`가 오게 하고, 닫는 `---`가 있는지 확인합니다.

**3. 홈 화면이 아예 하얗게 비거나 일부 항목이 사라짐**

- 원인: YAML 들여쓰기가 틀렸습니다(예: `actions:` 아래 항목을 2칸이 아니라 1칸 들여씀, 탭 문자 사용).
- 해결: 6단계 예시와 공백 수를 맞춥니다. VS Code 오른쪽 아래에서 "Spaces: 2"인지 확인합니다.

**4. 로고가 안 보이고 깨진 그림 아이콘**

- 원인: 경로를 `/public/logo.svg`로 썼거나, 파일을 `docs/public`이 아닌 `my-wiki/public`에 두었습니다.
- 해결: 파일은 `docs/public/logo.svg`, 쓸 때는 `/logo.svg`입니다.

**5. 빌드에서 `Found dead link`가 나는데 해당 파일이 분명히 있음**

- 원인: 파일 이름과 링크의 대소문자·하이픈이 다릅니다(`01-Hello.md`와 `./01-hello`). Windows는 대소문자를 구분하지 않아 개발 중에는 열리는데, 배포 서버(리눅스)에서는 다른 파일로 봅니다.
- 해결: 파일 이름을 모두 소문자로 통일하고 링크도 똑같이 씁니다.

## 직접 해 보기

**과제 1 ⭐** — `docs/part1-basics/03-frontmatter.md` 레슨을 하나 더 만들고(제목: "frontmatter로 페이지 정보 적기"), `02-markdown.md` 끝에서 이 페이지로 링크하세요. 5-4에서 이 파일을 사이드바에 **한 줄로** 등록하는 실습에 씁니다(지금 만들지 않았다면 5-4에서 만들어도 됩니다).

::: details 정답 보기
```md
---
title: frontmatter로 페이지 정보 적기
---

# frontmatter로 페이지 정보 적기

파일 맨 위 `---` 두 줄 사이에 적는 내용을 frontmatter라고 합니다.

## title

브라우저 탭 제목이 됩니다.
```

`02-markdown.md` 끝에 `[다음: frontmatter](./03-frontmatter)`를 추가합니다. `npm run build`가 성공하면 링크가 맞는 것입니다.
:::

**과제 2 ⭐** — 홈 화면에 세 번째 버튼(`theme: alt`)을 추가해 `/part1-basics/03-frontmatter`로 연결하세요.

::: details 힌트
`actions:` 아래에 `- theme: alt`로 시작하는 세 줄(theme, text, link)을 같은 들여쓰기로 추가합니다.
:::

**과제 3 ⭐⭐** — `features` 카드 하나에 `link: /part1-basics/01-hello`를 추가해 보세요. 카드에 어떤 변화가 생기나요?

::: details 정답 보기
카드 전체가 눌리는 링크가 되고, 마우스를 올리면 테두리 색이 바뀝니다. 카드에 `linkText: 바로 가기`를 함께 쓰면 카드 아래에 링크 문구도 보입니다.
:::

**과제 4 ⭐⭐** — `../`를 쓰는 링크를 만들어 보세요. `docs/part1-basics/01-hello.md`에서 홈(`docs/index.md`)으로 가는 상대 링크는 어떻게 쓰나요?

::: details 정답 보기
`[홈으로](../)` 또는 `[홈으로](../index)`입니다. `../`는 `part1-basics`의 한 단계 위, 즉 `docs`를 가리키고, 폴더 주소는 그 폴더의 `index.md`를 보여 줍니다.
:::

**과제 5 ⭐⭐⭐** — dead link를 **두 개** 만든 뒤 빌드해, 오류 메시지가 두 링크를 모두 알려 주는지 확인하세요. 확인 후 되돌립니다.

::: details 정답 보기
`(!) Found dead link ...` 줄이 링크마다 하나씩 나오고, 마지막 요약은 `2 dead link(s) found.`가 됩니다. 한 번 빌드로 모든 깨진 링크를 한꺼번에 찾을 수 있습니다.
:::

## 확인 퀴즈

**1.** `docs/part1-basics/02-markdown.md`의 주소는 무엇인가요?

::: details 정답 보기
`/part1-basics/02-markdown`입니다(`docs/`와 `.md`가 빠짐).
:::

**2.** `docs/public/logo.svg`를 홈 화면에서 쓸 때 경로는?

::: details 정답 보기
`/logo.svg`입니다. `public` 폴더 안의 파일은 사이트 맨 앞 주소에 그대로 놓입니다.
:::

**3.** 없는 페이지로 링크했을 때 개발 서버와 빌드는 각각 어떻게 반응하나요?

::: details 정답 보기
개발 서버는 눌렀을 때 404 화면을 보여 줄 뿐 경고하지 않고, 빌드는 `Found dead link`를 알리며 **실패**합니다.
:::

**4.** frontmatter의 `title`과 본문의 `#` 제목은 각각 어디에 보이나요?

::: details 정답 보기
`title`은 브라우저 탭 제목(과 검색 결과)에, `#` 제목은 페이지 본문 맨 위 큰 글씨로 보입니다.
:::

## 정리

- `docs/` 안의 폴더·파일 위치가 곧 주소입니다(`index.md`는 폴더 대표 페이지).
- 파일 이름은 영문 소문자·숫자·하이픈으로 쓰고, 순서는 `01-`, `02-` 번호로 보여 줍니다.
- frontmatter(`---` 사이 YAML)로 `title`, `layout: home`, `hero`, `features`를 정합니다.
- `docs/public/`의 파일은 가공 없이 `/파일이름`으로 쓰입니다.
- 내부 링크는 `.md` 없는 상대 경로로 쓰고, 깨진 링크는 `npm run build`가 실패로 알려 줍니다.

## 다음 단계

[내비게이션 · 사이드바 · 검색](./03-nav-sidebar-search) — `config.mts` 설정 파일을 처음 만들어 사이트 이름, 상단 메뉴, 사이드바, 검색, 한국어 문구, 다크 모드를 갖춥니다.
