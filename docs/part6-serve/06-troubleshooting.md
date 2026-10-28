---
title: '문제 해결: 서버가 안 뜰 때'
---

# 문제 해결: 서버가 안 뜰 때

<LessonMeta level="실전" :minutes="45" prev="GitHub Actions로 ts-wiki를 Pages에 자동 배포하는 흐름을 따라갔습니다" />

## 이번에 배울 것

- 서버가 안 뜰 때 증상을 보고 "어느 층(내 PC / 서버 프로그램 / 빌드 / Docker / 네트워크 / GitHub)"의 문제인지 좁힐 수 있다.
- 자주 만나는 에러 메시지를 읽고 원인을 바로 떠올릴 수 있다.
- 각 원인을 **확인하는 명령**을 실행해 추측이 아닌 근거로 판단할 수 있다.
- 고친 뒤 같은 문제가 다시 생기지 않게 하는 습관을 만들 수 있다.

## 먼저 알아 둘 것

- 이 파트의 앞 레슨 전부: [6-1](./01-dev-server), [6-2](./02-static-serve), [6-3](./03-docker-nginx), [6-4](./04-compose), [6-5](./05-github-pages)
- 아래의 "실제 메시지"는 작성 시점(2026-10, Windows 11 · Node.js 24.13.1 · VitePress 1.6.3 · Docker 25.0.3)에 직접 재현해서 옮긴 것입니다. 직접 재현하지 못한 항목은 그렇다고 밝혔습니다. Windows가 영어로 설정되어 있으면 Windows 메시지도 영어로 나옵니다.

## 비유로 이해하기

서버 문제 해결은 **수도가 안 나올 때 원인 찾기**와 같습니다.

1. 우리 집 수도꼭지만 안 나오나, 아파트 전체가 안 나오나? → **범위 좁히기** (내 PC에서는 되나? 다른 PC에서만 안 되나?)
2. 계량기는 돌고 있나? → **서버 프로그램이 떠 있나** (`netstat`, `docker ps`)
3. 관이 막혔나? → **연결 경로** (방화벽, 포트, base 경로)
4. 정수장(원본)에서 물이 나오고 있나? → **빌드 결과물이 제대로 만들어졌나**

위에서부터 하나씩 "여기는 정상"을 확인하며 내려가면, 문제는 반드시 어느 한 층에 있습니다. 가장 나쁜 방법은 여러 군데를 한꺼번에 고치는 것입니다. 고쳐져도 무엇 때문인지 모릅니다.

## 개념 설명

### 첫 3분 점검 순서

어떤 증상이든 먼저 이 순서로 봅니다.

```text
① 에러 메시지가 있나? → 있으면 맨 아래 결과 줄이 아니라 "처음 나온 error 줄"을 읽는다
② 서버가 떠 있나?     → 그 포트를 누가 LISTEN 하는지 본다
③ 내 PC에서 되나?     → curl http://localhost:포트/
④ 다른 곳에서만 안 되나? → 방화벽·네트워크·base 경로
⑤ 최근에 무엇을 바꿨나? → 바꾼 것 하나를 되돌려 본다
```

②번에 쓰는 명령은 이 레슨 내내 나옵니다.

Windows(PowerShell):

```powershell
netstat -ano | findstr :5190
Get-NetTCPConnection -LocalPort 5190 -State Listen
```

macOS/Linux(bash):

```bash
lsof -nP -iTCP:5190 -sTCP:LISTEN
```

### 증상별 찾아보기 표

| # | 증상 | 가장 흔한 원인 | 먼저 칠 명령 |
|---|---|---|---|
| 1 | `npm`/`docker`/`gh` 명령을 못 찾음 | 설치 안 됨, 터미널을 새로 안 엶 | `Get-Command npm` / `which npm` |
| 2 | `Port ... is in use` / 엉뚱한 포트로 뜸 | 이미 켜진 서버 | `netstat -ano \| findstr :포트` |
| 3 | 내 PC는 되는데 다른 PC에서 안 됨 | `--host` 없음, 방화벽, 다른 네트워크 | `netstat` 주소 칸, `Test-NetConnection` |
| 4 | `npm run build` 실패 | dead link, frontmatter, 이중 중괄호, git 없음 | 에러의 `file:` 줄 |
| 5 | 흰 화면 / 디자인 깨짐 | `base` 불일치 | `grep href dist/index.html` |
| 6 | 링크 클릭은 되는데 새로 고침하면 404 | 서버가 cleanUrls 미지원 (`try_files` 없음) | `curl -I 주소`와 `주소.html` 비교 |
| 7 | `error during connect` / 데몬 연결 실패 | Docker Desktop 꺼짐 | `docker version` |
| 8 | 컨테이너가 바로 `Exited` | nginx 설정 오류 등 | `docker logs 컨테이너` |
| 9 | 고쳤는데 반영이 안 됨 | 재빌드 안 함, 브라우저 캐시 | `docker compose up -d --build`, `curl` |
| 10 | Actions 빨간 ✗ | 빌드 실패, 권한·설정 | `gh run list`, `gh run view --log-failed` |
| 11 | Pages 주소가 404 | Pages Source 미설정, 첫 배포 전, 주소 오타 | `gh api repos/<소유자>/<저장소>/pages` |

