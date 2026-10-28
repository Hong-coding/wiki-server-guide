---
title: 연습 과제와 자가 진단
---

# 연습 과제와 자가 진단

<LessonMeta level="실전" :minutes="60" prev="로그·재시작·헬스 체크·백업·업데이트·보안 체크리스트로 운영 기본기를 익혔습니다." />

## 이번에 배울 것

- 7-2~7-6에서 배운 것을 과제 12개로 직접 구현해 볼 수 있다.
- 과제마다 "확인 방법"으로 스스로 성공 여부를 판정할 수 있다.
- 25문항 자가 진단으로 내가 로드맵 몇 단계에 있는지 판단할 수 있다.
- 점수에 따라 다음에 무엇을 공부할지 정할 수 있다.

## 먼저 알아 둘 것

- 이 파트의 레슨 7-1~7-6. 과제마다 관련 레슨을 적어 두었습니다.
- 실습 폴더 `D:\lab`(macOS/Linux는 `~/lab`)와 ts-wiki 복사본의 빌드 결과물. 준비 방법은 [7-2의 1단계](./02-node-http)에 있습니다.

## 비유로 이해하기

운전면허는 필기시험만으로 주지 않습니다. 코스 시험(정해진 과제를 정해진 기준으로 통과)과 도로 주행(실제 상황)을 거칩니다. 이 레슨의 과제 ⭐·⭐⭐는 **코스 시험**, ⭐⭐⭐는 **도로 주행**에 가깝습니다. 그리고 자가 진단은 시험 전에 스스로 보는 **모의고사**입니다.

## 과제 진행 방법

- **정답을 먼저 열지 않습니다.** 최소 20분은 혼자 해 보고, 막히면 힌트 → 그래도 막히면 정답 순서로 엽니다.
- **확인 방법을 통과해야 끝난 것입니다.** "코드는 다 썼다"가 아니라 "확인 명령의 결과가 기대와 같다"가 기준입니다.
- **포트는 8192~8196을 씁니다.** 끝나면 서버는 `Ctrl+C`, 컨테이너는 `docker rm -f 이름`, 이미지는 `docker rmi 이름`으로 정리합니다.
- **정답은 예시일 뿐입니다.** 확인 방법을 통과하면 다르게 풀어도 정답입니다.

아래 정답 예시 코드는 작성 시점(2026-10)에 Node 24.13.1 · Express 5.3.0 · TypeScript 5.6.3(`tsc --strict --noEmit`)으로 검사했고, 과제 5·6·7·10은 하나의 서버 파일로 합쳐 Docker(`node:22-alpine`, 컨테이너 안 Node 22.23.4)에서 실제로 띄워 확인했습니다.

## 연습 과제

### 과제 1 ⭐ 두 서버 동시에 띄우기

- **목표**: 포트와 환경 변수를 이해한다.
- **조건**: 7-2의 정적 서버(`server.ts`)를 8192와 8193 두 포트에 **동시에** 띄운다. 코드는 고치지 않는다.
- **힌트**: 터미널을 두 개 엽니다. 환경 변수 `PORT`를 씁니다.
- **확인 방법**: 두 주소 모두 `curl -s -o /dev/null -w "%{http_code}\n"`로 200이 나오고, 포트 확인 명령에서 서로 다른 PID 두 개가 보인다.
- **관련 레슨**: [7-2](./02-node-http)

:::: details 정답 예시
::: code-group
```powershell [PowerShell 터미널 1]
node server.ts dist
```
```powershell [PowerShell 터미널 2]
$env:PORT = '8193'; node server.ts dist
```
:::
확인: `Get-NetTCPConnection -LocalPort 8192,8193 -State Listen | Select-Object LocalPort, OwningProcess`. bash라면 터미널 2에서 `PORT=8193 node server.ts dist`, 확인은 `lsof -i :8192 -i :8193`.
::::

### 과제 2 ⭐ 404 페이지 바꿔 보기

