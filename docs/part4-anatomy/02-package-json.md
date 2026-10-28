---
title: package.json과 npm 스크립트
---

# package.json과 npm 스크립트

<LessonMeta level="중급" :minutes="30" prev="ts-wiki의 폴더 구조와 git에 들어가는 파일·빠지는 파일을 구분했다" />

## 이번에 배울 것

- ts-wiki `package.json` 18줄의 각 필드가 무슨 뜻인지 설명할 수 있다.
- `"type": "module"`과 `"private": true`가 왜 들어 있는지 말할 수 있다.
- `npm run dev`를 쳤을 때 실제로 어떤 명령이 실행되는지, `--host 0.0.0.0`과 `--port`가 무엇을 바꾸는지 설명할 수 있다.
- 의존성 버전을 `^` 없이 고정한 이유와 `package-lock.json`의 역할을 설명할 수 있다.

## 먼저 알아 둘 것

- npm 패키지와 `npm install`, `npm run`의 기본 → [Node.js와 npm](../part1-concepts/04-node-npm)
- localhost와 포트 → [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host)
- JSON 문법(중괄호, 따옴표로 감싼 키, 쉼표) 정도만 알면 됩니다.

## 비유로 이해하기

`package.json`은 **식당 운영 매뉴얼의 첫 장**입니다.

- 가게 이름과 버전(`name`, `version`): 간판
- "외부에 팔지 않는 내부 레시피"(`private`): 프랜차이즈 본사에 등록하지 말 것
- 자주 쓰는 작업의 단축 메뉴(`scripts`): "오픈 준비 = 불 켜기 + 재료 꺼내기 + 간판 켜기"를 한 단어로 부르는 약속
- 납품받는 재료 목록(`devDependencies`): 어느 업체의 어느 규격 재료를 쓰는지

그리고 `package-lock.json`은 **실제 납품 영수증 묶음**입니다. 매뉴얼에는 "밀가루 1.6.3 규격"만 적혀 있어도, 영수증에는 그 밀가루에 들어간 소금·물의 제조 번호까지 모두 남습니다. 다음에 같은 영수증대로 주문하면 완전히 같은 재료가 옵니다.

## 개념 설명

### 1단계: 전체 파일 보기

ts-wiki의 `package.json` 전체입니다(18줄).

```json:line-numbers
{
  "name": "ts-wiki",
  "version": "1.0.0",
  "private": true,
  "description": "TypeScript를 처음 배우는 사람을 위한 단계별 학습 위키",
  "type": "module",
  "scripts": {
    "dev": "vitepress dev docs --host 0.0.0.0 --port 5180",
    "build": "vitepress build docs",
    "fix:frontmatter": "node scripts/fix-frontmatter.mjs",
    "preview": "vitepress preview docs --host 0.0.0.0 --port 5180"
  },
  "devDependencies": {
    "typescript": "5.6.3",
    "vitepress": "1.6.3",
    "vue": "3.5.13"
  }
}
```

JSON은 주석을 쓸 수 없는 형식이라 이 파일에는 설명이 한 줄도 없습니다. 그래서 각 줄의 의미를 따로 알아 둬야 합니다.

### 2단계: 이름표 필드 (2~5줄)

| 줄 | 필드 | 값 | 의미 |
|---|---|---|---|
| 2 | `name` | `ts-wiki` | 패키지 이름. 소문자·하이픈만 쓰는 것이 npm 규칙입니다 |
| 3 | `version` | `1.0.0` | 이 프로젝트의 버전. 위키는 npm에 올리지 않으니 사실상 표시용입니다 |
| 4 | `private` | `true` | **npm 공개 저장소에 올리는 것을 막는 안전장치** |
| 5 | `description` | 설명 문장 | 사람이 읽는 한 줄 소개 |