아래에서 각 항목을 **증상 → 원인 → 확인 명령 → 해결 → 재발 방지** 순서로 봅니다.

### 1. 명령을 못 찾음

**증상(실제 메시지)** — 없는 명령 `npmx`를 일부러 실행해 재현했습니다.

PowerShell:

```text
The term 'npmx' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

명령 프롬프트(cmd):

```text
'npmx' is not recognized as an internal or external command,
operable program or batch file.
```

한국어 Windows에서는 "용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다" / "내부 또는 외부 명령, 실행할 수 있는 프로그램, 또는 배치 파일이 아닙니다" 같은 문장으로 나옵니다.

**원인**

- 프로그램이 설치되지 않았습니다.
- 설치는 했는데 **설치 전에 열어 둔 터미널**을 쓰고 있습니다. 터미널은 열릴 때의 PATH(프로그램을 찾아볼 폴더 목록)를 기억하므로, 설치 후 새로 열어야 새 PATH를 읽습니다.
- 철자가 틀렸습니다(`docker-compose`와 `docker compose`처럼).

**확인 명령**

```powershell
Get-Command npm, node, docker, gh -ErrorAction SilentlyContinue | Select-Object Name, Source
```

```bash
which npm node docker gh
```

작성 PC에서 `gh`는 `C:\Program Files\GitHub CLI\gh.exe`로 찾아졌습니다. 아무것도 안 나오면 그 프로그램은 PATH에 없습니다.

**해결**: 터미널(VS Code라면 VS Code 전체)을 닫고 다시 엽니다. 그래도 없으면 [준비물 설치](../part0-start/03-setup)대로 설치합니다.

**재발 방지**: 설치 직후에는 항상 새 터미널에서 `node -v`, `docker --version`으로 확인하는 습관을 들입니다.

### 2. 포트 사용 중

**증상(실제 메시지)**

VitePress 개발 서버(기본):

```text
Port 5190 is in use, trying another one...
```

`--strictPort`를 준 경우:

```text
failed to start server. error:
Port 5193 is already in use
```

**원인**: 같은 포트를 다른 프로그램(대개 예전에 켜 두고 잊은 서버)이 쓰고 있습니다. 기본 설정에서는 에러 없이 **다음 번호로 옮겨 가기 때문에** "켜졌는데 예전 화면이 보인다"로 나타나기도 합니다.

**확인 명령**

```powershell
Get-NetTCPConnection -LocalPort 5190 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
Get-Process -Id <위에서 나온 OwningProcess>
```

```text
LocalAddress LocalPort OwningProcess
------------ --------- -------------
0.0.0.0           5190         46156

   Id ProcessName
   -- -----------
46156 node
```

**해결**

- 그 프로그램이 내가 띄운 서버면 원래 터미널에서 `Ctrl+C`, 터미널을 모르면 `Stop-Process -Id 46156`(macOS/Linux `kill 46156`).
- 끄면 안 되는 프로그램이면 내 서버의 포트를 바꿉니다(`npx vitepress dev docs --port 5194`).
- Docker 컨테이너가 쓰고 있다면 `docker ps`의 `PORTS` 칸에 보입니다. `docker compose down`이나 `docker rm -f 이름`으로 정리합니다.

**재발 방지**: 서버를 띄우면 출력의 `Local:` 줄을 꼭 읽습니다. 번호가 꼭 고정돼야 하면 `--strictPort`를 씁니다. `npx` 같은 부모 프로세스만 끄면 자식 `node`가 남을 수 있으므로(6-1), 끈 뒤 `netstat`으로 포트가 비었는지 확인합니다.

### 3. 다른 PC에서 접속이 안 됨

**증상**: 서버 PC의 브라우저에서는 `http://localhost:5190`이 뜨는데, 다른 PC에서 `http://<서버 IP>:5190`은 "사이트에 연결할 수 없음". curl로는 연결 실패(종료 코드 7, 상태 코드 `000`).

**원인 후보**(위에서부터 확인)

1. 서버가 `localhost`에서만 기다립니다(`--host` 없음).
2. 방화벽이 들어오는 연결을 막습니다.
3. 두 PC가 다른 네트워크에 있습니다(사내 유선망과 손님용 와이파이, VPN 등).
4. IP를 잘못 봤습니다(VPN·WSL 가상 어댑터의 IP를 고름).

**확인 명령**

① 주소 칸이 `0.0.0.0`(모든 주소)인지, `127.0.0.1`/`[::1]`(이 PC만)인지 봅니다.

```text
  TCP    0.0.0.0:5190           0.0.0.0:0              LISTENING       46156
  TCP    [::1]:5191             [::]:0                 LISTENING       39608
```

