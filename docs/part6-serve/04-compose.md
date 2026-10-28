---
title: '서버에 상시 띄우기: Docker Compose'
---

# 서버에 상시 띄우기: Docker Compose

<LessonMeta level="실전" :minutes="45" prev="Dockerfile로 이미지를 빌드하고 docker run으로 컨테이너를 띄웠습니다" />

## 이번에 배울 것

- ts-wiki의 `docker-compose.yml`을 한 줄씩 읽고, `docker run` 옵션과 어떻게 대응하는지 설명할 수 있다.
- `docker compose up -d --build` / `ps` / `logs` / `down`으로 위키를 켜고, 상태를 보고, 끌 수 있다.
- 재시작 정책 `unless-stopped`가 언제 다시 켜 주고 언제 안 켜 주는지 실제로 확인할 수 있다.
- 문서를 고친 뒤 재배포하는 절차와, 서버 PC를 재부팅해도 위키가 다시 뜨기 위한 조건을 설명할 수 있다.
- 포트를 바꿔 띄울 수 있다.

## 먼저 알아 둘 것

- [Docker 이미지로 묶기](./03-docker-nginx)의 Dockerfile과 `docker run` 옵션
- [Docker와 Docker Compose](../part3-libraries/06-docker)의 Compose 개념

## 비유로 이해하기

6-3의 `docker run -d --name wsg-test -p 8190:80 wsg-test`는 **매번 전화로 주문 내용을 불러 주는 것**과 같습니다. 이름, 포트, 이미지를 하나라도 빠뜨리면 다른 결과가 나옵니다.

Docker Compose는 **단골 가게에 맡겨 둔 주문서**입니다. 주문서(`docker-compose.yml`)에 "이 레시피로 만들어서, 이 이름으로, 이 창구(포트)에, 가게가 문 열면 자동으로 준비"까지 적어 두면, 이후에는 "늘 하던 걸로요"(`docker compose up -d`) 한마디면 됩니다. 주문서는 저장소에 들어 있으므로 다른 사람도 똑같이 주문할 수 있습니다.

재시작 정책 `unless-stopped`는 주문서의 특약 사항입니다. "주방에 문제가 생겨 멈추면 다시 만들어 주세요. 단, 제가 **직접 그만하라고 한** 경우는 빼고요."

## 따라 하기

### 1단계. docker-compose.yml 한 줄씩 읽기

ts-wiki의 `docker-compose.yml` 전체입니다.

```yaml
services:
  ts-wiki:
    build: .
    container_name: ts-wiki
    ports:
      - "8090:80"
    restart: unless-stopped
```

| 줄 | 내용 | `docker run`으로 치면 |
|---|---|---|
| 1 | `services:` | 이 파일이 띄울 서비스(컨테이너) 목록의 시작 |
| 2 | `ts-wiki:` | 서비스 이름. `docker compose logs ts-wiki`처럼 부를 때 씁니다. |
| 3 | `build: .` | 현재 폴더의 Dockerfile로 이미지를 만듭니다 = `docker build .` |
| 4 | `container_name: ts-wiki` | = `--name ts-wiki`. 없으면 `폴더이름-서비스이름-1` 같은 이름이 자동으로 붙습니다. |
| 5~6 | `ports: - "8090:80"` | = `-p 8090:80`. 내 PC 8090 → 컨테이너 80 |
| 7 | `restart: unless-stopped` | = `--restart unless-stopped`. 3단계에서 자세히 봅니다. |

포트를 따옴표(`"8090:80"`)로 감싼 이유: YAML은 `숫자:숫자`를 60진수 시간 같은 다른 값으로 해석할 수 있어서, Compose 공식 문서도 포트를 문자열로 쓰기를 권합니다.

### 2단계. 실습용 compose 파일 만들기

원본의 8090번 포트와 `ts-wiki`라는 컨테이너 이름은 이미 켜 둔 위키와 부딪힐 수 있으므로, 6-1 복사본 폴더에 **실습용 파일**을 따로 만듭니다. 이미지는 6-3에서 읽은 ts-wiki `Dockerfile`(git 설치 줄 포함)로 그대로 빌드합니다.

복사본 폴더에 `compose.test.yml`로 저장합니다.

