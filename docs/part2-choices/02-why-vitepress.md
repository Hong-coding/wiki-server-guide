---
title: 왜 VitePress인가
---

# 왜 VitePress인가

<LessonMeta level="초급" :minutes="30" prev="후보 여섯 가지를 요구사항으로 걸러 SSG 세 개를 남기고, 그중 VitePress를 골랐습니다." />

## 이번에 배울 것

- VitePress의 장점 다섯 가지(Vite 속도, Vue 컴포넌트 삽입, 기본 테마, 내장 로컬 검색, 코드 하이라이트)를 ts-wiki 설정과 연결해 설명할 수 있다.
- VitePress가 마크다운을 **Vue 템플릿**으로 처리한다는 사실과, 그 때문에 생기는 빌드 함정을 직접 재현할 수 있다.
- ts-wiki 작성 규칙(꺾쇠는 인라인 코드로, 이중 중괄호는 펜스 코드 블록 안에만)이 왜 생겼는지 말할 수 있다.
- "1.x 안정판을 정확한 버전으로 고정해서 쓴다"는 결정의 이유와 대가를 말할 수 있다.

## 먼저 알아 둘 것

- [위키 도구 비교](./01-wiki-tools-compare)의 결론
- [Node.js와 npm](../part1-concepts/04-node-npm): `npm install`, `npx`가 무엇인지
- 터미널에서 폴더를 만들고 이동할 수 있으면 됩니다.

## 비유로 이해하기

VitePress는 **"말 잘 듣는 인쇄소"** 입니다. 원고(마크다운)를 넘기면 표지·목차·쪽 번호·색인(검색)까지 붙여 책(HTML)으로 찍어 줍니다. 원고 중간에 "여기에 진도표 스티커 붙여 주세요"(Vue 컴포넌트)라고 적으면 그것도 붙여 줍니다.

문제는 이 인쇄소가 **원고 속 특정 기호를 지시문으로 읽는다**는 점입니다. 원고에 이중 중괄호를 적으면 "여기에 계산 결과를 넣으라"는 뜻으로 받아들입니다. 그래서 그 모양 그대로 찍히길 원한 글자가 엉뚱하게 바뀌거나, 계산할 수 없어서 인쇄 자체가 멈춥니다. 똑똑한 기능과 함정이 **같은 뿌리**에서 나옵니다.

## 개념 설명

### 1. 요구사항 다시 보기

이 레슨에서 특히 중요한 요구사항은 세 가지입니다.

| 요구사항 | VitePress에 기대하는 것 |
|---|---|
| 2. 코드 예제 많음 | 코드 블록 하이라이트와 줄 번호가 기본으로 될 것 |
| 5. 한 사람이 관리 | 설정이 작고, 글을 저장하면 바로 결과가 보일 것 |
| 6·7. 검색·다크 모드 | 추가 서비스 없이 기본 테마에 있을 것 |

### 2. 장점 다섯 가지

#### 장점 1: Vite의 속도

**Vite**(비트, 프랑스어로 "빠르다")는 개발 서버와 빌드를 맡는 도구입니다. 개발 서버는 파일을 저장하면 바뀐 부분만 브라우저에 바로 밀어 넣습니다. 이것을 **HMR**(Hot Module Replacement, 새로 고침 없이 바뀐 모듈만 교체)이라고 부릅니다.

글 쓰는 사람 입장에서는 "저장 → 브라우저가 알아서 바뀜"입니다. 한 사람이 75개 레슨을 쓰고 고치려면 이 반복이 빨라야 지치지 않습니다. VitePress 1.6.3은 Vite 5.4 계열을 함께 설치합니다. 이 가이드 폴더(`D:\workspace\wiki-server-guide`)에서 확인한 실제 출력입니다.

```bash
npm ls vite
```

```text
wiki-server-guide@1.0.0 D:\workspace\wiki-server-guide
`-- vitepress@1.6.3
  +-- @vitejs/plugin-vue@5.2.4
  | `-- vite@5.4.21 deduped
  `-- vite@5.4.21
