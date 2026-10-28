---
title: 폴더 구조와 파일의 역할
---

# 폴더 구조와 파일의 역할

<LessonMeta level="중급" :minutes="30" prev="GitHub Actions가 main에 push될 때마다 위키를 빌드해 Pages에 올린다" />

## 이번에 배울 것

- ts-wiki의 전체 폴더 트리를 그리고, 각 파일·폴더가 맡은 일을 설명할 수 있다.
- "직접 쓰는 파일"과 "도구가 만들어 내는 파일"을 구분할 수 있다.
- `.gitignore`를 읽고 무엇이 git에 들어가고 무엇이 빠지는지 말할 수 있다.
- `.gitattributes`가 줄바꿈(LF/CRLF)을 어떻게 고정하는지, Windows에서 왜 필요한지 설명할 수 있다.

## 먼저 알아 둘 것

- 터미널에서 `cd`, `ls`(또는 `dir`)로 폴더를 옮겨 다닐 수 있으면 됩니다. → [준비물 설치](../part0-start/03-setup)
- `npm install`, `node_modules`가 무엇인지 → [Node.js와 npm](../part1-concepts/04-node-npm)
- 빌드가 마크다운을 HTML로 바꾸는 일이라는 것 → [정적 사이트 생성기(SSG)와 빌드](../part1-concepts/05-ssg)

## 비유로 이해하기

ts-wiki를 **출판사**에 비유해 봅니다.

| 출판사 | ts-wiki |
|---|---|
| 원고(작가가 쓴 글) | `docs/` 아래 마크다운 파일 |
| 편집 지침서(판형, 목차, 표지 색) | `docs/.vitepress/config.mts`, `theme/` |
| 목차 원장(어떤 장이 몇 쪽에 들어가나) | `docs/.vitepress/curriculum.mts` |
| 인쇄기와 잉크(빌려 온 장비) | `node_modules/` (npm이 받아 온 라이브러리) |
| 인쇄된 책 | `docs/.vitepress/dist/` (빌드 결과물) |
| 서점 배송 지침 | `Dockerfile`, `nginx.conf`, `.github/workflows/deploy.yml` |

원고와 지침서는 사람이 직접 쓰고 소중히 보관합니다(git에 넣습니다). 인쇄기와 인쇄된 책은 언제든 다시 만들 수 있으니 보관하지 않습니다(git에서 뺍니다). 이 구분이 이번 레슨의 핵심입니다.

## 개념 설명

### 1단계: 맨 위 폴더 둘러보기

ts-wiki 폴더에서 숨김 파일까지 모두 봅니다.

Windows(PowerShell):

```powershell
cd D:\workspace\ts-wiki
Get-ChildItem -Force | Select-Object Name
```

macOS/Linux(bash):

```bash
cd <ts-wiki 경로>
ls -a
```

실제 출력(bash의 `ls -a`, 작성 시점):

```text
.
..
.dockerignore
.git
.gitattributes
.github
.gitignore
Dockerfile
README.md
docker-compose.yml
docs
examples
nginx.conf
node_modules
package-lock.json
package.json
scripts
```

- 이름이 점(`.`)으로 시작하는 파일은 **숨김 파일**입니다. 파일 탐색기에서는 기본으로 안 보일 수 있어 `-Force`(PowerShell)나 `-a`(bash)를 붙였습니다.
- `.git` 폴더는 git이 이력을 저장하는 곳입니다. 직접 열어 고치지 않습니다.
- `node_modules`는 `npm install`을 한 뒤에만 있습니다.

**확인 방법:** 위 목록과 같은 이름이 보이면 됩니다. `node_modules`가 없다면 아직 `npm install`을 안 한 것입니다.

### 2단계: 전체 트리

`node_modules`, `dist`, `cache`, `.git`을 빼고 그린 ts-wiki 전체 트리입니다(작성 시점 실제 폴더 기준). 레슨 파일은 너무 많아 Part 0만 펼쳤습니다.

