---
title: 용어 사전
---

# 용어 사전

이 가이드에 나오는 용어를 **한글 용어(가나다순)** 와 **영문 용어(ABC순)** 로 나눠 정리했습니다. 한글로 부르는 말이 따로 없으면 영문 쪽에 있습니다. "처음 나온 곳"은 그 용어를 자세히 다루는 레슨입니다.

::: tip 찾는 법
`Ctrl+K`(macOS는 `Cmd+K`)로 검색 창을 열어 용어를 입력하면 이 페이지와 그 용어가 나오는 레슨을 함께 찾을 수 있습니다.
:::

## 한글 용어 (가나다순)

| 용어 | 뜻 | 처음 나온 곳 |
|---|---|---|
| 개발 서버 | 글이나 코드를 고치는 동안 쓰는 임시 서버. 저장하면 바로 반영됩니다. ts-wiki는 `npm run dev`(포트 5180). | [개발 서버](../part6-serve/01-dev-server) |
| 검색 인덱스 | 검색을 빠르게 하려고 미리 만들어 둔 "단어 → 페이지" 찾아보기 표. VitePress 로컬 검색은 빌드 때 만듭니다. | [로컬 검색](../part3-libraries/04-local-search) |
| 대역폭(전송량) | 서버가 일정 기간 보낸 데이터의 양. GitHub Pages는 월 100GB 소프트 한도(작성 시점 공식 문서 기준). | [왜 GitHub Pages와 Docker인가](../part2-choices/05-why-hosting) |
| 데이터베이스(DB) | 데이터를 저장·검색하는 전용 프로그램. 동적 위키(Wiki.js 등)는 글을 DB에 저장합니다. | [위키 도구 비교](../part2-choices/01-wiki-tools-compare) |
| 동적 서버 | 요청이 올 때마다 프로그램이 계산해서 응답을 만드는 서버. | [정적 사이트와 동적 서버](../part1-concepts/02-static-vs-dynamic) |
| 런타임 | 프로그램을 실행하는 환경. JavaScript의 런타임은 Node.js(서버·PC)나 브라우저입니다. | [Node.js와 npm](../part1-concepts/04-node-npm) |
| 로컬 검색 | 검색 서버 없이 방문자 브라우저 안에서 하는 검색. VitePress는 MiniSearch를 씁니다. | [왜 VitePress인가](../part2-choices/02-why-vitepress) |
| 리버스 프록시 | 손님 요청을 먼저 받아 뒤쪽 서버로 넘겨 주는 서버. HTTPS 처리·주소 나누기에 씁니다. | [리버스 프록시와 HTTPS 개념](../part7-server-learning/04-reverse-proxy) |
| 리뷰 | 다른 사람(또는 미래의 나)이 변경 내용을 검토하는 일. 대부분 diff를 읽는 일입니다. | [왜 Markdown으로 쓰나](../part2-choices/03-why-markdown) |
| 빌드 | 사람이 쓴 원본(마크다운·TS)을 브라우저가 읽는 결과물(HTML·CSS·JS)로 바꾸는 단계. | [정적 사이트 생성기(SSG)와 빌드](../part1-concepts/05-ssg) |
| 사이드바 | 화면 왼쪽의 문서 목록. ts-wiki는 `curriculum.mts`에서 코드로 만듭니다. | [커리큘럼 파일로 사이드바 자동 생성](../part5-build-along/04-curriculum-sidebar) |
| 서버 | 요청을 받아 응답을 돌려주는 프로그램(또는 그 프로그램이 도는 컴퓨터). | [웹은 어떻게 동작하나](../part1-concepts/01-web-and-server) |
| 소프트 한도 | 넘는다고 바로 막히지는 않지만 안내·조치 대상이 되는 기준. | [왜 GitHub Pages와 Docker인가](../part2-choices/05-why-hosting) |
| 위지윅(WYSIWYG) | "보이는 그대로 편집"하는 방식. 문법 없이 화면에서 바로 글을 꾸밉니다. | [왜 Markdown으로 쓰나](../part2-choices/03-why-markdown) |
| 의존성 | 내 프로젝트가 쓰려고 설치한 다른 패키지. `package.json`의 `dependencies`·`devDependencies`. | [package.json과 npm 스크립트](../part4-anatomy/02-package-json) |
| 이미지(Docker) | 프로그램과 실행 환경을 묶어 둔 "설치가 끝난 상자". 실행하면 컨테이너가 됩니다. | [Docker와 Docker Compose](../part3-libraries/06-docker) |
| 이식성 | 다른 환경·도구로 옮기기 쉬운 정도. Markdown은 이식성이 높습니다. | [왜 Markdown으로 쓰나](../part2-choices/03-why-markdown) |
| 정적 사이트 | 미리 만들어 둔 파일을 그대로 보내 주기만 하는 사이트. ts-wiki 결과물이 이것입니다. | [정적 사이트와 동적 서버](../part1-concepts/02-static-vs-dynamic) |
| 정적 사이트 생성기(SSG) | 원본 글을 미리 HTML 파일 묶음으로 바꿔 두는 프로그램. VitePress·Docusaurus·MkDocs. | [정적 사이트 생성기(SSG)와 빌드](../part1-concepts/05-ssg) |
| 줄바꿈 문자(LF·CRLF) | 줄 끝을 나타내는 보이지 않는 글자. Windows는 CRLF, macOS·Linux는 LF를 주로 씁니다. ts-wiki는 LF로 고정. | [왜 Markdown으로 쓰나](../part2-choices/03-why-markdown) |
| 초과 속성 검사 | 객체를 바로 써 넣을 때, 타입에 없는 속성(오타 등)을 찾아내는 TypeScript 검사. | [왜 TypeScript로 쓰나](../part2-choices/04-why-typescript) |
| 컨테이너 | Docker 이미지를 실행한 것. 다른 프로그램과 격리된 작은 실행 공간입니다. | [Docker와 Docker Compose](../part3-libraries/06-docker) |
| 컴포넌트 | 화면을 이루는 재사용 부품. ts-wiki의 `LessonMeta`, `PartLessons` 등. | [테마 확장과 커스텀 컴포넌트](../part4-anatomy/05-theme-components) |
| 타입 | 값의 종류(문자열·숫자·특정 값 목록 등)를 적어 둔 규칙. TypeScript가 이 규칙으로 실수를 찾습니다. | [왜 TypeScript로 쓰나](../part2-choices/04-why-typescript) |
| 테마 | 사이트의 모양과 화면 구조를 정하는 부품 묶음. ts-wiki는 VitePress 기본 테마를 확장합니다. | [VitePress: 설정 · 라우팅 · 테마](../part3-libraries/01-vitepress) |
| 트레이드오프 | 하나를 얻으려고 다른 하나를 내주는 관계. | [Part 2 소개](../part2-choices/) |
| 패키지 | npm으로 설치하는 코드 묶음. vitepress, vue, typescript 모두 패키지입니다. | [Node.js와 npm](../part1-concepts/04-node-npm) |
| 포트 | 한 컴퓨터 안에서 프로그램을 구분하는 번호. 예: 5180, 8090, 80. | [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host) |
| 프로세스·PID | 실행 중인 프로그램 하나를 프로세스, 그 번호를 PID라고 합니다. 종료할 때 씁니다. | [명령어 모음](./01-commands) |
| 호스팅 | 사이트 파일을 올려 두고 인터넷(또는 사내망)에 서비스해 주는 것·곳. | [왜 GitHub Pages와 Docker인가](../part2-choices/05-why-hosting) |
| 환경 변수 | 프로그램 밖에서 넣어 주는 설정값. ts-wiki는 `WIKI_BASE`로 base 경로를 바꿉니다. | [config.mts 한 줄씩 읽기](../part4-anatomy/03-config) |

