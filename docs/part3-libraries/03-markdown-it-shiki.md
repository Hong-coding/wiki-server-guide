---
title: 마크다운 확장과 코드 하이라이트 (markdown-it · Shiki)
---

# 마크다운 확장과 코드 하이라이트 (markdown-it · Shiki)

<LessonMeta level="초급" :minutes="30" prev="Vite의 개발 서버·번들과 Vue의 SSR·하이드레이션, SFC 기본 문법을 익혔습니다." />

## 이번에 배울 것

- 마크다운 파일이 HTML이 되기까지 **markdown-it → Shiki → Vue** 순서로 거치는 과정을 설명할 수 있다.
- VitePress가 일반 마크다운에 더해 주는 확장 문법(제목 앵커, 사용자 지정 id, 이모지, 링크 변환, 컨테이너)을 쓸 수 있다.
- 코드 블록에 언어 지정, 줄 번호(`markdown.lineNumbers`), 줄 강조(`{1,3-4}`, `// [!code ...]`)를 붙일 수 있다.
- 펜스 코드 블록이 왜 이중 중괄호에 안전한지 변환 결과로 확인할 수 있다.

## 먼저 알아 둘 것

- [왜 Markdown으로 쓰나](../part2-choices/03-why-markdown)
- [Vite와 Vue: VitePress 밑에서 일하는 것들](./02-vite-vue) — 마크다운이 Vue 템플릿이 된다는 것

## 비유로 이해하기

마크다운을 HTML로 바꾸는 일은 **손글씨 원고를 인쇄소에 넘기는 일**과 비슷합니다.

- **markdown-it**은 **조판공**입니다. `#`은 큰 제목, `**`는 굵은 글씨, 빈 줄은 문단 나눔이라는 규칙대로 원고를 활자(HTML 태그)로 짭니다.
- **Shiki**는 **코드 전담 색칠 담당자**입니다. 조판공이 "여기는 코드"라고 표시한 부분만 넘겨받아, 키워드는 빨강, 숫자는 파랑처럼 VS Code와 똑같은 색으로 칠합니다.
- VitePress는 조판공에게 **추가 규칙집**(플러그인)을 쥐여 줍니다. `::: tip`은 초록 박스, 제목 옆에는 `#` 링크 같은 규칙입니다.

## 이게 뭔가

### markdown-it

**markdown-it**은 자바스크립트로 만든 **마크다운 → HTML 변환기**입니다. 표준 마크다운 규격(CommonMark)을 따르고, **플러그인**으로 문법을 늘릴 수 있는 것이 특징입니다. VitePress는 markdown-it에 여러 플러그인을 끼워 쓰며, 작성 시점 VitePress 1.6.3은 markdown-it을 자기 배포 파일 안에 묶어 두었습니다([3-2](./02-vite-vue)에서 `npm ls markdown-it`이 비어 있던 이유).

### Shiki

**Shiki**(일본어로 "색채")는 **코드 하이라이터**입니다. VS Code가 쓰는 것과 같은 문법 정의(TextMate 문법)와 색 테마를 써서, 에디터에서 보던 색 그대로 코드를 칠해 줍니다. 작성 시점 VitePress 1.6.3이 쓰는 버전은 shiki 2.5.0입니다.

Shiki의 특징은 **빌드할 때 색을 미리 칠해 둔다**는 점입니다. 브라우저에서 자바스크립트로 색을 칠하는 방식(예: 브라우저용 하이라이트 라이브러리)과 달리, 결과 HTML에 색이 이미 들어 있어 페이지가 열리자마자 색이 보이고 브라우저가 할 일이 없습니다.

## 왜 필요한가

- ts-wiki의 마크다운에는 `ts` 코드 블록만 2,152개, `text` 469개, `json` 95개가 있습니다(작성 시점에 `docs` 폴더를 검색해 센 값). 색이 없으면 코드 공부 위키로서 읽기가 매우 힘듭니다.
- 레슨에서 "3번 줄을 보세요"라고 말하려면 **줄 번호**가 필요합니다.
- 일반 마크다운에는 경고 박스, 접기 블록, 제목 링크 같은 문서용 기능이 없습니다. markdown-it 플러그인이 이것들을 채워 줍니다.

