---
title: 'Docker 이미지로 묶기: Dockerfile · nginx.conf'
---

# Docker 이미지로 묶기: Dockerfile · nginx.conf

<LessonMeta level="실전" :minutes="60" prev="dist 폴더를 여러 정적 서버로 띄우고 cleanUrls 404를 고쳤습니다" />

## 이번에 배울 것

- ts-wiki의 `Dockerfile`, `nginx.conf`, `.dockerignore`를 한 줄씩 읽고 각 줄이 왜 있는지 설명할 수 있다.
- `docker build`로 이미지를 만들고 `docker run`으로 컨테이너를 띄운 뒤 `curl`로 확인할 수 있다.
- git 줄이 왜 필요한지 설명하고, 빌드가 실패했을 때 로그에서 원인 줄을 찾을 수 있다(실제 실패 사례 포함).
- 이미지 크기와 레이어 캐시를 직접 확인하고, `package.json`을 먼저 COPY하는 이유를 설명할 수 있다.
- 만든 컨테이너와 이미지를 깨끗하게 정리할 수 있다.

## 먼저 알아 둘 것

- Docker 기본 용어(이미지·컨테이너·레이어): [Docker와 Docker Compose](../part3-libraries/06-docker)
- nginx 설정 문법: [nginx: 정적 파일 웹 서버](../part3-libraries/05-nginx)
- `try_files`가 왜 필요한지: [빌드 결과물을 서버로 서비스하기](./02-static-serve)
- Docker Desktop이 실행 중이어야 합니다. 확인: `docker version`의 `Server:` 부분이 나오면 됩니다.

## 비유로 이해하기

Docker 이미지는 **밀키트 공장의 완제품 상자**입니다.

- **Dockerfile**은 상자를 만드는 작업 지시서입니다. "1번 작업대에서 재료를 손질(빌드)하고, 2번 작업대에서 완성품만 포장(nginx에 담기)하라."
- **멀티 스테이지 빌드**는 작업대를 둘로 나눈 것입니다. 손질 도구(Node.js, `node_modules`)는 1번 작업대에 두고, 상자에는 완성된 음식(`dist`)과 데우는 기계(nginx)만 넣습니다. 그래서 상자가 가볍습니다.
- **레이어 캐시**는 "어제와 똑같은 재료면 어제 손질해 둔 걸 그대로 쓴다"입니다. 재료 목록(`package.json`)이 안 바뀌었으면 장보기(`npm ci`)를 건너뜁니다.
- **.dockerignore**는 "공장에 들고 갈 필요 없는 물건 목록"입니다.
- **컨테이너**는 상자를 열어 실제로 데워서 내놓은 상태입니다. 같은 상자로 몇 개든 열 수 있습니다.

## 따라 하기

### 1단계. Dockerfile 한 줄씩 읽기

ts-wiki의 `Dockerfile` 전체입니다.

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

| 줄 | 내용 | 무엇을, 왜 |
|---|---|---|
| 1 | 주석 | 이 파일의 목적. "사내 서버 상시 운영용"이라고 용도를 밝혀 둡니다. |
| 2 | `FROM node:22-alpine AS build` | 1번 작업대. Node.js 22가 깔린 Alpine Linux(작은 리눅스 배포판)에서 시작하고, 이 단계에 `build`라는 이름을 붙입니다. |
| 3 | 주석 | 바로 아래 줄이 **왜** 있는지 적어 둡니다. 이유가 없으면 나중에 누군가 "필요 없어 보이는 줄"로 지울 수 있습니다. |
| 4 | `RUN apk add --no-cache git` | git을 설치합니다. 이유는 바로 아래 "git 줄이 필요한 이유"에서 봅니다. |
| 5 | `WORKDIR /app` | 이후 명령을 컨테이너 안 `/app` 폴더에서 실행합니다. 없으면 만듭니다. |
| 6 | `COPY package.json package-lock.json ./` | **패키지 목록 두 파일만** 먼저 넣습니다. 이유는 7단계에서 직접 확인합니다. |
| 7 | `RUN npm ci` | lock 파일 그대로 패키지를 설치합니다. 가장 오래 걸리는 단계 중 하나입니다. |
| 8 | `COPY . .` | 나머지 프로젝트 파일 전부(`.dockerignore`에 적힌 것 제외)를 넣습니다. |
| 9 | `RUN npm run build` | `vitepress build docs`로 `dist`를 만듭니다. |
| 11 | `FROM nginx:1.27-alpine` | 2번 작업대. 새 이미지에서 다시 시작합니다. 앞 단계의 Node.js, `node_modules`, git은 여기 **들어오지 않습니다**. |
| 12 | `COPY nginx.conf /etc/nginx/conf.d/default.conf` | nginx 기본 사이트 설정을 ts-wiki 설정으로 바꿔 끼웁니다. |
| 13 | `COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html` | 1번 작업대(`build`)에서 **완성품 `dist`만** 꺼내 nginx가 서비스하는 폴더에 넣습니다. |
| 14 | `EXPOSE 80` | "이 컨테이너는 80번 포트를 쓴다"는 안내입니다. 실제로 포트를 여는 것은 `docker run -p`입니다. |

