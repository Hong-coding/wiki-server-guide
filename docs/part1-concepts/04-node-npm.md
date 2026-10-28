---
title: 'Node.js와 npm: 패키지와 스크립트'
---

# Node.js와 npm: 패키지와 스크립트

<LessonMeta level="입문" :minutes="45" prev="localhost·포트·0.0.0.0의 차이와 포트를 쓰는 프로그램 찾기" />

## 이번에 배울 것

- Node.js가 무엇이고(런타임), 왜 위키를 만드는 데 필요한지 설명할 수 있다.
- `package.json`의 `scripts`, `dependencies`, `devDependencies`를 읽을 수 있다.
- `node_modules`와 `package-lock.json`이 각각 무엇이고, 왜 하나는 Git에 올리고 하나는 올리지 않는지 안다.
- `npm install`과 `npm ci`의 차이를 알고 상황에 맞게 고를 수 있다.
- `npm run`과 `npx`가 각각 무엇을 실행하는지 설명할 수 있다.

## 먼저 알아 둘 것

- Node.js와 npm 설치: [준비물 설치](../part0-start/03-setup)
- 터미널에서 폴더 이동(`cd`)과 현재 위치 확인(`pwd`): [서버 구축을 공부하는 법](../part0-start/02-how-to-study)

## 비유로 이해하기

**한빛 카페의 주방**을 떠올려 봅시다.

| 주방 | Node.js 프로젝트 |
|---|---|
| 가스레인지(불) | **Node.js** — JavaScript를 실행하는 런타임 |
| 레시피 카드(필요한 재료 목록 + 조리 순서 이름) | **`package.json`** — 필요한 패키지와 `scripts` |
| 식자재 도매상 | **npm 레지스트리**(registry.npmjs.org) — 패키지를 내려받는 곳 |
| 도매상에 주문해 주는 직원 | **`npm`** 명령 |
| 냉장고에 채워진 실제 재료 | **`node_modules`** 폴더 |
| "지난번에 받은 재료의 정확한 상표·용량·납품서 번호" 장부 | **`package-lock.json`** |
| "주문 없이 도매상 시식 코너에서 한 번 써 보기" | **`npx`** |

레시피 카드(`package.json`)에는 "토마토 1kg 이상"처럼 **대략적인 조건**이 적혀 있고, 장부(`package-lock.json`)에는 "○○농장 토마토 1.2kg, 납품서 번호 …"처럼 **실제로 받은 것**이 적혀 있습니다. 다른 지점에서 같은 맛을 내려면 레시피 카드보다 **장부대로** 재료를 받아야 합니다. 이것이 `npm ci`입니다.

## 개념 설명

### Node.js: 브라우저 밖의 JavaScript 실행기

JavaScript는 원래 브라우저 안에서만 실행되는 언어였습니다. **Node.js**는 JavaScript를 브라우저 밖, 즉 내 PC나 서버에서 실행해 주는 프로그램입니다. 이런 "언어를 실행해 주는 환경"을 **런타임**(runtime)이라고 합니다.

```powershell
node -e "console.log('안녕하세요, Node.js ' + process.version)"
node -p "process.platform"
```

```text
안녕하세요, Node.js v24.13.1
win32
```

`-e`는 "뒤의 코드를 실행", `-p`는 "실행하고 결과를 출력"입니다. `process.platform`이 `win32`인 것은 브라우저에는 없는, **운영체제 정보에 접근하는 능력**입니다. Node.js는 이렇게 파일 읽고 쓰기, 네트워크 서버 열기, 다른 프로그램 실행 같은 일을 할 수 있습니다. [정적 사이트와 동적 서버](./02-static-vs-dynamic)에서 `node server.mjs`로 서버를 띄운 것도, VitePress가 마크다운 파일을 읽어 HTML 파일로 쓰는 것도 이 능력 덕분입니다.

ts-wiki에서 Node.js의 역할은 두 가지입니다.

1. **빌드 도구를 실행합니다.** VitePress는 JavaScript로 만든 프로그램이라 Node.js 위에서 돌아갑니다.
2. **개발 서버를 실행합니다.** `npm run dev`로 뜨는 서버도 Node.js 프로그램입니다.

반대로 **완성된 사이트를 서비스할 때는 Node.js가 필요 없습니다.** nginx나 GitHub Pages가 HTML 파일을 보내기만 하면 되기 때문입니다(지난 두 레슨의 "정적 사이트" 이야기).

