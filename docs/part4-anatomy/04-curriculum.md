---
title: '단일 출처 설계: curriculum.mts'
---

# 단일 출처 설계: curriculum.mts

<LessonMeta level="중급" :minutes="45" prev="config.mts는 curriculum.map으로 사이드바를 자동 생성하고, base·cleanUrls·lastUpdated를 다른 파일과 짝지어 설정한다" />

## 이번에 배울 것

- "단일 출처(Single Source of Truth)"가 무슨 뜻인지, 왜 필요한지 설명할 수 있다.
- `curriculum.mts`의 `Lesson`·`Part` 인터페이스와 데이터 구조를 읽을 수 있다.
- 이 파일을 읽는 네 곳(config 사이드바, `CurriculumToc`, `PartLessons`, `ProgressChecklist`)이 각각 무엇을 만드는지 말할 수 있다.
- 레슨 하나를 추가하는 정확한 절차를 알고, 타입 검사가 잡아 주는 실수와 잡지 못하는 실수를 구분할 수 있다.

## 먼저 알아 둘 것

- [config.mts 한 줄씩 읽기](./03-config)의 3단계(사이드바 생성 코드)
- TypeScript의 인터페이스와 유니온 타입을 들어 본 정도면 충분합니다. 왜 TS를 썼는지는 [설정과 컴포넌트를 왜 TypeScript로 쓰나](../part2-choices/04-why-typescript)에서 다뤘습니다.

## 비유로 이해하기

학교의 **학생 명부**를 떠올려 보세요. 출석부, 성적표, 급식 명단, 비상 연락망이 모두 학생 목록을 씁니다. 만약 각 담당자가 명단을 따로 손으로 적어 관리하면, 전학생이 한 명 오는 날 네 군데를 모두 고쳐야 하고, 한 군데만 빠뜨려도 "급식 명단에는 있는데 출석부에는 없는" 학생이 생깁니다.

그래서 학교는 **학적부 하나**를 원본으로 두고, 나머지 명단은 모두 거기서 뽑아 씁니다. 전학생이 오면 학적부만 고치면 됩니다. 이것이 **단일 출처**(Single Source of Truth, 진실의 출처가 하나뿐이라는 뜻)입니다. ts-wiki에서는 `curriculum.mts`가 학적부입니다.

## 개념 설명

### 1단계: 단일 출처가 없으면 생기는 일

ts-wiki의 레슨 목록은 화면 네 곳에 나옵니다.

| 화면 | 무엇이 보이나 |
|---|---|
| 왼쪽 사이드바(모든 페이지) | 파트 제목, `0-1.` 번호와 레슨 제목, 링크 |
| 전체 목차 페이지(`/guide/toc`) | 파트별 난이도·목표·예상 시간, 전체 레슨 수와 총 시간 |
| 파트 소개 페이지(`/part0-start/` 등 11곳) | 그 파트의 레슨 표와 예상 시간 |
| 진도 체크리스트(`/guide/checklist`) | 파트별 레슨 체크박스와 진행률 |

이 네 곳을 마크다운으로 따로 손으로 썼다고 해 봅시다. 레슨 75개 × 4곳이면 300개의 목록 항목을 맞춰 관리해야 합니다. 레슨 제목 하나를 고치면 네 군데를 찾아 고쳐야 하고, 실제로는 이런 일이 생깁니다.

- 사이드바에서는 제목을 고쳤는데 목차 페이지는 옛 제목 그대로
- 파트 소개 표에는 레슨이 6개인데 체크리스트에는 5개
- 목차의 "총 80시간"은 레슨을 추가한 뒤에도 아무도 다시 계산하지 않음
- 순서를 바꿨더니 사이드바 번호(`4-3.`)와 파트 소개 표의 번호가 서로 다름

단일 출처 설계에서는 **데이터는 한 곳에만 쓰고, 화면은 모두 그 데이터에서 계산해 만듭니다.** 그러면 위의 불일치는 원리상 생길 수 없습니다.

### 2단계: 인터페이스 읽기 (1~21줄)

