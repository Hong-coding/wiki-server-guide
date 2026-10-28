---
title: 로컬 검색 (MiniSearch)
---

# 로컬 검색 (MiniSearch)

<LessonMeta level="초급" :minutes="20" prev="markdown-it이 마크다운을 HTML로, Shiki가 코드 블록을 색칠하는 과정을 봤습니다." />

## 이번에 배울 것

- VitePress 로컬 검색이 **MiniSearch** 기반이며, 검색 서버 없이 브라우저 안에서 동작한다는 것을 설명할 수 있다.
- 검색 인덱스가 **빌드할 때** 만들어진다는 것을 결과 파일로 확인할 수 있다.
- ts-wiki가 `chunkSizeWarningLimit: 4000`을 넣은 이유를 실제 경고 메시지로 설명할 수 있다.
- 한국어 검색이 어디까지 되고 어디서 안 되는지 말하고, 번역 옵션과 대안(Algolia DocSearch)을 고를 수 있다.

## 먼저 알아 둘 것

- [VitePress: 설정 · 라우팅 · 테마](./01-vitepress) — `themeConfig.search`
- [마크다운 확장과 코드 하이라이트](./03-markdown-it-shiki) — 제목 id가 검색 결과의 링크가 된다는 것

## 비유로 이해하기

로컬 검색은 **책 뒤의 찾아보기(색인)** 입니다.

- 출판사(빌드)는 책을 찍을 때 "타입 → 12쪽, 45쪽", "인터페이스 → 30쪽"처럼 **단어와 위치의 목록**을 미리 만들어 책 뒤에 붙입니다.
- 독자(브라우저)는 도서관(서버)에 전화할 필요 없이 책 뒤를 펼쳐 찾습니다.
- 대신 책이 두꺼워질수록 찾아보기도 두꺼워집니다. ts-wiki의 찾아보기는 약 3.2MB입니다.

## 이게 뭔가

**MiniSearch**는 자바스크립트로 만든 작은 **전문 검색**(full-text search, 문서 본문 전체에서 단어를 찾는 검색) 라이브러리입니다. 서버 없이 브라우저 메모리 안에서 동작합니다. 작성 시점 VitePress 1.6.3이 쓰는 버전은 minisearch 7.2.0입니다.

VitePress 기본 테마는 `search: { provider: 'local' }` 한 줄이면 MiniSearch로 검색 창을 붙여 줍니다. 오른쪽 위의 검색 버튼(또는 `Ctrl+K`, macOS는 `⌘K`)을 누르면 열립니다.

동작은 두 단계입니다.

```text
[빌드 때, Node.js]
모든 .md 페이지
  │ 마크다운 → HTML 렌더
  │ 제목(h1~h6) 기준으로 섹션 나누기
  ▼
MiniSearch 인덱스 { 단어 → 어느 섹션에 몇 번 } 
  │ JSON으로 직렬화
  ▼
dist/assets/chunks/@localSearchIndexroot.<해시>.js

[브라우저에서]
검색 창을 처음 열 때 인덱스 파일을 내려받음
  │ MiniSearch.loadJSON(...)
  ▼
입력할 때마다 메모리 안에서 검색 → 결과 목록 (페이지#제목id)
```

## 왜 필요한가

- 정적 사이트(HTML 파일만 있는 사이트)에는 검색 요청을 처리할 **서버 프로그램이 없습니다.** nginx나 GitHub Pages는 파일을 내려 줄 뿐입니다. 그래서 검색에 필요한 자료를 미리 파일로 만들어 두고 브라우저가 직접 찾게 합니다.
- 외부 검색 서비스를 쓰지 않으므로 **가입·키 발급·크롤링 승인**이 필요 없고, 사내망처럼 인터넷이 막힌 곳에서도 동작합니다.

## 설치

따로 설치하지 않습니다. `config.mts`에서 켜기만 합니다.

```ts
export default defineConfig({
  themeConfig: {
    search: { provider: 'local' },
  },
})
```

**확인 방법**: `npm run build` 후 `dist/assets/chunks/` 폴더에 `@localSearchIndexroot`로 시작하는 파일이 생기면 성공입니다. 3-1의 연습 프로젝트(문서 3개)에서 실제로 생긴 파일입니다.