```text
ts-wiki/
├── .github/
│   └── workflows/
│       └── deploy.yml          GitHub Pages 자동 배포 절차
├── docs/                       ← 사이트의 "뿌리". 이 아래가 전부 웹 페이지가 됩니다
│   ├── .vitepress/             ← VitePress 전용 폴더(설정·테마). 페이지가 되지 않습니다
│   │   ├── config.mts          사이트 설정(제목, 메뉴, 사이드바, 검색…)
│   │   ├── curriculum.mts      파트·레슨 목록의 단일 정의
│   │   └── theme/
│   │       ├── index.ts        기본 테마 확장 + 컴포넌트 전역 등록
│   │       ├── custom.css      브랜드 색·글꼴 덮어쓰기
│   │       └── components/
│   │           ├── CurriculumToc.vue      전체 목차
│   │           ├── LessonMeta.vue         레슨 상단 배지
│   │           ├── PartLessons.vue        파트 소개의 레슨 표
│   │           └── ProgressChecklist.vue  진도 체크리스트
│   ├── public/
│   │   └── favicon.svg         그대로 복사되는 정적 파일(아이콘)
│   ├── index.md                홈 화면 (/)
│   ├── guide/                  학습 가이드(로드맵·목차·체크리스트·작성 규칙 등 6개)
│   ├── part0-start/
│   │   ├── index.md            파트 소개 (/part0-start/)
│   │   ├── 01-what-is-programming.md
│   │   ├── 02-why-typescript.md
│   │   ├── 03-setup.md
│   │   ├── 04-playground.md
│   │   ├── 05-first-program.md
│   │   └── 06-how-to-read-errors.md
│   ├── part1-basics/ … part9-master/   (같은 구조, 파트마다 index.md + 레슨)
│   └── appendix/               부록 4개 + index.md
├── examples/
│   └── projects/               Part 8 실습 프로젝트 완성 코드 4개
│       ├── 01-cli-budget/
│       ├── 02-todo-web/
│       ├── 03-rest-api/
│       └── 04-react-order-app/
├── scripts/
│   └── fix-frontmatter.mjs     frontmatter title 자동 따옴표 처리
├── .dockerignore               Docker 빌드에 넣지 않을 것
├── .gitattributes              줄바꿈(LF) 고정 규칙
├── .gitignore                  git에 넣지 않을 것
├── Dockerfile                  Docker 이미지 만드는 법(빌드 → nginx)
├── README.md                   저장소 첫 화면 설명서
├── docker-compose.yml          컨테이너 실행 설정(8090:80)
├── nginx.conf                  nginx 웹 서버 설정
├── package-lock.json           설치된 라이브러리의 정확한 버전 기록
└── package.json                프로젝트 정보·스크립트·의존성
```

git이 관리하는 파일 수를 세어 보면 이렇습니다.

```bash
git ls-files | wc -l
```

```text
170
```

그중 `docs/part*` 아래 마크다운이 85개(레슨 75개 + 파트 소개 10개)이고, 나머지는 설정·테마·예제 코드입니다.

::: tip 트리를 내 눈으로 그려 보기
Windows에는 `tree /F` 명령이 있지만 `node_modules`까지 다 그려서 수천 줄이 나옵니다. git이 관리하는 파일만 보고 싶으면 `git ls-files`가 가장 깔끔합니다. 이 명령은 PowerShell과 bash에서 똑같이 동작합니다.
:::

### 3단계: 파일·폴더의 역할 표

