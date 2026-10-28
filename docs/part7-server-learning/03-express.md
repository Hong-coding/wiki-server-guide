---
title: Express로 웹 서버 만들기
---

# Express로 웹 서버 만들기

<LessonMeta level="실전" :minutes="60" prev="Node.js 기본 모듈만으로 ts-wiki의 dist를 서비스하는 정적 파일 서버를 직접 만들었습니다." />

## 이번에 배울 것

- Express 5를 설치하고 TypeScript로 서버를 작성할 수 있다.
- 미들웨어가 무엇이고, 요청이 미들웨어를 어떤 순서로 지나가는지 설명할 수 있다.
- `express.static`으로 정적 파일을, `extensions` 옵션으로 cleanUrls를 처리할 수 있다.
- 헬스 체크 엔드포인트(`/health`), 요청 로그, 404·에러 처리를 붙일 수 있다.
- 7-2의 맨손 서버와 비교해 프레임워크가 덜어 주는 일을 말할 수 있다.

## 먼저 알아 둘 것

- [Node.js로 정적 파일 서버 직접 만들기](./02-node-http) — 이 레슨은 그 서버를 다시 만드는 것입니다.
- 실습 폴더 `D:\lab\ts-wiki-copy`에 빌드 결과물(`docs/.vitepress/dist`)이 있어야 합니다.

## 비유로 이해하기

7-2에서는 혼자서 주문 받기·재료 찾기·포장·계산을 모두 했습니다. Express는 **컨베이어 벨트가 있는 주방**입니다.

- 주문서(요청)가 벨트에 올라가면 **작업대(미들웨어)** 를 차례로 지나갑니다.
- 첫 작업대는 주문 시각을 장부에 적습니다(로깅).
- 다음 작업대는 "상태 확인 주문(`/health`)"이면 바로 "정상 영업 중" 쪽지를 내보냅니다.
- 그다음 작업대는 진열장(`dist`)에서 해당 빵을 찾아 내보냅니다(`express.static`).
- 아무도 처리하지 못한 주문서는 마지막 작업대에서 "그런 메뉴 없음"(404)으로 나갑니다.
- 어느 작업대에서든 사고가 나면(에러) 벨트 옆 **사고 처리반(에러 처리 미들웨어)** 으로 곧장 넘어갑니다.

작업대를 끼우고 빼는 것만으로 기능을 늘릴 수 있다는 것이 프레임워크의 힘입니다.

## 따라 하기

### 1단계. 프로젝트 만들고 Express 설치

```powershell
mkdir D:\lab\express-server
cd D:\lab\express-server
npm init -y
npm pkg set type=module
npm install express
npm install -D @types/express @types/node@24 typescript@5.6.3
npm ls
```

```text
found 0 vulnerabilities
found 0 vulnerabilities
express-server@1.0.0 D:\lab\express-server
+-- @types/express@5.0.6
+-- @types/node@24.19.2
+-- express@5.3.0
`-- typescript@5.6.3
```

- 작성 시점(2026-10) `npm install express`로 설치된 버전은 **5.3.0**입니다. 확인 방법은 `npm view express dist-tags`입니다.

```bash
npm view express dist-tags
```

```text
{ latest: '5.3.0', 'latest-4': '4.22.3' }
```

- `latest`가 5.x, `latest-4`가 4.x 계열입니다. 인터넷의 오래된 예제는 Express 4 기준이 많습니다. 4와 5는 비동기 에러 처리, 경로 패턴(`*` 쓰는 법) 등이 다르므로 예제를 볼 때 버전을 확인합니다.
- `express`는 실행에 필요하므로 일반 의존성(`dependencies`)으로, 타입 패키지와 `typescript`는 개발용(`-D`, `devDependencies`)으로 설치했습니다.

빌드 결과물도 복사해 둡니다.

::: code-group

```powershell [Windows (PowerShell)]
Copy-Item -Recurse D:\lab\ts-wiki-copy\docs\.vitepress\dist D:\lab\express-server\dist
```

```bash [macOS / Linux]
cp -r ~/lab/ts-wiki-copy/docs/.vitepress/dist ~/lab/express-server/dist
```

:::

### 2단계. 서버 코드 작성

`D:\lab\express-server\app.ts`:

```ts
// Express 5로 위키(dist)를 서비스하면서 헬스 체크·로그·에러 처리를 붙인 서버
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import path from 'node:path'