`private: true`가 있으면 누가 실수로 `npm publish`(패키지를 npm 공개 저장소에 올리는 명령)를 쳐도 npm이 거부합니다. 위키는 "남이 설치해 쓰는 라이브러리"가 아니라 "우리가 실행하는 애플리케이션"이므로, 올릴 일이 없다는 것을 명시해 둔 것입니다.

`npm ls`의 첫 줄에 `name@version`이 그대로 보입니다.

```bash
npm ls --depth=0
```

```text
ts-wiki@1.0.0 D:\workspace\ts-wiki
+-- typescript@5.6.3
+-- vitepress@1.6.3
`-- vue@3.5.13
```

### 3단계: `"type": "module"` (6줄)

Node.js에는 JavaScript 파일을 불러오는 방식이 두 가지 있습니다.

| 방식 | 불러오는 문법 | 이 방식을 강제하는 확장자 |
|---|---|---|
| CommonJS(옛 방식) | `require('...')`, `module.exports` | `.cjs` |
| ES 모듈(ESM, 표준 방식) | `import ... from '...'`, `export` | `.mjs` (TS는 `.mts`) |

문제는 그냥 `.js`입니다. `.js` 파일을 어느 방식으로 읽을지는 **가장 가까운 `package.json`의 `type` 필드**가 정합니다. `"type": "module"`이면 `.js`를 ESM으로 읽습니다.

직접 확인해 봅니다. 똑같은 `x.js`(ESM 문법인 `import` 사용)를 `type`이 없는 폴더와 있는 폴더에 두고 실행했습니다(Node 24.13.1).

```js
import { join } from "node:path"
console.log(join("a","b"))
```

`type`이 **없는** 폴더(경로 일부는 `...`로 줄임):

```text
(node:42624) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///.../esm/nomod/x.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to ...\esm\nomod\package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
a\b
```

`"type": "module"`이 **있는** 폴더:

```text
a\b
```

최신 Node는 `import` 문법을 보고 ESM으로 다시 읽어 주지만, 경고와 함께 "성능 부담이 있다"고 알려 줍니다. 이런 자동 감지가 없는 오래된 Node에서는 아예 실패합니다.

ts-wiki에서 이 필드가 하는 일을 정확히 말하면 이렇습니다.

- 설정 파일은 `config.mts`, 스크립트는 `fix-frontmatter.mjs`처럼 **확장자부터 ESM**으로 지어 두었기 때문에, 지금 있는 파일은 `type`이 없어도 ESM으로 읽힙니다.
- VitePress 자체가 ESM 전용 패키지(공식 문서 기준)라서, 나중에 누가 `.js` 파일(예: `scripts/새스크립트.js`)을 추가해도 `import` 문법이 경고 없이 동작하도록 **프로젝트 전체를 ESM으로 통일**해 둔 것입니다.

**확인 방법:** 스크래치 폴더에서 위 실험을 해 보고, 경고가 나왔다가 `"type": "module"`을 넣으면 사라지는지 봅니다.

### 4단계: `scripts` (7~12줄)

`scripts`는 긴 명령에 짧은 이름을 붙이는 곳입니다. 목록은 `npm run`만 쳐도 볼 수 있습니다.

```bash
npm run
```

```text
Scripts available in ts-wiki@1.0.0 via `npm run`:
  dev
    vitepress dev docs --host 0.0.0.0 --port 5180
  build
    vitepress build docs
  fix:frontmatter
    node scripts/fix-frontmatter.mjs
  preview
    vitepress preview docs --host 0.0.0.0 --port 5180
