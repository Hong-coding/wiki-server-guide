---
title: 왜 GitHub Pages와 Docker(nginx)인가
---

# 왜 GitHub Pages와 Docker(nginx)인가

<LessonMeta level="초급" :minutes="35" prev="설정은 .mts로 써서 타입이 실수를 잡게 했고, 빌드는 타입 검사를 하지 않는다는 것을 확인했습니다." />

## 이번에 배울 것

- 빌드한 위키를 띄우는 방법 네 가지(GitHub Pages, Netlify·Vercel, 사내 서버 Docker + nginx, Node.js로 직접 서비스)를 비교할 수 있다.
- GitHub Pages의 무료 조건과 한도를 공식 문서 기준으로 말할 수 있다.
- ts-wiki가 **인터넷 공개용(GitHub Pages)과 사내 서버용(Docker + nginx)을 둘 다** 준비한 이유를 설명할 수 있다.
- 같은 빌드 결과물을 두 곳에 올릴 때 생기는 `base` 경로 차이를 설명할 수 있다.

## 먼저 알아 둘 것

- [정적 사이트와 동적 서버](../part1-concepts/02-static-vs-dynamic)
- [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host)
- [위키 도구 비교](./01-wiki-tools-compare): ts-wiki의 결과물은 HTML 파일 묶음(`docs/.vitepress/dist`)이라는 것

## 비유로 이해하기

한빛 카페가 메뉴판(빌드된 위키)을 다 찍었습니다. 이제 **어디에 붙일지** 정해야 합니다.

| 붙이는 곳 | 비유 | 호스팅 방법 |
|---|---|---|
| 구청이 무료로 빌려주는 **공공 게시판** | 누구나 지나가며 봅니다. 공짜지만 게시판 규칙(크기·내용)을 따라야 합니다. | GitHub Pages |
| **상가 관리 회사의 게시판** | 붙이기 쉽고 부가 서비스도 있지만, 회사 요금제를 따릅니다. | Netlify·Vercel |
| **우리 가게 안 게시판** | 직원만 봅니다. 위치·관리는 우리가 합니다. | 사내 서버 Docker + nginx |
| **직원이 손에 들고 서 있기** | 바로 보여 줄 수 있지만 직원이 퇴근하면 끝입니다. | Node.js로 직접 서비스 |

ts-wiki는 "손님도 보고(인터넷 공개), 직원도 가게 안에서 봐야(사내망)" 해서 **공공 게시판과 가게 안 게시판 두 곳에** 같은 메뉴판을 붙였습니다.

## 개념 설명

### 1. 요구사항: 호스팅에 무엇이 필요했나

| 요구사항 | 호스팅에 대한 질문 |
|---|---|
| 3. 무료로 인터넷 공개 | 돈 없이, 누구나 접속할 수 있는 주소가 생기나? |
| 4. 사내 서버에도 | 인터넷이 막힌 곳에서 외부 서비스 없이 돌아가나? |
| 5. 한 사람이 관리 | 배포가 자동인가? 서버가 꺼지면 누가 켜나? |
| (숨은 요구사항) 같은 결과물 | 두 곳의 위키가 똑같은 내용인가? |

ts-wiki의 결과물은 **정적 파일**이라는 점이 출발점입니다. 정적 파일은 "요청이 오면 파일을 그대로 보내 주는" 서버만 있으면 됩니다. 계산하는 서버(동적 서버)가 필요 없으니 고를 수 있는 곳이 많습니다.

### 2. 후보 네 가지

#### 후보 1: GitHub Pages

GitHub 저장소의 파일을 웹사이트로 서비스해 주는 기능입니다. 작성 시점 공식 문서 기준으로 정리하면 다음과 같습니다. **정책은 바뀔 수 있으니 공식 페이지에서 확인하세요**(주소는 [참고 자료](../appendix/04-resources)).