## 설치

따로 설치하지 않습니다. VitePress에 들어 있습니다. 대신 **VitePress가 쓰는 변환기를 직접 불러 써 볼 수** 있습니다. VitePress는 `createMarkdownRenderer`라는 함수를 내보냅니다. 연습 프로젝트(3-1에서 만든 `mini`) 폴더에 다음 파일을 만듭니다.

```js
// md-test.mjs — VitePress가 쓰는 것과 같은 마크다운 변환기로 입력 파일을 HTML로 바꿉니다.
import { createMarkdownRenderer } from 'vitepress'
import { readFileSync } from 'node:fs'

const md = await createMarkdownRenderer(process.cwd(), { lineNumbers: true })
console.log(md.render(readFileSync(process.argv[2], 'utf8')))
```

```bash
node md-test.mjs sample.md
```

**확인 방법**: 터미널에 HTML이 출력되면 성공입니다. 아래 예제의 출력은 모두 이 스크립트로 실제로 변환한 결과입니다(긴 `style` 속성은 읽기 쉽게 줄였습니다).

## 핵심 사용법 1 — 마크다운이 HTML이 되는 과정

```text
recipe.md
  │ ① frontmatter 떼어 내기 (title 등은 따로 보관)
  ▼
마크다운 본문
  │ ② markdown-it: 문법을 토큰으로 쪼개고 HTML로 조립
  │    + VitePress 플러그인: 제목 앵커, ::: 컨테이너, 링크 변환, 이모지 ...
  │    + 코드 블록을 만나면 ③ Shiki에게 넘겨 색칠한 HTML을 받음
  ▼
HTML 조각
  │ ④ Vue 템플릿으로 컴파일 (그래서 컴포넌트 태그·이중 중괄호가 해석됨)
  ▼
페이지 컴포넌트 → SSR → recipe.html
```

작은 예로 보겠습니다.

```md
## 메뉴 표 {#menu-table}

| 메뉴 | 가격 |
|---|---:|
| 아메리카노 | 4,000 |

:tada: 오픈 기념 [공지](./notice.md)
```

```html
<h2 id="menu-table" tabindex="-1">메뉴 표 <a class="header-anchor" href="#menu-table" ...>&ZeroWidthSpace;</a></h2>
<table tabindex="0">
<thead>
<tr>
<th>메뉴</th>
<th style="…">가격</th>
</tr>
</thead>
...
</table>
<p>🎉 오픈 기념 <a href="./notice.html">공지</a></p>
```

VitePress가 더해 준 것을 하나씩 짚으면 이렇습니다.

| 원래 마크다운 | 결과 | 해 준 일 |
|---|---|---|
| `## 메뉴 표 {#menu-table}` | `id="menu-table"` | 제목에 id를 붙입니다. `{#...}`를 안 쓰면 제목 글자 자체(`id="아메리카노"`)가 id가 됩니다 |
| (제목) | `<a class="header-anchor" href="#...">` | 제목 옆 `#` 링크. 눌러서 그 위치 주소를 복사할 수 있습니다 |
| `\|---:\|` | `<th style="…">` | 표 정렬(`:`가 오른쪽이면 오른쪽 정렬) |
| `:tada:` | 🎉 | 이모지 단축어 |
| `[공지](./notice.md)` | `href="./notice.html"` | `.md` 링크를 실제 주소로 바꿉니다. 사이트 설정의 `cleanUrls`를 켜면 `.html`도 떼어 냅니다 |

오른쪽 "이 페이지 목차"(`outline`)와 로컬 검색이 섹션을 나누는 기준이 바로 이 **제목 id**입니다. 검색 결과를 누르면 `/guide/recipe#아메리카노`처럼 그 제목으로 바로 갑니다.