**git 줄(3~4번째 줄)이 필요한 이유**

ts-wiki의 `config.mts`에는 `lastUpdated: true`(페이지마다 "마지막 수정" 시각 표시)가 있습니다. VitePress는 빌드할 때 페이지마다 `git log` 명령을 실행해 이 시각을 알아냅니다. 그런데 `node:22-alpine`은 크기를 줄이려고 꼭 필요한 것만 넣은 이미지라 git이 없습니다. git이 없으면 빌드가 `spawn git ENOENT`로 실패합니다(5단계에서 직접 재현합니다).

- `apk`는 Alpine Linux의 패키지 관리자입니다(Ubuntu의 `apt`에 해당).
- `--no-cache`는 내려받은 패키지 목록을 이미지에 남기지 않아 크기를 줄입니다.
- 이 줄은 1번 작업대에만 있으므로 **최종 이미지에는 git이 들어가지 않고 크기에도 영향이 없습니다.**

::: info 내 PC와 GitHub Actions에서는 왜 이 줄이 없어도 될까?
내 PC(Windows)에는 Git이 설치되어 있고, GitHub Actions의 `ubuntu-latest` 실행기에도 git이 들어 있습니다. Alpine 이미지에만 없습니다. "내 PC에서는 되는데 Docker에서는 안 된다"의 전형적인 원인이 이런 **환경 차이**입니다.
:::

::: info EXPOSE는 문서일 뿐입니다
`EXPOSE 80`만으로는 내 PC에서 접속할 수 없습니다. `docker run -p 8190:80`처럼 **내 PC의 포트:컨테이너의 포트**를 연결해야 합니다. EXPOSE는 "이 이미지를 쓰는 사람에게 80을 연결하라고 알려 주는 표지판"입니다.
:::

### 2단계. nginx.conf 한 줄씩 읽기

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # cleanUrls: /guide/roadmap → /guide/roadmap.html
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    error_page 404 /404.html;

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

| 줄 | 내용 | 무엇을, 왜 |
|---|---|---|
| 1 | `server {` | 사이트 하나의 설정 묶음 시작 |
| 2 | `listen 80;` | 컨테이너 안에서 80번 포트로 기다립니다. Dockerfile의 `EXPOSE 80`과 짝입니다. |
| 3 | `server_name _;` | 어떤 도메인 이름으로 들어와도 이 설정으로 받습니다. `_`는 "아무거나"의 관례 표기입니다. |
| 4 | `root /usr/share/nginx/html;` | 파일을 찾을 기준 폴더. Dockerfile 13번째 줄이 `dist`를 넣은 곳입니다. |
| 5 | `index index.html;` | `/`처럼 폴더를 요청하면 그 안의 `index.html`을 줍니다. |
| 7 | 주석 | 아래 줄이 VitePress의 cleanUrls 때문에 있다는 이유. |
| 8~10 | `location / { try_files ... }` | 요청 주소 `$uri`를 순서대로 찾아봅니다: ① 그 이름의 파일 → ② 뒤에 `.html`을 붙인 파일 → ③ 그 이름의 폴더 → ④ 다 없으면 404. 6-2의 cleanUrls 404를 막는 줄입니다. |
| 12 | `error_page 404 /404.html;` | 404일 때 nginx 기본 화면 대신 위키의 `404.html`을 보여 줍니다. |
| 14~17 | `location /assets/ { ... }` | `/assets/` 아래 파일(CSS·JS)은 30일 동안 브라우저가 저장해 두고(`expires 30d`), 바뀌지 않는 파일(`immutable`)로 취급하게 합니다. |

