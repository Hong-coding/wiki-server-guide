---
title: 테마 확장과 커스텀 컴포넌트
---

# 테마 확장과 커스텀 컴포넌트

<LessonMeta level="중급" :minutes="60" prev="curriculum.mts 한 곳의 데이터로 사이드바·목차·파트 표·체크리스트를 모두 만든다" />

## 이번에 배울 것

- `theme/index.ts`가 기본 테마를 어떻게 확장하는지(`extends`, `enhanceApp`, `satisfies Theme`) 설명할 수 있다.
- `custom.css`에서 CSS 변수로 브랜드 색과 글꼴을 바꾸고, 다크 모드 색을 따로 정할 수 있다.
- 컴포넌트 4개(`LessonMeta`, `CurriculumToc`, `PartLessons`, `ProgressChecklist`)의 props와 동작을 읽을 수 있다.
- 링크에 `withBase`를 써야 하는 이유와, `localStorage`를 `onMounted` 안에서만 읽어야 하는 이유(SSR)를 실제 빌드 결과로 설명할 수 있다.
- 마크다운에서 이 컴포넌트들을 쓰는 법을 안다.

## 먼저 알아 둘 것

- Vue 단일 파일 컴포넌트(`.vue`)의 `script setup` · `template` · `style` 구조 → [Vite와 Vue](../part3-libraries/02-vite-vue)
- VitePress 테마의 개념 → [VitePress: 설정 · 라우팅 · 테마](../part3-libraries/01-vitepress)
- `curriculum` 데이터 구조 → [단일 출처 설계: curriculum.mts](./04-curriculum)

## 비유로 이해하기

VitePress 기본 테마는 **잘 지어진 기성 아파트**입니다. 거실·방·주방(내비게이션, 사이드바, 본문, 검색)이 이미 다 있습니다. ts-wiki는 이 아파트를 허물고 새로 짓지 않고 **인테리어만 합니다.**

- 벽지 색 바꾸기 → `custom.css`의 CSS 변수
- 맞춤 가구 들이기 → `components/*.vue`
- 가구를 모든 방에서 쓸 수 있게 등록 → `theme/index.ts`의 `enhanceApp`

기성 아파트의 구조(기본 테마)는 그대로라서, 건설사가 아파트를 고쳐 주면(VitePress 업데이트) 우리 인테리어도 대부분 그대로 유지됩니다.

## 개념 설명

### 1단계: `theme/index.ts` (18줄)

```ts:line-numbers
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import LessonMeta from './components/LessonMeta.vue'
import CurriculumToc from './components/CurriculumToc.vue'
import PartLessons from './components/PartLessons.vue'
import ProgressChecklist from './components/ProgressChecklist.vue'
import './custom.css'

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

VitePress는 `docs/.vitepress/theme/index.ts`(또는 `.js`)가 **있으면** 그것을 테마로 쓰고, 없으면 기본 테마를 씁니다. 이 파일을 만드는 순간 "테마를 내가 정하겠다"는 뜻이 되므로, 기본 테마를 계속 쓰려면 명시적으로 이어받아야 합니다.

| 줄 | 코드 | 뜻 |
|---|---|---|
| 1 | `import DefaultTheme from 'vitepress/theme'` | 기본 테마 객체 |
| 2 | `import type { Theme }` | 테마 객체의 모양(타입). `type`이라 실행 코드에는 남지 않습니다 |
| 3~6 | `.vue` 파일 4개 불러오기 | 컴포넌트 |
| 7 | `import './custom.css'` | 값을 받지 않고 **불러오기만** 하는 import. 이것만으로 CSS가 사이트 전체에 적용됩니다 |
| 10 | `extends: DefaultTheme` | 기본 테마의 레이아웃·스타일·기능을 전부 이어받기 |
| 11 | `enhanceApp({ app })` | 사이트의 Vue 앱이 만들어질 때 한 번 불리는 함수. `app`은 그 Vue 앱 |
| 13~16 | `app.component('이름', 컴포넌트)` | **전역 등록**: 모든 페이지에서 이 이름으로 쓸 수 있게 함 |
| 18 | `satisfies Theme` | 이 객체가 `Theme` 모양을 지키는지 검사 |

#### 전역 등록을 하는 이유

VitePress 마크다운은 Vue 템플릿으로도 처리되어, 원래는 페이지마다 이렇게 불러와야 컴포넌트를 쓸 수 있습니다.

```md
<script setup>
import PartLessons from '../.vitepress/theme/components/PartLessons.vue'
</script>