```

**확인 방법**: `vitepress@1.6.3` 아래에 `vite@5.x`가 보이면, VitePress가 Vite를 함께 데려왔다는 뜻입니다. 우리가 Vite를 따로 설치하지 않았는데도 있는 이유입니다. (`deduped`는 "이미 위에 설치된 것을 같이 쓴다"는 뜻입니다.)

#### 장점 2: 마크다운 안에 Vue 컴포넌트

VitePress는 마크다운 파일 하나를 **Vue 컴포넌트 하나**로 바꿉니다. 그래서 마크다운 안에 Vue 컴포넌트 태그를 그대로 쓸 수 있습니다. 이 가이드의 모든 레슨 맨 위에 보이는 배지(난이도·예상 시간)가 바로 그것입니다.

```md
<LessonMeta level="초급" :minutes="30" prev="..." />
```

`:minutes`처럼 앞에 콜론이 붙은 속성은 Vue 문법으로 "문자열이 아니라 값(숫자 30)으로 넘긴다"는 뜻입니다. 정적 HTML이었다면 이 배지를 페이지마다 HTML로 복사해 넣어야 했을 것입니다.

#### 장점 3: 기본 테마의 품질

설정을 거의 하지 않아도 다음이 갖춰집니다.

- 왼쪽 사이드바, 오른쪽 "이 페이지 목차", 위쪽 내비게이션
- 이전/다음 페이지 링크
- 다크 모드 전환 버튼(요구사항 7)
- 휴대폰 화면에 맞춘 메뉴

ts-wiki는 테마를 새로 만들지 않고 **기본 테마를 확장**(extends)만 했습니다. 요구사항 5(한 사람 관리)에 맞습니다.

#### 장점 4: 내장 로컬 검색

`search.provider`를 `'local'`로 두면 빌드할 때 모든 글로 검색 인덱스(찾아보기 표)를 만들고, 검색은 **방문자의 브라우저 안에서** 합니다. 공식 문서 기준으로 MiniSearch라는 라이브러리를 씁니다. 검색 서버가 따로 없으니 인터넷이 막힌 사내망에서도 검색이 됩니다(요구사항 4·6).

#### 장점 5: 코드 하이라이트

코드 블록에 언어를 적으면 **Shiki**라는 라이브러리가 빌드할 때 색을 입혀 HTML로 만들어 둡니다. 방문자 브라우저가 색을 계산하지 않아도 되므로 페이지가 가볍습니다. 설정 한 줄로 줄 번호도 켤 수 있습니다(요구사항 2).

### 3. 단점: Vue 템플릿 함정

장점 2의 뒷면입니다. VitePress는 마크다운을 HTML로 바꾼 뒤, 그 HTML을 **Vue 템플릿**으로 한 번 더 해석합니다. Vue 템플릿에서는 두 가지가 특별한 뜻을 가집니다.

| 기호 | Vue가 읽는 뜻 | 마크다운 작성자가 원한 뜻 |
|---|---|---|
| 꺾쇠로 둘러싼 단어(예: `<string>`) | HTML 태그(여는 태그) | 그냥 글자 |
| 이중 중괄호 | "안의 식을 계산해서 결과를 넣어라" | 그냥 그 모양의 글자 |

직접 깨뜨려 보면 확실히 이해됩니다.

### 4. 따라 하기: 빌드를 일부러 깨뜨리기

ts-wiki를 고치지 말고 **새 실습 폴더**에서 합니다.

#### 4-1. 실습 폴더 만들기

```powershell
# Windows PowerShell
mkdir $HOME\vp-trap
cd $HOME\vp-trap
npm init -y
npm install -D vitepress@1.6.3 vue@3.5.13
mkdir docs
```

```bash
# macOS / Linux
mkdir -p ~/vp-trap && cd ~/vp-trap
npm init -y
npm install -D vitepress@1.6.3 vue@3.5.13
mkdir docs
```

**확인 방법**: `node_modules` 폴더가 생기고, `package.json`의 `devDependencies`에 `vitepress`와 `vue`가 보이면 성공입니다. 설치 끝에 `Run npm audit for details.` 같은 안내가 나올 수 있는데, 이것은 5절에서 다룹니다.

#### 4-2. 함정 1: 꺾쇠를 맨글자로 쓰기

`docs/index.md`를 만들고 다음 내용을 넣습니다.

```md
# 함정 실험