② 서버 PC **자신**에서 IP로 접속해 봅니다. 여기서 되면 서버 쪽 설정은 정상입니다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://<이 PC의 IP>:5190/
```

③ 다른 Windows PC에서 그 포트까지 길이 뚫려 있는지 봅니다.

```powershell
Test-NetConnection -ComputerName <서버 IP> -Port 5190
```

열린 포트와 닫힌 포트를 이 PC에서 시험한 실제 결과(요약):

```text
ComputerName     : localhost
RemotePort       : 5180
TcpTestSucceeded : True

ComputerName     : localhost
RemotePort       : 5199
TcpTestSucceeded : False
```

②는 되는데 다른 PC의 ③이 `False`면 방화벽이나 네트워크 문제입니다.

④ 방화벽 허용 규칙을 읽기만 해서 봅니다.

```powershell
Get-NetFirewallRule -Direction Inbound -Enabled True | Where-Object DisplayName -like '*node*' | Select-Object DisplayName,Action,Profile
```

**해결**

- ①이 원인: `--host 0.0.0.0`을 붙여 다시 띄웁니다(ts-wiki의 `npm run dev`에는 이미 들어 있습니다).
- 방화벽: 관리자 권한으로 해당 포트 허용 규칙을 추가합니다(명령은 [6-1](./01-dev-server) 5단계). **회사 PC는 IT 담당자와 먼저 상의합니다.**
- Docker 컨테이너(`-p 8090:80`)는 `0.0.0.0`으로 열리지만, Docker Desktop 앞의 Windows 방화벽은 별도로 확인해야 합니다.

**재발 방지**: "내 PC에서 IP로 curl → 다른 PC에서 Test-NetConnection" 두 단계를 기억해 두면 서버 문제와 네트워크 문제를 1분 안에 나눌 수 있습니다.

### 4. 빌드 실패: 유형별 에러 메시지

빌드 에러는 **`build error:` 바로 아래 줄**과 **`file:` 줄**이 핵심입니다. 그 아래 `at ...`으로 시작하는 줄들(스택 트레이스, 에러가 난 코드 위치 목록)은 대부분 VitePress 내부 위치라 처음에는 건너뛰어도 됩니다.

**4-1. dead link (없는 페이지로 링크)**

```text
(!) Found dead link ./menu in file index.md
...
build error:
[vitepress] 1 dead link(s) found.
```

- 원인: `index.md`의 `./menu` 링크 대상 파일이 없습니다.
- 해결: 링크를 고치거나 파일을 만듭니다. 이 가이드처럼 커리큘럼 파일로 목차를 만드는 위키라면 slug 오타도 의심합니다.

**4-2. frontmatter의 콜론**

`title: 메뉴: 오늘의 커피`처럼 값 안에 `:`가 있으면:

```text
[vitepress] incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line at line 2, column 10:
    title: 메뉴: 오늘의 커피
             ^
file: .../mini/menu.md
```

- 원인: frontmatter(문서 맨 위 `---` 사이의 YAML 설정)에서 두 번째 콜론을 새 키로 해석했습니다. `^`가 문제 위치를 가리킵니다.
- 해결: `title: '메뉴: 오늘의 커피'`처럼 작은따옴표로 감쌉니다. ts-wiki에는 이것을 자동으로 고치는 `npm run fix:frontmatter`가 있습니다.

**4-3. 본문의 이중 중괄호**

마크다운 본문에 아래처럼 인라인 코드로 이중 중괄호를 쓰면:

```md
표현식 `{{ x.y }}` 예시
```

```text
✓ building client + server bundles...
✖ rendering pages...
build error:
Cannot read properties of undefined (reading 'y')
```

- 원인: VitePress는 마크다운을 Vue 템플릿으로 바꾸는데, Vue는 이중 중괄호를 "여기에 값을 넣어라"는 문법으로 해석합니다. 인라인 코드 안이라도 마찬가지입니다. `x`라는 값이 없으니 렌더링(rendering, 페이지를 HTML로 그리는 단계)에서 실패했습니다.
- 특징: 에러에 **파일 이름이 안 나옵니다.** 최근 고친 파일에서 이중 중괄호를 검색합니다. 아래 명령은 코드 블록 안의 정상적인 것도 함께 찾으므로 결과를 눈으로 거릅니다.

  ```bash
  grep -rn "{{" docs --include=*.md
  ```
- 해결: 펜스 코드 블록(```) 안에 쓰거나, `<span v-pre>`로 감쌉니다. [문서 작성 규칙](../guide/writing-guide)의 2번 규칙입니다.

**4-4. Docker 안에서만 실패: spawn git ENOENT**

```text
#13 34.79 build error:
#13 34.79 [vitepress] spawn git ENOENT
#13 34.79 file: /app/docs/appendix/02-cheatsheet.md
#13 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
```

