---
title: 'Vite와 Vue: VitePress 밑에서 일하는 것들'
---

# Vite와 Vue: VitePress 밑에서 일하는 것들

<LessonMeta level="초급" :minutes="45" prev="VitePress의 파일 기반 라우팅, config.mts, 테마 확장, dev·build·preview를 익혔습니다." />

## 이번에 배울 것

- VitePress가 **Vite**와 **Vue** 위에 지어졌다는 것을 `npm ls`로 직접 확인할 수 있다.
- Vite의 개발 서버·HMR·Rollup 번들이 각각 언제 일하는지 설명할 수 있다.
- Vue가 빌드 때 **SSR**로 HTML을 만들고, 브라우저에서 **하이드레이션**으로 살아나게 하는 과정을 말할 수 있다.
- Vue 단일 파일 컴포넌트(SFC)의 기본 문법(`script setup`, props, `ref`/`computed`/`watch`, `v-for`, `v-if`, `v-model`)을 읽고 쓸 수 있다.
- 마크다운 본문에서 이중 중괄호가 왜 빌드를 깨뜨리는지 설명할 수 있다.

## 먼저 알아 둘 것

- [VitePress: 설정 · 라우팅 · 테마](./01-vitepress) — 특히 `dev`가 빈 껍데기 HTML을 보낸다는 실험 결과
- [정적 사이트 생성기(SSG)와 빌드](../part1-concepts/05-ssg)

## 비유로 이해하기

VitePress를 **식당**이라고 하면 이렇습니다.

- **Vite**는 **주방 설비**입니다. 영업 준비 중(개발 중)에는 주문이 들어오는 즉시 요리를 하나씩 만들어 내고(개발 서버), 재료 하나를 바꾸면 그 접시만 새로 내보냅니다(HMR). 단체 예약(배포)이 잡히면 모든 요리를 미리 만들어 도시락으로 포장합니다(Rollup 번들).
- **Vue**는 **요리법**입니다. "메뉴 목록이 바뀌면 화면도 바뀐다" 같은 규칙을 적어 두면, 그 규칙대로 화면을 만듭니다.
- **SSR**은 도시락에 **이미 요리를 담아 두는 것**이고, **하이드레이션**은 손님이 도시락을 열었을 때 데우는 기능(버튼 클릭, 검색 입력)이 붙는 것입니다. 데우기 전에도 먹을 수는(읽을 수는) 있습니다.

## 이게 뭔가

### Vite

**Vite**(프랑스어로 "빠르다", 발음은 "비트")는 웹 프로젝트용 **개발 서버 + 빌드 도구**입니다. Vue를 만든 Evan You가 시작했고, 지금은 Vue와 무관한 React·Svelte 프로젝트에서도 널리 씁니다.

| 시점 | Vite가 하는 일 | 내부에서 쓰는 도구 |
|---|---|---|
| `vitepress dev` | 브라우저가 요청하는 파일을 **그때그때** 변환해 보내는 개발 서버 | esbuild(TypeScript 변환) |
| 파일 저장 | 바뀐 모듈만 브라우저에 다시 보내는 **HMR** | 웹소켓 |
| `vitepress build` | 모든 파일을 묶고 줄여 배포용 파일로 만드는 **번들** | Rollup |

- **번들**(bundle): 수십~수백 개의 자바스크립트 파일을 몇 개로 묶고, 공백·긴 변수 이름을 줄여(minify) 크기를 줄이는 일입니다.
- **HMR**(Hot Module Replacement, 모듈 바꿔 끼우기): 페이지 전체를 새로 고치지 않고 바뀐 부분만 교체하는 기능입니다. 스크롤 위치나 입력해 둔 값이 그대로 남습니다.

### Vue

**Vue**(발음은 "뷰")는 화면을 만드는 **UI 프레임워크**입니다. 핵심은 **반응성**(reactivity)입니다. 데이터를 바꾸면 그 데이터를 쓰는 화면이 알아서 다시 그려집니다. 화면을 직접 고치는 코드(`document.querySelector(...).textContent = ...`)를 쓰지 않아도 됩니다.

VitePress에서 Vue가 하는 일은 두 가지입니다.