- **목표**: 정적 서버의 404 처리 흐름을 이해한다.
- **조건**: `dist/404.html`을 잠시 다른 이름으로 바꾸면 7-2 서버가 무엇을 응답하는지 예상하고, 실제로 확인한다. 확인 후 이름을 되돌린다.
- **힌트**: `handle` 함수의 마지막 `if/else`를 읽습니다.
- **확인 방법**: `curl -i http://localhost:8192/nope`의 상태 코드와 본문이 예상과 같다.
- **관련 레슨**: [7-2](./02-node-http)

::: details 정답 보기
`404.html`이 없으면 `else` 쪽으로 가서 상태 코드 404, `Content-Type: text/plain; charset=utf-8`, 본문 `Not Found`를 보냅니다. 상태 코드는 그대로 404라는 점이 중요합니다. 페이지가 없다고 200을 보내면 검색 엔진·모니터링이 정상 페이지로 착각합니다.
:::

### 과제 3 ⭐ 헬스 체크와 버전 엔드포인트

- **목표**: Express 라우팅과 JSON 응답을 익힌다.
- **조건**: 7-3 서버에 `GET /version`을 추가해 `{"app":"express-server","node":"v24.13.1"}`처럼 응답하게 한다. `X-Powered-By` 헤더는 없앤다.
- **힌트**: `process.version`, `app.disable(...)`. 등록 순서에 주의합니다.
- **확인 방법**: `curl -i http://localhost:8194/version`에 JSON이 오고, 헤더에 `X-Powered-By`가 없다.
- **관련 레슨**: [7-3](./03-express)

::: details 정답 예시
```ts
app.disable('x-powered-by')

app.get('/version', (_req: Request, res: Response) => {
  res.json({ app: 'express-server', node: process.version })
})
```
`/version`은 `express.static`과 404 미들웨어보다 **앞에** 등록합니다.
:::

### 과제 4 ⭐ 로그에서 원하는 줄만 찾기

- **목표**: 로그를 거르는 습관을 들인다.
- **조건**: 7-3 서버를 띄우고 정상·404·500 요청을 섞어 10번 이상 보낸 뒤, 서버 출력을 파일(`app.log`)로 남겨 상태 코드 404와 500인 줄만 골라낸다.
- **힌트**: 출력 저장은 `node app.ts dist > app.log`(bash) 또는 `node app.ts dist | Tee-Object app.log`(PowerShell). 거르기는 `grep`(bash) 또는 `Select-String`(PowerShell).
- **확인 방법**: 걸러낸 줄 수가 보낸 404·500 요청 수와 같다.
- **관련 레슨**: [7-5](./05-linux-basics), [7-6](./06-ops)

:::: details 정답 예시
::: code-group
```bash [bash]
grep -E "→ (404|500) " app.log
grep -cE "→ (404|500) " app.log
```
```powershell [PowerShell]
Select-String -Path app.log -Pattern "→ (404|500) "
(Select-String -Path app.log -Pattern "→ (404|500) ").Count
```
:::
::::

### 과제 5 ⭐⭐ 상태 코드별 요청 수 집계

- **목표**: 미들웨어로 서버 전체에 기능을 덧붙이는 법을 익힌다.
- **조건**: `GET /metrics`가 지금까지의 요청 수를 상태 코드별로 `{"200":3,"404":1}`처럼 돌려준다.
- **힌트**: 7-3의 로깅 미들웨어처럼 `res.on('finish', ...)`에서 `res.statusCode`를 셉니다.
- **확인 방법**: 요청 몇 개를 보낸 뒤 `/metrics` 숫자가 보낸 요청과 맞는다.
- **관련 레슨**: [7-3](./03-express)

::: details 정답 예시
```ts
// 상태 코드별 요청 수
const counts: Record<string, number> = {}
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    const key = String(res.statusCode)
    counts[key] = (counts[key] ?? 0) + 1
  })
  next()
})

app.get('/metrics', (_req: Request, res: Response) => {
  res.json(counts)
})
```
실제 실행 결과(요청 5개 후):
```text
{"200":3,"201":1,"400":1}
```
`/metrics` 요청 자신은 응답이 끝난 뒤에 세어지므로 이 응답에는 포함되지 않습니다. 실무에서는 이런 정보를 Prometheus 같은 모니터링 도구 형식으로 내보냅니다.
:::

### 과제 6 ⭐⭐ 입력 검증이 있는 메모 API

