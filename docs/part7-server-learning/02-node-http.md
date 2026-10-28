---
title: Node.js로 정적 파일 서버 직접 만들기
---

# Node.js로 정적 파일 서버 직접 만들기

<LessonMeta level="실전" :minutes="60" prev="서버 공부를 8단계로 나누고, 단계마다 통과 기준을 정했습니다." />

## 이번에 배울 것

- Node.js 기본 모듈 `node:http`, `node:fs/promises`, `node:path`로 HTTP 서버를 만들 수 있다.
- 요청 주소를 파일 경로로 바꾸고, 확장자에 맞는 `Content-Type`을 붙여 돌려줄 수 있다.
- VitePress의 `cleanUrls`처럼 `/guide/roadmap` 요청에 `roadmap.html`을 찾아 줄 수 있다.
- 없는 주소에는 위키의 `404.html`을 상태 코드 404로 보낼 수 있다.
- 경로 탐색 공격(`../`로 서비스 폴더 밖 파일을 읽으려는 시도)을 재현하고 막을 수 있다.

## 먼저 알아 둘 것

- [웹은 어떻게 동작하나](../part1-concepts/01-web-and-server) — 요청·응답·상태 코드
- [Node.js와 npm](../part1-concepts/04-node-npm) — `node` 명령과 `npm install`
- [빌드 결과물을 서버로 서비스하기](../part6-serve/02-static-serve) — `dist` 폴더가 무엇인지

## 비유로 이해하기

정적 파일 서버는 **도서관 대출 창구 직원**과 같습니다.

1. 손님이 "`guide` 서가의 `roadmap` 주세요"라고 말합니다(요청 경로 `/guide/roadmap`).
2. 직원은 서고(서비스 폴더 `dist`)에서 그 책을 찾습니다. 표지에 `.html`이 붙은 책일 수도 있습니다(`roadmap.html`).
3. 찾으면 책과 함께 "이건 소설책입니다(`Content-Type: text/html`)"라는 꼬리표를 붙여 건넵니다(200).
4. 없으면 "그런 책은 없습니다" 안내문을 건넵니다(404).
5. 손님이 "서고 **밖** 사무실 금고에 있는 서류(`../../비밀.txt`) 주세요"라고 하면, 아무리 위치를 정확히 말해도 **거절**해야 합니다(400). 이 거절을 깜빡한 직원이 바로 "경로 탐색 취약점"이 있는 서버입니다.

nginx는 이 직원 일을 아주 잘하는 숙련자입니다. 이번 레슨에서는 이 직원을 **직접 코드로** 만들어 봅니다.

## 따라 하기

### 1단계. 실습 폴더와 ts-wiki 빌드 결과물 준비

원본 ts-wiki를 건드리지 않도록 복사본을 만들어 빌드합니다. 아래에서는 실습 폴더를 `D:\lab`이라고 하겠습니다(macOS/Linux는 `~/lab`).

::: code-group

```powershell [Windows (PowerShell)]
mkdir D:\lab
robocopy D:\workspace\ts-wiki D:\lab\ts-wiki-copy /E /XD node_modules .git dist cache examples
cd D:\lab\ts-wiki-copy
npm ci
npm run build
```

```bash [macOS / Linux]
mkdir -p ~/lab/ts-wiki-copy
cd ~/workspace/ts-wiki   # ts-wiki가 있는 곳
tar --exclude=node_modules --exclude=docs/.vitepress/dist --exclude=docs/.vitepress/cache \
    --exclude=.git --exclude=examples -cf - . | (cd ~/lab/ts-wiki-copy && tar xf -)
cd ~/lab/ts-wiki-copy
npm ci
npm run build
```

:::

```text
added 136 packages, and audited 137 packages in 26s
...
  vitepress v1.6.3

✓ building client + server bundles...
✓ rendering pages...
build complete in 165.56s.
```

- `robocopy`는 Windows의 폴더 복사 명령입니다. `/E`는 하위 폴더 포함, `/XD`는 제외할 폴더입니다. 복사에 성공해도 종료 코드가 1로 나오는데, robocopy에서 1은 "파일을 복사했음"이라는 뜻이라 정상입니다.
- `npm ci`는 `package-lock.json`에 적힌 버전 그대로 설치합니다. 빌드 시간은 PC마다 다릅니다(작성 PC에서 약 3분).

