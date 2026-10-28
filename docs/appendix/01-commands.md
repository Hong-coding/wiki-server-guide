---
title: 명령어 모음
---

# 명령어 모음

이 가이드에 나오는 명령을 한곳에 모았습니다. **작성 시점(2026-10) Windows 11 PC에서 실제로 실행해 확인한 명령**이며, 버전은 Node 24.13.1, npm 11.8.0, git 2.42.0, Docker 25.0.3, Docker Compose v2.24.5입니다.

::: tip 표 읽는 법
- **Windows** 열은 PowerShell, **macOS/Linux** 열은 bash 기준입니다. 두 칸이 같으면 "같음"이라고 적었습니다.
- `<포트>`, `<PID>`, `<이름>`처럼 꺾쇠로 둘러싼 부분은 자기 값으로 바꿔 넣습니다(꺾쇠는 지웁니다).
- 표의 "확인" 열에서 ✅는 이 PC에서 실행해 확인한 명령, 🔎는 이 PC(Windows)에서 실행할 수 없어 각 도구의 공식 문서 기준으로 적은 명령입니다.
:::

## 터미널 기본

| 하고 싶은 것 | Windows (PowerShell) | macOS/Linux (bash) | 확인 |
|---|---|---|---|
| 지금 있는 폴더 보기 | `pwd` | `pwd` | ✅ |
| 폴더 이동 | `cd D:\workspace\ts-wiki` | `cd ~/workspace/ts-wiki` | ✅ |
| 파일 목록 | `ls` (또는 `dir`) | `ls -al` | ✅ |
| 폴더 만들기 | `mkdir 이름` | `mkdir -p 이름` | ✅ |
| 폴더 통째로 지우기 | `Remove-Item -Recurse -Force 이름` | `rm -rf 이름` | ✅ |
| 파일 내용 보기 | `Get-Content 파일` (`cat`도 됨) | `cat 파일` | ✅ |
| 직전 명령의 성공 여부(0이면 성공) | `$LASTEXITCODE` | `echo $?` | ✅ |
| 실행 중인 명령 멈추기 | `Ctrl+C` | `Ctrl+C` | ✅ |

## Node.js · npm

| 하고 싶은 것 | 명령 (Windows·macOS/Linux 같음) | 설명 | 확인 |
|---|---|---|---|
| Node 버전 | `node -v` | 예: `v24.13.1` | ✅ |
| npm 버전 | `npm -v` | 예: `11.8.0` | ✅ |
| 새 프로젝트 시작 | `npm init -y` | `package.json`을 기본값으로 만듭니다 | ✅ |
| 의존성 설치(개발 중) | `npm install` | `package.json` 기준 설치, `package-lock.json` 갱신 가능 | ✅ |
| 의존성 설치(정확히 재현) | `npm ci` | `package-lock.json` 그대로 설치. CI·Docker용 | ✅ |
| 개발용 패키지 추가 | `npm install -D vitepress@1.6.3` | `@버전`으로 버전 지정 | ✅ |
| 스크립트 목록 보기 | `npm run` | `package.json`의 `scripts` 목록 | ✅ |
| 스크립트 실행 | `npm run dev`, `npm run build` | `scripts`에 적힌 명령 실행 | ✅ |
| 설치된 패키지 보기 | `npm ls --depth=0` | 맨 위 의존성만 | ✅ |
| 특정 패키지 버전 확인 | `npm ls vitepress` | 누가 어떤 버전을 끌고 왔는지까지 | ✅ |
| 새 버전 확인 | `npm outdated` | Current/Wanted/Latest 비교. 오래된 것이 있으면 종료 코드 1 | ✅ |
| 알려진 취약점 검사 | `npm audit` | 보안 권고 목록 | ✅ |
| 레지스트리 주소 확인 | `npm config get registry` | 기본값 `https://registry.npmjs.org/` | ✅ |
| 설치 없이 도구 실행 | `npx tsc -v` | 프로젝트에 설치된 도구를 실행 | ✅ |

## VitePress