<PartLessons dir="part0-start" />
```

파트 소개 11개, 레슨 75개마다 이 세 줄을 넣는 것은 번거롭고, 경로를 틀리기 쉽습니다. 전역 등록을 하면 마크다운에는 **태그 한 줄**만 쓰면 됩니다. 글을 쓰는 사람이 컴포넌트 파일 위치를 몰라도 됩니다.

#### `satisfies Theme`를 쓰는 이유

`satisfies`는 TypeScript 4.9부터 쓸 수 있는 연산자로, "이 값이 이 타입에 맞는지 **검사만** 하고, 값의 타입은 그대로 두라"는 뜻입니다.

- `enhanceApp({ app })`의 `app`에 타입을 적지 않았는데도 VS Code가 `app.component`를 자동 완성해 주는 것은, `satisfies Theme` 덕분에 TS가 "이건 `Theme`의 `enhanceApp`이다"라고 알기 때문입니다.
- `extend: DefaultTheme`(s 빠짐)처럼 틀리면 "`Theme`에 없는 속성"이라고 바로 알려 줍니다.
- `const theme: Theme = {...}`로 타입을 붙여도 검사는 되지만, 그러면 값의 타입이 넓은 `Theme`으로 바뀌어 버립니다. `satisfies`는 검사와 "원래 모양 유지"를 함께 얻는 방법입니다.

**확인 방법:** VS Code에서 11줄의 `app` 위에 마우스를 올려 `App` 타입이 표시되면, `satisfies Theme`이 타입 정보를 넘겨주고 있는 것입니다.

### 2단계: `custom.css` (27줄)

```css:line-numbers
/* TypeScript 공식 색(#3178c6) 계열로 브랜드 색을 맞춥니다. */
:root {
  --vp-c-brand-1: #3178c6;
  --vp-c-brand-2: #235a97;
  --vp-c-brand-3: #1a4a80;
  --vp-c-brand-soft: rgba(49, 120, 198, 0.14);
  --vp-font-family-base: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

.dark {
  --vp-c-brand-1: #6ea8ec;
  --vp-c-brand-2: #4f8fd9;
  --vp-c-brand-3: #3178c6;
  --vp-c-brand-soft: rgba(110, 168, 236, 0.16);
}

/* 한국어 본문 가독성: 줄간격을 조금 넓힙니다. */
.vp-doc p,
.vp-doc li {
  line-height: 1.85;
  word-break: keep-all;
}

/* 접기(정답) 블록을 눈에 띄게 */
.vp-doc .details {
  border-left: 4px solid var(--vp-c-brand-1);
}
```

#### CSS 변수로 색을 바꾸는 원리

`--vp-c-brand-1` 같은 `--`로 시작하는 이름은 **CSS 변수**(custom property)입니다. 기본 테마는 버튼, 링크, 강조 표시 등 수백 곳에서 색을 직접 적지 않고 `var(--vp-c-brand-1)`처럼 변수를 참조합니다. 그래서 우리는 변수 값 네 개만 바꾸면 사이트 전체의 강조 색이 바뀝니다. 기본 테마의 CSS를 하나하나 덮어쓸 필요가 없습니다.

| 변수 | 쓰이는 곳(대략) |
|---|---|
| `--vp-c-brand-1` | 링크 글자, 활성 메뉴, 강조 텍스트 |
| `--vp-c-brand-2` | 마우스를 올렸을 때(hover) 색 |
| `--vp-c-brand-3` | 홈 화면 주 버튼 배경 등 진한 색 |
| `--vp-c-brand-soft` | 옅은 배경(배지, 선택된 항목 배경) |
| `--vp-font-family-base` | 본문 글꼴 |

- 2줄 `:root`는 문서의 뿌리(`<html>`)입니다. 여기 정한 변수는 모든 요소가 물려받습니다.
- 10줄 `.dark`: 다크 모드를 켜면 기본 테마가 `<html>`에 `dark` 클래스를 붙입니다. 그때 이 값들이 `:root`의 값을 덮어씁니다. 어두운 배경에서는 같은 파란색이 너무 어두워 보이므로 **더 밝은 파란색**(`#6ea8ec`)을 따로 지정했습니다. 다크 모드 값을 안 정하면 어두운 배경 위에 진한 파란 글자가 나와 읽기 힘듭니다.
- 7줄 글꼴: 왼쪽부터 차례로, 그 PC에 설치된 첫 번째 글꼴을 씁니다. Pretendard가 없으면 Noto Sans KR, 그것도 없으면 macOS의 Apple SD Gothic Neo, Windows의 맑은 고딕(Malgun Gothic) 순입니다. 이 CSS는 글꼴 파일을 **내려받지 않으므로**, Pretendard가 설치되지 않은 PC에서는 다음 글꼴로 넘어갑니다.
- 18~22줄: `.vp-doc`은 기본 테마의 본문 영역 클래스입니다. `word-break: keep-all`은 한국어 단어 중간에서 줄이 바뀌지 않게 합니다.
- 25~27줄: `::: details` 접기 블록 왼쪽에 브랜드 색 막대를 그립니다. 여기서도 색을 직접 적지 않고 `var(--vp-c-brand-1)`을 써서, 다크 모드에서도 자동으로 밝은 색이 됩니다.

**확인 방법:** 개발 서버를 띄운 채 복사본의 3줄을 `#e8590c`(주황)로 바꿔 저장해 보세요. 새로 고침 없이 링크와 메뉴 강조 색이 바뀌면 성공입니다. 다크 모드로 바꾸면 여전히 파란색인데, `.dark` 쪽 값을 안 바꿨기 때문입니다.

### 3단계: `LessonMeta.vue` — props만 받는 가장 단순한 컴포넌트

```vue:line-numbers
<script setup lang="ts">
// 레슨 상단의 난이도·예상 시간·선수 지식 배지
defineProps<{
  level: string
  minutes: number
  prev?: string
}>()
</script>

<template>
  <div class="lesson-meta">
    <span class="badge level">난이도 · {{ level }}</span>
    <span class="badge time">⏱ 약 {{ minutes }}분</span>
    <span v-if="prev" class="prev">이전 내용: {{ prev }}</span>
  </div>
</template>
```

(18~43줄의 `<style scoped>`는 생략. `scoped`는 이 스타일이 이 컴포넌트 안에만 적용된다는 뜻입니다.)

- **props**(properties, 컴포넌트가 바깥에서 받는 값)는 3개: `level`(문자열), `minutes`(숫자), `prev`(선택, `?`).
- `defineProps<{...}>()`: 타입으로 props를 선언하는 Vue 3의 방식입니다. `script setup` 안에서는 import 없이 씁니다.
- 템플릿의 이중 중괄호는 "이 자리에 값을 넣어라"는 Vue의 문법(보간, interpolation)입니다.
- `v-if="prev"`: `prev`가 있을 때만 그 줄을 그립니다.

마크다운에서는 이렇게 씁니다. 이 페이지 맨 위의 배지도 이 컴포넌트입니다.

```md
<LessonMeta level="중급" :minutes="60" prev="이전 레슨 요약" />
```

`:minutes`처럼 **앞에 콜론**이 붙은 것에 주목하세요. Vue에서 콜론은 "따옴표 안을 JavaScript 식으로 읽어라"는 뜻(`v-bind`의 줄임)입니다. 콜론이 없으면 `"60"`은 문자열이 되어 `minutes: number` 약속과 맞지 않습니다. `level`과 `prev`는 원래 문자열이라 콜론이 없습니다.

### 4단계: `PartLessons.vue` — props로 데이터를 골라 그리기

```vue:line-numbers
<script setup lang="ts">
// 파트 소개 페이지의 레슨 목록
import { withBase } from 'vitepress'
import { curriculum } from '../../curriculum.mts'

const props = defineProps<{ dir: string }>()
const part = curriculum.find((p) => p.dir === props.dir)
</script>

<template>
  <div v-if="part">
    <p class="goal">🎯 <strong>이 파트를 마치면:</strong> {{ part.goal }}</p>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>레슨</th>
          <th>예상 시간</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(lesson, i) in part.lessons" :key="lesson.slug">
          <td>{{ part.dir === 'appendix' ? i + 1 : `${part.no}-${i + 1}` }}</td>
          <td>
            <a :href="withBase(`/${part.dir}/${lesson.slug}`)">{{ lesson.title }}</a>
          </td>
          <td>{{ lesson.minutes ? `${lesson.minutes}분` : '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

- 6줄: `defineProps`의 결과를 `props`에 받아 둡니다. 3단계(`LessonMeta`)와 달리 스크립트 안에서 값을 써야 하기 때문입니다.
- 7줄: `find`는 조건에 맞는 **첫 원소**를 돌려주고, 없으면 `undefined`입니다.
- 11줄 `v-if="part"`: `dir`을 잘못 적어 파트를 못 찾으면 **아무것도 그리지 않습니다.** 에러로 페이지 전체가 깨지는 대신 조용히 비는 쪽을 택한 것입니다. 표가 안 보이면 `dir` 오타를 의심하세요.
- 22줄 `v-for`: 배열을 돌며 `<tr>`을 반복해 그립니다. `:key`는 Vue가 각 줄을 구별하는 이름표로, 바뀌지 않는 값(`slug`)을 씁니다.
- 23줄: 부록은 `1, 2, 3`, 나머지는 `0-1`처럼 번호를 붙입니다(사이드바와 같은 규칙).
- 27줄: `minutes`가 `0`이면 JavaScript에서 거짓으로 취급되어 `-`가 나옵니다. 부록의 `minutes: 0`이 여기서 쓰입니다.

마크다운에서는 이렇게 씁니다. 이 가이드의 모든 파트 소개 페이지에 이 줄이 있습니다.

```md
<PartLessons dir="part4-anatomy" />
```

### 5단계: `withBase`를 쓰는 이유 (실험)

25줄은 링크 주소를 `withBase(...)`로 감쌌습니다. [4-3](./03-config)에서 본 것처럼 GitHub Pages에서는 base가 `/ts-wiki/`인데, **Vue 컴포넌트에 직접 쓴 `href`에는 VitePress가 base를 붙여 주지 않습니다.** 마크다운 링크와 `themeConfig`의 링크만 자동으로 처리됩니다.

작은 실습 프로젝트에서 두 링크를 나란히 넣은 컴포넌트를 만들고 `--base /ts-wiki/`로 빌드했습니다.

```vue
<script setup lang="ts">
import { withBase } from 'vitepress'
</script>
<template>
  <a class="t1" :href="withBase('/guide/roadmap')">withBase 사용</a>
  <a class="t2" :href="'/guide/roadmap'">그대로</a>
</template>
```

빌드 결과 HTML:

```text
<a class="t1" href="/ts-wiki/guide/roadmap"
<a class="t2" href="/guide/roadmap"
```

`withBase`를 쓰지 않은 링크는 저장소 이름이 빠져서, Pages에서 누르면 404가 납니다. 반대로 개발 서버나 Docker(base가 `/`)에서는 둘 다 똑같이 동작하므로 **로컬에서는 이 실수를 발견할 수 없습니다.** 그래서 컴포넌트의 모든 내부 링크는 처음부터 `withBase`로 감싸는 것이 규칙입니다.

ts-wiki 복사본을 `WIKI_BASE=/ts-wiki/`로 빌드했을 때도, `CurriculumToc`가 그린 목차 링크가 `href="/ts-wiki/part0-start/01-what-is-programming"`으로 제대로 나온 것을 확인했습니다.

### 6단계: `CurriculumToc.vue` — 계산해서 그리기

스크립트 부분(1~14줄)은 [4-4](./04-curriculum)에서 읽었으니, 템플릿만 봅니다.

```vue:line-numbers=16
<template>
  <p class="summary">
    총 <strong>{{ lessonParts.length }}개 파트</strong> · <strong>{{ totalLessons }}개 레슨</strong> · 부록 {{ appendixCount }}개 ·
    예상 학습 시간 약 <strong>{{ totalHours }}시간</strong> (연습 문제 포함)
  </p>
  <section v-for="part in curriculum" :key="part.dir" class="part">
    <h3>
      <a :href="withBase(`/${part.dir}/`)">
        {{ part.dir === 'appendix' ? part.title : `Part ${part.no}. ${part.title}` }}
      </a>
      <span class="level">{{ part.level }}</span>
      <span v-if="part.dir !== 'appendix'" class="hours">
        약 {{ partHours(part.lessons.map((l) => l.minutes)) }}시간
      </span>
    </h3>
    <p class="goal">🎯 {{ part.goal }}</p>
    <ol>
      <li v-for="lesson in part.lessons" :key="lesson.slug">
        <a :href="withBase(`/${part.dir}/${lesson.slug}`)">{{ lesson.title }}</a>
        <span v-if="lesson.minutes" class="min">{{ lesson.minutes }}분</span>
      </li>
    </ol>
  </section>
</template>
```

- props가 없습니다. 마크다운에 `<CurriculumToc />` 한 줄만 쓰면 전체 목차가 나옵니다.
- 17~20줄의 요약은 스크립트에서 계산한 값(파트 10개, 레슨 75개, 부록 4개, 약 80시간)을 넣습니다.
- 21줄 `v-for`가 파트마다 `<section>`을, 33줄 `v-for`가 레슨마다 `<li>`를 그립니다. 반복 안에 반복이 있는 구조는 config의 `map` 안의 `map`과 같습니다.

### 7단계: `ProgressChecklist.vue` — 브라우저에 저장하기

이 컴포넌트는 4개 중 유일하게 **상태**(사용자가 바꾸는 값)를 가집니다.

```vue:line-numbers
<script setup lang="ts">
// 레슨별 완료 체크. 진도는 이 브라우저의 localStorage에만 저장됩니다(서버 저장 없음).
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { curriculum } from '../../curriculum.mts'

const STORAGE_KEY = 'ts-wiki-progress-v1'
const done = ref<Record<string, boolean>>({})
const parts = curriculum.filter((p) => p.dir !== 'appendix')
const total = parts.reduce((sum, p) => sum + p.lessons.length, 0)

const keyOf = (dir: string, slug: string) => `${dir}/${slug}`
const doneCount = computed(() => Object.values(done.value).filter(Boolean).length)
const percent = computed(() => Math.round((doneCount.value / total) * 100))
const partDone = (dir: string) =>
  parts.find((p) => p.dir === dir)!.lessons.filter((l) => done.value[keyOf(dir, l.slug)]).length

// SSR 빌드 중에는 localStorage가 없으므로 마운트 후에만 읽습니다.
onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) done.value = JSON.parse(saved) as Record<string, boolean>
  } catch {
    // 사생활 보호 모드 등에서 저장소 접근이 막히면 저장 없이 동작합니다.
  }
})