**확인 방법**: `docs/.vitepress/dist` 폴더 안에 `index.html`, `404.html`, `assets`, `guide` 같은 항목이 보이면 성공입니다.

### 2단계. 서버 프로젝트 만들기

```powershell
mkdir D:\lab\static-server
cd D:\lab\static-server
npm init -y
npm pkg set type=module
npm install -D @types/node@24 typescript@5.6.3
npm ls
```

```text
found 0 vulnerabilities
static-server@1.0.0 D:\lab\static-server
+-- @types/node@24.19.2
`-- typescript@5.6.3
```

- `type=module`은 이 폴더의 코드를 최신 방식(`import ... from`)으로 읽으라는 표시입니다.
- `@types/node`는 Node.js 기본 모듈의 **타입 정보**만 담은 패키지입니다. 실행에는 필요 없고, 에디터 자동 완성과 타입 검사에 씁니다. Node 24를 쓰므로 `@types/node@24`로 맞췄습니다.
- `typescript`도 타입 검사용입니다. ts-wiki와 같은 5.6.3으로 맞췄습니다. 작성 시점(2026-10) npm의 최신 버전은 7.0.2이지만, 교재와 버전을 맞추는 편이 덜 헷갈립니다.

그다음 빌드 결과물을 서버 폴더 안으로 복사합니다(서버가 읽을 "서고"입니다).

::: code-group

```powershell [Windows (PowerShell)]
Copy-Item -Recurse D:\lab\ts-wiki-copy\docs\.vitepress\dist D:\lab\static-server\dist
```

```bash [macOS / Linux]
cp -r ~/lab/ts-wiki-copy/docs/.vitepress/dist ~/lab/static-server/dist
```

:::

### 3단계. 가장 작은 서버부터 이해하기

전체 코드를 보기 전에, HTTP 서버의 뼈대는 이 몇 줄이 전부입니다.

```ts
import { createServer } from 'node:http'

const server = createServer((req, res) => {
  // req: 손님의 요청(메서드, 주소, 헤더)  res: 내가 채워서 돌려줄 응답
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end(`${req.method} ${req.url} 요청을 받았습니다`)
})

server.listen(8192) // 8192번 포트에서 손님을 기다립니다
```

- `createServer`에 넘긴 함수는 **요청이 올 때마다 한 번씩** 불립니다.
- `res.writeHead(상태 코드, 헤더)`로 응답의 머리를, `res.end(본문)`으로 몸통을 보내고 응답을 끝냅니다. `end`를 부르지 않으면 브라우저는 계속 기다립니다.
- `listen(8192)`을 부르는 순간부터 프로그램은 끝나지 않고 요청을 기다립니다. 이것이 "서버를 띄웠다"는 상태입니다.

이제 여기에 "주소 → 파일" 규칙을 붙여 나갑니다.

### 4단계. 전체 코드 작성

`D:\lab\static-server\server.ts`를 만들고 아래 내용을 그대로 넣습니다.

```ts
// 빌드된 위키(dist 폴더)를 서비스하는 아주 작은 정적 파일 서버
import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

// 서비스할 폴더와 포트는 바깥에서 바꿀 수 있게 합니다.
const ROOT = path.resolve(process.argv[2] ?? 'dist')
const PORT = Number(process.env.PORT ?? 8192)

// 확장자 → Content-Type. 브라우저는 이 값을 보고 파일을 어떻게 다룰지 정합니다.
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

