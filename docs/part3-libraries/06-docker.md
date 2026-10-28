---
title: Docker와 Docker Compose
---

# Docker와 Docker Compose

<LessonMeta level="초급" :minutes="60" prev="nginx 설정 구조와 ts-wiki nginx.conf를 읽고, Docker로 nginx를 띄워 정적 파일을 서비스했습니다." />

## 이번에 배울 것

- **이미지**, **컨테이너**, **레이어**의 차이를 설명할 수 있다.
- Dockerfile 명령(`FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD`)과 **멀티 스테이지 빌드**를 읽고 쓸 수 있다.
- `.dockerignore`, 포트 매핑(`-p`), 볼륨(`-v`)이 왜 필요한지 실험 결과로 설명할 수 있다.
- `docker build / run / ps / logs / stop / rm / images` 명령을 쓸 수 있다.
- `docker-compose.yml`의 `services`, `build`, `ports`, `restart`를 읽고 `docker compose up -d` · `down`을 쓸 수 있다.

## 먼저 알아 둘 것

- [준비물 설치](../part0-start/03-setup) — Docker Desktop 설치와 실행
- [nginx: 정적 파일 웹 서버](./05-nginx) — 지난 레슨에서 따라 친 `docker run -p -v`를 이번에 설명합니다
- [VitePress: 설정 · 라우팅 · 테마](./01-vitepress) — `npm run build`와 `dist` 폴더

## 비유로 이해하기

Docker는 **도시락 공장**입니다.

- **Dockerfile**은 **조리법 카드**입니다. "밥을 담는다 → 반찬을 넣는다 → 뚜껑을 닫는다"처럼 순서대로 적습니다.
- **이미지**(image)는 조리법대로 만든 **냉동 도시락**입니다. 몇 개든 똑같이 복제할 수 있고, 한 번 만들면 내용이 바뀌지 않습니다.
- **컨테이너**(container)는 그 도시락을 **데워서 상에 올린 것**, 즉 실행 중인 상태입니다. 같은 냉동 도시락으로 여러 상을 차릴 수 있습니다.
- **레이어**(layer)는 도시락의 **칸**입니다. 반찬 칸만 바뀌었으면 밥 칸은 다시 만들 필요 없이 재사용합니다(캐시).
- **멀티 스테이지 빌드**는 **주방에서 조리하고, 완성된 요리만 도시락에 담는 것**입니다. 칼·도마(Node.js, `node_modules`)는 도시락에 넣지 않습니다.
- **Docker Compose**는 **주문서**입니다. "이 도시락을, 8090번 테이블에, 손님이 떠나도 계속 차려 둘 것"을 파일 한 장에 적어 둡니다.

## 이게 뭔가

**Docker**는 프로그램과 그 프로그램이 필요로 하는 모든 것(운영 체제 파일, 라이브러리, 설정)을 **하나의 이미지로 묶어**, 어느 PC에서나 똑같이 실행하게 해 주는 도구입니다. 실행된 이미지를 **컨테이너**라고 부르며, 컨테이너는 내 PC와 **격리된 작은 리눅스 환경**처럼 동작합니다(Windows·macOS의 Docker Desktop은 내부에 리눅스 가상 환경을 두고 그 안에서 실행합니다).

**Docker Compose**는 `docker run`에 붙이던 긴 옵션들을 **YAML 파일**(`docker-compose.yml`)에 적어 두고 `docker compose up` 한 줄로 실행하게 해 주는 도구입니다. 여러 컨테이너(예: 웹 서버 + DB)를 함께 띄울 때 특히 유용합니다.

작성 시점(2026-10) 이 가이드의 실습 PC 버전입니다.

```bash
docker --version
docker compose version
```

```text
Docker version 25.0.3, build 4debf41
Docker Compose version v2.24.5-desktop.1
```

## 왜 필요한가

ts-wiki를 사내 서버에 띄우려면 원래 이런 일이 필요합니다.

1. 서버에 Node.js를 설치한다(버전도 맞춰야 함).
2. 소스를 받아 `npm ci`, `npm run build`를 한다.
3. 서버에 nginx를 설치하고, 설정 파일을 `/etc/nginx/...`의 올바른 위치에 넣는다.
4. `dist` 폴더를 nginx의 `root` 폴더로 복사한다.
5. 서버가 재부팅되면 nginx가 자동으로 켜지게 설정한다.

Docker를 쓰면 이 모든 과정이 `Dockerfile`과 `docker-compose.yml`에 **코드로** 적혀 있으므로, 서버에서는 이것만 하면 됩니다.

```bash
docker compose up -d --build
```

- "내 PC에서는 되는데 서버에서는 안 돼요"가 줄어듭니다. 이미지 안의 Node.js·nginx 버전이 고정되어 있기 때문입니다.
- 서버를 깨끗하게 유지합니다. 지우고 싶으면 컨테이너와 이미지만 지우면 끝입니다.