## 핵심 사용법 2 — 코드 블록과 Shiki

### 언어 지정

백틱 세 개 뒤에 **언어 이름**을 씁니다. 언어를 써야 Shiki가 어떤 문법으로 칠할지 압니다.

````md
```ts
const a = 1
```
````

변환 결과입니다(이번에는 `style`을 줄이지 않았습니다).

```html
<div class="language-ts vp-adaptive-theme line-numbers-mode">
<button title="Copy Code" class="copy"></button><span class="lang">ts</span>
<pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0" v-pre="">
<code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> a</span>...</span></code></pre>
<div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div>
```

여기서 읽어 낼 것이 많습니다.

- **`shiki-themes github-light github-dark`**: 기본 색 테마는 밝은 모드 `github-light`, 어두운 모드 `github-dark`입니다. 글자마다 `--shiki-light`, `--shiki-dark` 두 색이 모두 들어 있고, 다크 모드 버튼을 누르면 CSS가 어느 쪽을 쓸지만 바꿉니다. 그래서 다크 모드 전환이 즉시 됩니다.
- **`<button class="copy">`**: 코드 블록 오른쪽 위 복사 버튼
- **`<span class="lang">ts</span>`**: 오른쪽 위에 흐리게 보이는 언어 이름
- **`v-pre=""`**: [3-2](./02-vite-vue)에서 말한 그 속성입니다. 이 `<pre>` 안은 Vue가 해석하지 않습니다. **이중 중괄호가 코드 블록 안에서는 안전한 이유**가 바로 이것입니다.
- **`line-numbers-wrapper`**: 줄 번호(다음 절)

반면 인라인 코드는 이렇게만 바뀝니다.

```html
<p>인라인 <code>code</code> 입니다.</p>
```

`v-pre`가 없습니다. 그래서 인라인 코드 안의 이중 중괄호는 Vue가 계산하려 들고, 빌드가 깨집니다.

::: warning 모르는 언어 이름
언어 이름을 잘못 쓰면(예: `nosuchlang`) 빌드는 계속되지만 터미널에 다음 경고가 찍히고 색 없이 출력됩니다.

```text
The language 'nosuchlang' is not loaded, falling back to 'txt' for syntax highlighting.
```

`typescript` 대신 `ts`, `shell` 대신 `bash`처럼 짧은 이름도 대부분 지원합니다. 이 가이드의 [문서 작성 규칙](../guide/writing-guide)은 `bash`, `powershell`, `ts`, `js`, `json`, `yaml`, `nginx`, `dockerfile`, `vue`, `text`를 씁니다.
:::

### 줄 번호 — markdown.lineNumbers

`config.mts`에서 켭니다.

```ts
export default defineConfig({
  markdown: {
    lineNumbers: true,
  },
})
```

켜면 모든 코드 블록 왼쪽에 줄 번호가 붙습니다. 블록마다 따로 조절할 수도 있습니다.

| 쓰는 법 | 효과 |
|---|---|
| 언어 뒤에 `:line-numbers` | 이 블록만 줄 번호 켜기 (전체 설정이 꺼져 있을 때) |
| 언어 뒤에 `:no-line-numbers` | 이 블록만 줄 번호 끄기 |
| 언어 뒤에 `:line-numbers=10` | 10번부터 시작 |

````md
```ts:line-numbers=10
const start = 10
```
````

실제 변환 결과에서 줄 번호가 `<span class="line-number">10</span>`으로 시작했습니다. 긴 파일의 일부를 인용할 때 원래 파일의 줄 번호와 맞출 수 있어 유용합니다.

### 줄 강조 — 중괄호 범위

언어 이름 바로 뒤에 중괄호로 줄 번호를 적으면 그 줄의 배경이 강조됩니다. 범위는 `-`, 여러 개는 `,`로 씁니다.

````md
```ts{1,3-4}
const a = 1
const b = 2
const c = 3
const d = 4
```
````

결과에서 1·3·4번 줄에만 `class="line highlighted"`가 붙었습니다.

