---
title: 설정과 컴포넌트를 왜 TypeScript로 쓰나
---

# 설정과 컴포넌트를 왜 TypeScript로 쓰나

<LessonMeta level="초급" :minutes="30" prev="글은 git diff와 이식성 때문에 Markdown으로 쓴다는 것을 확인했습니다." />

## 이번에 배울 것

- 위키 도구의 "언어 생태계"(Node.js·Python·Go·Ruby)가 왜 선택 기준이 되는지 설명할 수 있다.
- ts-wiki의 설정 파일이 `.js`가 아니라 `.mts`인 이유를 `defineConfig`, `DefaultTheme.SidebarItem`, `satisfies Theme`와 연결해 설명할 수 있다.
- `tsc`(TypeScript 컴파일러)로 ts-wiki 설정 파일을 검사해, 타입이 실수를 잡는 장면을 직접 확인할 수 있다.
- 타입이 **잡지 못하는** 실수도 있다는 것과, VitePress 빌드는 타입 검사를 하지 않는다는 사실을 말할 수 있다.

## 먼저 알아 둘 것

- [Node.js와 npm](../part1-concepts/04-node-npm)
- [왜 VitePress인가](./02-why-vitepress)의 실습 폴더 만들기(4-1)
- TypeScript 문법을 몰라도 됩니다. "변수에 어떤 종류의 값이 들어가는지 적어 두는 JavaScript" 정도로 이해하면 충분합니다.

## 비유로 이해하기

한빛 카페의 **주문서 양식**을 떠올려 봅시다.

- 빈 종이에 손으로 주문을 받으면(JavaScript) 직원이 "아이스 아메리카노 사이즈 **라지**"라고 쓰든 "**랒지**"라고 쓰든 종이는 아무 말도 하지 않습니다. 틀린 건 음료를 만들 때 알게 됩니다.
- 칸과 선택지가 인쇄된 양식(TypeScript)을 쓰면 "사이즈: □ 스몰 □ 레귤러 □ 라지" 중에 고르게 됩니다. 없는 사이즈를 적으면 **주문을 받는 순간** 바로 이상하다는 것을 압니다.

VitePress 설정도 주문서와 같습니다. 어떤 칸(속성)이 있고 어떤 값을 넣을 수 있는지 VitePress가 **타입**으로 알려 주므로, 틀린 값을 쓰는 순간 에디터가 빨간 줄을 긋습니다.

## 개념 설명

### 1. 요구사항: 언어에 무엇이 필요했나

| 요구사항 | 언어·생태계에 대한 질문 |
|---|---|
| 5. 한 사람이 관리 | 설치할 런타임(프로그램 실행 환경)이 하나로 끝나나? 설정 실수를 누가 대신 잡아 주나? |
| 1·2. 학습 위키, 코드 예제 | 독자가 이미 쓰는 도구인가? (ts-wiki는 TypeScript 위키) |
| 4. 사내 서버 | 빌드에 필요한 도구를 Docker 이미지 하나에 담을 수 있나? |

### 2. 왜 Node.js 생태계인가

SSG는 각자 **어떤 언어로 만들어졌는지**에 따라 설치해야 하는 런타임이 다릅니다. 대표적인 예를 비교합니다(각 공식 문서 기준).

| 생성기 | 언어 | 설치 방법(대표) | ts-wiki 입장에서의 의미 |
|---|---|---|---|
| VitePress, Docusaurus | JavaScript/TypeScript(Node.js) | `npm install` | 독자·작성자가 이미 Node.js를 설치함. 런타임 하나로 끝 |
| MkDocs | Python | `pip install` | Node.js와 별도로 Python 환경을 관리해야 함 |
| Hugo | Go | 실행 파일 하나를 내려받음 | 설치는 단순하지만 테마·확장은 Go 템플릿 문법을 배워야 함 |
| Jekyll | Ruby | `gem install`(Ruby 패키지 도구) | Ruby 환경 관리 필요. Windows에서는 설치 단계가 더 있음 |