## 설치

[준비물 설치](../part0-start/03-setup)에서 Docker Desktop을 설치했다면 끝입니다. **Docker Desktop 앱이 실행 중이어야** 명령이 동작합니다.

**확인 방법**:

```bash
docker info --format "{{.ServerVersion}}"
```

```text
25.0.3
```

버전이 나오면 Docker 엔진(데몬, 뒤에서 실제로 컨테이너를 돌리는 프로그램)과 연결된 것입니다. `error during connect` 같은 오류가 나오면 Docker Desktop이 꺼져 있는 것입니다.

## 핵심 사용법 1 — Dockerfile과 이미지

### Dockerfile 명령 사전

| 명령 | 뜻 | 예 |
|---|---|---|
| `FROM 이미지` | 무엇을 바탕으로 시작할지. 모든 Dockerfile의 첫 명령 | `FROM node:22-alpine` |
| `FROM ... AS 이름` | 이 단계(stage)에 이름 붙이기 → 멀티 스테이지 | `FROM node:22-alpine AS build` |
| `WORKDIR 경로` | 이후 명령이 실행될 폴더(없으면 만듦). `cd`와 비슷 | `WORKDIR /app` |
| `COPY 원본 대상` | 내 PC(빌드 컨텍스트)의 파일을 이미지 안으로 복사 | `COPY . .` |
| `COPY --from=단계 원본 대상` | 다른 단계에서 만든 파일을 복사 | `COPY --from=build /app/dist /html` |
| `RUN 명령` | 이미지를 **만드는 동안** 명령 실행. 결과가 레이어로 저장됨 | `RUN npm ci` |
| `EXPOSE 포트` | "이 컨테이너는 이 포트를 쓴다"는 **문서용 표시**. 실제로 포트를 열지는 않음 | `EXPOSE 80` |
| `CMD [...]` | 컨테이너가 **시작될 때** 실행할 기본 명령 | `CMD ["nginx", "-g", "daemon off;"]` |

`RUN`과 `CMD`의 차이가 중요합니다. `RUN`은 이미지를 **만들 때** 한 번 실행되고, `CMD`는 컨테이너를 **켤 때마다** 실행됩니다.

### 연습 프로젝트에 Dockerfile 넣기

[3-1](./01-vitepress)의 연습 프로젝트(`mini`)에 ts-wiki의 `Dockerfile`, `nginx.conf`, `.dockerignore`를 **그대로** 복사했습니다. 연습 프로젝트도 `docs` 폴더 구조라 고칠 것이 없습니다.

```text
mini/
├─ .dockerignore
├─ Dockerfile
├─ docker-compose.yml
├─ nginx.conf
├─ package.json
├─ package-lock.json
└─ docs/ ...
```

`Dockerfile` 내용입니다(ts-wiki와 같음, 14줄).

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

### 이미지 만들기 — docker build

```bash
docker build -t mini-wiki:1.0 .
```

- `-t 이름:태그`는 만들 이미지의 이름입니다. 태그를 생략하면 `latest`가 됩니다.
- 마지막 `.`은 **빌드 컨텍스트**(Docker에 넘길 폴더)입니다. `COPY`의 원본 경로는 이 폴더 기준입니다.

처음부터 새로 빌드(`--no-cache`)했을 때의 실제 출력입니다(일부 줄 생략).

```text
#1 [internal] load build definition from Dockerfile
#3 [internal] load metadata for docker.io/library/node:22-alpine
#4 [build 1/7] FROM docker.io/library/node:22-alpine@sha256:fe4f6d74...
#5 [internal] load .dockerignore
#5 transferring context: 110B 0.0s done
#7 [stage-1 1/3] FROM docker.io/library/nginx:1.27-alpine
#8 [internal] load build context
#8 transferring context: 2.90kB 0.0s done
#9 [stage-1 2/3] COPY nginx.conf /etc/nginx/conf.d/default.conf
#10 [build 4/7] COPY package.json package-lock.json ./
#11 [build 5/7] RUN npm ci
#11 9.996 added 136 packages, and audited 137 packages in 9s
#11 DONE 10.3s
#12 [build 6/7] COPY . .
#13 [build 7/7] RUN npm run build
#13 8.440 build complete in 6.91s.
#13 DONE 8.5s
#14 [stage-1 3/3] COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html
```

(`[build 2/7] RUN apk add --no-cache git`, `[build 3/7] WORKDIR /app` 줄과 마지막 `naming to ...` 줄은 생략했습니다.)

읽는 법입니다.

- `[build 5/7]`은 "`build`라는 이름의 단계, 7개 명령 중 5번째"라는 뜻입니다. 이름 없는 두 번째 `FROM`은 `stage-1`이라고 불립니다.
- 번호(`#9`, `#10`)가 Dockerfile 순서와 다른 것은, 서로 기다릴 필요가 없는 단계를 **동시에** 진행하기 때문입니다. `nginx.conf` 복사(stage-1)는 Node.js 빌드를 기다리지 않습니다.
- `#13 8.440 build complete`는 컨테이너 안에서 실행된 `vitepress build`의 출력입니다.

