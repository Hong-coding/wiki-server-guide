---
title: 진도 체크리스트 컴포넌트 만들기
---

# 진도 체크리스트 컴포넌트 만들기

<LessonMeta level="중급" :minutes="60" prev="curriculum.mts 한 파일로 사이드바를 자동으로 만들었다" />

## 이번에 배울 것

- `docs/.vitepress/theme/index.ts`로 기본 테마를 **확장**하고, 컴포넌트를 전역 등록할 수 있다.
- props를 받는 간단한 Vue 컴포넌트(`LessonMeta`)를 만들어 마크다운 안에서 쓸 수 있다.
- `curriculum.mts`를 읽는 컴포넌트(`PartLessons`, `ProgressChecklist`)를 만들어 단일 출처를 화면까지 넓힐 수 있다.
- localStorage를 `onMounted` 안에서만 읽어야 하는 이유(SSR)를 설명하고, 어기면 빌드 로그에 무엇이 나오는지 안다.
- `custom.css`로 브랜드 색과 본문 글꼴 규칙을 바꿀 수 있다.

## 먼저 알아 둘 것

- [커리큘럼 파일로 사이드바 자동 생성](./04-curriculum-sidebar)까지 마친 `my-wiki`
- Vue·Vite가 VitePress 밑에서 하는 일: [Vite와 Vue: VitePress 밑에서 일하는 것들](../part3-libraries/02-vite-vue)
- ts-wiki 컴포넌트 해설: [테마 확장과 커스텀 컴포넌트](../part4-anatomy/05-theme-components)
- 정적 사이트를 빌드할 때 HTML을 미리 그린다는 개념: [정적 사이트 생성기(SSG)와 빌드](../part1-concepts/05-ssg)

## 비유로 이해하기

VitePress 기본 테마는 **가구가 다 갖춰진 모델하우스**입니다.

- `theme/index.ts`의 `extends: DefaultTheme`는 "모델하우스 가구는 그대로 두고, 내 물건만 몇 개 **더 들여놓겠다**"는 계약입니다. 집을 새로 짓는 것(커스텀 테마)이 아닙니다.
- **컴포넌트**는 들여놓는 맞춤 가구입니다. `LessonMeta`는 문 앞 명패, `PartLessons`는 층 안내판, `ProgressChecklist`는 벽에 거는 출석부입니다.
- `app.component(...)` **전역 등록**은 가구를 거실에 두는 것: 어느 방(마크다운 파일)에서든 꺼내 쓸 수 있습니다.
- `custom.css`는 **벽지 색**만 바꾸는 일입니다. 가구 배치는 그대로입니다.
- 출석부(`ProgressChecklist`)는 방문객 각자의 **수첩**(브라우저 localStorage)에 적습니다. 그런데 건물을 짓는 공장(빌드)에는 방문객도 수첩도 없습니다. 공장에서 수첩을 펼치려 하면 오류가 납니다. 그래서 "손님이 입장한 **뒤에**(`onMounted`) 수첩을 펼친다"는 규칙이 필요합니다.

## 따라 하기

개발 서버(`npm run dev`)를 켜 둔 채 진행합니다. 이 레슨에서 만드는 파일은 모두 `docs/.vitepress/theme/` 아래에 있습니다.

### 1단계. 테마 확장의 뼈대와 첫 컴포넌트 `LessonMeta`

폴더 `docs/.vitepress/theme/components/`를 만들고 파일 세 개를 만듭니다.

`docs/.vitepress/theme/components/LessonMeta.vue`:

```vue
<script setup lang="ts">
// 레슨 맨 위에 보여 줄 예상 시간·이전 내용 배지
defineProps<{
  minutes: number
  prev?: string
}>()
</script>

<template>
  <div class="lesson-meta">
    <span class="badge">⏱ 약 {{ minutes }}분</span>
    <span v-if="prev" class="prev">이전 내용: {{ prev }}</span>
  </div>
</template>

<style scoped>
.lesson-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 12px 0 24px;
  font-size: 14px;
}
.badge {
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 600;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.prev {
  color: var(--vp-c-text-2);
}
</style>
```

`.vue` 파일(단일 파일 컴포넌트, SFC)은 세 칸으로 나뉩니다.