```ts:line-numbers
// 학습 커리큘럼 단일 정의 파일
// 사이드바·목차 페이지가 모두 이 파일을 기준으로 만들어지므로, 문서를 추가·이동할 때는 여기만 고칩니다.

export interface Lesson {
  /** 파일 이름(확장자 제외). 예: '01-what-is-typescript' */
  slug: string
  title: string
  /** 예상 학습 시간(분) */
  minutes: number
}

export interface Part {
  /** 폴더 이름. 예: 'part0-start' */
  dir: string
  no: number
  title: string
  /** 이 파트를 마치면 할 수 있게 되는 것 */
  goal: string
  level: '입문' | '초급' | '중급' | '고급' | '실전' | '마스터'
  lessons: Lesson[]
}
```

**인터페이스**(interface)는 "이런 모양의 객체여야 한다"는 약속입니다. 실행될 때는 사라지고, 편집기와 `tsc`(TypeScript 컴파일러)가 검사할 때만 씁니다.

| 필드 | 타입 | 쓰이는 곳 |
|---|---|---|
| `Lesson.slug` | 문자열 | 마크다운 파일 이름(확장자 제외) = 주소의 마지막 부분 |
| `Lesson.title` | 문자열 | 사이드바·목차·표·체크리스트의 글자 |
| `Lesson.minutes` | 숫자 | 목차·파트 소개의 예상 시간, 총 시간 계산 |
| `Part.dir` | 문자열 | 폴더 이름 = 주소의 앞부분 |
| `Part.no` | 숫자 | `Part 0.`, `0-1.` 같은 번호, 사이드바 접기 기준(`no > 1`) |
| `Part.title`, `goal` | 문자열 | 파트 제목, "이 파트를 마치면" 문구 |
| `Part.level` | 6개 중 하나 | 난이도 배지 |
| `Part.lessons` | `Lesson` 배열 | 그 파트의 레슨 목록(배열 순서 = 학습 순서) |

몇 가지 설계 포인트가 있습니다.

- **`/** ... */` 주석**(JSDoc)은 그냥 주석과 달리, VS Code에서 그 필드 위에 마우스를 올리면 설명으로 떠오릅니다. 데이터를 쓰는 사람이 파일을 왔다 갔다 하지 않아도 됩니다.
- **`level`은 아무 문자열이 아니라 6개 중 하나**만 허용하는 유니온 리터럴 타입(`'입문' | '초급' | ...`)입니다. `'중급 '`(끝에 공백)이나 `'고수'` 같은 오타를 막습니다.
- **레슨 번호(`0-1`)를 데이터에 적지 않습니다.** 번호는 배열 순서에서 계산합니다(config 14줄의 `i + 1`). 그래서 레슨 순서를 바꿀 때 번호를 다시 매길 필요가 없습니다.
- **주소(링크)도 데이터에 적지 않습니다.** `dir`과 `slug`로 `/${dir}/${slug}`를 만들어 씁니다. 같은 정보를 두 번 적지 않는 것이 단일 출처의 핵심입니다.

::: info 주석 2줄의 문구
ts-wiki의 2줄 주석은 "사이드바·목차 페이지가"라고만 적혀 있지만, 실제로는 아래 3단계처럼 파트 소개 표와 진도 체크리스트도 이 파일을 읽습니다. 이 가이드(wiki-server-guide)의 같은 파일에는 "사이드바·목차·진도 체크리스트가"로 고쳐 적었습니다. 주석은 코드가 바뀌어도 자동으로 따라오지 않는다는 좋은 예입니다.
:::

### 3단계: 데이터 읽기 (23줄~)

```ts:line-numbers=23
export const curriculum: Part[] = [
  {
    dir: 'part0-start',
    no: 0,
    title: '시작하기',
    goal: 'TypeScript가 무엇이고 왜 쓰는지 이해하고, 내 PC에서 첫 TS 프로그램을 실행한다.',
    level: '입문',
    lessons: [
      { slug: '01-what-is-programming', title: '프로그래밍과 JavaScript, 그리고 TypeScript', minutes: 30 },
      { slug: '02-why-typescript', title: '왜 TypeScript인가: 타입이 막아 주는 실수들', minutes: 30 },
      { slug: '03-setup', title: '개발 환경 설치 (Node.js · VS Code · Git)', minutes: 60 },
      { slug: '04-playground', title: 'TS Playground로 설치 없이 바로 해 보기', minutes: 20 },
      { slug: '05-first-program', title: '첫 프로그램: tsc로 컴파일하고 실행하기', minutes: 45 },
      { slug: '06-how-to-read-errors', title: '에러 메시지 읽는 법과 도움 받는 법', minutes: 30 },
    ],
  },
```