**확인 방법**:

```bash
docker images mini-wiki
```

```text
REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
mini-wiki    1.0       29cacb0496a1   1 second ago   49.3MB
```

### 레이어와 캐시

Dockerfile의 각 명령(`COPY`, `RUN` 등)은 이미지의 **레이어** 하나가 됩니다. 레이어는 "앞 레이어에서 바뀐 파일만 담은 층"이며, Docker는 **입력이 같으면 이전에 만든 레이어를 재사용**합니다. 마크다운 한 줄만 고치고 다시 빌드한 결과입니다. (이 출력은 ts-wiki에 git 설치 줄이 추가되기 전의 Dockerfile, 즉 빌드 단계가 6개이던 때 실행한 것이라 `3/6`처럼 번호가 하나씩 작습니다. 캐시가 맞는 방식은 같습니다.)

```text
#8 [build 3/6] COPY package.json package-lock.json ./
#8 CACHED
#9 [build 2/6] WORKDIR /app
#9 CACHED
#10 [build 4/6] RUN npm ci
#10 CACHED
#11 [build 5/6] COPY . .
#11 DONE 0.1s
#12 [build 6/6] RUN npm run build
#12 DONE 12.7s
#13 [stage-1 2/3] COPY nginx.conf /etc/nginx/conf.d/default.conf
#13 CACHED
```

`RUN npm ci`가 `CACHED`입니다. 이것이 ts-wiki `Dockerfile`이 **`package.json`을 먼저, 나머지 소스는 나중에** 복사하는 이유입니다.

```text
COPY package.json package-lock.json ./   ← 패키지 목록이 안 바뀌면
RUN npm ci                               ← 이 오래 걸리는 단계를 재사용
COPY . .                                 ← 문서가 바뀌면 여기부터 다시
RUN npm run build
```

만약 `COPY . .`를 먼저 하고 `RUN npm ci`를 했다면, 문서 한 글자만 고쳐도 `COPY . .`의 입력이 바뀌어 그 뒤의 `npm ci`까지 매번 다시 실행됩니다. **잘 바뀌지 않는 것을 위에, 자주 바뀌는 것을 아래에** 둡니다.

이미지의 레이어 목록은 `docker history`로 봅니다.

```bash
docker history mini-wiki:1.0
```

```text
SIZE      CREATED BY
0B        EXPOSE map[80/tcp:{}]
1.02MB    COPY /app/docs/.vitepress/dist /usr/share/ng…
361B      COPY nginx.conf /etc/nginx/conf.d/default.co…
36.3MB    RUN /bin/sh -c set -x     && apkArch="$(cat …
...
```

위의 세 줄이 우리가 더한 레이어이고, 그 아래는 `nginx:1.27-alpine` 이미지가 원래 가지고 있던 레이어입니다. `CMD`가 우리 Dockerfile에 없는데도 컨테이너가 nginx를 실행하는 것은, nginx 공식 이미지에 이미 `CMD ["nginx" "-g" "daemon off;"]`가 들어 있어 그대로 **물려받기** 때문입니다.

### 멀티 스테이지 빌드

`FROM`이 두 번 나오는 것이 **멀티 스테이지 빌드**입니다. 최종 이미지에는 **마지막 `FROM` 단계만** 남습니다. 첫 단계만 따로 이미지로 만들어(`--target build`) 크기를 비교했습니다(git 설치 줄이 들어가기 전 Dockerfile로 잰 값입니다. git이 더해지면 빌드 단계는 조금 더 커지지만 최종 이미지에는 영향이 없습니다).

```bash
docker build --target build -t mini-build-stage .
docker images
```

```text
REPOSITORY:TAG                 SIZE
mini-wiki:1.0                  49.3MB
mini-build-stage:latest        300MB
```

| | 빌드 단계 (`build`) | 최종 이미지 |
|---|---|---|
| 바탕 | `node:22-alpine` | `nginx:1.27-alpine` |
| 들어 있는 것 | Node.js, `node_modules`, 소스 전체, `dist` | nginx, `nginx.conf`, `dist`만 |
| 크기 | 300MB | **49.3MB** |
| 서버에 필요한가 | 아니요(빌드할 때만) | 예 |

`COPY --from=build`가 빌드 단계에서 **완성품(`dist`)만** 꺼내 옵니다. 서버에 Node.js가 남지 않으므로 이미지가 작고, 공격받을 수 있는 프로그램도 적어집니다.

### .dockerignore

`.dockerignore`는 **빌드 컨텍스트에서 뺄 파일 목록**입니다. `.gitignore`와 문법이 비슷합니다. ts-wiki의 `.dockerignore`입니다.

