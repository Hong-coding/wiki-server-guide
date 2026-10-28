---
title: '이 가이드에서 만들 것: ts-wiki 한눈에 보기'
---

# 이 가이드에서 만들 것: ts-wiki 한눈에 보기

<LessonMeta level="입문" :minutes="20" prev="없음 (첫 레슨)" />

## 이번에 배울 것

- ts-wiki가 어떤 사이트인지, 완성된 모습을 말로 설명할 수 있다.
- "마크다운 → VitePress 빌드 → HTML → 서버 → 브라우저"로 이어지는 전체 그림을 그릴 수 있다.
- ts-wiki를 띄우는 세 가지 방법(개발 서버 · nginx 컨테이너 · GitHub Pages)이 그림의 어디서 갈라지는지 안다.
- 이 가이드의 각 파트가 그 그림의 어느 부분을 다루는지 안다.

## 먼저 알아 둘 것

- 없음. 이 레슨은 명령을 실행하지 않고 그림만 봅니다. 모르는 단어가 나와도 지금은 "이런 이름의 부품이 있구나" 정도로 넘어가면 됩니다. 모두 Part 1부터 다시 설명합니다.

## 비유로 이해하기

ts-wiki를 **동네 서점에 놓일 책 한 권**이라고 생각해 봅시다.

| 책 만들기 | ts-wiki |
|---|---|
| 작가가 쓰는 원고(한글 파일) | `docs/` 아래의 마크다운(`.md`) 파일 |
| 편집 디자인 규칙(글꼴·여백·목차 모양) | `docs/.vitepress/config.mts`와 테마 |
| 인쇄소에서 원고를 책으로 찍어 내기 | VitePress **빌드**(`npm run build`) |
| 찍혀 나온 책 | `docs/.vitepress/dist/` 안의 HTML 파일들 |
| 책을 진열해 두는 곳: 내 책상 / 동네 서점 / 대형 온라인 서점 | 개발 서버 / nginx 컨테이너 / GitHub Pages |
| 책을 펼쳐 읽는 독자 | 브라우저 |

이 비유에서 중요한 점이 두 가지 있습니다.

1. **원고와 책은 다릅니다.** 독자는 원고(마크다운)를 읽지 않고 찍혀 나온 책(HTML)을 읽습니다. 그래서 원고를 고쳤으면 다시 찍어야(빌드) 독자에게 반영됩니다.
2. **같은 책을 여러 곳에 진열할 수 있습니다.** 책의 내용은 같고, 진열하는 장소(서버)만 다릅니다. ts-wiki도 똑같은 HTML을 세 군데에서 서비스합니다.

## 개념 설명

### ts-wiki는 어떤 사이트인가

ts-wiki는 "TypeScript 마스터 위키"라는 이름의 학습 사이트입니다. 프로그래밍을 처음 배우는 사람이 TypeScript를 실무 수준까지 익히도록 레슨을 순서대로 엮었습니다. 저장소의 `README.md` 첫머리는 이렇게 시작합니다.

```text
# TypeScript 마스터 위키

프로그래밍을 처음 배우는 사람이 TypeScript를 실무 수준까지 익히도록 만든 단계별 학습 위키입니다. [VitePress](https://vitepress.dev/) 기반이며 모든 문서는 `docs/` 아래 마크다운 파일입니다.

- 10개 파트 · 75개 레슨 · 부록 4개 · 실습 프로젝트 4개
```

브라우저로 열면 다음이 보입니다.

- **홈 화면**: 큰 제목 "TypeScript 마스터 위키"와 "처음이라면 여기서 시작" 같은 버튼
- **왼쪽 사이드바**: 학습 가이드, Part 0 ~ Part 9, 부록이 접었다 펼 수 있는 목록으로 나열
- **위쪽 메뉴**: 학습 가이드 · 전체 목차 · 12주 학습 계획 · 치트시트
- **검색창**: 오른쪽 위 "검색" 버튼(인터넷 검색 서비스 없이 사이트 안에서 검색)
- **레슨 페이지**: 맨 위에 "난이도 · 입문", "약 30분" 같은 배지, 아래로 본문·연습 문제·퀴즈
- **진도 체크리스트**: 마친 레슨에 체크하면 브라우저에 저장되어 다음에 와도 남아 있음
- **다크 모드** 전환 버튼, 페이지마다 "마지막 수정" 시각과 "GitHub에서 이 페이지 고치기" 링크