```yaml
services:
  ts-wiki:
    build: .
    container_name: wsg-compose
    ports:
      - "8191:80"
    restart: unless-stopped
```

- `build: .`는 원본과 같습니다. 다른 이름의 Dockerfile을 쓰고 싶다면 `build:` 아래에 `context: .`(빌드 컨텍스트 폴더)와 `dockerfile: 파일이름`을 풀어 씁니다.
- 포트는 `8191:80`, 컨테이너 이름은 `wsg-compose`로 바꿨습니다.

**포트 바꾸기**는 이것이 전부입니다. `ports`의 **앞 숫자만** 바꿉니다. 뒤의 `80`은 컨테이너 안 nginx가 듣는 번호(`nginx.conf`의 `listen 80`)이므로 그대로 둡니다.

### 3단계. 켜기: `docker compose up -d --build`

```bash
docker compose -f compose.test.yml -p wsg up -d --build
```

| 부분 | 뜻 |
|---|---|
| `-f compose.test.yml` | 사용할 compose 파일. 생략하면 `docker-compose.yml`(또는 `compose.yaml`)을 찾습니다. |
| `-p wsg` | 프로젝트 이름. 생략하면 폴더 이름을 씁니다. 네트워크·이미지 이름 앞에 붙습니다. |
| `up` | 필요한 것을 만들고 켭니다. |
| `-d` | 백그라운드 실행. 터미널을 돌려줍니다. |
| `--build` | 켜기 전에 이미지를 **다시 빌드**합니다. 이것이 없으면 예전에 만든 이미지가 있을 때 그대로 씁니다. |

원본 ts-wiki 폴더라면 `-f`와 `-p` 없이 `docker compose up -d --build`만 쓰면 됩니다.

실제 출력(빌드 로그 다음 부분):

```text
 Network wsg_default  Creating
 Network wsg_default  Created
 Container wsg-compose  Creating
 Container wsg-compose  Created
 Container wsg-compose  Starting
 Container wsg-compose  Started
```

- `wsg_default` 네트워크: Compose가 프로젝트마다 전용 가상 네트워크를 만듭니다. 서비스가 여러 개일 때 서로 이름으로 부를 수 있게 하려는 것입니다.
- 작성 시점 Docker Compose 버전은 `v2.24.5-desktop.1`이었습니다(`docker compose version`).

### 4단계. 상태 보기: `ps`

```bash
docker compose -f compose.test.yml -p wsg ps
```

실제 출력:

```text
NAME          IMAGE         COMMAND                   SERVICE   CREATED         STATUS         PORTS
wsg-compose   wsg-ts-wiki   "/docker-entrypoint.…"   ts-wiki   4 seconds ago   Up 2 seconds   0.0.0.0:8191->80/tcp
```