문자열 배열은 Array<string> 으로 씁니다.
```

빌드합니다.

```bash
npx vitepress build docs
```

실제 출력(작성 시점, VitePress 1.6.3):

```text
  vitepress v1.6.3

- building client + server bundles...
x Build failed in 344ms
✖ building client + server bundles...
build error:
[vite:vue] [plugin vite:vue] docs/index.md (5:17): Element is missing end tag.
```

**해설**: Vue는 `<string>`을 "string이라는 태그를 열었다"고 읽었습니다. 그런데 닫는 태그가 없으니 "Element is missing end tag(닫는 태그가 없음)"라며 멈췄습니다. 오류 위치가 `5:17`처럼 원래 줄 번호와 다를 수 있습니다. 마크다운이 HTML로 바뀐 뒤의 위치이기 때문입니다.

**고친 모습**: 인라인 코드(백틱 한 쌍)로 감쌉니다.

```md
문자열 배열은 `Array<string>` 으로 씁니다.
```

다시 빌드하면 `build complete`가 나오고, 결과 HTML(`docs/.vitepress/dist/index.html`)에는 다음처럼 꺾쇠가 안전한 글자(`&lt;`, `&gt;`)로 바뀌어 들어갑니다.

```html
<code>Array&lt;string&gt;</code>
```

인라인 코드 안의 꺾쇠는 마크다운 단계에서 이렇게 바뀌므로 Vue가 태그로 오해하지 않습니다.

#### 4-3. 함정 2: 인라인 코드 안의 이중 중괄호

GitHub Actions 설정을 설명하다 보면 이런 문장을 쓰고 싶어집니다. `docs/index.md`를 아래처럼 바꿉니다.

```md
# 함정 실험

배포 경로는 `/${{ github.event.repository.name }}/` 입니다.
```

```bash
npx vitepress build docs
```

실제 출력:

```text
- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
✖ rendering pages...
build error:
Cannot read properties of undefined (reading 'event')
TypeError: Cannot read properties of undefined (reading 'event')
```

**해설**: 이번에는 인라인 코드로 감쌌는데도 깨졌습니다. 꺾쇠와 달리 중괄호는 마크다운이 바꾸지 않기 때문에, Vue가 이중 중괄호 안을 **자바스크립트 식으로 계산**하려 했습니다. `github`라는 변수가 없으니(undefined) 그 안의 `event`를 읽다가 오류가 났습니다. 첫 단계(bundles)는 통과하고 **페이지를 그리는 단계(rendering)에서** 실패한다는 점도 기억해 두세요.

더 무서운 경우는 **계산이 성공하는** 경우입니다. 인라인 코드 안에 이중 중괄호로 `1 + 1`을 감싸 쓰면 빌드는 성공하는데, 화면에는 원래 글자 대신 `2`가 찍힙니다. 실제로 빌드한 HTML을 열어 보면 다음이 들어 있습니다.

```html
<code>2</code>
```

오류가 안 나니 틀린 줄도 모르고 배포됩니다.

#### 4-4. 안전한 방법 두 가지

**방법 1. 펜스 코드 블록(백틱 세 개) 안에 쓰기.** VitePress 공식 문서 기준으로 펜스 코드 블록은 자동으로 `v-pre`(Vue에게 "이 안은 해석하지 마"라고 알리는 표시)로 감싸집니다.

````md
```yaml
WIKI_BASE: /${{ github.event.repository.name }}/
```
````

이렇게 바꾸고 빌드하면 `build complete`가 나오고, 결과 HTML에 `repository.name`이 그대로 들어 있습니다.

**방법 2. `<span v-pre>`로 감싸기.** 꼭 문장 중간에 써야 할 때만 씁니다. 실습에서 `<span v-pre>` 안에 인라인 코드를 넣고 빌드하니, 결과 HTML에 식이 계산되지 않고 원래 모양 그대로 들어갔습니다.

::: tip 이 가이드가 정한 규칙
이 가이드와 ts-wiki는 더 단순한 규칙을 씁니다. **이중 중괄호는 펜스 코드 블록 안에서만 쓴다.** 본문에서 말해야 하면 "github.event.repository.name 표현식"처럼 중괄호 없이 이름만 씁니다. 규칙이 단순할수록 한 사람이 관리할 때 실수가 줄어듭니다.
:::

#### 4-5. 실습 정리

```powershell
# Windows PowerShell
cd $HOME
Remove-Item -Recurse -Force $HOME\vp-trap
```

```bash
# macOS / Linux
cd ~ && rm -rf ~/vp-trap
```

### 5. 단점 2: 1.x 안정판과 버전 고정

작성 시점(2026-10) npm에서 확인한 VitePress 배포 태그(dist-tags)는 다음과 같습니다.

```text
{ latest: '1.6.4', next: '2.0.0-alpha.21' }
```

- `latest`(최신 안정판)는 1.6.4입니다. 1.0.0은 2024-03에 나왔습니다.
- `next`는 다음 메이저 버전 2.0의 **알파**(정식 출시 전 시험판)입니다. 설정 방식이 바뀔 수 있습니다.
- ts-wiki는 `"vitepress": "1.6.3"`처럼 **캐럿(^) 없이 정확한 버전**을 적었습니다. `npm install`을 언제 해도 같은 버전이 깔리므로 "어제는 됐는데 오늘은 빌드가 깨진다"는 일이 줄어듭니다.

대가도 있습니다. 버전을 고정하면 새 기능과 보안 수정이 **자동으로 들어오지 않습니다.** 작성 시점에 실습 폴더에서 `npm audit`(설치한 패키지의 알려진 취약점 검사)을 실행하면 vue 3.5.13 계열에 대한 보안 권고가 표시됩니다.

```bash
npm audit
```

```text
# npm audit report