- **목표**: 처음으로 "데이터를 받는" 서버를 만들고 입력 검증을 익힌다.
- **조건**: `POST /api/notes`로 `{"text":"..."}`를 받아 메모리 배열에 저장하고 201로 응답한다. `GET /api/notes`는 목록을 준다. `text`가 문자열이 아니거나 비어 있거나 200자를 넘으면 400으로 거절한다. 요청 본문 크기도 제한한다.
- **힌트**: `app.use(express.json({ limit: '10kb' }))`. `req.body`의 값은 `unknown`으로 받아 `typeof`로 확인합니다.
- **확인 방법**: 정상 요청은 201, 빈 문자열은 400, 목록에 저장한 메모가 보인다. 서버를 재시작하면 메모가 사라지는 것도 확인한다(왜 그런지 설명할 수 있어야 함).
- **관련 레슨**: [7-3](./03-express), [7-6 보안 체크리스트](./06-ops)

::: details 정답 예시
```ts
app.use(express.json({ limit: '10kb' })) // 요청 본문(JSON) 읽기, 크기 제한

type Note = { id: number; text: string }
const notes: Note[] = []

app.get('/api/notes', (_req: Request, res: Response) => {
  res.json(notes)
})

app.post('/api/notes', (req: Request, res: Response) => {
  const text: unknown = req.body?.text
  // 입력 검증: 문자열이고 1~200자일 때만 받습니다.
  if (typeof text !== 'string' || text.trim().length === 0 || text.length > 200) {
    res.status(400).json({ error: 'text는 1~200자 문자열이어야 합니다' })
    return
  }
  const note: Note = { id: notes.length + 1, text: text.trim() }
  notes.push(note)
  res.status(201).json(note)
})
```
확인(한글이 깨지지 않도록 본문을 UTF-8 파일 `note.json`에 담아 `-d @note.json`으로 보냈습니다):
```bash
curl -s -X POST -H "Content-Type: application/json" -d @note.json -w " %{http_code}\n" http://localhost:8194/api/notes
curl -s -X POST -H "Content-Type: application/json" -d '{"text":""}' -w " %{http_code}\n" http://localhost:8194/api/notes
curl -s http://localhost:8194/api/notes
```
```text
{"id":1,"text":"원두 주문하기"} 201
{"error":"text는 1~200자 문자열이어야 합니다"} 400
[{"id":1,"text":"원두 주문하기"}]
```
메모가 재시작 때 사라지는 이유는 프로세스의 메모리에만 있기 때문입니다. 남기려면 파일이나 데이터베이스가 필요합니다(로드맵 다음 주제). 받은 텍스트를 나중에 HTML에 넣어 보여 줄 때는 그대로 넣지 말고 이스케이프해야 XSS(악성 스크립트 삽입)를 막을 수 있습니다.
:::

### 과제 7 ⭐⭐ Express 서버를 Docker 이미지로

- **목표**: 직접 만든 서버를 컨테이너로 묶는다(로드맵 6단계).
- **조건**: 7-3 서버(또는 과제 5·6을 더한 서버)를 `node:22-alpine` 기반 이미지로 만든다. 개발용 패키지는 넣지 않고, root가 아닌 사용자로 실행한다. `-p 8194:8194`로 띄워 확인한다.
- **힌트**: `npm ci --omit=dev`, `USER node`(node 공식 이미지에 들어 있는 일반 사용자). `.dockerignore`에 `node_modules`.
- **확인 방법**: `docker run` 후 `/health`가 200이고, `docker exec 컨테이너 whoami`가 `node`이다.
- **관련 레슨**: [Docker와 Docker Compose](../part3-libraries/06-docker), [Docker 이미지로 묶기](../part6-serve/03-docker-nginx)