- **누가 쓸 수 있나**: GitHub Free(무료 계정)·GitHub Free 조직에서는 **공개(public) 저장소**에서 쓸 수 있습니다. 비공개(private) 저장소에서 쓰려면 GitHub Pro·Team·Enterprise 같은 유료 플랜이 필요합니다.
- **한도**(공식 문서 "GitHub Pages limits"):
  - 게시된 사이트 크기 최대 1GB
  - 배포는 10분 안에 끝나야 함(넘으면 시간 초과)
  - 대역폭(전송량) **월 100GB 소프트 한도**(soft limit, 넘으면 바로 막히기보다 안내·조치 대상이 되는 기준)
  - 시간당 10회 빌드 소프트 한도. 단, **직접 만든 GitHub Actions 워크플로로 빌드·배포하면 이 한도는 적용되지 않습니다.**
- **용도 제한**: 온라인 사업·전자상거래·상용 SaaS를 돌리는 무료 호스팅으로 쓰는 것은 허용되지 않고, 비밀번호·카드 번호 같은 민감한 거래에 쓰면 안 된다고 명시되어 있습니다.
- **자동 배포**: `main`에 push하면 GitHub Actions가 빌드해서 올리게 만들 수 있습니다.

#### 후보 2: Netlify · Vercel

정적 사이트(와 일부 서버 기능)를 올려 주는 클라우드 서비스입니다. 저장소를 연결하면 push할 때마다 자동 빌드·배포하고, PR마다 미리보기 주소를 만들어 주는 기능이 대표적입니다.

- 무료 요금제가 있지만 **빌드 시간·전송량·팀 인원·상업적 사용 여부** 등에 조건이 있습니다. 조건은 자주 바뀌므로 **작성 시점 기준, 공식 페이지에서 확인**하세요.
- 비공개 저장소도 연결할 수 있습니다(요금제 조건은 공식 페이지 확인).
- 인터넷 서비스이므로 사내망 전용 배포 용도는 아닙니다.

#### 후보 3: 사내 서버에 Docker + nginx

- **nginx**(엔진엑스): 정적 파일을 빠르게 보내 주는 웹 서버 프로그램입니다.
- **Docker**: 프로그램과 그 실행 환경을 **이미지**(설치가 끝난 상자)로 묶어, 어느 서버에서든 같은 방식으로 실행하게 해 주는 도구입니다. 이미지를 실행한 것을 **컨테이너**라고 부릅니다.
- 서버에 Node.js나 nginx를 직접 설치하지 않아도, Docker만 있으면 `docker compose up -d --build` 한 줄로 "빌드 → nginx로 서비스"까지 끝납니다.
- 인터넷이 막혀 있어도 **이미지를 만들 때 필요한 것(베이스 이미지, npm 패키지)만 준비되면** 서비스 자체는 외부에 기대지 않습니다.
- 대가: 서버를 켜 두고, 디스크·보안 업데이트·재시작을 **우리가** 챙겨야 합니다.

#### 후보 4: Node.js로 직접 서비스

`vitepress preview`나 직접 만든 Node.js 서버로 `dist` 폴더를 서비스하는 방법입니다.

- 가장 빨리 띄울 수 있습니다. 명령 하나면 됩니다.
- 하지만 `vitepress preview`는 공식 문서 기준 **배포 전에 로컬에서 확인하는 용도**입니다. 터미널을 닫거나 PC를 재부팅하면 꺼지고, 다시 켜 주는 장치가 없습니다.
- 실제로 이 레슨 작성 중, 이미 쓰고 있는 포트로 `preview`를 띄우자 아래처럼 바로 종료되었습니다. 개발 서버(`dev`)는 빈 포트를 찾아 옮겨 가지만 `preview`는 그러지 않습니다.

```text
Error: listen EADDRINUSE: address already in use :::5191
...
Node.js v24.13.1
```

### 3. 후보 비교표