1. **마크다운 페이지 자체가 Vue 컴포넌트입니다.** VitePress는 마크다운을 HTML로 바꾼 뒤, 그 HTML을 Vue 템플릿으로 취급합니다. 그래서 마크다운 안에 `<LessonMeta ... />` 같은 컴포넌트 태그를 쓸 수 있습니다.
2. **기본 테마(사이드바, 검색 창, 다크 모드 버튼)가 모두 Vue 컴포넌트입니다.**

## 왜 필요한가

- Vite가 없다면 문서 하나를 고칠 때마다 사이트 전체를 다시 빌드하고 새로 고침해야 합니다. 97개 문서를 가진 ts-wiki를 빌드하는 데는 실제로 2분 넘게 걸렸습니다([3-4](./04-local-search) 실험). 개발 서버는 이 기다림을 없애 줍니다.
- Vue가 없다면 "진도 체크리스트"처럼 클릭하면 상태가 바뀌는 기능을 순수 자바스크립트로 짜야 합니다. Vue를 쓰면 `ref`와 템플릿 몇 줄로 끝납니다.
- 그리고 **SSR 덕분에** 자바스크립트가 꺼져 있거나 늦게 로드되어도 본문 글자는 HTML 안에 이미 있습니다. 검색 엔진도 내용을 읽을 수 있습니다.

## 설치

따로 설치하지 않습니다. `vitepress`를 설치하면 `vite`가 함께 깔립니다. `vue`는 ts-wiki처럼 직접 버전을 적어 두는 것이 좋습니다(테마 컴포넌트에서 `import { ref } from 'vue'`를 쓰기 때문).

**확인 방법**: VitePress가 실제로 무엇에 기대고 있는지 봅니다. `npm ls`는 설치된 패키지의 의존 관계를 나무 모양으로 보여 줍니다.

```bash
npm ls vite vue shiki minisearch markdown-it
```

ts-wiki 폴더에서 실제로 실행한 결과입니다(작성 시점 2026-10).

```text
ts-wiki@1.0.0 D:\workspace\ts-wiki
+-- vitepress@1.6.3
| +-- @vitejs/plugin-vue@5.2.4
| | +-- vite@5.4.21 deduped
| | `-- vue@3.5.13 deduped
| +-- @vueuse/core@12.8.2
| | +-- @vueuse/shared@12.8.2
| | | `-- vue@3.5.13 deduped
| | `-- vue@3.5.13 deduped
| +-- @vueuse/integrations@12.8.2
| | `-- vue@3.5.13 deduped
| +-- minisearch@7.2.0
| +-- shiki@2.5.0
| +-- vite@5.4.21
| `-- vue@3.5.13 deduped
`-- vue@3.5.13
  `-- @vue/server-renderer@3.5.13
    `-- vue@3.5.13 deduped
```

읽는 법입니다.

- 들여쓰기는 "누가 누구를 필요로 하나"입니다. `vitepress` 아래에 `vite@5.4.21`, `shiki@2.5.0`, `minisearch@7.2.0`이 있습니다.
- `deduped`(중복 제거됨)는 "같은 버전이 이미 다른 곳에 깔려 있어서 그것을 같이 쓴다"는 뜻입니다. `vue@3.5.13`은 하나만 깔려 있고 여러 패키지가 함께 씁니다. 우리가 `package.json`에 `vue`를 직접 적었기 때문에 VitePress도 그 버전을 씁니다.
- `@vitejs/plugin-vue`는 Vite가 `.vue` 파일을 이해하게 해 주는 플러그인입니다.
- `@vue/server-renderer`는 Vue 컴포넌트를 서버(Node.js)에서 HTML 문자열로 바꾸는 부품, 즉 SSR 담당입니다.

::: info `markdown-it`이 목록에 없습니다
`npm ls markdown-it`은 아무것도 보여 주지 않습니다. VitePress 1.6.3은 markdown-it을 **자기 배포 파일 안에 묶어서(bundled)** 내보내기 때문에 별도 패키지로 설치되지 않습니다. `node_modules/vitepress/dist/node/` 안의 파일에서 `markdown-it`을 검색하면 그 코드가 들어 있는 것을 볼 수 있습니다. 타입 정의(`@types/markdown-it`)만 별도 패키지로 깔립니다.
:::

Vite가 다시 무엇에 기대는지도 봅니다.

```bash
npm ls rollup esbuild @vitejs/plugin-vue
```

```text
mini-wiki@ ...\mini
`-- vitepress@1.6.3
  +-- @vitejs/plugin-vue@5.2.4
  `-- vite@5.4.21
    +-- esbuild@0.21.5
    `-- rollup@4.65.1