```text
node_modules
docs/.vitepress/dist
docs/.vitepress/cache
examples
.git
```

연습 프로젝트에서 `.dockerignore`를 잠시 치우고 빌드해 본 결과입니다.

```text
.dockerignore 있음:  #7 transferring context: 2.41kB 0.2s done
.dockerignore 없음:  #7 transferring context: 100.55MB 7.0s done
```

`node_modules`(약 99MB)까지 Docker로 넘기느라 2.41kB가 100MB로 늘고 7초가 걸렸습니다. 문제는 시간만이 아닙니다.

- 내 PC(Windows)의 `node_modules`에는 Windows용 실행 파일이 들어 있습니다. `COPY . .`가 이것을 리눅스 컨테이너 안의 `node_modules` 위에 덮어쓰면, 운이 나쁘면 빌드가 깨집니다. 컨테이너 안의 패키지는 `npm ci`가 리눅스용으로 새로 설치한 것을 써야 합니다.
- `.git` 폴더나 `.env`(비밀 값 파일)가 이미지에 들어가면 이미지를 받은 사람이 그 내용을 볼 수 있습니다.

## 핵심 사용법 2 — 컨테이너 다루기

### 실행 — docker run

```bash
docker run -d --name mini -p 8199:80 mini-wiki:1.0
```

```text
7dbea2683533f7b0874e9665184645ac4bb3a3705fbb344abfd54b81f90c2fdf
```

출력된 긴 글자는 새 컨테이너의 ID입니다.

| 옵션 | 뜻 |
|---|---|
| `-d` | detached. 백그라운드로 실행하고 터미널을 돌려줌 |
| `--name mini` | 컨테이너 이름. 없으면 `stupefied_montalcini` 같은 임의 이름이 붙음 |
| `-p 8199:80` | **포트 매핑**. `내 PC 포트:컨테이너 포트` |
| `-v 내PC경로:컨테이너경로` | **볼륨**(아래 설명) |
| `--rm` | 컨테이너가 멈추면 자동으로 지움 |

### 포트 매핑

컨테이너는 격리되어 있어서, 안에서 nginx가 80번 포트로 기다려도 **바깥(내 PC)에서는 보이지 않습니다.** `-p 8199:80`은 "내 PC의 8199번으로 들어온 요청을 컨테이너의 80번으로 넘겨라"라는 뜻입니다.

```text
브라우저 ──▶ localhost:8199 ──(Docker)──▶ 컨테이너:80 ──▶ nginx
```

그래서 `EXPOSE 80`을 적어 두었더라도 `-p`가 없으면 접속할 수 없습니다. `EXPOSE`는 "이 이미지는 80번을 쓴다"는 안내문일 뿐입니다.

### 상태 보기 — docker ps · logs

```bash
docker ps --filter name=mini
```

```text
CONTAINER ID   IMAGE           STATUS                  PORTS                  NAMES
7dbea2683533   mini-wiki:1.0   Up Less than a second   0.0.0.0:8199->80/tcp   mini
```

- `docker ps`는 **실행 중인** 컨테이너만 보여 줍니다. 멈춘 것까지 보려면 `docker ps -a`입니다.
- `PORTS`의 `0.0.0.0:8199->80/tcp`는 "모든 네트워크 주소의 8199 → 컨테이너 80"입니다. `0.0.0.0`이므로 같은 네트워크의 다른 PC도 `http://<이 PC의 IP>:8199`로 접속할 수 있습니다(방화벽이 막지 않는다면).

브라우저로 `http://localhost:8199/guide/recipe`를 열거나 `curl`로 확인합니다.

```bash
curl -s http://localhost:8199/guide/recipe | grep -o "<title>[^<]*"
```

```text
<title>레시피 | 한빛 카페 위키
```

컨테이너의 출력(nginx 로그)은 `docker logs`로 봅니다.

```bash
docker logs mini
```

```text
2026/10/28 00:15:55 [notice] 1#1: start worker process 39
2026/10/28 00:15:55 [notice] 1#1: start worker process 40
172.17.0.1 - - [28/Oct/2026:00:15:57 +0000] "GET /guide/recipe HTTP/1.1" 200 10079 "-" "curl/8.2.1" "-"
```

`docker logs -f mini`처럼 `-f`를 붙이면 새 로그가 나올 때마다 계속 보여 줍니다(끝낼 때는 `Ctrl+C`).

### 멈추기와 지우기 — stop · rm · rmi

```bash
docker stop mini
docker ps -a --filter name=mini
docker rm mini
```

```text
mini
NAMES     STATUS
mini      Exited (0) 1 second ago
mini
```