### npm과 패키지

**패키지**(package)는 다른 사람이 만들어 공개한 코드 묶음입니다. VitePress, Vue, TypeScript 모두 패키지입니다. **npm**(Node Package Manager)은 이런 패키지를 레지스트리에서 내려받고, 버전을 관리하고, 프로젝트의 스크립트를 실행하는 도구입니다. Node.js를 설치하면 함께 설치됩니다.

### package.json: 프로젝트의 레시피 카드

빈 폴더에서 `package.json`을 만들어 봅니다. (실습 폴더에서 합니다.)

```bash
mkdir npm-demo
cd npm-demo
npm init -y
```

`-y`는 "질문하지 말고 기본값으로"라는 뜻입니다. 실제 출력:

```text
Wrote to C:\practice\npm-demo\package.json:

{
  "name": "npm-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs"
}
```

(경로는 실행한 폴더에 따라 다릅니다.) 지금 알아 둘 항목은 셋입니다.

- `name`, `version`: 프로젝트 이름과 버전
- `scripts`: **이름 붙인 명령 모음**. `npm run <이름>`으로 실행합니다.
- `type`: 이 프로젝트의 `.js` 파일을 어떤 모듈 문법으로 읽을지. `commonjs`는 옛 방식(`require`), `module`은 새 방식(`import`)입니다.

### 패키지 설치: npm install

작은 패키지 하나(`picocolors`, 터미널 글자에 색을 입히는 패키지)를 설치해 봅니다.

```bash
npm install picocolors@1.1.1
```

```text
added 1 package, and audited 2 packages in 2s

found 0 vulnerabilities
```

폴더를 보면 두 가지가 새로 생겼습니다.

```bash
ls
```

```text
node_modules
package-lock.json
package.json
```

`package.json`에는 이런 줄이 추가되었습니다.

```json
  "dependencies": {
    "picocolors": "^1.1.1"
  }
```

`^1.1.1`의 `^`(캐럿)는 "1.1.1 이상이면서 **앞자리 1은 그대로**인 버전이면 괜찮다"는 뜻입니다. 즉 1.2.0, 1.9.3은 괜찮지만 2.0.0은 안 됩니다. 버전 번호 `주.부.수`에서 앞자리(주 버전)가 바뀌면 사용법이 바뀔 수 있다는 약속(**시맨틱 버저닝**, semver)을 따르기 때문입니다.

설치한 패키지를 써 봅니다. `hello.js`를 만듭니다.

```js
const pc = require('picocolors')
console.log(pc.green('한빛 카페 위키 빌드 완료'))
```

```bash
node hello.js
```

```text
한빛 카페 위키 빌드 완료
```

(터미널에서는 초록색으로 보입니다.) `require('picocolors')`는 `node_modules/picocolors` 폴더에서 코드를 찾아옵니다.

### node_modules: 실제 재료가 든 냉장고

`node_modules`는 내려받은 패키지가 실제로 들어 있는 폴더입니다. 패키지는 다른 패키지를 필요로 하고, 그 패키지는 또 다른 패키지를 필요로 하기 때문에 금방 커집니다. ts-wiki의 경우 `package.json`에 적힌 패키지는 3개뿐인데, 실습용 복사본에서 설치해 보면 이렇습니다.

```text
added 136 packages, and audited 137 packages in 37s
```

- `node_modules` 바로 아래 폴더: 76개
- 전체 크기: 약 120MB

그래서 `node_modules`는 **Git에 올리지 않습니다.** 크기도 크고, `package.json`과 `package-lock.json`만 있으면 언제든 똑같이 다시 받을 수 있기 때문입니다.

### package-lock.json: 실제로 받은 것의 장부

`package-lock.json`은 `npm install`이 **실제로 설치한 정확한 버전과 출처**를 기록한 파일입니다.

```json
{
  "name": "npm-demo",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "npm-demo",
      "version": "1.0.0",
      "license": "ISC",
      "dependencies": {
        "picocolors": "^1.1.1"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    }
```

- `version`: 정확히 1.1.1을 받았다.
- `resolved`: 어디서 받았다.
- `integrity`: 받은 파일의 지문. 다음에 받을 때 내용이 한 글자라도 다르면 설치를 거부합니다.