- `IMAGE`가 `wsg-ts-wiki` — `프로젝트이름-서비스이름`으로 이미지 이름이 자동으로 붙었습니다.
- `STATUS`가 `Up`이면 실행 중, `Exited`면 꺼진 상태, `Restarting`이면 계속 죽었다 살아나는 중입니다.
- `PORTS`의 `0.0.0.0:8191->80/tcp` — 이 PC의 모든 주소 8191번이 컨테이너 80번으로 연결되었습니다. 같은 네트워크의 다른 PC도 `http://<이 PC의 IP>:8191`로 접속할 수 있습니다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8191/guide/roadmap
```

```text
200
```

**확인 방법**: `STATUS`가 `Up`이고 curl이 200이면 성공입니다.

### 5단계. 로그 보기: `logs`

```bash
docker compose -f compose.test.yml -p wsg logs --tail 5
```

실제 출력:

```text
wsg-compose  | 2026/10/28 02:06:32 [notice] 1#1: start worker process 37
wsg-compose  | 2026/10/28 02:06:32 [notice] 1#1: start worker process 38
wsg-compose  | 2026/10/28 02:06:32 [notice] 1#1: start worker process 39
wsg-compose  | 2026/10/28 02:06:32 [notice] 1#1: start worker process 40
wsg-compose  | <접속한 IP> - - [28/Oct/2026:02:06:35 +0000] "GET /guide/roadmap HTTP/1.1" 200 74249 "-" "curl/8.2.1" "-"
```

- 앞 4줄: nginx가 시작하며 요청을 처리할 작업자(worker) 프로세스를 띄운 기록입니다.
- 마지막 줄: 방금 curl로 보낸 요청의 접속 기록(access log)입니다.
- `--tail 5`는 마지막 5줄만, `-f`를 붙이면 새 로그를 계속 따라가며 보여 줍니다(`Ctrl+C`로 빠져나옵니다. 컨테이너는 꺼지지 않습니다).

### 6단계. 재시작 정책 `unless-stopped` 실험

재시작 정책(restart policy)은 "컨테이너가 꺼졌을 때 Docker가 다시 켜 줄지"를 정합니다.

| 정책 | 프로그램이 스스로 죽었을 때 | 내가 `stop`한 뒤 Docker가 다시 시작될 때 |
|---|---|---|
| `no` (기본값) | 안 켬 | 안 켬 |
| `on-failure` | 실패(종료 코드 0이 아님)일 때만 켬 | 안 켬 |
| `always` | 켬 | **켬** |
| `unless-stopped` | 켬 | 안 켬 |

`always`와 `unless-stopped`의 차이는 "내가 일부러 껐다"를 존중하느냐입니다. 점검하려고 꺼 뒀는데 PC 재부팅 뒤 멋대로 켜지면 곤란하므로 ts-wiki는 `unless-stopped`를 골랐습니다. (표의 규칙은 Docker 공식 문서 기준이며, 아래 두 경우는 작성 중 직접 확인했습니다.)

**실험 A. 컨테이너 안의 nginx가 스스로 꺼지면**

컨테이너 안에서 nginx에게 종료 신호를 보내 "프로그램이 스스로 꺼진" 상황을 만듭니다.

```bash
docker exec wsg-compose nginx -s stop
docker ps -a --filter name=wsg-compose --format "{{.Names}} {{.Status}}"
docker inspect wsg-compose --format "RestartCount={{.RestartCount}}"
```

실제 출력(4초 뒤):

```text
wsg-compose Up 3 seconds
RestartCount=1
```

nginx가 꺼지면서 컨테이너도 끝났지만, Docker가 바로 다시 켜서 `Up 3 seconds`가 되었고 재시작 횟수가 1이 되었습니다.

**실험 B. 내가 직접 멈추면**

```bash
docker compose -f compose.test.yml -p wsg stop
docker ps -a --filter name=wsg-compose --format "{{.Names}} {{.Status}}"
```

실제 출력:

```text
 Container wsg-compose  Stopping
 Container wsg-compose  Stopped
wsg-compose Exited (0) Less than a second ago
```

이번에는 다시 켜지지 않고 `Exited (0)` 상태로 남았습니다. 다시 켜려면 `start`를 씁니다.

```bash
docker compose -f compose.test.yml -p wsg start
```

```text
 Container wsg-compose  Starting
 Container wsg-compose  Started