| 경로 | 누가 만드나 | 역할 | 지우면? | 자세히 |
|---|---|---|---|---|
| `package.json` | 사람 | 프로젝트 이름, npm 스크립트, 의존성 목록 | `npm run dev` 자체가 안 됨 | [4-2](./02-package-json) |
| `package-lock.json` | npm | 실제 설치된 모든 패키지의 정확한 버전 | `npm ci`가 실패, 버전이 PC마다 달라질 수 있음 | [4-2](./02-package-json) |
| `docs/` | 사람 | VitePress의 원본 폴더. 마크다운 1개 = 페이지 1개 | 사이트 없음 | [VitePress](../part3-libraries/01-vitepress) |
| `docs/.vitepress/config.mts` | 사람 | 사이트 설정 | 제목·사이드바·검색 없는 기본 사이트 | [4-3](./03-config) |
| `docs/.vitepress/curriculum.mts` | 사람 | 레슨 목록 단일 정의 | config와 컴포넌트가 import 실패로 빌드 에러 | [4-4](./04-curriculum) |
| `docs/.vitepress/theme/` | 사람 | 테마 확장·컴포넌트·CSS | 기본 테마로 돌아가고, 마크다운 속 컴포넌트가 안 그려짐 | [4-5](./05-theme-components) |
| `docs/public/` | 사람 | 가공 없이 사이트 루트로 복사되는 파일 | 아이콘이 깨짐 | [4-3](./03-config) |
| `docs/.vitepress/dist/` | VitePress | 빌드 결과물(HTML·JS·CSS) | 다시 빌드하면 생김 | [빌드와 미리보기](../part5-build-along/06-build-preview) |
| `docs/.vitepress/cache/` | VitePress | 개발 서버의 사전 번들 캐시 | 다음 실행 때 다시 생김 | |
| `node_modules/` | npm | 받아 온 라이브러리(작성 시점 약 119MB) | `npm install`로 다시 생김 | [4-2](./02-package-json) |
| `scripts/fix-frontmatter.mjs` | 사람 | frontmatter title에 따옴표 자동 추가 | `npm run fix:frontmatter`만 안 됨 | [4-6](./06-scripts-and-rules) |
| `examples/projects/` | 사람 | 실습 프로젝트 완성 코드(위키와 별개의 npm 프로젝트 4개) | 위키 빌드에는 영향 없음 | |
| `Dockerfile`, `.dockerignore` | 사람 | Docker 이미지 만드는 법, 빌드에서 뺄 것 | Docker 배포만 안 됨 | [Docker 이미지로 묶기](../part6-serve/03-docker-nginx) |
| `nginx.conf` | 사람 | 컨테이너 안 nginx 설정 | 이미지 빌드 실패 | [nginx](../part3-libraries/05-nginx) |
| `docker-compose.yml` | 사람 | 컨테이너를 8090 포트로 상시 실행 | compose 실행만 안 됨 | [Docker Compose](../part6-serve/04-compose) |
| `.github/workflows/deploy.yml` | 사람 | push 시 Pages 자동 배포 | 자동 배포만 멈춤 | [GitHub Pages 자동 배포](../part6-serve/05-github-pages) |
| `.gitignore`, `.gitattributes` | 사람 | git에 넣지 않을 것, 줄바꿈 규칙 | 아래 4·5단계 참고 | 이 레슨 |
| `README.md` | 사람 | 저장소 첫 화면 설명서. 위키 페이지는 아님(`docs/` 밖) | GitHub 첫 화면이 비어 보임 | [4-6](./06-scripts-and-rules) |

여기서 꼭 기억할 규칙 세 가지가 있습니다.

1. **`docs/` 안의 마크다운만 페이지가 됩니다.** 맨 위의 `README.md`는 마크다운이지만 `docs/` 밖이라 위키에 나오지 않습니다.
2. **`docs/.vitepress/` 안은 페이지가 되지 않습니다.** 이름이 점으로 시작하는 이 폴더는 VitePress가 설정 전용으로 예약한 곳입니다.
3. **주소는 파일 경로에서 나옵니다.** `docs/part0-start/03-setup.md` → `/part0-start/03-setup`, `docs/part0-start/index.md` → `/part0-start/`. 이것을 **파일 기반 라우팅**(라우팅, routing: 주소와 페이지를 짝짓는 일)이라고 부릅니다.