- 원인: `lastUpdated: true`가 git을 실행하는데 `node:22-alpine`에 git이 없습니다.
- 언제 생기나: git 설치 줄이 없는 Dockerfile을 쓸 때입니다. ts-wiki도 처음에는 이 줄이 없어서 이 가이드를 쓰는 중에 실제로 이 에러가 났습니다. 다른 프로젝트의 Dockerfile을 복사해 왔거나, 이유를 모르고 그 줄을 지웠을 때도 생깁니다.
- 확인: `Dockerfile`의 빌드 단계(`FROM node:22-alpine AS build` 아래)에 `RUN apk add --no-cache git`이 있는지 봅니다. ts-wiki는 3~4번째 줄입니다.
- 해결: 그 줄을 넣고 다시 빌드합니다([6-3](./03-docker-nginx) 1·5단계).
- 재발 방지: ts-wiki처럼 바로 위에 "왜 필요한지" 주석을 달아 두면 나중에 지워지지 않습니다.

**확인 명령(공통)**: 로컬에서 같은 빌드를 돌려 같은 에러가 나는지 봅니다. 로컬은 되는데 Docker·Actions에서만 실패하면 **환경 차이**(git 유무, Node 버전, 대소문자 구분)를 의심합니다.

```bash
npm run build
```

**재발 방지**: push·이미지 빌드 전에 로컬 `npm run build`. 문서 작성 규칙(콜론은 따옴표, 이중 중괄호는 코드 블록 안에서만)을 지킵니다.

### 5. 흰 화면 / CSS 깨짐 (base)

**증상**: 페이지 글자는 보이는데 디자인이 전부 없거나, 아예 흰 화면. 브라우저 개발자 도구(F12) → Network 탭에 `style.xxx.css`, `app.xxx.js`가 404.

**원인**: 빌드할 때의 `base`와 실제 서비스 위치가 다릅니다.

| 빌드한 base | 서비스 위치 | 결과 |
|---|---|---|
| `/` | `https://<사용자>.github.io/ts-wiki/` | CSS 404 (깨짐) |
| `/ts-wiki/` | `https://<사용자>.github.io/ts-wiki/` | 정상 |
| `/ts-wiki/` | Docker `http://localhost:8090/` | CSS 404 (깨짐) |
| `/` | Docker `http://localhost:8090/` | 정상 |

**확인 명령**: 결과물이 CSS를 어디서 찾는지 봅니다.

```bash
grep -o 'href="[^"]*css"' docs/.vitepress/dist/index.html
```

6-5에서 재현한 실제 결과:

```text
href="/assets/style.DFTx90Kk.css"            ← base 없이 빌드
href="/ts-wiki/assets/style.q255pke8.css"    ← WIKI_BASE=/ts-wiki/ 로 빌드
href="C:/Program Files/Git/ts-wiki/assets/style.Rgu-bSQa.css"   ← Git Bash가 경로를 바꿔 버린 경우
```

그리고 그 CSS 주소를 직접 요청합니다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5198/assets/style.DFTx90Kk.css
```

```text
404
```

**해결**: 서비스 위치에 맞는 base로 다시 빌드합니다. ts-wiki는 `WIKI_BASE` 환경 변수로 정합니다(Actions는 자동, Docker는 지정 안 함 = `/`). Git Bash에서 직접 지정할 때는 `MSYS_NO_PATHCONV=1`을 앞에 붙입니다.

**재발 방지**: "어디에 올릴 결과물인가"를 빌드 명령과 함께 기억합니다. 한 `dist`를 Pages와 Docker 양쪽에 돌려 쓰지 않습니다.

### 6. 새로 고침하면 404 (try_files)

**증상**: 홈에서 사이드바 링크를 누르면 잘 열리는데, 그 페이지에서 새로 고침(`F5`)하거나 주소를 직접 넣으면 404. Python 서버라면 "Error response / File not found" 화면.

**원인**: cleanUrls 때문에 주소는 `/guide/roadmap`인데 파일은 `roadmap.html`입니다. 서버가 `.html`을 붙여 찾지 못합니다. 링크 클릭은 브라우저 안의 JavaScript가 처리하므로 서버를 거치지 않아 문제가 숨어 있다가, 새로 고침할 때 드러납니다.

**확인 명령**: 확장자 있는 주소와 없는 주소를 비교합니다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8192/guide/roadmap
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8192/guide/roadmap.html
```

`try_files` 없는 nginx로 재현한 실제 결과와 로그:

```text
404
200
```

```text
[error] 21#21: *1 open() "/usr/share/nginx/html/guide/roadmap" failed (2: No such file or directory)
```

없는 쪽만 404면 이 문제입니다.

**해결**

- nginx: `location / { try_files $uri $uri.html $uri/ =404; }` (ts-wiki `nginx.conf` 9번째 줄)
- 로컬 확인: cleanUrls를 아는 서버(vitepress preview, `npx serve`, `npx http-server`)를 씁니다([6-2](./02-static-serve)).
- 그 밖의 서버: "없으면 `.html`을 붙여 찾기" 설정을 찾거나, `cleanUrls: false`로 빌드합니다.

