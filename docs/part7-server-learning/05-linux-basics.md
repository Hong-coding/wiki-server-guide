---
title: 서버 운영에 필요한 리눅스 기초
---

# 서버 운영에 필요한 리눅스 기초

<LessonMeta level="실전" :minutes="60" prev="nginx를 리버스 프록시로 세워 Node 서버 앞에 두고, HTTPS 발급 절차를 정리했습니다." />

## 이번에 배울 것

- Docker로 Ubuntu·Alpine 리눅스 컨테이너를 띄워 실습 환경을 만들 수 있다.
- 파일·디렉터리를 만들고, 보고, 옮기고, 지우는 기본 명령을 쓸 수 있다.
- `ls -l`의 권한 표시(`rwx`)를 읽고 `chmod`로 바꿀 수 있다.
- `ps`·`kill`로 프로세스를, `ss`로 포트를, `tail -f`로 로그를 확인할 수 있다.
- 패키지 설치(`apt`, `apk`), systemd 서비스 파일, SSH 접속이 무엇인지 설명할 수 있다.

## 먼저 알아 둘 것

- [Docker와 Docker Compose](../part3-libraries/06-docker) — `docker run`, 이미지·컨테이너
- 터미널에서 명령을 치고 Enter를 누르는 것. 그 이상은 이 레슨에서 다룹니다.

## 비유로 이해하기

리눅스 서버는 **창문 없는 기계실**입니다. 화면도 마우스도 없고, 문틈으로 쪽지(명령)를 넣으면 쪽지(출력)가 나옵니다.

- **파일·디렉터리 명령**은 기계실의 서랍과 서류철을 다루는 법입니다.
- **권한**은 서랍마다 붙은 자물쇠입니다. 누가 열어 볼 수 있고, 누가 고칠 수 있는지 정합니다.
- **프로세스**는 기계실에서 돌고 있는 기계 하나하나, **포트**는 기계마다 연결된 전화 회선 번호입니다.
- **로그**는 기계가 남기는 작업 일지입니다. 문제가 생기면 일지부터 봅니다.
- **SSH**는 멀리서 그 기계실 문틈에 쪽지를 넣는 안전한 통로입니다.

진짜 서버를 빌리지 않아도, Docker 컨테이너 하나가 이 기계실 역할을 충분히 해 줍니다. 망가뜨려도 지우고 다시 띄우면 됩니다.

## 따라 하기

### 1단계. 실습용 리눅스 띄우기

Ubuntu 24.04 컨테이너에 들어갑니다. `-it`는 "키보드로 대화하듯 쓰겠다", `--rm`은 "나오면 컨테이너를 지워라"라는 뜻입니다. PowerShell과 bash에서 명령이 같습니다.

```bash
docker run -it --rm --name lab-ubuntu ubuntu:24.04 bash
```

프롬프트가 `root@<컨테이너 ID>:/#`처럼 바뀌면 리눅스 안에 들어온 것입니다. 나올 때는 `exit`를 입력합니다.

```bash
cat /etc/os-release | head -2
whoami
pwd
```

```text
PRETTY_NAME="Ubuntu 24.04.5 LTS"
NAME="Ubuntu"
root
/root
```