@vue/server-renderer  <=3.5.41
Severity: high
...
fix available via `npm audit fix`
```

버전을 고정했다면 **정기적으로 `npm audit`을 돌리고, 직접 버전을 올리고, 빌드로 확인하는 일**이 관리자 몫이 됩니다.

::: warning 정적 사이트와 보안 권고
이 권고는 Vue의 서버 렌더링 부분에 관한 것입니다. VitePress는 빌드할 때만 서버 렌더링을 쓰고 운영 중에는 정적 파일만 서비스하므로, 동적 서버와는 위험도가 다를 수 있습니다. 그래도 판단은 권고 원문을 읽고 해야 합니다. "정적 사이트라 괜찮다"고 단정하지 말고, 버전을 올린 뒤 빌드해 보는 습관을 들이세요.
:::

### 6. 장단점 한눈에

| 항목 | 장점 | 단점 | 이 점이 중요한 상황 |
|---|---|---|---|
| 속도(Vite) | 저장 즉시 반영(HMR) | 거의 없음 | 글을 자주 고칠 때 |
| Vue 컴포넌트 | 배지·진도표 같은 부품을 글 안에 | Vue 템플릿 함정 | 화면 부품이 필요한 위키 |
| 기본 테마 | 사이드바·목차·다크 모드 기본 | 기본 테마에서 크게 벗어나려면 Vue 지식 필요 | 디자인에 시간을 못 쓸 때 |
| 로컬 검색 | 외부 서비스·서버 불필요 | 인덱스가 브라우저로 통째로 내려감 | 사내망, 중간 규모 문서 |
| 코드 하이라이트 | 빌드 때 색을 입혀 가벼움 | 언어 이름을 정확히 적어야 함 | 코드 예제가 많을 때 |
| 버전 | 1.x 안정판 | 2.0 알파 진행 중, 고정 시 수동 업데이트 | 오래 유지할 위키 |

## ts-wiki에서는

### 장점이 쓰인 곳

`D:\workspace\ts-wiki\docs\.vitepress\config.mts`에서 장점들이 어디에 쓰였는지 찾아봅니다.

```ts
  markdown: {
    lineNumbers: true,
  },