**재발 방지**: 배포 후 확인할 때 홈만 보지 말고 **하위 페이지 주소를 직접 열어** 새로 고침까지 해 봅니다.

### 7. Docker 데몬 미실행

**증상(실제 메시지)** — 작성 중 Docker Desktop이 꺼진 상태에서 `docker build`를 실행했을 때 실제로 나온 메시지입니다.

```text
ERROR: error during connect: this error may indicate that the docker daemon is not running: Get "http://%2F%2F.%2Fpipe%2Fdocker_engine/_ping": open //./pipe/docker_engine: The system cannot find the file specified.
```

`docker images` 같은 다른 명령도 주소 부분만 다르고 같은 문장으로 시작합니다. 핵심은 앞부분 `this error may indicate that the docker daemon is not running`입니다.

**원인**: `docker` 명령(클라이언트)은 설치되어 있지만, 실제 일을 하는 Docker 엔진(데몬, daemon, 뒤에서 늘 돌며 요청을 처리하는 프로그램)이 꺼져 있습니다. Windows·macOS에서는 Docker Desktop을 켜야 엔진이 뜹니다.

**확인 명령**

```bash
docker version
```

정상이면 `Client:`와 `Server:` 두 부분이 다 나옵니다. 작성 PC에서는 둘 다 25.0.3이었습니다. `Server:` 부분 대신 위 에러가 나오면 엔진이 꺼진 것입니다.

**해결**: Docker Desktop을 실행하고, 고래 아이콘이 "Docker Desktop is running"(또는 Engine running)이 될 때까지 기다린 뒤 다시 실행합니다. Linux는 `sudo systemctl start docker`.

**재발 방지**: 서버 PC라면 Docker Desktop 자동 시작을 켭니다([6-4](./04-compose) 7단계).

### 8. 컨테이너가 바로 종료됨

**증상**: `docker run -d ...`은 ID를 출력했는데, `docker ps`에 안 보이고 `docker ps -a`에는 `Exited (1)`. 브라우저는 연결 실패.

nginx 설정 파일에서 `listen 80` 뒤 세미콜론을 빼고 재현한 실제 결과:

```text
wsg-bad Exited (1) 4 seconds ago
```

**원인**: 컨테이너는 그 안의 주 프로그램(여기서는 nginx)이 끝나면 함께 끝납니다. nginx가 설정 오류로 시작하자마자 종료했습니다. 재시작 정책이 `unless-stopped`면 `Restarting` 상태로 계속 죽었다 살아납니다.

**확인 명령**: 꺼진 컨테이너의 로그도 남아 있습니다.

```bash
docker ps -a --filter name=wsg-bad
docker logs wsg-bad
```

```text
/docker-entrypoint.sh: Configuration complete; ready for start up
2026/10/28 02:09:46 [emerg] 1#1: invalid parameter "root" in /etc/nginx/conf.d/default.conf:3
nginx: [emerg] invalid parameter "root" in /etc/nginx/conf.d/default.conf:3
```

`[emerg]`(emergency)는 nginx의 가장 심각한 수준의 에러입니다. "3번째 줄의 `root`가 잘못된 값"이라고 하지만 실제 잘못은 **바로 윗줄**(2번째 줄 `listen 80` 뒤 세미콜론 누락)입니다. 세미콜론이 없으면 nginx는 다음 줄까지 한 문장으로 읽기 때문입니다.

**해결**: 설정을 고친 뒤 이미지를 다시 빌드하고 띄웁니다. 이미지를 만들기 전에 `nginx -t`(설정 문법만 검사하고 끝냄)로 미리 확인할 수 있습니다.

```bash
docker run --rm -v "<설정 파일 경로>:/etc/nginx/conf.d/default.conf:ro" nginx:1.27-alpine nginx -t
```

실제 출력(앞쪽 시작 안내 줄 생략). 잘못된 설정:

```text
nginx: [emerg] invalid parameter "root" in /etc/nginx/conf.d/default.conf:3
nginx: configuration file /etc/nginx/nginx.conf test failed
```

ts-wiki의 `nginx.conf`:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Windows PowerShell에서 `<설정 파일 경로>`는 `${PWD}\nginx.conf`처럼 씁니다. Git Bash에서는 `/etc/...` 경로가 바뀌지 않도록 앞에 `MSYS_NO_PATHCONV=1`을 붙입니다(6-5).

**재발 방지**: nginx 설정을 고치면 `nginx -t`부터. 컨테이너가 안 보이면 `docker ps`가 아니라 `docker ps -a`와 `docker logs`를 봅니다. 실습한 컨테이너는 `docker rm -f`로 지웁니다.

### 9. 변경이 반영되지 않음 (캐시 / 재빌드)

**증상**: 마크다운을 고쳤는데 화면이 그대로.

**원인과 확인**: 어떤 방식으로 띄웠는지에 따라 다릅니다.