## 영문 용어 (ABC순)

| 용어 | 뜻 | 처음 나온 곳 |
|---|---|---|
| base | 사이트가 사는 경로. GitHub Pages 프로젝트 페이지는 `/저장소이름/`, 사내 Docker는 `/`. | [왜 GitHub Pages와 Docker인가](../part2-choices/05-why-hosting) |
| CI | Continuous Integration. push할 때마다 자동으로 빌드·검사하는 방식. GitHub Actions가 한 예입니다. | [GitHub Actions와 Pages 배포 액션](../part3-libraries/07-github-actions) |
| cleanUrls | 주소에서 `.html`을 뺀 깔끔한 주소를 쓰는 VitePress 설정. nginx에서는 `try_files`로 짝을 맞춥니다. | [nginx: 정적 파일 웹 서버](../part3-libraries/05-nginx) |
| CommonMark · GFM | Markdown의 기본 규격(CommonMark)과 GitHub 확장판(GitHub Flavored Markdown, 표·체크박스 등). | [왜 Markdown으로 쓰나](../part2-choices/03-why-markdown) |
| defineConfig | VitePress 설정 객체에 타입을 붙여 자동 완성·검사를 켜는 도우미 함수. | [왜 TypeScript로 쓰나](../part2-choices/04-why-typescript) |
| diff | 두 버전의 차이를 줄 단위로 보여 주는 결과. `git diff`. | [왜 Markdown으로 쓰나](../part2-choices/03-why-markdown) |
| Docker Compose | 컨테이너 실행 설정을 `docker-compose.yml`에 적어 두고 `docker compose up` 한 줄로 띄우는 도구. | [서버에 상시 띄우기: Docker Compose](../part6-serve/04-compose) |
| Dockerfile | Docker 이미지를 만드는 순서를 적은 파일. ts-wiki는 node로 빌드 → nginx로 서비스하는 두 단계. | [Docker 이미지로 묶기](../part6-serve/03-docker-nginx) |
| EADDRINUSE | "주소(포트)가 이미 사용 중"이라는 Node.js 오류 코드. | [문제 해결: 서버가 안 뜰 때](../part6-serve/06-troubleshooting) |
| ESM | ES Modules. `import`/`export`를 쓰는 현대 JavaScript 모듈 방식. `.mjs`·`.mts`의 `m`. | [왜 TypeScript로 쓰나](../part2-choices/04-why-typescript) |
| frontmatter | 마크다운 맨 위 `---` 사이에 쓰는 머리말(제목 등). YAML 형식입니다. | [보조 스크립트와 문서 작성 규칙](../part4-anatomy/06-scripts-and-rules) |
| GitHub Actions | GitHub 저장소에서 자동 작업(빌드·배포)을 돌리는 기능. ts-wiki는 `deploy.yml`. | [GitHub Actions와 Pages 배포 액션](../part3-libraries/07-github-actions) |
| GitHub Pages | GitHub 저장소의 정적 파일을 웹사이트로 서비스하는 기능. 무료 계정은 공개 저장소 조건(작성 시점 공식 문서 기준). | [GitHub Pages 자동 배포](../part6-serve/05-github-pages) |
| HMR | Hot Module Replacement. 새로 고침 없이 바뀐 부분만 브라우저에 교체하는 기능. | [왜 VitePress인가](../part2-choices/02-why-vitepress) |
| host · `0.0.0.0` | 서버가 어느 주소에서 요청을 받을지. `0.0.0.0`은 "이 PC의 모든 네트워크 주소에서 받기". | [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host) |
| HTTP · 상태 코드 | 브라우저와 서버의 대화 규칙. 응답에 붙는 숫자(200 성공, 404 없음, 500 서버 오류)가 상태 코드. | [웹은 어떻게 동작하나](../part1-concepts/01-web-and-server) |
| localhost | "이 컴퓨터 자신"을 가리키는 이름(보통 127.0.0.1). | [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host) |
| Markdown | `#`, `-`, `\|` 같은 간단한 기호로 서식을 표현하는 텍스트 문서 형식. | [왜 Markdown으로 쓰나](../part2-choices/03-why-markdown) |
| markdown-it | VitePress가 마크다운을 HTML로 바꿀 때 쓰는 라이브러리. | [마크다운 확장과 코드 하이라이트](../part3-libraries/03-markdown-it-shiki) |
| MDX | Markdown 안에 React 컴포넌트를 쓰는 형식. Docusaurus가 지원합니다. | [위키 도구 비교](../part2-choices/01-wiki-tools-compare) |
| MiniSearch | 브라우저에서 도는 작은 전문 검색 라이브러리. VitePress 로컬 검색이 씁니다. | [로컬 검색 (MiniSearch)](../part3-libraries/04-local-search) |
| multi-stage build | Dockerfile에서 빌드용 단계와 실행용 단계를 나눠 최종 이미지를 작게 만드는 방식. | [Docker 이미지로 묶기](../part6-serve/03-docker-nginx) |
| nginx | 정적 파일을 빠르게 보내 주는 웹 서버 프로그램. 리버스 프록시로도 씁니다. | [nginx: 정적 파일 웹 서버](../part3-libraries/05-nginx) |
| Node.js | 브라우저 밖(PC·서버)에서 JavaScript를 실행하는 런타임. | [Node.js와 npm](../part1-concepts/04-node-npm) |
| npm · npx | npm은 Node.js 패키지 관리 도구, npx는 설치된(또는 내려받은) 패키지의 명령을 실행하는 도구. | [Node.js와 npm](../part1-concepts/04-node-npm) |
| npm ci | `package-lock.json`을 그대로 따라 정확히 같은 버전을 설치하는 명령. CI·Docker용. | [package.json과 npm 스크립트](../part4-anatomy/02-package-json) |
| package-lock.json | 실제 설치된 모든 패키지의 정확한 버전을 기록한 파일. 재현 가능한 설치의 근거. | [package.json과 npm 스크립트](../part4-anatomy/02-package-json) |
| SaaS | Software as a Service. 설치 없이 회사가 운영하는 웹 서비스에 가입해 쓰는 방식. | [위키 도구 비교](../part2-choices/01-wiki-tools-compare) |
| satisfies | 값이 어떤 타입을 만족하는지 검사하되 값의 타입은 바꾸지 않는 TypeScript 연산자(4.9부터). | [왜 TypeScript로 쓰나](../part2-choices/04-why-typescript) |
| SFC | Single File Component. 스크립트·템플릿·스타일을 `.vue` 파일 하나에 담는 Vue 컴포넌트 형식. | [Vite와 Vue](../part3-libraries/02-vite-vue) |
| Shiki | 빌드할 때 코드 블록에 색을 입혀 HTML로 만드는 하이라이트 라이브러리. | [마크다운 확장과 코드 하이라이트](../part3-libraries/03-markdown-it-shiki) |
| SSR | Server-Side Rendering. 화면 HTML을 서버(VitePress는 빌드 시점)에서 미리 그리는 것. | [VitePress: 설정 · 라우팅 · 테마](../part3-libraries/01-vitepress) |
| tsc | TypeScript 컴파일러. `--noEmit`으로 타입 검사만 할 수 있습니다. | [왜 TypeScript로 쓰나](../part2-choices/04-why-typescript) |
| try_files | 요청 주소에 맞는 파일을 순서대로 찾아보는 nginx 지시어. | [nginx: 정적 파일 웹 서버](../part3-libraries/05-nginx) |
| TypeScript | JavaScript에 타입을 더한 언어. 실행 전에 실수를 찾게 해 줍니다. | [왜 TypeScript로 쓰나](../part2-choices/04-why-typescript) |
| v-pre | Vue에게 "이 안은 템플릿으로 해석하지 마"라고 알리는 표시. 펜스 코드 블록은 자동 적용. | [왜 VitePress인가](../part2-choices/02-why-vitepress) |
| Vite | 빠른 개발 서버·빌드 도구. VitePress가 그 위에서 동작합니다. | [Vite와 Vue](../part3-libraries/02-vite-vue) |
| VitePress | Vue 팀이 만든 정적 사이트 생성기. ts-wiki와 이 가이드가 씁니다(1.6.3). | [VitePress: 설정 · 라우팅 · 테마](../part3-libraries/01-vitepress) |
| Vue | 화면을 컴포넌트로 만드는 JavaScript 라이브러리. VitePress 기본 테마가 Vue로 되어 있습니다. | [Vite와 Vue](../part3-libraries/02-vite-vue) |
| YAML | 들여쓰기로 구조를 표현하는 설정 파일 형식. `docker-compose.yml`, `deploy.yml`, frontmatter. | [Docker와 Docker Compose](../part3-libraries/06-docker) |

## 다음 단계

용어를 알았는데도 막힌다면 [자주 묻는 질문](./03-faq)을 보세요.