| 후보 | 장점 | 단점 | 어울리는 상황 |
|---|---|---|---|
| GitHub Pages | 무료(공개 저장소), Actions로 자동 배포, 서버 관리 없음 | 무료는 공개 저장소 조건, 용량·전송량 한도, 사내망 불가, 상업적 서비스 용도 제한 | 공개 학습 위키·오픈소스 문서 |
| Netlify · Vercel | PR 미리보기, 비공개 저장소 연결, 설정 간편 | 요금제·한도 의존, 사내망 불가 | 팀 문서·미리보기 흐름이 중요한 프로젝트 |
| 사내 서버 Docker + nginx | 사내망에서 동작, 외부 정책 무관, 어느 서버에서든 같은 방식 | 서버 운영(켜 두기·업데이트·백업)이 우리 몫, Docker 학습 | 사내 전용·보안 요구가 있는 위키 |
| Node.js 직접 서비스 | 가장 빠르게 띄움, 추가 도구 없음 | 꺼지면 끝, 운영용 기능(캐시·재시작) 부족 | 내 PC에서 잠깐 확인·시연 |

### 4. 따라 하기: 정적 파일을 nginx 컨테이너로 띄워 보기

ts-wiki를 직접 Docker로 띄우는 것은 [Part 6](../part6-serve/03-docker-nginx)에서 자세히 합니다. 여기서는 "정적 파일 + nginx = 사내 서버 위키"라는 감각만 잡습니다. Docker Desktop을 켜 두세요.

#### 4-1. 아주 작은 위키 만들기

[2-2 실습](./02-why-vitepress)처럼 VitePress를 설치한 폴더(예: `vp-host`)에서 `docs/index.md`에 아래 내용을 넣고 빌드합니다.

```md
# 한빛 카페 위키

실습 페이지입니다.
```

```bash
npx vitepress build docs
```

**확인 방법**: `build complete`가 나오고 `docs/.vitepress/dist/index.html`이 생기면 성공입니다.

#### 4-2. Dockerfile과 compose 파일

폴더 맨 위에 두 파일을 만듭니다. ts-wiki보다 단순하게, **이미 빌드한 dist 폴더를 nginx에 복사만** 합니다.

```dockerfile
FROM nginx:1.27-alpine
COPY docs/.vitepress/dist /usr/share/nginx/html
EXPOSE 80
```

```yaml
services:
  gb-wiki:
    build: .
    container_name: gb-wiki
    ports:
      - "8190:80"
```

- `ports: "8190:80"`은 "내 PC의 8190번 포트로 오는 요청을 컨테이너 안 nginx의 80번 포트로 넘긴다"는 뜻입니다.

#### 4-3. 띄우고 확인하기

```bash
docker compose up -d --build
docker compose ps
```

실제 출력(일부):

```text
 Container gb-wiki  Started
NAME      IMAGE        COMMAND                   SERVICE   CREATED         STATUS         PORTS
gb-wiki   vp-gb-wiki   "/docker-entrypoint.…"   gb-wiki   9 seconds ago   Up 5 seconds   0.0.0.0:8190->80/tcp
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8190/
```

```text
200
```

PowerShell에서는 `curl` 대신 `curl.exe`라고 쓰고(Windows PowerShell 5.1의 `curl`은 `Invoke-WebRequest`의 별명입니다), 버릴 출력은 `NUL`로 보냅니다.

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8190/
```

**확인 방법**: `STATUS`가 `Up`이고, `curl` 결과가 `200`(성공)이며, 브라우저에서 `http://localhost:8190`을 열어 "한빛 카페 위키"가 보이면 성공입니다. 접속 기록은 `docker compose logs`로 볼 수 있습니다.

```text
gb-wiki  | 172.23.0.1 - - [28/Oct/2026:00:05:16 +0000] "GET / HTTP/1.1" 200 6418 "-" "curl/8.2.1" "-"
```

#### 4-4. 끄고 정리하기

```bash
docker compose down
docker rmi vp-gb-wiki
```

```text
 Container gb-wiki  Removed
 Network vp_default  Removed
```