- `curriculum: Part[]`: "`Part` 모양 객체의 배열"이라고 타입을 붙였습니다. 이 한 단어 덕분에 아래 200줄 가까운 데이터가 모두 검사됩니다.
- `export`: 다른 파일에서 `import { curriculum } from ...`으로 가져다 쓸 수 있게 내보냅니다.
- 파일 전체는 202줄이고, 파트 11개(25줄 `part0-start` … 175줄 `part9-master`, 190줄 `appendix`)가 들어 있습니다.

`slug`와 실제 파일은 이렇게 대응합니다.

```text
dir: 'part0-start', slug: '03-setup'
  → 파일: docs/part0-start/03-setup.md
  → 주소: /part0-start/03-setup
```

부록은 끝부분에 `no: 10`, `minutes: 0`으로 들어 있습니다.

```ts:line-numbers=189
  {
    dir: 'appendix',
    no: 10,
    title: '부록',
    goal: '공부하다 막힐 때 바로 찾아보는 참고 자료',
    level: '입문',
    lessons: [
      { slug: '01-glossary', title: '용어집 (한/영)', minutes: 0 },
      { slug: '02-cheatsheet', title: 'TypeScript 문법 치트시트', minutes: 0 },
      { slug: '03-js-vs-ts', title: 'JavaScript ↔ TypeScript 대조표', minutes: 0 },
      { slug: '04-vscode-tips', title: 'VS Code 단축키와 TS 개발 팁', minutes: 0 },
    ],
  },
]
```

부록은 "공부 순서"가 아니라 "찾아보는 자료"라서, 화면을 만드는 쪽 코드가 `dir === 'appendix'`를 보고 번호·시간·진도에서 뺍니다. `minutes: 0`도 "시간을 표시하지 않음"의 신호로 쓰입니다(아래 `PartLessons` 참고).

### 4단계: 이 파일을 읽는 네 곳

ts-wiki에서 `curriculum`을 불러오는 곳을 찾아보면 정확히 네 곳입니다.

```bash
grep -rn "curriculum" --include=*.mts --include=*.ts --include=*.vue docs/.vitepress | grep import
```

```text
docs/.vitepress/config.mts:2:import { curriculum } from './curriculum.mts'
docs/.vitepress/theme/components/CurriculumToc.vue:4:import { curriculum } from '../../curriculum.mts'
docs/.vitepress/theme/components/PartLessons.vue:4:import { curriculum } from '../../curriculum.mts'
docs/.vitepress/theme/components/ProgressChecklist.vue:5:import { curriculum } from '../../curriculum.mts'
```

`config.mts`는 같은 폴더라 `./`, 컴포넌트는 `theme/components/` 안에 있어 두 단계 위(`../../`)를 가리킵니다.

#### (1) `config.mts`: 사이드바

[4-3](./03-config)에서 본 8~18줄입니다. 모든 파트·레슨을 링크 목록으로 바꿉니다. 사이드바 순서는 **페이지 아래의 "이전 레슨/다음 레슨" 버튼**에도 쓰입니다. 기본 테마가 사이드바 순서로 앞뒤 페이지를 정하기 때문입니다(공식 문서 기준). 그래서 배열 순서를 바꾸면 이전/다음 버튼까지 함께 바뀝니다.

#### (2) `CurriculumToc.vue`: 전체 목차

```ts:line-numbers=6
// 부록은 참고 문서라 파트·레슨 수에서 뺍니다.
const lessonParts = curriculum.filter((p) => p.dir !== 'appendix')
const appendixCount = curriculum.find((p) => p.dir === 'appendix')?.lessons.length ?? 0
const totalLessons = lessonParts.reduce((sum, p) => sum + p.lessons.length, 0)
const totalHours = Math.round(
  curriculum.reduce((sum, p) => sum + p.lessons.reduce((s, l) => s + l.minutes, 0), 0) / 60,
)
const partHours = (minutes: number[]) => Math.round(minutes.reduce((a, b) => a + b, 0) / 6) / 10
```

목차 맨 위의 요약 숫자를 **모두 계산으로** 만듭니다. 이 계산을 스크래치에서 그대로 실행해 보면 이렇습니다.

