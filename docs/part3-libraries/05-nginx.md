---
title: 'nginx: 정적 파일 웹 서버'
---

# nginx: 정적 파일 웹 서버

<LessonMeta level="초급" :minutes="50" prev="VitePress 로컬 검색(MiniSearch)이 빌드 때 인덱스를 만들고 브라우저에서 동작하는 원리를 봤습니다." />

## 이번에 배울 것

- **웹 서버**와 **리버스 프록시**가 무엇인지 설명할 수 있다.
- nginx 설정의 구조(`server`, `listen`, `root`, `index`, `location`, `try_files`, `error_page`, `expires`, `add_header`)를 읽을 수 있다.
- ts-wiki의 `nginx.conf` 18줄을 한 줄씩 설명할 수 있다.
- Docker로 `nginx:1.27-alpine`을 띄워 빌드 결과물을 서비스하고, `nginx -t`로 설정을 검사할 수 있다.

## 먼저 알아 둘 것

- [웹은 어떻게 동작하나: 브라우저 · 서버 · HTTP](../part1-concepts/01-web-and-server) — 요청, 응답, 상태 코드(200, 404)
- [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host)
- [VitePress: 설정 · 라우팅 · 테마](./01-vitepress) — `cleanUrls`와 `dist` 폴더
- Docker 명령은 이 레슨에서 "따라 치기" 수준으로만 씁니다. 원리는 [3-6 Docker](./06-docker)에서 배웁니다.

## 비유로 이해하기

nginx는 **도서관 안내 데스크**입니다.

- 손님(브라우저)이 "`/guide/recipe` 주세요"라고 말하면, 사서(nginx)는 서고(`root` 폴더)에서 그 책(파일)을 찾아 건넵니다.
- 정확한 제목이 없으면 규칙표(`try_files`)대로 "혹시 `recipe.html`인가요?", "`recipe`라는 서가(폴더)인가요?"를 차례로 확인합니다.
- 끝내 없으면 "그런 책은 없습니다" 안내문(`404.html`)을 건넵니다.
- **리버스 프록시**는 사서가 직접 책을 꺼내 주는 대신, 뒤쪽 전문 부서(다른 서버 프로그램)에 대신 물어보고 그 답을 손님에게 전달하는 경우입니다. 손님은 뒤에 누가 있는지 모릅니다.

## 이게 뭔가

**nginx**(엔진엑스)는 **웹 서버** 프로그램입니다. 웹 서버란 정해진 포트(보통 80번 HTTP, 443번 HTTPS)에서 기다리다가, 브라우저가 보내는 HTTP 요청을 받아 응답(파일이나 다른 서버의 답)을 돌려주는 프로그램입니다. 2004년 공개된 오픈소스이며, 적은 메모리로 동시에 많은 연결을 처리하는 것으로 유명합니다.

nginx가 주로 하는 일은 두 가지입니다.

| 역할 | 뜻 | 쓰는 지시어 |
|---|---|---|
| **정적 파일 서버** | 디스크의 파일(HTML, CSS, JS, 이미지)을 그대로 내려 줌 | `root`, `index`, `try_files` |
| **리버스 프록시** | 받은 요청을 뒤쪽의 다른 서버(Node.js, Java 등)에 넘기고 답을 전달 | `proxy_pass` |

ts-wiki는 빌드하면 HTML 파일만 남으므로(**정적 사이트**) 첫 번째 역할만 씁니다. 리버스 프록시는 [리버스 프록시와 HTTPS 개념](../part7-server-learning/04-reverse-proxy)에서 자세히 다룹니다. 맛보기로 모양만 보면 이렇습니다.

```nginx
# 예시: /api/ 로 오는 요청은 3000번 포트의 Node.js 서버에 넘깁니다.
location /api/ {
    proxy_pass http://127.0.0.1:3000;
}
```

## 왜 필요한가

`vitepress preview`도 `dist`를 서비스할 수 있는데 왜 nginx를 쓸까요?