| 칸 | 하는 일 |
|---|---|
| `script setup lang="ts"` | 컴포넌트의 동작. `lang="ts"`라서 TypeScript로 씁니다. `defineProps`로 **바깥에서 받을 값(props)** 의 이름과 타입을 정합니다. `prev?`의 `?`는 "없어도 됨"입니다. |
| `template` | 화면에 그릴 HTML. 이중 중괄호 안에 props 이름을 쓰면 그 값이 들어갑니다. `v-if="prev"`는 `prev`가 있을 때만 그 태그를 그립니다. |
| `style scoped` | 이 컴포넌트에만 적용되는 CSS. `scoped`라서 다른 곳의 `.badge`와 섞이지 않습니다. `var(--vp-c-brand-1)` 같은 값은 기본 테마가 정해 둔 색 변수라, 6단계에서 색을 바꾸면 배지 색도 따라 바뀝니다. |

`docs/.vitepress/theme/custom.css`(일단 빈 파일로 만들고 6단계에서 채웁니다).

`docs/.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import LessonMeta from './components/LessonMeta.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 모든 마크다운에서 import 없이 쓸 수 있도록 전역 등록합니다.
    app.component('LessonMeta', LessonMeta)
  },
} satisfies Theme
```

| 줄 | 뜻 |
|---|---|
| `import DefaultTheme from 'vitepress/theme'` | 지금까지 쓰던 기본 테마(사이드바·검색·다크 모드 등 전부) |
| `extends: DefaultTheme` | 기본 테마를 **그대로 물려받습니다**. 이 줄을 빼면 사이드바도 메뉴도 없는 빈 화면이 됩니다. |
| `enhanceApp({ app })` | 사이트가 시작될 때 한 번 불리는 함수. `app`은 Vue 앱 객체입니다. |
| `app.component('LessonMeta', LessonMeta)` | `LessonMeta`라는 이름으로 전역 등록. 이제 어느 `.md`에서든 쓸 수 있습니다. |
| `import './custom.css'` | 우리 CSS를 기본 테마 CSS 뒤에 불러옵니다. |
| `satisfies Theme` | "이 객체가 `Theme` 모양을 지키는지 검사만 해 줘"라는 TypeScript 문법(4.9 이상). 오타가 나면 빨간 줄이 생깁니다. |

`theme/index.ts`는 설정 파일과 달리, 서버가 켜져 있을 때 **새로 만들어도** 감지됩니다. 실제 터미널 출력:

```text
AM 9:14:39 [vitepress] docs\.vitepress\theme\index.ts created, restarting server...
Re-optimizing dependencies because vite config has changed
```

이제 레슨 파일에서 씁니다. `docs/part1-basics/01-hello.md`의 `#` 제목 바로 아래에 한 줄을 넣습니다.

```md
# 첫 레슨, 안녕 위키

<LessonMeta :minutes="10" />
```

`docs/part1-basics/02-markdown.md`에도 넣습니다.

```md
# 마크다운 기본 문법

<LessonMeta :minutes="20" prev="마크다운 파일 하나가 페이지 하나가 된다" />
```

- `:minutes="10"` — 앞의 `:`(`v-bind`의 줄임)는 "따옴표 안을 **JavaScript 값**으로 읽어라"는 뜻입니다. 그래서 `10`이 숫자로 전달됩니다. `:`를 빼면 문자열 `"10"`이 됩니다.
- `prev="..."` — `:` 없이 쓰면 그대로 문자열입니다.
- VitePress의 마크다운은 Vue 템플릿으로 바뀌므로, 등록한 컴포넌트를 HTML 태그처럼 쓸 수 있습니다.

**확인 방법**: `1-2` 페이지 제목 아래에 둥근 배지 **⏱ 약 20분**과 회색 글씨 **이전 내용: 마크다운 파일 하나가 페이지 하나가 된다**가 보이면 성공입니다.

::: warning 컴포넌트 이름 오타는 빌드가 잡지 못합니다
`LessonMeta`를 `LesonMeta`로 잘못 써 보면, 화면에는 **아무것도 나오지 않고** 브라우저 콘솔(F12)에만 이런 경고가 뜹니다.

```text
[Vue warn]: Failed to resolve component: LesonMeta
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.
```

`npm run build`도 **성공**합니다(실제로 확인). 만들어진 HTML에는 그 자리에 빈 주석(`<!---->`)만 남습니다. 컴포넌트를 쓴 페이지는 화면을 눈으로 확인하고, 이상하면 콘솔을 봅니다.
:::

### 2단계. `PartLessons` — 파트 소개 목록 자동화

4단계에서 손으로 적어 1-3이 빠져 있던 파트 소개 목록을 컴포넌트로 바꿉니다.

`docs/.vitepress/theme/components/PartLessons.vue`:

```vue
<script setup lang="ts">
// 파트 소개 페이지의 레슨 목록. curriculum.mts만 고치면 이 목록도 따라 바뀝니다.
import { withBase } from 'vitepress'
import { curriculum } from '../../curriculum.mts'

const props = defineProps<{ dir: string }>()
const part = curriculum.find((p) => p.dir === props.dir)
</script>

<template>
  <div v-if="part">
    <p class="goal">🎯 <strong>이 파트를 마치면:</strong> {{ part.goal }}</p>
    <ol>
      <li v-for="lesson in part.lessons" :key="lesson.slug">
        <a :href="withBase(`/${part.dir}/${lesson.slug}`)">{{ lesson.title }}</a>
        ({{ lesson.minutes }}분)
      </li>
    </ol>
  </div>
  <p v-else class="warn">curriculum.mts에 '{{ dir }}' 파트가 없습니다.</p>
</template>

<style scoped>
.goal {
  padding: 12px 16px;
  border-left: 4px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
}
.warn {
  color: var(--vp-c-danger-1);
}
</style>
```

- `import { curriculum } from '../../curriculum.mts'` — `components` → `theme` → `.vitepress`로 두 단계 올라가 5-4에서 만든 커리큘럼 파일을 가져옵니다. **사이드바가 쓰는 바로 그 데이터**입니다.
- `curriculum.find(...)` — `dir`이 같은 파트 하나를 찾습니다. 못 찾으면 `undefined`가 되어 `v-else` 쪽 경고가 보입니다. 오타를 바로 알아챌 수 있게 일부러 넣은 줄입니다.
- `v-for="lesson in part.lessons"` — 레슨 수만큼 `li`를 반복해 그립니다. `:key`는 Vue가 항목을 구분하는 이름표입니다.
- `withBase(...)` — 5-6에서 사이트를 `/my-wiki/` 같은 하위 경로에 올릴 때 주소 앞에 그 경로를 붙여 줍니다. 컴포넌트 안에서 직접 만드는 `href`는 VitePress가 대신 고쳐 주지 않으므로 꼭 감쌉니다.

`theme/index.ts`에 등록을 추가합니다(전체 모양은 4단계 끝에 있습니다).

```ts
import PartLessons from './components/PartLessons.vue'
// ...
    app.component('PartLessons', PartLessons)
```

`docs/part1-basics/index.md`의 손으로 적은 목록 두 줄을 지우고 컴포넌트 한 줄로 바꿉니다. `docs/part2-deploy/index.md`에도 같은 줄을 `dir`만 바꿔 붙입니다.

```md
---
title: Part 1. 기초
---

# Part 1. 기초

마크다운으로 페이지를 쓰고, 페이지끼리 링크하는 법을 익힙니다.

<PartLessons dir="part1-basics" />
```

**확인 방법**: `/part1-basics/`에서 왼쪽에 브랜드 색 줄이 있는 상자 **🎯 이 파트를 마치면: 마크다운으로 페이지를 쓰고 서로 링크할 수 있다.** 와 번호 목록 3개(**1-3 frontmatter로 페이지 정보 적기 (15분)** 포함)가 보이면 성공입니다. 이제 레슨을 추가하면 사이드바와 이 목록이 함께 바뀝니다.

### 3단계. `ProgressChecklist` — localStorage에 진도 저장하기

`docs/.vitepress/theme/components/ProgressChecklist.vue`:

```vue
<script setup lang="ts">
// 레슨별 완료 체크. 진도는 이 브라우저의 localStorage에만 저장됩니다(서버 저장 없음).
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { curriculum } from '../../curriculum.mts'

const STORAGE_KEY = 'my-wiki-progress-v1'
const done = ref<Record<string, boolean>>({})
const total = curriculum.reduce((sum, p) => sum + p.lessons.length, 0)

const keyOf = (dir: string, slug: string) => `${dir}/${slug}`
const doneCount = computed(() => Object.values(done.value).filter(Boolean).length)
const percent = computed(() => Math.round((doneCount.value / total) * 100))

// 빌드(SSR) 중에는 브라우저가 없어 localStorage도 없으므로, 화면에 붙은 뒤에만 읽습니다.
onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) done.value = JSON.parse(saved) as Record<string, boolean>
  } catch {
    // 사생활 보호 모드 등에서 저장소 접근이 막히면 저장 없이 동작합니다.
  }
})

// 체크할 때마다 저장합니다. deep: true여야 객체 안의 값이 바뀐 것도 감지합니다.
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

<template>
  <div class="progress">
    <div class="bar"><div class="fill" :style="{ width: `${percent}%` }" /></div>
    <p>
      <strong>{{ doneCount }} / {{ total }}</strong> 레슨 완료 ({{ percent }}%)
      <button class="reset" type="button" @click="reset">초기화</button>
    </p>
  </div>
  <section v-for="part in curriculum" :key="part.dir">
    <h3>Part {{ part.no }}. {{ part.title }}</h3>
    <ul class="list">
      <li v-for="lesson in part.lessons" :key="lesson.slug">
        <label>
          <input v-model="done[keyOf(part.dir, lesson.slug)]" type="checkbox" />
          <a :href="withBase(`/${part.dir}/${lesson.slug}`)">{{ lesson.title }}</a>
        </label>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.progress {
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.bar {
  height: 10px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  overflow: hidden;
}
.fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.3s;
}
.reset {
  margin-left: 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-decoration: underline;
}
.list {
  list-style: none;
  padding-left: 0;
}
.list label {
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
}
</style>
```