`package.json`이 "1.x면 아무거나"라고 허용해도, `package-lock.json`이 있으면 **모두가 같은 버전**을 받습니다. 그래서 이 파일은 **Git에 꼭 올립니다.**

| 파일·폴더 | 누가 만드나 | Git에 올리나 | 이유 |
|---|---|---|---|
| `package.json` | 사람(+npm) | 올림 | 프로젝트에 무엇이 필요한지의 기준 |
| `package-lock.json` | npm | **올림** | 모두가 정확히 같은 버전을 받게 하려고 |
| `node_modules/` | npm | **올리지 않음** | 크고, 위 두 파일로 언제든 재생성 가능 |

### npm install vs npm ci

둘 다 패키지를 설치하지만 성격이 다릅니다.

| | `npm install` | `npm ci` |
|---|---|---|
| 기준 | `package.json` (허용 범위 안에서 버전을 고를 수 있음) | **`package-lock.json`에 적힌 그대로** |
| lock 파일 | 필요하면 **고쳐 씀** | 절대 고치지 않음. 없으면 실패 |
| `package.json`과 lock이 안 맞으면 | lock을 맞춰 고침 | **실패** |
| 기존 `node_modules` | 있는 것을 활용 | 지우고 처음부터 설치(npm 공식 문서 기준) |
| 쓰는 때 | 패키지를 새로 추가·변경할 때, 개발 중 | **CI·Docker·배포 빌드**, 처음 받은 프로젝트를 정확히 재현할 때 |

`ci`는 **Continuous Integration**(지속적 통합, 자동 빌드·검사 환경)의 줄임말입니다. 자동 빌드에서는 "어제와 오늘 같은 결과"가 가장 중요하므로 `npm ci`를 씁니다.

`npm ci`의 엄격함을 직접 확인해 봅니다.

**lock 파일이 없을 때** (`npm init -y` 직후의 폴더에서):

```text
npm error code EUSAGE
npm error
npm error The `npm ci` command can only install with an existing package-lock.json or
npm error npm-shrinkwrap.json with lockfileVersion >= 1. Run an install with npm@5 or
npm error later to generate a package-lock.json file, then try again.
```

**package.json에 lock에 없는 패키지를 적어 넣었을 때** (`dependencies`에 `"nanoid": "^5.0.0"`을 손으로 추가한 뒤):

```text
npm error code EUSAGE
npm error
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error
npm error Missing: nanoid@5.1.16 from lock file
```

"두 파일이 맞지 않으니 먼저 `npm install`로 lock을 갱신하라"고 알려 줍니다. 자동 빌드가 이렇게 **멈춰 주는 것**이 오히려 안전합니다. 누군가 lock 파일 커밋을 빠뜨렸다는 것을 배포 전에 알 수 있기 때문입니다.

### scripts와 npm run

`scripts`는 긴 명령에 짧은 이름을 붙여 두는 곳입니다.

```bash
npm pkg set scripts.hello="node hello.js"
npm run hello
```

```text
> npm-demo@1.0.0 hello
> node hello.js

한빛 카페 위키 빌드 완료
```

`>`로 시작하는 두 줄이 "이 스크립트를 실행합니다, 실제 명령은 이것입니다"라는 npm의 안내입니다. 로그를 읽을 때 이 줄로 **실제로 무엇이 실행됐는지** 확인할 수 있습니다. (`npm pkg set`은 `package.json`을 명령으로 고치는 방법이고, VS Code에서 직접 고쳐도 같습니다.)

인자 없이 `npm run`만 치면 쓸 수 있는 스크립트 목록이 나옵니다. ts-wiki 복사본에서 실행한 실제 출력입니다.

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

여기서 궁금한 점이 하나 생깁니다. 터미널에서 그냥 `vitepress`를 치면 "인식되지 않는 명령"이라고 나오는데, 스크립트 안에서는 왜 될까요? `npm run`은 실행하는 동안 **`node_modules/.bin` 폴더를 명령 검색 경로(PATH)에 잠시 추가**하기 때문입니다. 이 폴더에는 패키지가 제공하는 명령 파일이 들어 있습니다.

```bash
ls node_modules/.bin
```

```text
esbuild
esbuild.cmd
esbuild.ps1
...
tsc
tsc.cmd
tsc.ps1
...
vite
vite.cmd
...
```