- `preview`는 **확인용 간이 서버**입니다. 터미널을 닫으면 꺼지고, 캐시·로그·동시 접속 같은 운영 기능을 고려해 만든 것이 아닙니다.
- nginx는 **운영용**입니다. 수많은 사이트가 실제로 쓰며, 캐시 헤더, 압축, 접속 로그, HTTPS, 리버스 프록시를 설정 몇 줄로 켤 수 있습니다.
- `cleanUrls`처럼 "`/guide/recipe` 요청에 `recipe.html`을 주는" 규칙도 nginx에서는 한 줄(`try_files`)입니다.

## 설치

이 가이드는 **Docker 이미지**로 nginx를 씁니다. PC에 nginx를 직접 설치하지 않아도 되고, ts-wiki의 `Dockerfile`도 같은 이미지를 씁니다. Docker Desktop이 켜져 있는지 먼저 확인합니다([준비물 설치](../part0-start/03-setup)).

```bash
docker pull nginx:1.27-alpine
docker run --rm nginx:1.27-alpine nginx -v
```

```text
...
/docker-entrypoint.sh: Configuration complete; ready for start up
nginx version: nginx/1.27.5
```

- `nginx:1.27-alpine`은 "nginx 1.27 계열 + Alpine 리눅스(아주 작은 리눅스 배포판)"라는 뜻의 이미지 이름입니다. 작성 시점(2026-10)에 이 태그로 받은 nginx는 **1.27.5**였습니다.
- `--rm`은 명령이 끝나면 컨테이너를 지우라는 뜻입니다.
- 앞에 찍히는 `/docker-entrypoint.sh: ...` 줄들은 nginx 공식 이미지가 시작할 때 실행하는 준비 스크립트의 출력입니다. 정상입니다.

::: info PC에 직접 설치하는 방법도 있습니다
macOS는 Homebrew(`brew install nginx`), Ubuntu는 `sudo apt install nginx`로 설치할 수 있습니다(공식 문서 기준, 이 레슨에서는 실행하지 않았습니다). 설정 파일 위치가 운영 체제마다 달라 처음에는 Docker 쪽이 헷갈림이 적습니다.
:::

## 핵심 사용법

### 설정 파일의 구조

nginx 설정은 **지시어**(directive, `이름 값;`)와 **블록**(`이름 { ... }`)으로 이루어집니다. 모든 지시어는 **세미콜론(`;`)으로 끝납니다.** 공식 이미지 안의 기본 설정 파일(`/etc/nginx/nginx.conf`)을 꺼내 보면 전체 뼈대가 보입니다.

```bash
docker run --rm nginx:1.27-alpine cat /etc/nginx/nginx.conf
```

```nginx
user  nginx;
worker_processes  auto;
error_log  /var/log/nginx/error.log notice;
pid        /run/nginx.pid;
events {
    worker_connections  1024;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    ...
    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    keepalive_timeout  65;
    #gzip  on;
    include /etc/nginx/conf.d/*.conf;
}
```

```text
nginx.conf (전체 설정)
└─ http { ... }                      ← 웹(HTTP) 관련 설정
   ├─ include mime.types             ← 확장자 → Content-Type 표 (.css → text/css)
   └─ include conf.d/*.conf          ← 여기에 사이트별 server 블록을 넣음
      └─ server { ... }              ← 사이트 하나 (ts-wiki의 nginx.conf)
         ├─ listen, root, index ...
         └─ location /경로 { ... }   ← 주소별 규칙
```

핵심은 마지막 줄 `include /etc/nginx/conf.d/*.conf;`입니다. **우리는 전체 설정을 건드리지 않고, `conf.d/default.conf` 파일 하나만 갈아 끼웁니다.** ts-wiki `Dockerfile`의 `COPY nginx.conf /etc/nginx/conf.d/default.conf`가 바로 그 일입니다. 그래서 ts-wiki의 `nginx.conf`는 `server { ... }` 블록 하나만 들어 있습니다.

`#`으로 시작하는 줄은 주석입니다. 기본 설정에서 `#gzip  on;`이 주석이므로 **압축은 꺼져 있습니다**.

### 지시어 사전

