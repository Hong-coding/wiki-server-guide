---
title: 빈 폴더에서 VitePress 시작하기
---

# 빈 폴더에서 VitePress 시작하기

<LessonMeta level="중급" :minutes="40" prev="ts-wiki의 모든 파일이 왜 거기 있는지 한 줄씩 읽었다" />

## 이번에 배울 것

- 빈 폴더를 npm 프로젝트로 만들 수 있다(`npm init -y`).
- VitePress·Vue·TypeScript를 **정확한 버전으로 고정해** 설치하고, 왜 고정하는지 설명할 수 있다.
- `package.json`에 `dev`·`build`·`preview` 스크립트를 적고 그 뜻을 말할 수 있다.
- 마크다운 파일 하나로 첫 페이지를 만들고 개발 서버(포트 5190)로 띄워 브라우저에서 확인할 수 있다.
- `npx vitepress init` 마법사가 무엇을 해 주는지 알고, 손으로 만드는 방법과 비교할 수 있다.

## 먼저 알아 둘 것

- Node.js와 npm이 설치되어 있어야 합니다: [준비물 설치](../part0-start/03-setup)
- npm·패키지·스크립트라는 말이 낯설다면: [Node.js와 npm: 패키지와 스크립트](../part1-concepts/04-node-npm)
- 포트·localhost가 낯설다면: [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host)

## 비유로 이해하기

새 가게를 연다고 생각해 봅시다.

1. **빈 상가 계약** — `mkdir my-wiki`: 빈 공간(폴더)을 하나 마련합니다.
2. **사업자 등록** — `npm init -y`: "이곳은 npm 프로젝트입니다"라는 등록증(`package.json`)을 붙입니다. 이름, 버전, 쓰는 도구 목록이 여기에 적힙니다.
3. **장비 들여오기** — `npm install`: 가게에 필요한 기계(VitePress 등)를 들여옵니다. 기계는 창고(`node_modules`)에 쌓이고, 등록증에 "이 기계, 이 모델 번호"가 적힙니다. 모델 번호를 정확히 적어 두어야 2호점을 낼 때 **똑같은 기계**를 들여올 수 있습니다.
4. **업무 매뉴얼** — `scripts`: "개점할 때는 이 버튼(`npm run dev`)을 누른다"를 적어 둡니다.
5. **첫 상품 진열** — `docs/index.md`: 손님(브라우저)에게 보여 줄 첫 페이지입니다.
6. **가오픈** — `npm run dev`: 내 컴퓨터 안에서만 문을 열고(포트 5190) 직접 들어가 봅니다.

## 따라 하기

### 1단계. 작업 폴더 만들기

터미널을 열고 실습 폴더를 둘 곳으로 이동한 뒤 `my-wiki` 폴더를 만듭니다. 위치는 어디든 괜찮지만, **경로에 한글·공백이 없는 곳**을 권합니다(일부 도구가 경로를 잘못 읽는 일을 피하려는 것입니다).

```powershell
# Windows (PowerShell) — 예: D 드라이브의 workspace 폴더
cd D:\workspace
mkdir my-wiki
cd my-wiki
```

```bash
# macOS / Linux
cd ~/workspace
mkdir my-wiki
cd my-wiki
```

**확인 방법**: `pwd`(PowerShell·bash 모두 동작)를 쳤을 때 마지막이 `my-wiki`로 끝나면 성공입니다. 이 레슨의 나머지 명령은 모두 이 폴더에서 실행합니다.

### 2단계. npm 프로젝트로 만들기: `npm init -y`

```bash
npm init -y
```

실제 출력(경로는 줄였습니다):

```text
Wrote to ...\my-wiki\package.json:

{
  "name": "my-wiki",
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

- `npm init`은 원래 이름·버전·설명 등을 하나씩 물어봅니다. `-y`(yes)는 "전부 기본값으로 해 줘"라는 뜻입니다.
- `name`은 폴더 이름을 그대로 가져왔습니다.
- `"type": "commonjs"`는 npm 11에서 기본으로 들어가는 줄입니다(작성 시점 npm 11.8.0 기준). 이 값은 4단계에서 ts-wiki와 같은 `"module"`로 바꿉니다.

**확인 방법**: 폴더에 `package.json` 파일 하나가 생겼으면 성공입니다.

### 3단계. VitePress 설치하기 (버전 고정)

```bash
npm install -D -E vitepress@1.6.3 vue@3.5.13 typescript@5.6.3
```

처음 설치는 인터넷 속도에 따라 1분 안팎 걸립니다. 실제 출력:

```text
added 136 packages, and audited 137 packages in 1m