(Windows에서는 같은 명령이 `.cmd`, `.ps1` 버전으로도 들어 있습니다.)

### npx: 설치된(또는 안 된) 패키지의 명령을 바로 실행

`npx`는 패키지의 명령을 **스크립트로 등록하지 않고 바로** 실행합니다. 먼저 프로젝트의 `node_modules/.bin`에서 찾고, 없으면 레지스트리에서 임시로 받아 실행합니다(받기 전에 확인을 묻습니다).

```bash
npx tsc --version
```

```text
Version 5.6.3
```

ts-wiki 복사본에서 실행했기 때문에, 프로젝트에 설치된 TypeScript 5.6.3이 실행되었습니다. 지난 레슨들에서 `npx vitepress preview docs --port 5191`처럼 포트를 바꿔 실행한 것도 `npx` 덕분입니다. `npm run preview`는 `package.json`에 적힌 5180 포트로 고정이지만, `npx`로 직접 부르면 옵션을 자유롭게 줄 수 있습니다.

::: warning npx로 처음 보는 패키지를 실행할 때
`npx 패키지이름`은 프로젝트에 없는 패키지라면 인터넷에서 받아 **바로 실행**합니다. 이름을 한 글자만 틀려도 엉뚱한(악성일 수도 있는) 패키지를 실행할 수 있습니다. 처음 쓰는 패키지는 이름과 게시자를 npm 사이트에서 확인한 뒤 실행하고, `Need to install the following packages:`라는 확인 질문이 나오면 이름을 다시 읽어 봅니다.
:::

## ts-wiki에서는

### package.json 전체

```json
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

이 레슨에서 배운 것으로 읽어 보면:

- `"private": true`: npm 레지스트리에 실수로 공개(publish)되지 않게 막는 설정입니다. 위키는 남이 설치해 쓸 패키지가 아니니까요.
- `"type": "module"`: 이 프로젝트의 `.js`는 `import` 문법으로 읽습니다. `scripts/fix-frontmatter.mjs`, `config.mts`처럼 확장자로 모듈 방식을 밝힌 파일도 있습니다.
- `scripts`: 개발 서버(`dev`), 빌드(`build`), 미리보기(`preview`), 그리고 보조 스크립트(`fix:frontmatter`). 앞의 셋은 `node_modules/.bin`의 `vitepress` 명령을, 마지막은 Node.js로 직접 `.mjs` 파일을 실행합니다.
- `devDependencies`만 있고 `dependencies`가 없습니다. `devDependencies`는 "만들 때(개발·빌드할 때)만 필요한 패키지"입니다. ts-wiki의 최종 결과물은 HTML 파일이라 **실행할 때 필요한 패키지가 하나도 없습니다.** 정적 사이트다운 구성입니다.
- 버전에 `^`가 **없습니다**(`"1.6.3"`). 허용 범위 없이 정확히 그 버전만 쓰겠다는 뜻입니다. lock 파일이 있어도 한 번 더 고정해, `npm install`을 다시 하더라도 VitePress가 몰래 올라가지 않게 했습니다.

복사본에서 설치된 최상위 패키지를 확인하면 이 버전들이 그대로 나옵니다.

```bash
npm ls --depth=0
```

```text
ts-wiki@1.0.0 C:\practice\ts-wiki-practice
+-- typescript@5.6.3
+-- vitepress@1.6.3
`-- vue@3.5.13
```

### Docker와 GitHub Actions는 npm ci를 쓴다

`Dockerfile`:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
```

`.github/workflows/deploy.yml`의 29~30번째 줄:

```yaml
      - run: npm ci
      - run: npm run build