**확인 방법:** 표를 가리고 `Dockerfile`, `curriculum.mts`, `dist/` 세 가지의 역할과 "지우면 어떻게 되나"를 말로 설명해 봅니다.

### 4단계: git에 들어가는 것, 안 들어가는 것 (`.gitignore`)

`.gitignore`는 "이 패턴에 맞는 파일은 git이 못 본 척하라"는 목록입니다. ts-wiki의 `.gitignore` 전체(8줄)입니다.

```text:line-numbers
node_modules/
docs/.vitepress/dist/
docs/.vitepress/cache/
examples/**/dist/
.DS_Store
*.log
.env
.env.*
```

| 줄 | 패턴 | 빼는 이유 |
|---|---|---|
| 1 | `node_modules/` | `package-lock.json`만 있으면 `npm ci`로 똑같이 다시 받을 수 있고, 크기가 큽니다(약 119MB). 앞에 `/`가 없으므로 **어느 깊이든** 맞습니다. 그래서 `examples/projects/*/node_modules`도 함께 빠집니다 |
| 2 | `docs/.vitepress/dist/` | 빌드 결과물. 원본(마크다운)에서 언제든 다시 만들 수 있습니다. 배포는 Actions·Docker가 각자 빌드합니다 |
| 3 | `docs/.vitepress/cache/` | 개발 서버 캐시 |
| 4 | `examples/**/dist/` | 실습 프로젝트의 빌드 결과물. `**`는 "중간에 폴더가 몇 단계든"이라는 뜻입니다 |
| 5 | `.DS_Store` | macOS Finder가 폴더마다 만드는 숨김 파일 |
| 6 | `*.log` | 각종 로그 파일 |
| 7~8 | `.env`, `.env.*` | 환경 변수 파일. 비밀번호·토큰 같은 **비밀 값**을 담는 관례가 있어, 실수로 공개 저장소에 올라가지 않도록 미리 막아 둡니다 |

정말 빠지는지 git에게 직접 물어볼 수 있습니다.

```bash
git check-ignore -v node_modules docs/.vitepress/dist docs/.vitepress/cache .env
```

```text
.gitignore:1:node_modules/	node_modules
.gitignore:2:docs/.vitepress/dist/	docs/.vitepress/dist
.gitignore:3:docs/.vitepress/cache/	docs/.vitepress/cache
.gitignore:7:.env	.env
```

출력은 "`.gitignore` 몇 번째 줄의 어떤 패턴 때문에 이 경로가 무시되는가"를 알려 줍니다. 아무것도 출력되지 않으면 그 경로는 git에 들어갑니다.

**확인 방법:** `git check-ignore -v package.json`을 실행하면 아무것도 나오지 않아야 합니다(`package.json`은 git에 들어가야 하니까요).

::: info `.dockerignore`와 헷갈리지 마세요
`.dockerignore`는 git이 아니라 **Docker 빌드**에 넣지 않을 것을 정합니다. ts-wiki의 `.dockerignore`에는 `examples`와 `.git`도 들어 있습니다. 위키 빌드에 필요 없는 것을 빼서 이미지 빌드를 빠르게 하려는 것입니다. 자세한 내용은 [Docker 이미지로 묶기](../part6-serve/03-docker-nginx)에서 다룹니다.
:::

### 5단계: 줄바꿈 고정 (`.gitattributes`)

텍스트 파일의 "줄 끝"에는 눈에 안 보이는 문자가 들어 있습니다.

- **LF**(Line Feed, `\n`): macOS·Linux가 쓰는 방식
- **CRLF**(Carriage Return + Line Feed, `\r\n`): Windows 메모장 등이 전통적으로 쓰는 방식

