---
title: '운영 기본기: 로그 · 재시작 · 백업 · 보안'
---

# 운영 기본기: 로그 · 재시작 · 백업 · 보안

<LessonMeta level="실전" :minutes="45" prev="리눅스 컨테이너에서 파일·권한·프로세스·포트·로그를 명령으로 다뤘습니다." />

## 이번에 배울 것

- 서버가 이상할 때 로그를 어디서 어떤 순서로 보는지 말할 수 있다.
- 재시작 정책(Docker `restart`, pm2, systemd)의 차이를 설명하고, 재시작을 직접 실험할 수 있다.
- 헬스 체크 스크립트를 만들어 서버 상태를 자동으로 확인할 수 있다.
- 백업·업데이트 절차를 세우고, 위키에서는 왜 "git이 곧 백업"인지 설명할 수 있다.
- 보안 체크리스트로 내 서버를 점검하고 `npm audit` 결과를 읽을 수 있다.

## 먼저 알아 둘 것

- [Express로 웹 서버 만들기](./03-express) — `/health` 엔드포인트
- [서버에 상시 띄우기: Docker Compose](../part6-serve/04-compose) — `restart: unless-stopped`
- [서버 운영에 필요한 리눅스 기초](./05-linux-basics) — `tail -f`, `ss`, systemd

## 비유로 이해하기

서버를 띄우는 것이 **가게 문을 여는 일**이라면, 운영은 **매일 가게를 굴리는 일**입니다.

| 가게 | 서버 운영 |
|---|---|
| 영업 일지 | 로그 |
| 직원이 아프면 대타 투입 | 재시작 정책 |
| 매장 관리자가 한 시간마다 돌아보기 | 헬스 체크 |
| 장부 사본을 금고에 보관 | 백업 |
| 정해진 순서로 리모델링(공지 → 공사 → 점검 → 재개장) | 업데이트 절차 |
| 문단속·열쇠 관리·CCTV | 보안 |

손님은 문이 열려 있는 것만 봅니다. 운영이 잘되면 아무 일도 일어나지 않은 것처럼 보이는 것이 정상입니다.

## 개념 설명

### 1. 로그 보기

어디서 보는지는 **서버를 어떻게 띄웠는지**에 따라 다릅니다.

| 띄운 방법 | 로그 보는 명령 | 실시간으로 |
|---|---|---|
| 터미널에서 직접(`node app.ts`) | 그 터미널 화면 | 화면 그대로 |
| Docker 컨테이너 | `docker logs 컨테이너` | `docker logs -f --tail 50 컨테이너` |
| Docker Compose | `docker compose logs 서비스` | `docker compose logs -f 서비스` |
| systemd 서비스 | `journalctl -u 서비스` | `journalctl -u 서비스 -f` |
| 파일에 남기는 프로그램 | `tail -n 100 /var/log/...` | `tail -f /var/log/...` |

로그를 읽는 요령:

1. **시각부터 맞춥니다.** "3시쯤 안 됐다"는 연락이면 그 시각 전후 로그를 봅니다. 서버 로그 시각은 UTC(한국 시각 - 9시간)인 경우가 많습니다. 7-3 로그의 `2026-10-28T00:08:46.176Z`에서 `Z`가 UTC 표시입니다.
2. **상태 코드로 거릅니다.** 5xx(서버 잘못)가 갑자기 늘었는지, 4xx(요청 잘못)인지 구분합니다.
3. **처음 나온 에러를 찾습니다.** 에러는 꼬리를 물고 이어지므로, 맨 마지막 에러보다 **가장 먼저 난 에러**가 원인일 때가 많습니다.
4. **앞단과 뒷단을 나눠 봅니다.** 7-4처럼 nginx 로그에는 있는데 Node 로그에는 없으면, 요청이 nginx에서 멈춘 것입니다.

::: warning 로그에 남기면 안 되는 것
비밀번호, 토큰, API 키, 주민등록번호·전화번호 같은 개인정보는 로그에 남기지 않습니다. 로그는 여러 사람이 보고, 오래 보관되고, 외부 도구로 보내지기도 합니다. 요청 본문 전체를 통째로 찍는 코드는 특히 조심합니다.
:::

