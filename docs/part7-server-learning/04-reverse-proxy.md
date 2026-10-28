---
title: 리버스 프록시와 HTTPS 개념
---

# 리버스 프록시와 HTTPS 개념

<LessonMeta level="실전" :minutes="45" prev="Express 5로 정적 파일·헬스 체크·로그·에러 처리를 갖춘 서버를 만들었습니다." />

## 이번에 배울 것

- 리버스 프록시가 무엇이고, 왜 Node 서버 앞에 nginx를 두는지 설명할 수 있다.
- Docker nginx를 앞에 세우고 PC에서 도는 Node 서버로 `proxy_pass`를 구성할 수 있다.
- `server_name`으로 한 포트에서 이름별로 다른 사이트를 응답하는 가상 호스트를 만들 수 있다.
- `502 Bad Gateway`가 언제 나는지 재현하고 원인을 찾을 수 있다.
- HTTPS·TLS·인증서·Let's Encrypt의 개념과 발급 절차를 설명할 수 있다.

## 먼저 알아 둘 것

- [nginx: 정적 파일 웹 서버](../part3-libraries/05-nginx) — `server`, `location`, `listen` 블록
- [Docker와 Docker Compose](../part3-libraries/06-docker) — `docker run -p`, `-v`
- [Express로 웹 서버 만들기](./03-express) — 이번 레슨에서 뒤에 둘 서버
- [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host)

## 비유로 이해하기

큰 회사 건물의 **1층 안내 데스크**를 떠올려 봅니다.

- 방문객(브라우저)은 각 부서 사무실(Node 서버)로 바로 올라가지 않습니다. 모두 1층 안내 데스크(nginx)에 먼저 옵니다.
- 안내 데스크는 "어느 회사를 찾아오셨나요?"(요청의 `Host` 헤더)를 묻고, 3층 "한빛 카페 본사"로 연락해 용건을 전달합니다(`proxy_pass`). 답이 오면 방문객에게 건넵니다.
- 같은 건물(같은 IP·같은 포트)에 회사가 여러 개 있어도, 찾는 이름만 다르면 안내 데스크가 알아서 나눠 줍니다(가상 호스트).
- 3층 사무실이 문을 닫았으면 안내 데스크는 "지금 연결이 안 됩니다"라고 말합니다(`502 Bad Gateway`).
- 출입증 검사·금속 탐지기(HTTPS 처리, 접근 제한)도 안내 데스크에서 한 번에 합니다. 각 사무실이 따로 보안 장비를 둘 필요가 없습니다.

"프록시(proxy)"는 대리인이라는 뜻입니다. **손님 쪽**을 대신하는 것을 포워드 프록시(회사 PC의 인터넷 차단용 프록시 같은 것), **서버 쪽**을 대신해 손님을 맞는 것을 **리버스 프록시**라고 부릅니다.

## 개념 설명

### 왜 Node 서버를 바로 열지 않나

7-3의 Express 서버도 혼자서 인터넷에 열 수는 있습니다. 그래도 실무에서는 거의 항상 앞에 nginx 같은 리버스 프록시를 둡니다.

| 앞에 nginx를 두면 | 이유 |
|---|---|
| HTTPS를 한곳에서 처리 | 인증서 설정·갱신을 nginx 한 곳에서만 하면 됩니다. 뒤의 서버는 평범한 HTTP로 둡니다. |
| 정적 파일을 빠르게 | nginx는 파일 서비스에 특화되어 있어 Node보다 가볍고 빠릅니다. Node는 API만 맡깁니다. |
| 여러 서비스를 한 주소로 | `/`는 위키, `/api/`는 Node처럼 경로·이름별로 나눌 수 있습니다. 바깥에는 80·443 두 포트만 엽니다. |
| 뒤 서버를 숨김 | Node 서버의 포트를 바깥에 열지 않아도 됩니다. 공격받을 문이 줄어듭니다. |
| 무중단 교체 | 뒤 서버를 바꿔 끼우는 동안 nginx가 요청을 받아 둘 수 있습니다(설정에 따라). |

### 요청이 지나가는 길