37 packages are looking for funding
  run `npm fund` for details

5 vulnerabilities (2 moderate, 3 high)
...
```

명령을 한 조각씩 풀어 보겠습니다.

| 조각 | 뜻 |
|---|---|
| `npm install` | 패키지를 내려받아 `node_modules`에 넣고 `package.json`에 기록합니다. |
| `-D` | `--save-dev`의 줄임. "개발할 때만 쓰는 도구"(devDependencies)로 기록합니다. 위키는 빌드가 끝나면 HTML만 남으므로, VitePress는 실행 중인 서비스가 아니라 **만드는 도구**입니다. |
| `-E` | `--save-exact`의 줄임. 버전을 `^1.6.3`이 아니라 `1.6.3` **그대로** 적습니다. |
| `vitepress@1.6.3` | 위키 엔진. `@` 뒤는 버전입니다. |
| `vue@3.5.13` | VitePress가 화면을 그릴 때 쓰는 UI 라이브러리. 5-5에서 컴포넌트를 만들 때 직접 씁니다. |
| `typescript@5.6.3` | 설정 파일(`.mts`)과 컴포넌트를 TypeScript로 쓰고 타입 검사를 할 때 씁니다. |

설치 후 `package.json`의 아래쪽이 이렇게 바뀝니다.

```json
  "devDependencies": {
    "typescript": "5.6.3",
    "vitepress": "1.6.3",
    "vue": "3.5.13"
  }
```

::: info 왜 버전을 고정하나요?
작성 시점(2026-10)에 `npm view vitepress version`으로 확인한 최신 버전은 **1.6.4**였습니다. 버전을 적지 않고 `npm install -D vitepress`라고 하면 그날그날의 최신판이 들어옵니다. 오늘 따라 한 사람과 석 달 뒤에 따라 한 사람이 서로 다른 버전을 쓰게 되고, 설정 이름이나 기본 화면이 조금씩 달라져 "가이드대로 했는데 화면이 달라요"가 생깁니다.

이 파트는 교재인 ts-wiki와 **똑같은 버전**(VitePress 1.6.3 · vue 3.5.13 · typescript 5.6.3)을 써서, 레슨에 적힌 출력과 여러분 화면이 같게 나오도록 합니다.
:::

::: details `-E`를 빼면 어떻게 되나요? (실제로 해 본 결과)
`npm install -D vitepress@1.6.3 vue@3.5.13 typescript@5.6.3`처럼 `-E` 없이 설치하면 `node_modules`에는 1.6.3이 들어오지만 `package.json`에는 이렇게 적힙니다.

```json
  "devDependencies": {
    "typescript": "^5.6.3",
    "vitepress": "^1.6.3",
    "vue": "^3.5.13"
  }
```

`^`(캐럿)는 "1.x.x 안에서 더 새것이 있으면 그것도 괜찮다"는 뜻입니다. `package-lock.json`이 있는 동안은 1.6.3이 유지되지만, 잠금 파일을 지우거나 새 PC에서 잠금 파일 없이 설치하면 1.6.4가 들어옵니다. ts-wiki의 `package.json`도 `^` 없이 정확한 버전을 적어 두었습니다.
:::

`5 vulnerabilities` 경고는 VitePress 1.6.3이 의존하는 하위 패키지(esbuild 등)에 알려진 취약점이 있다는 보고입니다. 이 위키는 **개발 서버를 내 PC 안에서만 쓰고**, 배포는 빌드된 HTML 파일만 하므로 실습에는 지장이 없습니다. `npm audit fix --force`는 VitePress 자체 버전을 크게 바꿀 수 있으므로 실습 중에는 실행하지 않습니다. 실제 서비스에 올릴 때의 판단은 [운영 기본기](../part7-server-learning/06-ops)에서 다룹니다.

**확인 방법**: 아래 명령으로 세 패키지의 버전이 정확히 보이면 성공입니다.

```bash
npm ls --depth=0
```

```text
my-wiki@1.0.0 ...\my-wiki
+-- typescript@5.6.3
+-- vitepress@1.6.3
`-- vue@3.5.13
```