```text
-rw-r--r--  1562  @localSearchIndexroot.BrYSqj51.js
-rw-r--r-- 63900  VPLocalSearchBox.WkcZn1cM.js
```

- `@localSearchIndexroot...js` — 검색 인덱스(데이터). `root`는 기본 언어(locale)라는 뜻입니다.
- `VPLocalSearchBox...js` — 검색 창 화면(Vue 컴포넌트 + MiniSearch 코드)

인덱스 파일의 앞부분을 열어 보면 이렇게 생겼습니다.

```text
const e='{"documentCount":4,"nextId":4,"documentIds":{"0":"/guide/#시작하기","1":"/guide/recipe#레시피","2":"/guide/recipe#아메리카노","3":"/guide/recipe#카페라떼"},
"fieldIds":{"title":0,"titles":1,"text":2}, ... "storedFields":{"2":{"title":"아메리카노","titles":["레시피"]}, ...
```

- 페이지가 3개인데 문서(`documentCount`)는 4개입니다. **페이지가 아니라 제목 단위 섹션**으로 나눠 넣기 때문입니다. `recipe.md`는 `# 레시피`, `## 아메리카노`, `## 카페라떼` 세 섹션이 되었습니다.
- 각 문서의 id는 `주소#제목id`입니다. 검색 결과를 누르면 그 제목 위치로 바로 갑니다.
- 필드는 `title`(섹션 제목), `titles`(상위 제목들), `text`(본문) 세 가지입니다.

## 핵심 사용법

### 검색이 어떻게 점수를 매기나

VitePress 1.6.3의 검색 창 코드(`VPLocalSearchBox.vue`)에 적힌 기본 검색 옵션입니다.

```ts
searchOptions: {
  fuzzy: 0.2,
  prefix: true,
  boost: { title: 4, text: 2, titles: 1 },
}
```

| 옵션 | 뜻 |
|---|---|
| `prefix: true` | **앞부분 일치** 허용. "타입"으로 "타입을", "타입스크립트에서"도 찾습니다 |
| `fuzzy: 0.2` | **오타 허용**. 단어 길이의 20%까지 글자가 달라도 찾습니다 |
| `boost` | 어디서 찾았느냐에 따른 가중치. 제목에서 찾으면 본문보다 2배, 상위 제목보다 4배 점수 |

### 한국어 검색 실험

같은 옵션으로 MiniSearch를 직접 돌려 보면 한국어에서 어떻게 동작하는지 알 수 있습니다. 연습 프로젝트 폴더(MiniSearch가 `node_modules`에 깔려 있음)에서 실행한 스크립트입니다.

```js
// ms-test.mjs
import MiniSearch from 'minisearch'

// VitePress 로컬 검색과 같은 설정으로 인덱스를 만듭니다.
const ms = new MiniSearch({ fields: ['title', 'text'], storeFields: ['title'] })
ms.addAll([
  { id: 1, title: '타입 별칭', text: '타입스크립트에서 타입을 이름으로 묶는 방법입니다.' },
  { id: 2, title: '인터페이스', text: '객체의 모양을 인터페이스로 정의합니다.' },
  { id: 3, title: '제네릭', text: '여러 타입에서 재사용하는 함수를 만듭니다.' },
])

const opts = { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2 } }
for (const q of ['타입', '타입스크립트', '스크립트', '인터페이스로', '정의', '모양']) {
  const r = ms.search(q, opts).map((x) => `${x.title}(${x.score.toFixed(1)})`)
  console.log(q.padEnd(8), '→', r.join(', ') || '(결과 없음)')
}
console.log(MiniSearch.getDefault('tokenize')('타입스크립트에서 타입을 묶는다'))
```

```bash
node ms-test.mjs
```

```text
타입       → 타입 별칭(7.1), 제네릭(0.9)
타입스크립트   → 타입 별칭(1.0)
스크립트     → (결과 없음)
인터페이스로   → 인터페이스(5.4)
정의       → 인터페이스(1.0)
모양       → 인터페이스(1.0)
[ '타입스크립트에서', '타입을', '묶는다' ]
```