```

`npm run dev`를 치면 npm은 세 가지 일을 합니다.

1. `package.json`의 `scripts.dev` 값을 읽습니다.
2. `node_modules/.bin` 폴더를 명령 검색 경로(PATH, 셸이 명령 파일을 찾아보는 폴더 목록)의 맨 앞에 잠시 붙입니다. 그래서 전역 설치를 하지 않았는데도 `vitepress`라는 명령을 찾을 수 있습니다.
3. 그 문자열을 셸에서 실행합니다.

명령을 조각내 보면 이렇습니다.

| 조각 | 뜻 |
|---|---|
| `vitepress` | `node_modules/.bin/vitepress` 실행 파일 |
| `dev` / `build` / `preview` | 하위 명령. 개발 서버 / 정적 빌드 / 빌드 결과 미리보기 서버 |
| `docs` | 사이트의 뿌리 폴더. 이 아래의 `.vitepress/config.mts`를 찾아 읽습니다 |
| `--host 0.0.0.0` | 어느 네트워크 주소로 들어온 접속이든 받기 |
| `--port 5180` | 5180번 포트에서 기다리기 |

`build`에는 `--host`·`--port`가 없습니다. 빌드는 파일을 만들고 끝나는 작업이라 접속을 기다릴 일이 없기 때문입니다.

#### `--host 0.0.0.0`이 바꾸는 것

작은 실습 프로젝트를 두 번 띄워 비교했습니다(IP는 가림).

`--host` 없이:

```text
  vitepress v1.6.3

  ➜  Local:   http://localhost:5191/
  ➜  Network: use --host to expose
```

`--host 0.0.0.0`을 붙여서:

```text
  vitepress v1.6.3

  ➜  Local:   http://localhost:5191/
  ➜  Network: http://<이 PC의 IP>:5191/
  ➜  Network: http://<이 PC의 IP>:5191/
  ➜  Network: http://<이 PC의 IP>:5191/
```

- 기본값은 **이 PC 안에서만**(localhost) 접속을 받습니다. 그래서 "Network: use --host to expose"(외부에 열려면 --host를 쓰라)라고 알려 줍니다.
- `0.0.0.0`은 "이 PC가 가진 모든 네트워크 주소"라는 뜻의 특별한 주소입니다. 붙이면 같은 와이파이·사내망의 다른 PC나 휴대폰에서 `http://<이 PC의 IP>:5180`으로 들어올 수 있습니다. Network 줄이 여러 개인 것은 이 PC에 네트워크 어댑터(유선, 무선, 가상 어댑터 등)가 여러 개라서입니다.
- ts-wiki가 이 옵션을 넣은 이유: 글을 쓰면서 옆자리 동료나 휴대폰에서 바로 확인하기 위해서입니다. 대신 **같은 네트워크의 누구나 접속할 수 있게** 되므로, 공용 와이파이에서는 주의합니다.

#### `--port 5180`이 바꾸는 것

포트를 정하지 않으면 개발 서버는 Vite의 기본 포트 5173(공식 문서 기준)을 씁니다. 이 번호는 Vite 기반 프로젝트가 모두 쓰는 번호라 다른 프로젝트와 자주 부딪힙니다. ts-wiki는 5180, 이 가이드(wiki-server-guide)는 5181로 따로 정해 두어 **두 위키를 동시에 켜도** 충돌하지 않게 했습니다.

지정한 포트가 이미 쓰이고 있으면 개발 서버는 멈추지 않고 다음 번호로 넘어갑니다. 실습 중 5190번이 다른 프로그램에 잡혀 있을 때 실제로 이런 출력이 나왔습니다.

```text
Port 5190 is in use, trying another one...

  vitepress v1.6.3

  ➜  Local:   http://localhost:5191/
```

편리하지만, 주소가 바뀐 줄 모르고 예전 주소를 새로 고치며 "수정이 반영이 안 된다"고 헤매는 원인이 되기도 합니다. **항상 터미널의 Local 줄을 확인**하는 습관을 들이세요.

#### `fix:frontmatter`의 콜론

스크립트 이름의 콜론(`:`)은 특별한 문법이 아니라 이름의 일부입니다. "frontmatter를 고치는(fix) 작업"이라는 뜻으로 묶어 부르는 관례입니다. 실행은 `npm run fix:frontmatter`이고, 내용은 [4-6](./06-scripts-and-rules)에서 읽습니다.