```text
10 75 4 80
```

파트 10개, 레슨 75개, 부록 4개, 총 약 80시간입니다. `README.md` 5줄의 "10개 파트 · 75개 레슨 · 부록 4개"와 일치합니다. 다만 README와 홈 화면(`docs/index.md`)의 숫자는 **손으로 적은 글**이라, 레슨을 추가하면 직접 고쳐야 합니다. 단일 출처에서 계산되는 곳과 그렇지 않은 곳을 구분해 두세요.

`partHours`는 분을 시간으로 바꿔 소수 첫째 자리까지 남기는 계산입니다. 합이 215분인 Part 0은 `Math.round(215 / 6) / 10` = `36 / 10` = `3.6`시간이 됩니다. 60으로 나누고 10을 곱해 반올림한 뒤 다시 10으로 나누는 것을 한 번에 줄인 식입니다.

#### (3) `PartLessons.vue`: 파트 소개의 레슨 표

```ts:line-numbers=6
const props = defineProps<{ dir: string }>()
const part = curriculum.find((p) => p.dir === props.dir)
```

마크다운에서 `dir`을 받아 해당 파트 하나를 찾고, 그 파트의 레슨만 표로 그립니다. 파트 소개 11개 페이지가 모두 같은 컴포넌트를 `dir`만 바꿔 씁니다. 이 가이드의 파트 소개 페이지 위쪽 표도 이 컴포넌트입니다.

#### (4) `ProgressChecklist.vue`: 진도 체크리스트

```ts:line-numbers=9
const parts = curriculum.filter((p) => p.dir !== 'appendix')
const total = parts.reduce((sum, p) => sum + p.lessons.length, 0)

const keyOf = (dir: string, slug: string) => `${dir}/${slug}`
```

체크 상태를 저장할 때 **`dir/slug`를 열쇠(key)로** 씁니다. 그래서 레슨 제목을 고쳐도 체크 기록이 유지되고, 순서를 바꿔도 기록이 섞이지 않습니다. 반대로 `slug`를 바꾸면 그 레슨의 기존 체크 기록은 찾을 수 없게 됩니다. 컴포넌트 코드 자체는 [4-5](./05-theme-components)에서 자세히 읽습니다.

**확인 방법:** 위 네 곳에서 `curriculum`이 각각 어떤 화면을 만드는지 표로 정리해 보고, 개발 서버에서 네 화면(사이드바, `/guide/toc`, `/part0-start/`, `/guide/checklist`)을 열어 맞는지 확인합니다.

### 5단계: 레슨 하나 추가하는 절차

Part 4에 "Web Worker" 레슨을 7번째로 추가한다고 해 봅시다.

1. **`curriculum.mts`에 항목 추가** — `part4-async`의 `lessons` 배열 끝(108줄 다음)에 한 줄을 넣습니다.

   ```ts
         { slug: '07-web-worker', title: 'Web Worker로 무거운 계산 나누기', minutes: 40 },
   ```

2. **같은 이름의 마크다운 파일 만들기** — `docs/part4-async/07-web-worker.md`. 파일 이름은 `slug` + `.md`와 **글자 하나까지 같아야** 합니다. 내용은 [작성 규칙](../guide/writing-guide)의 뼈대를 따릅니다.
3. **앞뒤 레슨의 "다음 단계" 링크 고치기** — 06번 레슨 끝의 "다음 단계"가 07을 가리키도록 마크다운을 고칩니다. 본문의 링크는 사람이 쓴 글이라 자동으로 바뀌지 않습니다.
4. **손으로 적은 숫자 고치기(필요하면)** — `README.md`, `docs/index.md`의 "75개 레슨" 같은 문구.
5. **확인** — 편집기의 빨간 줄(타입 오류)이 없는지 보고, `npm run build`로 빌드합니다.

`config.mts`, 컴포넌트 4개, 목차·체크리스트 마크다운은 **하나도 고치지 않습니다.** 사이드바 `4-7.` 번호, 목차의 총 레슨 수와 시간, Part 4 소개 표, 체크리스트 항목이 모두 1번 단계만으로 바뀝니다.

### 6단계: 타입이 잡아 주는 오타 (tsc로 실제 확인)

`curriculum.mts`의 인터페이스 부분(4~21줄)을 그대로 복사하고, 데이터에 일부러 실수 네 개를 넣은 파일을 만들었습니다.