같은 파일이 PC마다 다른 줄바꿈으로 저장되면, 내용은 같은데 git이 "모든 줄이 바뀌었다"고 보거나, Linux 서버(Docker·Actions)에서 스크립트가 이상하게 동작할 수 있습니다. ts-wiki의 `.gitattributes`(3줄)는 이것을 막습니다.

```text:line-numbers
* text=auto eol=lf
*.png binary
*.jpg binary
```

- 1줄: `*`(모든 파일)에 대해, git이 텍스트로 판단한 파일(`text=auto`)은 저장소에도, 작업 폴더에도 **항상 LF**로 둡니다(`eol=lf`).
- 2~3줄: 그림 파일은 `binary`(이진 파일)로 취급해 줄바꿈 변환이나 차이 비교를 하지 않습니다. 그림 속 바이트를 줄바꿈으로 오해해 바꾸면 파일이 깨지기 때문입니다.

#### Windows에서 보이는 경고 재현

Windows용 Git은 설치할 때 보통 `core.autocrlf=true`(커밋할 땐 LF, 작업 폴더로 꺼낼 땐 CRLF로 바꾸기)로 설정됩니다. 이 PC도 그렇습니다.

```bash
git config core.autocrlf
```

```text
true
```

`.gitattributes`가 **없는** 빈 저장소에서 LF 파일을 추가하면 이런 경고가 나옵니다(스크래치 폴더에서 실제 실행).

```bash
git init
git config core.autocrlf true
printf 'a\nb\n' > a.md
git add a.md
```

```text
warning: in the working copy of 'a.md', LF will be replaced by CRLF the next time Git touches it
```

"다음에 git이 이 파일을 건드리면(체크아웃 등) 작업 폴더의 LF를 CRLF로 바꾸겠다"는 뜻입니다. 같은 저장소에 `.gitattributes`를 넣고 다시 추가하면 경고가 사라지고, 모든 파일이 LF로 고정된 것을 확인할 수 있습니다.

```bash
printf '* text=auto eol=lf\n' > .gitattributes
git add .gitattributes a.md
git ls-files --eol
```

```text
i/lf    w/lf    attr/text=auto eol=lf 	.gitattributes
i/lf    w/lf    attr/text=auto eol=lf 	a.md
```

- `i/lf`: 저장소(index) 안의 줄바꿈이 LF
- `w/lf`: 작업 폴더(working tree)의 줄바꿈도 LF
- `attr/...`: 적용된 `.gitattributes` 규칙

ts-wiki 원본에서도 같은 명령으로 확인할 수 있습니다.

```bash
git ls-files --eol package.json docs/.vitepress/config.mts
```

```text
i/lf    w/lf    attr/text=auto eol=lf 	docs/.vitepress/config.mts
i/lf    w/lf    attr/text=auto eol=lf 	package.json
```

`core.autocrlf=true`인 Windows에서도 `w/lf`, 즉 작업 폴더가 LF입니다. `.gitattributes`가 개인 설정보다 우선하기 때문입니다. 이 파일이 저장소에 들어 있으니, 누가 어떤 PC에서 받아도 같은 줄바꿈을 쓰게 됩니다.

**확인 방법:** `git ls-files --eol` 출력의 `w/` 칸이 모두 `lf`이면 성공입니다. `w/crlf`가 보이면 `.gitattributes`가 적용되기 전에 받은 파일일 수 있습니다(아래 "자주 하는 실수" 참고).

## ts-wiki에서는