| 지시어 | 뜻 | 예 |
|---|---|---|
| `server { }` | 사이트(가상 호스트) 하나의 설정 묶음 | |
| `listen` | 기다릴 포트 | `listen 80;` |
| `server_name` | 이 블록이 응답할 도메인 이름. `_`는 "아무거나" | `server_name _;` |
| `root` | 파일을 찾을 기준 폴더 | `root /usr/share/nginx/html;` |
| `index` | 주소가 `/`로 끝날 때 보여 줄 파일 | `index index.html;` |
| `location 경로 { }` | 주소가 이 경로로 시작하면 적용할 규칙. 가장 길게 일치하는 것이 이깁니다 | `location /assets/ { }` |
| `try_files` | 차례로 파일을 찾아보고, 처음 있는 것을 줌. 마지막은 대체 동작 | `try_files $uri $uri.html =404;` |
| `error_page` | 오류 코드일 때 보여 줄 페이지 | `error_page 404 /404.html;` |
| `expires` | 브라우저가 캐시해도 되는 기간. `Expires`, `Cache-Control: max-age` 헤더를 붙임 | `expires 30d;` |
| `add_header` | 응답 헤더 추가 | `add_header Cache-Control "public";` |
| `gzip` | 응답 압축 | `gzip on;` |
| `proxy_pass` | 리버스 프록시: 다른 서버로 넘김 | `proxy_pass http://127.0.0.1:3000;` |

`$uri`는 nginx가 채워 주는 **변수**로, 요청 주소의 경로 부분(예: `/guide/recipe`)입니다.

### 따라 하기 1 — 설정 검사 `nginx -t`

nginx를 띄우기 전에 설정 파일에 문법 오류가 없는지 검사하는 명령이 `nginx -t`(test)입니다. ts-wiki의 `nginx.conf`를 연습 폴더(`nginx-lab`)에 `default.conf`로 복사해 검사해 봅니다.

::: code-group

```powershell [Windows (PowerShell)]
mkdir nginx-lab
copy D:\workspace\ts-wiki\nginx.conf nginx-lab\default.conf
docker run --rm -v "${PWD}\nginx-lab\default.conf:/etc/nginx/conf.d/default.conf:ro" nginx:1.27-alpine nginx -t
```

```bash [macOS / Linux]
mkdir nginx-lab
cp ~/workspace/ts-wiki/nginx.conf nginx-lab/default.conf
docker run --rm -v "$(pwd)/nginx-lab/default.conf:/etc/nginx/conf.d/default.conf:ro" nginx:1.27-alpine nginx -t
```

:::

```text
...
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

- `-v 내PC경로:컨테이너경로:ro`는 내 PC의 파일을 컨테이너 안에 **연결**(마운트)합니다. `ro`는 읽기 전용(read-only)입니다.
- **확인 방법**: `syntax is ok`와 `test is successful` 두 줄이 보이면 통과입니다.

일부러 세미콜론 하나를 빼고(`listen 80` 뒤에 `;` 없음) 검사하면 이렇게 나옵니다.

```nginx
server {
    listen 80
    root /usr/share/nginx/html;
}
```

```text
nginx: [emerg] invalid parameter "root" in /etc/nginx/conf.d/default.conf:3
nginx: configuration file /etc/nginx/nginx.conf test failed
```

세미콜론이 없으니 nginx는 다음 줄의 `root`까지 `listen`의 값으로 읽었고, "`listen`에 `root`라는 이상한 값이 있다"고 3번 줄을 가리킵니다. **오류가 가리키는 줄의 바로 앞 줄**에 세미콜론이 빠졌는지 먼저 봅니다. `[emerg]`(emergency)는 nginx가 시작할 수 없는 심각한 오류라는 표시입니다.

### 따라 하기 2 — 빌드 결과를 nginx로 띄우기

[3-1](./01-vitepress)의 연습 프로젝트(`mini`)를 빌드한 `dist` 폴더를 nginx에 연결해 띄웁니다. 포트는 ts-wiki(8090)·이 가이드(8091)와 겹치지 않게 8197을 씁니다.

::: code-group

```powershell [Windows (PowerShell)]
docker run -d --name nginx-lab -p 8197:80 `
  -v "${PWD}\nginx-lab\default.conf:/etc/nginx/conf.d/default.conf:ro" `
  -v "${PWD}\mini\docs\.vitepress\dist:/usr/share/nginx/html:ro" `
  nginx:1.27-alpine
```

```bash [macOS / Linux]
docker run -d --name nginx-lab -p 8197:80 \
  -v "$(pwd)/nginx-lab/default.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$(pwd)/mini/docs/.vitepress/dist:/usr/share/nginx/html:ro" \
  nginx:1.27-alpine
```