이 가이드(지금 읽고 있는 "위키 서버 구축 가이드")도 **ts-wiki와 똑같은 구조**로 만들어졌습니다. 사이드바와 배지가 비슷하게 생긴 것은 그 때문입니다.

::: info 위키(wiki)란?
여러 사람이 함께 고쳐 가며 쌓는 문서 모음 사이트를 말합니다. ts-wiki는 Git 저장소에 마크다운 파일을 쌓고, 고칠 사람은 파일을 고쳐 올리는(push) 방식이라 "위키"라고 부릅니다.
:::

### 전체 그림

ts-wiki가 화면에 뜨기까지의 전체 흐름은 다음 한 장으로 정리됩니다. 이 그림은 이 가이드 전체에서 계속 다시 나옵니다.

```text
 [1] 원고                 [2] 인쇄(빌드)              [3] 결과물
┌────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│ docs/**/*.md   │     │ VitePress 빌드   │     │ docs/.vitepress/dist/    │
│ config.mts     │ ──▶ │ (Node.js 위에서  │ ──▶ │   index.html             │
│ curriculum.mts │     │  실행)           │     │   part0-start/*.html     │
│ theme/*.vue    │     │ npm run build    │     │   assets/*.js, *.css     │
└────────────────┘     └──────────────────┘     └────────────┬─────────────┘
        │                                                    │
        │ (개발할 때는 빌드 없이 바로)                        │ (같은 결과물을 세 곳에)
        ▼                                                    ▼
 [4-A] 개발 서버            [4-B] nginx 컨테이너         [4-C] GitHub Pages
┌──────────────────┐     ┌──────────────────────┐    ┌──────────────────────────┐
│ npm run dev      │     │ docker compose up    │    │ git push → Actions가     │
│ localhost:5180   │     │ localhost:8090       │    │ 빌드·업로드               │
│ 저장하면 즉시 반영│     │ 사내 서버에 상시 실행 │    │ hong-coding.github.io/   │
└────────┬─────────┘     └──────────┬───────────┘    │   ts-wiki/               │
         │                          │                └────────────┬─────────────┘
         └──────────────┬───────────┴─────────────────────────────┘
                        ▼   HTTP 요청 / 응답
                 ┌──────────────┐
                 │ [5] 브라우저  │  ← 사람이 읽는 화면
                 └──────────────┘
```

하나씩 짚어 봅니다.

**[1] 원고**: 글은 모두 마크다운 파일로 씁니다. 마크다운은 `# 제목`, `- 목록`처럼 기호 몇 개로 서식을 표현하는 글쓰기 형식입니다. 사이트 전체 설정(`config.mts`), 레슨 목록(`curriculum.mts`), 화면 부품(`theme/components/*.vue`)도 이 단계에 속합니다.

**[2] 빌드**: VitePress라는 프로그램이 원고를 읽어 웹 페이지(HTML)로 바꿉니다. VitePress는 JavaScript로 만들어진 프로그램이라 **Node.js**(브라우저 밖에서 JavaScript를 실행해 주는 프로그램) 위에서 돌아갑니다. 명령은 `npm run build`입니다.

**[3] 결과물**: 빌드가 끝나면 `docs/.vitepress/dist/` 폴더에 HTML·CSS·JavaScript 파일이 생깁니다. 이 폴더만 있으면 Node.js도 VitePress도 없이 사이트를 띄울 수 있습니다. 이런 사이트를 **정적 사이트**(미리 만들어 둔 파일을 그대로 보내 주는 사이트)라고 합니다.

**[4] 서버**: 결과물을 브라우저에게 건네주는 프로그램입니다. ts-wiki는 목적에 따라 세 가지를 씁니다.

| 방법 | 언제 쓰나 | 명령 | 주소 |
|---|---|---|---|
| A. 개발 서버 | 글을 쓰거나 고칠 때. 저장하면 브라우저가 바로 바뀜 | `npm run dev` | `http://localhost:5180` |
| B. nginx 컨테이너 | 사내 서버에 계속 켜 둘 때 | `docker compose up -d --build` | `http://localhost:8090` |
| C. GitHub Pages | 인터넷에 공개할 때 | `git push` (자동 배포) | `https://hong-coding.github.io/ts-wiki/` |