- **역할 분리**: 사람이 쓰는 원고(`docs/*.md`), 사이트 동작 규칙(`docs/.vitepress/`), 배포 규칙(`Dockerfile`·`nginx.conf`·`docker-compose.yml`·`deploy.yml`)이 폴더 단위로 나뉘어 있습니다. 글만 쓰는 사람은 `docs/` 아래와 `curriculum.mts`만 알면 됩니다.
- **`.gitignore` 1~3줄**이 `node_modules`·`dist`·`cache`를 빼므로, GitHub에 올라간 저장소는 170개 파일뿐입니다. 받는 사람은 `npm install`(또는 `npm ci`)로 라이브러리를, `npm run build`로 결과물을 직접 만듭니다. `Dockerfile` 7·9줄(`RUN npm ci`, `RUN npm run build`)과 `deploy.yml` 29·30줄(`- run: npm ci`, `- run: npm run build`)이 바로 그 일을 합니다.
- **`.gitattributes` 1줄**(`* text=auto eol=lf`) 덕분에 Windows에서 쓴 파일이 Linux 기반인 Docker 이미지(`node:22-alpine`)와 Actions(`ubuntu-latest`)에서도 같은 LF로 처리됩니다.
- **`docs/public/favicon.svg`**는 빌드하면 `dist/favicon.svg`로 그대로 복사됩니다. 실제로 빌드한 `dist` 폴더 맨 위에 `favicon.svg`, `index.html`, `404.html`, `assets/`, 각 파트 폴더가 생기는 것을 확인했습니다.

## 자주 하는 실수

### 1. `node_modules`까지 복사하거나 압축해서 전달

- **증상**: 폴더 복사가 몇 분씩 걸리고, 받은 사람 PC에서 `vitepress: command not found` 또는 이상한 모듈 오류가 납니다.
- **원인**: `node_modules`는 운영체제·Node 버전에 맞춰 설치된 결과물이라, 다른 PC로 옮기면 맞지 않을 수 있습니다.
- **해결**: `node_modules`는 빼고 전달하고, 받는 쪽에서 `npm install`(또는 `npm ci`)을 실행합니다.

### 2. `README.md`를 고쳤는데 위키에 반영이 안 됨

- **증상**: 저장소 맨 위 `README.md`를 고치고 `npm run dev`로 봤는데 아무 페이지도 바뀌지 않습니다.
- **원인**: 위키 페이지는 `docs/` 아래 마크다운만입니다. 맨 위 `README.md`는 GitHub 저장소 첫 화면용입니다.
- **해결**: 위키 홈을 바꾸려면 `docs/index.md`를 고칩니다.

### 3. `warning: in the working copy of '...', LF will be replaced by CRLF ...`

- **증상**: Windows에서 `git add` 할 때마다 위 경고가 쏟아집니다.
- **원인**: `.gitattributes`가 없는 저장소에서 `core.autocrlf=true`가 동작하고 있습니다.
- **해결**: 저장소에 `.gitattributes`(`* text=auto eol=lf`)를 넣습니다. 이미 CRLF로 받은 파일이 있다면 커밋되지 않은 변경이 없는 상태에서 `git add --renormalize .`로 정리합니다. 개인 설정 `core.autocrlf`를 바꾸는 것은 다른 저장소에도 영향을 주므로, 저장소 단위의 `.gitattributes`를 먼저 씁니다.

### 4. `dist/`를 커밋하려고 함

- **증상**: `git status`에 `dist`가 안 보여서 "빌드 결과가 저장이 안 됐다"고 생각합니다.
- **원인**: `.gitignore` 2줄이 일부러 뺀 것입니다.
- **해결**: 결과물은 배포하는 쪽(Actions, Docker)이 직접 빌드합니다. `dist`를 git에 넣을 필요가 없습니다.

## 직접 해 보기

### 과제 1 ⭐ 파일 세기

`git ls-files`를 이용해 ts-wiki의 `docs/part0-start` 아래 파일 수를 세어 보세요.

::: details 정답 보기
```bash
git ls-files docs/part0-start | wc -l
```

PowerShell에서는 `(git ls-files docs/part0-start).Count`도 됩니다. 결과는 `7`(파트 소개 `index.md` 1개 + 레슨 6개)입니다.
:::

### 과제 2 ⭐ 무시되는지 확인하기

`examples/projects/01-cli-budget/node_modules`가 git에서 무시되는지, 무시된다면 `.gitignore` 몇 번째 줄 때문인지 확인하세요.