### 2. 재시작 정책

프로그램은 언젠가 죽습니다. 메모리 부족, 처리하지 못한 예외, 서버 재부팅. 그래서 "죽으면 누가 다시 켜 주나"를 정해 둡니다.

Docker의 `--restart` 값:

| 값 | 동작 |
|---|---|
| `no` (기본) | 다시 켜지 않습니다. |
| `on-failure[:횟수]` | 종료 코드가 0이 아닐 때(비정상 종료)만 다시 켭니다. 횟수 제한 가능. |
| `always` | 어떻게 끝나든 다시 켭니다. 손으로 멈춰도 Docker가 다시 시작되면 켜집니다. |
| `unless-stopped` | `always`와 같지만, **사람이 `docker stop`으로 멈춘 것은** 다시 켜지 않습니다. |

직접 실험해 봅니다. 1초 뒤 일부러 실패(종료 코드 1)하는 컨테이너를 "최대 3번 다시 켜기"로 띄웁니다.

```bash
docker run -d --name lab-crash --restart on-failure:3 alpine:3.20 sh -c 'echo "시작 $(date +%T)"; sleep 1; echo "죽습니다"; exit 1'
```

15초쯤 기다린 뒤 확인합니다.

```bash
docker inspect -f "RestartCount={{.RestartCount}} Status={{.State.Status}} ExitCode={{.State.ExitCode}}" lab-crash
docker logs lab-crash
```

```text
RestartCount=3 Status=exited ExitCode=1
시작 00:12:54
죽습니다
시작 00:12:56
죽습니다
시작 00:12:57
죽습니다
시작 00:12:59
죽습니다
```

- 처음 1번 + 재시작 3번 = 4번 실행되고 멈췄습니다. 횟수 제한이 없었다면 계속 죽고 살기를 반복했을 것입니다.
- 이렇게 계속 죽고 다시 켜지는 상태를 **크래시 루프**라고 합니다. 재시작 정책은 "가끔 죽는 것"을 덮어 줄 뿐, **원인을 고쳐 주지 않습니다.** `docker logs`로 왜 죽는지 꼭 봅니다.

정리합니다.

```bash
docker rm -f lab-crash
```

**다른 도구들**: 같은 일을 하는 도구가 여럿 있습니다.

| 도구 | 어디서 쓰나 | 특징 |
|---|---|---|
| Docker `restart` / Compose `restart:` | 컨테이너로 띄울 때 | ts-wiki가 쓰는 방식. Docker가 켜지면 함께 켜집니다. |
| systemd `Restart=` | 리눅스 서버에서 직접 띄울 때 | 7-5의 서비스 파일. 부팅 시 자동 시작, `journalctl`로 로그. |
| pm2 | Node 프로그램을 직접 띄울 때 | Node 전용 프로세스 관리자(작성 시점 npm 최신 7.1.1). `pm2 start app.js`, `pm2 logs`, `pm2 restart` 같은 명령을 제공합니다. 이 가이드에서는 설치·실행하지 않았으므로 자세한 사용법은 공식 문서를 봅니다. |

한 서버 안에서는 **한 가지 방법만** 씁니다. Docker 컨테이너 안에서 다시 pm2를 돌리거나, systemd와 pm2가 같은 프로그램을 동시에 관리하게 만들면 누가 무엇을 켰는지 알 수 없게 됩니다.

### 3. 헬스 체크

헬스 체크는 "서버가 살아 있고 일을 할 수 있는가"를 **기계가** 주기적으로 확인하는 것입니다. 7-3의 `/health`를 확인하는 작은 스크립트를 만들어 봅니다. `D:\lab\express-server\healthcheck.ts`:

```ts
// 헬스 체크 주소를 한 번 찔러 보고, 정상이면 0, 아니면 1로 끝나는 스크립트
const url = process.argv[2] ?? 'http://localhost:8194/health'

try {
  // 3초 안에 응답이 없으면 실패로 봅니다.
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
  const body = (await res.json()) as { status?: string }
  if (res.ok && body.status === 'ok') {
    console.log(`OK ${res.status} ${url}`)
    process.exit(0)
  }
  console.error(`FAIL ${res.status} ${url}`)
} catch (err) {
  console.error(`FAIL ${url} ${(err as Error).message}`)
}
process.exit(1)
```