```

`vite` 밑에 `esbuild`(Go 언어로 만든 매우 빠른 변환기)와 `rollup`(번들러)이 있습니다. 앞의 표에서 말한 역할 분담이 실제 설치 구조에도 그대로 보입니다.

## 핵심 사용법 1 — Vite: 개발 서버와 빌드

### 개발 서버는 파일을 "요청받을 때" 변환합니다

[3-1](./01-vitepress)에서 `dev` 서버가 어떤 주소에든 527글자짜리 같은 HTML을 보낸다는 것을 봤습니다. 그 HTML은 사실상 "자바스크립트를 불러오라"는 안내문입니다. 그 뒤 브라우저가 필요한 파일을 하나씩 요청하면 Vite가 **그 자리에서** 변환해 보냅니다. 연습 프로젝트의 개발 서버에 직접 요청해 본 결과입니다.

```text
GET /@vite/client              -> 200 text/javascript
GET /.vitepress/theme/Hello.vue -> 200 text/javascript
```

- `/@vite/client`는 Vite가 브라우저에 심는 작은 프로그램입니다. 서버와 웹소켓으로 연결해 "파일이 바뀌었다"는 알림을 받습니다.
- `Hello.vue`를 요청했는데 `text/javascript`가 왔습니다. 브라우저는 `.vue`를 이해하지 못하므로 Vite가 `@vitejs/plugin-vue`로 즉석에서 자바스크립트로 바꿔 보낸 것입니다.

이 방식은 **처음 켤 때 모든 파일을 묶지 않으므로** 문서가 많아도 개발 서버가 빨리 뜹니다.

### HMR 체험

1. `npm run dev`로 개발 서버를 켜고 브라우저로 `/guide/recipe`를 엽니다.
2. 브라우저 창과 에디터를 나란히 놓습니다.
3. `recipe.md`의 한 문장을 고치고 저장합니다.

**확인 방법**: 브라우저가 깜빡이지 않고(새로 고침 없이) 그 문장만 바뀌면 HMR이 동작한 것입니다. 입력 상자에 글자를 쳐 둔 상태에서 저장해 보면, 입력한 글자가 그대로 남아 있는 것으로도 확인할 수 있습니다.

### 빌드는 Rollup이 묶습니다

`vitepress build`의 첫 단계 `building client + server bundles...`가 바로 Vite(내부적으로 Rollup)가 일하는 부분입니다. 두 벌을 만듭니다.

- **client 번들**: 브라우저가 내려받을 자바스크립트(`dist/assets/*.js`)
- **server 번들**: 빌드하는 동안 Node.js에서 HTML을 그리는 데만 쓰고 버리는 코드

두 번째 단계 `rendering pages...`에서 server 번들로 페이지마다 HTML을 그립니다. 이것이 SSR입니다.

### VitePress에서 Vite 설정 넘기기

`config.mts`의 `vite` 키에 쓴 내용은 Vite에 그대로 전달됩니다.

```ts
export default defineConfig({
  vite: {
    build: { chunkSizeWarningLimit: 4000 },
    server: { strictPort: true },
  },
})
```

- `build.chunkSizeWarningLimit`: 이 크기(kB)를 넘는 파일이 생기면 경고합니다. 기본값은 500입니다.
- `server.strictPort`: 포트가 이미 쓰이고 있으면 다른 포트로 옮기지 말고 실패합니다. 실제로 5190 포트가 다른 프로그램에 쓰이고 있을 때 VitePress는 `Port 5190 is in use, trying another one...`을 찍고 5191로 옮겨 갔습니다. 정해진 주소로만 접속해야 한다면 이 옵션을 켭니다(명령줄에서는 `--strictPort`).

## 핵심 사용법 2 — Vue: SSR과 하이드레이션

빌드할 때와 브라우저에서 일어나는 일을 순서대로 보면 이렇습니다.

```text
[빌드 때, Node.js]                         [브라우저]
recipe.md
  │ markdown-it
  ▼
HTML + 컴포넌트 태그 (= Vue 템플릿)
  │ Vue 컴파일
  ▼
렌더 함수
  │ @vue/server-renderer (SSR)
  ▼
recipe.html (글자가 꽉 찬 HTML) ──────▶ ① HTML을 받자마자 글자가 보임
assets/*.js ─────────────────────────▶ ② JS가 로드되면 Vue가 같은 화면을
                                          다시 계산해 기존 HTML에 이벤트를
                                          연결 (하이드레이션)
                                       ③ 이후 버튼·입력이 동작
```

- **SSR**(Server-Side Rendering, 서버 쪽 렌더링): 자바스크립트로 그릴 화면을 미리 서버(여기서는 빌드하는 PC)에서 HTML 문자열로 그려 두는 것입니다.
- **하이드레이션**(hydration, 수분 공급): 이미 그려진 마른 HTML에 이벤트 처리기와 반응성을 "적셔" 살아 움직이게 만드는 것입니다. 화면을 새로 그리지 않고 기존 HTML을 재사용합니다.

연습 프로젝트에 메뉴 검색 컴포넌트를 넣고 빌드한 HTML을 열어 보면, 자바스크립트를 실행하기 전인데도 목록이 들어 있습니다.

```html
<div class="menu-filter" data-v-8d833fb3><input value="" placeholder="메뉴 이름" data-v-8d833fb3><ul data-v-8d833fb3><!--[--><li data-v-8d833fb3>1. 아메리카노</li><li data-v-8d833fb3>2. 카페라떼</li><li data-v-8d833fb3>3. 바닐라라떼</li><!--]--></ul><p class="count" data-v-8d833fb3>3 / 3개</p></div>
```

- `<!--[-->`, `<!--]-->` 주석은 Vue가 하이드레이션할 때 "여기부터 여기까지가 `v-for` 목록"이라고 표시해 둔 것입니다.
- `data-v-8d833fb3`는 `<style scoped>`가 이 컴포넌트에만 적용되도록 붙인 표시입니다.

::: warning SSR 때문에 생기는 함정
빌드할 때 컴포넌트 코드는 **Node.js에서도 한 번 실행**됩니다. Node.js에는 `window`, `document`, `localStorage`가 없습니다. 연습 프로젝트에서 `<script setup>` 맨 위에 `localStorage.getItem('kw')`를 넣고 빌드했더니, 빌드는 `build complete`로 끝났지만 중간에 `ReferenceError: localStorage is not defined`가 찍혔고 **그 컴포넌트가 그릴 부분이 HTML에서 통째로 빠져** 있었습니다. 빌드가 "성공"으로 끝나므로 놓치기 쉽습니다. 브라우저 전용 코드는 `onMounted(() => { ... })` 안이나 이벤트 처리기 안에 넣습니다. `onMounted`는 브라우저에서 화면이 붙은 뒤에만 실행됩니다.
:::

## 핵심 사용법 3 — Vue 단일 파일 컴포넌트(SFC) 기초

`.vue` 파일 하나에 **로직·화면·스타일**을 함께 담는 형식을 SFC(Single File Component)라고 합니다. 연습 프로젝트에 넣고 빌드까지 확인한 컴포넌트입니다.

```vue
<script setup lang="ts">
// 메뉴 이름으로 거르는 작은 검색 상자
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  menus: string[]
  placeholder?: string
}>()

const keyword = ref('')
const filtered = computed(() => props.menus.filter((m) => m.includes(keyword.value)))

// 검색어가 바뀔 때마다 실행됩니다. 브라우저에서만 의미가 있습니다.
watch(keyword, (now) => {
  document.title = now ? `"${now}" 검색 중` : '한빛 카페 위키'
})
</script>

<template>
  <div class="menu-filter">
    <input v-model="keyword" :placeholder="placeholder ?? '메뉴 이름'" />
    <p v-if="filtered.length === 0">찾는 메뉴가 없습니다.</p>
    <ul v-else>
      <li v-for="(menu, i) in filtered" :key="menu">{{ i + 1 }}. {{ menu }}</li>
    </ul>
    <p class="count">{{ filtered.length }} / {{ menus.length }}개</p>
  </div>
</template>

<style scoped>
.menu-filter input {
  border: 1px solid var(--vp-c-divider);
  padding: 4px 8px;
}
</style>
```

마크다운에서는 이렇게 씁니다(`theme/index.ts`에서 `app.component('MenuFilter', MenuFilter)`로 등록한 뒤).

```md
<MenuFilter :menus="['아메리카노', '카페라떼', '바닐라라떼']" />
```

부분별로 풀어 봅니다.

### script setup

`<script setup lang="ts">`는 "이 안에서 선언한 변수를 템플릿에서 바로 쓰겠다"는 Vue 3의 간결한 문법입니다. `lang="ts"`는 TypeScript로 쓰겠다는 뜻입니다. `return`이나 `export default` 없이 변수를 만들기만 하면 됩니다.

### props — 바깥에서 받는 값

```ts
const props = defineProps<{
  menus: string[]
  placeholder?: string
}>()
```

- `defineProps`는 `import` 없이 쓰는 **컴파일러 매크로**(빌드할 때 다른 코드로 바뀌는 특별한 함수)입니다.
- 타입에 `?`가 붙은 `placeholder`는 안 넘겨도 됩니다.
- 사용하는 쪽에서 `:menus="[...]"`처럼 **콜론**을 붙이면 따옴표 안을 자바스크립트 식으로 계산해 넘깁니다. 콜론 없이 `menus="아메리카노"`라고 쓰면 그냥 글자로 넘어갑니다. ts-wiki의 `<LessonMeta level="입문" :minutes="40" />`에서 `minutes`에만 콜론이 붙은 이유가 이것입니다. 콜론이 없으면 숫자 40이 아니라 글자 `"40"`이 넘어갑니다.

### ref · computed · watch — 반응성 3종

| 함수 | 뜻 | 예 |
|---|---|---|
| `ref(초깃값)` | 바뀔 수 있는 값을 담는 상자. 스크립트에서는 `.value`로 읽고 씁니다 | `const keyword = ref('')` |
| `computed(() => ...)` | 다른 값으로부터 **계산되는** 값. 재료가 바뀌면 자동으로 다시 계산됩니다 | 검색어로 거른 목록 |
| `watch(대상, (새값) => ...)` | 값이 바뀔 때 **부수 효과**(화면 밖의 일)를 실행 | 탭 제목 바꾸기, 저장 |

- 템플릿 안에서는 `.value`를 쓰지 않습니다. `keyword.value`가 아니라 `keyword`라고 씁니다. Vue가 알아서 풀어 줍니다.
- "계산해서 보여 줄 값"은 `computed`, "바뀌면 무언가를 할 일"은 `watch`라고 기억하면 됩니다.

### 템플릿 문법

| 문법 | 뜻 |
|---|---|
| 이중 중괄호 안에 식 | 식의 결과를 글자로 출력. 위 예제의 `filtered.length` |
| `:속성="식"` (`v-bind:`의 줄임) | 속성 값에 식의 결과를 넣음 |
| `@이벤트="식"` (`v-on:`의 줄임) | 이벤트가 나면 식을 실행. 예: `@click="count++"` |
| `v-if` / `v-else` | 조건이 참일 때만 그림 |
| `v-for="(item, i) in list"` | 목록만큼 반복. `:key`에 고유한 값을 줘야 Vue가 항목을 구분합니다 |
| `v-model="변수"` | 입력 상자와 변수를 **양방향**으로 묶음. 입력하면 변수가 바뀌고, 변수가 바뀌면 입력 상자도 바뀜 |
| `v-pre` | 이 태그 안은 템플릿 문법을 해석하지 말고 글자 그대로 둠 |

**확인 방법**: 개발 서버에서 입력 상자에 "라떼"를 치면 목록이 2개로 줄고, 아래에 `2 / 3개`가 보이며, 브라우저 탭 제목이 `"라떼" 검색 중`으로 바뀌면 `v-model` → `computed` → `watch`가 모두 동작한 것입니다.

### style scoped

`<style scoped>`의 CSS는 이 컴포넌트에만 적용됩니다. 빌드 결과에 붙은 `data-v-8d833fb3` 속성으로 범위를 제한합니다. `var(--vp-c-divider)` 같은 VitePress 테마 변수를 쓰면 다크 모드에서도 색이 자동으로 맞춰집니다.

## 왜 마크다운에서 이중 중괄호가 깨지나

이제 이유를 정확히 설명할 수 있습니다.

1. VitePress는 마크다운을 HTML로 바꾼 뒤, 그 결과를 **Vue 템플릿으로 컴파일**합니다.
2. Vue 템플릿에서 이중 중괄호는 "안의 식을 계산해 출력하라"는 뜻입니다.
3. 그래서 본문에 GitHub Actions 표현식(`github.event.repository.name`을 이중 중괄호와 달러 기호로 감싼 것)을 쓰면, Vue는 빌드 중 SSR 단계에서 `github`라는 변수의 `event`를 읽으려 합니다. 그런 변수는 없으므로 실패합니다.

연습 프로젝트의 본문에 그 표현식을 **인라인 코드**(백틱 한 쌍)로 넣고 빌드했을 때 실제 출력입니다.

```text
- rendering pages...
✖ rendering pages...
build error:
Cannot read properties of undefined (reading 'event')
TypeError: Cannot read properties of undefined (reading 'event')
```

인라인 코드도 HTML로는 `<code>` 태그일 뿐이라 Vue 템플릿 해석을 피하지 못합니다. 반면 **펜스 코드 블록**은 VitePress가 `<pre ... v-pre="">`로 바꿉니다. `v-pre`가 붙은 태그 안은 Vue가 해석하지 않으므로 안전합니다. 이 내용은 [3-3](./03-markdown-it-shiki)에서 실제 변환 결과로 다시 확인합니다.

::: tip 본문에서 꼭 써야 한다면
이 가이드의 [문서 작성 규칙](../guide/writing-guide) 2번처럼 `<span v-pre>`로 감싸거나, 중괄호를 빼고 이름만 씁니다. 가장 안전한 방법은 코드 블록으로 옮기는 것입니다.
:::

## ts-wiki에서는

**`package.json`** — `vue`를 직접 적어 둔 이유가 여기 있습니다.

```json
"devDependencies": {
  "typescript": "5.6.3",
  "vitepress": "1.6.3",
  "vue": "3.5.13"
}
```

테마 컴포넌트가 `vue`에서 `ref` 등을 `import`하므로, 버전을 명시해 두어야 VitePress가 기대하는 버전과 어긋나지 않습니다. `npm ls`에서 `vue@3.5.13 deduped`가 반복된 것은 모두가 이 한 벌을 쓴다는 뜻입니다.

**`docs/.vitepress/config.mts` 32~34줄** — Vite 설정을 넘기는 유일한 곳입니다.

```ts
  // 로컬 검색 인덱스가 한 청크에 들어가 500kB를 넘으므로 경고 기준만 올립니다.
  vite: {
    build: { chunkSizeWarningLimit: 4000 },
  },
```

Rollup이 만든 파일 중 하나(검색 인덱스)가 기본 경고 기준 500kB를 넘기 때문입니다. 자세한 실험은 [3-4](./04-local-search)에 있습니다.

**`docs/.vitepress/theme/components/LessonMeta.vue`** — 이 레슨에서 배운 문법이 거의 다 들어 있는 가장 작은 예입니다.

```vue
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

- `defineProps`의 결과를 변수에 담지 않았습니다. 템플릿에서만 쓰므로 그래도 됩니다.
- `minutes: number`이므로 사용하는 쪽은 `:minutes="40"`처럼 콜론을 붙여 숫자로 넘깁니다.
- `prev`는 선택(`?`)이고, `v-if="prev"`로 값이 있을 때만 그립니다.

**`docs/.vitepress/theme/components/PartLessons.vue`** — `v-for`와 `computed` 대신 일반 변수, `withBase`를 씁니다.

```vue
<tr v-for="(lesson, i) in part.lessons" :key="lesson.slug">
  <td>{{ part.dir === 'appendix' ? i + 1 : `${part.no}-${i + 1}` }}</td>
  <td>
    <a :href="withBase(`/${part.dir}/${lesson.slug}`)">{{ lesson.title }}</a>
  </td>
```

`withBase`는 VitePress가 주는 함수로, `base`(GitHub Pages에서는 `/ts-wiki/`)를 주소 앞에 붙여 줍니다. 컴포넌트 안에서 손으로 만든 링크는 VitePress가 자동으로 고쳐 주지 않으므로 이 함수가 필요합니다. 이 파트 소개 페이지 맨 위의 레슨 표가 바로 이 컴포넌트입니다.

컴포넌트 네 개를 하나씩 읽는 것은 [테마 확장과 커스텀 컴포넌트](../part4-anatomy/05-theme-components)에서 합니다.

## 자주 하는 실수

**1. 본문의 이중 중괄호로 빌드 실패**

- 증상: `build error: Cannot read properties of undefined (reading '...')`
- 원인: 마크다운 본문(인라인 코드 포함)이 Vue 템플릿으로 해석됨
- 해결: 펜스 코드 블록으로 옮기거나 `<span v-pre>`로 감쌉니다.

**2. 빌드 로그에 `ReferenceError: localStorage is not defined` (또는 `window`, `document`)**

- 증상: `dev`에서는 잘 되는데, `build`의 `rendering pages...` 중에 이 오류가 찍힙니다. 빌드 자체는 끝나지만 빌드된 HTML에서 그 컴포넌트 부분이 빠져 있습니다.
- 원인: 컴포넌트가 SSR 단계(Node.js)에서도 실행되는데, 브라우저 전용 객체를 바로 썼습니다.
- 해결: 브라우저 전용 코드는 `onMounted` 안이나 이벤트 처리기 안으로 옮깁니다.

**3. 숫자 props가 글자로 넘어감**

- 증상: `minutes + 10`이 `4010`처럼 이어 붙은 글자가 됨, 또는 개발 서버로 연 페이지의 브라우저 콘솔에 `[Vue warn]: Invalid prop: type check failed for prop "minutes"`로 시작하는 경고
- 원인: `minutes="40"`처럼 콜론 없이 넘겼습니다.
- 해결: `:minutes="40"`으로 씁니다.

**4. 스크립트에서 `.value`를 빼먹음**

- 증상: `keyword.includes is not a function`, 또는 값이 안 바뀜
- 원인: `ref`는 상자이므로 스크립트에서는 `keyword.value`로 꺼내야 합니다(템플릿에서는 생략).
- 해결: 스크립트에서는 `.value`를 붙입니다.

**5. 포트가 바뀌어 엉뚱한 주소로 접속**

- 증상: 터미널에 `Port 5190 is in use, trying another one...`이 나오고 `Local: http://localhost:5191/`로 뜸. 북마크한 5190 주소에서는 다른 사이트가 보임
- 원인: 그 포트를 이미 다른 프로그램(다른 개발 서버)이 쓰고 있습니다.
- 해결: 기존 서버를 끄거나, 터미널에 실제로 찍힌 주소로 접속합니다. 포트가 바뀌면 안 될 때는 `--strictPort`를 붙입니다.

## 직접 해 보기

**과제 1 ⭐** 내 연습 프로젝트(또는 ts-wiki)에서 `npm ls vite vue shiki minisearch`를 실행하고, 각 패키지 버전을 표로 적어 보세요.

::: details 힌트·정답 보기
작성 시점 기준 VitePress 1.6.3이면 vite 5.4.21, vue 3.5.13, shiki 2.5.0, minisearch 7.2.0입니다. `npm install`을 언제 했느냐에 따라 vite 같은 패키지의 마지막 자리는 다를 수 있습니다(vitepress가 `^5.4.14`처럼 범위로 요구하기 때문). `package-lock.json`이 있으면 그 파일에 적힌 버전으로 고정됩니다.
:::

**과제 2 ⭐** 개발 서버를 켠 상태에서 마크다운 문장을 고치고 저장해, 새로 고침 없이 바뀌는지 확인하세요. 그다음 `config.mts`를 고치고 저장하면 어떻게 되는지도 보세요.

::: details 힌트·정답 보기
마크다운은 HMR로 그 자리에서 바뀝니다. `config.mts`는 사이트 전체에 영향을 주므로 부분 교체가 안 되고, VitePress가 설정 변경을 감지해 개발 서버를 다시 시작합니다(공식 문서 기준 동작). 터미널에 어떤 메시지가 찍히는지 직접 확인해 보세요. 반영이 안 되면 `Ctrl+C`로 끄고 다시 켭니다.
:::

**과제 3 ⭐⭐** 3-1에서 만든 `Hello.vue`에 `watch`를 추가해, 숫자가 10이 되면 개발자 도구 콘솔에 경고를 남기도록 해 보세요.

::: details 힌트·정답 보기
```ts
import { ref, computed, watch } from 'vue'

watch(count, (now) => {
  if (now === 10) console.warn('10번 눌렀습니다')
})
```
연습용이므로 콘솔 출력을 써도 되지만, 실제 저장소에 커밋할 때는 이런 디버그 출력은 지웁니다.
:::

**과제 4 ⭐⭐** `MenuFilter.vue`의 `<script setup>` 맨 위에 `const saved = localStorage.getItem('kw')`를 넣고 `dev`와 `build`를 각각 실행해 보세요. 결과가 다른 이유를 설명하세요.

::: details 힌트·정답 보기
`dev`에서는 브라우저에서만 실행되므로 동작하지만, `build`는 SSR 단계(Node.js)에서 `ReferenceError: localStorage is not defined`를 찍고, 빌드된 `recipe.html`에서 `menu-filter` 부분이 빠집니다(작성 시점 VitePress 1.6.3에서 빌드 자체는 `build complete`로 끝났습니다). `onMounted(() => { keyword.value = localStorage.getItem('kw') ?? '' })`로 옮기면 둘 다 동작합니다. 실험 뒤에는 원래대로 돌려 둡니다.
:::

**과제 5 ⭐⭐⭐** 빌드한 HTML에서 `MenuFilter`가 그린 부분을 찾아 `<!--[-->` 주석과 `data-v-...` 속성을 확인하고, 각각 무엇을 위한 것인지 적어 보세요.

::: details 힌트·정답 보기
`<!--[-->`·`<!--]-->`는 하이드레이션 때 `v-for` 목록의 범위를 찾기 위한 표시이고, `data-v-...`는 `<style scoped>`의 CSS를 이 컴포넌트에만 적용하기 위한 표시입니다.
:::

## 확인 퀴즈

**1.** `vitepress dev`에서 `.vue` 파일을 요청하면 브라우저는 무엇을 받나요?

::: details 정답 보기
Vite가 즉석에서 변환한 자바스크립트(`text/javascript`)를 받습니다. 브라우저는 `.vue` 형식을 직접 이해하지 못합니다.
:::

**2.** SSR과 하이드레이션을 각각 한 문장으로 설명하세요.

::: details 정답 보기
SSR은 화면을 미리 서버(빌드 PC)에서 HTML로 그려 두는 것이고, 하이드레이션은 브라우저가 그 HTML에 이벤트와 반응성을 연결해 동작하게 만드는 것입니다.
:::

**3.** `ref`로 만든 값을 스크립트와 템플릿에서 읽는 방법의 차이는?

::: details 정답 보기
스크립트에서는 `.value`를 붙여 읽고, 템플릿에서는 `.value` 없이 이름만 씁니다.
:::

**4.** 인라인 코드 안의 이중 중괄호는 빌드를 깨뜨리는데, 펜스 코드 블록 안에서는 괜찮은 이유는?

::: details 정답 보기
펜스 코드 블록은 `v-pre`가 붙은 `<pre>` 태그로 바뀌어 Vue가 해석하지 않지만, 인라인 코드는 평범한 `<code>` 태그라 Vue 템플릿으로 해석되기 때문입니다.
:::

**5.** `npm ls markdown-it`이 비어 있는 이유는?

::: details 정답 보기
VitePress 1.6.3이 markdown-it을 별도 의존 패키지가 아니라 자기 배포 파일 안에 묶어 넣었기 때문입니다.
:::

## 정리

- VitePress = Vite(개발 서버·HMR·Rollup 번들) + Vue(템플릿·반응성·SSR) + 기본 테마입니다.
- `npm ls`로 확인한 작성 시점 버전: vite 5.4.21, vue 3.5.13, shiki 2.5.0, minisearch 7.2.0, rollup 4.65.1, esbuild 0.21.5. markdown-it은 VitePress 안에 묶여 있습니다.
- 개발 서버는 요청받을 때 파일을 변환하고, 빌드는 client·server 번들을 만든 뒤 SSR로 페이지마다 HTML을 그립니다.
- 브라우저에서는 하이드레이션으로 이미 그려진 HTML이 살아납니다. 그래서 컴포넌트는 Node.js에서도 실행된다는 점을 기억해야 합니다.
- SFC 기본: `script setup`, `defineProps`, `ref`/`computed`/`watch`, `v-if`/`v-for`/`v-model`, `:속성`, `@이벤트`, `style scoped`.
- 마크다운도 Vue 템플릿이므로 이중 중괄호는 `v-pre`가 붙는 펜스 코드 블록 안에서만 씁니다.

## 다음 단계

[3-3. 마크다운 확장과 코드 하이라이트 (markdown-it · Shiki)](./03-markdown-it-shiki)에서 마크다운이 HTML로 바뀌는 과정과, 코드 블록에 색·줄 번호·강조가 붙는 원리를 봅니다.