const ROOT = path.resolve(process.argv[2] ?? 'dist')
const PORT = Number(process.env.PORT ?? 8194)
const startedAt = Date.now()

const app = express()

// 1) 로깅 미들웨어: 모든 요청이 가장 먼저 지나갑니다.
app.use((req: Request, res: Response, next: NextFunction) => {
  const t = Date.now()
  // 응답이 끝난 뒤(finish)에 상태 코드와 걸린 시간을 남깁니다.
  res.on('finish', () => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - t}ms)`)
  })
  next()
})

// 2) 헬스 체크: 서버가 살아 있는지 기계(모니터링·로드밸런서)가 확인하는 주소
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptimeSec: Math.round((Date.now() - startedAt) / 1000) })
})

// 3) 일부러 에러를 내는 주소(에러 처리 확인용). async 함수에서 throw해도 Express 5는 에러 처리기로 넘깁니다.
app.get('/boom', async () => {
  throw new Error('일부러 낸 에러')
})

// 4) 정적 파일: extensions 옵션이 cleanUrls(/guide/roadmap → roadmap.html)를 대신합니다.
app.use(express.static(ROOT, { extensions: ['html'] }))

// 5) 여기까지 아무도 응답하지 않았으면 404
app.use((_req: Request, res: Response) => {
  res.status(404).sendFile(path.join(ROOT, '404.html'))
})

// 6) 에러 처리 미들웨어: 인자가 4개여야 Express가 에러 처리기로 알아봅니다.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('에러:', err.message)
  res.status(500).json({ error: 'Internal Server Error' }) // 내부 메시지는 사용자에게 보여 주지 않습니다.
})

app.listen(PORT, () => {
  console.log(`서비스 폴더: ${ROOT}`)
  console.log(`http://localhost:${PORT} 에서 기다리는 중 (끄려면 Ctrl+C)`)
})
```

49줄입니다. 7-2의 106줄과 비교하면 절반 이하인데, 헬스 체크와 에러 처리까지 더 들어 있습니다.

### 3단계. 코드 읽기: 미들웨어와 순서

**미들웨어**는 `(req, res, next) => { ... }` 모양의 함수입니다. 세 가지 중 하나를 합니다.

1. 응답을 보내고 끝낸다(`res.json(...)`, `res.sendFile(...)`).
2. 할 일을 하고 `next()`를 불러 **다음 미들웨어에게 넘긴다**(로깅 미들웨어).
3. 에러를 넘긴다(`next(err)` 또는 `async` 함수 안에서 `throw`).

Express는 `app.use`·`app.get`으로 등록한 **순서대로** 요청을 흘려보냅니다. 그래서 순서가 곧 동작입니다.

```text
요청 ─▶ ① 로깅 ─next()─▶ ② /health? ─아니오─▶ ③ /boom? ─아니오─▶ ④ static(파일 있나?) ─없음─▶ ⑤ 404
            │                 │예                 │예(throw)              │있음
            │                 ▼                   ▼                       ▼
            │             JSON 응답          ⑥ 에러 처리기 → 500        파일 응답
            └─ 응답이 끝나면(finish) 한 줄 로그