- A의 개발 서버는 예외적으로 [3] 결과물을 거치지 않습니다. 요청이 올 때마다 그 자리에서 마크다운을 변환해 보내 주기 때문에 저장 즉시 반영됩니다. 대신 빠르게 고쳐 보는 용도일 뿐, 손님(다른 사람)을 받는 용도는 아닙니다.
- B의 **nginx**(엔진엑스)는 정적 파일을 빠르게 보내 주는 데 특화된 웹 서버 프로그램이고, **Docker 컨테이너**는 그 nginx와 결과물을 상자 하나에 담아 어느 PC에서나 똑같이 실행되게 만든 것입니다.
- C의 **GitHub Pages**는 GitHub가 정적 파일을 대신 서비스해 주는 무료 호스팅입니다. **GitHub Actions**(GitHub의 자동 작업 실행기)가 push를 감지해 [2] 빌드부터 업로드까지 알아서 합니다.

**[5] 브라우저**: 주소를 입력하면 서버에 "이 페이지 주세요"라고 요청(request)하고, 서버가 보낸 응답(response)을 화면에 그립니다. 이 주고받기의 규칙을 **HTTP**라고 합니다.

::: tip 그림에서 꼭 기억할 한 줄
**"글은 마크다운, 화면은 HTML, 둘 사이를 잇는 것이 빌드, HTML을 건네주는 것이 서버."** 이 한 줄이 이 가이드 전체의 뼈대입니다.
:::

### 이 가이드는 그림의 어디를 다루나

| 파트 | 다루는 부분 | 한 줄 설명 |
|---|---|---|
| Part 0 시작하기 | 전체 | 지금 이 그림, 공부법, 도구 설치 |
| Part 1 웹 서버 기초 개념 | [4]·[5] 사이의 HTTP, [2]의 Node.js·npm, [2]→[3]의 빌드 | 브라우저·서버·포트·빌드라는 말을 정확히 쓰기 |
| Part 2 기술 선택의 이유 | [1]·[2]·[4] 전부 | 왜 마크다운·VitePress·TypeScript·Pages·Docker를 골랐나 |
| Part 3 라이브러리 사전 | [2]의 VitePress·Vite·Vue, [4-B]의 nginx·Docker, [4-C]의 Actions | 각 부품이 하는 일과 기본 사용법 |
| Part 4 ts-wiki 해부하기 | [1] 원고 폴더 전체 | ts-wiki의 파일을 한 줄씩 읽기 |
| Part 5 처음부터 따라 만들기 | [1]→[3] | 빈 폴더에서 나만의 위키를 빌드까지 |
| Part 6 서버 띄우기와 배포 | [4-A]·[4-B]·[4-C] | 세 가지 방법으로 띄우고, 안 뜰 때 원인 찾기 |
| Part 7 서버 학습 로드맵 | [4]를 더 깊게 | 위키를 넘어 일반 웹 서버 만들기·운영하기 |

처음 보는 단어가 많아도 괜찮습니다. 레슨을 하나 마칠 때마다 이 표로 돌아와 "지금 그림의 어디를 배웠지?"를 확인하면, 흩어진 지식이 한 그림에 자리를 잡습니다.

### 직접 확인해 보기 (선택)

설치가 이미 끝났다면 공개된 ts-wiki를 브라우저로 열어 봅니다. 설치 없이도 됩니다.

1. 브라우저 주소창에 `https://hong-coding.github.io/ts-wiki/`를 입력합니다.
2. 왼쪽 사이드바에서 Part 0의 아무 레슨이나 엽니다.
3. 페이지 맨 아래 "GitHub에서 이 페이지 고치기"를 누르면, 그 페이지의 **원고(마크다운)** 가 GitHub에 보입니다.

**확인 방법**: 브라우저에 보이는 화면(HTML)과 GitHub에 보이는 원고(마크다운)가 **같은 내용, 다른 모습**이라는 것을 눈으로 비교할 수 있으면 성공입니다. 그 둘 사이에서 일어난 일이 [2] 빌드입니다.

## ts-wiki에서는

그림의 각 칸이 ts-wiki의 어느 파일인지 연결해 봅니다. (경로는 `D:\workspace\ts-wiki` 기준)