새로 나온 Vue 기능만 짚습니다.

| 코드 | 뜻 |
|---|---|
| `ref<Record<string, boolean>>({})` | **반응형 상자**. 안의 값(`done.value`)이 바뀌면 화면이 저절로 다시 그려집니다. 모양은 `{ 'part1-basics/01-hello': true, ... }` 같은 "레슨 키 → 완료 여부" 객체입니다. |
| `computed(() => ...)` | 다른 값에서 **계산되는 값**. `done`이 바뀌면 `doneCount`, `percent`도 자동으로 다시 계산됩니다. |
| `onMounted(() => ...)` | 컴포넌트가 **브라우저 화면에 붙은 직후** 한 번 실행됩니다. 빌드 중에는 실행되지 않습니다. |
| `watch(done, ..., { deep: true })` | `done`을 지켜보다 바뀔 때마다 저장합니다. 체크박스는 객체 **안쪽** 값을 바꾸므로 `deep: true`가 없으면 감지하지 못합니다. |
| `v-model="done[...]"` | 체크박스와 값을 **양방향으로 묶습니다**. 체크하면 `true`, 해제하면 `false`가 들어갑니다. |
| `try { ... } catch { }` | 브라우저가 저장소 접근을 막아도(사생활 보호 모드 등) 페이지 전체가 멈추지 않게 합니다. |
| `STORAGE_KEY = 'my-wiki-progress-v1'` | 저장 이름. 끝의 `-v1`은 나중에 저장 모양을 바꾸면 `-v2`로 올려 옛 데이터와 섞이지 않게 하려는 것입니다. |

등록을 추가하고(`app.component('ProgressChecklist', ProgressChecklist)`), 페이지를 만듭니다.

`docs/guide/checklist.md`:

```md
---
title: 진도 체크리스트
prev: false
next: false
---

# 진도 체크리스트

다 읽은 레슨에 체크해 두세요. 기록은 **이 브라우저에만** 저장됩니다.

<ProgressChecklist />
```

`prev: false`, `next: false`는 본문 아래 이전/다음 버튼을 숨깁니다. 이 페이지는 사이드바에 없어서, 그대로 두면 실제로 **다음 레슨: 파트 소개**처럼 엉뚱한 버튼이 붙었습니다.

마지막으로 `config.mts`의 `nav`에서 `마크다운 문법` 메뉴를 진도 체크로 바꿉니다.

```ts
    nav: [
      { text: '홈', link: '/' },
      { text: '첫 레슨', link: '/part1-basics/01-hello' },
      { text: '진도 체크', link: '/guide/checklist' },
    ],
```

**확인 방법**:

1. 상단 **진도 체크** 메뉴를 누르면 회색 상자 안에 빈 진행 막대와 **0 / 4 레슨 완료 (0%)**, 그 아래 Part 1(레슨 3개)·Part 2(레슨 1개) 체크 목록이 보입니다.
2. 두 개를 체크하면 **2 / 4 레슨 완료 (50%)** 로 바뀌고 막대가 절반 찹니다.
3. **새로 고침해도 2 / 4가 유지**되면 성공입니다.
4. 개발자 도구 → Application(애플리케이션) → Local Storage에서 `my-wiki-progress-v1` 값이 `{"part1-basics/01-hello":true,"part1-basics/02-markdown":true}`처럼 저장된 것을 볼 수 있습니다(실제로 확인한 값).

### 4단계. SSR 주의: `onMounted` 밖에서 localStorage를 읽으면

왜 굳이 `onMounted` 안에서 읽을까요? 일부러 규칙을 어겨 봅니다. `ProgressChecklist.vue`의 `const done = ...` 줄을 이렇게 바꿉니다.

```ts
const done = ref<Record<string, boolean>>(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'))
```

개발 서버에서는 **잘 동작하는 것처럼 보입니다**. 개발 서버는 페이지를 브라우저에서만 그리기 때문입니다. 이제 빌드해 봅니다.

```bash
npm run build
```

실제 출력(`at ...` 줄은 줄였습니다):