```html
<span class="line highlighted">const a = 1</span>
<span class="line">const b = 2</span>
<span class="line highlighted">const c = 3</span>
<span class="line highlighted">const d = 4</span>
```

줄 번호 옵션과 함께 쓸 때는 `ts{1,3}:line-numbers`처럼 강조를 먼저 씁니다.

### 줄 강조 — 주석 표시

줄 번호를 세는 대신, 강조할 줄 끝에 **특별한 주석**을 달 수도 있습니다. 이 주석은 결과에서 지워집니다.

````md
```js
const x = 1 // [!code focus]
const y = 2 // [!code warning]
const z = 3 // [!code error]
console.log('hi') // [!code highlight]
const old = 1 // [!code --]
const now = 2 // [!code ++]
```
````

| 주석 | 붙는 class | 보이는 모습 |
|---|---|---|
| `[!code highlight]` | `highlighted` | 배경 강조 |
| `[!code focus]` | `has-focus` | 이 줄만 선명하고 나머지는 흐림 |
| `[!code warning]` | `highlighted warning` | 노란 배경 |
| `[!code error]` | `highlighted error` | 빨간 배경 |
| `[!code --]` | `diff remove` | 지운 줄(빨강, `-` 표시) |
| `[!code ++]` | `diff add` | 추가한 줄(초록, `+` 표시) |

모두 실제 변환 결과에서 위 class가 붙는 것을 확인했습니다. "고치기 전과 후"를 보여 줄 때 `--`/`++`가 특히 쓸모 있습니다.

::: tip 주석 문법은 언어에 맞춰
`//`는 JS·TS의 주석입니다. `bash`나 `yaml` 블록에서는 `# [!code highlight]`처럼 그 언어의 주석 기호를 씁니다.
:::

### 코드 그룹

[3-1](./01-vitepress)에서 본 `::: code-group`은 코드 블록 여러 개를 탭으로 묶습니다. 탭 이름은 언어 뒤 대괄호에 씁니다.

````md
::: code-group

```powershell [Windows]
mkdir mini
```

```bash [macOS / Linux]
mkdir mini && cd mini
```

:::
````

### 고급 설정 (공식 문서 기준)

`config.mts`의 `markdown` 키에서 더 많은 것을 바꿀 수 있습니다. 이 레슨에서 직접 실행해 보지 않은 옵션이므로 VitePress 공식 문서의 Markdown 설정 항목을 함께 보세요.

```ts
export default defineConfig({
  markdown: {
    lineNumbers: true,
    // Shiki 색 테마 바꾸기
    theme: { light: 'github-light', dark: 'github-dark' },
    // markdown-it 플러그인 추가
    config: (md) => {
      // md.use(어떤플러그인)
    },
  },
})
```

## ts-wiki에서는

**`docs/.vitepress/config.mts` 28~30줄**

```ts
  markdown: {
    lineNumbers: true,
  },
```

ts-wiki는 코드를 배우는 위키라 **모든 코드 블록에 줄 번호**를 켰습니다. 레슨 본문에서 "2번 줄의 `const`는..."처럼 설명하기 위해서입니다. 테마는 기본값(`github-light`/`github-dark`)을 그대로 씁니다.

**ts-wiki 마크다운 안의 코드 블록 언어** — 작성 시점에 `docs` 폴더 전체에서 코드 블록 시작 줄을 세어 본 결과입니다.

```text
   2152 ```ts
    469 ```text
     95 ```json
     90 ```tsx
     88 ```bash
     70 ```js
     50 ```powershell
     12 ```vue
      3 ```html
      2 ```md
      1 ```css