`/assets/`를 오래 캐시해도 되는 이유는 파일 이름에 있습니다. 빌드 결과물의 CSS 이름은 `style.BZYBsFKE.css`처럼 내용에 따라 달라지는 해시(hash, 내용으로 만든 짧은 지문)가 붙습니다. 내용이 바뀌면 이름도 바뀌므로, 옛 이름의 파일은 영원히 같은 내용이라 안심하고 오래 저장해도 됩니다. 반대로 HTML은 이름이 고정이라 캐시 설정을 주지 않았습니다.

### 3단계. .dockerignore 읽기

```text
node_modules
docs/.vitepress/dist
docs/.vitepress/cache
examples
.git
```

`docker build`를 하면 먼저 프로젝트 폴더 내용(빌드 컨텍스트, build context)을 Docker에 통째로 보냅니다. 여기 적힌 것은 보내지 않습니다.

| 항목 | 빼는 이유 |
|---|---|
| `node_modules` | 컨테이너 안에서 `npm ci`로 새로 설치합니다. Windows용으로 설치된 것을 리눅스 컨테이너에 넣으면 오히려 문제가 생깁니다. 크기도 큽니다. |
| `docs/.vitepress/dist`, `cache` | 컨테이너 안에서 새로 빌드합니다. 내 PC의 옛 결과물이 섞이면 안 됩니다. |
| `examples` | 위키 빌드에 필요 없는 실습 코드입니다. |
| `.git` | 저장소 이력. 크고, 위키 결과물에 필요 없습니다. |

실제 빌드 로그에서 보낸 크기를 확인할 수 있습니다.

```text
#7 [internal] load build context
#7 transferring context: 2.72MB 0.2s done
```

작성 PC의 복사본에는 `node_modules`와 39MB짜리 `dist`가 있었지만 2.72MB만 보냈습니다.

### 4단계. 이미지 빌드하기

6-1의 복사본 폴더에서 실행합니다. `-t`는 이미지에 붙일 이름(tag)이고, 마지막 `.`은 "현재 폴더를 빌드 컨텍스트로"라는 뜻입니다. `--progress=plain`을 붙이면 단계별 로그가 전부 보입니다.

```bash
docker build -t wsg-test .
```

실제 출력(주요 줄):

```text
#8 [build 2/7] RUN apk add --no-cache git
#8 DONE 3.4s
#10 [build 4/7] COPY package.json package-lock.json ./
#11 [build 5/7] RUN npm ci
#11 DONE 16.7s
#12 [build 6/7] COPY . .
#13 [build 7/7] RUN npm run build
#13 71.75 build complete in 68.30s.
#13 DONE 72.0s
#15 [stage-1 3/3] COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html
#16 naming to docker.io/library/wsg-test 0.0s done
```

- `[build 2/7]`처럼 단계 이름과 번호가 붙습니다. `build` 단계에는 명령이 7개(FROM 포함) 있습니다. 주석 줄은 단계가 아닙니다.
- 전체 약 1분 40초가 걸렸습니다. 대부분은 `npm ci`와 `npm run build`입니다.