핵심은 **"이미 가진 것 위에서 끝나느냐"** 입니다. ts-wiki는 TypeScript를 가르치는 위키라서 독자도 작성자도 [준비물 설치](../part0-start/03-setup)에서 Node.js를 설치합니다. 그 위에서 위키까지 돌아가면 **설치·업데이트·Docker 이미지가 전부 Node.js 하나**로 정리됩니다. 실제로 ts-wiki의 `Dockerfile` 빌드 단계는 `FROM node:22-alpine` 한 줄로 시작합니다.

::: info Hugo가 나쁘다는 뜻이 아닙니다
Hugo는 빌드가 아주 빠르고 실행 파일 하나로 설치되는 장점이 있습니다. 팀이 Go를 쓰거나, 페이지가 수만 개라 빌드 속도가 가장 중요하다면 좋은 선택입니다. 비교는 언제나 **내 요구사항 기준**입니다.
:::

### 3. 왜 설정 파일이 `.mts`인가

ts-wiki의 설정 파일 이름은 `docs/.vitepress/config.mts`입니다. 확장자 두 가지를 나눠 읽습니다.

- **`ts`**: TypeScript 파일입니다. 타입 정보를 쓸 수 있습니다.
- **`m`**: ES 모듈(ESM, `import`/`export` 문법을 쓰는 현대 JavaScript 모듈 방식) 파일이라는 표시입니다. Node.js에는 오래된 모듈 방식(CommonJS, `require`)도 있어서, 파일 이름으로 "이건 ESM"이라고 못 박아 두면 헷갈릴 일이 없습니다.

VitePress는 설정 파일로 `config.js`, `config.ts`, `config.mjs`, `config.mts`를 모두 읽습니다(공식 문서 기준). 그중 `.mts`를 고른 이유는 아래 세 가지 **타입 도우미** 때문입니다.