```

- `app.get('/health', ...)`은 **메서드가 GET이고 경로가 정확히 `/health`일 때만** 실행되는 미들웨어입니다. 이것을 **라우팅**이라고 합니다.
- ⑤ 404 미들웨어는 맨 뒤에 있어야 합니다. 맨 앞에 두면 모든 요청이 404가 됩니다.
- ⑥ 에러 처리 미들웨어는 **인자가 4개**(`err, req, res, next`)인 것으로 구분됩니다. 쓰지 않는 `_next`를 지우면 Express가 일반 미들웨어로 착각하므로 그대로 둡니다. 이름 앞의 `_`는 "일부러 안 쓰는 값"이라는 관례입니다.
- **Express 5의 변화**: Express 4에서는 `async` 함수 안에서 `throw`한 에러가 에러 처리기로 가지 않아 직접 `try/catch` 후 `next(err)`를 불러야 했습니다. Express 5는 이를 자동으로 넘겨 줍니다(아래 4단계에서 `/boom`으로 확인).
- `express.static(ROOT, { extensions: ['html'] })`: 파일이 없으면 `.html`을 붙여 한 번 더 찾습니다. 7-2의 `findFile`이 하던 일입니다. 폴더 요청이면 `index.html`을 찾고, 경로 탐색 공격도 내부에서 막습니다.

### 4단계. 타입 검사와 실행

```bash
npx tsc --strict --noEmit --module nodenext --target es2022 --types node --esModuleInterop app.ts
```

출력이 없으면 통과입니다. `--esModuleInterop`은 `import express from 'express'`처럼 예전 방식(CommonJS)으로 만든 패키지를 기본 가져오기로 읽을 수 있게 하는 옵션입니다.

::: code-group

```powershell [Windows (PowerShell)]
cd D:\lab\express-server
node app.ts dist
```

```bash [macOS / Linux]
cd ~/lab/express-server
node app.ts dist
```

:::

```text
서비스 폴더: D:\lab\express-server\dist
http://localhost:8194 에서 기다리는 중 (끄려면 Ctrl+C)
```

새 터미널에서 확인합니다(PowerShell은 `curl.exe`, `NUL`로 바꿉니다).

```bash
for p in / /guide/roadmap /favicon.svg /nope /health /boom; do
  curl -s -o /dev/null -w "%{http_code} %{content_type} $p\n" http://localhost:8194$p
done
curl -s http://localhost:8194/health; echo
curl -s http://localhost:8194/boom; echo
```

```text
200 text/html; charset=utf-8 /
200 text/html; charset=utf-8 /guide/roadmap
200 image/svg+xml /favicon.svg
404 text/html; charset=utf-8 /nope
200 application/json; charset=utf-8 /health
500 application/json; charset=utf-8 /boom
{"status":"ok","uptimeSec":4}
{"error":"Internal Server Error"}
```

서버 터미널의 로그입니다.

```text
2026-10-28T00:08:46.176Z GET / → 200 (23ms)
2026-10-28T00:08:46.428Z GET /guide/roadmap → 200 (5ms)
2026-10-28T00:08:46.645Z GET /favicon.svg → 200 (3ms)
2026-10-28T00:08:46.855Z GET /nope → 404 (5ms)
2026-10-28T00:08:47.072Z GET /health → 200 (3ms)
에러: 일부러 낸 에러
2026-10-28T00:08:47.319Z GET /boom → 500 (2ms)
```

- `/boom`의 에러 내용("일부러 낸 에러")은 **서버 로그에만** 남고, 손님에게는 `Internal Server Error`만 갑니다. 에러 메시지에는 파일 경로·DB 정보 같은 내부 정보가 섞이기 쉬우므로 밖에 보여 주지 않는 것이 원칙입니다.
- 7-2에서 했던 경로 탐색 요청도 보내 봅니다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8194/..%2fpackage.json"
```

```text
404
```

`express.static`이 서비스 폴더 밖으로 나가지 못하게 막아 404로 응답했습니다.

### 5단계. 응답 헤더 비교

```bash
curl -sI http://localhost:8194/guide/roadmap
```