function contentType(filePath: string): string {
  return MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

// 요청 경로를 실제 파일 경로로 바꿉니다. ROOT 밖으로 나가면 null을 돌려줍니다.
function toSafePath(urlPath: string): string | null {
  const decoded = decodeURIComponent(urlPath) // %20 같은 인코딩을 풉니다(잘못된 %는 예외)
  if (decoded.includes('\0')) return null // 널 문자로 경로를 자르는 공격 차단
  const full = path.resolve(ROOT, '.' + decoded) // ".."은 여기서 계산되어 사라집니다
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null
  return full
}

// cleanUrls 흉내: /guide/roadmap → roadmap, roadmap.html, roadmap/index.html 순으로 찾습니다.
async function findFile(full: string): Promise<string | null> {
  for (const candidate of [full, full + '.html', path.join(full, 'index.html')]) {
    try {
      const info = await stat(candidate)
      if (info.isFile()) return candidate
    } catch {
      // 없는 파일이면 다음 후보로 넘어갑니다.
    }
  }
  return null
}

async function send(res: ServerResponse, status: number, filePath: string, head: boolean) {
  const body = await readFile(filePath)
  res.writeHead(status, { 'Content-Type': contentType(filePath), 'Content-Length': body.length })
  res.end(head ? undefined : body)
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<number> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method Not Allowed')
    return 405
  }
  const head = req.method === 'HEAD'
  const urlPath = new URL(req.url ?? '/', 'http://localhost').pathname

  let full: string | null
  try {
    full = toSafePath(urlPath)
  } catch {
    full = null // decodeURIComponent 실패(잘못된 %인코딩)
  }
  if (full === null) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Bad Request')
    return 400
  }

  const file = await findFile(full)
  if (file) {
    await send(res, 200, file, head)
    return 200
  }
  // 위키에 있는 404.html을 보여 주되, 상태 코드는 404로 보냅니다.
  const notFound = path.join(ROOT, '404.html')
  if (await findFile(notFound)) {
    await send(res, 404, notFound, head)
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found')
  }
  return 404
}

const server = createServer(async (req, res) => {
  const started = Date.now()
  let status = 500
  try {
    status = await handle(req, res)
  } catch (err) {
    console.error(err)
    if (!res.headersSent) res.writeHead(500).end('Internal Server Error')
  }
  console.log(`${req.method} ${req.url} → ${status} (${Date.now() - started}ms)`)
})