```ts:line-numbers=20
export const curriculum: Part[] = [
  {
    dir: 'part0-start',
    no: 0,
    title: '시작하기',
    goal: '첫 TS 프로그램을 실행한다.',
    level: '고수',
    lessons: [
      { slug: '01-what-is-programming', title: '프로그래밍과 JavaScript', minute: 30 },
      { slug: '02-why-typescript', title: '왜 TypeScript인가', minutes: '30' },
      { slug: '03-setup', minutes: 60 },
    ],
  },
]
```

TypeScript 5.6.3으로 검사했습니다.

```bash
npx tsc --strict --noEmit typo.mts
```

```text
typo.mts(26,5): error TS2322: Type '"고수"' is not assignable to type '"입문" | "초급" | "중급" | "고급" | "실전" | "마스터"'.
typo.mts(28,69): error TS2561: Object literal may only specify known properties, but 'minute' does not exist in type 'Lesson'. Did you mean to write 'minutes'?
typo.mts(29,61): error TS2322: Type 'string' is not assignable to type 'number'.
typo.mts(30,7): error TS2741: Property 'title' is missing in type '{ slug: string; minutes: number; }' but required in type 'Lesson'.
```

`(26,5)`는 26번째 줄 5번째 칸이라는 뜻입니다. 네 가지 모두 잡혔습니다.

| 줄 | 실수 | 에러 코드 | 잡히지 않았다면 화면에서는 |
|---|---|---|---|
| 26 | 없는 난이도 `'고수'` | TS2322 | 이상한 배지가 그대로 표시 |
| 28 | `minutes`를 `minute`로 | TS2561(“`minutes`를 쓰려던 것인가요?”까지 알려 줌) | 시간이 `undefined`, 총 시간이 `NaN` |
| 29 | 숫자 대신 문자열 `'30'` | TS2322 | 합계가 숫자 덧셈이 아니라 문자열 이어 붙이기(`"030..."`)가 됨 |
| 30 | `title` 빠짐 | TS2741 | 사이드바에 빈 항목 |

ts-wiki 원본 `curriculum.mts` 전체도 같은 방법으로 검사하면 오류 없이 통과합니다(작성 시점 확인).

::: warning 빌드는 타입을 검사하지 않습니다
작은 실습 프로젝트에서 `curriculum.mts`에 `minute: 30` 오타를 넣고 `npx vitepress build docs`를 실행했더니 **`build complete`, 종료 코드 0으로 성공**했습니다. VitePress(정확히는 Vite가 쓰는 esbuild)는 TS 코드에서 타입을 **지우기만** 하고 검사하지 않기 때문입니다. 타입 오류는 **VS Code의 빨간 줄**이나 **`tsc --noEmit`**으로만 보입니다. 커리큘럼을 고친 뒤에는 편집기의 "문제(Problems)" 창을 꼭 확인하세요.
:::

### 7단계: 타입이 잡지 못하는 실수

같은 실험에서, `curriculum.mts`에 `slug: '01-ghost'` 항목을 넣고 **마크다운 파일은 만들지 않은 채** 빌드했습니다. 결과는 역시 **성공(종료 코드 0)**이었고, `dist`에는 `01-ghost.html`이 없었습니다. 사이드바에는 링크가 생기지만 누르면 404입니다.

빌드의 죽은 링크(dead link) 검사는 **마크다운 본문의 링크**만 봅니다([4-6](./06-scripts-and-rules)에서 실제 에러를 재현합니다). 설정과 컴포넌트가 계산으로 만든 링크는 검사 대상이 아닙니다.

| 실수 | 편집기·tsc | `vitepress build` | 결과 |
|---|---|---|---|
| 필드 이름 오타, 타입 틀림, 필드 빠짐 | 잡음 | 통과 | 화면이 이상하게 나옴 |
| `slug`와 파일 이름 불일치, 파일 없음 | 못 잡음 | 통과 | 사이드바 링크가 404 |
| 마크다운 본문 속 없는 페이지 링크 | 못 잡음 | **실패** | 배포 전에 알 수 있음 |

그래서 레슨을 추가한 뒤에는 **개발 서버에서 사이드바의 새 링크를 직접 눌러 보는 것**까지가 확인 절차입니다.