```

- 언어를 빠뜨린 블록 없이 모두 언어가 붙어 있습니다. ts-wiki의 `docs/guide/writing-guide.md`가 "코드 블록은 언어를 지정합니다"라고 정해 두었기 때문입니다.
- 실행 결과처럼 색칠할 필요가 없는 것은 `text`로 씁니다. 색은 없지만 줄 번호와 복사 버튼은 붙습니다.
- 작성 시점 ts-wiki에는 `{1,3}` 같은 줄 강조나 `[!code ...]` 주석은 쓰이지 않았습니다. 이 가이드처럼 "바뀐 줄"을 보여 줄 일이 많은 문서라면 써 볼 만합니다.

**이중 중괄호 규칙** — ts-wiki와 이 가이드의 작성 규칙에 "이중 중괄호는 코드 블록 안에만"이 있는 이유를 이제 HTML 수준에서 설명할 수 있습니다. 펜스 코드 블록은 `<pre v-pre>`가 되어 Vue가 건드리지 않고, 인라인 코드는 `<code>`일 뿐이라 Vue가 해석합니다. 특히 [3-7](./07-github-actions)의 GitHub Actions 파일은 이 표현식을 많이 쓰므로, 반드시 코드 블록으로 인용합니다.

## 자주 하는 실수

**1. 코드 블록에 색이 없음**

- 증상: 코드가 회색 한 가지 색으로만 보임
- 원인: 언어를 안 썼거나(`text`로 처리), 이름이 틀렸습니다. 터미널에 `The language '...' is not loaded, falling back to 'txt'` 경고가 있습니다.
- 해결: 언어 이름을 고칩니다(`ts`, `bash`, `yaml` ...).

**2. 줄 강조가 안 먹음**

- 증상: `ts {1,3}`이라고 썼는데 강조가 없음
- 원인: 언어와 중괄호 사이에 공백이 있거나, 주석 표시를 그 언어의 주석 기호로 쓰지 않았습니다.
- 해결: `ts{1,3}`처럼 붙여 씁니다. 주석 방식은 `// [!code highlight]`(JS/TS), `# [!code highlight]`(bash/yaml)처럼 씁니다.

**3. 인라인 코드의 이중 중괄호로 빌드 실패**

- 증상: `build error: Cannot read properties of undefined (reading '...')`
- 원인: 인라인 코드는 `v-pre`가 없어 Vue가 해석합니다.
- 해결: 펜스 코드 블록으로 옮깁니다.

**4. 코드 블록 안에 백틱 세 개를 보여 주고 싶은데 블록이 일찍 끝남**

- 증상: 마크다운 예제를 보여 주려 했더니 블록이 중간에 닫히고 뒷부분이 본문으로 나옴
- 원인: 안쪽의 백틱 세 개가 바깥 블록을 닫았습니다.
- 해결: 바깥 블록을 **백틱 네 개**로 엽니다. 이 레슨의 예제들이 그렇게 되어 있습니다.

**5. 제목 링크(앵커)가 바뀌어 예전 링크가 안 맞음**

- 증상: 다른 페이지에서 `./recipe#아메리카노`로 걸어 둔 링크가 제목을 고친 뒤 맨 위로만 감
- 원인: 제목 글자가 곧 id라서, 제목을 바꾸면 id도 바뀝니다.
- 해결: 자주 링크되는 제목에는 `{#americano}`처럼 고정 id를 붙여 둡니다.

## 직접 해 보기

**과제 1 ⭐** 연습 프로젝트의 `recipe.md`에 `json` 코드 블록을 넣고, 두 번째 줄만 강조되게 해 보세요.

::: details 힌트·정답 보기
````md
```json{2}
{
  "name": "아메리카노",
  "price": 4000
}
```
````
:::

**과제 2 ⭐** `config.mts`의 `lineNumbers`를 끄고, 한 블록에만 `:line-numbers`를 붙여 줄 번호가 그 블록에만 생기는지 확인하세요.