| 하고 싶은 것 | 명령 (같음) | 설명 | 확인 |
|---|---|---|---|
| 개발 서버 | `npx vitepress dev docs` | 기본 포트 5173. 저장하면 바로 반영 | ✅ |
| 개발 서버(포트·외부 접속 지정) | `npx vitepress dev docs --host 0.0.0.0 --port 5190` | 포트가 사용 중이면 `Port 5190 is in use, trying another one...` 후 다음 포트로 | ✅ |
| 빌드 | `npx vitepress build docs` | 결과물: `docs/.vitepress/dist` | ✅ |
| 빌드 결과 미리보기 | `npx vitepress preview docs --port 5196` | 포트가 사용 중이면 `EADDRINUSE`로 종료(다른 포트로 안 옮김) | ✅ |
| 버전 확인 | `npm ls vitepress` | `npx vitepress --version`은 1.6.3에서 개발 서버까지 켜므로 비추천 | ✅ |
| ts-wiki 개발 서버 | `npm run dev` | `vitepress dev docs --host 0.0.0.0 --port 5180` | ✅ |
| 이 가이드 개발 서버 | `npm run dev` | 포트 5181 | ✅ |

## TypeScript 타입 검사

| 하고 싶은 것 | 명령 (같음) | 설명 | 확인 |
|---|---|---|---|
| tsc 버전 | `npx tsc -v` | 예: `Version 5.6.3` | ✅ |
| tsconfig 기준 검사만 | `npx tsc -p .` | `noEmit`이면 파일을 만들지 않음. 오류 없으면 아무 출력 없음 | ✅ |
| 파일 지정 검사 | `npx tsc --strict --noEmit 파일.ts` | tsconfig 없이 빠르게 검사 | ✅ |

## Git

| 하고 싶은 것 | 명령 (같음) | 설명 | 확인 |
|---|---|---|---|
| 버전 | `git --version` | 예: `git version 2.42.0.windows.1` | ✅ |
| 저장소 만들기 | `git init -b main` | 기본 브랜치 이름을 main으로 | ✅ |
| 내려받기 | `git clone <주소> <폴더>` | 원격 저장소 복사 | ✅ |
| 상태 보기(짧게) | `git status --short` | `M` 수정, `??` 새 파일, `A` 추가됨 | ✅ |
| 바뀐 내용 보기 | `git diff` | `-` 지운 줄, `+` 새 줄 | ✅ |
| 단어 단위 비교 | `git diff --word-diff` | `[-옛-]{+새+}` | ✅ |
| 바뀐 파일·줄 수 요약 | `git diff --stat` | | ✅ |
| 커밋 준비 | `git add .` | 모든 변경을 올림 | ✅ |
| 커밋 | `git commit -m "docs: 레슨 수정"` | | ✅ |
| 이력 보기 | `git log --oneline` | 한 줄씩 | ✅ |
| 원격 주소 보기 | `git remote -v` | | ✅ |
| 최신 받기 | `git pull` | 이미 최신이면 `Already up to date.` | ✅ |
| 올리기 | `git push` | ts-wiki는 main에 push하면 Pages 자동 배포 | 🔎 |
| 지금 브랜치 | `git branch --show-current` | | ✅ |
| 새 브랜치로 이동 | `git switch -c practice` | | ✅ |
| 줄바꿈 다시 맞추기 | `git add --renormalize .` | `.gitattributes`를 추가한 뒤 실행 | ✅ |
| 고친 파일 되돌리기 | `git restore 파일` | 커밋 전 변경을 버림(되돌릴 수 없음, 주의) | ✅ |

## Docker

| 하고 싶은 것 | 명령 (같음) | 설명 | 확인 |
|---|---|---|---|
| 버전 | `docker --version` | 예: `Docker version 25.0.3` | ✅ |
| 이미지 만들기 | `docker build -t <이미지이름> .` | 현재 폴더의 `Dockerfile` 사용 | ✅ |
| 컨테이너 실행 | `docker run -d --name <이름> -p 8192:80 <이미지이름>` | `-d` 백그라운드, `-p 내PC포트:컨테이너포트` | ✅ |
| 실행 중 목록 | `docker ps` | 꺼진 것까지: `docker ps -a` | ✅ |
| 이미지 목록 | `docker images` | | ✅ |
| 로그 보기 | `docker logs --tail 20 <이름>` | 계속 보기: `-f` | ✅ |
| 컨테이너 안에서 명령 | `docker exec <이름> ls /usr/share/nginx/html` | Git Bash에서는 아래 주의 참고 | ✅ |
| nginx 설정 검사 | `docker exec <이름> nginx -t` | `syntax is ok`, `test is successful` | ✅ |
| 멈추기 | `docker stop <이름>` | | ✅ |
| 컨테이너 지우기 | `docker rm <이름>` | 멈춘 뒤에 | ✅ |
| 이미지 지우기 | `docker rmi <이미지이름>` | | ✅ |