::: warning `npx vitepress --version`은 버전을 보여 주지 않습니다
다른 도구처럼 `npx vitepress --version`을 치면, VitePress 1.6.3은 이를 버전 질문으로 알아듣지 못하고 **현재 폴더를 루트로 개발 서버를 띄워 버립니다**(실제로 겪은 일입니다). 화면에 `vitepress v1.6.3`과 `Local: http://localhost:5173/` 같은 줄이 나오고 명령이 끝나지 않습니다. 이때는 `Ctrl+C`로 끄고, 현재 폴더에 생긴 `.vitepress` 폴더를 지웁니다. 버전 확인은 `npm ls vitepress`로 합니다.
:::

### 4단계. `package.json` 정리하고 스크립트 적기

VS Code로 폴더를 엽니다(`code .` — 점은 "현재 폴더"라는 뜻). `package.json`을 아래처럼 고칩니다.

```json
{
  "name": "my-wiki",
  "version": "1.0.0",
  "private": true,
  "description": "VitePress로 처음부터 만들어 보는 나의 위키",
  "type": "module",
  "scripts": {
    "dev": "vitepress dev docs --port 5190",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs --port 5191"
  },
  "devDependencies": {
    "typescript": "5.6.3",
    "vitepress": "1.6.3",
    "vue": "3.5.13"
  }
}
```

바꾼 곳과 이유:

- **`"private": true`** — 실수로 `npm publish`를 쳐도 npm 공개 저장소에 올라가지 않게 막습니다.
- **`"type": "module"`** — 이 프로젝트의 `.js` 파일을 최신 문법(ESM, `import`/`export`)으로 읽게 합니다. VitePress 자체가 ESM으로 만들어져 있고, ts-wiki도 이 값을 씁니다.
- **`main`, `keywords`, `author`, `license`, `test` 스크립트 삭제** — 남에게 배포하는 라이브러리가 아니므로 필요 없습니다.
- **`scripts`** — `npm run 이름`으로 실행할 명령입니다.

| 스크립트 | 실행하면 | 언제 쓰나 |
|---|---|---|
| `npm run dev` | `vitepress dev docs --port 5190` — `docs` 폴더를 개발 서버로 띄움 | 글을 쓰고 고칠 때 |
| `npm run build` | `vitepress build docs` — HTML 파일로 굽기 | 배포 전 (5-6) |
| `npm run preview` | `vitepress preview docs --port 5191` — 구운 결과물을 띄움 | 배포 전 확인 (5-6) |

`docs`는 "마크다운 원고가 들어 있는 폴더"를 가리킵니다. 프로젝트 루트에 바로 `.md`를 두지 않고 `docs` 아래로 모으면, `package.json`·`node_modules` 같은 도구 파일과 원고가 섞이지 않습니다.

::: tip ts-wiki와 다른 점: `--host 0.0.0.0`
ts-wiki의 `dev` 스크립트에는 `--host 0.0.0.0`이 붙어 있어 같은 네트워크의 다른 PC에서도 접속할 수 있습니다. 실습용 `my-wiki`는 일부러 빼서 **내 PC에서만** 열리게 했습니다. 필요해지면 그때 붙이면 됩니다. 자세한 뜻은 [개발 서버: npm run dev와 포트](../part6-serve/01-dev-server)에서 다룹니다.
:::

**확인 방법**: `npm run`(이름 없이)을 치면 등록된 스크립트 목록이 나옵니다. `dev`, `build`, `preview` 세 개가 보이면 성공입니다.

### 5단계. 첫 페이지 만들기: `docs/index.md`

`docs` 폴더를 만들고 그 안에 `index.md`를 만듭니다. VS Code 탐색기에서 "새 폴더", "새 파일"을 눌러도 되고, 터미널에서 만들어도 됩니다.

```bash
mkdir docs
```

`docs/index.md`의 내용:

```md
# 나의 첫 위키

안녕하세요! VitePress로 만든 첫 페이지입니다.
```

`index.md`는 특별한 이름입니다. 폴더의 **대표 페이지**가 되어, `docs/index.md`는 사이트 주소의 맨 앞(`/`)에 해당합니다. 웹 서버가 폴더 주소를 받으면 `index.html`을 보여 주는 관례와 같습니다.

::: warning 파일 인코딩
메모장 등으로 만들 때는 **UTF-8**로 저장합니다. 다른 인코딩으로 저장하면 한글이 깨져 보입니다. VS Code는 기본이 UTF-8입니다(오른쪽 아래 상태 표시줄에서 확인).
:::

### 6단계. 개발 서버 띄우기

```bash
npm run dev
```

실제 출력:

```text
> my-wiki@1.0.0 dev
> vitepress dev docs --port 5190


  vitepress v1.6.3

  ➜  Local:   http://localhost:5190/
  ➜  Network: use --host to expose
```

- `Local: http://localhost:5190/` — 이 주소를 브라우저에서 엽니다. 터미널에 따라 `Ctrl`(macOS는 `Cmd`)을 누른 채 주소를 클릭해도 열립니다.
- `Network: use --host to expose` — "다른 PC에서 접속하려면 `--host`를 붙이세요"라는 안내입니다. 4단계에서 일부러 뺐으므로 정상입니다.
- 명령이 끝나지 않고 멈춰 있는 것이 **정상**입니다. 서버는 손님을 기다리며 계속 켜져 있는 프로그램이기 때문입니다.

**확인 방법**: 브라우저에서 `http://localhost:5190/`을 열었을 때

- 큰 제목 **나의 첫 위키**와 안내 문장이 보이고,
- 화면 왼쪽 위에 **VitePress**라는 사이트 이름이 보이고,
- 브라우저 탭 제목이 **나의 첫 위키 | VitePress**이면 성공입니다.

사이트 이름이 아직 "VitePress"인 것은 설정 파일이 없어서 기본값이 쓰였기 때문입니다. 5-3에서 바꿉니다.

### 7단계. 저장하면 바로 바뀌는 것 확인하기 (HMR)

서버를 켜 둔 채로 `docs/index.md`의 문장을 아무렇게나 고치고 저장합니다. 브라우저를 **새로 고치지 않아도** 화면이 바로 바뀝니다. 터미널에는 이런 줄이 찍힙니다.

```text
AM 9:04:59 [vitepress] hmr update /index.md
```

HMR(Hot Module Replacement, 실행 중에 바뀐 부분만 갈아 끼우기)은 개발 서버가 파일을 지켜보다가 바뀐 부분만 브라우저에 보내는 기능입니다. 글을 쓸 때 개발 서버를 켜 두는 이유가 이것입니다.

**확인 방법**: 저장 후 1~2초 안에 브라우저 내용이 바뀌면 성공입니다.

### 8단계. 서버 끄기

서버를 띄운 터미널을 클릭하고 `Ctrl+C`를 누릅니다(macOS도 `Ctrl+C`). Windows에서 `일괄 작업을 끝내시겠습니까 (Y/N)?`가 나오면 `Y`를 누릅니다. 프롬프트(`PS D:\workspace\my-wiki>` 같은 줄)가 다시 나오면 꺼진 것입니다.

**확인 방법**: 브라우저에서 새로 고침을 했을 때 "사이트에 연결할 수 없음"이 나오면 서버가 제대로 꺼진 것입니다.

### 이 단계까지의 전체 파일 상태

```text
my-wiki/
├─ node_modules/          ← npm install이 만든 패키지 창고 (직접 고치지 않음)
├─ package.json
├─ package-lock.json      ← 실제로 설치된 정확한 버전 기록 (직접 고치지 않음)
└─ docs/
   ├─ index.md
   └─ .vitepress/
      └─ cache/           ← 개발 서버가 만든 임시 파일 (지워도 됨)
```

`docs/.vitepress/cache`는 개발 서버가 처음 뜰 때 스스로 만든 폴더입니다. 다음 레슨부터 이 `.vitepress` 폴더 안에 설정과 테마를 넣게 됩니다.

### 대안: `npx vitepress init` 마법사

지금까지 손으로 한 4~5단계를 질문 몇 개로 대신해 주는 마법사가 있습니다. 설치(3단계)까지 마친 빈 폴더에서 실행합니다.

```bash
npx vitepress init
```

VitePress 1.6.3의 마법사는 다음을 차례로 묻습니다(질문 문구는 1.6.3 소스 기준).

| 질문 | 뜻 | 기본값 |
|---|---|---|
| Where should VitePress initialize the config? | 원고 폴더 위치 | `./` (이 파트처럼 쓰려면 `./docs`) |
| Site title: | 사이트 이름 | My Awesome Project |
| Site description: | 사이트 설명 | A VitePress Site |
| Theme: | Default Theme / Default Theme + Customization / Custom Theme | Default Theme |
| Use TypeScript for config and theme files? | 설정을 `.mts`로 만들지 | 예 |
| Add VitePress npm scripts to package.json? | `docs:dev` 같은 스크립트 추가 | 예 |