```text
  vitepress v1.6.3

- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
ReferenceError: localStorage is not defined
    at setup (file:///.../my-wiki/docs/.vitepress/.temp/app.js:4914:33)
    at _sfc_main.setup (file:///.../my-wiki/docs/.vitepress/.temp/app.js:4953:23)
    ...
✓ rendering pages...
build complete in 11.06s.
```

- `rendering pages`는 빌드가 **Node.js 안에서 각 페이지의 HTML을 미리 그리는 단계**입니다. 이것을 SSR(Server-Side Rendering, 서버 쪽 렌더링)이라고 합니다. Node.js에는 브라우저 전용 기능인 `localStorage`가 없어서 `ReferenceError: localStorage is not defined`가 납니다.
- 주의할 점은 **그래도 `build complete`가 나오고 종료 코드도 0(성공)** 이라는 것입니다(VitePress 1.6.3에서 실제로 확인). 만들어진 `dist/guide/checklist.html`을 열어 보면 체크리스트 자리에 빈 주석(`<!---->`)만 있고 "레슨 완료" 글자가 없습니다. 빌드가 성공했다고 끝이 아니라, **빌드 로그에 `Error`가 섞여 있지 않은지** 읽어야 합니다.

원래 줄(`ref<Record<string, boolean>>({})`)로 되돌리고 다시 빌드하면 오류 줄이 사라지고, `checklist.html` 안에 `0 / 4 레슨 완료`가 미리 그려져 들어갑니다. 브라우저가 이 HTML을 받은 뒤 `onMounted`가 실행되면서 저장된 진도로 바뀝니다.

::: info 브라우저에서만 쓸 수 있는 것들
`localStorage`, `window`, `document`, `navigator`, `alert`/`confirm` 같은 것은 모두 브라우저 전용입니다. 컴포넌트의 `script setup` **맨 위에서 바로** 쓰지 말고, `onMounted` 안이나 버튼 클릭 같은 이벤트 함수 안에서 씁니다. 위 코드의 `confirm`이 `reset` 함수 안에 있는 것도 같은 이유입니다(클릭은 브라우저에서만 일어나므로 안전합니다).
:::

`theme/index.ts`의 최종 모양:

```ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import LessonMeta from './components/LessonMeta.vue'
import PartLessons from './components/PartLessons.vue'
import ProgressChecklist from './components/ProgressChecklist.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 모든 마크다운에서 import 없이 쓸 수 있도록 전역 등록합니다.
    app.component('LessonMeta', LessonMeta)
    app.component('PartLessons', PartLessons)
    app.component('ProgressChecklist', ProgressChecklist)
  },
} satisfies Theme
```

### 5단계. 빌드로 컴포넌트 검증하기

`.vue` 파일의 타입은 일반 `tsc`로는 검사되지 않습니다(`.vue`를 읽으려면 `vue-tsc`라는 별도 도구가 필요합니다). 이 실습에서는 **실제 빌드**로 확인합니다. 빌드는 모든 페이지를 SSR로 한 번씩 그려 보므로, 컴포넌트가 실행 중에 깨지는지까지 드러납니다.

```bash
npm run build
```

```text
- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
✓ rendering pages...
build complete in 8.13s.
```

**확인 방법**: `ReferenceError`나 `Error` 줄 없이 `build complete`가 나오고, 아래 명령으로 미리 그려진 HTML에 컴포넌트 내용이 들어 있으면 성공입니다.

```powershell
# Windows (PowerShell)
Select-String -Path docs\.vitepress\dist\guide\checklist.html -Pattern '레슨 완료' -Quiet
```

```bash
# macOS / Linux / Git Bash
grep -c '레슨 완료' docs/.vitepress/dist/guide/checklist.html
```

PowerShell은 `True`, bash는 `1`이 나오면 됩니다.

### 6단계. `custom.css`로 색 바꾸기

비워 둔 `docs/.vitepress/theme/custom.css`를 채웁니다.

```css
/* 브랜드 색을 초록 계열로 바꿉니다. 기본 테마의 링크·버튼·강조가 모두 이 변수를 씁니다. */
:root {
  --vp-c-brand-1: #059669;
  --vp-c-brand-2: #047857;
  --vp-c-brand-3: #065f46;
  --vp-c-brand-soft: rgba(5, 150, 105, 0.14);
}

.dark {
  --vp-c-brand-1: #34d399;
  --vp-c-brand-2: #10b981;
  --vp-c-brand-3: #059669;
  --vp-c-brand-soft: rgba(52, 211, 153, 0.16);
}

/* 한국어 본문은 단어 중간에서 줄이 바뀌지 않게 합니다. */
.vp-doc p,
.vp-doc li {
  line-height: 1.8;
  word-break: keep-all;
}
```