::: warning Git Bash에서 docker exec 경로가 바뀌는 문제
Windows의 Git Bash에서 `docker exec <이름> ls /usr/share/nginx/html`을 실행하면 경로가 `C:/Program Files/Git/usr/share/nginx/html`로 바뀌어 `No such file or directory`가 납니다(실제 확인). Git Bash가 `/`로 시작하는 인자를 Windows 경로로 바꾸기 때문입니다. 명령 앞에 `MSYS_NO_PATHCONV=1`을 붙이거나 PowerShell에서 실행하세요.

```bash
MSYS_NO_PATHCONV=1 docker exec <이름> ls /usr/share/nginx/html
```
:::

## Docker Compose

`docker-compose.yml`이 있는 폴더에서 실행합니다.

| 하고 싶은 것 | 명령 (같음) | 설명 | 확인 |
|---|---|---|---|
| 버전 | `docker compose version` | 예: `Docker Compose version v2.24.5-desktop.1` | ✅ |
| 빌드하고 백그라운드로 띄우기 | `docker compose up -d --build` | 글을 고친 뒤에도 이 명령으로 다시 반영 | ✅ |
| 상태 보기 | `docker compose ps` | `STATUS`가 `Up`이면 실행 중 | ✅ |
| 로그 보기 | `docker compose logs --tail 20` | 계속 보기: `-f` | ✅ |
| 다시 시작 | `docker compose restart` | 이미지는 다시 만들지 않음 | ✅ |
| 끄고 지우기 | `docker compose down` | 컨테이너·네트워크 삭제(이미지는 남음) | ✅ |
| ts-wiki 띄우기 | `docker compose up -d --build` | `http://localhost:8090` | 🔎 |

## 포트 확인 · 프로세스 종료

"포트가 이미 사용 중"일 때 쓰는 명령입니다. **PID**(Process ID)는 실행 중인 프로그램마다 붙는 번호입니다.

| 하고 싶은 것 | Windows (PowerShell) | macOS/Linux (bash) | 확인 |
|---|---|---|---|
| 포트를 듣는 프로그램 찾기 | `Get-NetTCPConnection -LocalPort <포트> -State Listen` | `lsof -i :<포트>` | ✅ / 🔎 |
| 포트 찾기(옛 방식) | `netstat -ano \| findstr :<포트>` | `ss -ltnp \| grep <포트>` | ✅ / 🔎 |
| PID로 프로그램 정보 보기 | `Get-Process -Id <PID>` | `ps -p <PID> -o pid,command` | ✅ / 🔎 |
| PID로 실행 명령줄 보기 | `(Get-CimInstance Win32_Process -Filter "ProcessId=<PID>").CommandLine` | `ps -p <PID> -o command` | ✅ / 🔎 |
| 프로그램 종료 | `Stop-Process -Id <PID>` | `kill <PID>` | ✅ / 🔎 |
| 강제 종료 | `taskkill /PID <PID> /F` | `kill -9 <PID>` | ✅ / 🔎 |
| 응답 확인(상태 코드만) | `curl.exe -s -o NUL -w "%{http_code}" http://localhost:<포트>/` | `curl -s -o /dev/null -w "%{http_code}" http://localhost:<포트>/` | ✅ / ✅ |

::: details 응답 확인 명령을 복사하기 쉽게 보기
```powershell
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8190/
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8190/
```

`200`이 나오면 서버가 정상 응답한 것입니다.
:::

::: danger 종료하기 전에 무엇인지 확인하세요
포트를 쓰는 프로그램이 **내가 띄운 것인지** 먼저 확인하고 종료합니다. 작성 중에도 포트 5190을 다른 작업이 쓰고 있어 개발 서버가 다른 포트로 옮겨 간 일이 있었습니다. `Get-CimInstance ...CommandLine`으로 명령줄을 보면 어떤 폴더의 무슨 프로그램인지 알 수 있습니다.
:::

### 실제 예: 포트 5196의 미리보기 서버 찾아서 끄기

```powershell
Get-NetTCPConnection -LocalPort 5196 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
```

```text
LocalAddress LocalPort OwningProcess
------------ --------- -------------
::                5196         16024
```

```powershell
taskkill /PID 16024 /F
```

```text
SUCCESS: The process with PID 16024 has been terminated.
```

PID 값은 실행할 때마다 다릅니다.

## 다음 단계

명령에 나온 단어가 낯설면 [용어 사전](./02-glossary)을, 명령이 실패하면 [자주 묻는 질문](./03-faq)과 [문제 해결](../part6-serve/06-troubleshooting)을 보세요.