마법사는 설정 파일, 예제 페이지 몇 개, 스크립트를 한 번에 만들어 줍니다. 빠르지만 **어느 파일이 무슨 일을 하는지 모른 채** 완성품을 받는 셈입니다. 이 파트는 파일을 하나씩 직접 만들며 각 파일의 역할을 확인하는 것이 목표이므로 손으로 만듭니다. 이 파트를 마친 뒤 다른 위키를 새로 시작할 때는 마법사를 써도 좋습니다.

::: tip 마법사는 진짜 터미널에서
마법사는 화살표 키로 고르는 대화형 화면이라, 키 입력을 받을 수 없는 환경(일부 IDE의 출력 창, 자동화 스크립트)에서는 `ERR_TTY_INIT_FAILED` 오류로 멈춥니다. Windows Terminal, VS Code 통합 터미널처럼 직접 타이핑하는 터미널에서 실행합니다.
:::

## ts-wiki에서는

ts-wiki의 `package.json`(전체 20줄)은 이 레슨에서 만든 것과 뼈대가 같습니다.

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

- `private`, `type: module`, 정확한 버전 세 개가 모두 같습니다.
- 차이는 세 가지입니다. ① 포트가 5180, ② `--host 0.0.0.0`으로 다른 PC에서도 접속 가능, ③ 마크다운 frontmatter를 고쳐 주는 보조 스크립트 `fix:frontmatter`가 하나 더 있습니다.
- ts-wiki도 원고는 모두 `docs/` 아래에 있고, `docs/index.md`가 홈 화면입니다.

각 줄의 자세한 뜻은 [package.json과 npm 스크립트](../part4-anatomy/02-package-json)에서 읽었습니다.

## 자주 하는 실수

**1. `npm error code ENOENT ... package.json`**

- 원인: `my-wiki`가 아닌 다른 폴더(예: 한 단계 위)에서 `npm run dev`를 실행했습니다. npm은 현재 폴더의 `package.json`을 찾습니다.
- 해결: `cd my-wiki`로 들어간 뒤 다시 실행합니다. `pwd`로 위치를 확인하는 습관을 들입니다.

**2. `npm error Missing script: "dev"`**

- 원인: `package.json`에 `scripts.dev`를 적지 않았거나, 저장하지 않았거나, JSON 문법이 틀렸습니다(마지막 항목 뒤 쉼표, 작은따옴표 사용 등).
- 해결: JSON은 **큰따옴표만**, **마지막 항목 뒤 쉼표 없음**이 규칙입니다. VS Code가 빨간 밑줄을 그은 곳을 고치고 저장합니다.

**3. `Port 5190 is in use, trying another one...`**

- 원인: 이미 5190 포트를 쓰는 프로그램이 있습니다. 대개 **이전에 띄운 개발 서버를 끄지 않은 것**입니다. VitePress는 자동으로 다음 번호(5191 …)로 옮겨 뜹니다.
- 해결: 출력의 `Local:` 줄에 적힌 **실제 주소**로 접속합니다. 이전 서버 터미널을 찾아 `Ctrl+C`로 끄는 것이 근본 해결입니다.

**4. 화면은 뜨는데 한글이 `ì•ˆë…•`처럼 깨짐**

- 원인: `index.md`를 UTF-8이 아닌 인코딩(예: ANSI/EUC-KR)으로 저장했습니다.
- 해결: VS Code 오른쪽 아래 인코딩 표시를 눌러 "인코딩하여 다시 저장 → UTF-8"을 고릅니다.

**5. `npx vitepress --version`을 쳤더니 서버가 뜨고 끝나지 않음**

- 원인: VitePress 1.6.3 CLI는 `--version`을 따로 처리하지 않고 기본 동작(개발 서버)을 실행합니다.
- 해결: `Ctrl+C`로 끄고, 현재 폴더에 생긴 `.vitepress` 폴더를 지웁니다. 버전은 `npm ls vitepress`로 확인합니다.

## 직접 해 보기

**과제 1 ⭐** — `docs/index.md`에 자기소개 문단을 하나 더 쓰고, 저장 즉시 브라우저에 반영되는지 확인하세요.

::: details 힌트
서버가 켜져 있어야 합니다. 터미널에 `hmr update /index.md`가 찍히는지 함께 보세요.
:::

**과제 2 ⭐** — 개발 서버를 끈 상태와 켠 상태에서 각각 `http://localhost:5190/`을 열어 보고 차이를 적어 보세요.