마지막 줄이 핵심입니다. MiniSearch의 기본 **토크나이저**(tokenizer, 글을 검색 단위로 자르는 규칙)는 **띄어쓰기와 문장 부호**로만 자릅니다. 한국어는 단어 뒤에 조사·어미가 붙으므로 `타입스크립트에서`, `타입을`이 통째로 한 단위가 됩니다.

여기서 결과를 해석하면 이렇습니다.

| 검색어 | 결과 | 이유 |
|---|---|---|
| 타입 | 찾음 | `prefix`: "타입을", "타입스크립트에서"가 "타입"으로 **시작** |
| 타입스크립트 | 찾음 | `prefix`: "타입스크립트에서"가 이것으로 시작 |
| 스크립트 | **못 찾음** | 단어 **중간**에 있는 글자는 찾지 못함 |
| 인터페이스로 | 찾음 | `fuzzy`: "인터페이스"와 한 글자 차이라 오타로 보고 허용 |
| 정의, 모양 | 찾음 | "정의합니다", "모양을"의 앞부분 |

**정리하면**: 한국어는 **단어의 앞부분**으로 검색하면 대체로 찾아지지만, **합성어의 뒷부분**("스크립트", "체크리스트"의 "리스트")이나 띄어쓰기 없이 붙여 쓴 긴 말의 중간은 못 찾습니다. 형태소 분석(조사를 떼어 내는 언어 처리)을 하지 않기 때문입니다.

::: tip 위키 글을 쓸 때 할 수 있는 일
검색될 만한 핵심 용어는 **제목에** 넣고, 본문에서 한 번쯤은 띄어 써 둡니다(예: "타입 스크립트(TypeScript)"보다 "TypeScript"와 "타입"이 각각 등장하도록). 제목은 점수 가중치가 가장 높습니다.
:::

### 한국어 개선 아이디어: 두 글자씩 자르기

토크나이저를 바꾸면 중간 글자도 찾을 수 있습니다. 예를 들어 단어를 **두 글자씩 겹쳐 자르는**(bigram) 방식입니다. MiniSearch 단독으로 실험한 결과입니다.

```js
import MiniSearch from 'minisearch'

// 한글 단어를 두 글자씩 겹쳐 자르는 토크나이저: "타입스크립트" → 타입, 입스, 스크, 크립, 립트
const bigram = (text) =>
  text.split(/[\s\p{P}]+/u).filter(Boolean).flatMap((w) =>
    w.length < 2 ? [w] : Array.from({ length: w.length - 1 }, (_, i) => w.slice(i, i + 2)),
  )

const ms = new MiniSearch({ fields: ['title', 'text'], storeFields: ['title'], tokenize: bigram })
// ... 앞과 같은 문서 3개를 addAll
for (const q of ['스크립트', '재사용', '모양']) {
  const r = ms.search(q, { combineWith: 'AND' }).map((x) => x.title)
  console.log(q.padEnd(6), '→', r.join(', ') || '(결과 없음)')
}
```

```text
스크립트   → 타입 별칭
재사용    → 제네릭
모양     → 인터페이스
```

이번에는 "스크립트"도 찾았습니다. 대신 조각 수가 늘어나 **인덱스가 커지고**, 엉뚱한 결과가 섞일 수 있습니다. VitePress에서는 `search.options.miniSearch.options`의 `tokenize`로 토크나이저를 바꿀 수 있다고 타입 정의(`LocalSearchOptions`)에 나와 있지만, 이 레슨에서는 VitePress 사이트에 적용해 검증하지는 않았습니다. 적용한다면 작은 연습 프로젝트에서 빌드·검색 결과·인덱스 크기를 먼저 확인합니다.

### 번역 옵션 — 검색 창 글자를 한국어로

기본 검색 창의 글자는 영어(`Search`, `No results for`)입니다. `translations`로 바꿉니다.

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

- `buttonAriaLabel`은 화면에 보이지 않고 **화면 낭독기**(시각 장애인용 프로그램)가 읽는 이름입니다.
- `footer`는 검색 창 아래쪽의 키보드 안내(`↵ 선택`, `↑↓ 이동`, `esc 닫기`)입니다.

그 밖의 옵션(타입 정의 기준)은 다음과 같습니다.