- `--vp-c-brand-1` 같은 이름은 **CSS 변수**(값을 한 곳에 두고 여러 곳에서 불러 쓰는 이름표)입니다. 기본 테마는 링크·버튼·강조 색을 모두 이 변수로 칠하므로, 변수 값만 바꾸면 사이트 전체 색이 바뀝니다. `-1`이 가장 자주 쓰이는 주 색, `-2`·`-3`은 마우스를 올렸을 때 등에 쓰이는 진한 색, `-soft`는 옅은 배경색입니다.
- `:root`는 밝은 화면, `.dark`는 다크 모드일 때 값입니다. 5-3에서 본 `html.dark` 클래스가 여기서 쓰입니다. 어두운 배경에서는 같은 초록이 칙칙해 보이므로 더 밝은 초록을 씁니다.
- `word-break: keep-all` — 한국어는 기본 설정에서 낱글자 단위로 줄이 바뀔 수 있습니다. 이 설정은 띄어쓰기 단위로 줄을 바꿔 읽기 편하게 합니다.

**확인 방법**: 저장하면 새로 고침 없이 링크, 사이드바의 현재 레슨, 홈의 **나의 학습 위키** 글씨와 주 버튼, `LessonMeta` 배지, 진도 막대가 모두 **초록색**으로 바뀌면 성공입니다. 다크 모드로 바꾸면 더 밝은 초록으로 보입니다.

### 이 단계까지의 전체 파일 상태

```text
my-wiki/
├─ package.json
├─ package-lock.json
└─ docs/
   ├─ index.md
   ├─ guide/
   │  └─ checklist.md                  ← 새로 생김
   ├─ part1-basics/
   │  ├─ index.md                      ← PartLessons로 바뀜
   │  ├─ 01-hello.md                   ← LessonMeta 추가
   │  ├─ 02-markdown.md                ← LessonMeta 추가
   │  └─ 03-frontmatter.md
   ├─ part2-deploy/
   │  ├─ index.md                      ← PartLessons로 바뀜
   │  └─ 01-build.md
   ├─ public/
   │  └─ logo.svg
   └─ .vitepress/
      ├─ config.mts                    ← nav에 진도 체크
      ├─ curriculum.mts
      ├─ theme/                        ← 새로 생김
      │  ├─ index.ts
      │  ├─ custom.css
      │  └─ components/
      │     ├─ LessonMeta.vue
      │     ├─ PartLessons.vue
      │     └─ ProgressChecklist.vue
      ├─ cache/
      └─ dist/
```

`config.mts`에서 바뀐 곳은 `nav`의 세 번째 줄(`진도 체크`) 하나뿐입니다. 나머지는 5-4 끝의 전체 내용과 같습니다.

## ts-wiki에서는

- **`docs/.vitepress/theme/index.ts`(18줄)** — 이 레슨의 최종 `index.ts`와 같은 구조에, 컴포넌트가 하나 더(`CurriculumToc`, 전체 목차 페이지용) 있어 네 개를 등록합니다(13~16줄). `extends: DefaultTheme`(10줄), `satisfies Theme`(18줄)도 같습니다.
- **`components/LessonMeta.vue`(43줄)** — 우리 것에 `level` prop이 하나 더 있습니다. 3~7줄의 `defineProps`가 `level: string`, `minutes: number`, `prev?: string`이고, 템플릿에서 `난이도 · ...` 배지를 하나 더 그립니다. 이 가이드의 각 레슨 맨 위 배지가 바로 이 컴포넌트입니다.
- **`components/PartLessons.vue`(41줄)** — 우리와 같은 `curriculum.find`(7줄)로 파트를 찾고, 목록 대신 표(`table`)로 `#`·레슨·예상 시간 세 칸을 그립니다. 부록은 번호를 `1, 2, 3`으로, 나머지는 `0-1, 0-2`처럼 표시합니다.
- **`components/ProgressChecklist.vue`(110줄)** — 우리 코드의 원본입니다. 저장 키는 `ts-wiki-progress-v1`(7줄), 부록을 뺀 파트만 세고(9줄), 18~26줄에 우리와 같은 `onMounted` + `try/catch`가 있습니다. 주석도 "SSR 빌드 중에는 localStorage가 없으므로 마운트 후에만 읽습니다."로 같은 이유를 적어 두었습니다. 파트별 완료 수(`partDone`)와, 스크롤해도 진행 막대가 위에 붙어 있는 `position: sticky`가 더 있습니다.
- **`custom.css`(27줄)** — TypeScript 공식 색 `#3178c6` 계열로 `--vp-c-brand-1~3`과 `-soft`를 바꾸고(2~15줄), 한국어 글꼴(`Pretendard`, `Noto Sans KR` 등)을 `--vp-font-family-base`로 지정하며, 본문 줄 간격 `1.85`와 `keep-all`, 정답 접기 블록의 왼쪽 테두리를 더합니다.