```

- 28~30번째 줄: 코드 블록 줄 번호를 켭니다(장점 5, 요구사항 2).

```ts
  // 로컬 검색 인덱스가 한 청크에 들어가 500kB를 넘으므로 경고 기준만 올립니다.
  vite: {
    build: { chunkSizeWarningLimit: 4000 },
  },
```

- 31~34번째 줄: 로컬 검색의 **대가**가 보이는 곳입니다. 검색 인덱스가 커서 Vite가 "파일 조각(청크)이 500kB를 넘는다"고 경고하므로 경고 기준만 올렸습니다. 주석에 "왜"를 적어 둔 좋은 예입니다.

```ts
    search: {
      provider: 'local',
```

- 58~59번째 줄: 내장 로컬 검색을 켭니다(장점 4). 그 아래 `translations`는 검색 창 문구를 한국어로 바꾸는 부분입니다.

`D:\workspace\ts-wiki\docs\.vitepress\theme\index.ts`는 장점 2·3을 보여 줍니다.

```ts
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

- 10번째 줄 `extends: DefaultTheme`: 기본 테마를 그대로 이어받습니다.
- 13~16번째 줄: Vue 컴포넌트 네 개를 전역 등록해서, 어느 마크다운에서든 `LessonMeta` 같은 태그를 바로 쓸 수 있게 합니다.

### 단점에 대한 대비: 작성 규칙

ts-wiki의 `docs/guide/writing-guide.md`에는 "마크다운 작성 시 주의 (VitePress 빌드 오류 방지)" 절이 있고, 첫 문장이 이렇습니다.

```text
VitePress는 마크다운을 Vue 템플릿으로 처리합니다. 다음을 지키지 않으면 빌드가 깨집니다.
```

그 아래 1번 규칙이 "본문에서 타입 문법은 반드시 인라인 코드로 감쌉니다", 2번 규칙이 이중 중괄호에 관한 규칙입니다. TypeScript 위키라서 `Array<string>`, `Promise<T>` 같은 꺾쇠 표현이 매 레슨 나오기 때문에 1번 규칙이 맨 앞에 있습니다.

이 가이드(wiki-server-guide)의 [문서 작성 규칙](../guide/writing-guide)은 한 걸음 더 나아가 "이중 중괄호는 **코드 블록 안에만** 씁니다. 인라인 코드 안에 써도 빌드가 깨집니다"라고 적었습니다. 이 레슨의 4-3 실습이 그 근거입니다. GitHub Actions 파일(`deploy.yml`)을 설명해야 하는 가이드라서 이 함정을 더 자주 밟기 때문입니다.

### ts-wiki의 결정과 그 대가

| 결정 | 얻은 것 | 대가 |
|---|---|---|
| VitePress 기본 테마 확장 | 디자인 작업 거의 없음, 다크 모드·검색 기본 | 테마를 크게 바꾸려면 Vue를 배워야 함 |
| 마크다운 + Vue 컴포넌트 | 배지·목차·진도표를 글 안에 | 작성 규칙(꺾쇠·중괄호)을 모든 작성자가 지켜야 함 |
| 로컬 검색 | 사내망에서도 검색 | 큰 검색 인덱스, 청크 경고 기준 조정 |
| 1.6.3 정확한 버전 고정 | 언제 설치해도 같은 결과 | 보안 수정·새 기능을 직접 챙겨서 올려야 함 |

## 이럴 땐 다른 걸 고르세요

- **글 쓰는 사람이 여럿이고, 작성 규칙을 교육하기 어렵다** → 마크다운이 템플릿으로 해석되지 않는 생성기(MkDocs 등)나 웹 편집기가 있는 위키가 실수를 줄입니다.
- **팀이 React만 안다** → 컴포넌트를 직접 만들 일이 많다면 Docusaurus가 학습 비용이 낮습니다.
- **문서가 수천~수만 페이지** → 브라우저로 통째로 내려가는 로컬 검색은 무거워집니다. 검색 서버나 외부 검색 서비스를 쓰는 구성을 검토합니다.
- **최신 메이저 버전의 새 기능이 꼭 필요하다** → 알파 버전을 쓰는 대가(설정 변경, 문서 부족)를 감수할 수 있는지 먼저 판단합니다.

## 자주 하는 실수

### 실수 1: Element is missing end tag

- **증상**: `[vite:vue] ... Element is missing end tag.`로 빌드 실패
- **원인**: 본문에 `<T>`, `Array<string>`, `<이 PC의 IP>` 같은 꺾쇠 표현을 맨글자로 썼습니다.
- **해결**: 백틱으로 감싸 인라인 코드로 만듭니다. 오류 줄 번호가 원본과 다를 수 있으니, 그 파일에서 `<`를 검색해 맨글자인 것을 찾습니다.

### 실수 2: rendering pages 단계에서 Cannot read properties of undefined

- **증상**: bundles 단계는 통과했는데 `rendering pages...`에서 `TypeError: Cannot read properties of undefined (reading '...')`
- **원인**: 본문(인라인 코드 포함)에 쓴 이중 중괄호를 Vue가 식으로 계산하려 했습니다.
- **해결**: 펜스 코드 블록으로 옮기거나, 중괄호 없이 이름만 씁니다. 꼭 필요하면 `<span v-pre>`로 감쌉니다.

### 실수 3: 빌드는 되는데 글자가 바뀌어 있음

- **증상**: 인라인 코드에 적은 식 대신 계산 결과(예: `2`)가 화면에 보입니다.
- **원인**: 이중 중괄호 안의 식이 계산 가능한 식이라 오류 없이 계산되었습니다.
- **해결**: 실수 2와 같습니다. 배포 전에 grep으로 본문의 이중 중괄호를 검사하는 습관을 들입니다.

### 실수 4: vitepress --version이 서버를 켜 버림

- **증상**: 버전만 보려고 `npx vitepress --version`을 실행했더니 버전 줄과 함께 `Local: http://localhost:5173/`이 뜨고 터미널이 돌아오지 않습니다.
- **원인**: 작성 시점 1.6.3에서 실제로 확인한 동작입니다. 명령 이름(dev·build·preview)을 생략하면 dev 서버를 켭니다.
- **해결**: `Ctrl+C`로 끄고, 버전은 `npm ls vitepress`로 확인합니다.

## 직접 해 보기

### 과제 1 ⭐ 함정 재현

4-2와 4-3 실습을 직접 해서 두 오류 메시지를 내 화면에서 확인하세요. 각각 **어느 단계**(bundles / rendering)에서 실패했는지 적어 봅니다.

::: details 정답 보기
- 꺾쇠 맨글자: `building client + server bundles` 단계에서 실패(템플릿 컴파일 오류)
- 이중 중괄호: bundles는 통과하고 `rendering pages` 단계에서 실패(실행 중 오류)

컴파일 단계 오류는 "문법이 틀렸다", 렌더링 단계 오류는 "문법은 맞는데 실행하다 터졌다"로 구분하면 원인을 빨리 찾습니다.
:::

### 과제 2 ⭐⭐ 조용히 틀리는 경우 찾기

실습 폴더에서 인라인 코드 안에 이중 중괄호로 `'한빛' + ' 카페'`를 감싸 쓰고 빌드하세요. 빌드가 성공하는지, 결과 HTML에 무엇이 들어가는지 확인합니다. 그다음 같은 내용을 펜스 코드 블록에 넣어 비교합니다.

::: details 정답 보기
빌드는 성공하고, 결과 HTML에는 `<code>한빛 카페</code>`처럼 계산 결과만 들어갑니다(작성 시점 실제 확인). 펜스 코드 블록 안에서는 이중 중괄호와 식이 원래 모양 그대로 보입니다. "오류가 안 난다 = 맞다"가 아니라는 것을 확인하는 과제입니다.
:::

### 과제 3 ⭐⭐ ts-wiki 설정에서 장점 찾기

`D:\workspace\ts-wiki\docs\.vitepress\config.mts`를 열어 다음을 담당하는 줄을 찾으세요(파일을 고치지 말고 읽기만).

1. 다크 모드 버튼 글자
2. 검색 결과가 없을 때 문구
3. 코드 줄 번호

::: details 정답 보기
1. `darkModeSwitchLabel: '다크 모드'`
2. `noResultsText: '결과가 없습니다'`
3. `lineNumbers: true` (28~30번째 줄의 `markdown` 안)
:::

### 과제 4 ⭐⭐⭐ 배포 전 검사 명령 만들기

배포 전에 본문의 위험한 기호를 찾는 검사를 만들어 보세요. 힌트: 이 가이드의 작가들은 grep으로 "코드 블록 밖의 이중 중괄호"를 찾습니다.

::: details 힌트
가장 단순한 시작은 파일 전체에서 이중 중괄호를 찾고, 결과 중 코드 블록 안에 있는 것을 눈으로 빼는 것입니다.

```bash
grep -rn "{{" docs --include=*.md
```

```powershell
Get-ChildItem docs -Recurse -Filter *.md | Select-String -Pattern "{{"
```

더 나아가려면 Node.js 스크립트로 펜스(백틱 세 개)의 시작·끝을 세면서 그 밖에 있는 줄만 출력하게 만들 수 있습니다. ts-wiki의 `scripts/fix-frontmatter.mjs`가 폴더를 훑는 방식(`walk` 함수)을 참고하세요.
:::

## 확인 퀴즈

1. VitePress에서 Vue 컴포넌트를 마크다운에 쓸 수 있는 이유와, 꺾쇠·중괄호 함정이 생기는 이유는 같은 뿌리입니다. 그 뿌리는?
2. 인라인 코드로 감싸면 꺾쇠 문제는 해결되는데 이중 중괄호 문제는 해결되지 않는 이유는?
3. VitePress 로컬 검색이 사내망에서도 동작하는 이유는?
4. 버전을 `^1.6.3`이 아니라 `1.6.3`으로 고정했을 때의 장점과 대가는?

::: details 정답 보기
1. VitePress가 마크다운을 HTML로 바꾼 뒤 **Vue 템플릿으로 해석**하기 때문입니다.
2. 인라인 코드 안의 꺾쇠는 마크다운 단계에서 `&lt;`, `&gt;`로 바뀌어 태그로 읽히지 않지만, 중괄호는 바뀌지 않아 Vue가 식으로 계산합니다. 펜스 코드 블록은 `v-pre`로 감싸지므로 안전합니다.
3. 빌드할 때 검색 인덱스를 파일로 만들어 두고, 검색 자체는 방문자의 브라우저 안에서 하기 때문입니다. 외부 검색 서버가 필요 없습니다.
4. 장점: 언제 설치해도 같은 버전이라 결과가 재현됩니다. 대가: 보안 수정·새 기능이 자동으로 들어오지 않아 직접 확인하고 올려야 합니다.
:::

## 정리

- VitePress는 Vite의 속도, Vue 컴포넌트 삽입, 기본 테마, 내장 로컬 검색, 빌드 시 코드 하이라이트를 한 번에 줍니다.
- 그 대신 마크다운이 Vue 템플릿으로 해석되므로 **맨글자 꺾쇠는 빌드 실패**, **이중 중괄호는 인라인 코드 안에서도 실패하거나 조용히 바뀝니다.**
- 안전한 규칙: 꺾쇠는 인라인 코드로, 이중 중괄호는 펜스 코드 블록 안에만.
- ts-wiki 작성 규칙은 이 함정을 막으려고 생겼습니다.
- 작성 시점 1.x가 안정판(latest 1.6.4)이고 2.0은 알파입니다. ts-wiki는 1.6.3을 고정하고, 그 대가로 업데이트와 `npm audit`을 직접 챙겨야 합니다.

## 다음 단계

[2-3. 왜 Markdown으로 쓰나](./03-why-markdown)에서 글 형식 자체를 Markdown·HTML·웹 편집기(DB)로 비교하고, git diff로 변경을 리뷰하는 장면을 직접 봅니다.