:::

- `-d`는 백그라운드로 실행, `--name`은 컨테이너 이름, `-p 8197:80`은 "내 PC의 8197번 포트 → 컨테이너의 80번 포트"입니다.
- PowerShell은 줄 끝 백틱(`` ` ``), bash는 역슬래시(`\`)로 명령을 여러 줄에 나눠 씁니다.

```bash
docker ps --filter name=nginx-lab
```

```text
NAMES       IMAGE               PORTS                  STATUS
nginx-lab   nginx:1.27-alpine   0.0.0.0:8197->80/tcp   Up Less than a second
```

이제 여러 주소로 요청해 상태 코드와 크기를 봅니다. `curl`은 터미널에서 HTTP 요청을 보내는 도구로, Windows 10 이상에는 기본으로 들어 있습니다(PowerShell에서는 `curl.exe`로 부르는 것이 안전합니다).

```bash
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" http://localhost:8197/guide/recipe
```

PowerShell에서는 `/dev/null` 대신 `NUL`을 씁니다.

```powershell
curl.exe -s -o NUL -w "%{http_code} %{size_download}\n" http://localhost:8197/guide/recipe
```

여러 주소로 실행한 결과입니다(빌드 폴더의 실제 파일 크기와 함께).

```text
/                    200  7504   ← index.html
/guide/              200 11417   ← guide/index.html
/guide/recipe        200 10079   ← guide/recipe.html  (try_files의 $uri.html)
/guide/recipe.html   200 10079   ← guide/recipe.html  (try_files의 $uri)
/guide               301   169   ← 폴더라서 /guide/ 로 이동시킴 (try_files의 $uri/)
/nope                404  1877   ← 404.html           (error_page)
/assets/             403   153   ← 폴더 목록 보기는 금지
```

**확인 방법**: 브라우저로 `http://localhost:8197/guide/recipe`를 열어 페이지가 보이고, 사이드바를 눌러 이동이 되면 성공입니다.

캐시 헤더도 확인합니다. `-I`는 본문 없이 헤더만 받는 옵션입니다.

```bash
curl -sI http://localhost:8197/assets/style.DyxI-k7m.css
```

```text
HTTP/1.1 200 OK
Server: nginx/1.27.5
Content-Type: text/css
Content-Length: 112937
...
Expires: Fri, 27 Nov 2026 00:12:13 GMT
Cache-Control: max-age=2592000
Cache-Control: public, immutable
```

`/assets/` 아래 파일에만 `Expires`(30일 뒤 날짜)와 `Cache-Control` 헤더가 붙었습니다. `max-age=2592000`은 30일을 초로 바꾼 값(30 × 24 × 3600)입니다. `/guide/recipe` 같은 HTML 응답에는 이 헤더가 없습니다.

접속 로그도 봅니다.

```bash
docker logs nginx-lab
```

```text
172.17.0.1 - - [28/Oct/2026:00:12:12 +0000] "GET /nope HTTP/1.1" 404 1877 "-" "curl/8.2.1" "-"
172.17.0.1 - - [28/Oct/2026:00:12:13 +0000] "HEAD /guide/recipe HTTP/1.1" 200 0 "-" "curl/8.2.1" "-"
```

한 줄이 요청 하나입니다. 보낸 쪽 IP, 시각(UTC), 요청 줄, 상태 코드, 보낸 바이트 수, 브라우저 종류 순서입니다(기본 설정의 `log_format main`). 실행 중인 컨테이너 안에서 설정을 검사할 수도 있습니다.

```bash
docker exec nginx-lab nginx -t
```

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

실습이 끝나면 **반드시 끄고 지웁니다.**

```bash
docker stop nginx-lab
docker rm nginx-lab
```

::: warning Git Bash에서 docker exec 경로가 이상해질 때
Windows의 Git Bash에서 `docker exec nginx-lab cat /etc/nginx/nginx.conf`를 실행하면 `C:/Program Files/Git/etc/nginx/nginx.conf`를 찾는다는 오류가 날 수 있습니다. Git Bash가 `/`로 시작하는 인자를 Windows 경로로 바꿔 버리기 때문입니다. PowerShell을 쓰거나, Git Bash에서는 명령 앞에 `MSYS_NO_PATHCONV=1`을 붙입니다.
:::

## ts-wiki에서는

`D:\workspace\ts-wiki\nginx.conf` 전체(18줄)입니다.

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

| 줄 | 코드 | 설명 |
|---|---|---|
| 1 | `server {` | 사이트 하나의 설정 시작. 이 파일은 `conf.d/default.conf`로 들어가 `http { }` 안에 포함됩니다 |
| 2 | `listen 80;` | **컨테이너 안의** 80번 포트에서 기다립니다. 바깥 8090번은 `docker-compose.yml`의 `"8090:80"`이 이어 줍니다 |
| 3 | `server_name _;` | 도메인 이름과 상관없이 응답합니다. IP로 접속하든 `localhost`로 접속하든 같습니다 |
| 4 | `root /usr/share/nginx/html;` | 파일을 찾을 폴더. `Dockerfile`이 빌드 결과(`docs/.vitepress/dist`)를 여기에 복사합니다 |
| 5 | `index index.html;` | `/`나 `/part1-basics/`처럼 `/`로 끝나는 주소에는 그 폴더의 `index.html`을 줍니다 |
| 7 | `# cleanUrls: ...` | 주석. 다음 줄이 VitePress `cleanUrls: true`와 짝이라는 설명 |
| 8 | `location / {` | `/`로 시작하는 모든 주소(즉 전부)에 적용. 단, 더 길게 일치하는 `location /assets/`가 있으면 그쪽이 이깁니다 |
| 9 | `try_files $uri $uri.html $uri/ =404;` | ① 주소 그대로의 파일 → ② `.html`을 붙인 파일 → ③ 같은 이름의 폴더 → ④ 모두 없으면 404 |
| 12 | `error_page 404 /404.html;` | 404일 때 VitePress가 만든 `404.html`(사이트 디자인이 적용된 "페이지를 찾을 수 없음")을 보여 줍니다 |
| 14 | `location /assets/ {` | 해시가 붙은 JS·CSS·폰트가 있는 폴더에만 적용 |
| 15 | `expires 30d;` | 브라우저가 30일 동안 다시 묻지 않고 캐시를 쓰게 합니다 |
| 16 | `add_header Cache-Control "public, immutable";` | `public`: 중간 캐시 서버도 저장 가능, `immutable`: 캐시 기간 동안 **절대 바뀌지 않으니** 확인 요청도 보내지 말라 |

`/assets/`에 오래 캐시를 걸어도 안전한 이유는 [3-1](./01-vitepress)에서 본 **파일 이름의 해시** 덕분입니다. 내용이 바뀌면 `style.DyxI-k7m.css`가 다른 이름이 되고, 새 HTML은 새 이름을 가리키므로 브라우저는 새 파일을 받습니다. 반대로 HTML은 이름이 늘 같으므로(`recipe.html`) 캐시 헤더를 붙이지 않았습니다. 붙였다면 글을 고쳐도 사용자는 30일 동안 옛 글을 보게 됩니다.

9번 줄의 순서도 의미가 있습니다. `$uri.html`이 `$uri/`보다 앞에 있으므로, `/guide/roadmap` 요청에 `roadmap.html` 파일과 `roadmap/` 폴더가 둘 다 있다면 파일 쪽이 먼저 선택됩니다.

::: info 실험에서 발견한 것: 끝에 `/`가 없는 폴더 주소
위 실험에서 `/guide`(끝에 `/` 없음)로 요청하면 nginx가 `301`로 `/guide/`로 보내는데, 이때 응답 헤더가 `Location: http://localhost/guide/`였습니다. **포트 번호(8197)가 빠져 있습니다.** nginx는 컨테이너 안에서 자기가 80번 포트에 있다고 알고 있기 때문입니다. 그래서 브라우저로 `http://localhost:8090/part1-basics`(끝 `/` 없이)를 직접 치면 80번 포트로 이동해 접속이 실패할 수 있습니다.

ts-wiki 사이드바의 파트 소개 링크는 `/${part.dir}/`처럼 끝에 `/`가 붙어 있어 평소에는 문제가 되지 않습니다. 주소를 손으로 칠 때만 생깁니다. `server` 블록에 `absolute_redirect off;` 한 줄을 넣고 같은 실험을 하면 `Location: /guide/`(상대 주소)로 바뀌어 포트가 유지되는 것을 확인했습니다. ts-wiki 원본에는 아직 이 줄이 없습니다.
:::

## 자주 하는 실수

**1. `[emerg] invalid parameter` / `unexpected "}"`**

- 증상: `nginx -t`가 `test failed`, 컨테이너가 시작하자마자 꺼짐(`docker ps -a`에서 `Exited (1)`)
- 원인: 세미콜론이나 중괄호가 빠졌습니다.
- 해결: 오류가 가리키는 줄과 **그 앞 줄**을 확인합니다. 고친 뒤 `nginx -t`로 다시 검사합니다.

**2. `/guide/recipe`는 404인데 `/guide/recipe.html`은 열림**

- 증상: 사이드바 링크를 누르면 404, 주소에 `.html`을 붙이면 열림
- 원인: `try_files`에 `$uri.html`이 없습니다. VitePress `cleanUrls: true`로 빌드했는데 서버가 그 규칙을 모릅니다.
- 해결: `try_files $uri $uri.html $uri/ =404;`를 넣습니다.

**3. 글을 고쳐 다시 배포했는데 옛 내용이 보임**

- 증상: 강력 새로 고침(`Ctrl+Shift+R`)을 하면 새 내용이 보임
- 원인: HTML에까지 긴 캐시(`expires`)를 걸었습니다.
- 해결: 긴 캐시는 해시가 붙는 `/assets/`에만 겁니다. ts-wiki 설정이 그렇게 되어 있습니다.

**4. `403 Forbidden`**

- 증상: `/assets/`처럼 폴더 주소에 접속하면 403
- 원인: 그 폴더에 `index.html`이 없고, nginx는 기본적으로 폴더 목록 보기(`autoindex`)를 막아 둡니다. 보안상 올바른 동작입니다.
- 해결: 폴더가 아니라 파일 주소로 접속합니다. 볼륨 연결 경로가 틀려 `root` 폴더가 비어 있을 때도 `/`가 403이 되므로, `docker exec 컨테이너 ls /usr/share/nginx/html`로 파일이 있는지 확인합니다.

**5. 컨테이너는 떠 있는데 브라우저에서 접속이 안 됨**

- 증상: `ERR_CONNECTION_REFUSED`
- 원인: `-p 8197:80`처럼 포트를 연결하지 않았거나, `listen`과 오른쪽 포트(80)가 다릅니다.
- 해결: `docker ps`의 `PORTS` 칸에 `0.0.0.0:8197->80/tcp`가 있는지, `nginx.conf`의 `listen`이 80인지 확인합니다.

## 직접 해 보기

**과제 1 ⭐** 따라 하기 2의 컨테이너를 띄우고 `/guide/recipe`, `/guide`, `/nope`의 상태 코드를 직접 확인해 보세요.

::: details 힌트·정답 보기
`curl -s -o /dev/null -w "%{http_code}\n" 주소`(PowerShell은 `curl.exe`, `-o NUL`)로 확인합니다. 각각 200, 301, 404가 나오면 맞습니다. 끝나면 `docker stop nginx-lab`, `docker rm nginx-lab`.
:::

**과제 2 ⭐** `default.conf`에서 `$uri.html`을 지우고 컨테이너를 다시 띄운 뒤(`docker restart nginx-lab`) `/guide/recipe`가 어떻게 되는지 보세요.

::: details 힌트·정답 보기
`/guide/recipe.html`은 그대로 열리지만 `/guide/recipe`는 404가 됩니다. 실험 후 원래대로 돌려 둡니다.
:::

**과제 3 ⭐⭐** 일부러 `}` 하나를 지우고 `nginx -t`를 실행해 오류 메시지를 읽어 보세요. 그 상태로 `docker run`을 하면 컨테이너가 어떻게 되나요?

::: details 힌트·정답 보기
맨 끝의 `}`를 지웠을 때 실제로 `nginx: [emerg] unexpected end of file, expecting "}" in /etc/nginx/conf.d/default.conf:5`와 `test failed`가 나왔습니다. 파일이 끝날 때까지 닫는 괄호를 기다렸다는 뜻입니다. 그 설정으로 띄우면 nginx가 시작하지 못해 컨테이너가 곧바로 `Exited` 상태가 됩니다. `docker logs 컨테이너`로 같은 오류를 볼 수 있습니다.
:::

**과제 4 ⭐⭐** `server` 블록에 다음 두 줄을 넣고, JS 파일의 전송 크기가 얼마나 줄어드는지 비교해 보세요.

```nginx
gzip on;
gzip_types text/css application/javascript;
```

::: details 힌트·정답 보기
압축된 응답을 받으려면 `curl`에 `-H "Accept-Encoding: gzip"`을 붙입니다. 연습 프로젝트의 `framework.*.js`로 실험했을 때 108,718바이트가 48,082바이트로 줄었고 응답 헤더에 `Content-Encoding: gzip`이 붙었습니다. [3-4](./04-local-search)의 3.2MB 검색 인덱스도 이 방법으로 전송량을 줄일 수 있습니다.
:::

**과제 5 ⭐⭐⭐** `absolute_redirect off;`를 넣기 전과 후에 `curl -sI http://localhost:8197/guide`의 `Location` 헤더를 비교하세요.

::: details 힌트·정답 보기
넣기 전에는 `Location: http://localhost/guide/`(포트 빠짐), 넣은 뒤에는 `Location: /guide/`가 됩니다. 브라우저는 상대 주소를 현재 주소(포트 포함) 기준으로 해석하므로 포트가 유지됩니다.
:::

## 확인 퀴즈

**1.** 정적 파일 서버와 리버스 프록시의 차이는?

::: details 정답 보기
정적 파일 서버는 디스크의 파일을 그대로 내려 주고, 리버스 프록시는 요청을 뒤쪽의 다른 서버에 넘겨 그 답을 전달합니다.
:::

**2.** `try_files $uri $uri.html $uri/ =404;`에서 `/guide/recipe` 요청은 어떤 순서로 처리되나요?

::: details 정답 보기
`/guide/recipe` 파일 → `/guide/recipe.html` 파일 → `/guide/recipe/` 폴더 순서로 찾고, 두 번째에서 찾아 `recipe.html`을 줍니다. 모두 없으면 404입니다.
:::

**3.** ts-wiki가 `/assets/`에만 30일 캐시를 거는 이유는?

::: details 정답 보기
`/assets/` 파일은 이름에 내용 해시가 붙어 내용이 바뀌면 이름도 바뀌므로 오래 캐시해도 안전하지만, HTML은 이름이 그대로라 캐시하면 고친 글이 늦게 반영되기 때문입니다.
:::

**4.** ts-wiki의 `nginx.conf`에 `http { }`나 `events { }`가 없는 이유는?

::: details 정답 보기
이 파일은 공식 이미지의 `/etc/nginx/conf.d/default.conf` 자리에 들어가고, 기본 `nginx.conf`의 `http { }` 안에서 `include`되기 때문입니다. 사이트 설정(`server` 블록)만 있으면 됩니다.
:::

**5.** 설정을 바꾼 뒤 nginx를 다시 띄우기 전에 먼저 할 일은?

::: details 정답 보기
`nginx -t`로 문법을 검사합니다.
:::

## 정리

- nginx는 웹 서버입니다. ts-wiki에서는 빌드된 HTML을 내려 주는 **정적 파일 서버**로만 씁니다.
- 설정은 `지시어 값;`과 `블록 { }`. 공식 이미지에서는 `conf.d/default.conf`의 `server` 블록만 갈아 끼웁니다.
- `try_files $uri $uri.html $uri/ =404;`가 VitePress `cleanUrls`와 짝을 이룹니다.
- `error_page 404 /404.html;`로 VitePress의 404 페이지를 보여 줍니다.
- 해시가 붙는 `/assets/`에만 `expires 30d`와 `Cache-Control "public, immutable"`을 겁니다.
- 바꾼 설정은 `nginx -t`로 검사하고, 실습 컨테이너는 `docker stop`·`docker rm`으로 정리합니다.

## 다음 단계

[3-6. Docker와 Docker Compose](./06-docker)에서 이번에 따라 친 `docker run -p -v`가 무엇인지, 그리고 nginx와 위키 파일을 **하나의 이미지로 묶는** ts-wiki `Dockerfile`을 배웁니다.