## 자주 하는 실수

**1. 페이지가 완전히 하얗게 비어 있음 (오류 메시지도 없음)**

- 원인: `theme/index.ts`에서 `extends: DefaultTheme`를 빼먹었습니다. 테마를 확장하는 게 아니라 화면 틀(Layout)이 없는 **빈 테마로 교체**한 셈입니다. 실제로 이 줄을 지우고 빌드하면 `build complete`가 나오지만, 만들어진 HTML의 본문 자리는 `<div id="app"><!----></div>`뿐입니다.
- 해결: `extends: DefaultTheme`를 넣습니다.

**2. 컴포넌트 자리가 비어 있고 콘솔에 `Failed to resolve component: LesonMeta`**

- 원인: 마크다운의 태그 이름 오타, 또는 `app.component(...)` 등록을 빠뜨렸습니다. 빌드는 성공하므로 놓치기 쉽습니다.
- 해결: 등록 이름과 마크다운 태그 이름을 대소문자까지 똑같이 맞춥니다.

**3. 빌드 로그에 `ReferenceError: localStorage is not defined` (그런데 빌드는 complete)**

- 원인: `localStorage`·`window`·`document`를 `script setup` 맨 위에서 바로 썼습니다. 빌드의 SSR 단계(Node.js)에는 이것들이 없습니다.
- 해결: `onMounted` 안이나 이벤트 함수 안으로 옮깁니다. 빌드가 성공해도 로그를 끝까지 읽는 습관을 들입니다.

**4. 체크했는데 새로 고침하면 사라짐**

- 원인: `watch`에 `{ deep: true }`를 빼먹어 체크(객체 안쪽 값 변경)를 감지하지 못했거나, 사생활 보호(시크릿) 창이라 저장이 창을 닫을 때 지워집니다.
- 해결: `deep: true`를 확인합니다. 일반 창에서 시험합니다. 진도는 **브라우저마다 따로** 저장되므로 다른 브라우저·다른 PC에서는 보이지 않는 것이 정상입니다.

**5. 콘솔에 `Invalid prop: type check failed for prop "minutes". Expected Number with value 15, got String with value "15".`**

- 원인: `minutes="15"`처럼 `:` 없이 넘겨 문자열이 되었습니다(실제로 개발 서버 콘솔에 위 경고가 떴습니다). 화면에는 "약 15분"이 그대로 보여서 지나치기 쉽지만, 숫자로 계산하는 코드가 있다면 틀린 결과가 납니다. prop 이름을 틀려도(`:minute="15"`) 배지가 "약 분"처럼 비어 보입니다.
- 해결: 숫자는 `:minutes="10"`으로, 이름은 `defineProps`와 똑같이 씁니다.

## 직접 해 보기

**과제 1 ⭐** — `03-frontmatter.md`와 `part2-deploy/01-build.md`에도 `LessonMeta`를 넣으세요. `minutes`는 `curriculum.mts`의 값과 맞춥니다.

::: details 정답 보기
`# frontmatter로 페이지 정보 적기` 아래에 `<LessonMeta :minutes="15" prev="마크다운 기본 문법을 익혔다" />`, `# 빌드해 보기` 아래에 `<LessonMeta :minutes="20" />`를 넣습니다.
:::

**과제 2 ⭐** — `custom.css`의 브랜드 색을 주황 계열(`#ea580c`, `#c2410c`, `#9a3412`)로 바꿔 보세요. 다크 모드 색도 함께 바꿉니다.

::: details 힌트
`:root`와 `.dark` 두 곳의 `--vp-c-brand-1~3`과 `--vp-c-brand-soft`를 모두 바꿉니다. `-soft`는 `rgba(234, 88, 12, 0.14)`처럼 같은 색에 투명도를 줍니다.
:::

**과제 3 ⭐⭐** — `ProgressChecklist`에 ts-wiki처럼 파트별 완료 수(`1 / 3`)를 `h3` 옆에 보여 주세요.

::: details 정답 보기
`script`에 다음 함수를 추가합니다.

```ts
const partDone = (dir: string) =>
  curriculum.find((p) => p.dir === dir)!.lessons.filter((l) => done.value[keyOf(dir, l.slug)]).length
```