#### 도우미 1: `defineConfig` — 자동 완성과 검사

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '한빛 카페 위키',
})
```

`defineConfig`는 실행할 때는 받은 객체를 그대로 돌려줄 뿐입니다. 하는 일은 **"이 객체는 VitePress 설정이다"라고 TypeScript에게 알려 주는 것**입니다. 그 덕에 VS Code에서 `themeConfig: {` 안에 커서를 두고 `Ctrl+Space`를 누르면 쓸 수 있는 속성 목록(`nav`, `sidebar`, `search`, `outline` …)이 뜹니다. 문서를 찾아보지 않아도 됩니다.

#### 도우미 2: `DefaultTheme.SidebarItem` — 직접 만든 데이터에 타입 붙이기

ts-wiki는 사이드바를 손으로 쓰지 않고 `curriculum.mts`에서 **코드로 만들어** 냅니다. 이렇게 만든 값은 `defineConfig` 바깥에서 만들어지므로, 따로 타입을 붙여야 검사를 받습니다.

```ts
const curriculumSidebar: DefaultTheme.SidebarItem[] = curriculum.map((part) => ({
```

"이 값은 기본 테마의 사이드바 항목 배열이다"라고 적어 둔 것입니다.

#### 도우미 3: `satisfies Theme` — 테마 객체 검사

```ts
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    ...
  },
} satisfies Theme
```

`satisfies`(TypeScript 4.9부터)는 "이 객체가 `Theme` 규격을 만족하는지 검사하되, 객체 자체의 타입은 바꾸지 마라"는 뜻입니다. 이 한 단어 덕에 `enhanceApp`이 받는 `app`이 무엇인지 TypeScript가 알게 됩니다.

### 4. 따라 하기: tsc로 실수 잡아 보기

말로만 들으면 와닿지 않으니 직접 확인합니다. ts-wiki 파일을 **복사해서** 실습 폴더에서 검사합니다(원본은 고치지 않습니다).

#### 4-1. 준비

[2-2 실습 폴더](./02-why-vitepress)를 지웠다면 다시 만들고, TypeScript를 추가로 설치합니다.

```powershell
# Windows PowerShell
mkdir $HOME\vp-types
cd $HOME\vp-types
npm init -y
npm install -D vitepress@1.6.3 vue@3.5.13 typescript@5.6.3
mkdir tscheck\theme
Copy-Item D:\workspace\ts-wiki\docs\.vitepress\config.mts tscheck\
Copy-Item D:\workspace\ts-wiki\docs\.vitepress\curriculum.mts tscheck\
Copy-Item D:\workspace\ts-wiki\docs\.vitepress\theme\index.ts tscheck\theme\
```

```bash
# macOS / Linux (ts-wiki 위치는 자기 PC에 맞게 바꿉니다)
mkdir -p ~/vp-types/tscheck/theme && cd ~/vp-types
npm init -y
npm install -D vitepress@1.6.3 vue@3.5.13 typescript@5.6.3
cp <ts-wiki 경로>/docs/.vitepress/config.mts <ts-wiki 경로>/docs/.vitepress/curriculum.mts tscheck/
cp <ts-wiki 경로>/docs/.vitepress/theme/index.ts tscheck/theme/
```

```bash
npx tsc -v
```

```text
Version 5.6.3
```

`tscheck` 폴더에 파일 두 개를 더 만듭니다. 첫째, **검사 설정** `tsconfig.json`입니다.

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "skipLibCheck": true
  },
  "include": ["**/*.mts", "**/*.ts"]
}
```

- `strict`: 엄격 모드. ts-wiki가 가르치는 기준입니다.
- `noEmit`: 검사만 하고 JavaScript 파일은 만들지 않습니다.
- `allowImportingTsExtensions`: `import { curriculum } from './curriculum.mts'`처럼 `.mts` 확장자를 붙인 import를 허용합니다(`noEmit`과 함께 써야 합니다).

둘째, **실습용 선언 파일** `shims.d.ts`입니다.

```ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
// 실습용: ts-wiki에는 @types/node가 없으므로 process만 최소로 선언합니다.
declare const process: { env: Record<string, string | undefined> }
```

- 첫 블록은 "`.vue` 파일을 import하면 Vue 컴포넌트가 나온다"고 TypeScript에게 알려 줍니다. `tsc`는 `.vue` 파일을 직접 읽지 못하기 때문입니다.
- 둘째 줄은 `config.mts` 5번째 줄의 `process.env.WIKI_BASE`를 위한 것입니다. ts-wiki는 Node.js 타입 패키지(`@types/node`)를 설치하지 않았으므로, 실습에서만 최소한으로 선언합니다.

원본 그대로 검사합니다.

```bash
cd tscheck
npx tsc -p .
```

**확인 방법**: 아무것도 출력되지 않고 끝나면 성공입니다(오류 0개). PowerShell에서 `$LASTEXITCODE`, bash에서 `echo $?`를 치면 `0`이 나옵니다.

#### 4-2. 실수 1: 검색 공급자 이름 오타

`config.mts` 59번째 줄 `provider: 'local'`을 `'locale'`로 바꾸고 다시 검사합니다.

```text
config.mts(59,7): error TS2820: Type '"locale"' is not assignable to type '"local" | "algolia"'. Did you mean '"local"'?
```

**해설**: VitePress 타입은 `provider`에 `'local'` 또는 `'algolia'`만 들어갈 수 있다고 정해 두었습니다. TypeScript가 줄 번호(59)와 함께 "혹시 `'local'`인가요?"라고 고칠 값까지 알려 줍니다.

**이 실수가 왜 무서운가**: 같은 오타를 실제 VitePress 프로젝트에 넣고 `vitepress build`를 돌려 보니 **빌드는 `build complete`로 성공**했습니다. 대신 결과물에서 검색 관련 파일(`@localSearchIndexroot...js`, `VPLocalSearchBox...js`)이 통째로 빠졌습니다. 즉 **검색 버튼이 조용히 사라진 사이트가 배포**됩니다. 타입이 없으면 사용자가 "검색이 안 돼요"라고 알려 줄 때까지 모릅니다.

#### 4-3. 실수 2: 설정 이름 오타

원본으로 되돌린 뒤 57번째 줄 `outline:`을 `outlin:`으로 바꿉니다.

```text
config.mts(57,5): error TS2561: Object literal may only specify known properties, but 'outlin' does not exist in type 'Config'. Did you mean to write 'outline'?
```

**해설**: 기본 테마 설정(`Config`)에 `outlin`이라는 칸은 없습니다. 이것을 **초과 속성 검사**(excess property check, 객체를 바로 써 넣을 때 정해지지 않은 속성을 찾아내는 검사)라고 합니다.

#### 4-4. 실수 3: 사이드바 값의 종류가 틀림

원본으로 되돌린 뒤 10번째 줄 `collapsed: part.no > 1,`을 `collapsed: 'yes',`로 바꿉니다.

```text
config.mts(8,7): error TS2322: Type '{ text: string; collapsed: string; items: { text: string; link: string; }[]; }[]' is not assignable to type 'SidebarItem[]'.
  Type '{ text: string; collapsed: string; items: { text: string; link: string; }[]; }' is not assignable to type 'SidebarItem'.
    Types of property 'collapsed' are incompatible.
      Type 'string' is not assignable to type 'boolean | undefined'.
```

**해설**: 메시지는 길지만 맨 아래 줄부터 읽으면 됩니다. "`collapsed`에는 `boolean`(참/거짓)이 들어가야 하는데 `string`(문자열)을 넣었다." 이 검사는 8번째 줄의 `: DefaultTheme.SidebarItem[]` 표시가 있어서 가능합니다. 이 표시를 지우면 같은 실수를 잡지 못합니다.

#### 4-5. 실수 4: 커리큘럼 난이도에 없는 값

`curriculum.mts` 29번째 줄의 첫 `level: '입문',`을 `level: '초보',`로 바꿉니다.

```text
curriculum.mts(29,5): error TS2322: Type '"초보"' is not assignable to type '"입문" | "초급" | "중급" | "고급" | "실전" | "마스터"'.
```

**해설**: ts-wiki가 `curriculum.mts` 19번째 줄에 직접 정의한 타입이 일을 했습니다.

```ts
  level: '입문' | '초급' | '중급' | '고급' | '실전' | '마스터'
```

라이브러리가 준 타입뿐 아니라 **내가 만든 데이터 규칙**도 타입으로 지킬 수 있습니다. 레슨이 75개라도 난이도 표기가 흔들리지 않습니다.

#### 4-6. 실수 5: 테마 함수의 매개변수 이름 오타

`theme/index.ts` 11번째 줄 `enhanceApp({ app })`를 `enhanceApp({ ap })`로 바꿉니다.

```text
theme/index.ts(11,16): error TS2339: Property 'ap' does not exist on type 'EnhanceAppContext'.
theme/index.ts(13,5): error TS2304: Cannot find name 'app'.
...
```

이번에는 반대로, 원본에서 18번째 줄의 `satisfies Theme`만 지워 봅니다.

```text
theme/index.ts(11,16): error TS7031: Binding element 'app' implicitly has an 'any' type.
```

**해설**: `satisfies Theme`가 없으면 TypeScript는 `enhanceApp`이 무엇을 받는지 모릅니다. 그래서 `app`의 타입을 알 수 없어 `any`(아무 타입)로 취급하고, strict 모드가 그것을 오류로 막습니다. `satisfies Theme` 한 단어가 **매개변수 타입을 알려 주는 역할**도 한다는 것을 확인했습니다.

#### 4-7. 타입이 못 잡는 실수

공정하게, 못 잡는 경우도 봅니다. 원본으로 되돌린 뒤 15번째 줄(레슨 링크)의 `link:`를 `lnk:`로 바꾸고 검사합니다.

```bash
npx tsc -p .
```

아무 오류도 나오지 않습니다(exit 0). 이 객체는 `map` 안에서 만들어진 뒤 배열에 담겨 전달되므로, **초과 속성 검사가 적용되지 않습니다**(4-3과의 차이: 4-3은 설정 객체에 바로 써 넣은 경우). `link`가 없어도 `SidebarItem` 규격상 문제가 없으니 통과합니다. 결과는 **링크가 없는 사이드바 항목**입니다.

::: warning 타입은 안전망이지 완벽한 보증이 아닙니다
타입 검사를 통과해도 동작을 꼭 눈으로 확인해야 합니다. ts-wiki의 작성 규칙이 "`npm run build`로 오류가 없는지 확인하고 커밋합니다", 그리고 개발 서버로 화면을 확인하는 흐름을 함께 두는 이유입니다.
:::

#### 4-8. 실습 정리

```powershell
cd $HOME; Remove-Item -Recurse -Force $HOME\vp-types
```

```bash
cd ~ && rm -rf ~/vp-types
```

### 5. 중요한 사실: VitePress 빌드는 타입 검사를 하지 않습니다

4-2에서 봤듯이 `'locale'` 오타가 있어도 `vitepress build`는 성공했습니다. VitePress(정확히는 그 밑의 Vite·esbuild)는 `.mts`를 실행하기 위해 **타입 표시를 지우기만 하고 검사하지 않습니다.** 빠르게 빌드하기 위한 설계입니다.

그래서 타입의 도움을 받는 곳은 두 군데입니다.

1. **에디터(VS Code)**: 파일을 열면 TypeScript가 백그라운드에서 검사해 빨간 줄을 긋습니다. ts-wiki는 이 방식에 기댑니다.
2. **명령으로 검사(`tsc --noEmit`)**: 이 레슨에서 한 방식입니다. CI(자동 빌드)에 넣으면 실수가 배포 전에 걸립니다.

### 6. 왜 Vue SFC + TypeScript인가

ts-wiki의 화면 부품은 **Vue SFC**(Single File Component, `.vue` 파일 하나에 스크립트·템플릿·스타일을 함께 담는 형식)로 만들었고, 스크립트는 `lang="ts"`입니다. `LessonMeta.vue`의 앞부분입니다.

```vue
<script setup lang="ts">
// 레슨 상단의 난이도·예상 시간·선수 지식 배지
defineProps<{
  level: string
  minutes: number
  prev?: string
}>()
</script>
```

- **Vue인 이유**: VitePress가 Vue로 만들어졌습니다. 기본 테마도 Vue 컴포넌트라 같은 방식으로 부품을 끼워 넣는 것이 가장 자연스럽습니다. React 컴포넌트를 쓰려면 별도 연결 작업이 필요합니다.
- **TypeScript인 이유**: `defineProps`에 타입을 적으면 "이 부품은 `level`(문자열), `minutes`(숫자), 선택 사항인 `prev`를 받는다"는 **사용 설명서**가 됩니다. `prev?`의 물음표는 "없어도 된다"는 뜻입니다.

::: info .vue 파일 검사에는 vue-tsc가 필요합니다
`tsc`는 `.vue` 파일을 읽지 못합니다(그래서 4-1에서 `shims.d.ts`를 만들었습니다). `.vue` 파일 안의 타입까지 명령으로 검사하려면 Vue 공식 도구인 `vue-tsc`를 따로 설치해야 합니다. ts-wiki는 이것을 설치하지 않았고, VS Code의 Vue 확장 기능으로 에디터 안에서 확인하는 방식을 택했습니다.
:::

### 7. 후보 비교표

| 선택지 | 장점 | 단점 | 어울리는 상황 |
|---|---|---|---|
| 설정을 `.mts`(TypeScript)로 | 자동 완성, 오타·잘못된 값 즉시 발견, 직접 만든 데이터에도 규칙 | 타입 문법을 조금 알아야 함, 빌드는 검사 안 함 | 설정을 코드로 만들어 내는 위키(ts-wiki처럼) |
| 설정을 `.mjs`(JavaScript)로 | 배울 것 없음, 짧음 | 오타가 배포까지 갈 수 있음 | 설정이 몇 줄뿐인 작은 사이트 |
| YAML 설정(MkDocs 등) | 사람이 읽기 쉬움, 코드 아님 | 반복·계산을 못 함(사이드바 자동 생성 어려움), 들여쓰기 실수 | 설정이 고정된 문서 사이트 |
| 컴포넌트를 Vue SFC + TS로 | VitePress와 같은 방식, props 규격이 문서 역할 | Vue 문법을 배워야 함, `.vue` 명령 검사는 별도 도구 | VitePress에 부품을 넣을 때 |

## ts-wiki에서는

| 파일 | 타입이 하는 일 |
|---|---|
| `docs/.vitepress/config.mts` 1번째 줄 | `import { defineConfig, type DefaultTheme } from 'vitepress'` — 설정 도우미와 테마 타입을 가져옵니다. `type` 표시는 "타입으로만 쓰고 실행 코드에는 남기지 않는다"는 뜻입니다. |
| `config.mts` 8번째 줄 | `DefaultTheme.SidebarItem[]` — 커리큘럼으로 만든 사이드바를 검사합니다(4-4). |
| `config.mts` 20번째 줄 | `defineConfig({` — 설정 전체를 검사하고 자동 완성을 켭니다(4-2, 4-3). |
| `docs/.vitepress/curriculum.mts` 4~21번째 줄 | `Lesson`, `Part` 인터페이스와 `level`의 허용 값 — 커리큘럼 데이터 규칙(4-5). |
| `docs/.vitepress/theme/index.ts` 18번째 줄 | `satisfies Theme` — 테마 객체와 `enhanceApp` 매개변수를 검사합니다(4-6). |
| `docs/.vitepress/theme/components/*.vue` | `script setup lang="ts"`와 `defineProps` 타입 — 부품의 사용 설명서. |
| `package.json` | `"typescript": "5.6.3"` — 에디터가 쓰는 TypeScript 버전을 고정합니다. 작성 시점 npm 최신은 7.0.2이지만, ts-wiki는 위키 내용(TypeScript 5.x · strict 기준)과 맞춰 5.6.3을 씁니다. |

### ts-wiki의 결정과 그 대가

| 얻은 것 | 내준 것(대가) |
|---|---|
| 설정 오타·잘못된 값을 에디터에서 바로 발견 | 빌드 단계에서는 검사하지 않음. 명령 검사를 원하면 `tsconfig.json`과 `tsc`를 따로 준비해야 함 |
| `curriculum.mts` 하나로 사이드바·목차를 코드로 생성(타입으로 규칙 유지) | 설정을 읽으려면 JavaScript·TypeScript를 조금 알아야 함 |
| Node.js 하나로 위키·빌드·Docker 통일 | Python·Go 쪽 생성기의 장점(예: Hugo의 빌드 속도)은 포기 |
| Vue SFC + TS로 부품 규격 명확 | `.vue` 명령 검사는 `vue-tsc`가 필요(ts-wiki는 미설치) |

## 이럴 땐 다른 걸 고르세요

- **설정이 열 줄 남짓이고 앞으로도 안 늘어난다** → `.mjs`(JavaScript)나 YAML로도 충분합니다. 타입 준비가 더 일입니다.
- **팀에 Python 개발자만 있다** → MkDocs 계열과 YAML 설정이 학습 비용이 낮습니다.
- **수만 페이지를 몇 초 안에 빌드해야 한다** → Go 기반 Hugo 같은 도구의 빌드 속도를 검토합니다.
- **여러 명이 설정을 고치고 PR로 리뷰한다** → 이 레슨의 `tsc --noEmit` 검사를 CI(GitHub Actions)에 넣는 것을 권합니다. 에디터에만 기대면 사람마다 결과가 다를 수 있습니다.

## 자주 하는 실수

### 실수 1: Cannot find name 'process'

- **증상**: `tsc`를 돌리면 `error TS2580: Cannot find name 'process'. Do you need to install type definitions for node?`
- **원인**: `process`는 Node.js가 제공하는 값이라 Node.js 타입(`@types/node`)이 없으면 TypeScript가 모릅니다. 실습 중 실제로 만난 오류입니다.
- **해결**: 실제 프로젝트라면 `npm install -D @types/node`, 이 레슨 실습처럼 잠깐 검사만 할 때는 `shims.d.ts`에 최소 선언을 둡니다.

### 실수 2: TS5097 .mts 확장자 import 오류

- **증상**: `config.mts`의 `import { curriculum } from './curriculum.mts'` 줄에서 `error TS5097: An import path can only end with a '.mts' extension when 'allowImportingTsExtensions' is enabled.`
- **원인**: TypeScript는 기본적으로 `.mts` 확장자를 붙인 import를 막습니다.
- **해결**: `tsconfig.json`에 `"allowImportingTsExtensions": true`와 `"noEmit": true`를 함께 둡니다(4-1).

### 실수 3: 타입 검사를 통과했으니 화면도 맞을 거라고 믿기

- **증상**: `tsc`가 조용한데 사이드바 항목을 눌러도 이동하지 않습니다.
- **원인**: 4-7처럼 `map` 안에서 만든 객체의 속성 이름 오타는 초과 속성 검사가 잡지 못합니다.
- **해결**: 타입 검사 뒤에 개발 서버로 화면을 눌러 보고, `npm run build`로 깨진 링크를 확인합니다.

### 실수 4: vitepress build가 성공했으니 설정이 맞다고 믿기

- **증상**: 배포했더니 검색 버튼이 없습니다.
- **원인**: VitePress 빌드는 타입 검사를 하지 않습니다(5절). `'locale'` 같은 오타도 통과합니다.
- **해결**: VS Code에서 `config.mts`를 열어 빨간 줄이 없는지 보거나, `npx tsc --noEmit`을 빌드 전에 실행합니다.

## 직접 해 보기

### 과제 1 ⭐ 자동 완성 체험

VS Code로 실습용 `config.mts`를 열고 `themeConfig: {` 바로 아래 빈 줄에서 `Ctrl+Space`를 누르세요. 목록에서 `darkModeSwitchLabel`을 찾아 마우스를 올리면 무엇이 보이나요?

::: details 힌트
속성 이름과 함께 그 속성의 타입(문자열)과 설명이 작은 창으로 보입니다. 이 정보가 VitePress의 타입 정의 파일에서 옵니다. `defineConfig`를 지우고 `export default { ... }`만 남기면 같은 목록이 뜨지 않는 것도 비교해 보세요.
:::

### 과제 2 ⭐⭐ 실수 세 개 동시에

`config.mts`에 4-2(`'locale'`), 4-3(`outlin`) 실수를 **동시에** 넣고 `npx tsc -p .`를 실행하세요. 오류가 두 개 나오나요?

::: details 정답 보기
작성 시점 실습에서는 `'locale'` 오류만 나오고 `outlin` 오류는 나오지 않았습니다. 두 실수가 같은 `themeConfig` 객체 안에 있으면, TypeScript가 먼저 찾은 오류로 그 객체의 검사를 멈춰서 다른 초과 속성 오류가 가려질 수 있습니다. **오류를 하나 고치면 새 오류가 나타날 수 있으니, 오류가 0개가 될 때까지 다시 검사한다**는 것이 교훈입니다.
:::

### 과제 3 ⭐⭐ 내 데이터 규칙 만들기

`curriculum.mts`의 `Lesson` 인터페이스에 `minutes`가 0 이상이어야 한다는 규칙을 타입으로 표현할 수 있을까요? 시도해 보고, 안 되면 어떻게 검사할지 생각해 보세요.

::: details 힌트
TypeScript 타입은 "숫자다"까지는 말할 수 있지만 "0 이상의 숫자다"는 일반적으로 표현하지 못합니다. 이런 규칙은 실행 중 검사(예: 빌드 전에 도는 작은 Node.js 스크립트가 모든 레슨의 `minutes`를 확인)로 보완합니다. ts-wiki의 `scripts/fix-frontmatter.mjs`가 이런 보조 스크립트의 예입니다.
:::

### 과제 4 ⭐⭐⭐ CI에 타입 검사 넣기 설계

ts-wiki의 `.github/workflows/deploy.yml`에 타입 검사를 넣는다면 어느 단계 사이에 넣어야 할까요? 필요한 파일(`tsconfig.json`, `@types/node` 등)도 함께 적어 보세요(ts-wiki 원본은 고치지 않습니다).

::: details 힌트
`npm ci`(의존성 설치) 다음, `npm run build` 앞이 자연스럽습니다. 설치가 끝나야 `tsc`와 VitePress 타입이 있고, 빌드 전에 실패해야 잘못된 사이트가 배포되지 않습니다. 필요한 것은 `tsconfig.json`(4-1 참고), `@types/node`(또는 선언 파일), `.vue` 선언 파일, 그리고 `package.json`에 `"typecheck": "tsc -p docs/.vitepress"` 같은 스크립트입니다. GitHub Actions 자체는 [GitHub Actions와 Pages 배포 액션](../part3-libraries/07-github-actions)에서 배웁니다.
:::

## 확인 퀴즈

1. `config.mts`의 `m`과 `ts`는 각각 무엇을 뜻하나요?
2. `defineConfig`는 실행할 때 무슨 일을 하고, 왜 쓰나요?
3. `satisfies Theme`를 지웠을 때 `enhanceApp({ app })`에서 오류가 나는 이유는?
4. `provider: 'locale'` 오타가 `vitepress build`에서 걸리지 않는 이유는?
5. ts-wiki가 Python 기반 생성기 대신 Node.js 기반 생성기를 고른 이유를 "한 사람이 관리" 요구사항과 연결해 설명하세요.

::: details 정답 보기
1. `m`은 ES 모듈(`import`/`export`) 파일, `ts`는 TypeScript 파일이라는 뜻입니다.
2. 받은 객체를 그대로 돌려줄 뿐입니다. 대신 TypeScript에게 "VitePress 설정"이라는 타입을 알려 주어 자동 완성과 오류 검사를 켭니다.
3. `enhanceApp`이 어떤 매개변수를 받는지 알 수 없어 `app`이 암묵적 `any`가 되고, strict 모드가 이를 오류(TS7031)로 막기 때문입니다.
4. VitePress(Vite·esbuild)는 설정 파일의 타입 표시를 지우고 실행만 할 뿐 타입 검사를 하지 않기 때문입니다.
5. 독자·작성자가 이미 Node.js를 설치하므로, 위키·빌드·Docker 이미지까지 런타임 하나로 정리됩니다. Python 환경을 하나 더 관리할 필요가 없습니다.
:::

## 정리

- 생성기의 언어 생태계는 "이미 가진 런타임 위에서 끝나느냐"로 판단합니다. ts-wiki는 Node.js 하나로 통일했습니다.
- `.mts`는 TypeScript + ES 모듈 파일입니다. `defineConfig`, `DefaultTheme.SidebarItem`, `satisfies Theme`가 자동 완성과 검사를 켭니다.
- 실습에서 타입은 검색 공급자 오타, 설정 이름 오타, 잘못된 값 종류, 커리큘럼 규칙 위반, 매개변수 오타를 잡았습니다.
- 반대로 `map` 안에서 만든 객체의 속성 오타는 못 잡았습니다. 타입은 안전망이지 완벽한 보증이 아닙니다.
- VitePress 빌드는 타입 검사를 하지 않습니다. 에디터나 `tsc --noEmit`으로 따로 확인해야 합니다.
- 컴포넌트는 VitePress와 같은 Vue SFC로, 스크립트는 TypeScript로 써서 props가 사용 설명서 역할을 합니다.

## 다음 단계

[2-5. 왜 GitHub Pages와 Docker(nginx)인가](./05-why-hosting)에서 다 만든 위키를 어디에 띄울지, 그리고 왜 인터넷 공개와 사내 서버를 둘 다 준비했는지 비교합니다.