```

### 7단계. 서버 PC를 재부팅해도 다시 뜨려면

`unless-stopped`는 "**Docker가 시작될 때**, 내가 멈추지 않은 컨테이너를 다시 켠다"입니다. 그러니 재부팅 후 위키가 뜨려면 다음이 모두 맞아야 합니다.

1. **Docker 자체가 자동으로 시작되어야 합니다.**
   - Windows/macOS의 Docker Desktop: 설정(Settings) → General → "Start Docker Desktop when you sign in to your computer"가 켜져 있어야 합니다. Docker Desktop은 **사용자가 로그인해야** 시작되는 프로그램이므로, 재부팅 후 아무도 로그인하지 않으면 위키도 뜨지 않습니다.
   - Linux 서버의 Docker Engine: `sudo systemctl enable docker`로 부팅 시 자동 시작을 켭니다(Docker 공식 문서 기준). 로그인 없이도 뜹니다.
2. **재부팅 전에 컨테이너가 `Up` 상태였어야 합니다.** `docker compose stop`으로 멈춰 둔 상태였다면 다시 켜지지 않습니다(실험 B).
3. **`docker compose down`으로 지우지 않았어야 합니다.** `down`은 컨테이너 자체를 삭제하므로 재시작할 대상이 없습니다.
4. **포트를 다른 프로그램이 먼저 차지하지 않아야 합니다.** 부팅 중 다른 프로그램이 8090을 먼저 잡으면 컨테이너가 시작에 실패합니다.

::: warning 사내 서버 PC로 쓸 때
Windows PC를 위키 서버로 쓴다면 자동 로그인, 절전 모드 해제, Windows 업데이트 후 자동 재부팅 같은 설정도 영향을 줍니다. 이런 설정은 PC 관리 정책과 관련되므로 담당자와 상의해서 정합니다. 오래 켜 둘 서버라면 Linux + Docker Engine이 더 다루기 쉽습니다([서버 운영에 필요한 리눅스 기초](../part7-server-learning/05-linux-basics)).
:::

**확인 방법**: 재부팅 후 로그인(Docker Desktop의 경우)하고 1~2분 뒤 `docker ps`에 컨테이너가 `Up`으로 보이면 성공입니다. 이 가이드 작성 중에는 PC 재부팅 실험은 하지 않았습니다.

### 8단계. 문서를 고친 뒤 재배포하기

이미지에는 빌드한 순간의 `dist`가 담겨 있으므로, 문서를 고쳤으면 **이미지를 다시 빌드하고 컨테이너를 새 이미지로 바꿔야** 합니다. Compose에서는 켤 때와 같은 명령 한 줄이면 됩니다.

```bash
# 1) 서버 PC에서 최신 문서 받기 (git으로 관리하는 경우)
git pull

# 2) 다시 빌드하고 바뀐 컨테이너만 교체
docker compose up -d --build

# 3) 확인
docker compose ps
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8090/
```

- `--build`가 이미지를 새로 만들고, Compose는 이미지가 바뀐 것을 보고 컨테이너를 **새로 만들어 교체**합니다(이때 몇 초 동안 접속이 끊깁니다).
- 6-3 실험 B에서 본 것처럼 `package.json`이 그대로면 `npm ci`는 캐시로 건너뛰고 위키 빌드만 다시 합니다.
- `--build`를 빠뜨리면 예전 이미지로 다시 켜지므로 **고친 내용이 반영되지 않습니다.** 가장 흔한 실수입니다.

빌드를 반복하면 이름 없는(`<none>`) 옛 이미지가 쌓입니다. 가끔 정리합니다.

```bash
docker image prune
```

이 명령은 지우기 전에 확인을 묻습니다. 어떤 컨테이너도 쓰지 않는 이름 없는 이미지만 지우지만, 다른 프로젝트의 것도 대상이 될 수 있으니 목록을 확인하고 진행합니다.

### 9단계. 끄고 정리하기: `down`

```bash
docker compose -f compose.test.yml -p wsg down
```

실제 출력:

```text
 Container wsg-compose  Stopping
 Container wsg-compose  Stopped
 Container wsg-compose  Removing
 Container wsg-compose  Removed
 Network wsg_default  Removing
 Network wsg_default  Removed