watch(
  done,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // 저장 실패는 무시합니다.
    }
  },
  { deep: true },
)

function reset() {
  if (confirm('진도 기록을 모두 지울까요?')) done.value = {}
}
</script>
```

#### 상태와 계산 값

| 줄 | 코드 | 뜻 |
|---|---|---|
| 7 | `STORAGE_KEY = 'ts-wiki-progress-v1'` | 저장 이름. 끝의 `-v1`은 나중에 저장 형식을 바꿀 때 `-v2`로 옮겨 가기 위한 여지입니다 |
| 8 | `ref<Record<string, boolean>>({})` | 반응형 상태. `{ 'part0-start/01-...': true, ... }` 모양. `ref` 값이 바뀌면 화면이 다시 그려집니다 |
| 13~14 | `computed(...)` | 상태에서 계산되는 값(완료 수, 퍼센트). `done`이 바뀌면 자동으로 다시 계산됩니다 |
| 16 | `find(...)!` | 끝의 `!`는 "반드시 찾는다"고 TS에 단언하는 것. 인자로 항상 `parts`에서 꺼낸 `dir`만 들어오기 때문에 안전합니다 |
| 61줄(템플릿) | `v-model="done[keyOf(...)]"` | 체크박스와 상태를 양방향으로 연결 |

#### `localStorage`와 SSR — 왜 `onMounted` 안에서만 읽나

`localStorage`는 **브라우저에만 있는** 저장소입니다. 사이트 주소마다 따로, 그 브라우저 안에만 저장되고 서버로는 보내지지 않습니다. 그래서 다른 PC나 다른 브라우저에서는 진도가 보이지 않습니다(`docs/guide/checklist.md`에 이 점을 안내해 두었습니다).

문제는 **빌드**입니다. VitePress는 빌드할 때 Node.js 안에서 모든 페이지를 미리 HTML로 그립니다. 이것을 **SSR**(Server-Side Rendering, 서버 쪽 렌더링)이라고 합니다. Node.js에는 브라우저가 아니므로 `localStorage`가 없습니다.

- `script setup`의 맨 위 코드는 SSR 중에도 실행됩니다.
- `onMounted(...)` 안의 코드는 **브라우저에서 화면에 붙은 뒤에만** 실행되고, SSR 중에는 실행되지 않습니다.

그래서 19줄에서 `onMounted` 안에서만 읽습니다. 18줄 주석이 바로 이 이유입니다.

정말 그런지 실험했습니다. 작은 실습 프로젝트에 **맨 위에서 바로** `localStorage`를 읽는 컴포넌트를 만들어 페이지에 넣고 빌드했습니다.

```vue
<script setup lang="ts">
const saved = localStorage.getItem('k')
</script>
<template><p>{{ saved }}</p></template>
```

```text
  vitepress v1.6.3

- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
ReferenceError: localStorage is not defined
    at setup (file:///.../docs/.vitepress/.temp/app.js:4816:19)
    ...
✓ rendering pages...
build complete in 11.11s.
```

주목할 점이 두 가지입니다.

1. `ReferenceError: localStorage is not defined` — Node.js에 `localStorage`가 없다는 에러입니다.
2. 그런데도 마지막 줄은 `build complete`이고 **종료 코드도 0(성공)**이었습니다(VitePress 1.6.3 기준). 결과 HTML을 열어 보니 그 컴포넌트 자리가 비어 있었습니다(`<!---->`).

즉 이 실수는 빌드를 멈추지 않고 **조용히 넘어갈 수 있습니다.** Actions 로그를 읽지 않으면 모르고 배포됩니다. 빌드 로그에 `ReferenceError`가 있는지 꼭 확인하세요.

#### `try/catch`로 감싼 이유

`onMounted` 안이라도 `localStorage` 접근은 실패할 수 있습니다.

- 일부 브라우저의 사생활 보호 모드나 보안 설정에서는 저장소 접근 자체가 막혀 에러가 납니다.
- 저장 공간이 가득 차면 `setItem`이 에러를 냅니다.
- 다른 프로그램이나 사람이 저장된 값을 망가뜨리면 `JSON.parse`가 에러를 냅니다.

에러를 잡지 않으면 체크리스트 전체가 그려지지 않습니다. `try/catch`로 감싸 두면 **저장만 안 될 뿐 체크리스트는 동작합니다.** 진도 기록은 "있으면 좋은" 기능이라 실패해도 페이지를 망가뜨리지 않는 쪽을 택한 것입니다.

#### `watch`와 `deep: true`

28~38줄의 `watch`는 `done`이 바뀔 때마다 저장합니다. `done`은 객체이고 체크할 때는 그 **안쪽 속성**만 바뀌므로, `deep: true`가 있어야 안쪽 변화까지 감지합니다. `watch`는 브라우저에서 값이 바뀔 때만 실행되므로, SSR 중에 `localStorage`를 건드리지 않습니다.

마크다운에서는 이렇게 씁니다.

```md
<ProgressChecklist />
```

**확인 방법:** 개발 서버의 `/guide/checklist`에서 레슨 몇 개를 체크하고 새로 고침해도 체크가 남아 있으면 저장이 동작하는 것입니다. 브라우저 개발자 도구(`F12`) → Application(애플리케이션) → Local Storage에서 `ts-wiki-progress-v1` 항목을 직접 볼 수 있습니다.

## ts-wiki에서는

- `docs/.vitepress/theme/` 아래 파일 6개(`index.ts`, `custom.css`, 컴포넌트 4개)가 테마의 전부입니다. 기본 테마의 레이아웃은 하나도 다시 만들지 않았습니다.
- 컴포넌트 사용처: `LessonMeta`는 모든 레슨 맨 위, `PartLessons`는 파트 소개 `index.md` 11개, `CurriculumToc`는 `docs/guide/toc.md`, `ProgressChecklist`는 `docs/guide/checklist.md`.
- 내부 링크를 그리는 세 컴포넌트(`CurriculumToc` 23·34줄, `PartLessons` 25줄, `ProgressChecklist` 62줄)는 모두 `withBase`를 씁니다. 링크가 없는 `LessonMeta`만 쓰지 않습니다.
- 이 가이드(wiki-server-guide)의 테마도 같은 구성입니다. 이 페이지 맨 위 배지와 Part 4 소개의 레슨 표가 바로 이 레슨에서 읽은 컴포넌트입니다.

## 자주 하는 실수

### 1. 컴포넌트 태그를 썼는데 화면에 아무것도 안 나옴

- **증상**: 마크다운에 `<PartLessons dir="part4-anatom" />`을 썼는데 표가 없습니다. 에러도 없습니다.
- **원인**: `dir` 오타로 파트를 못 찾아 `v-if="part"`가 거짓이 되었습니다.
- **해결**: `dir` 값이 `curriculum.mts`의 `dir`과 정확히 같은지 확인합니다.

### 2. `Failed to resolve component: ...` 경고

- **증상**: 개발 서버 브라우저 콘솔(`F12`)에 위 경고가 나오고 태그가 그대로 남습니다.
- **원인**: 새 컴포넌트를 만들고 `theme/index.ts`의 `enhanceApp`에서 `app.component(...)`로 등록하지 않았거나, 이름 철자가 다릅니다.
- **해결**: import와 `app.component('이름', ...)`을 추가하고, 마크다운의 태그 이름과 맞춥니다.

### 3. 빌드 로그에 `ReferenceError: localStorage is not defined` (또는 `window`, `document`)

- **증상**: 빌드는 성공했다고 나오는데 로그 중간에 위 에러가 있고, 배포된 페이지의 컴포넌트 자리가 비어 있습니다.
- **원인**: 브라우저 전용 객체를 `script setup` 맨 위에서 바로 썼습니다.
- **해결**: `onMounted` 안으로 옮기고, 실패할 수 있는 접근은 `try/catch`로 감쌉니다.

### 4. Pages에서만 컴포넌트 링크가 404

- **증상**: 로컬과 Docker에서는 되는데 GitHub Pages에서 목차 링크가 `https://<사용자>.github.io/guide/...`(저장소 이름 없음)로 갑니다.
- **원인**: 컴포넌트 안 `href`에 `withBase`를 쓰지 않았습니다.
- **해결**: `:href="withBase(...)"`로 감쌉니다. 확인은 `WIKI_BASE`를 넣고 빌드한 뒤 결과 HTML의 링크를 검색합니다.

### 5. `:minutes="60"` 대신 `minutes="60"`

- **증상**: 화면에는 "약 60분"이 잘 나오지만, `minutes`로 계산을 하는 코드가 이상한 값을 냅니다. 개발 중 콘솔에 props 타입 경고가 날 수 있습니다.
- **원인**: 콜론이 없으면 문자열 `"60"`이 전달됩니다.
- **해결**: 숫자·불리언·배열을 넘길 때는 반드시 콜론(`:`)을 붙입니다.

## 직접 해 보기

### 과제 1 ⭐ 브랜드 색 바꾸기

복사본의 `custom.css`에서 라이트·다크 모드의 `--vp-c-brand-1`을 각각 초록 계열(`#2f9e44`, `#69db7c`)로 바꾸고 두 모드를 모두 확인하세요.

::: details 정답 보기
3줄과 11줄을 바꿉니다. 한쪽만 바꾸면 다른 모드에서는 원래 파란색이 남습니다. 버튼의 hover 색까지 맞추려면 `brand-2`, `brand-3`, `brand-soft`도 같은 계열로 바꿉니다.
:::

### 과제 2 ⭐⭐ 새 배지 props 추가

`LessonMeta`에 선택 props `tag?: string`을 추가해, 값이 있으면 "주제 · 값" 배지를 하나 더 보여 주세요.

::: details 정답 예시
```vue
<script setup lang="ts">
defineProps<{
  level: string
  minutes: number
  prev?: string
  tag?: string
}>()
</script>

<template>
  <div class="lesson-meta">
    <span class="badge level">난이도 · {{ level }}</span>
    <span class="badge time">⏱ 약 {{ minutes }}분</span>
    <span v-if="tag" class="badge time">주제 · {{ tag }}</span>
    <span v-if="prev" class="prev">이전 내용: {{ prev }}</span>
  </div>
</template>
```

마크다운에서 `tag="서버"`를 추가하면 배지가 보이고, 없는 레슨은 그대로입니다. 선택 속성(`?`)이라 기존 레슨을 고칠 필요가 없습니다.
:::

### 과제 3 ⭐⭐ SSR 에러 재현

[4-6](./06-scripts-and-rules)에서 만드는 작은 실습 프로젝트에 7단계 실험의 컴포넌트를 넣고 빌드해, 로그의 `ReferenceError`와 종료 코드를 확인하세요. 그다음 읽는 코드를 `onMounted` 안으로 옮겨 에러가 사라지는지 보세요.

::: details 정답 예시
```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const saved = ref<string | null>(null)
onMounted(() => {
  try {
    saved.value = localStorage.getItem('k')
  } catch {
    // 저장소 접근이 막혀도 페이지는 그립니다.
  }
})
</script>
```

종료 코드는 PowerShell에서 `$LASTEXITCODE`, bash에서 `echo $?`로 봅니다. 고치기 전에도 0이 나온다는 점(VitePress 1.6.3에서 확인)이 이 실험의 핵심입니다. 그래서 로그를 읽어야 합니다.
:::

### 과제 4 ⭐⭐⭐ withBase 확인

복사본을 `WIKI_BASE=/ts-wiki/`로 빌드하고(PowerShell은 `$env:WIKI_BASE = '/ts-wiki/'`), `dist/guide/checklist.html`에서 `part0-start/01`이 들어간 링크를 검색해 base가 붙었는지 확인하세요.

::: details 정답 보기
```bash
grep -o 'href="[^"]*part0-start/01[^"]*"' docs/.vitepress/dist/guide/checklist.html | sort | uniq -c
```

`/ts-wiki/part0-start/01-what-is-programming`으로 시작하면 `ProgressChecklist` 62줄의 `withBase`가 동작한 것입니다. 사이드바 링크도 같은 주소라 여러 번 나옵니다.
:::

## 확인 퀴즈

1. `theme/index.ts`에서 `extends: DefaultTheme`를 지우면 어떻게 되나요?
2. `app.component('PartLessons', PartLessons)`가 없으면 마크다운에서 무엇을 해야 하나요?
3. 다크 모드에서 브랜드 색을 따로 정하는 곳은?
4. 컴포넌트 안 링크에 `withBase`가 필요한 이유는?
5. `localStorage`를 `onMounted` 안에서 읽는 이유는?

::: details 정답 보기
1. 기본 테마의 레이아웃·스타일을 이어받지 못해 내비게이션·사이드바 등이 사라집니다.
2. 페이지마다 `<script setup>`에서 컴포넌트를 직접 import해야 합니다.
3. `custom.css`의 `.dark` 블록(10~15줄).
4. 컴포넌트에 직접 쓴 `href`에는 VitePress가 base를 자동으로 붙이지 않기 때문입니다.
5. 빌드(SSR)는 Node.js에서 실행되어 `localStorage`가 없고, `onMounted`는 브라우저에서만 실행되기 때문입니다.
:::

## 정리

- `theme/index.ts`는 `extends: DefaultTheme`로 기본 테마를 이어받고, `enhanceApp`에서 컴포넌트를 전역 등록하며, `satisfies Theme`로 모양을 검사합니다.
- `custom.css`는 CSS 변수(`--vp-c-brand-*`) 값만 바꿔 사이트 전체 색을 바꾸고, `.dark`에서 다크 모드 색을 따로 정합니다.
- 컴포넌트는 props로 값을 받고(`LessonMeta`, `PartLessons`), `curriculum`에서 계산해 그립니다(`CurriculumToc`, `ProgressChecklist`).
- 컴포넌트 안의 내부 링크는 반드시 `withBase`로 감쌉니다. 로컬에서는 차이가 안 보이고 Pages에서만 깨집니다.
- 브라우저 전용 기능은 `onMounted` 안에서, 실패할 수 있으면 `try/catch`로 씁니다. SSR 에러는 빌드를 멈추지 않을 수 있으니 로그를 확인합니다.

## 다음 단계

[보조 스크립트와 문서 작성 규칙](./06-scripts-and-rules)에서 frontmatter 자동 수정 스크립트와, 마크다운이 빌드를 깨뜨리는 대표 사례(YAML 콜론, 꺾쇠, 이중 중괄호, 죽은 링크)를 실제 에러 메시지로 재현합니다.