`down`은 컨테이너와 네트워크를 지우고, `rmi`는 만든 이미지를 지웁니다. 이 실습에서 nginx 베이스 이미지는 빌드 도구가 따로 관리하므로 `docker rmi nginx:1.27-alpine`을 해도 `No such image`가 나올 수 있습니다. 그 경우 `docker builder prune`으로 빌드 캐시를 정리할 수 있습니다(다른 프로젝트 캐시도 지워지니 주의).

### 5. 둘 다 준비했을 때 생기는 문제: base 경로

같은 위키를 두 곳에 올리면 **주소 모양**이 다릅니다.

| 위치 | 위키 첫 페이지 주소 | 위키가 사는 경로 |
|---|---|---|
| GitHub Pages(프로젝트 페이지) | `https://hong-coding.github.io/ts-wiki/` | `/ts-wiki/` 아래 |
| 사내 서버 Docker | `http://<서버 IP>:8090/` | `/` (맨 위) |

VitePress는 CSS·JS·이미지 주소를 만들 때 **base**(사이트가 사는 경로)를 앞에 붙입니다. base가 틀리면 HTML은 열리는데 CSS·JS를 못 찾아 **글자만 덩그러니 있는 화면**이 됩니다. 그래서 ts-wiki는 base를 환경 변수로 바꿀 수 있게 했습니다.

## ts-wiki에서는

### base를 환경 변수로: `config.mts` 4~5번째 줄

```ts
// GitHub Pages(프로젝트 페이지)에 올릴 때는 /저장소이름/ 아래에서 서비스되므로 base를 환경 변수로 받습니다.
const base = process.env.WIKI_BASE ?? '/'
```

- `WIKI_BASE` 환경 변수가 있으면 그 값을, 없으면 `/`를 씁니다. `??`는 "왼쪽이 없으면(null·undefined) 오른쪽"이라는 연산자입니다.
- 사내 Docker 빌드에서는 환경 변수를 주지 않으므로 `/`가 됩니다.

### GitHub Pages 쪽: `.github/workflows/deploy.yml`

```yaml
      - run: npm ci
      - run: npm run build
        env:
          WIKI_BASE: /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist
```

- 29~35번째 줄입니다. 빌드할 때 `WIKI_BASE`에 저장소 이름(`ts-wiki`)을 넣어 `/ts-wiki/`로 만듭니다. 저장소 이름을 바꿔도 파일을 고칠 필요가 없게 GitHub이 주는 값(github.event.repository.name)을 씁니다.
- 빌드 결과(`docs/.vitepress/dist`)를 Pages용 묶음으로 올리고, 다음 단계(`deploy`)에서 `actions/deploy-pages@v4`가 게시합니다.
- 맨 위 `on: push: branches: [main]`이 "main에 push하면 자동 배포"를 만듭니다(요구사항 5). 직접 만든 Actions 워크플로이므로 "시간당 10회 빌드" 소프트 한도도 적용되지 않습니다(공식 문서 기준).
- 저장소 `Hong-coding/ts-wiki`는 **공개 저장소**라서 무료 계정으로 Pages를 쓸 수 있습니다(요구사항 3).

### 사내 서버 쪽: `Dockerfile` · `nginx.conf` · `docker-compose.yml`

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

- **두 단계 빌드**(multi-stage build)입니다. 첫 단계(`node:22-alpine`)에서 빌드하고, 둘째 단계(`nginx:1.27-alpine`)에는 결과물 `dist`만 가져옵니다. 최종 이미지에는 Node.js와 `node_modules`가 들어가지 않아 작고 단순합니다.
- 4-2 실습과 다른 점: 실습은 내 PC에서 빌드한 `dist`를 복사했지만, ts-wiki는 **이미지 안에서 빌드**합니다. 서버에 Node.js를 설치할 필요가 없습니다.
- 여기서는 `WIKI_BASE`를 주지 않으므로 base는 `/`입니다.