| 그림의 칸 | 실제 파일 | 핵심 내용 |
|---|---|---|
| [1] 원고 | `docs/` 아래 `.md` 파일들 | `docs/part0-start/01-what-is-programming.md` 같은 레슨 파일 |
| [1] 설정 | `docs/.vitepress/config.mts` | 사이트 제목 `title: 'TypeScript 마스터 위키'`, 검색 `provider: 'local'` |
| [1] 레슨 목록 | `docs/.vitepress/curriculum.mts` | 사이드바·목차·체크리스트가 모두 이 파일에서 만들어짐 |
| [1] 화면 부품 | `docs/.vitepress/theme/components/*.vue` | `LessonMeta.vue`(배지), `ProgressChecklist.vue`(진도) 등 4개 |
| [2] 빌드 명령 | `package.json`의 `scripts` | `"build": "vitepress build docs"` |
| [3] 결과물 위치 | `.gitignore` | `docs/.vitepress/dist/`는 Git에 올리지 않음(언제든 다시 만들 수 있으므로) |
| [4-A] 개발 서버 | `package.json`의 `scripts` | `"dev": "vitepress dev docs --host 0.0.0.0 --port 5180"` |
| [4-B] 컨테이너 | `Dockerfile`, `nginx.conf`, `docker-compose.yml` | `node:22-alpine`에서 빌드 → `nginx:1.27-alpine`으로 서비스, `"8090:80"` |
| [4-C] Pages 배포 | `.github/workflows/deploy.yml` | `main`에 push하면 `npm ci` → `npm run build` → 업로드 → 배포 |

폴더 구조로 보면 그림의 칸들이 이렇게 배치되어 있습니다. (`node_modules`, `dist`, `cache`처럼 설치·빌드하면 생기는 폴더와 `.git`은 뺐습니다.)

```text
ts-wiki/
├── .github/workflows/deploy.yml   ← [4-C] GitHub Pages 자동 배포
├── docs/                          ← [1] 원고
│   ├── index.md                   ←     홈 화면
│   ├── guide/                     ←     학습 가이드(로드맵·목차·체크리스트…)
│   ├── part0-start/ … part9-master/  ← 레슨 마크다운
│   ├── appendix/                  ←     부록
│   ├── public/favicon.svg         ←     그대로 복사되는 파일(아이콘)
│   └── .vitepress/
│       ├── config.mts             ←     사이트 설정
│       ├── curriculum.mts         ←     레슨 목록(단일 출처)
│       └── theme/                 ←     화면 부품(index.ts, custom.css, components/*.vue)
├── examples/projects/             ←     실습 프로젝트 예제 코드(위키 빌드와는 별개)
├── scripts/fix-frontmatter.mjs    ←     문서 머리말 자동 수정 보조 스크립트
├── package.json                   ← [2] 빌드·[4-A] 개발 서버 명령
├── package-lock.json              ←     설치할 패키지의 정확한 버전 기록
├── Dockerfile                     ← [2]+[4-B] 이미지 만들기
├── nginx.conf                     ← [4-B] nginx 설정
├── docker-compose.yml             ← [4-B] 컨테이너 실행 설정
└── README.md
```

파일이 많아 보이지만, **사람이 평소에 고치는 곳은 `docs/` 아래의 마크다운**뿐입니다. 나머지는 한 번 만들어 두면 거의 손대지 않는 "인쇄소와 서점 설정"입니다. 각 파일은 [Part 4. ts-wiki 해부하기](../part4-anatomy/)에서 한 줄씩 읽습니다.

### 앞으로 자주 만날 용어 미리 보기

지금 외울 필요는 없습니다. 레슨을 읽다가 낯선 단어가 나오면 이 표로 돌아와 "그림의 어디쯤인지"만 확인합니다.

| 용어 | 한 줄 뜻 | 그림의 칸 | 자세히 배우는 곳 |
|---|---|---|---|
| 마크다운 | 기호로 서식을 표현하는 글쓰기 형식 | [1] | Part 2 |
| VitePress | 마크다운을 웹사이트로 만드는 도구(정적 사이트 생성기) | [2] | Part 3 |
| Node.js · npm | VitePress를 실행하는 프로그램과 패키지 관리 도구 | [2] | Part 1 |
| 빌드 | 원고를 결과물(HTML)로 바꾸는 작업 | [2]→[3] | Part 1 |
| 포트 | 한 컴퓨터 안에서 서버 프로그램을 구분하는 번호(5180, 8090 등) | [4] | Part 1 |
| nginx | 정적 파일을 보내 주는 웹 서버 프로그램 | [4-B] | Part 3 |
| Docker · 컨테이너 | 프로그램을 상자에 담아 어디서나 똑같이 실행하는 도구 | [4-B] | Part 3, 6 |
| GitHub Actions · Pages | push하면 자동으로 빌드·공개해 주는 GitHub 기능 | [4-C] | Part 3, 6 |
| HTTP | 브라우저와 서버가 주고받는 대화 규칙 | [4]↔[5] | Part 1 |

`package.json`의 `scripts` 부분을 그대로 옮기면 다음과 같습니다. [2]와 [4-A]가 한눈에 보입니다.