**확인 방법:** 복사본에서 `npm run dev`를 실행해 `Local: http://localhost:5180/`과 `Network:` 줄이 보이는지 확인하고, `Ctrl+C`로 끕니다.

### 5단계: `devDependencies`와 버전 고정 (13~17줄)

```json:line-numbers=13
  "devDependencies": {
    "typescript": "5.6.3",
    "vitepress": "1.6.3",
    "vue": "3.5.13"
  }
```

#### 왜 `dependencies`가 아니라 `devDependencies`인가

- `dependencies`: 프로그램이 **실행될 때** 필요한 패키지
- `devDependencies`: **개발·빌드할 때만** 필요한 패키지

위키는 빌드가 끝나면 HTML·CSS·JS 파일만 남고, nginx나 GitHub Pages는 그 파일을 그대로 보내 줄 뿐입니다. 서비스하는 순간에는 VitePress 패키지가 필요 없습니다(화면에 필요한 Vue 코드는 빌드 결과 JS 안에 이미 들어 있습니다). 그래서 셋 다 `devDependencies`입니다. 이 프로젝트에서 실제 설치 동작에는 차이가 없지만, "빌드 도구로만 쓴다"는 의도를 드러냅니다.

| 패키지 | 하는 일 |
|---|---|
| `vitepress` | 마크다운 → 사이트 빌드, 개발 서버 |
| `vue` | VitePress 테마와 우리가 만든 `.vue` 컴포넌트의 바탕 |
| `typescript` | 편집기(VS Code)와 `tsc`의 타입 검사. VitePress 빌드 자체는 타입 검사를 하지 않습니다([4-4](./04-curriculum)에서 실제로 확인) |

#### 왜 `^` 없이 정확한 버전을 썼나

`npm install vitepress`로 설치하면 보통 `"vitepress": "^1.6.3"`처럼 앞에 `^`(캐럿)이 붙습니다. `^`는 "**첫 번째 숫자(메이저 버전)가 같은 범위라면 더 새 버전도 괜찮다**"는 뜻입니다. 작성 시점(2026-10)에 npm에서 실제로 조회한 결과로 차이를 보면 이렇습니다.

```bash
npm view "typescript@^5.6.3" version
npm view "vue@^3.5.13" version
npm view typescript version
```

```text
...
typescript@5.9.3 '5.9.3'
...
vue@3.5.44 '3.5.44'
7.0.2
```

(앞의 두 명령은 범위에 맞는 버전을 여러 줄 출력하므로 가장 높은 마지막 줄만 옮겼습니다.)

- `^5.6.3`이었다면 새로 설치하는 사람은 5.6.3이 아니라 5.9.3을 받습니다.
- `^3.5.13`이었다면 3.5.44를 받습니다.
- `^`는 메이저를 넘지 않으므로 TypeScript 7.0.2까지 올라가지는 않습니다.
- 정확한 버전 `5.6.3`은 언제 설치해도 5.6.3입니다.

ts-wiki가 버전을 고정한 이유는 **문서 내용이 특정 버전에 맞춰 쓰였기 때문**입니다. 본문에 "VitePress 1.6.3 기준"이라고 적고 설명하는데, 받는 사람마다 다른 버전이 깔리면 화면이나 에러 메시지가 달라집니다. 또 빌드 도구는 작은 버전 차이로도 출력 HTML이 바뀔 수 있어, "어제 되던 빌드가 오늘 안 되는" 일을 막으려는 것입니다.