::: tip 컨테이너 안에는 .git이 없는데 괜찮을까?
`.dockerignore`가 `.git`을 빼므로 컨테이너 안에서 `git log`는 "저장소가 아님"으로 실패합니다. 하지만 VitePress는 git이 **실행만 되면** 빈 결과로 받아들이고 빌드를 계속합니다. 그 결과 Docker로 띄운 위키에는 "마지막 수정" 시각이 제대로 나오지 않을 수 있습니다. 시각까지 필요하면 `.dockerignore`에서 `.git`을 빼는 방법이 있지만, 이미지 빌드가 느려지고 저장소 이력이 빌드 컨텍스트에 들어가는 대가가 있습니다.
:::

**확인 방법**: `docker images wsg-test`에 이미지가 한 줄 나오면 성공입니다.

### 5단계. git 줄을 빼면? 실패 로그 읽기 연습

git 줄이 정말 필요한지, 빼고 빌드해 봅니다. 원본 대신 복사본에서 3~4번째 줄을 지운 `Dockerfile.nogit`을 만듭니다.

Windows(PowerShell):

```powershell
$l = Get-Content Dockerfile -Encoding UTF8
[IO.File]::WriteAllLines("$PWD\Dockerfile.nogit", $l[0..1] + $l[4..($l.Count-1)])
docker build --progress=plain -f Dockerfile.nogit -t wsg-nogit .
```

macOS/Linux(bash):

```bash
sed '3,4d' Dockerfile > Dockerfile.nogit
docker build --progress=plain -f Dockerfile.nogit -t wsg-nogit .
```

`-f`는 사용할 Dockerfile을 지정합니다. git 줄이 없는 Dockerfile로 빌드했을 때의 실제 출력입니다(작성 중, 원본에 git 줄이 들어가기 전에 겪은 실패).

```text
#13 [build 6/6] RUN npm run build
#13 2.557   vitepress v1.6.3
#13 2.576 - building client + server bundles...
#13 5.712 x Build failed in 2.36s
#13 34.79 build error:
#13 34.79 [vitepress] spawn git ENOENT
#13 34.79 file: /app/docs/appendix/02-cheatsheet.md
#13 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
ERROR: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
```

에러를 읽는 순서:

1. 맨 아래 `ERROR: failed to solve` — "빌드가 실패했다"는 결과일 뿐, 원인이 아닙니다.
2. 위로 올라가 `#13` 단계, 즉 `RUN npm run build`에서 실패했습니다. git 줄이 없으니 단계 수도 `6/6`입니다.
3. 그 단계 로그의 `build error:` 바로 아래 `[vitepress] spawn git ENOENT`가 진짜 원인입니다.

`spawn git ENOENT`는 "`git`이라는 프로그램을 실행(spawn)하려 했는데 그런 파일이 없다(ENOENT, Error NO ENTry)"는 뜻입니다. 1단계에서 본 git 줄의 이유가 바로 이것입니다. 실패한 빌드는 이미지를 만들지 않으므로 지울 것은 없습니다. `Dockerfile.nogit`만 지웁니다.



### 6단계. 이미지 크기와 레이어 보기

```bash
docker images wsg-test
docker history wsg-test
```

실제 출력(history는 위쪽 일부):

```text
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
wsg-test     latest    d3bac9ad5490   2 hours ago   87.3MB

0B	EXPOSE map[80/tcp:{}]
39.1MB	COPY /app/docs/.vitepress/dist /usr/share/ng…
361B	COPY nginx.conf /etc/nginx/conf.d/default.co…
36.3MB	RUN /bin/sh -c set -x     && apkArch="$(cat …
...
```

- 최종 이미지는 **87.3MB**입니다. 바탕인 `nginx:1.27-alpine`이 48.2MB, 그 위에 `dist` 39.1MB, `nginx.conf` 361바이트가 얹혔습니다.
- Node.js, `node_modules`, git은 하나도 들어 있지 않습니다. 멀티 스테이지 빌드 덕분입니다.
- 레이어(layer, 이미지를 이루는 층)는 Dockerfile의 명령 하나가 하나씩 만듭니다. 위 목록이 그 층들입니다.

### 7단계. 레이어 캐시와 "package.json 먼저 COPY"의 이유