```text
브라우저 ──HTTP──▶ nginx (컨테이너, 바깥 포트 8195 → 안 80)
  Host: wiki.localhost         │ server_name wiki.localhost 블록 선택
                               │ proxy_pass http://host.docker.internal:8194
                               ▼
                       Node(Express) 서버 (PC에서 직접 실행, 8194)
                               │ 응답
브라우저 ◀────────────── nginx ◀┘
```

`host.docker.internal`은 Docker Desktop(Windows·macOS)이 컨테이너 안에 만들어 주는 이름으로, **컨테이너를 띄운 PC 자신**을 가리킵니다. 컨테이너 안에서 `localhost`라고 쓰면 PC가 아니라 **컨테이너 자기 자신**이 되므로, PC에서 도는 Node 서버에 닿지 않습니다. 이 차이가 이번 실습의 핵심 함정입니다.

::: info Linux에서 Docker Engine을 쓰는 경우
Docker Desktop이 아닌 Linux의 Docker Engine에서는 `host.docker.internal`이 기본으로 없을 수 있습니다. 공식 문서 기준으로 `docker run`에 `--add-host=host.docker.internal:host-gateway`를 붙이면 같은 이름을 쓸 수 있습니다. 이 가이드는 Windows의 Docker Desktop(Docker 25.0.3)에서만 확인했습니다.
:::

## 따라 하기

### 1단계. 뒤에 둘 Node 서버 띄우기

7-3의 Express 서버를 8194번 포트로 띄워 둡니다. 이 터미널은 그대로 둡니다.

```powershell
cd D:\lab\express-server
node app.ts dist
```

```text
http://localhost:8194 에서 기다리는 중 (끄려면 Ctrl+C)
```

### 2단계. 프록시 설정 파일 작성

`D:\lab\proxy\proxy.conf`를 만듭니다.

```nginx
# 앞단 nginx: 8195로 받은 요청을 PC에서 돌고 있는 Node 서버(8194)로 넘깁니다.
server {
    listen 80;
    server_name wiki.localhost;

    location / {
        proxy_pass http://host.docker.internal:8194;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 같은 포트에서 이름(Host)이 다르면 다른 사이트로 응답합니다(가상 호스트).
server {
    listen 80;
    server_name status.localhost;

    location / {
        proxy_pass http://host.docker.internal:8194/health;
    }
}

# 어느 이름에도 맞지 않으면 여기로 옵니다. 444는 응답 없이 연결을 끊는 nginx 전용 코드입니다.
server {
    listen 80 default_server;
    server_name _;
    return 444;
}
```

- **`proxy_pass`**: 이 `location`으로 온 요청을 주어진 주소로 넘깁니다. 응답은 다시 nginx를 거쳐 손님에게 갑니다.
- **`proxy_set_header`**: 뒤 서버에 넘길 때 헤더를 덧붙입니다. nginx를 거치면 Node 입장에서는 모든 요청이 **nginx에게서 온 것**처럼 보이므로, 원래 손님 정보를 헤더로 실어 보냅니다.
  - `Host $host`: 손님이 요청한 이름(`wiki.localhost`)을 그대로 전달합니다.
  - `X-Real-IP`, `X-Forwarded-For`: 손님의 실제 IP. 로그·접속 제한에 씁니다.
  - `X-Forwarded-Proto`: 손님이 `http`로 왔는지 `https`로 왔는지. HTTPS를 nginx에서 끝낼 때 뒤 서버가 이것을 보고 링크를 만듭니다.
- **`server_name`**: 요청의 `Host` 헤더와 비교해 어느 `server` 블록이 맡을지 정합니다. 이것이 **가상 호스트**입니다.
- **`default_server`**: 어떤 `server_name`에도 맞지 않는 요청을 맡는 블록입니다. 여기서는 IP로 직접 들어오는 등 이름 없는 요청을 끊어 버립니다.
- `*.localhost`(예: `wiki.localhost`)는 별도 설정 없이 이 PC(127.0.0.1)를 가리키는 이름으로 취급하는 프로그램이 많습니다. 작성 PC의 curl 8.2.1에서 확인했습니다(브라우저는 종류·버전에 따라 다를 수 있습니다). 안 되는 환경에서는 아래처럼 `-H "Host: ..."`로 이름을 직접 지정합니다.

### 3단계. nginx 컨테이너 띄우기