- `stop`은 컨테이너를 **멈춥니다.** 멈춘 컨테이너는 `docker ps -a`에 `Exited` 상태로 남아 있고 `docker start mini`로 다시 켤 수 있습니다.
- `rm`은 멈춘 컨테이너를 **지웁니다.** 실행 중인 것은 먼저 `stop`해야 합니다.
- 이미지까지 지우려면 `docker rmi mini-wiki:1.0`입니다. 그 이미지로 만든 컨테이너가 남아 있으면 지워지지 않습니다.

::: warning 남의 컨테이너는 지우지 않습니다
`docker ps -a`에는 내가 만들지 않은 컨테이너(다른 프로젝트의 DB 등)도 보입니다. `docker rm`, `docker rmi`, 그리고 특히 `docker system prune` 같은 일괄 정리 명령은 **이름을 확인하고** 내가 만든 것에만 씁니다. 실습 컨테이너에는 `nginx-lab`, `mini`처럼 알아보기 쉬운 이름을 붙여 두면 정리할 때 헷갈리지 않습니다.
:::

### 볼륨 — 컨테이너 밖에 파일 두기

컨테이너를 지우면 컨테이너 안에서 생긴 파일도 함께 사라집니다. 지워지면 안 되는 파일, 또는 내 PC의 파일을 컨테이너에서 쓰고 싶을 때 **볼륨**을 씁니다. 두 종류가 있습니다.

**바인드 마운트**(bind mount) — 내 PC의 폴더·파일을 그대로 연결합니다. [3-5](./05-nginx)에서 이미 썼습니다.

```bash
docker run -d --name nginx-lab -p 8197:80 \
  -v "$(pwd)/mini/docs/.vitepress/dist:/usr/share/nginx/html:ro" \
  nginx:1.27-alpine
```

이미지를 새로 만들지 않고도 내 PC의 `dist`를 바로 서비스할 수 있어 **실험할 때** 편합니다. PowerShell에서는 `$(pwd)` 대신 `${PWD}`, 줄 바꿈은 `\` 대신 백틱을 씁니다([3-5](./05-nginx)의 코드 그룹 참고).

**이름 있는 볼륨**(named volume) — Docker가 관리하는 저장 공간입니다. DB 데이터처럼 컨테이너를 바꿔도 남아야 하는 자료에 씁니다.

```bash
docker volume create demo-vol
docker run --rm -v demo-vol:/data nginx:1.27-alpine sh -c 'date > /data/note.txt'
docker run --rm -v demo-vol:/data nginx:1.27-alpine cat /data/note.txt
docker volume rm demo-vol
```

```text
demo-vol
Wed Oct 28 02:25:06 UTC 2026
demo-vol
```

첫 번째 컨테이너는 파일을 쓰고 지워졌지만(`--rm`), 두 번째 컨테이너에서 같은 볼륨을 연결하자 파일이 그대로 있었습니다.

ts-wiki는 **볼륨을 쓰지 않습니다.** 위키 파일은 이미지 안에 구워져 있고(`COPY --from=build`), 컨테이너가 저장할 데이터가 없기 때문입니다. 그래서 문서를 고치면 **이미지를 다시 빌드**해야 반영됩니다.

## 핵심 사용법 3 — Docker Compose

### docker-compose.yml

긴 `docker run` 옵션을 파일로 옮긴 것입니다. 연습 프로젝트용으로 ts-wiki 파일에서 이름과 포트만 바꿨습니다.

```yaml
services:
  mini-wiki:
    build: .
    container_name: mini-wiki
    ports:
      - "8199:80"
    restart: unless-stopped
```

| 키 | 뜻 | `docker run`으로 치면 |
|---|---|---|
| `services` | 띄울 컨테이너 목록. 여기서는 하나 | |
| `mini-wiki` | 서비스 이름(Compose 안에서 부르는 이름) | |
| `build: .` | 이 폴더의 `Dockerfile`로 이미지를 빌드 | `docker build .` |
| `container_name` | 컨테이너 이름 | `--name` |
| `ports` | 포트 매핑 목록 | `-p 8199:80` |
| `restart: unless-stopped` | 꺼지면 자동으로 다시 켬. 단, 내가 직접 멈춘 경우는 제외 | `--restart unless-stopped` |

`ports`의 값을 `"8199:80"`처럼 **따옴표로 감싸는** 것은 YAML이 `숫자:숫자`를 시간(60진수)으로 잘못 해석하는 경우가 있기 때문입니다. 포트는 항상 따옴표로 감싸 두는 것이 안전합니다.

`restart` 값은 네 가지입니다.

| 값 | 동작 |
|---|---|
| `no` (기본) | 자동으로 다시 켜지 않음 |
| `always` | 항상 다시 켬. 직접 멈춰도 Docker가 재시작되면 다시 켜짐 |
| `unless-stopped` | 항상 다시 켜되, 직접 멈춘 것은 그대로 둠 |
| `on-failure` | 오류로 끝났을 때만 다시 켬 |

ts-wiki가 `unless-stopped`를 쓰는 이유: PC가 재부팅되어 Docker Desktop이 다시 켜지면 위키도 같이 켜지고, 점검하려고 `docker compose stop`으로 멈춘 경우에는 멋대로 켜지지 않게 하기 위해서입니다.

### up · ps · logs · down

```bash
docker compose up -d --build
```

```text
 Network mini_default  Creating
 Network mini_default  Created
 Container mini-wiki  Creating
 Container mini-wiki  Created
 Container mini-wiki  Starting
 Container mini-wiki  Started