```nginx
    # cleanUrls: /guide/roadmap → /guide/roadmap.html
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
```

- `nginx.conf`의 이 부분은 `config.mts`의 `cleanUrls: true`(주소에서 `.html`을 뺀 깔끔한 주소)와 짝입니다. `/guide/roadmap`으로 요청이 오면 `roadmap.html` 파일을 찾아 줍니다. GitHub Pages는 이 처리를 알아서 해 주지만, nginx에는 직접 적어 줘야 합니다.

```yaml
services:
  ts-wiki:
    build: .
    container_name: ts-wiki
    ports:
      - "8090:80"
    restart: unless-stopped
```

- `restart: unless-stopped`는 "우리가 직접 멈추지 않은 한, 꺼지면 다시 켠다"는 뜻입니다. 서버 재부팅 뒤에도 Docker가 켜지면 위키가 돌아옵니다. 후보 4(Node.js 직접 서비스)에 없는 부분입니다.

### 왜 둘 다 준비했나

| 이유 | 설명 |
|---|---|
| 독자가 두 부류 | 인터넷의 누구나(공개 학습 위키) + 인터넷이 막힌 사내망의 동료 |
| 한쪽 장애 대비 | GitHub 장애나 정책 변경이 있어도 사내 서버 위키는 그대로, 반대도 마찬가지 |
| 비용 0 유지 | 공개 쪽은 무료 Pages, 사내 쪽은 이미 있는 서버에 Docker만 |
| 같은 원본 | 둘 다 같은 저장소·같은 `npm run build` 결과. 다른 것은 `WIKI_BASE` 하나 |

### ts-wiki의 결정과 그 대가

| 얻은 것 | 내준 것(대가) |
|---|---|
| 무료 공개 + 자동 배포(Pages) | 공개 저장소여야 함(무료 조건). 저장소 내용 전체가 공개됨 |
| 사내망에서도 같은 위키(Docker) | 사내 서버는 자동 배포가 아님. 글을 고친 뒤 서버에서 `docker compose up -d --build`를 다시 실행해야 함 |
| 두 곳이 같은 결과물 | base 경로를 환경 변수로 나눠야 하고, 한쪽만 확인하면 다른 쪽 문제를 놓칠 수 있음 |
| 외부 정책·장애에 덜 흔들림 | 관리할 배포 경로가 두 개 |

::: warning 공개 저장소라는 대가를 가볍게 보지 마세요
무료 GitHub Pages를 쓰려면 저장소가 공개되므로, 커밋 기록까지 누구나 볼 수 있습니다. 사내 서버 주소, 계정, 토큰, 고객 정보 같은 것은 **한 번이라도 커밋하면 안 됩니다.** ts-wiki의 `.gitignore`에 `.env`, `.env.*`가 들어 있는 이유입니다.
:::

## 이럴 땐 다른 걸 고르세요

- **사내 전용이고 인터넷 공개가 필요 없다** → Docker + nginx 하나만 두면 됩니다. 공개 저장소일 필요도 없습니다.
- **저장소를 비공개로 두면서 인터넷에 공개하고 싶다** → GitHub 유료 플랜의 Pages, 또는 Netlify·Vercel 같은 서비스를 검토합니다(요금·조건은 작성 시점 기준, 공식 페이지에서 확인).
- **PR마다 미리보기 주소가 필요하다** → Netlify·Vercel의 미리보기 기능이 편합니다.
- **사내 서버에도 자동 배포가 필요하다** → 사내 CI(자동 빌드) 도구나 GitHub Actions의 자체 호스팅 러너(self-hosted runner)를 검토합니다. 보안 검토가 함께 필요합니다.
- **로그인한 사람만 봐야 한다** → 정적 호스팅만으로는 부족합니다. 사내 인증 프록시 뒤에 nginx를 두거나 동적 위키를 검토합니다([리버스 프록시와 HTTPS 개념](../part7-server-learning/04-reverse-proxy)).