```

`down`은 컨테이너와 네트워크를 지웁니다. **이미지는 남깁니다.** 실습이 끝났으면 이미지도 지웁니다.

```bash
docker rmi wsg-ts-wiki
```

```text
Untagged: wsg-ts-wiki:latest
Deleted: sha256:99e93723226224948a9721cff3cc8b0c88b992bf1580d21a75fbb6a46df3e3fa
```

| 명령 | 컨테이너 | 네트워크 | 이미지 | 재부팅 후 |
|---|---|---|---|---|
| `stop` | 멈춤(남음) | 남음 | 남음 | 안 켜짐 |
| `down` | 삭제 | 삭제 | 남음 | 안 켜짐 |
| `down` + `docker rmi` | 삭제 | 삭제 | 삭제 | 안 켜짐 |

**확인 방법**: `docker ps -a --filter name=wsg-compose`와 `docker images wsg-ts-wiki`가 비어 있으면 정리된 것입니다.

## ts-wiki에서는

- `docker-compose.yml` 3번째 줄 `build: .` — 이미지를 레지스트리(Docker Hub 같은 이미지 저장소)에서 받지 않고 그 자리에서 빌드합니다. 사내 서버에 저장소만 받아 두면 별도 이미지 저장소 없이 운영할 수 있게 하려는 선택입니다.
- 4번째 줄 `container_name: ts-wiki` — 이름을 고정해 `docker logs ts-wiki`처럼 기억하기 쉽게 했습니다. 대신 같은 PC에서 이 compose를 두 벌 띄울 수 없습니다(이름 충돌). 실습에서 `wsg-compose`로 바꾼 이유입니다.
- 6번째 줄 `"8090:80"` — 개발 서버(5180)와 다른 번호대를 써서 "8090은 상시 서버, 5180은 작성 중 화면"으로 구분합니다. 이 가이드 자체는 8091을 씁니다.
- 7번째 줄 `restart: unless-stopped` — 서버 PC가 재부팅돼도 다시 뜨되, 점검하려고 멈춘 것은 존중합니다.
- `README.md`의 "서버에 상시 띄우기 (Docker)" 절은 문서를 고친 뒤 **같은 명령으로 다시 빌드**하라고 안내합니다. 8단계의 `--build`가 그 이유입니다.
- compose의 `build: .`는 같은 폴더의 `Dockerfile`을 부르므로, `up -d --build`의 빌드 로그는 6-3과 똑같습니다. 빌드 중 `spawn git ENOENT`가 나오면 Dockerfile의 git 설치 줄(3~4번째 줄)이 빠졌는지 봅니다([6-3](./03-docker-nginx) 5단계).

## 자주 하는 실수

**1. 문서를 고쳤는데 반영이 안 된다**

- 증상: `docker compose up -d` 후에도 예전 내용.
- 원인: `--build` 없이 실행해 예전 이미지를 그대로 썼습니다. Compose는 컨테이너 설정이 같으면 이미 실행 중인 컨테이너를 그대로 둡니다.
- 해결: `docker compose up -d --build`. 그래도 브라우저에 예전 내용이면 강력 새로 고침(`Ctrl+F5`)이나 `curl`로 확인합니다.

**2. 재부팅했더니 위키가 안 뜬다**

- 증상: `http://<서버 IP>:8090` 연결 실패, `docker ps`에서 `error during connect` 또는 컨테이너가 없음.
- 원인: Docker Desktop이 자동 시작되지 않았거나(로그인 안 함 포함), 재부팅 전에 `stop`/`down`을 해 두었습니다.
- 해결: Docker Desktop 자동 시작 설정 확인 → `docker compose up -d`. 7단계의 조건을 점검합니다.

**3. 포트를 바꿨는데 접속이 안 된다**

- 증상: `ports: - "80:8191"`로 고친 뒤 `localhost:8191` 실패.
- 원인: 앞뒤를 바꿨습니다. 앞이 내 PC, 뒤가 컨테이너(nginx의 `listen 80`)입니다.
- 해결: `"8191:80"`. 바꾼 뒤 `docker compose up -d`(Compose가 설정 변경을 보고 컨테이너를 다시 만듭니다).

**4. 다른 폴더에서 명령을 쳐서 `no configuration file provided: not found`**

- 증상: 작성 중 빈 폴더에서 `docker compose ps`를 실행하면 실제로 이 메시지가 나왔습니다.
- 원인: Compose는 **현재 폴더**에서 `docker-compose.yml`을 찾습니다.
- 해결: `cd`로 위키 폴더에 들어가거나 `-f 경로/docker-compose.yml`을 줍니다.

## 직접 해 보기

**⭐ 과제 1.** `compose.test.yml`로 위키를 띄우고 `ps`, `logs --tail 3`을 본 뒤 `down`과 `docker rmi`로 정리하세요.

::: details 정답 보기
```bash
docker compose -f compose.test.yml -p wsg up -d --build
docker compose -f compose.test.yml -p wsg ps
docker compose -f compose.test.yml -p wsg logs --tail 3
docker compose -f compose.test.yml -p wsg down
docker rmi wsg-ts-wiki
```
:::

**⭐ 과제 2.** 포트를 8192로 바꿔 띄우고, `ps`의 `PORTS` 칸이 어떻게 바뀌는지 확인하세요.

::: details 정답 보기
`ports`를 `"8192:80"`으로 고치고 `up -d`를 하면 Compose가 설정이 바뀐 것을 보고 컨테이너를 새로 만들며, `PORTS`가 `0.0.0.0:8192->80/tcp`로 바뀝니다.
:::