```

- `up`은 이미지가 없으면 빌드하고, 컨테이너를 만들어 실행합니다.
- `--build`는 이미지가 있어도 **다시 빌드**합니다. 문서를 고친 뒤에는 꼭 붙입니다. 빼면 예전 이미지로 띄웁니다.
- `-d`는 백그라운드 실행입니다.
- `Network mini_default`는 Compose가 자동으로 만든 전용 네트워크입니다(폴더 이름 `mini` + `_default`). 같은 파일의 서비스끼리 이 네트워크로 통신합니다.

```bash
docker compose ps
```

```text
NAME        IMAGE            COMMAND                   SERVICE     CREATED         STATUS         PORTS
mini-wiki   mini-mini-wiki   "/docker-entrypoint.…"   mini-wiki   4 seconds ago   Up 2 seconds   0.0.0.0:8199->80/tcp
```

이미지 이름 `mini-mini-wiki`는 Compose가 "프로젝트 이름(폴더 이름) - 서비스 이름"으로 붙인 것입니다.

```bash
docker compose logs --tail 2
```

```text
mini-wiki  | 2026/10/28 00:16:27 [notice] 1#1: start worker process 40
mini-wiki  | 172.24.0.1 - - [28/Oct/2026:00:16:29 +0000] "GET / HTTP/1.1" 200 7504 "-" "curl/8.2.1" "-"
```

끄고 정리합니다.

```bash
docker compose down
```

```text
 Container mini-wiki  Stopping
 Container mini-wiki  Stopped
 Container mini-wiki  Removing
 Container mini-wiki  Removed
 Network mini_default  Removing
 Network mini_default  Removed
```

`down`은 컨테이너와 네트워크를 지웁니다. **이미지는 남깁니다**(다음에 빨리 띄우기 위해). 이미지까지 지우려면 `docker rmi mini-mini-wiki`를 따로 실행합니다.

| 하고 싶은 일 | 명령 |
|---|---|
| 처음 띄우기 / 문서 고친 뒤 다시 띄우기 | `docker compose up -d --build` |
| 상태 보기 | `docker compose ps` |
| 로그 보기 | `docker compose logs -f` |
| 잠시 멈추기(컨테이너는 남김) | `docker compose stop` |
| 끄고 정리 | `docker compose down` |

## ts-wiki에서는

**`Dockerfile`** (14줄)

| 줄 | 코드 | 설명 |
|---|---|---|
| 1 | `# 사내 서버에 위키를 ...` | 주석. 이 이미지의 용도 |
| 2 | `FROM node:22-alpine AS build` | 1단계: Node.js 22가 든 작은 리눅스에서 시작, 이름은 `build` |
| 3 | `# lastUpdated(마지막 수정 시각)를 ...` | 주석. 다음 줄이 왜 필요한지 |
| 4 | `RUN apk add --no-cache git` | Alpine의 패키지 관리자(`apk`)로 git 설치. `--no-cache`는 설치 목록 캐시를 이미지에 남기지 않아 크기를 줄임 |
| 5 | `WORKDIR /app` | 이후 명령은 컨테이너 안 `/app` 폴더에서 |
| 6 | `COPY package.json package-lock.json ./` | 패키지 목록만 먼저 복사(캐시를 위해) |
| 7 | `RUN npm ci` | `package-lock.json`에 적힌 버전 그대로 설치. `npm install`과 달리 lock 파일을 고치지 않음 |
| 8 | `COPY . .` | 나머지 소스 전체 복사(`.dockerignore`에 있는 것은 제외) |
| 9 | `RUN npm run build` | `vitepress build docs` → `/app/docs/.vitepress/dist` 생성 |
| 11 | `FROM nginx:1.27-alpine` | 2단계: 새로 nginx 이미지에서 시작. 1단계의 Node.js·git은 버려짐 |
| 12 | `COPY nginx.conf /etc/nginx/conf.d/default.conf` | 기본 사이트 설정을 ts-wiki 설정으로 교체([3-5](./05-nginx)) |
| 13 | `COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html` | 1단계의 빌드 결과만 nginx의 `root` 폴더로 |
| 14 | `EXPOSE 80` | 80번 포트를 쓴다는 표시. `CMD`는 nginx 이미지의 것을 물려받음 |