- `fetch`는 Node 18부터 기본으로 들어 있는 HTTP 요청 함수입니다.
- **종료 코드**(exit code)는 프로그램이 끝날 때 남기는 숫자입니다. 0이 성공, 그 밖은 실패라는 약속이 있어서 다른 프로그램(Docker, 모니터링 도구, 셸 스크립트)이 결과를 판단할 수 있습니다.

서버가 꺼져 있을 때, 켜져 있을 때, 엉뚱한 주소일 때를 확인합니다(bash에서 `$?`는 직전 명령의 종료 코드, PowerShell에서는 `$LASTEXITCODE`).

```bash
node healthcheck.ts; echo "exit=$?"
# (다른 터미널에서 node app.ts dist 실행 후)
node healthcheck.ts; echo "exit=$?"
node healthcheck.ts http://localhost:8194/nope; echo "exit=$?"
```

```text
FAIL http://localhost:8194/health fetch failed
exit=1
OK 200 http://localhost:8194/health
exit=0
FAIL http://localhost:8194/nope Unexpected token '<', "<!DOCTYPE "... is not valid JSON
exit=1
```

세 번째 결과가 중요합니다. 404 페이지(HTML)가 왔는데 상태 확인을 "응답이 왔는가"만으로 했다면 정상으로 착각했을 것입니다. 헬스 체크는 **기대한 내용이 왔는지**까지 확인합니다.

이 스크립트를 주기적으로 실행하는 방법은 여러 가지입니다. Windows 작업 스케줄러, 리눅스 cron(예약 작업), Docker의 `HEALTHCHECK`, 외부 모니터링 서비스 등입니다. Compose에서는 이런 모양으로 씁니다(**공식 문서 기준 예시, 이 가이드에서는 실행하지 않았습니다**).

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.ts"]
      interval: 30s
      timeout: 5s
      retries: 3
```

`docker ps`의 STATUS 열에 `(healthy)`·`(unhealthy)`가 표시됩니다. 다만 Docker는 unhealthy라고 해서 **스스로 재시작하지는 않습니다**(공식 문서 기준). 표시를 보고 알림을 보내는 것은 따로 구성해야 합니다.

### 4. 백업

백업의 원칙은 세 가지입니다.

1. **무엇을** 백업하나: 다시 만들 수 **없는** 것. 빌드 결과물(`dist`), `node_modules`, Docker 이미지는 다시 만들 수 있으므로 백업 대상이 아닙니다. 원본 문서·설정·데이터베이스·업로드 파일이 대상입니다.
2. **어디에** 두나: 서버와 **다른 곳**에. 같은 디스크에 둔 백업은 디스크가 망가지면 함께 사라집니다.
3. **복구해 봤나**: 복구 연습을 한 번도 안 한 백업은 백업이라고 하기 어렵습니다.

**위키는 git이 곧 백업입니다.** ts-wiki의 원본은 `docs/` 아래 마크다운과 설정 파일뿐이고, 모두 git 저장소에 들어 있습니다. GitHub에 push하면 그 순간 "다른 곳"에 전체 이력과 함께 사본이 생깁니다. 서버(컨테이너)가 통째로 사라져도 이렇게 복구됩니다.

```bash
git clone <저장소 주소> ts-wiki
cd ts-wiki
docker compose up -d --build
```

여기에 한 가지만 더 챙깁니다. **git에 넣지 않는 것**(`.env` 같은 시크릿, 업로드 파일, DB 데이터)은 git 백업에 포함되지 않습니다. 그런 것이 생기면 별도 백업 방법(비밀 관리 도구, DB 덤프, 볼륨 백업)을 정해야 합니다.

### 5. 업데이트 절차

"고쳐서 다시 띄우기"도 순서를 정해 두면 사고가 줄어듭니다.

```text
1. 무엇을 바꾸나 기록     커밋 메시지, 변경 내역
2. 로컬에서 빌드·확인      npm run build, 로컬 서버로 확인
3. 되돌릴 방법 확인        지금 잘 도는 버전의 커밋·이미지 태그를 적어 둠
4. 배포                   docker compose up -d --build (또는 push → Actions)
5. 확인                   헬스 체크, 주요 페이지 curl, 로그에 에러 없나
6. 문제 시 되돌리기        3번에서 적어 둔 버전으로 다시 배포
```

ts-wiki라면 4번은 Docker 서버에서는 `docker compose up -d --build`, GitHub Pages에서는 `git push`가 전부입니다. 되돌리기는 `git revert`(되돌리는 커밋을 새로 만들기)로 하면 이력이 남아 안전합니다.

**의존성 업데이트**도 같은 절차를 따릅니다. 먼저 상태를 봅니다. 아래는 작성 시점(2026-10)에 ts-wiki 복사본에서 `npm audit`을 실행한 결과입니다.

```bash
npm audit
```

```text
# npm audit report