```text
HTTP/1.1 200 OK
X-Powered-By: Express
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Wed, 28 Oct 2026 00:08:37 GMT
ETag: W/"12209-1a17fd65d32"
Content-Type: text/html; charset=utf-8
Content-Length: 74249
Date: Wed, 28 Oct 2026 00:08:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

7-2 서버에는 없던 헤더가 여럿 생겼습니다.

| 헤더 | 뜻 | 7-2에서 직접 하려면 |
|---|---|---|
| `ETag`, `Last-Modified` | 파일 버전 표시. 브라우저가 "바뀌었나?"만 물어보고, 안 바뀌었으면 304(본문 없음)로 응답 | 파일 수정 시각·크기로 값을 만들고 `If-None-Match` 요청 헤더와 비교 |
| `Accept-Ranges: bytes` | 파일 일부만 달라는 요청(동영상 건너뛰기 등)을 지원 | `Range` 헤더 해석, 206 응답 |
| `Cache-Control` | 캐시 정책(기본 `max-age=0`: 매번 확인) | 직접 헤더 작성 |
| `X-Powered-By: Express` | "Express로 만든 서버"라는 광고 | 없음(오히려 끄는 게 좋음, 아래 팁) |

::: tip `X-Powered-By`는 끄는 편이 좋습니다
서버 종류와 버전을 밖에 알리면 공격자가 알려진 취약점을 고르기 쉬워집니다. `const app = express()` 다음 줄에 `app.disable('x-powered-by')`를 추가하면 사라집니다. 7-6의 보안 체크리스트에서 다시 다룹니다.
:::

### 6단계. 환경 변수로 포트 바꾸기

::: code-group

```powershell [Windows (PowerShell)]
$env:PORT = '8196'
node app.ts dist
```

```bash [macOS / Linux]
PORT=8196 node app.ts dist
```

:::

설정이 여러 개가 되면 `.env` 파일에 모아 두고 Node의 `--env-file` 옵션으로 읽을 수 있습니다(Node 24.13.1에서 확인).

```text
PORT=8196
```

```bash
node --env-file=.env app.ts dist
curl -s http://localhost:8196/health
```

```text
{"status":"ok","uptimeSec":2}
```

::: warning `.env`는 저장소에 올리지 않습니다
`.env`에는 나중에 DB 비밀번호·API 키 같은 시크릿이 들어가게 됩니다. `.gitignore`에 `.env`를 꼭 넣습니다. ts-wiki의 `.gitignore`도 그렇게 되어 있습니다(아래 "ts-wiki에서는" 참고).
:::

**확인 방법**: `/health`가 `{"status":"ok", ...}`를 돌려주고, 서버를 끈 뒤(`Ctrl+C`) 같은 curl이 연결 실패(`curl: (7) Failed to connect`)로 바뀌면 성공입니다.

### 7단계. 7-2와 비교: 프레임워크가 덜어 준 것

| 일 | 7-2 맨손 서버 | Express 5 |
|---|---|---|
| 주소 → 파일, cleanUrls | `toSafePath` + `findFile` 직접 작성 | `express.static(ROOT, { extensions: ['html'] })` 한 줄 |
| 경로 탐색 방어 | `startsWith` 검사 직접 작성 | 내장 |
| MIME 타입 | 표를 직접 관리 | 내장(수백 가지 확장자) |
| 잘못된 `%` 인코딩 | `try/catch`로 400 처리 | 내장 |
| GET/HEAD 외 메서드 | 405 직접 처리 | `express.static`은 GET·HEAD만 처리하고 나머지는 다음으로 넘김 |
| 캐시 헤더(ETag, 304) | 없음 | 내장 |
| 주소별 처리(`/health`) | `if (url === ...)` 분기를 직접 늘려야 함 | `app.get('/health', ...)` |
| 에러 처리 | 바깥 `try/catch` 한 곳 | 에러 처리 미들웨어, async 에러 자동 전달 |
| JSON 응답 | `writeHead` + `JSON.stringify` | `res.json(...)` |

반대로 **프레임워크를 써도 내가 정해야 하는 것**도 있습니다. 미들웨어의 순서, 에러 메시지를 밖에 얼마나 보여 줄지, 어떤 주소를 열어 둘지, 로그에 무엇을 남길지(비밀번호·토큰은 남기지 않기)는 여전히 내 책임입니다. 7-2를 먼저 해 본 이유가 여기에 있습니다. 프레임워크가 "무엇을 대신해 주는지" 알아야 "무엇을 대신해 주지 않는지"도 보입니다.

## ts-wiki에서는

ts-wiki는 Express를 쓰지 않습니다. 정적 파일만 내주면 되기 때문에, 서비스는 nginx(`Dockerfile` 11번 줄 `FROM nginx:1.27-alpine`)나 GitHub Pages가 맡습니다. 이것은 [왜 GitHub Pages와 Docker(nginx)인가](../part2-choices/05-why-hosting)에서 본 "정적이면 서버 프로그램을 만들지 않는다"는 선택입니다.

그래도 이번 서버와 ts-wiki 설정은 일대일로 대응합니다.

| 이번 Express 코드 | ts-wiki |
|---|---|
| `express.static(ROOT, { extensions: ['html'] })` | `nginx.conf` 9번 줄 `try_files $uri $uri.html $uri/ =404;` |
| 404 미들웨어의 `sendFile(... '404.html')` | `nginx.conf` 12번 줄 `error_page 404 /404.html;` |
| `process.env.PORT` | `package.json` 8번 줄 `--port 5180`, `docker-compose.yml` 6번 줄 `"8090:80"` |
| 환경 변수로 설정 받기 | `docs/.vitepress/config.mts` 5번 줄 `const base = process.env.WIKI_BASE ?? '/'` |
| `.env`는 올리지 않기 | `.gitignore` 7~8번 줄 `.env`, `.env.*` |

특히 `config.mts` 5번 줄은 이번 코드의 `process.env.PORT ?? 8194`와 **똑같은 패턴**입니다. 값이 주어지면 쓰고, 없으면 기본값을 씁니다. ts-wiki는 이 방식으로 GitHub Actions에서만 `WIKI_BASE=/저장소이름/`을 넣어 줍니다.

위키에 "의견 남기기"나 "로그인" 같은 기능을 붙인다면 그때 비로소 Express 같은 서버가 필요해지고, 구조는 7-4에서 보듯 "nginx가 정적 파일을, 뒤의 Node가 API를" 맡는 모양이 됩니다.

## 자주 하는 실수

1. **증상**: 모든 주소가 404이다.
   **원인**: 404 미들웨어를 `express.static`보다 **앞에** 등록했습니다.
   **해결**: 404 미들웨어와 에러 처리기는 항상 맨 뒤에 둡니다.
2. **증상**: 에러가 났는데 내 에러 처리기가 아니라 Express 기본 에러 화면(HTML)이 나온다.
   **원인**: 에러 처리기의 인자를 3개로 줄였습니다(`_next` 삭제). Express는 인자 4개짜리만 에러 처리기로 봅니다.
   **해결**: `(err, req, res, next)` 4개를 유지합니다.
3. **증상**: 인터넷 예제를 붙였더니 `app.get('*', ...)`에서 경로 관련 에러가 난다.
   **원인**: Express 4용 예제입니다. Express 5는 경로 패턴 규칙이 바뀌어 `*`를 이름 없이 쓸 수 없습니다.
   **해결**: 예제가 몇 버전 기준인지 확인하고, Express 5 공식 문서의 마이그레이션 안내를 봅니다. "나머지 전부"를 처리하려면 이 레슨처럼 경로 없는 `app.use(...)`를 맨 뒤에 둡니다.
4. **증상**: 요청이 응답 없이 계속 기다린다.
   **원인**: 미들웨어에서 응답도 보내지 않고 `next()`도 부르지 않았습니다.
   **해결**: 모든 미들웨어가 "응답하기" 또는 "`next()` 부르기" 중 하나를 반드시 하는지 확인합니다.
5. **증상**: `Cannot find module 'express'`
   **원인**: 다른 폴더에서 실행했거나 `npm install express`를 하지 않았습니다.
   **해결**: `package.json`이 있는 폴더에서 `npm install` 후 실행합니다.

## 직접 해 보기

### 과제 1 ⭐ X-Powered-By 끄기

`app.disable('x-powered-by')`를 추가하고 `curl -sI`로 헤더가 사라졌는지 확인하세요.

::: details 정답 보기
`const app = express()` 바로 아래에 `app.disable('x-powered-by')`를 넣습니다. `curl -sI http://localhost:8194/` 결과에서 `X-Powered-By` 줄이 없으면 성공입니다.
:::