3~4번 줄은 나중에 추가된 것입니다. ts-wiki의 `config.mts`는 `lastUpdated: true`라서 VitePress가 빌드 중에 `git`을 실행해 파일마다 마지막 커밋 시각을 읽습니다. 그런데 `node:22-alpine`은 크기를 줄이려고 git을 넣지 않은 이미지라, 이 줄이 없을 때 컨테이너 안 빌드가 `spawn git ENOENT`(git이라는 프로그램을 찾을 수 없음)로 실패했습니다. 연습 프로젝트는 `lastUpdated`를 켜지 않아 git 없이도 빌드됐기 때문에 이 문제가 드러나지 않았습니다. **바탕 이미지에 무엇이 빠져 있는지**는 실제로 빌드해 봐야 알 수 있다는 좋은 예입니다.

::: info git이 있어도 시각이 정확하려면
`.dockerignore`에 `.git`이 들어 있어 컨테이너 안에는 git 이력이 없습니다. 이 경우 마지막 수정 시각이 실제 커밋 시각과 다를 수 있습니다(이 레슨에서 표시 값까지 확인하지는 않았습니다). GitHub Actions 배포 쪽은 `fetch-depth: 0`으로 전체 이력을 받아 이 문제를 피합니다([3-7](./07-github-actions)).
:::

Node.js 버전(22)은 GitHub Actions의 `node-version: 22`([3-7](./07-github-actions))와 맞춰져 있어, Docker 빌드와 Pages 빌드가 같은 Node.js 계열로 만들어집니다.

**`.dockerignore`** — `node_modules`(내 PC용 패키지), `docs/.vitepress/dist`·`cache`(컨테이너 안에서 새로 만들 것), `examples`(위키 빌드에 필요 없는 예제 코드), `.git`(이력)을 뺍니다.

**`docker-compose.yml`**

```yaml
services:
  ts-wiki:
    build: .
    container_name: ts-wiki
    ports:
      - "8090:80"
    restart: unless-stopped
```

내 PC의 8090번 → 컨테이너 80번(nginx `listen 80`)입니다. 그래서 [5분 만에 바로 띄우기](../guide/quickstart)의 방법 3이 `http://localhost:8090`으로 접속하는 것입니다. 이 가이드(wiki-server-guide)는 같은 구조에 포트만 8091을 씁니다. 같은 PC에서 둘을 동시에 띄우려면 왼쪽 포트가 달라야 하기 때문입니다.

## 자주 하는 실수

**1. Docker가 꺼져 있음**

- 증상: `error during connect: ... open //./pipe/docker_engine: The system cannot find the file specified.` (Windows) 또는 `Cannot connect to the Docker daemon` (macOS/Linux)
- 원인: Docker Desktop(엔진)이 실행 중이 아닙니다.
- 해결: Docker Desktop을 실행하고 고래 아이콘이 "running"이 될 때까지 기다립니다.

**2. 포트가 이미 쓰이고 있음**

- 증상: `Bind for 0.0.0.0:8090 failed: port is already allocated`
- 원인: 같은 포트를 쓰는 컨테이너(또는 다른 프로그램)가 이미 있습니다.
- 해결: `docker ps`로 그 포트를 쓰는 컨테이너를 찾아 정리하거나, 왼쪽 포트를 바꿉니다(`"8199:80"`).

**3. 같은 이름의 컨테이너가 있음**

- 증상: `Conflict. The container name "/mini" is already in use by container ...`
- 원인: 예전에 만든 같은 이름의 컨테이너가 멈춘 채 남아 있습니다(`docker ps`에는 안 보이고 `docker ps -a`에 보임).
- 해결: `docker rm mini`로 지운 뒤 다시 실행합니다.

**4. 문서를 고쳤는데 사이트가 그대로**

- 증상: `docker compose up -d` 후에도 옛 내용
- 원인: `--build`를 빼서 예전 이미지로 띄웠습니다.
- 해결: `docker compose up -d --build`로 다시 빌드합니다.

**5. 빌드가 오래 걸리고 `transferring context`가 수십 MB**

- 증상: 빌드 시작 부분에서 한참 멈춤, `transferring context: 100.55MB`
- 원인: `.dockerignore`가 없거나 `node_modules`가 빠져 있습니다.
- 해결: `.dockerignore`에 `node_modules`, 빌드 결과 폴더, `.git`을 넣습니다.

## 직접 해 보기

**과제 1 ⭐** 연습 프로젝트를 `docker build`로 이미지로 만들고, `docker run -d --name mini -p 8199:80`으로 띄워 브라우저에서 확인한 뒤 정리하세요.

::: details 힌트·정답 보기
```bash
docker build -t mini-wiki:1.0 .
docker run -d --name mini -p 8199:80 mini-wiki:1.0
docker ps
docker stop mini
docker rm mini
docker rmi mini-wiki:1.0
```
:::

**과제 2 ⭐** 마크다운 한 줄을 고치고 다시 빌드해, 어떤 단계가 `CACHED`인지 확인하세요. `package.json`의 `description`을 바꾸면 어떻게 달라지나요?