| 띄운 방식 | 반영되려면 | 확인 |
|---|---|---|
| 개발 서버 | 저장만 하면 HMR로 바로 | 파일을 실제로 **저장**했는지(편집기 탭의 점 표시) |
| preview / 정적 서버 | `npm run build` 다시 | `dist`의 HTML 수정 시각 |
| Docker 직접 실행 | `docker build` → 컨테이너 교체 | `docker images`의 `CREATED` |
| Docker Compose | `docker compose up -d --build` | `docker compose ps`의 `CREATED` |
| GitHub Pages | commit + push → Actions 성공 | `gh run list` 최신 실행이 내 커밋인지 |

서버는 바뀌었는데 브라우저만 옛것을 보여 주는 경우도 있습니다. 브라우저 캐시를 피해 서버 응답을 직접 봅니다.

```bash
curl -s http://localhost:8090/guide/roadmap | grep -c "고친 문장 일부"
```

1 이상이면 서버는 새 내용을 주고 있으므로 브라우저 문제입니다. 강력 새로 고침(`Ctrl+F5`, macOS `Cmd+Shift+R`)을 합니다. ts-wiki nginx 설정은 HTML에는 장기 캐시를 걸지 않아서 대개 일반 새로 고침으로도 바뀝니다.

**재발 방지**: "글 고침 → (방식에 맞는) 재빌드 → curl 확인"을 한 세트로 외웁니다. 6-4의 `--build`를 빼먹는 경우가 가장 많습니다.

### 10. GitHub Actions 실패

**증상**: Actions 탭에 빨간 ✗, 사이트는 예전 내용.

**확인 명령**(읽기 전용)

```bash
gh run list -R <소유자>/<저장소> --limit 5
gh run list -R <소유자>/<저장소> --status failure --limit 3
gh run view <실행 ID> -R <소유자>/<저장소>
gh run view <실행 ID> -R <소유자>/<저장소> --log-failed
```

작성 시점 ts-wiki에는 실패한 실행이 없어서 두 번째 명령의 출력이 비어 있었고, `--log-failed`의 실제 출력은 확인하지 못했습니다(GitHub CLI 공식 문서 기준 명령입니다). `gh run view`의 `JOBS` 부분에서 **어느 작업(build/deploy)의 어느 단계**가 실패했는지 먼저 봅니다.

**원인별 해결**

| 실패 위치 | 흔한 원인 | 해결 |
|---|---|---|
| build → `npm ci` | `package-lock.json`이 `package.json`과 안 맞음 | 로컬에서 `npm install` 후 lock 파일까지 커밋 |
| build → `npm run build` | 4번 항목(dead link, frontmatter, 이중 중괄호) | 로컬 `npm run build`로 같은 에러 재현 후 수정 |
| deploy | Pages Source가 GitHub Actions가 아님, 권한 부족 | Settings → Pages 확인, `deploy.yml`의 `permissions` 확인 |
| 실행 자체가 안 생김 | 다른 브랜치에 push, 워크플로 경로 오류 | `git branch`, `.github/workflows/` 위치 확인 |

경고(`!`, ANNOTATIONS)는 실패가 아닙니다. 작성 시점 ts-wiki 실행에는 "Node.js 20 is deprecated" 경고가 붙어 있었지만 성공했습니다. 다만 나중에 실패로 바뀔 수 있으니 액션 버전 업데이트 소식을 챙깁니다.

**재발 방지**: push 전 로컬 빌드. Actions 실패 알림 메일을 꺼 두지 않습니다.

### 11. Pages 주소가 404

**증상**: `https://<사용자>.github.io/<저장소>/`에서 GitHub의 404 화면("There isn't a GitHub Pages site here.")이 나옵니다. (이 화면 문구는 직접 재현하지 않았습니다.)

**원인 후보**

1. Pages가 아직 켜지지 않았거나 Source가 GitHub Actions가 아닙니다.
2. 첫 배포가 아직 성공하지 않았습니다.
3. 주소를 잘못 썼습니다. 저장소 이름 대소문자, 끝의 `/`, 사용자 페이지와 프로젝트 페이지의 혼동.

작성 시점 실제 확인 결과로 "어디가 정상 주소인지" 감을 잡습니다.

```text
https://hong-coding.github.io/ts-wiki/      → 200
https://hong-coding.github.io/ts-wiki       → 301 (끝에 / 붙은 주소로 이동)
https://hong-coding.github.io/ts-wiki/nope  → 404 (위키의 404 페이지)
https://hong-coding.github.io/              → 404 (사용자 페이지가 없음)
```

**확인 명령**

```bash
gh api repos/<소유자>/<저장소>/pages
gh run list -R <소유자>/<저장소> --limit 3
```

`gh api ... /pages`가 응답하고 `"build_type": "workflow"`, `html_url`이 보이면 Pages는 켜져 있습니다. Pages가 꺼져 있으면 이 API는 에러(404)를 돌려줍니다(GitHub REST API 공식 문서 기준).