::: details 정답 예시
```dockerfile
# 연습 과제 정답 예시: Express 서버 이미지
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY app.ts ./
COPY dist ./dist
USER node
ENV PORT=8194
EXPOSE 8194
CMD ["node", "app.ts", "dist"]
```
```bash
docker build -t lab-express .
docker run -d --name lab-express -p 8194:8194 lab-express
docker exec lab-express node -v
curl -s http://localhost:8194/health
```
```text
v22.23.4
{"status":"ok"}
```
- 작성 시점 `node:22-alpine` 이미지의 Node는 22.23.4였고, 이 버전에서도 `node app.ts`(타입 스트리핑)가 옵션 없이 동작했습니다.
- 만들어진 이미지 크기는 212MB였습니다(위키 `dist` 포함). ts-wiki처럼 정적 파일만 내준다면 nginx 이미지가 훨씬 작습니다.
- 정리: `docker rm -f lab-express`, `docker rmi lab-express`.
:::

### 과제 8 ⭐⭐ 정적 파일은 nginx, API는 Node

- **목표**: 실무에서 가장 흔한 리버스 프록시 구조를 만든다(로드맵 5단계).
- **조건**: nginx 컨테이너(8195)가 `/`는 `dist`를 직접 서비스하고, `/api/`와 `/health`만 PC의 Node 서버(8194)로 넘긴다.
- **힌트**: `dist`도 `-v`로 마운트합니다. `location /api/ { proxy_pass http://host.docker.internal:8194; }`. 7-4 과제 2를 확장한 것입니다.
- **확인 방법**: `curl -sI http://localhost:8195/`에는 `Server: nginx`만 있고, `curl -s http://localhost:8195/api/notes`에는 Node의 JSON 응답이 온다. Node를 끄면 `/`는 계속 200, `/api/notes`는 502가 된다.
- **관련 레슨**: [7-4](./04-reverse-proxy)

::: details 정답 예시
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location /api/ {
        proxy_pass http://host.docker.internal:8194;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location = /health {
        proxy_pass http://host.docker.internal:8194;
    }
}
```
```bash
docker run -d --name lab-proxy -p 8195:80 -v "$PWD/site.conf:/etc/nginx/conf.d/default.conf:ro" -v "$PWD/dist:/usr/share/nginx/html:ro" nginx:1.27-alpine
```
`proxy_pass` 주소 끝에 경로를 붙이지 않았으므로 `/api/notes`가 그대로 `/api/notes`로 넘어갑니다. "Node를 꺼도 위키는 뜬다"는 점이 이 구조의 장점입니다.
:::

### 과제 9 ⭐⭐ 리눅스에서 장애 원인 찾기

- **목표**: 리눅스 명령만으로 "포트를 누가 잡고 있나"와 "로그에 무엇이 남았나"를 찾는다.
- **조건**: Ubuntu 컨테이너에서 nginx를 띄운 상태로 nginx를 한 번 더 실행해 에러를 만든다. 에러 메시지를 읽고, `ss`로 범인 PID를 찾아 정상 종료시킨 뒤 다시 띄운다. 접속 로그에서 404만 센다.
- **힌트**: `nginx`를 두 번 실행하면 `bind() ... Address already in use`가 납니다. `ss -tlnp`, `kill`, `grep -c`.
- **확인 방법**: 마지막에 `ss -tlnp`에 nginx가 80번에 하나만 보이고, 404 개수가 보낸 요청 수와 같다.
- **관련 레슨**: [7-5](./05-linux-basics)

::: details 정답 예시
```bash
docker run -it --rm --name lab-ubuntu ubuntu:24.04 bash
apt-get update -qq && apt-get install -y -qq nginx curl iproute2 procps
nginx
nginx            # 두 번째 실행: Address already in use 에러
ss -tlnp         # pid=... 확인
kill <PID>
nginx
curl -s -o /dev/null http://localhost/a; curl -s -o /dev/null http://localhost/b
grep -c '" 404 ' /var/log/nginx/access.log
exit
```
에러 메시지에 원인(무엇이 어디에 bind하려다 실패했는지)이 다 적혀 있다는 점을 확인합니다.
:::

### 과제 10 ⭐⭐⭐ 우아한 종료 확인

- **목표**: 운영 환경의 종료 신호(SIGTERM)를 다룬다.
- **조건**: 과제 7의 컨테이너에서 서버가 `SIGTERM`을 받으면 로그를 남기고 `server.close()` 후 종료 코드 0으로 끝나게 한다. `docker stop`에 걸린 시간도 잰다.
- **힌트**: `process.on('SIGTERM', ...)`. 처리하지 않으면 `docker stop`은 기다리다(기본 10초, 공식 문서 기준) 강제 종료합니다.
- **확인 방법**: `docker stop` 후 `docker logs`에 종료 로그가 있고, `docker inspect`로 본 종료 코드(`State.ExitCode`)가 0이며(명령은 정답 예시 참고), `docker stop`이 10초보다 훨씬 빨리 끝난다.
- **관련 레슨**: [7-3 과제 5](./03-express), [7-6](./06-ops)

::: details 정답 예시
```ts
const server = app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 기다리는 중`)
})

// docker stop이 보내는 SIGTERM을 받으면 새 연결을 멈추고 끝냅니다.
process.on('SIGTERM', () => {
  console.log('SIGTERM 받음: 종료합니다')
  server.close(() => process.exit(0))
})
```
실행 결과:
```text
$ time docker stop lab-express
lab-express

real    0m1.606s
$ docker logs lab-express | tail -2
http://localhost:8194 에서 기다리는 중
SIGTERM 받음: 종료합니다
$ docker inspect -f '{{.State.ExitCode}}' lab-express
0
```
Dockerfile의 `CMD ["node", ...]`처럼 **배열 형식**으로 써야 node가 PID 1이 되어 신호를 직접 받습니다. `CMD node app.ts`(문자열 형식)는 셸을 거치므로 신호가 전달되지 않을 수 있습니다(공식 문서 기준).
:::