### 과제 2 ⭐ 버전 정보 엔드포인트

`GET /version`이 `{"name":"express-server","node":"v24.13.1"}`처럼 앱 이름과 Node 버전을 돌려주게 해 보세요.

::: details 정답 보기
```ts
app.get('/version', (_req: Request, res: Response) => {
  res.json({ name: 'express-server', node: process.version })
})
```
`express.static`보다 **앞에** 등록해야 합니다. 서버 정보를 밖에 너무 많이 알리면 안 되므로, 실제 서비스에서는 내부망에서만 열거나 앱 버전 정도만 보여 줍니다.
:::

### 과제 3 ⭐⭐ 느린 요청 경고

로깅 미들웨어를 고쳐 처리 시간이 500ms를 넘으면 `console.warn`으로 `[느림]`을 앞에 붙여 출력하세요. 확인을 위해 1초 기다렸다 응답하는 `/slow`도 만듭니다.

::: details 정답 보기
```ts
app.get('/slow', async (_req: Request, res: Response) => {
  await new Promise((r) => setTimeout(r, 1000))
  res.send('늦었습니다')
})
```
로깅 미들웨어의 `finish` 콜백에서 `const ms = Date.now() - t`를 구하고 `ms > 500`이면 `console.warn('[느림]', ...)`을 씁니다.
:::