## 자주 하는 실수

### 실수 1: GitHub Pages에서 글자만 보이고 디자인이 없음

- **증상**: `https://<사용자>.github.io/<저장소>/`는 열리는데 CSS가 없는 화면이고, 브라우저 개발자 도구에 CSS·JS 파일 404가 보입니다.
- **원인**: base가 `/`로 빌드되어, 파일을 `/<저장소>/assets/...`가 아니라 `/assets/...`에서 찾았습니다.
- **해결**: 빌드할 때 `WIKI_BASE=/<저장소>/`를 주었는지 워크플로를 확인합니다.

### 실수 2: Docker 위키에서 새로 고침하면 404

- **증상**: 첫 화면에서 메뉴를 눌러 이동하면 되는데, `/guide/roadmap` 주소에서 새로 고침하면 404가 납니다.
- **원인**: nginx가 `roadmap`이라는 파일을 찾다가 없어서 404를 냈습니다. `cleanUrls`에 맞는 `try_files` 설정이 빠졌습니다.
- **해결**: `nginx.conf`에 `try_files $uri $uri.html $uri/ =404;`를 두고 이미지를 다시 빌드합니다.

### 실수 3: 글을 고쳤는데 사내 위키가 그대로

- **증상**: GitHub Pages에는 반영됐는데 사내 서버 위키는 옛날 내용입니다.
- **원인**: Docker 이미지는 만들 때의 파일로 굳어 있습니다. 서버에서 다시 빌드하지 않았습니다.
- **해결**: 서버에서 최신 코드를 받고(`git pull`) `docker compose up -d --build`를 다시 실행합니다.

### 실수 4: 포트가 이미 사용 중

- **증상**: `docker compose up`에서 `port is already allocated`, 또는 `vitepress preview`에서 `EADDRINUSE`
- **원인**: 같은 포트를 다른 프로그램(다른 컨테이너, 켜 둔 개발 서버)이 쓰고 있습니다.
- **해결**: 포트를 쓰는 프로그램을 찾아 끄거나, compose의 왼쪽 포트 번호를 바꿉니다. 찾는 명령은 [명령어 모음](../appendix/01-commands)의 "포트 확인·프로세스 종료"에 있습니다.

## 직접 해 보기

### 과제 1 ⭐ 주소 맞히기

저장소 이름이 `cafe-wiki`이고 GitHub 사용자 이름이 `hanbit`일 때, GitHub Pages 주소와 `WIKI_BASE` 값은?

::: details 정답 보기
- 주소: `https://hanbit.github.io/cafe-wiki/`
- `WIKI_BASE`: `/cafe-wiki/`
:::

### 과제 2 ⭐⭐ 4절 실습을 포트만 바꿔서

4절 실습의 compose 파일에서 `8190:80`을 `8191:80`으로 바꾸고 다시 띄우세요. 어느 주소로 접속해야 하나요? 컨테이너 안 nginx의 포트는 바뀌었나요?

::: details 정답 보기
`http://localhost:8191`로 접속합니다. 바뀐 것은 내 PC 쪽(왼쪽) 포트뿐이고, 컨테이너 안 nginx는 여전히 80번에서 듣습니다. 끝나면 `docker compose down`으로 정리합니다.
:::

### 과제 3 ⭐⭐ 내 상황에 맞는 호스팅 고르기

다음 세 상황에 맞는 호스팅을 고르고 이유를 한 줄씩 적어 보세요.

1. 한빛 카페 직원용 매뉴얼. 매장 PC에서만 보면 된다.
2. 오픈소스 라이브러리 문서. 누구나 봐야 하고 돈은 쓰기 싫다.
3. 회사 신제품 문서. 출시 전까지 저장소는 비공개, 리뷰어에게 미리보기 주소를 보내야 한다.