::: details 힌트와 정답
`git check-ignore -v examples/projects/01-cli-budget/node_modules`를 실행합니다. 루트 `.gitignore` 1줄 `node_modules/`는 앞에 `/`가 없어 모든 깊이에 적용됩니다. 다만 이 프로젝트 폴더에도 자체 `.gitignore`가 있어(첫 줄 `node_modules`) 그 파일이 표시될 수 있습니다. 어느 쪽이든 "무시된다"가 정답입니다.
:::

### 과제 3 ⭐⭐ 줄바꿈 경고 재현

빈 폴더에서 이 레슨 5단계의 실험을 직접 해 보고, `.gitattributes`를 넣기 전과 후의 `git ls-files --eol` 출력을 비교하세요.

::: details 힌트
`.gitattributes` 없이 `core.autocrlf=true`로 추가한 직후에는 경고만 나오고 `w/lf`일 수 있습니다. 경고 문구 그대로 "다음에 git이 파일을 건드릴 때" 바뀝니다. 파일을 지우고 `git checkout -- a.md`로 다시 꺼내면 `w/crlf`가 되는 것을 볼 수 있습니다.
:::

### 과제 4 ⭐⭐⭐ 새 위키의 `.gitignore` 쓰기

내가 새로 만들 위키(Part 5)에서 빌드 결과물이 `docs/.vitepress/dist`, 개인 메모를 `notes/` 폴더에 둔다고 할 때 쓸 `.gitignore`를 작성하세요.

::: details 정답 예시
```text
node_modules/
docs/.vitepress/dist/
docs/.vitepress/cache/
notes/
.env
.env.*
*.log
```

`notes/`는 git에 넣지 않으니 다른 PC에는 없다는 점을 기억하세요.
:::

## 확인 퀴즈

1. `docs/guide/roadmap.md`의 주소는 무엇인가요?
2. `docs/.vitepress/` 안에 `hello.md`를 만들면 페이지가 생기나요?
3. `node_modules`를 git에 넣지 않아도 되는 이유는?
4. `* text=auto eol=lf`에서 `eol=lf`는 무엇을 뜻하나요?
5. `.gitignore`와 `.dockerignore`의 차이는?

::: details 정답 보기
1. `/guide/roadmap` (cleanUrls 설정 때문에 `.html`이 붙지 않습니다. 4-3에서 다룹니다)
2. 생기지 않습니다. `.vitepress`는 설정 전용 폴더입니다.
3. `package.json`과 `package-lock.json`만 있으면 `npm ci`로 똑같이 다시 만들 수 있기 때문입니다.
4. 작업 폴더에 꺼낼 때도 줄바꿈을 LF로 유지하라는 뜻입니다.
5. `.gitignore`는 git 저장소에서, `.dockerignore`는 Docker 이미지 빌드 재료에서 뺄 것을 정합니다.
:::

## 정리

- ts-wiki는 원고(`docs/*.md`), 사이트 규칙(`docs/.vitepress/`), 배포 규칙(Docker·nginx·Actions 파일)으로 나뉩니다.
- `docs/` 안의 마크다운만 페이지가 되고, 파일 경로가 곧 주소입니다. `docs/.vitepress/`는 페이지가 되지 않습니다.
- 다시 만들 수 있는 것(`node_modules`, `dist`, `cache`)과 비밀 값(`.env`)은 `.gitignore`로 git에서 뺍니다.
- `.gitattributes`의 `* text=auto eol=lf`가 Windows·macOS·Linux 어디서든 줄바꿈을 LF로 고정합니다.
- 의심스러우면 `git check-ignore -v`, `git ls-files --eol`로 git에게 직접 물어봅니다.

## 다음 단계

[package.json과 npm 스크립트](./02-package-json)에서 프로젝트의 신분증인 `package.json` 18줄을 한 줄씩 읽고, `npm run dev`가 실제로 무엇을 실행하는지 따라갑니다.