### 과제 11 ⭐⭐⭐ push하면 검사하는 CI

- **목표**: 로드맵 7단계(CI)를 내 서버 프로젝트에 적용한다.
- **조건**: 내 GitHub 저장소(연습용, **사내 정보 없이**)에 서버 프로젝트를 올리고, push할 때마다 `npm ci` → `tsc --noEmit` 타입 검사가 도는 워크플로를 만든다. 일부러 타입 오류를 넣어 실패(빨간 X)를 확인한 뒤 고친다.
- **힌트**: ts-wiki `.github/workflows/deploy.yml`의 `build` 작업에서 Pages 관련 단계를 빼면 뼈대가 됩니다. 타입 검사 명령은 `package.json`의 `scripts`에 `"typecheck"`로 넣어 두면 편합니다.
- **확인 방법**: GitHub 저장소 Actions 탭에서 실패 1회 → 성공 1회 기록이 보인다.
- **관련 레슨**: [GitHub Actions와 Pages 배포 액션](../part3-libraries/07-github-actions), [GitHub Pages 자동 배포](../part6-serve/05-github-pages)

::: details 정답 예시 (이 가이드에서 실행하지 않은 예시입니다)
`package.json`:
```json
{
  "scripts": {
    "typecheck": "tsc --strict --noEmit --module nodenext --target es2022 --types node --esModuleInterop app.ts"
  }
}
```
`.github/workflows/ci.yml`:
```yaml
# push할 때마다 의존성 설치와 타입 검사를 합니다.
name: CI

on:
  push:
  pull_request:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run typecheck
```
`permissions: contents: read`로 최소 권한만 줍니다(ts-wiki `deploy.yml` 9~12번 줄과 같은 생각).
:::

### 과제 12 ⭐⭐⭐ 장애 훈련 (둘이서)

- **목표**: 원인을 모르는 상태에서 순서대로 좁혀 가는 연습을 한다.
- **조건**: 동료(또는 미래의 나)가 과제 8 구성에 아래 고장 중 하나를 몰래 넣는다. 고장 낸 사람은 "증상"만 알려 주고, 푸는 사람은 로그·명령만으로 원인을 찾아 고친다. 5가지를 모두 돌아가며 해 본다.
  1. Node 서버를 끔
  2. `proxy_pass` 포트를 틀리게 바꿈
  3. nginx 설정에 세미콜론 하나를 지움
  4. `dist` 마운트 경로를 틀리게 바꿈
  5. 같은 포트로 다른 컨테이너를 먼저 띄워 둠