| 옵션 | 뜻 |
|---|---|
| `detailedView` | 결과에 본문 미리보기를 보여 줄지. 기본 `'auto'`(사용자가 켜고 끌 수 있음) |
| `disableQueryPersistence` | 기본은 검색어를 브라우저 세션 저장소에 남겨, 창을 다시 열면 이전 검색어가 보입니다. `true`면 남기지 않음 |
| `miniSearch.searchOptions` | 위의 `fuzzy`, `prefix`, `boost`를 바꿈 |
| `miniSearch.options` | `tokenize`, `processTerm` 등 인덱스 생성 방식을 바꿈 |
| `locales` | 다국어 사이트에서 언어별로 다른 설정 |

특정 페이지를 검색에서 빼려면 그 페이지 frontmatter에 `search: false`를 씁니다.

### 개발 서버에서는

`npm run dev` 중에도 검색이 동작합니다. 파일을 저장하면 VitePress가 그 파일의 인덱스를 다시 만들어 브라우저에 HMR로 보냅니다(VitePress 소스의 `onIndexUpdated` 함수가 이 일을 합니다). 따라서 새로 쓴 글을 개발 서버에서 바로 검색해 볼 수 있습니다.

## ts-wiki에서는

**`docs/.vitepress/config.mts` 58~70줄** — 위의 번역 예제가 바로 ts-wiki의 설정입니다.

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

검색 동작 자체(`miniSearch` 옵션)는 건드리지 않고 기본값을 씁니다. 바꾼 것은 화면 글자뿐입니다.

**`docs/.vitepress/config.mts` 31~34줄** — 검색 때문에 생긴 설정입니다.

```ts
  // 로컬 검색 인덱스가 한 청크에 들어가 500kB를 넘으므로 경고 기준만 올립니다.
  vite: {
    build: { chunkSizeWarningLimit: 4000 },
  },
```

이유를 실제로 확인했습니다. ts-wiki의 `docs` 폴더를 연습용 폴더에 복사하고 이 줄만 `build: {}`로 바꿔 빌드했더니 다음 경고가 나왔습니다(빌드 시간 약 150초).

```text
- building client + server bundles...

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ building client + server bundles...
- rendering pages...
✓ rendering pages...
build complete in 149.97s.
```

그리고 ts-wiki의 실제 빌드 결과에서 인덱스 파일 크기는 다음과 같았습니다.

```text
3206788  @localSearchIndexroot.B13jIKjt.js
```

약 3.2MB(3,206,788바이트)입니다. Vite(Rollup)는 **압축 후 500kB가 넘는 파일**이 있으면 "페이지를 늦게 만들 수 있다"고 경고합니다. 그러나 이 파일은 다음 이유로 문제가 되지 않습니다.

- 검색 창을 **처음 열 때만** 내려받습니다. 페이지를 여는 데는 필요 없습니다.
- 내용이 검색 데이터 하나라 쪼갤 방법(경고가 제안하는 `manualChunks`)이 마땅치 않습니다.
- 문서가 늘면 더 커질 수 있어 여유 있게 4000(kB)으로 올렸습니다.

경고는 **오류가 아니라 안내**라서 빌드는 성공합니다. 하지만 매번 경고가 뜨면 진짜 문제가 생겼을 때 놓치기 쉽기 때문에, 이유를 주석으로 남기고 기준을 올린 것입니다.

::: info 경고 기준만 올렸다는 의미
`chunkSizeWarningLimit`은 **경고를 띄우는 기준**일 뿐, 파일 크기를 줄여 주지 않습니다. 3.2MB 인덱스는 그대로 배포되고, 사용자는 검색 창을 처음 열 때 이 파일을 내려받습니다. nginx에서 gzip 압축을 켜면 전송량은 줄일 수 있습니다([3-5](./05-nginx)의 과제 참고).
:::

## 대안: Algolia DocSearch

문서가 아주 많아지거나 검색 품질이 더 필요하면 **Algolia DocSearch**를 고려합니다. VitePress가 공식 지원하는 다른 검색 방식입니다(`npm ls`에도 `@docsearch/js`가 VitePress 의존성으로 들어 있습니다).