ts-wiki와 같은 `nginx:1.27-alpine` 이미지를 씁니다. 설정 파일을 컨테이너 안 `/etc/nginx/conf.d/default.conf` 자리에 **읽기 전용(`:ro`)으로 끼워 넣습니다**(`-v`, 바인드 마운트).

::: code-group

```powershell [Windows (PowerShell)]
cd D:\lab\proxy
docker run -d --name lab-proxy -p 8195:80 -v "${PWD}\proxy.conf:/etc/nginx/conf.d/default.conf:ro" nginx:1.27-alpine
```

```bash [macOS / Linux]
cd ~/lab/proxy
docker run -d --name lab-proxy -p 8195:80 -v "$PWD/proxy.conf:/etc/nginx/conf.d/default.conf:ro" nginx:1.27-alpine
```

:::

```text
8ced54e25f31772e6d9f17d81e7d843757b8abbc72416801c050d9161b9d00a4
```

```bash
docker ps --filter name=lab-proxy
docker exec lab-proxy nginx -t
docker exec lab-proxy nginx -v
```

```text
CONTAINER ID   IMAGE               COMMAND                   CREATED         STATUS         PORTS                  NAMES
8ced54e25f31   nginx:1.27-alpine   "/docker-entrypoint.…"   9 seconds ago   Up 3 seconds   0.0.0.0:8195->80/tcp   lab-proxy
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
nginx version: nginx/1.27.5
```

- `nginx -t`는 설정 문법을 검사합니다. 설정을 고칠 때마다 먼저 돌리는 습관을 들입니다.
- `1.27-alpine` 태그는 작성 시점에 nginx 1.27.5를 가리켰습니다. 태그가 같아도 시점에 따라 마지막 자리 버전은 바뀔 수 있습니다.

### 4단계. 프록시 확인

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://wiki.localhost:8195/guide/roadmap
curl -sI http://wiki.localhost:8195/guide/roadmap | head -8
```

```text
200
HTTP/1.1 200 OK
Server: nginx/1.27.5
Date: Wed, 28 Oct 2026 00:09:32 GMT
Content-Type: text/html; charset=utf-8
Content-Length: 74249
Connection: keep-alive
X-Powered-By: Express
Accept-Ranges: bytes
```

`Server: nginx/1.27.5`와 `X-Powered-By: Express`가 **함께** 보입니다. 앞에서 nginx가 받고, 실제 내용은 뒤의 Express가 만들었다는 증거입니다.

가상 호스트와 기본 서버도 확인합니다.

```bash
curl -s -w " %{http_code}\n" http://status.localhost:8195/
curl -s -w " %{http_code}\n" -H "Host: status.localhost" http://localhost:8195/
curl -s -w "%{http_code} exit=" http://localhost:8195/; echo $?
```

```text
{"status":"ok","uptimeSec":49} 200
{"status":"ok","uptimeSec":49} 200
000 exit=52
```

- 같은 8195번 포트인데 이름이 `status.localhost`이면 헬스 체크 결과가 나옵니다.
- 둘째 줄은 주소는 `localhost`로 두고 `Host` 헤더만 바꾼 것입니다. nginx는 **주소가 아니라 `Host` 헤더**로 블록을 고른다는 것을 보여 줍니다.
- 셋째 줄 `localhost`는 어떤 `server_name`에도 맞지 않아 `default_server`가 연결을 끊었습니다(curl 종료 코드 52 = 서버가 아무 응답도 보내지 않음).

양쪽 로그를 봅니다.

```bash
docker logs lab-proxy 2>&1 | tail -5
```

```text
172.17.0.1 - - [28/Oct/2026:00:09:32 +0000] "GET /guide/roadmap HTTP/1.1" 200 74249 "-" "curl/8.2.1" "-"
172.17.0.1 - - [28/Oct/2026:00:09:32 +0000] "HEAD /guide/roadmap HTTP/1.1" 200 0 "-" "curl/8.2.1" "-"
172.17.0.1 - - [28/Oct/2026:00:09:32 +0000] "GET / HTTP/1.1" 200 30 "-" "curl/8.2.1" "-"
172.17.0.1 - - [28/Oct/2026:00:09:32 +0000] "GET / HTTP/1.1" 200 30 "-" "curl/8.2.1" "-"
172.17.0.1 - - [28/Oct/2026:00:09:33 +0000] "GET / HTTP/1.1" 444 0 "-" "curl/8.2.1" "-"
```

Express 서버 터미널:

```text
2026-10-28T00:09:32.023Z GET /guide/roadmap → 200 (5ms)
2026-10-28T00:09:32.287Z HEAD /guide/roadmap → 200 (2ms)
2026-10-28T00:09:32.612Z GET /health → 200 (1ms)
2026-10-28T00:09:32.845Z GET /health → 200 (1ms)
```

`status.localhost`의 `/` 요청이 Express에는 `/health`로 도착했습니다. `proxy_pass` 주소 끝에 경로(`/health`)를 붙이면 그 경로로 바꿔 넘긴다는 뜻입니다. 그리고 444로 끊긴 요청은 Express 로그에 없습니다. nginx 선에서 막혔기 때문입니다.

**확인 방법**: 브라우저로 `http://wiki.localhost:8195`를 열어 위키가 보이고, `http://status.localhost:8195`에서 JSON이 보이면 성공입니다.