## ts-wiki에서는

- `docs/.vitepress/curriculum.mts`(202줄)가 파트 11개·레슨 79개(부록 4개 포함)의 유일한 원본입니다.
- 읽는 곳은 `config.mts` 2줄, `CurriculumToc.vue` 4줄, `PartLessons.vue` 4줄, `ProgressChecklist.vue` 5줄의 `import` 네 군데입니다.
- 마크다운에서는 `docs/guide/toc.md`가 `CurriculumToc`를, `docs/guide/checklist.md`가 `ProgressChecklist`를, 각 파트의 `index.md` 11개가 `PartLessons`를 한 줄로 부릅니다.
- `README.md` 47~49줄의 "문서 추가·수정 방법"이 이 레슨 5단계의 축약판입니다. 1번이 "`curriculum.mts`에 항목을 추가합니다"인 것이 단일 출처 설계를 그대로 보여 줍니다.
- 이 가이드(wiki-server-guide)도 같은 설계입니다. `level`에 `'고급'`, `'마스터'`가 없는 등 데이터만 다르고, 구조는 똑같습니다.

## 자주 하는 실수

### 1. 사이드바 링크를 눌렀더니 404

- **증상**: 새 레슨이 사이드바에는 보이는데 누르면 "PAGE NOT FOUND"가 나옵니다.
- **원인**: `slug`와 파일 이름이 다릅니다(예: `slug: '07-web-worker'`, 파일 `07-webworker.md`). 또는 파일을 다른 파트 폴더에 만들었습니다.
- **해결**: 주소창의 경로와 실제 파일 경로를 글자 단위로 비교합니다. 빌드가 이 실수를 잡지 못한다는 점(7단계)을 기억하세요.

### 2. 목차의 총 시간이 `NaN`

- **증상**: 전체 목차 상단에 "약 NaN시간"이 나옵니다.
- **원인**: 어떤 레슨에 `minutes`가 없거나 철자가 틀렸습니다(`undefined`를 더하면 `NaN`).
- **해결**: VS Code에서 `curriculum.mts`를 열어 빨간 줄을 찾거나 `tsc --noEmit`을 실행합니다. 6단계의 TS2561 메시지가 위치를 알려 줍니다.

### 3. 진도 체크 기록이 사라짐

- **증상**: 레슨 파일 이름을 바꾼 뒤 체크해 둔 레슨이 체크 해제되어 보입니다.
- **원인**: 체크 기록의 열쇠가 `dir/slug`라서, `slug`(또는 `dir`)가 바뀌면 다른 레슨으로 취급됩니다.
- **해결**: 한 번 공개한 `slug`는 가능하면 바꾸지 않습니다. 제목(`title`)은 바꿔도 괜찮습니다.

### 4. 순서를 바꿨는데 본문의 "다음 단계"가 엉뚱한 곳을 가리킴

- **증상**: 사이드바 순서와 페이지 하단 이전/다음 버튼은 바뀌었는데, 본문 끝 "다음 단계" 링크는 예전 레슨을 가리킵니다.
- **원인**: 본문 링크는 사람이 쓴 글이라 단일 출처에서 계산되지 않습니다.
- **해결**: 순서를 바꾸면 영향받는 레슨의 "다음 단계"를 직접 고칩니다.

## 직접 해 보기

### 과제 1 ⭐ 숫자 맞히기

이 가이드(wiki-server-guide)의 `curriculum.mts`를 열어, 부록을 뺀 레슨 수를 세어 보세요. 그리고 이 가이드의 [전체 목차](../guide/toc)에 나온 숫자와 비교하세요.

::: details 힌트
`grep -c "slug: '" docs/.vitepress/curriculum.mts`로 레슨 줄을 셀 수 있습니다(인터페이스의 `slug: string` 줄은 따옴표가 없어 세지 않습니다). 여기서 부록 레슨 수를 빼면 됩니다. 목차 페이지의 숫자는 같은 데이터에서 계산되므로 반드시 일치해야 합니다.
:::

### 과제 2 ⭐⭐ 레슨 추가하기

복사본(`ts-wiki-lab`)에서 5단계 절차대로 `part4-async`에 `07-web-worker` 레슨을 추가하고, 사이드바·Part 4 소개 표·체크리스트에 모두 나타나는지 확인하세요.