::: details 정답 보기
1. 매장(사내) PC에 Docker + nginx. 인터넷 공개가 필요 없고 외부 정책에 기대지 않습니다.
2. GitHub Pages. 공개 저장소라면 무료이고 Actions로 자동 배포됩니다.
3. Netlify·Vercel 같은 서비스(또는 GitHub 유료 플랜). 비공개 저장소 연결과 PR 미리보기가 필요합니다. 요금 조건은 공식 페이지에서 확인합니다.
:::

### 과제 4 ⭐⭐⭐ base를 틀려 보기

4절 실습 위키를 `base`를 `/cafe/`로 설정해 빌드한 뒤(설정 파일에 `base: '/cafe/'`), 같은 nginx 컨테이너로 띄워 `http://localhost:8190/`을 열어 보세요. 무엇이 보이고, 왜 그런가요?

::: details 힌트
HTML은 열리지만 CSS·JS를 `/cafe/assets/...`에서 찾으므로 nginx에는 그 경로가 없어 404가 납니다(브라우저 개발자 도구 F12 → Network 탭에서 확인). 실수 1과 같은 현상을 반대 방향에서 재현한 것입니다. nginx 쪽에서 `/cafe/` 아래에 파일을 두거나, base를 `/`로 되돌리면 해결됩니다.
:::

## 확인 퀴즈

1. 무료 GitHub 계정으로 GitHub Pages를 쓰려면 저장소가 어떤 상태여야 하나요? (공식 문서 기준)
2. `vitepress preview`를 운영용 서버로 쓰지 않는 이유 두 가지는?
3. ts-wiki의 `Dockerfile`이 두 단계(`node` → `nginx`)로 나뉜 이유는?
4. 같은 위키를 GitHub Pages와 사내 Docker에 올릴 때 빌드 설정에서 달라지는 값 하나는?
5. `restart: unless-stopped`가 해 주는 일은?

::: details 정답 보기
1. 공개(public) 저장소여야 합니다. 비공개 저장소는 유료 플랜에서 지원됩니다(작성 시점 기준, 공식 페이지에서 확인).
2. 공식 문서 기준 로컬 확인용이고, 터미널을 닫거나 재부팅하면 꺼지며 다시 켜 주는 장치가 없습니다(포트 충돌 시 그냥 종료되기도 합니다).
3. 첫 단계에서 Node.js로 빌드하고, 최종 이미지에는 결과물만 nginx와 함께 담아 작고 단순하게 만들기 위해서입니다. 서버에 Node.js를 설치할 필요도 없습니다.
4. `WIKI_BASE`(base 경로)입니다. Pages는 `/ts-wiki/`, 사내 Docker는 `/`입니다.
5. 직접 멈추지 않은 한, 컨테이너가 꺼지거나 Docker가 다시 시작될 때 컨테이너를 다시 켭니다.
:::

## 정리

- ts-wiki의 결과물은 정적 파일이라, 파일을 보내 주기만 하는 어떤 호스팅에도 올릴 수 있습니다.
- GitHub Pages는 공개 저장소면 무료이고 Actions로 자동 배포되지만, 용량·전송량 한도와 용도 제한이 있습니다(공식 문서 기준).
- Netlify·Vercel은 미리보기 등 편의 기능이 있지만 요금제에 의존합니다.
- 사내 서버 Docker + nginx는 사내망에서 독립적으로 돌아가는 대신 운영을 우리가 맡습니다.
- `vitepress preview` 같은 Node.js 직접 서비스는 확인용입니다.
- ts-wiki는 두 독자층(인터넷·사내망)과 장애 대비를 위해 **같은 빌드를 두 곳에** 올리고, 차이는 `WIKI_BASE` 하나로 흡수했습니다.

## 다음 단계

Part 2를 마쳤습니다. [Part 3. 라이브러리 사전](../part3-libraries/)에서 지금까지 이름만 나온 VitePress·Vite·Vue·Shiki·MiniSearch·nginx·Docker·GitHub Actions가 각각 무슨 일을 하고 어떻게 쓰는지 하나씩 익힙니다.