### 5단계. 일부러 502 만들기

Express 서버 터미널에서 `Ctrl+C`로 서버를 끈 뒤 다시 요청합니다.

```bash
curl -s -w "\n%{http_code}\n" http://wiki.localhost:8195/
```

```text
<html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.27.5</center>
</body>
</html>

502
```

```bash
docker logs lab-proxy 2>&1 | tail -2
```

```text
2026/10/28 00:09:43 [error] 27#27: *10 connect() failed (111: Connection refused) while connecting to upstream, client: 172.17.0.1, server: wiki.localhost, request: "GET / HTTP/1.1", upstream: "http://192.168.65.254:8194/", host: "wiki.localhost:8195"
172.17.0.1 - - [28/Oct/2026:00:09:43 +0000] "GET / HTTP/1.1" 502 157 "-" "curl/8.2.1" "-"
```

- **upstream**(업스트림)은 nginx가 요청을 넘기는 뒤쪽 서버를 말합니다. `Connection refused`는 "그 주소·포트에 아무도 기다리고 있지 않다"는 뜻입니다.
- `192.168.65.254`는 Docker Desktop이 `host.docker.internal`에 붙여 준 내부 주소입니다(환경마다 다를 수 있습니다).
- 502는 "nginx는 살아 있지만 **뒤가** 응답하지 않는다"는 신호입니다. 그래서 502가 나면 nginx가 아니라 **upstream 쪽**을 먼저 봅니다.

| 상태 코드 | 뜻 | 먼저 볼 곳 |
|---|---|---|
| 502 Bad Gateway | upstream에 연결 실패 또는 이상한 응답 | 뒤 서버가 떠 있나, 포트·주소(`host.docker.internal`)가 맞나 |
| 504 Gateway Timeout | upstream이 정해진 시간 안에 답하지 않음 | 뒤 서버가 느린가, 무한 대기 중인가 |
| 404 | nginx 또는 뒤 서버가 "없다"고 답함 | 둘 중 누가 답했는지 `Server` 헤더와 양쪽 로그로 구분 |

### 6단계. 정리

```bash
docker rm -f lab-proxy
docker ps -a --filter name=lab-proxy
```