Docker는 각 단계의 **입력이 지난번과 같으면** 그 단계를 다시 실행하지 않고 저장해 둔 층을 씁니다. 이것을 레이어 캐시라고 합니다. 입력이 바뀐 단계부터 **그 아래 모든 단계**는 다시 실행합니다.

**실험 A. 아무것도 안 바꾸고 다시 빌드**

```bash
docker build -t wsg-test .
```

실제 결과: 모든 단계가 `CACHED`, 전체 **약 10초**.

**실험 B. 마크다운 한 파일만 고치고 다시 빌드**

`docs/guide/roadmap.md` 끝에 빈 줄 하나를 추가한 뒤 같은 명령을 실행했습니다. 실제 출력:

```text
#8 [build 2/7] RUN apk add --no-cache git
#8 CACHED
#10 [build 4/7] COPY package.json package-lock.json ./
#10 CACHED
#11 [build 5/7] RUN npm ci
#11 CACHED
#12 [build 6/7] COPY . .
#12 DONE 0.2s
#13 [build 7/7] RUN npm run build
#13 DONE 110.6s
```

- `package.json`·`package-lock.json`은 그대로이므로 4단계 COPY와 `npm ci`는 **CACHED**입니다.
- 마크다운이 바뀌어서 `COPY . .`부터 다시 실행했고, 위키 빌드를 새로 했습니다.

만약 Dockerfile이 `COPY . .` 한 번으로 모든 파일을 넣고 그다음 `npm ci`를 했다면? 마크다운 한 글자만 바꿔도 `COPY . .`의 입력이 바뀌므로 그 아래 `npm ci`까지 매번 다시 실행합니다. **자주 바뀌는 것(문서)은 아래에, 드물게 바뀌는 것(패키지 목록)은 위에** 두는 것이 4번째 줄의 이유입니다. 작성 PC 기준으로 `npm ci` 한 번이 17~21초였으니, 문서를 고칠 때마다 그만큼 아끼는 셈입니다.

실험이 끝나면 고친 파일을 원래대로 되돌립니다(원본에서 다시 복사하면 됩니다).

### 8단계. 컨테이너로 띄우고 확인하기

```bash
docker run -d --name wsg-test -p 8190:80 wsg-test
```

| 옵션 | 뜻 |
|---|---|
| `-d` | detached. 백그라운드로 실행하고 터미널을 돌려줍니다. |
| `--name wsg-test` | 컨테이너 이름. 나중에 끌 때 이 이름을 씁니다. |
| `-p 8190:80` | 내 PC의 8190번 → 컨테이너의 80번. 앞이 바깥, 뒤가 안쪽입니다. |
| 마지막 `wsg-test` | 사용할 이미지 이름 |

실제 출력은 컨테이너 ID 한 줄입니다.

```text
59bdc5d348a2248866d6dafa1426b967e60f3237198ce77150ca7adefc35c649
```

상태를 봅니다.

```bash
docker ps --filter name=wsg-test --format "{{.Names}} {{.Status}} {{.Ports}}"
```

```text
wsg-test Up 4 seconds 0.0.0.0:8190->80/tcp
```

`curl`로 6-2와 같은 주소를 요청합니다.

```bash
for u in / /guide/roadmap /guide/roadmap.html /nope; do
  curl -s -o /dev/null -w "$u %{http_code} %{size_download}\n" "http://localhost:8190$u"
done
```

실제 결과:

```text
/ 200 27552
/guide/roadmap 200 74249
/guide/roadmap.html 200 74249
/nope 404 18055
```

- `/guide/roadmap`이 200 — `try_files`의 `$uri.html`이 동작했습니다.
- `/nope`이 404 + 18055바이트 — `error_page 404 /404.html`로 위키의 404 화면을 줬습니다.

응답 헤더(header, 본문 앞에 붙는 부가 정보)도 확인합니다.

```bash
curl -sI http://localhost:8190/guide/roadmap
curl -sI http://localhost:8190/assets/style.BZYBsFKE.css
```

실제 출력(일부):

```text
HTTP/1.1 200 OK
Server: nginx/1.27.5
Content-Type: text/html
Content-Length: 74249

HTTP/1.1 200 OK
Expires: Fri, 27 Nov 2026 02:02:31 GMT
Cache-Control: max-age=2592000
Cache-Control: public, immutable
```