**해결**: Settings → Pages → Source를 GitHub Actions로 하고, Actions 탭에서 `Deploy wiki`를 성공시킵니다(`workflow_dispatch`가 있으므로 "Run workflow" 버튼으로 다시 돌릴 수 있습니다). 주소는 `gh api`가 알려 준 `html_url`을 그대로 씁니다.

**재발 방지**: 저장소 이름을 바꾸면 주소도 바뀝니다. README와 `config.mts`의 `editLink`·`socialLinks` 주소도 함께 고칩니다.

## ts-wiki에서는

ts-wiki 파일 곳곳에 "이런 문제가 생기지 않게" 넣어 둔 장치가 있습니다. 문제가 생기면 이 줄들이 제대로 있는지부터 봅니다.

| 문제 | 막아 주는 ts-wiki 설정 |
|---|---|
| 포트 충돌·혼동 | `package.json`의 `--port 5180`(dev·preview 같은 번호), compose의 `"8090:80"` |
| 다른 PC 접속 불가 | `package.json`의 `--host 0.0.0.0` |
| 새로 고침 404 | `nginx.conf` 9번째 줄 `try_files $uri $uri.html $uri/ =404;` |
| 위키답지 않은 404 화면 | `nginx.conf` 12번째 줄 `error_page 404 /404.html;` |
| CSS 깨짐(base) | `config.mts` 5번째 줄 `process.env.WIKI_BASE ?? '/'` + `deploy.yml`의 `WIKI_BASE` |
| 깨진 링크 공개 | VitePress dead link 검사 + `deploy.yml`의 `needs: build`(빌드 실패 시 배포 안 함) |
| frontmatter 콜론 | `scripts/fix-frontmatter.mjs`(`npm run fix:frontmatter`) |
| 재부팅 후 꺼짐 | `docker-compose.yml`의 `restart: unless-stopped` |
| 마지막 수정 시각 오류 | `deploy.yml`의 `fetch-depth: 0` |
| Docker 빌드의 `spawn git ENOENT` | `Dockerfile` 3~4번째 줄(주석 + `RUN apk add --no-cache git`) |

`spawn git ENOENT`(4-4)를 막는 장치는 처음부터 있던 것이 아니라, 이 가이드를 쓰다가 실제로 빌드가 실패한 뒤 `Dockerfile`에 추가된 것입니다. 문제를 겪으면 고치는 데서 끝내지 말고, 같은 문제가 다시 안 생기게 **설정과 그 이유(주석)를 남기는 것**까지가 문제 해결입니다.

## 자주 하는 실수

**1. 맨 아래 에러 줄만 읽는다**

- 증상: `ERROR: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1`만 보고 "Docker가 고장 났다"고 판단.
- 원인: 맨 아래는 결과 요약입니다. 원인은 위쪽 `build error:` 아래에 있습니다.
- 해결: 위로 올라가며 처음 나온 `error`/`Error`/`emerg` 줄을 찾습니다.

**2. 여러 개를 한꺼번에 고친다**

- 증상: 포트, base, nginx 설정을 동시에 바꿨더니 다른 문제가 생겼는데 무엇 때문인지 모름.
- 원인: 변수가 여러 개.
- 해결: 하나 바꾸고 확인, 다시 하나 바꾸고 확인. 바꾸기 전 파일은 복사해 둡니다.

**3. 브라우저만 보고 판단한다**

- 증상: "고쳤는데 그대로예요."
- 원인: 브라우저 캐시, 다른 탭, 다른 포트.
- 해결: `curl -I`로 서버 응답을 직접 봅니다. 상태 코드와 `Last-Modified` 헤더가 단서입니다.

**4. 실습 흔적을 남긴다**

- 증상: 며칠 뒤 "포트가 사용 중", 디스크 부족.
- 원인: 끄지 않은 개발 서버, 지우지 않은 컨테이너·이미지.
- 해결: 실습 끝에 `netstat`, `docker ps -a`, `docker images`로 남은 것을 확인하고 정리합니다.

## 직접 해 보기

**⭐ 과제 1.** 개발 서버를 같은 포트로 두 번 띄워 2번 증상을 재현하고, PID를 찾아 첫 번째 서버를 끄세요.

::: details 정답 보기
두 번째 서버 출력에 `Port 5190 is in use, trying another one...`이 나옵니다. `Get-NetTCPConnection -LocalPort 5190 -State Listen`으로 PID를 찾아 `Stop-Process -Id <PID>`.
:::

**⭐ 과제 2.** 6-5의 `mini`에서 frontmatter 제목에 콜론을 넣어 4-2 에러를 재현하고, 따옴표로 고치세요.

::: details 정답 보기
`title: 메뉴: 오늘의 커피` → `incomplete explicit mapping pair` 에러. `title: '메뉴: 오늘의 커피'`로 고치면 통과합니다.
:::