```text
lab-proxy
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

목록에 아무것도 없으면 정리된 것입니다. Express 서버도 꺼졌는지 확인합니다.

## HTTPS·TLS·인증서 개념

여기부터는 **개념과 절차**만 다룹니다. 실제 인증서 발급에는 인터넷에서 접속 가능한 서버와 내 도메인이 필요하기 때문입니다.

### HTTP와 HTTPS

- **HTTP**는 내용을 **그대로** 주고받습니다. 같은 와이파이에 있는 누군가가 엿보거나 중간에서 바꿔치기할 수 있습니다.
- **HTTPS**는 HTTP를 **TLS**(Transport Layer Security, 전송 구간 암호화 규약)로 감싼 것입니다. TLS는 두 가지를 보장합니다.
  1. **암호화**: 중간에서 봐도 내용을 읽을 수 없습니다.
  2. **신원 확인**: 지금 연결된 서버가 정말 그 도메인의 주인인지 확인합니다. 이 확인에 쓰는 것이 **인증서**입니다.
- 기본 포트는 HTTP 80, HTTPS 443입니다.

### 인증서는 신분증입니다

- 인증서에는 "이 공개 키는 `wiki.example.com`의 것"이라는 내용과, 그것을 보증한 **인증 기관(CA, Certificate Authority)** 의 서명이 들어 있습니다.
- 브라우저와 운영체제는 믿을 만한 CA 목록을 미리 가지고 있어서, 그 CA가 서명한 인증서면 자물쇠 표시를 보여 줍니다.
- 서버는 인증서와 함께 **개인 키**(private key)를 가집니다. 개인 키는 절대 밖에 나가면 안 되는 비밀입니다. 저장소에 올리지 않습니다.
- 내가 직접 서명한 인증서(자체 서명 인증서)는 암호화는 되지만 브라우저가 "신뢰할 수 없음" 경고를 띄웁니다. 내부 테스트용으로만 씁니다.

### Let's Encrypt와 발급 절차

Let's Encrypt는 무료로 인증서를 발급해 주는 CA입니다(작성 시점 기준, 정책·유효 기간은 공식 사이트에서 확인). 발급은 보통 **ACME**라는 자동화 규약을 쓰는 프로그램(대표적으로 certbot)이 처리합니다. 큰 흐름은 다음과 같습니다.

```text
1. 도메인 준비      wiki.example.com 의 DNS A 레코드 → 서버의 공인 IP
2. 80번 포트 열기   방화벽·공유기에서 80(확인용), 443(서비스용) 허용
3. 소유 확인(챌린지) certbot이 CA에 요청 → CA가 http://wiki.example.com/.well-known/acme-challenge/... 를 확인
                   → "이 도메인을 정말 이 서버가 쓰고 있구나" 판단
4. 발급·저장        인증서(fullchain.pem)와 개인 키(privkey.pem)가 서버에 저장
5. nginx 설정       listen 443 ssl; ssl_certificate ...; ssl_certificate_key ...;
                   80번으로 온 요청은 https로 돌려보내기(301)
6. 자동 갱신        유효 기간이 짧으므로 갱신을 예약 작업으로 자동화하고, 갱신 후 nginx 다시 읽기
```

nginx 설정은 대략 이런 모양이 됩니다(**예시이며 이 가이드에서 실행하지 않았습니다**. 경로는 certbot 기본값 기준).

```nginx
server {
    listen 80;
    server_name wiki.example.com;
    return 301 https://$host$request_uri;   # http로 오면 https로 보냅니다
}