server.listen(PORT, () => {
  console.log(`서비스 폴더: ${ROOT}`)
  console.log(`http://localhost:${PORT} 에서 기다리는 중 (끄려면 Ctrl+C)`)
})
```

코드가 길어 보이지만 하는 일은 다섯 가지입니다.

| 부분 | 하는 일 | nginx로 치면 |
|---|---|---|
| `ROOT`, `PORT` | 서비스할 폴더와 포트 | `root ...;`, `listen ...;` |
| `MIME`, `contentType` | 확장자로 `Content-Type` 결정 | nginx에 들어 있는 `mime.types` |
| `toSafePath` | 주소를 안전한 파일 경로로 바꾸기 | nginx가 내부에서 처리 |
| `findFile` | 파일 → `.html` → `index.html` 순으로 찾기 | `try_files $uri $uri.html $uri/ =404;` |
| `handle`의 404 부분 | 없으면 `404.html`을 404로 | `error_page 404 /404.html;` |

몇 가지를 자세히 봅니다.

- **`process.argv[2]`**: `node server.ts dist`처럼 실행할 때 뒤에 붙인 첫 번째 값입니다. 안 주면 `'dist'`를 씁니다. `??`는 "왼쪽이 비어 있으면(`null`·`undefined`) 오른쪽"이라는 연산자입니다.
- **`process.env.PORT`**: 환경 변수(프로그램 바깥에서 넣어 주는 설정 값)입니다. 코드를 고치지 않고 포트를 바꿀 수 있습니다.
- **`new URL(req.url, 'http://localhost').pathname`**: `req.url`에는 `/guide/roadmap?x=1` 같은 값이 들어옵니다. `URL`로 해석하면 물음표 뒤(쿼리)를 떼어 낸 경로만 얻을 수 있습니다.
- **`Content-Length`**: 본문이 몇 바이트인지 알려 줍니다. 브라우저는 이 값으로 "다 받았다"를 압니다.
- **`HEAD` 요청**: 본문 없이 헤더만 달라는 요청입니다. 그래서 `res.end(head ? undefined : body)`로 본문만 뺍니다.
- **405**: 정적 파일 서버에 `POST`(무언가를 보내 저장해 달라는 요청)는 의미가 없으므로 거절하고, `Allow` 헤더로 허용 메서드를 알려 줍니다.

### 5단계. 경로 탐색 공격과 방어 이해하기

`toSafePath`가 이 서버에서 가장 중요한 부분입니다.

```ts
const full = path.resolve(ROOT, '.' + decoded)
if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null
```

- `path.resolve`는 경로를 이어 붙인 뒤 `..`(한 단계 위 폴더)를 **계산해서** 최종 절대 경로를 만듭니다. 예를 들어 `ROOT`가 `D:\lab\static-server\dist`이고 요청이 `/../package.json`이면 결과는 `D:\lab\static-server\package.json`, 즉 **서고 밖**입니다.
- 그래서 계산이 끝난 경로가 `ROOT`로 시작하는지 확인합니다. `ROOT + path.sep`(Windows는 `\`, macOS/Linux는 `/`)까지 붙여 비교하는 이유는, `dist-secret` 같은 이웃 폴더가 `dist`로 시작한다는 이유만으로 통과되지 않게 하려는 것입니다.

"브라우저가 `..`을 알아서 지워 주지 않나?"라고 생각할 수 있습니다. 맞습니다. 브라우저와 `URL` 해석기는 `/../`를 정리합니다. 하지만 **`%2f`(슬래시를 인코딩한 값)** 로 보내면 `URL`은 그대로 두고, 그 뒤 `decodeURIComponent`가 `/`로 풀어 버립니다. 공격자는 브라우저가 아니라 curl 같은 도구로 이런 요청을 직접 만듭니다.

방어가 없으면 실제로 무슨 일이 생기는지 확인해 봅시다. 비교 실험을 위해 방어 줄을 지운 `vuln.ts`를 잠시 만들어 8193번 포트로 띄웠습니다(실험이 끝나면 지웁니다).

```bash
curl -s "http://localhost:8193/..%2fpackage.json"
```

```text
{
  "name": "static-server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
...
```

서고(`dist`) 밖에 있는 `package.json`이 그대로 새어 나왔습니다. 실제 서버였다면 `.env`(비밀번호가 든 설정 파일)나 소스 코드가 새어 나갈 수 있습니다. 같은 요청을 방어가 있는 `server.ts`(8192번)에 보내면 이렇게 됩니다.

```bash
curl -s -w " %{http_code}\n" "http://localhost:8192/..%2fpackage.json"
```

```text
Bad Request 400
```

::: danger 요청 주소는 "사용자가 마음대로 쓴 값"입니다
요청 주소를 파일 경로·SQL·셸 명령에 그대로 넣으면 안 됩니다. 실제 서비스에서는 직접 짜기보다 검증된 도구(nginx, Express의 `express.static`)를 쓰는 것이 원칙이고, 이 레슨의 코드는 **원리를 배우기 위한 것**입니다.
:::

### 6단계. 타입 검사

실행 전에 타입 검사로 오타를 잡습니다. `--noEmit`은 "검사만 하고 JS 파일은 만들지 말라"는 뜻입니다.

```bash
npx tsc --strict --noEmit --module nodenext --target es2022 --types node server.ts
```

아무것도 출력되지 않으면 통과입니다. 에러가 있으면 파일 이름과 줄 번호가 나옵니다.

### 7단계. 실행하기

작성 시점(2026-10)에 확인한 Node 24.13.1은 **TypeScript 파일을 그대로 실행**할 수 있습니다. 이 기능을 "타입 스트리핑(type stripping)"이라고 부릅니다. 실행 직전에 타입 표기만 지우고 나머지를 JavaScript로 돌리는 방식입니다. 작성 PC(Node 24.13.1)에서는 별도 옵션이나 경고 없이 실행되었습니다.

```bash
node -v
```

```text
v24.13.1
```

::: code-group

```powershell [Windows (PowerShell)]
cd D:\lab\static-server
node server.ts dist
```

```bash [macOS / Linux]
cd ~/lab/static-server
node server.ts dist
```

:::

```text
서비스 폴더: D:\lab\static-server\dist
http://localhost:8192 에서 기다리는 중 (끄려면 Ctrl+C)
```

프롬프트가 돌아오지 않고 멈춰 있으면 정상입니다. 서버가 요청을 기다리는 중입니다. **새 터미널을 하나 더 열어** 다음 단계를 진행합니다.

::: info 타입 스트리핑의 제약과 대안
- 타입 스트리핑은 **지우기만** 하므로 `enum`, 생성자 매개변수에 `private`를 붙이는 문법처럼 "JavaScript 코드를 새로 만들어야 하는" TypeScript 문법은 쓸 수 없습니다. 이 레슨의 코드는 그런 문법을 쓰지 않았습니다.
- 타입만 가져올 때는 `import type`을 씁니다(코드 3번째 줄).
- 타입 검사는 하지 않습니다. 타입이 틀려도 실행은 됩니다. 그래서 6단계의 `tsc --noEmit`을 따로 돌립니다.
- Node 22 이하에서 이 기능이 기본으로 켜져 있는지는 버전마다 다릅니다(공식 문서에서 확인). 그럴 때는 `tsx`(TypeScript를 바로 실행해 주는 도구, 작성 시점 npm 최신 4.23.15)를 씁니다: `npx tsx server.ts dist`. 이 가이드에서는 Node 24의 `node server.ts` 방식으로만 실행을 확인했습니다.
:::

### 8단계. curl로 확인하기

`-o /dev/null`은 본문을 버리라는 뜻, `-w`는 응답 정보를 원하는 형식으로 출력하라는 뜻입니다. Windows PowerShell에서는 `curl` 대신 `curl.exe`를 쓰고 `/dev/null` 대신 `NUL`을 씁니다(PowerShell 5.1에서 `curl`은 다른 명령의 별칭이기 때문입니다).

::: code-group

```bash [macOS / Linux / Git Bash]
for p in / /guide/roadmap /guide/roadmap.html /part0-start/ /favicon.svg /nope; do
  curl -s -o /dev/null -w "%{http_code} %{content_type} %{size_download} $p\n" http://localhost:8192$p
done
```

```powershell [Windows (PowerShell)]
foreach ($p in '/', '/guide/roadmap', '/guide/roadmap.html', '/part0-start/', '/favicon.svg', '/nope') {
  curl.exe -s -o NUL -w "%{http_code} %{content_type} %{size_download} $p`n" "http://localhost:8192$p"
}
```

:::

```text
200 text/html; charset=utf-8 27552 /
200 text/html; charset=utf-8 74249 /guide/roadmap
200 text/html; charset=utf-8 74249 /guide/roadmap.html
200 text/html; charset=utf-8 75953 /part0-start/
200 image/svg+xml 226 /favicon.svg
404 text/html; charset=utf-8 18055 /nope
```

- `/guide/roadmap`과 `/guide/roadmap.html`의 크기가 74249로 같습니다. 같은 파일을 찾았다는 뜻이고, cleanUrls 흉내가 동작한다는 뜻입니다.
- `/part0-start/`는 `part0-start/index.html`을 찾았습니다.
- `/nope`는 상태 코드가 404이면서 본문은 위키의 404 페이지(18055바이트)입니다.

응답 헤더 전체도 봅니다.

```bash
curl -s -i http://localhost:8192/guide/roadmap | head -8
```

```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 74249
Date: Wed, 28 Oct 2026 00:06:03 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<!DOCTYPE html>
```

방어·예외 처리도 확인합니다.

```bash
curl -s --path-as-is -o /dev/null -w "%{http_code}\n" "http://localhost:8192/../../package.json"
curl -s -w " %{http_code}\n" "http://localhost:8192/..%2f..%2fpackage.json"
curl -s -w " %{http_code}\n" "http://localhost:8192/%E0%A4%A"
curl -s -X POST -w " %{http_code}\n" http://localhost:8192/
```

```text
404
Bad Request 400
Bad Request 400
Method Not Allowed 405
```

- 첫 줄: `--path-as-is`는 curl이 `..`를 지우지 않고 그대로 보내게 합니다. 하지만 서버의 `new URL`이 `..`를 정리해 `/package.json`이 되었고, `dist` 안에는 그런 파일이 없으므로 404입니다.
- 둘째 줄: `%2f`로 숨긴 `..`는 `toSafePath`가 막았습니다(400).
- 셋째 줄: 잘못된 `%` 인코딩은 `decodeURIComponent`가 예외를 던지고, 그것을 400으로 바꿨습니다. 이 처리가 없으면 서버 쪽에서 처리되지 않은 예외가 납니다.
- 넷째 줄: `POST`는 405입니다.

서버를 띄운 터미널에는 요청마다 로그가 찍혀 있습니다.

```text
GET / → 200 (15ms)
GET /guide/roadmap → 200 (3ms)
GET /guide/roadmap.html → 200 (2ms)
GET /part0-start/ → 200 (4ms)
GET /favicon.svg → 200 (2ms)
GET /nope → 404 (4ms)
GET /guide/roadmap → 200 (3ms)
GET /../../package.json → 404 (3ms)
GET /..%2f..%2fpackage.json → 400 (1ms)
GET /%E0%A4%A → 400 (0ms)
HEAD / → 200 (4ms)
POST / → 405 (1ms)
```

**확인 방법**: 브라우저로 `http://localhost:8192`를 열어 위키 홈이 보이고, 사이드바 링크를 눌러 이동할 수 있으면 성공입니다. 개발자 도구(F12) → Network 탭에서 `.js` 파일의 `Content-Type`이 `text/javascript`인지도 확인해 봅니다.

### 9단계. 포트 바꿔 띄우기와 끄기

환경 변수 `PORT`로 포트를 바꿉니다. 셸마다 쓰는 법이 다릅니다.

::: code-group

```powershell [Windows (PowerShell)]
$env:PORT = '8193'
node server.ts dist
```

```bash [macOS / Linux]
PORT=8193 node server.ts dist
```

:::

PowerShell의 `$env:PORT`는 **그 터미널 창을 닫을 때까지** 유지됩니다. 다시 8192로 띄우려면 `Remove-Item Env:PORT`로 지웁니다.

끌 때는 서버를 띄운 터미널에서 `Ctrl+C`를 누릅니다. 창을 잃어버렸다면 포트로 프로세스를 찾아 끕니다.

::: code-group

```powershell [Windows (PowerShell)]
Get-NetTCPConnection -LocalPort 8193 -State Listen | Select-Object LocalPort, OwningProcess
Stop-Process -Id <위에서 나온 OwningProcess 번호>
```

```bash [macOS / Linux]
lsof -i :8193        # PID 열의 번호 확인
kill <PID>
```

:::

```text
LocalPort OwningProcess
--------- -------------
     8193         47624
```

**확인 방법**: 같은 조회 명령을 다시 실행했을 때 아무것도 나오지 않으면(PowerShell은 "찾을 수 없음" 에러) 꺼진 것입니다. 실험용 `vuln.ts`도 지금 지웁니다.

## ts-wiki에서는

ts-wiki에는 이런 서버 코드가 없습니다. 대신 두 곳에서 **같은 규칙**을 설정으로 표현합니다.

1. `docs/.vitepress/config.mts` 25번 줄 `cleanUrls: true,` — VitePress가 만드는 링크에서 `.html`을 뺍니다. 그래서 서버는 `/guide/roadmap` 요청에 `roadmap.html`을 찾아 줄 수 있어야 합니다.
2. `nginx.conf` 7~12번 줄:

```nginx
    # cleanUrls: /guide/roadmap → /guide/roadmap.html
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    error_page 404 /404.html;
```

이번에 만든 `findFile`의 후보 목록 `[full, full + '.html', path.join(full, 'index.html')]`이 `try_files $uri $uri.html $uri/`와 같은 순서입니다(`$uri/`는 폴더면 5번 줄 `index index.html;`에 따라 `index.html`을 찾습니다). 그리고 `handle`의 마지막 부분이 `error_page 404 /404.html;`입니다. 즉 nginx 설정 몇 줄이 하는 일을 코드 약 40줄로 풀어 쓴 셈입니다.

또 하나, ts-wiki `package.json` 11번 줄 `"preview": "vitepress preview docs --host 0.0.0.0 --port 5180"`도 내부적으로 이와 같은 정적 파일 서버를 띄웁니다. `--host 0.0.0.0`은 "이 PC의 모든 네트워크 주소에서 기다려라"라는 뜻입니다. 우리 서버의 `server.listen(PORT)`도 호스트를 주지 않았기 때문에 같은 동작을 합니다(포트를 확인해 보면 `0.0.0.0:8192`와 `[::]:8192`가 함께 보입니다).

## 자주 하는 실수

1. **증상**: `Error: listen EADDRINUSE: address already in use :::8192`
   **원인**: 이미 다른 프로그램(대개 아까 띄운 내 서버)이 8192번 포트를 쓰고 있습니다.
   **해결**: 9단계 방법으로 그 프로세스를 찾아 끄거나 `PORT`를 바꿔 띄웁니다.
2. **증상**: import 문에서 `SyntaxError`가 나거나 모듈 형식 경고가 나온다.
   **원인**: `package.json`에 `"type": "module"`이 없습니다.
   **해결**: `npm pkg set type=module`을 실행합니다.
3. **증상**: `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` 같은 에러
   **원인**: 타입 스트리핑으로 실행할 수 없는 문법(`enum` 등)을 썼습니다.
   **해결**: `enum` 대신 문자열 유니언(`'a' | 'b'`)이나 객체 상수를 씁니다. 꼭 필요하면 `npx tsx`로 실행합니다.
4. **증상**: 페이지는 뜨는데 화면이 깨지고, 브라우저 콘솔에 MIME type이 실행할 수 없는 형식이라는 에러가 난다.
   **원인**: `MIME` 표에 없는 확장자라 `application/octet-stream`(정체를 모르는 데이터)으로 보냈습니다. 브라우저는 보안 때문에 이런 파일을 스크립트로 실행하지 않습니다.
   **해결**: 에러에 나온 파일의 확장자를 `MIME` 표에 추가합니다.
5. **증상**: 모든 주소가 404이다.
   **원인**: 서버를 띄운 위치가 달라 `dist`를 못 찾았습니다. `ROOT`는 **현재 터미널 위치 기준**입니다.
   **해결**: 시작 로그의 "서비스 폴더" 경로가 맞는지 봅니다. `node server.ts D:\lab\static-server\dist`처럼 절대 경로로 줘도 됩니다.

## 직접 해 보기

### 과제 1 ⭐ 접속 로그에 시각 넣기

로그 줄 앞에 `2026-10-28T00:06:03.123Z` 같은 시각을 붙여 보세요.

::: details 정답 보기
```ts
console.log(`${new Date().toISOString()} ${req.method} ${req.url} → ${status} (${Date.now() - started}ms)`)
```
`toISOString()`은 세계 표준시(UTC) 기준입니다. 끝의 `Z`가 UTC라는 표시입니다.
:::

### 과제 2 ⭐ MIME 타입 추가

`.webp`(이미지)와 `.xml`을 `MIME` 표에 추가하고, `dist`에 아무 `test.xml` 파일을 넣어 curl로 `Content-Type`을 확인해 보세요.

::: details 정답 보기
```ts
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
```
확인: `curl -s -o /dev/null -w "%{content_type}\n" http://localhost:8192/test.xml`
:::

### 과제 3 ⭐⭐ 경로 방어 깨뜨려 보기

`toSafePath`에서 `startsWith(ROOT + path.sep)`을 `startsWith(ROOT)`로 바꾸면 어떤 경우에 뚫릴까요? `dist` 옆에 `dist-secret` 폴더를 만들어 확인해 보세요(실험이 끝나면 원래대로 돌립니다).

::: details 힌트와 정답
`ROOT`가 `...\dist`일 때 `...\dist-secret\a.txt`도 문자열로는 `...\dist`로 시작합니다. 요청 `/..%2fdist-secret%2fa.txt`는 `path.resolve` 뒤 `...\dist-secret\a.txt`가 되어 `startsWith(ROOT)`를 통과해 버립니다. 구분자까지 붙여 비교해야 하는 이유입니다.
:::

### 과제 4 ⭐⭐ 캐시 헤더 붙이기

ts-wiki `nginx.conf`의 14~17번 줄처럼, 경로가 `/assets/`로 시작하는 파일에만 `Cache-Control: public, max-age=2592000, immutable` 헤더를 붙여 보세요.

::: details 정답 보기
`send` 함수에 요청 경로(`urlPath`)를 하나 더 넘기고, 헤더 객체를 만든 뒤 조건부로 추가합니다.
```ts
const headers: Record<string, string | number> = {
  'Content-Type': contentType(filePath),
  'Content-Length': body.length,
}
if (urlPath.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=2592000, immutable'
res.writeHead(status, headers)
```
2592000초는 30일입니다(nginx의 `expires 30d`). VitePress는 `assets` 파일 이름에 내용 해시를 붙이므로 오래 캐시해도 안전합니다.
:::

### 과제 5 ⭐⭐⭐ 스트리밍으로 바꾸기

지금은 `readFile`로 파일 전체를 메모리에 올린 뒤 보냅니다. 큰 파일(수백 MB)에 대비해 `node:fs`의 `createReadStream`과 `pipe`로 바꿔 보세요.

::: details 힌트
`stat`으로 크기를 얻어 `Content-Length`에 넣고, `createReadStream(filePath).pipe(res)`로 보냅니다. 스트림에서 에러가 나면(`'error'` 이벤트) 응답을 끝내 주어야 손님이 무한정 기다리지 않습니다.
:::

## 확인 퀴즈

1. `res.end()`를 부르지 않으면 브라우저에서는 어떤 일이 생깁니까?
2. `/guide/roadmap` 요청에 `roadmap.html`을 찾아 주는 코드는 어느 함수이며, nginx에서는 어떤 지시어에 해당합니까?
3. 브라우저가 `..`를 지워 주는데도 서버에서 경로 탐색을 따로 막아야 하는 이유는 무엇입니까?
4. `.js` 파일을 `application/octet-stream`으로 보내면 어떤 문제가 생깁니까?
5. `node server.ts`로 실행할 때 타입 검사도 함께 됩니까?

::: details 정답 보기
1. 응답이 끝나지 않아 브라우저가 계속 로딩 상태로 기다립니다.
2. `findFile`입니다. nginx의 `try_files $uri $uri.html $uri/ =404;`에 해당합니다.
3. 공격자는 브라우저가 아니라 curl 같은 도구로 요청을 직접 만들고, `%2f`처럼 인코딩해 정리 과정을 피할 수 있기 때문입니다.
4. 브라우저가 스크립트로 실행하지 않아 페이지가 동작하지 않습니다.
5. 아닙니다. 타입 표기를 지우고 실행만 합니다. 검사는 `tsc --noEmit`으로 따로 합니다.
:::

## 정리

- HTTP 서버의 뼈대는 `createServer((req, res) => ...)`와 `listen(포트)`입니다. 요청마다 함수가 한 번 불리고, `writeHead`·`end`로 응답합니다.
- 정적 파일 서버의 핵심은 "주소 → 안전한 파일 경로 → 파일 찾기 → `Content-Type` 붙여 보내기 → 없으면 404"입니다.
- 경로는 사용자가 보낸 값입니다. `path.resolve` 뒤 서비스 폴더 안인지 반드시 확인합니다.
- ts-wiki의 nginx 설정 `try_files`·`error_page`가 하는 일을 코드로 직접 구현해 보았습니다.
- Node 24.13.1에서는 `node server.ts`로 TypeScript를 바로 실행할 수 있고, 타입 검사는 `tsc --noEmit`으로 따로 합니다.

## 다음 단계

[Express로 웹 서버 만들기](./03-express) — 같은 서버를 Express 5로 다시 만듭니다. 100줄이 몇 줄로 줄어드는지, 대신 무엇을 더 붙일 수 있는지(헬스 체크·로깅·에러 처리) 비교합니다.