- **힌트**: 7-1 "막힐 때 팁"의 순서(터미널 에러 → 포트 → 주소 → curl → 로그). 상태 코드가 무엇인지, 누가(`Server` 헤더) 응답했는지부터 봅니다.
- **확인 방법**: 5가지 모두 "증상 → 확인한 명령 → 원인 → 조치"를 한 줄씩 기록했다.
- **관련 레슨**: [7-4](./04-reverse-proxy), [7-6](./06-ops), [문제 해결](../part6-serve/06-troubleshooting)

::: details 정답 예시
| 고장 | 증상 | 결정적 단서 |
|---|---|---|
| 1 Node 끔 | `/`는 200, `/api/`는 502 | nginx 에러 로그 `connect() failed (111: Connection refused)` |
| 2 포트 틀림 | 1과 같음 | 에러 로그의 `upstream:` 주소 포트가 Node 포트와 다름 |
| 3 세미콜론 | 컨테이너가 바로 꺼짐, 접속 불가 | `docker logs`에 `[emerg]`와 설정 파일 줄 번호 |
| 4 마운트 경로 | `/`가 nginx 기본 페이지 또는 404 | `docker exec ... ls /usr/share/nginx/html`이 기대와 다름 |
| 5 포트 선점 | `docker run`이 실패 | `port is already allocated`, `docker ps`에 다른 컨테이너 |
:::

## 자가 진단

각 문항에 **예**면 1점입니다. "설명할 수 있다"는 문서를 보지 않고 다른 사람에게 말로 설명할 수 있다는 뜻, "할 수 있다"는 빈 폴더에서 문서 없이(검색은 허용) 해낼 수 있다는 뜻입니다.

### 1~2단계: 정적 파일과 HTTP (5문항)

1. 요청 한 번에 오가는 것(메서드·경로·헤더 / 상태 코드·헤더·본문)을 설명할 수 있다.
2. 200·301·400·404·405·500·502가 각각 무슨 뜻인지 설명할 수 있다.
3. `Content-Type`이 틀리면 어떤 일이 생기는지 예를 들어 설명할 수 있다.
4. Node 기본 모듈만으로 정적 파일 서버를 만들 수 있다.
5. 경로 탐색 공격을 재현하고 막는 코드를 쓸 수 있다.

### 3단계: 프레임워크 (4문항)

6. 미들웨어의 등록 순서가 동작에 어떤 영향을 주는지 설명할 수 있다.
7. Express로 `/health`, 404, 에러 처리기를 갖춘 서버를 만들 수 있다.
8. 환경 변수와 `.env`로 설정을 받고, `.env`를 저장소에서 뺄 수 있다.
9. 맨손 서버와 비교해 프레임워크가 덜어 주는 일을 3가지 이상 말할 수 있다.

### 4·6단계: 프로세스와 컨테이너 (5문항)

10. 터미널을 닫으면 서버가 꺼지는 이유와, 계속 띄워 두는 방법 두 가지를 설명할 수 있다.
11. Docker `restart` 값 네 가지의 차이를 설명할 수 있다.
12. 내 서버용 Dockerfile을 쓰고, root가 아닌 사용자로 실행할 수 있다.
13. ts-wiki `Dockerfile`의 멀티 스테이지 빌드를 한 줄씩 설명할 수 있다.
14. 포트를 잡고 있는 프로세스를 찾아 끌 수 있다(Windows와 리눅스 둘 다).

### 5단계: 리버스 프록시와 HTTPS (4문항)

15. 리버스 프록시를 두는 이유를 3가지 이상 말할 수 있다.
16. nginx `proxy_pass`로 Node 서버 앞에 프록시를 세울 수 있다.
17. 502와 504의 차이, 502가 났을 때 먼저 볼 곳을 설명할 수 있다.
18. HTTPS 인증서 발급 절차(도메인 → 소유 확인 → 발급 → 설정 → 갱신)를 설명할 수 있다.

### 7·8단계: CI/CD와 운영 (7문항)

19. push하면 빌드·검사가 도는 워크플로를 만들 수 있다.
20. `ls -l`의 권한을 읽고 `chmod`로 바꿀 수 있다.
21. `tail -f`, `docker logs -f`, `journalctl -f` 중 상황에 맞는 것을 골라 로그를 볼 수 있다.
22. 기대한 내용까지 확인하는 헬스 체크 스크립트를 만들 수 있다.
23. 백업 대상과 비대상을 구분하고, 복구 절차를 직접 해 본 적이 있다.
24. `npm audit` 결과를 읽고 내 상황에 해당하는지 판단할 수 있다.
25. 보안 체크리스트(포트·시크릿·권한·의존성·정보 공개)로 내 서버를 점검할 수 있다.