::: details 정답 보기
꺼져 있으면 브라우저가 "연결할 수 없음(연결 거부)"을 보여 줍니다. 그 포트에서 기다리는 프로그램이 없기 때문입니다. 켜져 있으면 페이지가 뜹니다. "웹 페이지가 보인다 = 어떤 프로그램이 그 포트에서 응답하고 있다"는 뜻입니다.
:::

**과제 3 ⭐⭐** — 개발 서버를 하나 켜 둔 채, **새 터미널**에서 `npm run dev`를 한 번 더 실행해 보세요. 두 번째 서버는 몇 번 포트로 뜨나요? 확인 후 두 서버 모두 끄세요.

::: details 정답 보기
`Port 5190 is in use, trying another one...`이 나오고 다음 빈 번호(대개 5191)로 뜹니다. 한 포트는 한 프로그램만 쓸 수 있기 때문입니다. 실습 끝에는 두 터미널에서 각각 `Ctrl+C`를 누릅니다.
:::

**과제 4 ⭐⭐** — `package.json`의 `dev` 스크립트 포트를 5192로 바꾸고 다시 띄워 보세요. 확인 후 5190으로 되돌리세요.

::: details 힌트
`package.json`을 고친 뒤에는 **서버를 껐다 켜야** 반영됩니다. 스크립트는 시작할 때 한 번 읽히기 때문입니다.
:::

**과제 5 ⭐⭐⭐** — 다른 빈 폴더(`my-wiki-init`)에서 `npx vitepress init`을 실행해 마법사로 위키를 만들고, 이 레슨에서 손으로 만든 `my-wiki`와 파일 구성을 비교해 보세요. 비교가 끝나면 그 폴더는 지워도 됩니다.

::: details 힌트
마법사는 `vitepress`가 설치된 폴더에서 실행해야 합니다. 빈 폴더라면 `npm init -y`와 3단계 설치 명령을 먼저 실행합니다. 첫 질문에 `./docs`라고 답하면 이 파트와 같은 위치에 원고 폴더가 생깁니다.
:::

## 확인 퀴즈

**1.** `npm install -D -E vitepress@1.6.3`에서 `-D`와 `-E`는 각각 무엇을 하나요?

::: details 정답 보기
`-D`는 devDependencies(개발용 도구)로 기록하고, `-E`는 `^` 없이 정확한 버전(`1.6.3`)으로 기록합니다.
:::

**2.** `npm run dev`를 실행하면 명령이 끝나지 않고 멈춰 있습니다. 고장일까요?

::: details 정답 보기
아닙니다. 서버는 요청을 기다리며 계속 실행되는 프로그램입니다. 끄려면 `Ctrl+C`를 누릅니다.
:::

**3.** `docs/index.md`는 브라우저 주소의 어디에 해당하나요?

::: details 정답 보기
사이트의 맨 앞 주소 `/`(이 실습에서는 `http://localhost:5190/`)입니다. `index`는 폴더의 대표 페이지라는 뜻입니다.
:::

**4.** 아직 설정 파일이 없는데 왼쪽 위에 "VitePress"라는 이름이 보이는 이유는?

::: details 정답 보기
설정 파일이 없으면 VitePress가 기본값을 쓰기 때문입니다. 사이트 이름(`title`)의 기본값이 "VitePress"입니다.
:::

## 정리

- `mkdir` → `npm init -y` → `npm install -D -E ...` → `scripts` 작성 → `docs/index.md` → `npm run dev`가 VitePress 위키의 최소 시작 순서입니다.
- 버전은 `-E`로 정확히 고정합니다. 이 파트는 ts-wiki와 같은 VitePress 1.6.3 · vue 3.5.13 · typescript 5.6.3을 씁니다.
- `dev`(글 쓸 때) · `build`(HTML로 굽기) · `preview`(구운 결과 확인) 세 스크립트가 기본입니다.
- `docs/index.md`가 사이트의 첫 페이지 `/`가 됩니다.
- 개발 서버는 저장하면 바로 반영(HMR)되고, 끌 때는 `Ctrl+C`입니다.
- `npx vitepress init` 마법사는 빠른 대안이지만, 이 파트는 각 파일의 역할을 익히려고 손으로 만듭니다.

## 다음 단계

[첫 페이지와 홈 화면](./02-first-pages) — 레슨 페이지를 몇 개 더 만들고, frontmatter로 제목과 홈 화면(hero·features)을 꾸미고, 없는 페이지로 링크하면 빌드가 왜 실패하는지 직접 겪어 봅니다.