**⭐⭐ 과제 3.** `listen 80` 뒤 세미콜론을 뺀 nginx 설정으로 컨테이너를 띄워 8번 증상을 재현하고, `docker logs`에서 원인을 찾은 뒤 정리하세요.

::: details 정답 보기
```nginx
server {
    listen 80
    root /usr/share/nginx/html;
}
```
`docker logs`에 `[emerg] invalid parameter "root" ... :3`. 실제 원인은 2번째 줄의 세미콜론 누락입니다. 끝나면 `docker rm -f <이름>`.
:::

**⭐⭐ 과제 4.** 친구에게 "다른 PC에서 위키가 안 열려"라는 연락을 받았다고 가정하고, 전화로 물어볼 질문 5개를 순서대로 적어 보세요.

::: details 힌트
① 서버 PC에서는 열리나? ② 어떤 주소(IP·포트)로 들어갔나? ③ 서버를 어떤 명령으로 띄웠나(`--host`)? ④ 서버 PC에서 그 IP로 curl하면 되나? ⑤ 두 PC가 같은 와이파이/네트워크인가? — 3번 항목의 확인 순서와 같습니다.
:::

**⭐⭐⭐ 과제 5.** 이 레슨의 증상 표에 없는 문제를 하나 일부러 만들어(예: compose의 포트를 `"80:8191"`로 뒤집기, 대문자 주소 `/Guide/roadmap`) "증상 → 원인 → 확인 명령 → 해결 → 재발 방지" 다섯 칸으로 정리해 보세요.

::: details 힌트
포트를 뒤집으면 `docker compose ps`의 `PORTS`가 `0.0.0.0:80->8191/tcp`처럼 보입니다. 컨테이너 안 8191에는 아무도 없으므로 연결이 끊깁니다. 대문자 주소는 Windows에서 띄운 정적 서버와 Linux(Docker·Pages)에서 결과가 다를 수 있습니다.
:::

## 확인 퀴즈

**1.** 다른 PC에서만 접속이 안 될 때, 서버 PC에서 먼저 해 볼 확인은?

::: details 정답 보기
`netstat`으로 주소 칸이 `0.0.0.0`인지 보고, 서버 PC 자신에서 `curl http://<이 PC의 IP>:포트/`가 되는지 확인합니다. 둘 다 정상이면 방화벽·네트워크 쪽입니다.
:::

**2.** 빌드 에러에 파일 이름이 없고 `Cannot read properties of undefined`만 있습니다. 무엇부터 의심하나요?

::: details 정답 보기
본문(인라인 코드 포함)에 쓴 이중 중괄호를 Vue가 템플릿 문법으로 해석한 경우입니다. 최근 고친 마크다운에서 이중 중괄호를 찾습니다.
:::

**3.** `docker ps`에 내 컨테이너가 안 보입니다. 다음에 칠 명령 두 개는?

::: details 정답 보기
`docker ps -a`(멈춘 컨테이너까지)와 `docker logs <이름>`(꺼진 이유).
:::

**4.** nginx 로그가 "3번째 줄이 잘못"이라고 하는데 3번째 줄은 멀쩡합니다. 어디를 보나요?

::: details 정답 보기
바로 윗줄 끝의 세미콜론 누락. nginx는 세미콜론이 나올 때까지를 한 문장으로 읽습니다.
:::

**5.** 흰 화면에서 개발자 도구 Network 탭에 `/assets/style.xxx.css` 404가 보입니다. 사이트 주소가 `https://<사용자>.github.io/ts-wiki/`라면 원인은?

::: details 정답 보기
`base`를 `/ts-wiki/`로 하지 않고 빌드했습니다. 결과물이 사이트 바깥(`/assets/`)에서 CSS를 찾고 있습니다.
:::

## 정리

- 순서: 에러 메시지(처음 나온 error 줄) → 서버가 떠 있나(`netstat`/`docker ps`) → 내 PC에서 되나(`curl localhost`) → 다른 곳에서만 안 되나 → 최근 바꾼 것.
- 포트 문제는 PID를 찾아 해결하고, 다른 PC 문제는 `--host` → 방화벽 → 네트워크 순으로 나눕니다.
- 빌드 실패는 `build error:` 아래 줄과 `file:` 줄로 유형(dead link, frontmatter 콜론, 이중 중괄호, git 없음)을 가립니다.
- 흰 화면·CSS 깨짐은 base, 새로 고침 404는 `try_files`(cleanUrls), 반영 안 됨은 재빌드·캐시입니다.
- Docker는 `docker version`(데몬), `docker ps -a` + `docker logs`(바로 종료)로 봅니다.
- GitHub 쪽은 `gh run list`/`gh run view`/`gh api .../pages`로 읽기만 해서 상태를 확인합니다.

## 다음 단계

[서버 학습 로드맵](../part7-server-learning/01-roadmap) — 위키를 넘어, 웹 서버를 직접 만들고 운영하는 데 필요한 공부 순서로 넘어갑니다.