::: details 힌트·정답 보기
`markdown: { lineNumbers: false }`로 바꾸고, 블록을 `` ```ts:line-numbers ``로 엽니다. 빌드한 HTML에서 그 블록에만 `line-numbers-mode` class가 붙어 있으면 성공입니다.
:::

**과제 3 ⭐⭐** "고치기 전/후"를 `[!code --]`, `[!code ++]`로 보여 주는 코드 블록을 만들어 보세요. 예: 가격을 4,000원에서 4,500원으로 올리는 코드.

::: details 힌트·정답 보기
````md
```ts
const price = 4000 // [!code --]
const price = 4500 // [!code ++]
```
````
결과에서 첫 줄은 `diff remove`, 둘째 줄은 `diff add` class가 붙습니다.
:::

**과제 4 ⭐⭐** `md-test.mjs`로 인라인 코드와 펜스 코드 블록을 변환해, 어느 쪽에 `v-pre`가 붙는지 직접 확인하세요.

::: details 힌트·정답 보기
펜스 코드 블록의 `<pre>`에만 `v-pre=""`가 붙고, 인라인 코드는 `<code>...</code>`입니다.
:::

**과제 5 ⭐⭐⭐** 제목 `## 카페라떼`에 고정 id `latte`를 붙이고, 다른 페이지에서 그 위치로 가는 링크를 걸어 보세요. 제목 글자를 "카페 라떼"로 바꿔도 링크가 유지되는지 확인하세요.

::: details 힌트·정답 보기
`## 카페라떼 {#latte}`로 쓰고, 다른 페이지에서 `[라떼](./recipe#latte)`로 링크합니다. 제목 글자를 바꿔도 id는 `latte` 그대로라 링크가 유지됩니다.
:::

## 확인 퀴즈

**1.** markdown-it과 Shiki는 각각 무슨 일을 하나요?

::: details 정답 보기
markdown-it은 마크다운을 HTML로 바꾸고, Shiki는 그중 코드 블록에 문법별 색을 칠합니다.
:::

**2.** Shiki가 브라우저용 하이라이터와 다른 점은?

::: details 정답 보기
빌드할 때 색을 미리 칠해 HTML에 넣어 둡니다. 브라우저에서 자바스크립트를 실행하지 않아도 처음부터 색이 보입니다.
:::

**3.** 다크 모드로 바꿀 때 코드 색이 바로 바뀌는 이유는?

::: details 정답 보기
각 글자에 `--shiki-light`와 `--shiki-dark` 두 색이 모두 들어 있어, CSS가 어느 쪽 변수를 쓸지만 바꾸면 되기 때문입니다.
:::

**4.** `` ```ts{2,4-5} ``는 어느 줄을 강조하나요?

::: details 정답 보기
2번, 4번, 5번 줄입니다.
:::

**5.** 펜스 코드 블록 안의 이중 중괄호가 안전한 HTML 수준의 이유는?

::: details 정답 보기
코드 블록이 `v-pre` 속성을 가진 `<pre>` 태그로 바뀌어, Vue가 그 안을 템플릿으로 해석하지 않기 때문입니다.
:::

## 정리

- 마크다운 → (markdown-it + VitePress 플러그인) → HTML → (코드 블록은 Shiki가 색칠) → Vue 템플릿 → SSR → `.html` 순서입니다.
- VitePress 확장: 제목 앵커와 `{#id}`, 이모지, `.md` 링크 변환, `:::` 컨테이너, 코드 그룹.
- 코드 블록은 언어를 지정해야 색이 칠해집니다. 틀린 이름은 `txt`로 처리되고 경고가 찍힙니다.
- 줄 번호는 `markdown.lineNumbers`(전체)와 `:line-numbers` / `:no-line-numbers` / `:line-numbers=10`(블록별).
- 줄 강조는 `{1,3-4}` 또는 `// [!code highlight|focus|warning|error|--|++]` 주석으로 합니다.
- 펜스 코드 블록은 `<pre v-pre>`가 되므로 이중 중괄호에 안전하고, 인라인 코드는 안전하지 않습니다.

## 다음 단계

[3-4. 로컬 검색 (MiniSearch)](./04-local-search)에서 빌드할 때 만들어지는 검색 인덱스가 무엇이고, 한국어 검색이 어디까지 되는지 실험합니다.