| | 로컬 검색 (MiniSearch) | Algolia DocSearch |
|---|---|---|
| 검색이 일어나는 곳 | 브라우저 안 | Algolia 서버 |
| 준비 | 설정 한 줄 | Algolia 가입·신청, 앱 ID·검색 키·인덱스 이름 발급 |
| 인덱스 생성 | `vitepress build` 때 | Algolia 크롤러가 공개 사이트를 수집 |
| 사내망(인터넷 차단) | 동작 | 동작하지 않음 |
| 공개되지 않은 사이트 | 동작 | 크롤러가 접근할 수 없어 곤란 |
| 큰 사이트 | 인덱스 파일이 커짐 | 서버가 처리하므로 부담 없음 |
| 비용 | 없음 | 오픈소스 문서용 무료 프로그램이 있으나 조건이 있음(작성 시점 기준, 공식 페이지에서 확인) |

설정 모양은 공식 문서 기준으로 다음과 같습니다(직접 실행하지 않은 예시입니다).

```ts
search: {
  provider: 'algolia',
  options: {
    appId: '<앱 ID>',
    apiKey: '<검색 전용 키>',
    indexName: '<인덱스 이름>',
  },
},
```

::: warning 키 관리
여기 들어가는 `apiKey`는 **검색 전용(공개용) 키**여야 합니다. 관리용 키(Admin API Key)를 설정 파일에 넣어 저장소에 올리면 누구나 인덱스를 지울 수 있게 됩니다.
:::

ts-wiki는 사내 서버(Docker)와 GitHub Pages 둘 다에서 똑같이 동작해야 하고, 외부 가입 없이 바로 쓰는 것이 목표였으므로 로컬 검색을 골랐습니다.

## 자주 하는 실수

**1. 빌드할 때마다 `Some chunks are larger than 500 kB` 경고**

- 증상: 위 실험의 경고 메시지
- 원인: 문서가 많아 검색 인덱스 파일이 500kB를 넘었습니다.
- 해결: 오류가 아니므로 빌드는 성공합니다. 원인이 검색 인덱스임을 확인했다면 ts-wiki처럼 `vite.build.chunkSizeWarningLimit`을 올리고 주석으로 이유를 남깁니다. 다른 파일이 커진 것이라면 그 원인부터 찾습니다.

**2. 분명히 있는 단어인데 검색이 안 됨**

- 증상: 본문에 "체크리스트"가 있는데 "리스트"로 검색하면 결과 없음
- 원인: 기본 토크나이저는 띄어쓰기 기준이라 단어 중간 글자는 찾지 못합니다.
- 해결: 단어 앞부분("체크")으로 검색합니다. 자주 찾는 용어는 제목에 넣거나 띄어 써 둡니다.

**3. 검색 결과를 눌렀더니 엉뚱한 위치로 감**

- 증상: 결과를 누르면 페이지 맨 위로만 감
- 원인: 제목을 고쳐 제목 id가 바뀌었는데 브라우저가 예전 인덱스를 캐시하고 있거나, 다시 빌드하지 않았습니다.
- 해결: 다시 빌드·배포하고 강력 새로 고침(`Ctrl+Shift+R`)합니다. 인덱스 파일 이름에 해시가 붙어 있어 새로 빌드하면 새 파일을 받습니다.

**4. 검색에서 빼고 싶은 페이지가 나옴**

- 증상: 작성 규칙 같은 내부용 페이지가 검색 결과에 섞임
- 원인: 기본적으로 모든 페이지가 인덱스에 들어갑니다.
- 해결: 그 페이지 frontmatter에 `search: false`를 씁니다.

## 직접 해 보기

**과제 1 ⭐** 연습 프로젝트를 빌드하고 `@localSearchIndexroot...js`를 열어 `documentCount`와 `documentIds`를 확인하세요. 페이지 수와 왜 다른가요?

::: details 힌트·정답 보기
인덱스는 페이지가 아니라 제목 단위 섹션으로 나뉘므로, `##` 제목이 많은 페이지는 여러 문서가 됩니다.
:::

**과제 2 ⭐** 검색 창 버튼 글자를 "위키 검색"으로 바꿔 보세요.

::: details 힌트·정답 보기
`search.options.translations.button.buttonText`를 `'위키 검색'`으로 바꿉니다.
:::