```json
  "scripts": {
    "dev": "vitepress dev docs --host 0.0.0.0 --port 5180",
    "build": "vitepress build docs",
    "fix:frontmatter": "node scripts/fix-frontmatter.mjs",
    "preview": "vitepress preview docs --host 0.0.0.0 --port 5180"
  },
```

`Dockerfile`은 [2] 빌드와 [4-B] 서비스를 한 파일에 담고 있습니다. 위쪽 `FROM node:22-alpine AS build` 단계가 그림의 [2], 아래쪽 `FROM nginx:1.27-alpine` 단계가 [4-B]입니다.

```dockerfile
# 사내 서버에 위키를 상시 띄울 때 쓰는 이미지: 빌드 후 nginx로 정적 파일을 서비스합니다.
FROM node:22-alpine AS build
# lastUpdated(마지막 수정 시각)를 만들 때 VitePress가 git을 실행하므로, alpine 이미지에 없는 git을 설치합니다.
RUN apk add --no-cache git
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html
EXPOSE 80
```

`COPY --from=build /app/docs/.vitepress/dist ...` 한 줄이 "[3] 결과물만 nginx 상자로 옮긴다"는 뜻입니다. nginx 상자에는 Node.js도 VitePress도 없고, HTML 파일만 들어갑니다. 정적 사이트라서 가능한 일입니다.

작성 시점(2026-10) 기준으로 이 가이드 작성 PC에서 ts-wiki를 빌드해 보면 약 2분이 걸리고, `dist` 폴더는 약 39MB입니다(검색 색인과 글꼴 파일 포함).

## 자주 하는 실수

### 1. 마크다운을 고쳤는데 Docker로 띄운 사이트에 반영이 안 된다

- **증상**: `http://localhost:5180`(개발 서버)에는 바뀐 내용이 보이는데 `http://localhost:8090`(컨테이너)에는 옛날 내용이 그대로입니다.
- **원인**: 컨테이너 안의 nginx는 **이미지를 만들 때 빌드해 둔** HTML을 보냅니다. 원고를 고쳐도 다시 빌드하지 않으면 그대로입니다. 그림의 [4-A]는 빌드를 거치지 않지만 [4-B]는 거칩니다.
- **해결**: `docker compose up -d --build`로 이미지를 다시 만듭니다. 자세한 것은 [서버에 상시 띄우기: Docker Compose](../part6-serve/04-compose)에서 다룹니다.

### 2. "서버"를 컴퓨터 한 대라고만 생각한다

- **증상**: "서버를 띄운다"는 말을 "새 컴퓨터를 산다"로 이해해 겁을 먹거나, 반대로 "내 PC는 서버가 아니니까 상관없다"고 생각합니다.
- **원인**: "서버"는 **요청을 받아 응답을 돌려주는 프로그램**을 가리킬 때가 더 많습니다. `npm run dev`를 실행한 순간 내 PC 안에서도 서버 프로그램이 하나 돌아갑니다.
- **해결**: 이 가이드에서 "서버를 띄운다"는 "서버 프로그램을 실행해 요청을 기다리게 한다"로 읽습니다. [웹은 어떻게 동작하나](../part1-concepts/01-web-and-server)에서 자세히 봅니다.

### 3. 결과물 폴더(dist)를 직접 고친다

- **증상**: `dist/index.html`을 열어 오타를 고쳤는데, 다음 빌드 후 다시 원래대로 돌아왔습니다.
- **원인**: `dist`는 빌드할 때마다 원고로부터 **새로 만들어지는** 폴더입니다. 인쇄된 책에 볼펜으로 고쳐 써도 다음 인쇄본에는 반영되지 않는 것과 같습니다.
- **해결**: 언제나 [1] 원고(`docs/**/*.md`, 설정 파일)를 고칩니다. ts-wiki가 `.gitignore`에 `docs/.vitepress/dist/`를 넣어 둔 이유도 "여기는 사람이 고치는 곳이 아니다"라는 뜻입니다.

## 직접 해 보기

### 과제 1 ⭐ 그림 다시 그리기

종이에 이 레슨의 전체 그림을 **보지 않고** 다시 그려 봅니다. 칸 다섯 개([1]~[5])와 화살표, [4]의 세 갈래만 있으면 됩니다.

::: details 정답 보기
원고(마크다운) → 빌드(VitePress, `npm run build`) → 결과물(`dist/`의 HTML) → 서버 세 가지(개발 서버 `5180` / nginx 컨테이너 `8090` / GitHub Pages) → 브라우저. 개발 서버는 빌드를 거치지 않고 원고에서 바로 화면을 만든다는 화살표가 있으면 만점입니다.
:::