```

자동 빌드 두 곳 모두 `npm install`이 아니라 `npm ci`입니다. 내 PC에서 확인한 것과 **정확히 같은 버전**으로 빌드하기 위해서입니다. `Dockerfile`이 `package.json`과 `package-lock.json`만 **먼저** 복사하고 `npm ci`를 한 뒤 나머지 파일을 복사하는 순서에도 이유가 있는데(Docker의 캐시 활용), [Docker 이미지로 묶기](../part6-serve/03-docker-nginx)에서 설명합니다.

### node_modules는 어디에도 따라가지 않는다

`.gitignore`의 첫 줄과 `.dockerignore`의 첫 줄이 모두 `node_modules`입니다.

```text
node_modules/
```

```text
node_modules
```

GitHub에도 올라가지 않고, Docker 이미지를 만들 때 복사되지도 않습니다. 어디서든 `package-lock.json`을 보고 `npm ci`로 새로 받습니다. 특히 Docker 쪽은 중요합니다. Windows PC의 `node_modules`에는 Windows용 실행 파일(예: `esbuild`의 Windows 바이너리)이 들어 있어서, 리눅스 컨테이너에 그대로 복사하면 동작하지 않을 수 있기 때문입니다.

## 자주 하는 실수

### 1. 프로젝트 밖에서 npm 명령을 실행한다

- **증상**: `npm error code ENOENT` … `Could not read package.json: Error: ENOENT: no such file or directory`
- **원인**: `package.json`이 없는 폴더에서 `npm run dev`나 `npm install`을 실행했습니다.
- **해결**: `pwd`로 위치를 확인하고, `package.json`이 있는 폴더로 `cd`합니다.

### 2. 없는 스크립트 이름을 실행한다

- **증상**: `npm error Missing script: "hello"`
- **원인**: `package.json`의 `scripts`에 그 이름이 없습니다. 오타(`npm run devv`)이거나 다른 프로젝트의 스크립트 이름을 썼습니다.
- **해결**: `npm run`만 입력해 목록을 보고 정확한 이름으로 실행합니다.

### 3. package-lock.json을 지우거나 커밋하지 않는다

- **증상**: GitHub Actions나 Docker 빌드에서 `npm ci`가 `can only install packages when your package.json and package-lock.json ... are in sync` 또는 `can only install with an existing package-lock.json`으로 실패합니다.
- **원인**: 패키지를 추가하면서 바뀐 `package-lock.json`을 커밋하지 않았거나, 파일을 지웠습니다.
- **해결**: 내 PC에서 `npm install`로 lock 파일을 맞춘 뒤, `package.json`과 `package-lock.json`을 **함께** 커밋합니다.

### 4. npx vitepress --version으로 버전을 보려다 서버가 뜬다

- **증상**: 버전만 보려고 `npx vitepress --version`을 쳤는데 `Port 5173 is in use, trying another one...`과 함께 개발 서버가 떠 버립니다.
- **원인**: VitePress 1.6.3에서 이 명령은 버전 출력이 아니라 기본 동작(개발 서버 시작)으로 이어졌습니다. 작성 시점에 실제로 겪은 일입니다. 도구마다 버전 옵션 이름이 다릅니다.
- **해결**: 떠 버린 서버는 `Ctrl+C`로 끕니다. 설치된 버전은 `npm ls vitepress`나 `npm ls --depth=0`으로 확인하는 것이 확실합니다. VitePress는 서버를 켤 때 로그 첫 줄(`vitepress v1.6.3`)에도 버전을 보여 줍니다.

### 5. node_modules를 압축해서 전달하거나 Docker에 복사한다

- **증상**: 다른 PC나 컨테이너에서 실행했더니 `esbuild` 관련 에러 등 플랫폼이 맞지 않는다는 메시지가 나옵니다.
- **원인**: `node_modules` 안에는 운영체제별 실행 파일이 섞여 있습니다.
- **해결**: `node_modules`는 옮기지 않고, 받는 쪽에서 `npm ci`로 새로 설치합니다.

## 직접 해 보기

### 과제 1 ⭐ 나만의 스크립트

`npm-demo` 폴더의 `package.json`에 `"greet": "node -e \"console.log('어서 오세요, 한빛 카페입니다')\""` 스크립트를 추가하고 `npm run greet`로 실행해 봅니다.

::: details 정답 보기
VS Code로 `package.json`을 열어 `scripts` 안에 한 줄을 추가합니다(앞 줄 끝에 쉼표를 잊지 않습니다). 실행하면 `> npm-demo@1.0.0 greet`와 실제 명령 줄이 먼저 나오고, 그 아래에 `어서 오세요, 한빛 카페입니다`가 출력됩니다.
:::

### 과제 2 ⭐ 지우고 다시 받기

`npm-demo`에서 `node_modules` 폴더를 지운 뒤 `node hello.js`를 실행해 에러를 보고, `npm ci`로 다시 설치한 뒤 다시 실행해 봅니다.

::: details 정답 보기
`node_modules`가 없으면 `Error: Cannot find module 'picocolors'`가 나옵니다. `npm ci`가 `package-lock.json`대로 picocolors 1.1.1을 다시 받아 오면 정상 실행됩니다. `node_modules`를 Git에 올리지 않아도 되는 이유를 직접 확인한 것입니다.
:::

### 과제 3 ⭐⭐ ci가 멈추는 순간

`npm-demo`의 `package.json`을 백업해 두고, `dependencies`에 lock에 없는 패키지를 손으로 적어 넣은 뒤 `npm ci`를 실행합니다. 에러 메시지에서 원인과 해결 방법을 찾아 적고, 백업으로 되돌립니다.

::: details 정답 보기
`npm ci can only install packages when your package.json and package-lock.json ... are in sync`와 `Missing: <패키지>@<버전> from lock file`이 나옵니다. 해결 방법은 메시지에 있는 대로 `npm install`로 lock 파일을 갱신하는 것입니다. 실습이 끝나면 백업한 `package.json`으로 되돌리고 `npm ci`가 다시 성공하는지 확인합니다.
:::

### 과제 4 ⭐⭐⭐ ts-wiki의 스크립트를 npx로 바꿔 실행

ts-wiki 실습용 복사본에서 `npm run dev`와 **같은 일을 하되 포트만 5195로** 바꿔 실행하는 명령을 `npx`로 만들어 봅니다.

::: details 정답 보기
```bash
npx vitepress dev docs --host 0.0.0.0 --port 5195
```

`package.json`의 `dev` 스크립트 내용에서 포트만 바꾼 것입니다. 로그의 `Local:` 주소가 `5195`인지 확인하고, 끝나면 `Ctrl+C`로 끕니다. (포트가 이미 사용 중이면 다음 번호로 밀려나니 로그를 꼭 읽습니다.)
:::

## 확인 퀴즈

1. Node.js가 없으면 ts-wiki의 무엇을 할 수 없나요? 완성된 사이트를 nginx로 서비스하는 데도 Node.js가 필요한가요?
2. `package-lock.json`과 `node_modules` 중 Git에 올리는 것은?
3. Docker 빌드에서 `npm install` 대신 `npm ci`를 쓰는 이유는?
4. 터미널에서 `vitepress`는 인식되지 않는데 `npm run dev`는 되는 이유는?
5. ts-wiki의 `package.json`에 `dependencies`가 없고 `devDependencies`만 있는 이유는?

::: details 정답 보기
1. 개발 서버와 빌드를 할 수 없습니다. 완성된 HTML을 nginx로 서비스할 때는 필요 없습니다.
2. `package-lock.json`입니다. `node_modules`는 올리지 않습니다.
3. lock 파일에 적힌 정확한 버전으로 설치해 언제나 같은 결과를 얻기 위해서이고, lock 파일이 안 맞으면 멈춰서 문제를 일찍 알려 주기 때문입니다.
4. `npm run`이 실행하는 동안 `node_modules/.bin`을 명령 검색 경로에 추가하기 때문입니다.
5. 결과물이 정적 HTML이라 실행할 때 필요한 패키지가 없고, VitePress·Vue·TypeScript는 빌드할 때만 필요하기 때문입니다.
:::

## 정리

- **Node.js**는 JavaScript 런타임이고, ts-wiki에서는 빌드와 개발 서버에만 쓰입니다. 완성된 사이트 서비스에는 필요 없습니다.
- **`package.json`**은 필요한 패키지와 `scripts`의 기준, **`package-lock.json`**은 실제 설치 버전의 장부(Git에 올림), **`node_modules`**는 실제 패키지(Git에 올리지 않음)입니다.
- **`npm install`**은 개발 중 패키지를 추가·변경할 때, **`npm ci`**는 lock 그대로 정확히 재현할 때(CI·Docker) 씁니다.
- **`npm run <이름>`**은 `scripts`를 실행하며, `node_modules/.bin`의 명령을 쓸 수 있게 해 줍니다. **`npx`**는 패키지 명령을 바로 실행합니다.
- ts-wiki는 정확한 버전(`"1.6.3"`)을 `devDependencies`에만 두고, 자동 빌드는 모두 `npm ci`를 씁니다.

## 다음 단계

[정적 사이트 생성기(SSG)와 빌드](./05-ssg)에서 `npm run build`가 정확히 무엇을 만드는지, 20줄짜리 생성기를 직접 만들어 보며 이해합니다.