### 과제 4 ⭐⭐ 헬스 체크에 정보 더하기

`/health`가 메모리 사용량(MB)도 돌려주게 해 보세요. `process.memoryUsage().rss`를 씁니다.

::: details 정답 보기
```ts
res.json({
  status: 'ok',
  uptimeSec: Math.round((Date.now() - startedAt) / 1000),
  rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
})
```
`rss`는 이 프로세스가 실제로 쓰고 있는 메모리 크기(바이트)입니다.
:::

### 과제 5 ⭐⭐⭐ 종료 신호에 깔끔하게 끄기

서버를 `docker stop`이나 `kill`로 끌 때 운영체제는 `SIGTERM` 신호를 보냅니다. 이 신호를 받으면 새 요청을 받지 않고, 처리 중인 요청을 마친 뒤 종료하게 해 보세요.

::: details 정답 보기
```ts
const server = app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 기다리는 중`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM 받음: 새 요청을 멈추고 종료합니다')
  server.close(() => process.exit(0)) // 처리 중인 요청이 끝나면 콜백이 불립니다
})
```
이것을 "그레이스풀 셧다운(graceful shutdown, 우아한 종료)"이라고 합니다. Windows에서는 신호 동작이 다르므로 Docker(리눅스) 컨테이너 안에서 `docker stop`으로 확인하는 것이 정확합니다.
:::

## 확인 퀴즈

1. 미들웨어가 할 수 있는 세 가지 일은 무엇입니까?
2. 404 미들웨어를 맨 앞에 등록하면 어떤 일이 생깁니까?
3. Express가 에러 처리 미들웨어를 일반 미들웨어와 구분하는 기준은 무엇입니까?
4. `/boom`의 에러 메시지를 손님에게 그대로 보내지 않은 이유는 무엇입니까?
5. ts-wiki의 `config.mts` 5번 줄과 이번 코드의 `PORT` 처리는 어떤 점이 같습니까?

::: details 정답 보기
1. 응답을 보내고 끝내기, `next()`로 다음 미들웨어에 넘기기, 에러를 넘기기(`next(err)` 또는 `throw`).
2. 모든 요청이 거기서 404로 끝나, 뒤의 정적 파일·헬스 체크가 실행되지 않습니다.
3. 인자가 4개(`err, req, res, next`)인지입니다.
4. 에러 메시지에 내부 경로·설정 같은 정보가 섞여 공격자에게 단서가 될 수 있기 때문입니다. 자세한 내용은 서버 로그에만 남깁니다.
5. 둘 다 환경 변수가 있으면 그 값을, 없으면 `??` 뒤의 기본값을 씁니다.
:::

## 정리

- Express는 요청을 **미들웨어** 목록에 등록 순서대로 흘려보내는 프레임워크입니다. 순서가 곧 동작입니다.
- `express.static(ROOT, { extensions: ['html'] })` 한 줄이 7-2의 경로 처리·cleanUrls·MIME·경로 탐색 방어를 대신하고, ETag·Range 같은 기능까지 줍니다.
- `/health`는 기계가 서버 생존을 확인하는 주소, 에러 처리기는 인자 4개짜리 미들웨어입니다. Express 5는 async 함수의 에러도 에러 처리기로 넘깁니다.
- 설정은 환경 변수(`PORT`)와 `.env`로 받고, `.env`는 저장소에 올리지 않습니다.
- 작성 시점 Express 최신은 5.3.0입니다. 인터넷 예제가 Express 4 기준인지 확인합니다.

## 다음 단계

[리버스 프록시와 HTTPS 개념](./04-reverse-proxy) — 방금 만든 Express 서버 앞에 nginx를 세웁니다. 손님은 nginx만 보고, nginx가 Node에게 요청을 넘기는 실제 운영 구조를 Docker로 재현합니다.