::: details 확인할 것
- 사이드바에 `4-7. Web Worker로 무거운 계산 나누기`
- `/part4-async/` 표 맨 아래에 `4-7`, `40분`
- `/guide/checklist`의 Part 4에 체크박스 7개, 전체 레슨 수 76
- `/guide/toc`의 요약 숫자가 76개 레슨으로 바뀜
:::

### 과제 3 ⭐⭐ 타입 오류 재현

복사본의 `curriculum.mts`에서 레슨 하나의 `minutes`를 `minute`으로 바꾸고, VS Code에서 어떤 메시지가 뜨는지 확인한 뒤 되돌리세요.

::: details 정답 보기
6단계와 같은 TS2561 메시지(`Did you mean to write 'minutes'?`)가 빨간 물결 줄과 함께 뜹니다. 그 상태에서 `npm run dev`를 실행해 보면 서버는 그대로 뜨고 목차의 시간이 이상하게 나오는 것도 확인할 수 있습니다.
:::

### 과제 4 ⭐⭐⭐ 새 필드 추가 설계

레슨마다 "선수 레슨"을 적고 싶습니다. `Lesson` 인터페이스에 어떤 필드를 어떤 타입으로 추가하면 좋을까요? 기존 75개 레슨을 모두 고치지 않아도 되게 하려면요?

::: details 정답 예시
```ts
export interface Lesson {
  slug: string
  title: string
  minutes: number
  /** 먼저 끝내야 하는 레슨. 'part1-basics/06-functions' 형식 */
  requires?: string[]
}
```

`?`를 붙여 **선택 속성**으로 만들면 기존 데이터는 그대로 통과합니다. 형식을 `dir/slug`로 정하면 `ProgressChecklist`의 열쇠와 같아서, "선수 레슨을 끝냈는지"도 계산할 수 있습니다.
:::

## 확인 퀴즈

1. 단일 출처 설계에서 "데이터"와 "화면"은 각각 어디에 있나요?
2. 레슨 번호(`0-1`)를 데이터에 적지 않는 이유는?
3. `curriculum.mts`에 오타가 있어도 `vitepress build`가 성공하는 이유는?
4. 진도 체크리스트가 레슨을 구분하는 열쇠는 무엇이고, 그래서 바꾸면 안 되는 필드는?
5. 새 레슨을 추가할 때 단일 출처가 **자동으로 해 주지 않는** 일 두 가지는?

::: details 정답 보기
1. 데이터는 `curriculum.mts` 한 곳, 화면은 config 사이드바와 컴포넌트 3개가 그 데이터로 계산해 만듭니다.
2. 배열 순서에서 계산할 수 있으므로, 적어 두면 순서를 바꿀 때마다 다시 매겨야 하고 틀릴 수 있습니다.
3. Vite(esbuild)가 타입을 지우기만 하고 검사하지 않기 때문입니다.
4. `dir/slug`. 그래서 `slug`와 `dir`은 공개 후 가능하면 바꾸지 않습니다.
5. 마크다운 파일 만들기, 본문의 "다음 단계" 링크와 README·홈의 손으로 적은 숫자 고치기(이 중 두 가지면 정답).
:::

## 정리

- 같은 목록이 여러 화면에 나오면, 데이터를 한 곳에만 두고 화면은 모두 계산으로 만듭니다(단일 출처).
- `curriculum.mts`는 `Lesson`·`Part` 인터페이스와 `curriculum: Part[]` 데이터로 이루어지고, 번호와 주소는 적지 않고 계산합니다.
- 이 파일을 읽는 곳은 config 사이드바, `CurriculumToc`, `PartLessons`, `ProgressChecklist` 네 곳입니다.
- 레슨 추가는 "`curriculum.mts` 한 줄 + 마크다운 파일 하나"가 기본입니다.
- 타입은 오타를 잡지만 **빌드는 타입을 검사하지 않습니다.** 편집기의 빨간 줄이나 `tsc --noEmit`으로 확인하고, 파일이 실제로 있는지는 링크를 눌러 확인합니다.

## 다음 단계

[테마 확장과 커스텀 컴포넌트](./05-theme-components)에서 이 데이터를 화면으로 그리는 Vue 컴포넌트 4개와, 그것을 기본 테마에 붙이는 `theme/index.ts`를 읽습니다.