**⭐⭐ 과제 3.** 6단계 실험 A·B를 직접 해 보고, `restart`를 `"no"`로 바꾸면 실험 A의 결과가 어떻게 달라지는지 확인하세요.

::: details 힌트
`restart: "no"`처럼 따옴표가 필요합니다(YAML에서 맨글자 `no`는 거짓(false)으로 해석될 수 있습니다). Docker 공식 문서의 정책 설명대로라면 nginx가 꺼진 뒤 `Exited (0)`으로 남고 다시 켜지지 않아야 합니다. 직접 확인해 보세요.
:::

**⭐⭐ 과제 4.** 마크다운 한 파일을 고친 뒤 `--build` 없이 `up -d`, 그다음 `--build`를 붙여 `up -d`를 해 보고 차이를 `curl`로 확인하세요.

::: details 정답 보기
`--build` 없이는 컨테이너가 그대로 유지되고 내용도 그대로입니다. `--build`를 붙이면 위키 빌드가 다시 돌고 컨테이너가 새 이미지로 교체되어 새 내용이 나옵니다.
:::

**⭐⭐⭐ 과제 5.** 서버 PC 재부팅 후에도 위키가 뜨는지 점검표를 만들어 보세요(Docker 자동 시작, 로그인, 컨테이너 상태, 포트, 방화벽).

::: details 힌트
7단계 1~4번에 "다른 PC에서 접속하려면 방화벽이 8090을 허용하는가"(6-1)를 더합니다. 각 항목에 "확인 명령"을 붙이면 좋습니다. 예:

```bash
docker ps
docker inspect ts-wiki --format "{{.HostConfig.RestartPolicy.Name}}"
```
:::

## 확인 퀴즈

**1.** `docker compose up -d`와 `docker compose up -d --build`의 차이는?

::: details 정답 보기
`--build`는 켜기 전에 이미지를 다시 빌드합니다. 없으면 이미 있는 이미지를 그대로 씁니다. 문서를 고친 뒤에는 `--build`가 필요합니다.
:::

**2.** `unless-stopped`인 컨테이너를 `docker compose stop`으로 멈춘 뒤 PC를 재부팅하면?

::: details 정답 보기
다시 켜지지 않습니다. "내가 직접 멈춘 것"은 존중하기 때문입니다.
:::

**3.** `down`과 `stop`의 차이는?

::: details 정답 보기
`stop`은 컨테이너를 멈추기만 하고 남겨 둡니다(`start`로 다시 켤 수 있음). `down`은 컨테이너와 네트워크를 삭제합니다. 둘 다 이미지는 남깁니다.
:::

**4.** Windows PC의 Docker Desktop에서 재부팅 후 위키가 자동으로 뜨려면 무엇이 필요한가요?

::: details 정답 보기
Docker Desktop 자동 시작 설정이 켜져 있고, 사용자가 로그인해야 하며, 재부팅 전 컨테이너가 실행 중(`Up`)이었어야 합니다.
:::

## 정리

- `docker-compose.yml`은 `docker build` + `docker run --name -p --restart`를 파일 하나에 적어 둔 것입니다.
- 켜기/재배포: `docker compose up -d --build`, 상태: `ps`, 기록: `logs`, 끄기: `stop`(남김) / `down`(삭제).
- `restart: unless-stopped`는 스스로 꺼지면 다시 켜고, 내가 멈춘 것은 그대로 둡니다(작성 중 실험으로 확인).
- 재부팅 후 자동으로 뜨려면 **Docker 자체가 자동 시작**되어야 하고(Docker Desktop은 로그인 필요), 컨테이너가 `Up` 상태였어야 합니다.
- 포트는 `ports`의 앞 숫자만 바꿉니다. 뒤의 80은 nginx가 듣는 번호입니다.
- 문서를 고쳤는데 그대로면 `--build`를 빠뜨렸는지부터 봅니다.

## 다음 단계

[GitHub Pages 자동 배포](./05-github-pages) — 서버 PC 없이, `git push` 한 번으로 GitHub가 빌드해서 인터넷에 공개하는 방법을 ts-wiki의 실제 배포 과정으로 따라갑니다.