템플릿의 `h3` 안에 `small` 태그로 `partDone(part.dir)`와 `part.lessons.length`를 이중 중괄호로 출력합니다. ts-wiki `ProgressChecklist.vue` 15~16줄, 54~57줄과 같습니다.
:::

**과제 4 ⭐⭐** — `PartLessons`에 일부러 없는 `dir`(`<PartLessons dir="part9-none" />`)을 넣어 보세요. 무엇이 보이나요? 이 경고 줄이 왜 쓸모 있을까요?

::: details 정답 보기
빨간 글씨로 `curriculum.mts에 'part9-none' 파트가 없습니다.`가 보입니다. `v-else`가 없으면 아무것도 안 보여서, 오타인지 목록이 비었는지 구분하기 어렵습니다.
:::

**과제 5 ⭐⭐⭐** — 각 레슨 페이지 `LessonMeta` 옆에 "완료" 체크박스를 달아, 진도 체크리스트와 같은 저장소(`my-wiki-progress-v1`)를 함께 쓰게 해 보세요.

::: details 힌트
레슨 페이지의 경로는 `useRoute()`(vitepress에서 가져옴)의 `route.path`나 `useData()`의 `page.value.relativePath`로 알 수 있습니다. `relativePath`는 `part1-basics/01-hello.md` 같은 값이므로 `.md`를 떼면 저장 키가 됩니다. 읽기는 반드시 `onMounted` 안에서 합니다. 체크리스트 페이지와 레슨 페이지가 같은 키 형식을 쓰는지 꼭 확인합니다.
:::

## 확인 퀴즈

**1.** `theme/index.ts`에서 `extends: DefaultTheme`의 역할은?

::: details 정답 보기
기본 테마의 레이아웃·사이드바·검색 등을 그대로 물려받고, 그 위에 우리 컴포넌트와 CSS만 더하게 합니다.
:::

**2.** `:minutes="10"`과 `minutes="10"`의 차이는?

::: details 정답 보기
앞에 `:`가 있으면 따옴표 안을 JavaScript 값으로 읽어 숫자 10이 전달되고, 없으면 문자열 `"10"`이 전달됩니다.
:::

**3.** `ProgressChecklist`에서 localStorage를 `onMounted` 안에서만 읽는 이유는?

::: details 정답 보기
빌드의 SSR 단계는 Node.js에서 HTML을 미리 그리는데, Node.js에는 브라우저 전용인 localStorage가 없기 때문입니다. `onMounted`는 브라우저 화면에 붙은 뒤에만 실행됩니다.
:::

**4.** 컴포넌트 안에서 `href`를 만들 때 `withBase`로 감싸는 이유는?

::: details 정답 보기
사이트를 `/my-wiki/` 같은 하위 경로에 배포하면 주소 앞에 그 경로가 붙어야 하는데, 컴포넌트가 직접 만든 주소는 VitePress가 자동으로 고쳐 주지 않기 때문입니다.
:::

**5.** 진도 기록은 어디에 저장되며, 다른 PC에서도 보이나요?

::: details 정답 보기
그 브라우저의 localStorage(`my-wiki-progress-v1`)에만 저장됩니다. 서버로 보내지 않으므로 다른 브라우저·다른 PC에서는 보이지 않습니다.
:::

## 정리

- `theme/index.ts`에서 `extends: DefaultTheme`로 기본 테마를 확장하고, `enhanceApp`에서 컴포넌트를 전역 등록합니다.
- `.vue` 파일은 `script setup`(동작) · `template`(화면) · `style scoped`(모양) 세 칸이고, `defineProps`로 마크다운에서 값을 받습니다.
- `PartLessons`와 `ProgressChecklist`도 `curriculum.mts`를 읽으므로, 레슨 추가가 사이드바·파트 목록·체크리스트에 한꺼번에 반영됩니다.
- 브라우저 전용 기능(localStorage 등)은 `onMounted`나 이벤트 함수 안에서만 씁니다. 어기면 빌드 로그에 `ReferenceError`가 찍히는데 빌드는 성공하므로 로그를 읽어야 합니다.
- 컴포넌트 이름 오타도 빌드가 잡지 못합니다. 화면과 콘솔로 확인합니다.
- `custom.css`에서 `--vp-c-brand-*` 변수만 바꾸면 사이트 전체 색이 바뀌고, `.dark`로 다크 모드 색을 따로 줍니다.

## 다음 단계

[빌드와 미리보기](./06-build-preview) — `npm run build`가 만든 `dist` 폴더를 열어 보고, `npm run preview`(포트 5191)로 확인한 뒤, `WIKI_BASE=/my-wiki/`로 하위 경로 배포를 체험합니다.