- `Server: nginx/1.27.5` — `nginx:1.27-alpine` 태그가 작성 시점에 가리킨 실제 버전입니다.
- CSS 파일에는 30일 뒤 만료(`Expires`, `max-age=2592000`초 = 30일)와 `immutable`이 붙었습니다. HTML에는 없습니다. nginx.conf 14~17번째 줄대로입니다.
- CSS 파일 이름의 해시는 빌드마다 다를 수 있습니다. `curl -s http://localhost:8190/ | grep -o '/assets/style[^"]*'`로 실제 이름을 찾아 넣습니다.

컨테이너 안 nginx의 접속 기록은 `docker logs`로 봅니다.

```bash
docker logs wsg-test
```

```text
<접속한 IP> - - [28/Oct/2026:02:02:31 +0000] "GET / HTTP/1.1" 200 27552 "-" "curl/8.2.1" "-"
```

**확인 방법**: 브라우저에서 `http://localhost:8190/guide/roadmap`을 열고 새로 고침해도 404가 나지 않으면 성공입니다.

### 9단계. 정리하기

실습이 끝나면 컨테이너와 이미지를 지웁니다. 컨테이너가 이미지를 쓰고 있으면 이미지를 지울 수 없으므로 순서가 중요합니다.

```bash
docker rm -f wsg-test
docker rmi wsg-test
```

- `docker rm -f`: 실행 중인 컨테이너를 강제로 멈추고 삭제합니다.
- `docker rmi`: 이미지를 삭제합니다.

```text
wsg-test
Untagged: wsg-test:latest
```

**확인 방법**: `docker ps -a --filter name=wsg-test`와 `docker images wsg-test`에 아무것도 나오지 않으면 정리된 것입니다.

::: tip 빌드에 쓴 node:22-alpine 이미지
1번 작업대에서 받은 `node:22-alpine`과 중간 단계들은 빌드 캐시로 남습니다. 작성 환경(BuildKit 사용)에서는 `docker images` 목록에 `node:22-alpine`이 따로 보이지 않았습니다. 다음 빌드를 빠르게 해 주므로 보통 그냥 둡니다. 디스크가 부족하면 `docker image prune`(이름 없는 이미지 삭제), `docker builder prune`(빌드 캐시 삭제)을 씁니다. 다른 프로젝트가 쓰는 이미지까지 지울 수 있으니 출력 목록을 읽고 실행합니다.
:::

## ts-wiki에서는

- `Dockerfile` 2·11번째 줄 — `node:22-alpine`(빌드)과 `nginx:1.27-alpine`(서비스)의 두 단계. 서비스 이미지에 Node.js가 없어서 87.3MB로 가볍고, 공격받을 수 있는 프로그램도 적습니다.
- `Dockerfile` 3~4번째 줄 — 주석으로 이유를 밝힌 뒤 git을 설치합니다. `config.mts` 26번째 줄 `lastUpdated: true`와 짝을 이루는 줄입니다. 설정 파일(`config.mts`)의 한 줄이 전혀 다른 파일(`Dockerfile`)의 준비물을 바꾼다는 점을 기억해 둡니다.
- `Dockerfile` 6~8번째 줄 — `package.json`·`package-lock.json`을 먼저 COPY하고 `npm ci`한 뒤 나머지를 COPY. 문서만 고쳤을 때 `npm ci`를 캐시로 건너뜁니다(실험 B).
- `nginx.conf` 9번째 줄 — `config.mts`의 `cleanUrls: true`와 짝을 이루는 `try_files`. 두 파일은 떨어져 있지만 한쪽을 바꾸면 다른 쪽도 확인해야 하는 관계라서 주석으로 연결해 두었습니다.
- `.dockerignore` — `.gitignore`와 거의 같은 목록이지만 `.git`과 `examples`가 추가되어 있습니다. 저장소에는 넣지만 이미지에는 필요 없는 것들입니다.
- 3번째 줄 주석은 실제로 이 가이드를 쓰는 중에 git 줄 없이 빌드가 실패한 뒤 추가된 것입니다. 5단계의 실패가 그 기록입니다.