server {
    listen 443 ssl;
    server_name wiki.example.com;

    ssl_certificate     /etc/letsencrypt/live/wiki.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wiki.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8194;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

뒤의 Node 서버는 여전히 평범한 HTTP(8194)입니다. 암호화는 nginx에서 끝납니다. 이것을 **TLS 종료(TLS termination)** 라고 합니다.

::: warning 사내 서버라면
회사 내부망 서버는 인터넷에서 80번으로 접근할 수 없어 위 방식(HTTP 챌린지)이 안 될 수 있습니다. 이때는 DNS 챌린지, 사내 CA 인증서 등 다른 방법을 씁니다. 사내 도메인·인증서 정책은 회사마다 다르므로 **인프라 담당 부서에 먼저 확인**합니다. 인증서 개인 키와 사내 도메인 이름은 공개 저장소·외부 문서에 올리지 않습니다.
:::

GitHub Pages는 이 과정을 GitHub가 대신 처리하므로, ts-wiki의 Pages 주소(https://hong-coding.github.io/ts-wiki/)는 처음부터 HTTPS입니다.

## ts-wiki에서는

ts-wiki의 `nginx.conf`는 리버스 프록시가 아니라 **정적 파일 서버** 설정입니다.

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
```

- 1~3번 줄: `server_name _;`은 "이름을 가리지 않는다"는 관례적 표기입니다. 서버가 하나뿐이니 가상 호스트를 나눌 필요가 없습니다. 이번 실습의 `default_server` 블록과 같은 자리입니다.
- 4번 줄: `root`로 파일을 직접 내줍니다. 이번 실습에서는 이 자리에 `proxy_pass`가 들어갔습니다.
- `docker-compose.yml` 6번 줄 `"8090:80"`: 컨테이너 안 80번을 PC의 8090번에 연결합니다. 이번 `-p 8195:80`과 같은 구조입니다.

ts-wiki를 사내 서버에서 HTTPS로 서비스한다면, 지금 구조를 바꾸지 않고 **앞에 nginx(또는 사내 프록시)를 한 겹 더** 두는 방법이 흔합니다. 앞단이 443에서 HTTPS를 받아 `http://localhost:8090`(ts-wiki 컨테이너)으로 `proxy_pass`하면 됩니다. 위키 컨테이너는 그대로 두고 인증서는 앞단에서만 관리하게 됩니다.

## 자주 하는 실수

1. **증상**: 계속 `502 Bad Gateway`, 에러 로그에 `connect() failed (111: Connection refused)`
   **원인**: 뒤 서버가 꺼져 있거나, `proxy_pass`에 `localhost`를 써서 컨테이너 자기 자신을 가리켰습니다.
   **해결**: PC에서 `curl http://localhost:8194/health`로 뒤 서버를 먼저 확인하고, 컨테이너에서는 `host.docker.internal`을 씁니다.
2. **증상**: `docker run` 직후 컨테이너가 바로 꺼진다(`docker ps`에 없음).
   **원인**: 설정 파일 문법 오류(세미콜론 빠짐 등)이거나 `-v` 경로가 틀려 파일 대신 빈 폴더가 마운트되었습니다.
   **해결**: `docker logs lab-proxy`로 에러 줄을 보고, `-v` 앞쪽 경로가 실제 파일인지 확인합니다.
3. **증상**: `Bind for 0.0.0.0:8195 failed: port is already allocated`
   **원인**: 지난 실습 컨테이너가 남아 있습니다.
   **해결**: `docker ps -a`로 확인하고 `docker rm -f lab-proxy`로 지웁니다.
4. **증상**: 이름으로 접속했는데 엉뚱한 사이트가 나온다.
   **원인**: `server_name`이 요청의 `Host`와 맞지 않아 기본 서버가 응답했습니다.
   **해결**: `curl -v`로 보낸 `Host` 헤더를 확인하고 `server_name`과 비교합니다.
5. **증상**: 뒤 서버 로그에 손님 IP가 전부 같은 값(`172.17.0.1` 등)으로 찍힌다.
   **원인**: 프록시를 거치면 뒤 서버에는 nginx의 주소만 보입니다.
   **해결**: `X-Forwarded-For` 헤더를 넘기고, Express에서는 `app.set('trust proxy', 1)`처럼 프록시를 신뢰하도록 설정해야 `req.ip`에 원래 IP가 들어옵니다(믿을 수 있는 프록시 뒤에서만 켭니다).

## 직접 해 보기

### 과제 1 ⭐ 502 원인 찾기 연습

`proxy_pass`의 포트를 일부러 `8199`로 바꾸고 컨테이너를 다시 띄워, 에러 로그에서 원인을 찾아 보세요.

::: details 정답 보기
`docker logs lab-proxy`의 에러 줄에 `upstream: "http://...:8199/"`와 `Connection refused`가 보입니다. 설정을 되돌리고 `docker rm -f lab-proxy` 후 다시 `docker run` 합니다(바인드 마운트한 파일을 고친 경우 `docker exec lab-proxy nginx -s reload`로 다시 읽게 할 수도 있습니다).
:::

### 과제 2 ⭐⭐ 정적 파일은 nginx가, API는 Node가

`wiki.localhost`에서 `/`는 nginx가 `dist`를 직접 서비스하고, `/health`만 Node로 넘기도록 바꿔 보세요.

::: details 정답 보기
`dist` 폴더도 `-v .../dist:/usr/share/nginx/html:ro`로 마운트하고, 설정을 이렇게 바꿉니다.
```nginx
server {
    listen 80;
    server_name wiki.localhost;
    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location = /health {
        proxy_pass http://host.docker.internal:8194;
    }
}
```
`curl -sI http://wiki.localhost:8195/`에 `X-Powered-By`가 없고, `/health`에는 있으면 성공입니다. 실무에서 가장 흔한 구조입니다.
:::

### 과제 3 ⭐⭐ Compose로 묶기

`proxy.conf`와 nginx 컨테이너를 `docker-compose.yml`로 옮겨, `docker compose up -d` 한 번으로 띄우고 `docker compose down`으로 정리해 보세요.

::: details 정답 보기
```yaml
services:
  proxy:
    image: nginx:1.27-alpine
    container_name: lab-proxy
    ports:
      - "8195:80"
    volumes:
      - ./proxy.conf:/etc/nginx/conf.d/default.conf:ro
```
:::

### 과제 4 ⭐⭐⭐ HTTPS 절차서 쓰기

"한빛 카페" 위키를 `wiki.hanbit-cafe.example`이라는 (가상) 도메인으로 HTTPS 서비스한다고 가정하고, 위 6단계 절차를 내 환경에 맞춘 점검표로 써 보세요. 각 단계에 "확인 명령"을 하나씩 붙입니다.

::: details 예시
1. DNS: `nslookup wiki.hanbit-cafe.example` 결과가 서버 공인 IP인가
2. 포트: 외부에서 `curl -I http://wiki.hanbit-cafe.example`가 응답하는가
3. 발급: certbot 실행 후 인증서 파일 두 개가 생겼는가
4. 설정: `nginx -t` 통과, `curl -I https://...`가 200인가
5. 리다이렉트: `curl -I http://...`가 301과 `Location: https://...`를 주는가
6. 갱신: 갱신 예약 작업이 등록되어 있고, 시험 갱신(dry run)이 성공하는가
:::

## 확인 퀴즈

1. 리버스 프록시와 포워드 프록시는 각각 누구를 대신합니까?
2. 컨테이너 안 nginx 설정에서 `proxy_pass http://localhost:8194`가 PC의 Node 서버에 닿지 않는 이유는 무엇입니까?
3. 같은 IP·같은 포트에서 여러 사이트를 나누는 기준은 무엇입니까?
4. 502와 504의 차이는 무엇입니까?
5. TLS 종료(TLS termination)를 nginx에서 하면 뒤의 Node 서버는 무엇으로 통신합니까?

::: details 정답 보기
1. 리버스 프록시는 서버 쪽을 대신해 손님을 맞고, 포워드 프록시는 손님(클라이언트) 쪽을 대신해 바깥에 요청합니다.
2. 컨테이너 안의 `localhost`는 컨테이너 자신이기 때문입니다. PC를 가리키려면 `host.docker.internal`을 씁니다.
3. 요청의 `Host` 헤더와 nginx의 `server_name`입니다.
4. 502는 upstream 연결 실패·잘못된 응답, 504는 upstream이 제한 시간 안에 응답하지 않은 것입니다.
5. 평범한 HTTP로 통신합니다. 암호화는 nginx와 브라우저 사이 구간에서만 합니다.
:::

## 정리

- 리버스 프록시는 손님 요청을 앞에서 받아 뒤 서버로 넘기는 서버입니다. HTTPS·정적 파일·여러 서비스 나누기·뒤 서버 숨기기를 한곳에서 처리합니다.
- `proxy_pass`로 넘기고, `proxy_set_header`로 원래 손님 정보(`Host`, `X-Forwarded-For`, `X-Forwarded-Proto`)를 실어 보냅니다.
- 컨테이너 안에서 PC를 가리킬 때는 `localhost`가 아니라 `host.docker.internal`(Docker Desktop)입니다.
- `server_name`과 `Host` 헤더로 가상 호스트를 나누고, `default_server`가 나머지를 맡습니다.
- 502는 "뒤가 응답하지 않음"입니다. upstream부터 확인합니다.
- HTTPS는 TLS로 암호화·신원 확인을 하고, 인증서는 CA가 서명한 신분증입니다. Let's Encrypt는 도메인 소유 확인 → 발급 → nginx 설정 → 자동 갱신 순서로 씁니다.

## 다음 단계

[서버 운영에 필요한 리눅스 기초](./05-linux-basics) — 실제 서버는 대부분 리눅스입니다. Docker로 Ubuntu·Alpine 컨테이너를 띄워, 파일·권한·프로세스·포트·로그를 명령으로 다루는 법을 익힙니다.