@vue/server-renderer  <=3.5.41
Severity: high
@vue/server-renderer: XSS via missing CR in attribute-name blacklist - https://github.com/advisories/GHSA-g2v6-rqmx-r4w6
Depends on vulnerable versions of vue
fix available via `npm audit fix --force`
Will install vue@3.5.44, which is outside the stated dependency range
...
esbuild  <=0.24.2
Severity: moderate
esbuild enables any website to send any requests to the development server and read the response - https://github.com/advisories/GHSA-67mh-4wv8-2f99
No fix available
...
5 vulnerabilities (2 moderate, 3 high)
```

읽는 법:

- **무엇이 문제인가**: 패키지 이름, 영향받는 버전 범위, 심각도(low·moderate·high·critical), 설명 링크.
- **내 상황에 해당하나**: 예를 들어 esbuild 항목은 "개발 서버"에 관한 것입니다. ts-wiki의 운영(nginx로 정적 파일 서비스)에는 개발 서버가 돌지 않으므로 영향이 작습니다. 반대로 개발 서버를 `--host 0.0.0.0`으로 사내망에 열어 두고 쓰는 경우에는 따져 봐야 합니다. Vue 항목은 빌드 때 HTML을 만드는 데 쓰이므로, 고칠 수 있다면 고치는 편이 좋습니다.
- **어떻게 고치나**: `npm audit fix`는 `package.json`이 허용하는 범위 안에서 올립니다. `--force`는 그 범위를 넘어 올리므로(위 출력의 "outside the stated dependency range") 다른 것이 깨질 수 있습니다. ts-wiki처럼 버전을 정확히 고정(`"vue": "3.5.13"`)한 프로젝트는 `package.json`의 버전을 직접 올리고 → `npm install` → 빌드·확인 → 커밋하는 편이 안전합니다.
- 이 결과는 실행 시점에 따라 바뀝니다. 새 취약점이 계속 공개되기 때문입니다. 주기적으로(예: 매달) 돌려 봅니다.

### 6. 보안 체크리스트

서버를 띄웠다면 아래를 하나씩 확인합니다.

**네트워크**

- [ ] 꼭 필요한 포트만 열려 있다. `ss -tlnp`(리눅스), `netstat -ano`(Windows)로 확인하고 모르는 포트는 원인을 찾는다.
- [ ] 개발 서버(`npm run dev`)를 외부에 열어 두지 않는다. 개발 서버는 운영용이 아니다.
- [ ] 뒤쪽 서버(Node 등)의 포트는 바깥에 열지 않고 리버스 프록시만 연다(7-4).
- [ ] 방화벽 예외는 필요한 범위(사내망 등)로만 연다.
- [ ] 인터넷에 공개하면 HTTPS를 쓴다.

**시크릿(비밀 값)**

- [ ] 비밀번호·API 키·토큰을 코드에 직접 쓰지 않는다(하드코딩 금지). 환경 변수나 `.env`로 받는다.
- [ ] `.env`는 `.gitignore`에 들어 있다. 예시 값만 담은 `.env.example`을 대신 공유한다.
- [ ] 실수로 커밋한 시크릿은 **지워도 이력에 남으므로** 즉시 그 값을 폐기·재발급한다.
- [ ] 로그·에러 응답에 시크릿과 개인정보가 나오지 않는다(7-3의 500 응답 참고).

**권한**

- [ ] 서버 프로그램을 root가 아닌 전용 사용자로 실행한다(7-5).
- [ ] 비밀이 든 파일은 `600` 권한이다.
- [ ] SSH는 키 로그인을 쓰고, root 직접 로그인과 비밀번호 로그인을 막는다.
- [ ] 계정·권한은 필요한 사람에게 필요한 만큼만 준다(최소 권한).

**소프트웨어**

- [ ] `npm audit`을 주기적으로 돌리고 결과를 판단해 처리한다.
- [ ] 운영체제·Docker 베이스 이미지(`node:22-alpine`, `nginx:1.27-alpine`)도 주기적으로 새로 받아 다시 빌드한다.
- [ ] 서버 종류·버전을 불필요하게 알리지 않는다(Express `app.disable('x-powered-by')`, nginx `server_tokens off;`).
- [ ] 출처가 불분명한 패키지·스크립트·Docker 이미지를 쓰지 않는다. 쓰기 전에 관리 주체와 라이선스를 확인한다.

**정보 공개**

- [ ] 사내 정보(서버 주소, 내부 시스템 구조, 고객사 이름, 계정)를 **공개 저장소에 올리지 않는다.** ts-wiki 저장소는 공개(public)이므로 누구나 볼 수 있다는 점을 늘 기억한다.
- [ ] 스크린샷·로그를 문서에 붙일 때 IP·사용자 이름·토큰을 가린다(이 가이드가 `<이 PC의 IP>`처럼 쓰는 이유).
- [ ] 공개 전에 `git log -p`나 저장소 검색으로 민감한 값이 섞이지 않았는지 확인한다.

::: danger 이미 공개 저장소에 올렸다면
파일을 지우고 다시 커밋해도 **이전 커밋에는 남아 있습니다.** 비밀번호·키라면 먼저 그 값을 폐기·변경하고, 저장소 이력 정리와 후속 조치는 보안 담당 부서와 상의합니다.
:::

## ts-wiki에서는

ts-wiki에는 이번 레슨의 운영 장치가 작게나마 들어 있습니다.

- **재시작**: `docker-compose.yml` 7번 줄 `restart: unless-stopped`. PC나 Docker Desktop이 다시 켜지면 위키 컨테이너도 다시 켜지고, 사람이 `docker compose stop`으로 멈춘 것은 그대로 둡니다.
- **시크릿 보호**: `.gitignore` 7~8번 줄 `.env`, `.env.*`. ts-wiki 자체에는 시크릿이 없지만, 나중에 생겨도 실수로 올라가지 않게 미리 막아 둔 것입니다.
- **로그·빌드 산출물 제외**: `.gitignore` 6번 줄 `*.log`, 1~3번 줄 `node_modules/`, `docs/.vitepress/dist/`, `docs/.vitepress/cache/`. 다시 만들 수 있는 것은 저장소(=백업)에 넣지 않습니다.
- **이미지에 불필요한 것 넣지 않기**: `.dockerignore` 1~5번 줄 `node_modules`, `docs/.vitepress/dist`, `docs/.vitepress/cache`, `examples`, `.git`. 이미지 크기를 줄이고, 저장소 이력 같은 정보가 이미지에 섞이지 않게 합니다.
- **재현 가능한 설치**: `Dockerfile` 7번 줄 `RUN npm ci`, `deploy.yml` 29번 줄 `- run: npm ci`. lock 파일 그대로 설치하므로 "어제는 됐는데 오늘은 안 됨"이 줄어듭니다.
- **최소 권한 배포**: `deploy.yml` 9~12번 줄 `permissions:`에서 `contents: read`, `pages: write`, `id-token: write`만 줍니다. 워크플로가 저장소에 쓰기를 할 수 없게 한 것입니다.
- **백업**: 원본은 전부 git에 있고, GitHub(Hong-coding/ts-wiki)에 push되어 있습니다. 서버가 사라져도 `git clone` → `docker compose up -d --build`로 복구됩니다.

반대로 ts-wiki에 **없는** 것: 헬스 체크(`docker-compose.yml`에 `healthcheck`가 없음), `server_tokens off;`, 로그 보관 정책. 정적 위키라 위험이 작아 생략된 것이지만, 이 레슨의 과제로 직접 추가해 볼 수 있습니다(복사본에서).

## 자주 하는 실수

1. **증상**: 컨테이너가 `Restarting (1) ...` 상태를 계속 오간다.
   **원인**: 크래시 루프입니다. 프로그램이 시작하자마자 죽고, 재시작 정책이 계속 다시 켭니다.
   **해결**: `docker logs 컨테이너`로 맨 처음 에러를 찾습니다. 설정 파일 누락, 포트 충돌, 환경 변수 누락이 흔한 원인입니다.
2. **증상**: `docker stop` 했는데 PC를 재부팅하니 다시 떠 있다.
   **원인**: `restart: always`입니다.
   **해결**: 손으로 멈춘 것을 유지하려면 `unless-stopped`를 씁니다(ts-wiki 설정).
3. **증상**: 헬스 체크는 계속 OK인데 손님은 접속이 안 된다고 한다.
   **원인**: 헬스 체크를 서버 안(`localhost`)에서만 하고 있어 방화벽·프록시·DNS 문제를 보지 못합니다.
   **해결**: 손님과 같은 경로(바깥 주소, 프록시 경유)로도 확인합니다.
4. **증상**: `npm audit fix --force` 후 빌드가 깨졌다.
   **원인**: 허용 범위를 넘는 큰 버전 변경이 들어갔습니다.
   **해결**: `git checkout package.json package-lock.json`으로 되돌리고, 패키지를 하나씩 올리며 확인합니다.
5. **증상**: `.env`를 `.gitignore`에 넣었는데도 GitHub에 올라가 있다.
   **원인**: `.gitignore`에 넣기 **전에** 이미 커밋되어 git이 추적 중입니다.
   **해결**: `git rm --cached .env`로 추적을 끊고 커밋합니다. 이미 올라간 값은 폐기·재발급합니다.

## 직접 해 보기

### 과제 1 ⭐ 재시작 정책 비교

`lab-crash` 실험을 `--restart no`와 `--restart on-failure:5`로 다시 해 보고 `RestartCount`를 비교하세요. 끝나면 `docker rm -f lab-crash`.

::: details 정답 보기
`no`는 `RestartCount=0`, `on-failure:5`는 `RestartCount=5`가 됩니다. 재시작 간격은 점점 늘어나므로(공식 문서 기준) 5번이면 조금 더 기다려야 합니다.
:::

### 과제 2 ⭐ 내 PC의 열린 포트 점검

Windows에서 `netstat -ano | findstr LISTENING`(또는 macOS `lsof -iTCP -sTCP:LISTEN`)을 실행해, 내가 모르는 포트가 있는지 보고 어떤 프로그램인지 찾아보세요.

::: details 힌트
PID를 얻은 뒤 PowerShell에서 `Get-Process -Id <PID>`로 프로그램 이름을 봅니다. 모르는 프로그램이라고 바로 끄지 말고, 무엇인지 먼저 확인합니다(운영체제 서비스일 수 있습니다).
:::

### 과제 3 ⭐⭐ 헬스 체크를 반복 실행

`healthcheck.ts`를 10초마다 실행해, 실패하면 시각과 함께 `FAIL`을 화면에 남기는 반복 명령을 만들어 보세요. 중간에 서버를 껐다 켜 봅니다.

:::: details 정답 보기
::: code-group
```bash [bash]
while true; do date +%T; node healthcheck.ts; sleep 10; done
```
```powershell [PowerShell]
while ($true) { Get-Date -Format T; node healthcheck.ts; Start-Sleep 10 }
```
:::
`Ctrl+C`로 멈춥니다. 이것이 모니터링 도구가 하는 일의 가장 작은 형태입니다.
::::

### 과제 4 ⭐⭐ 복구 연습

ts-wiki 복사본 폴더를 통째로 지웠다고 가정하고, git 저장소에서 다시 받아 Docker로 띄우는 데 몇 분 걸리는지 재 보세요. 포트는 `docker-compose.yml`을 고쳐 `8192:80` 등으로 바꿔 원본 8090과 겹치지 않게 합니다. 끝나면 `docker compose down`.

::: details 힌트
복구 절차를 순서대로 메모해 두면 그것이 "복구 매뉴얼"이 됩니다. 걸린 시간의 대부분은 `npm ci`와 빌드입니다.
:::

### 과제 5 ⭐⭐⭐ 내 서버 보안 점검표 작성

7-3의 Express 서버(또는 내 프로젝트)에 위 보안 체크리스트를 적용해, 항목마다 "해당/해당 없음/조치 필요"를 표시하고 조치 필요 항목 두 개를 실제로 고쳐 보세요.

::: details 예시
- `X-Powered-By` 노출 → `app.disable('x-powered-by')` 추가 (조치 완료)
- `.env`가 `.gitignore`에 없음 → 추가하고 `.env.example` 작성 (조치 완료)
- HTTPS → 로컬 실습이라 해당 없음, 공개 시 7-4 절차 적용
:::

## 확인 퀴즈

1. Docker `restart: always`와 `unless-stopped`의 차이는 무엇입니까?
2. 재시작 정책이 있는데도 로그를 꼭 봐야 하는 이유는 무엇입니까?
3. 헬스 체크에서 상태 코드뿐 아니라 응답 내용까지 확인하는 이유는 무엇입니까?
4. 위키에서 "git이 곧 백업"이라고 할 수 있는 이유와, 그래도 git 백업에 빠지는 것은 무엇입니까?
5. `.env`를 실수로 공개 저장소에 커밋했다면 가장 먼저 할 일은 무엇입니까?

::: details 정답 보기
1. `always`는 사람이 멈춘 컨테이너도 Docker가 다시 시작될 때 켜고, `unless-stopped`는 사람이 멈춘 것은 그대로 둡니다.
2. 재시작은 증상을 덮을 뿐 원인을 고치지 않고, 크래시 루프가 계속될 수 있기 때문입니다.
3. 404 페이지나 에러 페이지도 "응답"이기 때문에, 기대한 내용(`status: ok`)이 왔는지 봐야 진짜 정상인지 알 수 있습니다.
4. 위키의 원본(마크다운·설정)은 전부 git에 있고 push하면 다른 곳에 사본이 생기기 때문입니다. `.env` 같은 git에 넣지 않는 파일, 업로드 파일, DB 데이터는 빠집니다.
5. 그 시크릿 값을 폐기·재발급(변경)하는 것입니다. 파일을 지워도 이력에 남습니다.
:::

## 정리

- 로그는 띄운 방법에 따라 `docker logs`, `journalctl`, `tail -f`로 보고, 시각 → 상태 코드 → 첫 에러 → 앞단/뒷단 순으로 읽습니다.
- 재시작 정책(Docker `restart`, systemd `Restart=`, pm2)은 한 가지만 쓰고, 크래시 루프는 원인을 고쳐야 멈춥니다.
- 헬스 체크는 종료 코드 0/1로 결과를 알리고, 응답 내용까지 확인합니다.
- 백업은 "다시 만들 수 없는 것을, 다른 곳에, 복구 연습까지". 위키는 git이 곧 백업입니다.
- 업데이트는 기록 → 로컬 확인 → 되돌릴 방법 → 배포 → 확인 → 필요 시 되돌리기. `npm audit` 결과는 내 상황에 해당하는지 판단해 처리합니다.
- 보안의 기본은 포트 최소화, 시크릿 하드코딩 금지(`.env` + `.gitignore`), 최소 권한, 의존성 점검, 사내 정보 공개 저장소 업로드 금지입니다.

## 다음 단계

[연습 과제와 자가 진단](./07-projects) — 지금까지 배운 것을 단계별 과제 12개로 굳히고, 25문항 자가 진단으로 다음에 무엇을 공부할지 정합니다.