## 자주 하는 실수

**1. `spawn git ENOENT`로 빌드 실패**

- 증상: `[vitepress] spawn git ENOENT` 후 `exit code: 1`
- 원인: `lastUpdated: true`는 git을 실행하는데 Alpine 이미지에 git이 없음. 다른 프로젝트의 Dockerfile을 복사해 오거나, "필요 없어 보여서" git 줄을 지웠을 때 생깁니다.
- 해결: 빌드 단계에 `RUN apk add --no-cache git`(ts-wiki Dockerfile 4번째 줄). 또는 Docker용 빌드에서만 lastUpdated를 끔.

**2. `-p` 순서를 반대로 씀**

- 증상: `docker run -p 80:8190 ...` 후 `localhost:8190` 접속 실패.
- 원인: `-p`는 `내 PC 포트:컨테이너 포트` 순서입니다. 위 명령은 내 PC의 80을 컨테이너의 8190(아무도 안 기다림)에 연결했습니다.
- 해결: `-p 8190:80`. 컨테이너 쪽은 nginx.conf의 `listen 80`과 같아야 합니다.

**3. 같은 이름의 컨테이너가 이미 있음**

- 증상: 작성 중 실제 메시지는 `docker: Error response from daemon: Conflict. The container name "/wsg-dup" is already in use by container "3ecf05d2..."`였습니다(`wsg-dup`은 실험용 이름).
- 원인: 지난번 컨테이너를 지우지 않았습니다(멈춘 컨테이너도 이름을 차지합니다).
- 해결: `docker rm -f wsg-test` 후 다시 실행. `docker ps -a`로 멈춘 것까지 봅니다.

**4. 문서를 고쳤는데 컨테이너에 반영되지 않음**

- 증상: 브라우저에 예전 내용.
- 원인: 이미지는 빌드한 순간의 `dist`를 담은 사진입니다. 컨테이너를 다시 시작해도 내용은 그대로입니다.
- 해결: `docker build`로 이미지를 다시 만들고, 기존 컨테이너를 지운 뒤 새로 `docker run`. 이 번거로움을 줄이는 것이 6-4의 Compose입니다.

## 직접 해 보기

**⭐ 과제 1.** ts-wiki Dockerfile로 이미지를 빌드하고 8192번 포트로 띄운 뒤 `/guide/roadmap`이 200인지 확인하고 정리하세요.

::: details 정답 보기
```bash
docker build -t wsg-test .
docker run -d --name wsg-test -p 8192:80 wsg-test
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8192/guide/roadmap
docker rm -f wsg-test
docker rmi wsg-test
```
:::

**⭐⭐ 과제 2.** `try_files` 줄이 없는 nginx 설정으로 띄우면 어떻게 되는지 재현하세요. (힌트: 이미지를 새로 만들지 않고 `-v`로 설정 파일과 `dist`를 컨테이너에 연결할 수 있습니다.)