**과제 3 ⭐⭐** `ms-test.mjs`에 문서를 하나 추가하고("진도 체크리스트로 공부 기록을 남깁니다"), "체크", "리스트", "체크리스트" 세 검색어의 결과를 비교하세요.

::: details 힌트·정답 보기
"체크", "체크리스트"는 앞부분 일치로 찾지만, "리스트"는 단어 중간이라 찾지 못합니다. fuzzy 때문에 비슷한 다른 단어가 잡힐 수는 있습니다.
:::

**과제 4 ⭐⭐⭐** 연습 프로젝트에 `searchOptions: { prefix: false }`를 넣고 빌드한 뒤, 개발 서버나 미리보기에서 "타입" 같은 짧은 검색어의 결과가 어떻게 달라지는지 관찰하세요.

::: details 힌트·정답 보기
`search.options.miniSearch.searchOptions`에 `{ prefix: false }`를 넣습니다. 앞부분 일치가 꺼지면 "타입을", "타입에서"처럼 조사가 붙은 단어를 찾지 못해 결과가 크게 줄어듭니다. 앞의 `ms-test.mjs`로 같은 실험을 하면 `prefix: false`일 때 "타입"은 제목에 "타입"이 따로 있는 "타입 별칭"만 찾고(본문에만 "타입에서"가 있는 "제네릭"은 빠짐), "체크"는 아무것도 찾지 못했습니다. 한국어에서 `prefix: true`가 왜 중요한지 알 수 있습니다. 실험 후 원래대로 돌립니다.
:::

## 확인 퀴즈

**1.** 로컬 검색의 인덱스는 언제 만들어지나요?

::: details 정답 보기
`vitepress build` 때 만들어져 `dist/assets/chunks/@localSearchIndexroot.<해시>.js`에 담깁니다. 개발 서버에서는 파일을 저장할 때마다 갱신됩니다.
:::

**2.** ts-wiki가 `chunkSizeWarningLimit: 4000`을 넣은 이유는?

::: details 정답 보기
검색 인덱스 파일(약 3.2MB)이 Vite 기본 경고 기준 500kB를 넘어 빌드마다 경고가 나왔기 때문입니다. 검색 창을 열 때만 받는 파일이라 문제가 아니므로 경고 기준만 올렸습니다.
:::

**3.** 기본 설정에서 "타입"으로 "타입스크립트에서"가 찾아지는 이유와, "스크립트"로는 안 찾아지는 이유는?

::: details 정답 보기
`prefix: true`라서 앞부분이 같으면 찾지만, 기본 토크나이저가 띄어쓰기 기준이라 "타입스크립트에서"가 한 단위가 되어 중간의 "스크립트"는 찾지 못합니다.
:::

**4.** 사내망 전용 위키라면 로컬 검색과 Algolia DocSearch 중 무엇이 맞나요?

::: details 정답 보기
로컬 검색입니다. Algolia는 외부 크롤러가 공개 사이트를 수집하고 외부 서버에서 검색하므로 사내망에서는 쓸 수 없습니다.
:::

## 정리

- VitePress 로컬 검색 = MiniSearch(작성 시점 7.2.0). 검색 서버 없이 브라우저 안에서 동작합니다.
- 인덱스는 빌드 때 제목 단위 섹션으로 만들어져 `@localSearchIndexroot.<해시>.js`가 됩니다.
- 기본 검색 옵션은 `fuzzy: 0.2`, `prefix: true`, `boost: { title: 4, text: 2, titles: 1 }`입니다.
- 한국어는 띄어쓰기 단위로 잘리므로 **앞부분 검색은 되고 중간 글자 검색은 안 됩니다.**
- ts-wiki 인덱스는 약 3.2MB라 Vite의 500kB 경고가 나서 `chunkSizeWarningLimit: 4000`으로 경고 기준만 올렸습니다.
- `translations`로 검색 창 글자를 한국어로 바꾸고, 대안으로 Algolia DocSearch가 있습니다.

## 다음 단계

여기까지가 위키를 "만드는" 도구였습니다. [3-5. nginx: 정적 파일 웹 서버](./05-nginx)부터는 만들어진 `dist` 폴더를 다른 사람에게 "띄워 주는" 도구를 봅니다.