### 점수 기준

| 점수 | 상태 | 다음에 할 일 |
|---|---|---|
| 0~8점 | 입문 | 7-2·7-3을 다시 따라 하고 과제 1~4를 끝냅니다. Part 1 개념 레슨을 함께 복습합니다. |
| 9~15점 | 기초 완료 | 틀린 문항이 속한 단계의 레슨을 다시 보고, 과제 5~9를 합니다. |
| 16~21점 | 실전 준비 | 과제 10~12를 하고, 내 프로젝트 하나를 처음부터 끝까지(코드 → 이미지 → 프록시 → CI) 구성해 봅니다. |
| 22~25점 | 로드맵 통과 | 7-1의 "이 로드맵에 없는 것"(데이터베이스, 인증, 클라우드 등)에서 하나를 골라 같은 방식으로 계획을 세웁니다. |

::: tip 점수보다 "틀린 문항"을 봅니다
점수가 높아도 한 단계의 문항을 몽땅 놓쳤다면 그 단계가 다음 공부의 출발점입니다. 한 달 뒤 같은 진단을 다시 해 점수 변화를 기록해 두면 성장이 눈에 보입니다. 마친 레슨은 [진도 체크리스트](../guide/checklist)에도 표시합니다.
:::

## ts-wiki에서는

과제들은 결국 ts-wiki가 이미 가진 구조를 **직접 만든 서버로 다시 짜 보는 것**입니다.

| 과제 | ts-wiki에서 대응하는 곳 |
|---|---|
| 1·2 (포트, 404) | `package.json` 8·11번 줄 `--port 5180`, `nginx.conf` 12번 줄 `error_page 404 /404.html;` |
| 3·5 (헬스 체크·지표) | 없음. 정적 위키에는 Docker 상태와 GitHub Actions 결과가 그 역할을 대신합니다. |
| 7 (이미지) | `Dockerfile` 전체. ts-wiki는 빌드 단계(`node:22-alpine`)와 서비스 단계(`nginx:1.27-alpine`)를 나눠, 서비스 이미지에는 Node가 없습니다. |
| 8 (프록시) | `nginx.conf` 8~10번 줄 `location /`와 `try_files`. 과제 8은 여기에 `location /api/`를 더한 모양입니다. |
| 10 (종료·재시작) | `docker-compose.yml` 7번 줄 `restart: unless-stopped` |
| 11 (CI) | `.github/workflows/deploy.yml`. 과제 11은 그 `build` 작업에서 배포를 뺀 것입니다. |

과제를 마친 뒤 ts-wiki의 파일들을 다시 읽어 보면, 처음 Part 4에서 읽었을 때와 다르게 "왜 이렇게 썼는지"가 보일 것입니다. 그것이 이 파트의 진짜 목표입니다.

## 자주 하는 실수

1. **증상**: 과제를 하다 보니 포트 충돌, 남은 컨테이너가 계속 생긴다.
   **원인**: 과제 사이에 정리를 하지 않았습니다.
   **해결**: 과제가 끝날 때마다 `docker ps -a`와 포트 확인을 합니다. 컨테이너 이름에 `lab-` 같은 접두어를 붙여 두면 내 실습용만 골라 지우기 쉽습니다(`docker ps -a --filter name=lab-`).
2. **증상**: curl로 보낸 한글이 서버에서 깨져 저장된다.
   **원인**: Windows 터미널의 문자 인코딩이 UTF-8이 아니라 명령줄 인자로 넘긴 한글이 다른 인코딩으로 전송되었습니다.
   **해결**: 본문을 UTF-8 파일로 저장해 `-d @파일`로 보냅니다(과제 6 정답 참고).