- `cat`은 파일 내용을 출력합니다. `|`(파이프)는 앞 명령의 출력을 뒤 명령의 입력으로 넘기고, `head -2`는 앞 2줄만 보여 줍니다.
- `whoami`는 지금 사용자 이름입니다. `root`는 무엇이든 할 수 있는 관리자 계정입니다. 컨테이너 실습에서는 편해서 root로 하지만, 실제 서버에서는 평소에 root로 일하지 않습니다(아래 권한 단계 참고).
- `pwd`(print working directory)는 지금 있는 폴더입니다. 리눅스에서는 폴더를 **디렉터리**라고 부르고, 구분자는 `\`가 아니라 `/`입니다.

**확인 방법**: `PRETTY_NAME`에 Ubuntu가 보이면 성공입니다. 이 레슨의 출력은 작성 시점(2026-10)에 `ubuntu:24.04` 이미지에서 실제로 실행한 결과입니다.

### 2단계. 파일과 디렉터리 다루기

```bash
mkdir -p wiki/docs && cd wiki && pwd
echo "# 한빛 카페 위키" > docs/index.md
ls -l docs
cat docs/index.md
```

```text
/root/wiki
total 4
-rw-r--r-- 1 root root 23 Oct 28 00:10 index.md
# 한빛 카페 위키
```

```bash
cp docs/index.md docs/about.md && mv docs/about.md docs/intro.md && ls docs
rm docs/intro.md && ls docs
ls -la
```

```text
index.md
intro.md
index.md
total 12
drwxr-xr-x 3 root root 4096 Oct 28 00:10 .
drwx------ 1 root root 4096 Oct 28 00:10 ..
drwxr-xr-x 2 root root 4096 Oct 28 00:10 docs
```

| 명령 | 뜻 | Windows PowerShell에서 비슷한 것 |
|---|---|---|
| `pwd` | 지금 위치 | `Get-Location` (`pwd`도 동작) |
| `ls -l`, `ls -la` | 목록(자세히, 숨김 파일 포함) | `Get-ChildItem` (`ls`, `dir`) |
| `cd 경로` | 이동. `cd ..`는 한 단계 위, `cd ~`는 홈 | `cd` |
| `mkdir -p a/b` | 디렉터리 만들기(`-p`: 중간 것까지) | `mkdir` |
| `echo "글" > 파일` | 파일에 쓰기(덮어쓰기). `>>`는 이어 쓰기 | `"글" > 파일` |
| `cat 파일` | 내용 보기 | `Get-Content` (`cat`) |
| `cp`, `mv`, `rm` | 복사, 이동·이름 바꾸기, 삭제 | `Copy-Item`, `Move-Item`, `Remove-Item` |

- `&&`는 "앞 명령이 성공하면 뒤 명령 실행"입니다.
- `ls -la`의 `.`은 현재 디렉터리, `..`은 상위 디렉터리입니다. 이름이 `.`으로 시작하는 파일(`.env`, `.gitignore`)은 **숨김 파일**이라 `-a`를 붙여야 보입니다.

::: danger `rm`에는 휴지통이 없습니다
리눅스의 `rm`은 지운 파일을 되살릴 방법이 기본으로 없습니다. 특히 `rm -rf`(하위까지 묻지 않고 전부 삭제)는 경로를 두 번 확인한 뒤에만 씁니다. 실제 서버에서는 지우기 전에 `ls`로 대상을 먼저 봅니다.
:::

### 3단계. 권한 읽고 바꾸기

`ls -l`의 맨 앞 10글자가 권한입니다.

```text
-rw-r--r-- 1 root root 23 Oct 28 00:10 index.md
│└┬┘└┬┘└┬┘   │    │
│ │  │  │    │    └ 그룹(group)
│ │  │  │    └ 주인(owner)
│ │  │  └ 그 밖의 모든 사람(others): r-- 읽기만
│ │  └ 그룹: r-- 읽기만
│ └ 주인: rw- 읽기·쓰기
└ 종류: - 파일, d 디렉터리
```

- `r`(read) 읽기, `w`(write) 쓰기, `x`(execute) 실행. 디렉터리에서 `x`는 "안으로 들어갈 수 있음"입니다.
- 숫자로도 씁니다. r=4, w=2, x=1을 더해 주인·그룹·기타 순서로 적습니다. `644` = `rw-r--r--`, `600` = `rw-------`, `755` = `rwxr-xr-x`.

```bash
chmod 600 docs/index.md && ls -l docs/index.md
chmod 644 docs/index.md && ls -l docs/index.md
```

```text
-rw------- 1 root root 23 Oct 28 00:10 docs/index.md
-rw-r--r-- 1 root root 23 Oct 28 00:10 docs/index.md
```

일반 사용자를 만들어 root의 파일을 읽어 봅니다.

```bash
useradd -m wikiuser && su wikiuser -c "cat /root/wiki/docs/index.md"
ls -ld /root
```

```text
cat: /root/wiki/docs/index.md: Permission denied
drwx------ 1 root root 4096 Oct 28 00:10 /root
```

파일은 `644`(누구나 읽기 가능)인데도 거절되었습니다. 이유는 **경로 위의 디렉터리** `/root`가 `drwx------`, 즉 주인(root) 말고는 들어갈 수(`x`) 없기 때문입니다. 권한 문제는 파일 하나만 보지 말고 경로의 모든 디렉터리를 함께 봐야 합니다.

::: tip 서버에서 권한을 정하는 원칙
- 서버 프로그램은 **전용 일반 사용자**로 실행합니다. ubuntu의 nginx 작업 프로세스가 `www-data` 사용자로 도는 것이 그 예입니다(아래 4단계 출력). 프로그램이 뚫려도 root 권한까지 넘어가지 않게 하려는 것입니다.
- `.env`, 인증서 개인 키처럼 비밀이 든 파일은 `600`(주인만 읽기·쓰기)으로 둡니다.
- 권한 에러가 날 때 `chmod 777`(누구나 모든 것 가능)로 "해결"하지 않습니다. 원인(어느 사용자가 어느 경로에 무엇을 하려는가)을 찾습니다.
:::

### 4단계. 패키지 설치와 프로세스·포트

Ubuntu 이미지는 크기를 줄이려고 많은 도구를 빼 두었습니다. 포트를 보는 `ss`도 없습니다.

```bash
ss -tlnp
```

```text
bash: ss: command not found
```

없는 도구는 **패키지 관리자**로 설치합니다. Ubuntu는 `apt`, Alpine은 `apk`입니다. nginx도 함께 설치해 "서버 프로세스 하나"를 직접 관찰해 봅니다.

```bash
apt-get update -qq
apt-get install -y -qq nginx curl iproute2 procps
nginx -v
which nginx curl ss
```

```text
nginx version: nginx/1.24.0 (Ubuntu)
/usr/sbin/nginx
/usr/bin/curl
/usr/bin/ss
```

- `apt-get update`는 "설치 가능한 패키지 목록"을 새로 받습니다. 설치 전에 한 번 합니다. `-qq`는 출력을 줄이는 옵션, `-y`는 "설치할까요?"에 자동으로 예라고 답하는 옵션입니다.
- `iproute2`에 `ss`가, `procps`에 `ps`가 들어 있습니다.
- Ubuntu 저장소의 nginx는 1.24.0이었습니다. ts-wiki가 쓰는 공식 이미지 `nginx:1.27-alpine`(1.27.5)과 버전이 다릅니다. **배포판 저장소 버전은 배포판이 정합니다.** 서버마다 버전이 다를 수 있다는 점을 기억해 둡니다.
- `which`는 명령의 실제 파일 위치를 알려 줍니다.

nginx를 띄우고 프로세스와 포트를 봅니다.

```bash
nginx
ps aux | grep [n]ginx
```

```text
root      2653  0.0  0.0  11164   972 ?        Ss   00:12   0:00 nginx: master process nginx
www-data  2654  0.0  0.0  11536  2680 ?        S    00:12   0:00 nginx: worker process
www-data  2655  0.0  0.0  11536  2680 ?        S    00:12   0:00 nginx: worker process
...
```

- `ps aux`는 모든 프로세스를 보여 줍니다. 두 번째 열이 **PID**(프로세스 번호)입니다.
- `grep [n]ginx`는 "nginx가 들어간 줄만"입니다. `[n]`으로 감싸는 것은 `grep` 명령 자기 자신이 결과에 섞이지 않게 하는 요령입니다.
- master 프로세스(root)가 80번 포트를 열고, 실제 요청은 worker 프로세스(`www-data`)가 처리합니다.

```bash
ss -tlnp
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/nope
```

```text
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
LISTEN 0      511          0.0.0.0:80        0.0.0.0:*    users:(("nginx",pid=2653,fd=5))
LISTEN 0      511             [::]:80           [::]:*    users:(("nginx",pid=2653,fd=6))
200
404
```

- `ss -tlnp`: `t` TCP, `l` 기다리는(LISTEN) 것만, `n` 이름 대신 숫자로, `p` 어느 프로세스인지. **"이 포트를 누가 잡고 있나"** 를 볼 때 가장 먼저 쓰는 명령입니다.
- `0.0.0.0:80`은 "모든 네트워크 주소의 80번", `[::]:80`은 같은 뜻의 IPv6 표기입니다. `127.0.0.1:80`이었다면 이 기계 안에서만 접속할 수 있다는 뜻입니다.

### 5단계. 로그 보기

```bash
ls -l /var/log/nginx/
tail -n 2 /var/log/nginx/access.log
```

```text
total 4
-rw-r----- 1 www-data adm 174 Oct 28 00:12 access.log
-rw-r----- 1 www-data adm   0 Oct 28 00:12 error.log
127.0.0.1 - - [28/Oct/2026:00:12:23 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/8.5.0"
127.0.0.1 - - [28/Oct/2026:00:12:23 +0000] "GET /nope HTTP/1.1" 404 162 "-" "curl/8.5.0"
```

- 리눅스 프로그램의 로그는 보통 `/var/log/` 아래에 있습니다.
- `tail -n 2`는 마지막 2줄입니다. 로그는 새 줄이 아래에 쌓이므로 끝부터 봅니다.

**실시간으로 따라 보기**: `tail -f`는 파일 끝에 새 줄이 생기면 계속 출력합니다. 장애를 볼 때 가장 많이 쓰는 명령입니다. 끝낼 때는 `Ctrl+C`입니다.

```bash
tail -f /var/log/nginx/access.log
```

다른 터미널에서 요청을 보내면 그 즉시 줄이 늘어납니다. 작성 시에는 `tail -f`를 켜 둔 채 `/live-1`, `/live-2`를 요청해 다음과 같이 확인했습니다.

```text
127.0.0.1 - - [28/Oct/2026:00:12:23 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/8.5.0"
127.0.0.1 - - [28/Oct/2026:00:12:23 +0000] "GET /nope HTTP/1.1" 404 162 "-" "curl/8.5.0"
127.0.0.1 - - [28/Oct/2026:00:12:24 +0000] "GET /live-1 HTTP/1.1" 404 162 "-" "curl/8.5.0"
127.0.0.1 - - [28/Oct/2026:00:12:24 +0000] "GET /live-2 HTTP/1.1" 404 162 "-" "curl/8.5.0"
```

::: info 컨테이너 안에서 두 번째 터미널 열기
PC에서 터미널을 하나 더 열고 `docker exec -it lab-ubuntu bash`를 실행하면 같은 컨테이너에 하나 더 들어갈 수 있습니다.
:::

### 6단계. 프로세스 끄기

```bash
cat /run/nginx.pid
kill $(cat /run/nginx.pid)
ps aux | grep [n]ginx || echo "nginx 프로세스 없음"
ss -tlnp
```

```text
2653
nginx 프로세스 없음
State Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
```

- 많은 서버 프로그램은 자기 PID를 파일(여기서는 `/run/nginx.pid`)에 적어 둡니다.
- `kill PID`는 프로세스에 **종료 요청 신호(SIGTERM)** 를 보냅니다. 프로그램은 정리할 시간을 갖고 스스로 끝납니다. 응답하지 않을 때만 `kill -9 PID`(SIGKILL, 강제 종료)를 씁니다. 강제 종료는 저장 중인 데이터를 망가뜨릴 수 있습니다.
- `$(...)`는 괄호 안 명령의 출력을 그 자리에 넣습니다.
- `||`는 "앞 명령이 실패하면 뒤 명령 실행"입니다.

### 7단계. 서버 상태 한눈에 보기

```bash
df -h / | head -2
free -h
uptime
```

```text
Filesystem      Size  Used Avail Use% Mounted on
overlay        1007G  9.4G  947G   1% /
               total        used        free      shared  buff/cache   available
Mem:           7.6Gi       1.7Gi       5.2Gi        61Mi       1.1Gi       5.9Gi
Swap:          2.0Gi          0B       2.0Gi
 00:12:28 up 1 day, 38 min,  0 user,  load average: 0.53, 0.67, 0.49
```

- `df -h`: 디스크 남은 공간. **로그가 쌓여 디스크가 꽉 차는 것**은 서버 장애의 단골 원인입니다.
- `free -h`: 메모리. `available`이 실제로 더 쓸 수 있는 양입니다.
- `uptime`: 켜진 지 얼마나 됐는지와 부하(load average, 1·5·15분 평균으로 대기 중인 작업 수). 컨테이너는 PC(Docker의 가상 머신)의 값을 함께 보여 줍니다.

### 8단계. Alpine 리눅스는 조금 다릅니다

ts-wiki의 이미지는 Alpine 기반(`node:22-alpine`, `nginx:1.27-alpine`)입니다. Alpine은 아주 작은 리눅스라 몇 가지가 다릅니다.

```bash
docker run --rm alpine:3.20 sh -c 'head -2 /etc/os-release; which bash || echo "bash 없음"; apk add --no-cache curl | tail -1; id'
```

```text
NAME="Alpine Linux"
ID=alpine
bash 없음
OK: 13 MiB in 24 packages
uid=0(root) gid=0(root) groups=0(root),1(bin),2(daemon),3(sys),4(adm),6(disk),10(wheel),11(floppy),20(dialout),26(tape),27(video)
```

| 항목 | Ubuntu | Alpine |
|---|---|---|
| 기본 셸 | `bash` | `sh`(BusyBox). `bash`가 없습니다. |
| 패키지 설치 | `apt-get update && apt-get install -y 이름` | `apk add --no-cache 이름` |
| 이미지 크기(작성 시점 실측) | `ubuntu:24.04` 78.2MB | `alpine:3.20` 7.81MB |

그래서 Alpine 컨테이너에 들어갈 때는 `docker exec -it 컨테이너 sh`처럼 `bash` 대신 `sh`를 씁니다.

실습이 끝나면 `exit`로 나옵니다. `--rm`으로 띄웠으므로 컨테이너는 자동으로 지워집니다. `docker ps -a`로 남은 것이 없는지 확인합니다.

## 개념 설명: 실제 서버에서 만나는 것

컨테이너에는 없지만 실제 리눅스 서버(가상 머신, 클라우드 서버)에서는 반드시 만나는 것들입니다.

### systemd와 서비스 파일

실제 서버에서는 프로그램을 터미널에서 직접 띄우지 않고 **systemd**(리눅스의 서비스 관리자, 부팅 때 가장 먼저 뜨는 프로세스)에게 맡깁니다. systemd는 서버를 부팅 때 자동으로 켜고, 죽으면 다시 켜고, 로그를 모아 줍니다.

컨테이너 안에는 systemd가 없어서 이렇게 나옵니다.

```text
$ systemctl status nginx
bash: systemctl: command not found
$ journalctl -u nginx
bash: journalctl: command not found
```

7-3의 Express 서버를 systemd 서비스로 등록한다면 `/etc/systemd/system/hanbit-wiki.service` 파일을 이렇게 씁니다(**개념 예시이며 이 가이드에서 실행하지 않았습니다**).

```ini
[Unit]
Description=Hanbit wiki (Express)
After=network.target

[Service]
User=wikiuser
WorkingDirectory=/srv/hanbit-wiki
Environment=PORT=8194
ExecStart=/usr/bin/node app.ts dist
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

- `User=wikiuser`: root가 아닌 전용 사용자로 실행합니다(3단계 원칙).
- `Restart=on-failure`: 비정상 종료하면 3초(`RestartSec`) 뒤 다시 켭니다. Docker의 `restart` 옵션과 같은 역할입니다.
- `WantedBy=multi-user.target`: 부팅 때 자동 시작 대상에 넣습니다.

자주 쓰는 명령(공식 문서 기준):

```bash
sudo systemctl daemon-reload          # 서비스 파일을 새로 읽기
sudo systemctl enable --now hanbit-wiki   # 부팅 시 자동 시작 + 지금 시작
systemctl status hanbit-wiki          # 상태
sudo systemctl restart hanbit-wiki    # 재시작
journalctl -u hanbit-wiki -f          # 이 서비스의 로그를 실시간으로 (tail -f와 같은 역할)
```

`sudo`는 "이 명령만 관리자 권한으로"라는 뜻입니다. 평소에는 일반 사용자로 일하고, 필요한 순간에만 `sudo`를 붙입니다. `journalctl`은 systemd가 모아 둔 로그(저널)를 보는 명령입니다. 서비스의 `console.log` 출력도 여기에 모입니다.

### SSH 접속

실제 서버는 멀리 있으므로 **SSH**(Secure Shell, 암호화된 원격 터미널)로 접속합니다. Windows 10 이후와 macOS·Linux에는 `ssh` 명령이 들어 있습니다.

```bash
ssh <사용자>@<서버 주소>
```

- 처음 접속하면 서버의 지문(fingerprint)을 믿을지 묻습니다. 서버 관리자에게 받은 값과 같은지 확인하고 `yes`를 입력합니다.
- 비밀번호 대신 **키 쌍**(공개 키·개인 키)으로 로그인하는 것이 일반적입니다. `ssh-keygen`으로 키를 만들고, 공개 키(`.pub`)만 서버에 등록합니다. 개인 키는 내 PC 밖으로 내보내지 않습니다.
- 서버 쪽에서는 root 직접 로그인·비밀번호 로그인을 막아 두는 것이 보안 기본입니다(7-6 체크리스트).
- 파일을 옮길 때는 `scp 파일 <사용자>@<서버 주소>:경로`를 씁니다.

::: warning 접속 정보 관리
서버 주소·계정·키 파일은 메신저나 공개 저장소에 붙여 넣지 않습니다. 회사 서버라면 접속 권한은 담당 부서의 절차에 따라 받습니다.
:::

## ts-wiki에서는

ts-wiki의 Docker 파일에는 이번 레슨의 리눅스 지식이 그대로 쓰입니다.

- `Dockerfile` 5번 줄 `WORKDIR /app`: 이후 명령을 `/app` 디렉터리에서 실행합니다. `mkdir -p /app && cd /app`과 같은 효과입니다.
- `Dockerfile` 13번 줄 `COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html`: 리눅스 경로(`/`로 구분)로 파일을 복사합니다. `/usr/share/nginx/html`은 nginx 공식 이미지의 기본 문서 폴더입니다.
- `nginx.conf` 4번 줄 `root /usr/share/nginx/html;`: 위 경로를 서비스합니다.
- `.gitattributes` 1번 줄 `* text=auto eol=lf`: 줄바꿈을 LF(리눅스 방식)로 통일합니다. Windows의 CRLF 줄바꿈이 섞인 셸 스크립트는 리눅스에서 `\r: command not found` 같은 에러를 내기 때문입니다.

실행 중인 ts-wiki 컨테이너(`docker compose up -d`로 띄운 `ts-wiki`) 안도 같은 방법으로 들여다볼 수 있습니다. Alpine 기반이므로 `bash`가 아니라 `sh`로 들어갑니다(읽기만 하고 아무것도 바꾸지 않습니다). 아래는 ts-wiki와 같은 베이스 이미지 `nginx:1.27-alpine`을 새로 띄워 확인한 결과입니다(ts-wiki 컨테이너라면 `/usr/share/nginx/html`에 위키 파일이 보입니다).

```bash
docker run -d --name lab-nginx nginx:1.27-alpine
docker exec lab-nginx sh -c 'ls /usr/share/nginx/html; ps aux | head -4; ls -l /var/log/nginx'
docker exec lab-nginx bash
docker rm -f lab-nginx
```

```text
50x.html
index.html
PID   USER     TIME  COMMAND
    1 root      0:00 nginx: master process nginx -g daemon off;
   30 nginx     0:00 nginx: worker process
   31 nginx     0:00 nginx: worker process
total 0
lrwxrwxrwx    1 root     root            11 Apr 16  2025 access.log -> /dev/stdout
lrwxrwxrwx    1 root     root            11 Apr 16  2025 error.log -> /dev/stderr
OCI runtime exec failed: exec failed: unable to start container process: exec: "bash": executable file not found in $PATH: unknown
```

- Alpine의 `ps`(BusyBox)는 Ubuntu와 열 구성이 다릅니다. 작업 프로세스 사용자가 `www-data`가 아니라 `nginx`입니다.
- master 프로세스가 PID 1입니다. 컨테이너에서는 주 프로그램이 PID 1이 되고, **PID 1이 끝나면 컨테이너도 끝납니다.** `daemon off;`는 nginx가 뒤로 숨지 말고 앞에서 계속 돌라는 옵션입니다.
- 공식 nginx 이미지의 `access.log`·`error.log`는 화면 출력(`/dev/stdout`, `/dev/stderr`)으로 연결된 **링크**(`l`, `->`)입니다. 그래서 컨테이너 로그는 파일이 아니라 `docker logs ts-wiki`로 봅니다(7-4에서 `docker logs lab-proxy`로 본 방식).

## 자주 하는 실수

1. **증상**: `bash: ss: command not found`(또는 `ps`, `curl`, `vim`)
   **원인**: 최소 이미지라 도구가 설치되어 있지 않습니다.
   **해결**: Ubuntu는 `apt-get update && apt-get install -y iproute2`, Alpine은 `apk add --no-cache iproute2`. 패키지 이름이 명령 이름과 다를 수 있으므로 "명령 이름 + 패키지"로 검색합니다.
2. **증상**: `Permission denied`
   **원인**: 파일 자체 또는 **경로 위 디렉터리**의 권한이 없습니다.
   **해결**: `ls -l 파일`과 `ls -ld 상위디렉터리`를 차례로 봅니다. `chmod 777`로 덮지 않습니다.
3. **증상**: `docker exec -it 컨테이너 bash`에서 `executable file not found`
   **원인**: Alpine 기반 컨테이너라 bash가 없습니다.
   **해결**: `sh`로 들어갑니다.
4. **증상**: `nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)`
   **원인**: 이미 다른 프로세스(대개 먼저 띄운 nginx)가 80번을 잡고 있습니다.
   **해결**: `ss -tlnp`로 누가 잡고 있는지 보고, 그 PID를 `kill`합니다.
5. **증상**: 셸 스크립트를 실행하면 `$'\r': command not found`
   **원인**: Windows에서 CRLF 줄바꿈으로 저장되었습니다.
   **해결**: 에디터에서 줄바꿈을 LF로 바꾸거나, ts-wiki처럼 `.gitattributes`로 LF를 강제합니다.

## 직접 해 보기

### 과제 1 ⭐ 권한 숫자 연습

`docs/index.md`를 "주인만 읽기·쓰기, 그룹은 읽기, 기타는 아무것도 못함"으로 바꾸고 `ls -l`로 확인해 보세요.

::: details 정답 보기
`chmod 640 docs/index.md` → `-rw-r-----`. 주인 rw(4+2=6), 그룹 r(4), 기타 없음(0).
:::

### 과제 2 ⭐ 포트 주인 찾기

Ubuntu 컨테이너에서 nginx를 띄운 뒤, `ss`만으로 80번 포트를 잡은 프로세스의 PID를 알아내고 그 PID로 끄세요.

::: details 정답 보기
`ss -tlnp`의 `users:(("nginx",pid=2653,...))`에서 PID를 읽고 `kill 2653`. 다시 `ss -tlnp`에 80번이 없으면 성공입니다(PID 번호는 실행할 때마다 다릅니다).
:::

### 과제 3 ⭐⭐ 로그에서 404만 골라내기

nginx 접속 로그에서 상태 코드가 404인 줄만 출력하고, 몇 줄인지 세어 보세요.

::: details 정답 보기
```bash
grep '" 404 ' /var/log/nginx/access.log
grep -c '" 404 ' /var/log/nginx/access.log
```
`-c`는 줄 수만 셉니다. 로그 형식에서 상태 코드는 요청 문자열의 닫는 따옴표 바로 뒤에 옵니다.
:::

### 과제 4 ⭐⭐ 전용 사용자로 서버 띄우기

`wikiuser`를 만들고, `/srv/site/index.html`을 `wikiuser`만 쓸 수 있고 다른 사람은 읽을 수만 있게 준비해 보세요(`chown`, `chmod` 사용).

::: details 정답 보기
```bash
useradd -m wikiuser
mkdir -p /srv/site
echo "hello" > /srv/site/index.html
chown -R wikiuser:wikiuser /srv/site
chmod 755 /srv/site
chmod 644 /srv/site/index.html
ls -l /srv/site
```
`chown 사용자:그룹`은 주인을 바꿉니다. `su wikiuser -c "echo hi >> /srv/site/index.html"`은 성공하고, 다른 사용자로는 실패해야 합니다.
:::

### 과제 5 ⭐⭐⭐ Node 서버를 리눅스 컨테이너 안에서 띄우기

`node:22-alpine` 컨테이너에 7-3의 `express-server` 폴더를 마운트해 서버를 띄우고, 컨테이너 안에서 `ps`·`netstat` 또는 `ss`로 프로세스와 포트를 확인해 보세요.

::: details 힌트
`docker run -it --rm -p 8194:8194 -v <express-server 폴더>:/app -w /app node:22-alpine sh`로 들어갑니다. Windows에서 설치한 `node_modules`는 대부분 그대로 쓸 수 있지만, 네이티브 모듈이 있으면 컨테이너 안에서 `npm ci`를 다시 해야 합니다. 그리고 Node 22에서 `node app.ts`가 되는지는 버전에 따라 다르므로(7-2 참고), 안 되면 `npx tsx app.ts`를 씁니다. 다른 터미널에서 `docker exec -it <컨테이너> sh`로 들어가 `ps aux`를 봅니다.
:::

## 확인 퀴즈

1. `-rwxr-x---`를 숫자로 쓰면 무엇입니까?
2. 파일 권한이 `644`인데도 다른 사용자가 읽지 못할 수 있는 이유는 무엇입니까?
3. "8194번 포트를 누가 쓰고 있나"를 리눅스에서 확인하는 명령은 무엇입니까?
4. `kill PID`와 `kill -9 PID`의 차이는 무엇입니까?
5. systemd 서비스 파일의 `Restart=on-failure`는 Docker의 어떤 설정과 비슷합니까?

::: details 정답 보기
1. `750`입니다(rwx=7, r-x=5, ---=0).
2. 경로 위의 디렉터리에 그 사용자의 실행(`x`) 권한이 없으면 들어갈 수 없기 때문입니다.
3. `ss -tlnp`입니다(macOS에서는 `lsof -i :8194`).
4. `kill`은 SIGTERM(정리하고 끝내라는 요청), `kill -9`는 SIGKILL(즉시 강제 종료)을 보냅니다.
5. `docker run --restart on-failure` 또는 Compose의 `restart:` 설정입니다.
:::

## 정리

- Docker 컨테이너(`docker run -it --rm ubuntu:24.04 bash`)는 망가뜨려도 되는 리눅스 실습장입니다.
- 파일·디렉터리: `pwd`, `ls -la`, `cd`, `mkdir -p`, `cat`, `cp`, `mv`, `rm`. `rm`에는 휴지통이 없습니다.
- 권한은 주인·그룹·기타의 `rwx`이고 숫자(644, 600, 755)로도 씁니다. 경로 위 디렉터리 권한까지 함께 봅니다.
- 프로세스는 `ps aux`, 포트는 `ss -tlnp`, 로그는 `tail -f`, 종료는 `kill`. 상태는 `df -h`, `free -h`, `uptime`.
- 실제 서버에서는 systemd(`systemctl`, `journalctl`)로 서비스를 관리하고, SSH 키로 접속합니다.
- Alpine은 `sh`와 `apk`를 쓰며, ts-wiki 이미지가 Alpine 기반입니다.

## 다음 단계

[운영 기본기: 로그 · 재시작 · 백업 · 보안](./06-ops) — 서버를 "띄우는 것"에서 "계속 잘 돌게 하는 것"으로 넘어갑니다. 재시작 정책을 실험하고, 백업·업데이트 절차와 보안 체크리스트를 정리합니다.