대신 고정한 버전은 **저절로 올라가지 않습니다.** 보안 수정이 담긴 새 버전(예: 작성 시점 vitepress 최신 1.6.4)이 나와도 직접 올려야 합니다. 실제로 작성 시점에 같은 버전의 vitepress·vue를 새 폴더에 설치하고 `npm audit`(알려진 보안 취약점 검사)을 실행했더니, 하위 패키지(`@vue/server-renderer`, `esbuild` 등)에서 5건(moderate 2, high 3)이 보고되었습니다. 위키는 빌드 결과인 정적 파일만 서비스하므로 이 도구들이 운영 서버에서 돌지는 않지만, 개발 서버를 `--host 0.0.0.0`으로 여는 PC에는 영향이 있을 수 있으니 주기적으로 `npm audit`을 확인하고 업데이트를 검토합니다. 올릴 때는 복사본에서 숫자를 바꾸고 `npm install` → `npm run build`로 확인한 뒤 반영합니다.

### 6단계: `package-lock.json`의 역할

`package.json`에는 직접 쓰는 패키지 3개만 있지만, 그 3개가 또 다른 패키지를 필요로 하고, 그것이 또… 이어집니다. lock 파일에 기록된 설치 항목을 세어 보면 이렇습니다.

```bash
grep -c '"node_modules/' package-lock.json
```

```text
183
```

3개를 적었는데 183개 항목이 설치된 것입니다. 예를 들어 VitePress 밑에서 일하는 Vite도 그중 하나입니다.

```bash
npm ls vite
```

```text
ts-wiki@1.0.0 D:\workspace\ts-wiki
`-- vitepress@1.6.3
  +-- @vitejs/plugin-vue@5.2.4
  | `-- vite@5.4.21 deduped
  `-- vite@5.4.21