### 과제 2 ⭐ 어느 칸일까?

다음 파일·명령이 그림의 어느 칸에 해당하는지 적어 봅니다: `curriculum.mts`, `npm run build`, `docs/.vitepress/dist/index.html`, `docker compose up -d --build`, `git push`

::: details 정답 보기
- `curriculum.mts` → [1] 원고(설정)
- `npm run build` → [2] 빌드
- `docs/.vitepress/dist/index.html` → [3] 결과물
- `docker compose up -d --build` → [2] 빌드 + [4-B] 컨테이너 (이미지 안에서 빌드하고 nginx로 띄움)
- `git push` → [4-C] GitHub Pages (Actions가 [2] 빌드부터 대신 함)
:::

### 과제 3 ⭐⭐ 원고와 화면 비교하기

공개된 ts-wiki(`https://hong-coding.github.io/ts-wiki/`)에서 레슨 하나를 열고, "GitHub에서 이 페이지 고치기"로 원고를 엽니다. 원고의 `<LessonMeta ... />` 한 줄이 화면에서 무엇으로 바뀌었는지 찾아봅니다.

::: details 힌트와 정답
원고 맨 위쪽에 `<LessonMeta level="입문" :minutes="30" ... />` 같은 줄이 있습니다. 화면에서는 "난이도 · 입문", "약 30분" 같은 둥근 배지가 됩니다. 이 변환을 하는 것이 `docs/.vitepress/theme/components/LessonMeta.vue`이고, 변환이 일어나는 시점이 [2] 빌드입니다.
:::

### 과제 4 ⭐⭐⭐ 세 가지 방법의 차이를 한 문장씩

개발 서버 · nginx 컨테이너 · GitHub Pages를 "누가 보나 / 언제 반영되나 / 무엇이 필요하나" 세 기준으로 한 문장씩 비교해 봅니다.

::: details 정답 예시
- 개발 서버: 나 혼자(또는 같은 네트워크의 동료) 보고, 저장 즉시 반영되며, 내 PC에 Node.js가 필요합니다.
- nginx 컨테이너: 사내 사람들이 보고, `docker compose up -d --build`를 다시 실행해야 반영되며, 서버에 Docker가 필요합니다.
- GitHub Pages: 인터넷의 누구나 보고, push 후 Actions가 끝나면 반영되며, GitHub 저장소가 필요합니다.
:::

## 확인 퀴즈

1. 브라우저가 실제로 받아서 그리는 것은 마크다운인가요, HTML인가요?
2. `docs/.vitepress/dist` 폴더는 사람이 직접 고치는 곳인가요?
3. 원고를 고친 뒤 **빌드 없이** 바로 반영되는 방법은 세 가지 중 무엇인가요?
4. ts-wiki를 Docker로 띄우면 기본 주소의 포트 번호는 몇 번인가요?
5. GitHub Pages 배포를 시작시키는 사람의 행동은 무엇인가요?

::: details 정답 보기
1. HTML입니다. 마크다운은 빌드 과정에서 HTML로 바뀝니다.
2. 아닙니다. 빌드할 때마다 새로 만들어지므로 원고를 고쳐야 합니다.
3. 개발 서버(`npm run dev`)입니다.
4. 8090번입니다(`docker-compose.yml`의 `"8090:80"`).
5. `main` 브랜치에 push하는 것입니다. 그 뒤는 GitHub Actions가 자동으로 합니다.
:::

## 정리

- ts-wiki는 마크다운으로 쓴 TypeScript 학습 위키이고, 이 가이드도 같은 구조입니다.
- 전체 흐름은 **원고(마크다운) → 빌드(VitePress) → 결과물(HTML) → 서버 → 브라우저**입니다.
- 서버는 세 가지입니다: 개발 서버(`5180`, 즉시 반영), nginx 컨테이너(`8090`, 상시 운영), GitHub Pages(인터넷 공개).
- 결과물(`dist`)은 언제든 다시 만들 수 있으므로 고치는 곳도, Git에 올리는 곳도 아닙니다.
- 이 가이드의 각 파트는 이 그림의 한 부분씩을 깊게 파고듭니다.

## 다음 단계

[서버 구축을 공부하는 법](./02-how-to-study)에서 이 그림을 내 손으로 켜고, 끄고, 망가뜨려 보며 공부하는 방법을 익힙니다.