::: details 힌트·정답 보기
마크다운만 고치면 `npm ci`까지 `CACHED`이고 `COPY . .`부터 다시 실행됩니다. `package.json`을 바꾸면 `COPY package.json ...`의 입력이 바뀌어 `npm ci`부터 다시 실행됩니다.
:::

**과제 3 ⭐⭐** 같은 이미지로 컨테이너 두 개를 서로 다른 포트(8198, 8199)로 띄워 보세요.

::: details 힌트·정답 보기
`docker run -d --name mini1 -p 8198:80 mini-wiki:1.0`, `docker run -d --name mini2 -p 8199:80 mini-wiki:1.0`. 이미지 하나로 컨테이너를 여러 개 만들 수 있습니다. 이름과 왼쪽 포트만 달라야 합니다. 끝나면 둘 다 `stop`, `rm`.
:::

**과제 4 ⭐⭐** `docker-compose.yml`의 `restart`를 `unless-stopped`로 둔 채 `docker compose up -d`로 띄우고, Docker Desktop을 재시작해 컨테이너가 다시 켜지는지 확인하세요. 그다음 `docker compose stop` 후 재시작하면 어떻게 되나요?

::: details 힌트·정답 보기
처음에는 Docker가 다시 켜지면 컨테이너도 따라 켜집니다. 직접 `stop`한 뒤에는 Docker를 재시작해도 꺼진 채로 남습니다. 이것이 `unless-stopped`의 뜻입니다. 확인 후 `docker compose down`으로 정리합니다.
:::

**과제 5 ⭐⭐⭐** Dockerfile의 6~8번 줄 순서를 `COPY . .` → `RUN npm ci`로 바꾸고, 마크다운 한 줄을 고쳐 두 번 빌드해 시간을 비교하세요.

::: details 힌트·정답 보기
순서를 바꾸면 문서만 고쳐도 `RUN npm ci`가 매번 다시 실행되어 빌드가 그만큼(연습 프로젝트 기준 약 7초 이상) 느려집니다. 실험 후 원래 순서로 돌립니다.
:::

## 확인 퀴즈

**1.** 이미지와 컨테이너의 차이는?

::: details 정답 보기
이미지는 실행에 필요한 모든 것을 묶은 변하지 않는 틀이고, 컨테이너는 그 이미지를 실행한 것입니다. 이미지 하나로 컨테이너를 여러 개 만들 수 있습니다.
:::

**2.** `EXPOSE 80`만 있고 `-p`가 없으면 브라우저로 접속할 수 있나요?

::: details 정답 보기
아니요. `EXPOSE`는 문서용 표시일 뿐이고, 실제로 내 PC 포트와 연결하는 것은 `-p 8199:80`(Compose에서는 `ports`)입니다.
:::

**3.** ts-wiki 최종 이미지에 Node.js가 들어 있나요?

::: details 정답 보기
아니요. 멀티 스테이지 빌드라 최종 이미지는 `nginx:1.27-alpine`에서 시작하고, 빌드 단계에서 `dist`만 복사해 옵니다. 연습 프로젝트 기준 빌드 단계 300MB, 최종 49.3MB였습니다.
:::

**4.** `RUN`과 `CMD`는 각각 언제 실행되나요?

::: details 정답 보기
`RUN`은 이미지를 빌드할 때, `CMD`는 컨테이너가 시작될 때 실행됩니다.
:::

**5.** `docker compose down`은 이미지를 지우나요?

::: details 정답 보기
아니요. 컨테이너와 네트워크만 지웁니다. 이미지는 `docker rmi`로 따로 지웁니다.
:::

## 정리

- 이미지 = 변하지 않는 틀, 컨테이너 = 실행 중인 이미지, 레이어 = Dockerfile 명령 하나만큼의 변경분(캐시 단위)입니다.
- 잘 바뀌지 않는 것(`package.json` → `npm ci`)을 위에, 자주 바뀌는 것(`COPY . .`)을 아래에 두면 캐시가 잘 맞습니다.
- 멀티 스테이지 빌드로 Node.js는 빌드에만 쓰고, 최종 이미지는 nginx + `dist`(49.3MB)만 남깁니다.
- `.dockerignore`로 `node_modules`·`.git`을 빼면 컨텍스트가 100MB에서 2.41kB로 줄었습니다.
- `-p 내PC:컨테이너`로 포트를 연결하고, `-v`로 내 PC 파일이나 이름 있는 볼륨을 연결합니다.
- Compose는 `docker run` 옵션을 파일로 옮긴 것입니다. `up -d --build`로 띄우고 `down`으로 정리합니다.

## 다음 단계

[3-7. GitHub Actions와 Pages 배포 액션](./07-github-actions)에서 사람이 명령을 치지 않아도 `git push`만으로 빌드와 배포가 되는 방법을 봅니다.