```

`package-lock.json`은 이 183개 각각의 **정확한 버전, 내려받은 주소, 파일 지문(integrity)**을 기록합니다. VitePress 항목은 이렇게 생겼습니다(2519~2523줄).

```json:line-numbers=2519
    "node_modules/vitepress": {
      "version": "1.6.3",
      "resolved": "https://registry.npmjs.org/vitepress/-/vitepress-1.6.3.tgz",
      "integrity": "sha512-fCkfdOk8yRZT8GD9BFqusW3+GggWYZ/rYncOfmgcDtP3ualNHCAg+Robxp2/6xfH1WwPHtGpPwv7mbA3qomtBw==",
      "dev": true,
```

- `integrity`는 파일 내용으로 계산한 지문(해시)입니다. 내려받은 파일이 기록과 다르면 npm이 설치를 거부해, 중간에 파일이 바뀌는 사고를 막습니다.
- `package.json`에서 3개를 고정해도, 그 밑의 Vite 같은 패키지는 VitePress 쪽에서 범위로 적혀 있어 시간이 지나면 바뀔 수 있습니다. lock 파일이 이것까지 못 박아 줍니다.

#### `npm install`과 `npm ci`

| | `npm install` | `npm ci` |
|---|---|---|
| 기준 | `package.json`(범위 안에서 lock을 참고) | `package-lock.json` 그대로 |
| lock 파일 | 필요하면 고쳐 씀 | 고치지 않음. `package.json`과 안 맞으면 **실패** |
| `node_modules` | 있는 것을 고쳐 씀 | 지우고 처음부터 설치 |
| 쓰는 곳 | 내 PC에서 개발할 때 | Docker 빌드, GitHub Actions처럼 "항상 같은 결과"가 필요한 곳 |

그래서 ts-wiki의 `Dockerfile`과 `deploy.yml`은 `npm install`이 아니라 `npm ci`를 씁니다. 그리고 `npm ci`가 동작하려면 `package-lock.json`이 반드시 git에 들어 있어야 합니다(`.gitignore`에 없는 이유).

## ts-wiki에서는

- **`Dockerfile` 6~7줄**은 `package.json`과 `package-lock.json` **두 파일만 먼저 복사**하고 `npm ci`를 실행합니다.

  ```dockerfile:line-numbers=6
  COPY package.json package-lock.json ./
  RUN npm ci
  ```

  문서만 고쳤을 때는 이 두 파일이 그대로이므로, Docker가 이 단계의 결과(설치된 `node_modules`)를 캐시에서 재사용해 빌드가 빨라집니다. 원리는 [Docker 이미지로 묶기](../part6-serve/03-docker-nginx)에서 다룹니다.
- **`deploy.yml` 25~30줄**은 Node 22를 준비하고(`cache: npm`으로 내려받은 패키지를 캐시), `npm ci` → `npm run build`를 실행합니다. GitHub의 서버도 우리가 쓰는 것과 똑같은 `scripts.build`를 실행하는 것입니다.
- **`README.md` 18줄**의 "같은 네트워크의 다른 PC에서는 `http://<이 PC의 IP>:5180` 으로 접속합니다"가 바로 `--host 0.0.0.0` 덕분입니다.
- 이 가이드(wiki-server-guide)의 `package.json`도 거의 같고 포트만 5181입니다. 두 위키를 동시에 켜 두고 비교하며 공부할 수 있게 한 것입니다.

## 자주 하는 실수

### 1. `vitepress` 명령을 찾을 수 없다는 오류

- **증상**: 터미널에 `vitepress dev docs`를 직접 쳤더니 "인식되지 않는 명령", `command not found` 같은 오류가 납니다.
- **원인**: `vitepress`는 `node_modules/.bin` 안에 있고, 이 경로는 `npm run`으로 실행할 때만 PATH에 붙습니다.
- **해결**: `npm run dev`로 실행하거나, 직접 치고 싶으면 `npx vitepress dev docs`처럼 `npx`를 앞에 붙입니다. `npm install`을 안 했다면 먼저 합니다.

### 2. `npm ci`가 lock 파일과 맞지 않는다며 실패

- **증상**: `npm ci`가 `package.json`과 `package-lock.json`이 일치하지 않는다(`in sync`가 아니다)는 오류로 멈춥니다.
- **원인**: `package.json`의 버전을 손으로 바꾸고 `npm install`을 안 해서 lock 파일이 옛 내용 그대로입니다.
- **해결**: 내 PC에서 `npm install`을 실행해 lock 파일을 갱신하고, `package.json`과 `package-lock.json`을 **함께** 커밋합니다.

### 3. 다른 PC에서 접속이 안 됨

- **증상**: 내 PC의 `localhost:5180`은 열리는데 휴대폰에서 `http://<이 PC의 IP>:5180`이 안 열립니다.
- **원인**: (1) `--host` 없이 실행했거나, (2) Windows 방화벽이 Node.js의 들어오는 연결을 막고 있거나, (3) 휴대폰이 다른 네트워크(모바일 데이터)에 있습니다.
- **해결**: 터미널에 `Network: http://...` 줄이 있는지 먼저 봅니다. 있다면 같은 와이파이인지, 방화벽이 허용하는지 확인합니다. 회사 PC의 방화벽 설정은 관리자에게 문의합니다.

### 4. 주소가 5181·5182로 바뀌어 있음

- **증상**: 수정이 반영되지 않는 것 같습니다.
- **원인**: 5180이 이미 쓰이고 있어서(예: 다른 터미널에 켜 둔 ts-wiki) 다음 포트로 넘어갔습니다.
- **해결**: 터미널의 `Port 5180 is in use, trying another one...` 메시지와 Local 주소를 확인하고, 안 쓰는 서버는 `Ctrl+C`로 끕니다.

## 직접 해 보기

### 과제 1 ⭐ 스크립트 목록 보기

복사본에서 `npm run`을 실행해 스크립트 4개가 보이는지 확인하세요.

::: details 정답 보기
4단계의 출력과 같아야 합니다. 안 보이면 `package.json`이 있는 폴더(프로젝트 맨 위)에서 실행했는지 확인합니다.
:::

### 과제 2 ⭐⭐ 포트 바꾸기

복사본의 `scripts.dev`를 고쳐 5190번 포트로 띄워 보세요. 원본은 고치지 않습니다.

::: details 정답 보기
```json
"dev": "vitepress dev docs --host 0.0.0.0 --port 5190",
```

`npm run dev` 후 `Local: http://localhost:5190/`이 보이면 성공입니다. 파일을 고치지 않고 한 번만 바꾸고 싶다면 `npx vitepress dev docs --port 5190`도 됩니다.
:::

### 과제 3 ⭐⭐ 버전 범위 조회

`npm view "vitepress@^1.6.3" version`을 실행해, `^`였다면 지금 어떤 버전이 설치될지 확인하세요.

::: details 정답 보기
작성 시점(2026-10)에는 `vitepress@1.6.3 '1.6.3'`, `vitepress@1.6.4 '1.6.4'` 두 줄이 나왔습니다. 범위에 맞는 가장 높은 버전(1.6.4)이 설치됩니다. 실행하는 시점에는 더 새 버전이 있을 수 있습니다.
:::

### 과제 4 ⭐⭐⭐ type 실험

스크래치 폴더에 `package.json`(`{"name":"t"}`)과 `x.js`(3단계 코드)를 만들어 실행하고, 경고를 확인한 뒤 `"type": "module"`을 넣어 경고가 사라지는지 보세요. 이어서 `x.js`를 `x.cjs`로 바꾸면 어떻게 되는지도 확인하세요.

::: details 힌트
`.cjs`는 확장자가 CommonJS를 강제하므로 `import` 문에서 `SyntaxError`가 납니다. 확장자(`.mjs`/`.cjs`)가 `type` 필드보다 우선한다는 것을 확인하는 실험입니다.
:::

## 확인 퀴즈

1. `"private": true`를 지우면 무엇이 위험해지나요?
2. `npm run build`는 실제로 어떤 명령을 실행하나요?
3. `--host 0.0.0.0`을 빼면 무엇이 달라지나요?
4. `"vue": "^3.5.13"`과 `"vue": "3.5.13"`의 차이는?
5. Docker·Actions에서 `npm install` 대신 `npm ci`를 쓰는 이유는?

::: details 정답 보기
1. 실수로 `npm publish`를 하면 npm 공개 저장소에 올라갈 수 있습니다.
2. `vitepress build docs`
3. 이 PC 안(localhost)에서만 접속할 수 있고, 다른 PC·휴대폰에서는 접속할 수 없습니다.
4. `^`는 3.x 범위의 더 새 버전(작성 시점 3.5.44)도 설치될 수 있고, 정확한 버전은 항상 3.5.13입니다.
5. `package-lock.json`을 그대로 따라 항상 같은 버전 조합을 설치하고, lock과 맞지 않으면 실패해서 문제를 일찍 드러내기 때문입니다.
:::

## 정리

- `package.json`은 이름표(`name`, `version`, `private`), 모듈 방식(`type`), 단축 명령(`scripts`), 재료 목록(`devDependencies`)으로 이루어집니다.
- `"type": "module"`은 `.js` 파일을 ESM으로 읽게 해 프로젝트 전체의 모듈 방식을 통일합니다.
- `npm run 이름`은 `node_modules/.bin`을 PATH에 붙인 뒤 `scripts`의 문자열을 실행합니다.
- `--host 0.0.0.0`은 다른 기기의 접속을 허용하고, `--port`는 다른 프로젝트와 포트가 겹치지 않게 합니다.
- 버전을 정확히 고정하고 `package-lock.json`을 커밋하면 누가 언제 설치해도 같은 결과가 나옵니다. 대신 업데이트는 직접 해야 합니다.

## 다음 단계

[config.mts 한 줄씩 읽기](./03-config)에서 `vitepress dev docs`가 가장 먼저 읽는 사이트 설정 파일 83줄을 해부하고, 옵션을 바꿔 빌드 결과를 비교합니다.