3. **증상**: 정답 코드를 붙였는데 `Cannot find name 'Request'` 같은 타입 에러가 난다.
   **원인**: 정답 예시는 **추가할 부분만** 보여 줍니다. `import type { Request, Response, NextFunction } from 'express'` 같은 줄이 빠졌습니다.
   **해결**: 7-3의 전체 코드 맨 위 `import` 줄을 확인합니다.
4. **증상**: 과제 11을 하다가 회사 코드를 개인 공개 저장소에 올렸다.
   **원인**: 연습용과 업무용 저장소를 구분하지 않았습니다.
   **해결**: 즉시 저장소를 비공개로 돌리거나 지우고, 시크릿이 있었다면 폐기·재발급한 뒤 담당 부서에 알립니다. 연습은 처음부터 가상 데이터("한빛 카페")로 합니다.

## 직접 해 보기

이 레슨 전체가 실습입니다. 위 과제 12개 중 아직 하지 않은 것을 하나 골라 오늘 끝내 봅니다. 추가로 아래 두 가지를 권합니다.

### 추가 과제 A ⭐⭐ 나만의 과제 만들기

과제 형식(목표·조건·힌트·확인 방법)을 그대로 써서, 내 업무와 관련된 서버 과제를 하나 직접 만들어 보세요.

::: details 힌트
"확인 방법"을 먼저 정하면 과제가 명확해집니다. 예: "`curl`로 X를 요청하면 Y가 나온다", "`docker ps`에 Z가 healthy로 보인다".
:::

### 추가 과제 B ⭐⭐⭐ 한 장짜리 운영 문서

과제 8 구성(nginx + Node)에 대해 "띄우는 법 / 끄는 법 / 로그 보는 법 / 업데이트 절차 / 장애 시 확인 순서"를 한 페이지로 정리해 보세요. 다른 사람이 그 문서만 보고 같은 일을 할 수 있으면 성공입니다.

::: details 힌트
ts-wiki의 `README.md`가 좋은 본보기입니다. "로컬에서 실행", "정적 빌드", "서버에 상시 띄우기 (Docker)", "GitHub Pages 배포" 순서로 짧은 명령과 한두 줄 설명만 담았습니다.
:::

## 확인 퀴즈

1. 과제의 "확인 방법"을 코드 작성보다 먼저 읽어야 하는 이유는 무엇입니까?
2. 과제 8 구성에서 Node 서버를 꺼도 위키 화면은 계속 보이는 이유는 무엇입니까?
3. 과제 10에서 `SIGTERM`을 처리하지 않으면 `docker stop`은 어떻게 동작합니까?
4. 자가 진단 점수가 높은데 한 단계 문항을 모두 놓쳤다면 무엇부터 해야 합니까?

::: details 정답 보기
1. 무엇이 성공인지 알아야 그 결과를 향해 작업할 수 있고, 끝났는지 스스로 판정할 수 있기 때문입니다.
2. `/`는 nginx가 `dist` 파일을 직접 내주고, Node로는 `/api/`·`/health`만 넘기기 때문입니다.
3. 정해진 시간(기본 10초, 공식 문서 기준)을 기다린 뒤 강제 종료(SIGKILL)합니다. 처리 중인 요청이 끊길 수 있습니다.
4. 놓친 단계의 레슨과 과제부터 다시 합니다. 그 단계가 다음 공부의 출발점입니다.
:::

## 정리

- 과제 12개는 로드맵 8단계를 따라 ⭐(코스 시험)부터 ⭐⭐⭐(도로 주행)까지 이어집니다.
- 과제는 "확인 방법"을 통과해야 끝난 것이고, 정답은 예시일 뿐입니다.
- 자가 진단 25문항으로 단계별 빈칸을 찾고, 점수 구간에 따라 다음 할 일을 정합니다.
- 실습이 끝날 때마다 서버·컨테이너·이미지를 정리하고, 연습은 가상 데이터로 공개해도 되는 곳에서만 합니다.

## 다음 단계

Part 7을 마쳤습니다. 자주 쓰는 명령은 [명령어 모음](../appendix/01-commands), 헷갈리는 용어는 [용어 사전](../appendix/02-glossary), 더 공부할 자료는 [참고 자료](../appendix/04-resources)에서 찾습니다. 그리고 한 달 뒤, 이 레슨의 자가 진단을 다시 해 봅니다.