::: details 정답 보기
`nginx-notry.conf`를 아래처럼 만들고:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
}
```

Windows(PowerShell, 복사본 폴더에서):

```powershell
docker run -d --name wsg-notry -p 8192:80 -v "${PWD}\nginx-notry.conf:/etc/nginx/conf.d/default.conf:ro" -v "${PWD}\docs\.vitepress\dist:/usr/share/nginx/html:ro" nginx:1.27-alpine
```

작성 중 실제 결과: `/guide/roadmap` 404, `/guide/roadmap.html` 200. `docker logs wsg-notry`에는 이런 줄이 남습니다.

```text
[error] 21#21: *1 open() "/usr/share/nginx/html/guide/roadmap" failed (2: No such file or directory)
```

끝나면 `docker rm -f wsg-notry`.
:::

**⭐⭐ 과제 3.** Dockerfile을 "`COPY . .` 한 번 → `RUN npm ci` → `RUN npm run build`" 순서로 바꾼 파일을 만들고, 마크다운만 고쳤을 때 `npm ci`가 CACHED인지 확인하세요.

::: details 정답 보기
CACHED가 아니라 매번 다시 실행됩니다. `COPY . .`의 입력(전체 파일)이 바뀌었으므로 그 아래 단계가 모두 무효가 됩니다.
:::

**⭐⭐⭐ 과제 4.** `docker history`로 최종 이미지에 Node.js 관련 층이 하나도 없는 것을 확인하고, 멀티 스테이지를 쓰지 않고 `node:22-alpine` 하나로 빌드·서비스까지 했다면 크기가 대략 어떻게 될지 추정해 보세요.

::: details 힌트
`docker pull node:22-alpine` 후 `docker images node:22-alpine`으로 바탕 크기를 보고, `node_modules` 크기(`du -sh node_modules`)와 `dist` 크기를 더해 봅니다. nginx 대신 Node.js 정적 서버를 써야 한다는 점도 함께 생각합니다.
:::

## 확인 퀴즈

**1.** `EXPOSE 80`만 있고 `docker run`에 `-p`를 주지 않으면 내 PC 브라우저에서 접속할 수 있나요?

::: details 정답 보기
없습니다. EXPOSE는 안내용 표시이고, 실제 연결은 `-p 내PC포트:80`이 합니다.
:::

**2.** Dockerfile에서 `package.json`을 먼저 COPY하는 이유는?

::: details 정답 보기
패키지 목록이 바뀌지 않았으면 `npm ci` 단계를 레이어 캐시로 건너뛰기 위해서입니다. 자주 바뀌는 문서를 나중에 COPY해야 앞 단계 캐시가 살아남습니다.
:::

**3.** `try_files $uri $uri.html $uri/ =404;`에서 `/guide/roadmap` 요청은 몇 번째 후보에서 찾아지나요?

::: details 정답 보기
두 번째 `$uri.html`, 즉 `/guide/roadmap.html`입니다.
:::

**4.** 최종 이미지에 `node_modules`가 들어 있지 않은 이유는?

::: details 정답 보기
멀티 스테이지 빌드에서 두 번째 단계(`FROM nginx:1.27-alpine`)는 새로 시작하고, `COPY --from=build`로 `dist`만 가져오기 때문입니다.
:::

**5.** `[vitepress] spawn git ENOENT`의 뜻과 해결책은?

::: details 정답 보기
git 프로그램을 실행하려 했지만 없다는 뜻입니다. `lastUpdated: true`가 git을 쓰는데 Alpine 이미지에 git이 없어서 생깁니다. 빌드 단계에 `RUN apk add --no-cache git`을 넣습니다.
:::

## 정리

- ts-wiki 이미지는 **빌드(node:22-alpine) → 서비스(nginx:1.27-alpine)** 두 단계이며, 최종 이미지에는 `dist`와 nginx만 들어갑니다(작성 시점 87.3MB).
- `nginx.conf`의 핵심은 `try_files $uri $uri.html $uri/ =404;`(cleanUrls 지원)와 `error_page 404 /404.html;`, 그리고 `/assets/` 장기 캐시입니다.
- `.dockerignore`는 빌드 컨텍스트에서 `node_modules`·`dist`·`.git` 등을 빼서 빠르고 깨끗한 빌드를 만듭니다.
- `package.json`을 먼저 COPY하면 문서만 고쳤을 때 `npm ci`가 캐시됩니다.
- 빌드 실패는 맨 아래 `failed to solve`가 아니라 **실패한 단계 안의 첫 에러 줄**에서 원인을 찾습니다. git 줄을 빼면 `spawn git ENOENT`로 실패합니다. ts-wiki Dockerfile 3~4번째 줄이 그것을 막습니다.
- 실습 뒤에는 `docker rm -f` → `docker rmi` 순서로 정리합니다.

## 다음 단계

[서버에 상시 띄우기: Docker Compose](./04-compose) — `build`, `run`, 포트, 재시작 정책을 파일 하나에 적어 두고 `docker compose up -d --build` 한 줄로 띄웁니다.
