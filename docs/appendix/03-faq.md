---
title: 자주 묻는 질문
---

# 자주 묻는 질문

이 가이드를 따라 하며 자주 나오는 질문을 모았습니다. 각 질문 아래 **짧은 답**을 먼저 쓰고, 자세한 설명이 있는 레슨을 연결했습니다. 버전·정책 관련 답은 작성 시점(2026-10) 기준입니다.

## 시작·설치

### Q1. Node.js는 몇 버전을 설치해야 하나요?

ts-wiki `README.md` 기준 **Node.js 20 이상**이 필요하고, 이 가이드는 22 이상을 권장합니다. ts-wiki의 `Dockerfile`과 GitHub Actions도 Node 22로 빌드합니다. 작성 PC는 Node 24.13.1에서 문제없이 동작했습니다. 확인은 `node -v`. 자세히: [준비물 설치](../part0-start/03-setup)

### Q2. `npm install`과 `npm ci`는 뭐가 다른가요?

`npm install`은 `package.json`을 보고 설치하면서 `package-lock.json`을 갱신할 수 있습니다. `npm ci`는 `package-lock.json`에 적힌 버전을 **정확히 그대로** 설치하고, 기존 `node_modules`를 지운 뒤 새로 깝니다. 내 PC에서 개발할 때는 `install`, Docker·GitHub Actions처럼 "항상 같은 결과"가 필요한 곳에서는 `ci`를 씁니다. ts-wiki의 `Dockerfile`과 `deploy.yml`이 모두 `npm ci`입니다. 자세히: [package.json과 npm 스크립트](../part4-anatomy/02-package-json)

### Q3. 설치할 때 `npm audit`을 실행하라는 안내가 나옵니다. 문제인가요?

설치한 패키지 중 알려진 보안 권고가 있다는 뜻입니다. 작성 시점에 vitepress 1.6.3 + vue 3.5.13 조합으로 설치하면 vue 계열 권고가 표시되었습니다. 정적 사이트는 운영 중에 서버 코드를 돌리지 않으므로 위험도가 다를 수 있지만, **단정하지 말고** `npm audit`으로 내용을 읽은 뒤 버전을 올리고 빌드로 확인하세요. 자세히: [왜 VitePress인가](../part2-choices/02-why-vitepress)

## 개발 서버

### Q4. `npm run dev`를 했는데 주소가 5180이 아니라 5181로 떠요.

5180 포트를 이미 다른 프로그램(다른 터미널에서 켜 둔 개발 서버 등)이 쓰고 있어서, VitePress 개발 서버가 `Port 5180 is in use, trying another one...`을 출력하고 다음 빈 포트로 옮긴 것입니다. 터미널에 찍힌 `Local:` 주소로 접속하거나, 포트를 쓰는 프로그램을 찾아 끄세요. 찾는 법: [명령어 모음](./01-commands)의 "포트 확인·프로세스 종료"

### Q5. 다른 PC나 휴대폰에서 내 개발 서버에 접속이 안 돼요.

세 가지를 확인합니다. (1) `--host 0.0.0.0`으로 띄웠는지(ts-wiki의 `npm run dev`는 이미 붙어 있음), (2) 주소가 `http://<이 PC의 IP>:5180`인지(`localhost`는 그 기기 자신을 뜻하므로 다른 기기에서는 안 됨), (3) Windows 방화벽이 Node.js의 연결을 막고 있지 않은지. 자세히: [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host)

### Q6. `npx vitepress --version`을 쳤더니 서버가 켜졌어요.

작성 시점 VitePress 1.6.3에서 실제로 확인한 동작입니다. 버전 줄을 보여 준 뒤 기본 명령인 개발 서버를 켭니다(포트 5173). `Ctrl+C`로 끄고, 버전은 `npm ls vitepress`로 확인하세요.

## 빌드

### Q7. 빌드하면 `Element is missing end tag`가 나와요.

본문에 꺾쇠(`<`, `>`)가 들어간 표현을 맨글자로 써서 Vue가 HTML 태그로 읽은 것입니다. `Array<string>`처럼 백틱으로 감싸 인라인 코드로 만드세요. 자세히: [왜 VitePress인가](../part2-choices/02-why-vitepress)

### Q8. 빌드가 `rendering pages`에서 `Cannot read properties of undefined`로 실패해요.

본문(인라인 코드 포함)에 이중 중괄호를 썼을 가능성이 큽니다. Vue가 그 안을 식으로 계산하려다 실패한 것입니다. 이중 중괄호는 **펜스 코드 블록 안에서만** 쓰세요. 자세히: [왜 VitePress인가](../part2-choices/02-why-vitepress)

### Q9. 개발 서버에서는 되는데 빌드만 하면 실패해요.

개발 서버는 지금 연 페이지만 처리하지만, 빌드는 **모든 페이지**를 그리고 링크를 검사합니다. 없는 페이지로 가는 링크(dead link), 어딘가의 이중 중괄호, SSR 중에는 없는 `localStorage` 같은 브라우저 전용 값이 흔한 원인입니다. 오류 메시지의 파일 이름을 먼저 보세요. 자세히: [빌드와 미리보기](../part5-build-along/06-build-preview)

### Q10. `config.mts`에 오타를 냈는데 빌드가 성공했어요. 왜 못 잡나요?

VitePress 빌드는 설정 파일의 타입 표시를 지우고 실행할 뿐, **타입 검사를 하지 않습니다.** 실제로 `provider: 'locale'` 오타는 빌드가 성공하고 검색만 조용히 사라졌습니다. VS Code에서 빨간 줄을 확인하거나 `npx tsc --noEmit`으로 따로 검사하세요. 자세히: [왜 TypeScript로 쓰나](../part2-choices/04-why-typescript)

## Docker·서버

### Q11. `docker compose up`을 했는데 `port is already allocated`가 나와요.

compose 파일의 왼쪽 포트(예: `8090:80`의 8090)를 이미 다른 컨테이너나 프로그램이 쓰고 있습니다. `docker ps`로 같은 포트를 쓰는 컨테이너가 있는지 보고, 있으면 멈추거나 왼쪽 번호를 바꾸세요.

### Q12. 글을 고쳤는데 Docker로 띄운 위키에 반영이 안 돼요.

Docker 이미지는 **만들 때의 파일로 굳어 있습니다.** `docker compose up -d --build`를 다시 실행해야 새 이미지가 만들어집니다. `docker compose restart`는 이미지를 새로 만들지 않으므로 반영되지 않습니다. 자세히: [서버에 상시 띄우기: Docker Compose](../part6-serve/04-compose)

### Q13. Docker 위키에서 메뉴로 이동하면 되는데, 그 주소에서 새로 고침하면 404가 나요.

`cleanUrls` 때문에 주소에 `.html`이 없는데, nginx가 그 이름의 파일을 못 찾은 것입니다. `nginx.conf`에 `try_files $uri $uri.html $uri/ =404;`가 있는지 확인하고 이미지를 다시 빌드하세요. 자세히: [Docker 이미지로 묶기](../part6-serve/03-docker-nginx)

### Q14. Git Bash에서 `docker exec ... ls /usr/share/nginx/html`이 이상한 경로를 찾아요.

Git Bash가 `/`로 시작하는 인자를 Windows 경로(`C:/Program Files/Git/usr/...`)로 바꿔서 생기는 문제입니다. 명령 앞에 `MSYS_NO_PATHCONV=1`을 붙이거나 PowerShell에서 실행하세요. 자세히: [명령어 모음](./01-commands)

### Q15. `vitepress preview`를 서버에 계속 띄워 두면 안 되나요?

권하지 않습니다. 공식 문서 기준 `preview`는 배포 전 로컬 확인용이고, 터미널을 닫거나 재부팅하면 꺼지며 다시 켜 주는 장치가 없습니다. 포트가 사용 중이면 `EADDRINUSE`로 바로 종료되기도 합니다. 상시 서비스는 nginx(Docker)를 쓰세요. 자세히: [왜 GitHub Pages와 Docker인가](../part2-choices/05-why-hosting)

## GitHub Pages

### Q16. GitHub Pages가 무료인가요? 비공개 저장소도 되나요?

작성 시점 공식 문서 기준으로 GitHub Free(무료 계정)에서는 **공개 저장소**에서만 쓸 수 있고, 비공개 저장소는 Pro·Team·Enterprise 같은 유료 플랜에서 지원됩니다. 사이트 크기 1GB, 월 100GB 소프트 대역폭 한도 등의 제한과 상업적 서비스 용도 제한도 있습니다. 정책은 바뀔 수 있으니 공식 문서를 확인하세요. 자세히: [왜 GitHub Pages와 Docker인가](../part2-choices/05-why-hosting)

### Q17. GitHub Pages에 올렸더니 글자만 보이고 디자인이 깨져요.

base 경로가 맞지 않은 경우가 대부분입니다. 프로젝트 페이지는 `https://<사용자>.github.io/<저장소>/` 아래에 있으므로 빌드할 때 base가 `/<저장소>/`여야 합니다. ts-wiki는 `deploy.yml`에서 `WIKI_BASE`를 저장소 이름으로 넣습니다. 자세히: [GitHub Pages 자동 배포](../part6-serve/05-github-pages)

### Q18. 공개 저장소에 올리면 안 되는 것은 무엇인가요?

서버 IP·계정·비밀번호·API 키·토큰, 고객사나 회사 내부 정보, 개인정보입니다. git은 **이력을 모두 보관**하므로, 한 번 커밋했다가 지워도 이전 커밋에 남습니다. `.env` 같은 파일은 처음부터 `.gitignore`에 넣으세요(ts-wiki도 `.env`, `.env.*`를 제외합니다). 이미 올렸다면 그 키를 **즉시 폐기·재발급**하는 것이 먼저입니다.

## 도구 선택

### Q19. 사내 위키를 만들려는데 꼭 VitePress여야 하나요?

아닙니다. ts-wiki는 "한 사람이 관리, 무료 공개 + 사내 서버, 코드 예제 많음" 조건이라 VitePress를 골랐습니다. 개발자가 아닌 사람 여럿이 브라우저에서 고친다면 Wiki.js 같은 동적 위키나 SaaS가 더 맞을 수 있습니다. 자세히: [위키 도구 비교](../part2-choices/01-wiki-tools-compare)

### Q20. TypeScript를 몰라도 이 가이드를 따라 할 수 있나요?

따라 할 수 있습니다. 설정 파일은 대부분 "객체에 값을 적는" 수준이고, 타입은 에디터가 자동 완성으로 도와줍니다. 컴포넌트를 직접 만드는 Part 5의 일부 레슨에서 TypeScript·Vue 문법이 조금 나옵니다. 더 배우고 싶다면 ts-wiki 자체가 TypeScript 학습 위키입니다.

### Q21. VitePress 2.0이 나오면 바로 올려야 하나요?

서두를 필요는 없습니다. 작성 시점 2.0은 알파(`2.0.0-alpha.21`)이고 안정판은 1.6.4입니다. 메이저 버전은 설정 방식이 바뀔 수 있으므로, 정식판이 나온 뒤 공식 이전 안내를 읽고 **실습 복사본에서 먼저 빌드**해 본 다음 올리세요.

## 다음 단계

여기서 답을 못 찾았다면 [문제 해결: 서버가 안 뜰 때](../part6-serve/06-troubleshooting)의 순서대로 원인을 좁혀 보고, 공식 문서는 [참고 자료](./04-resources)에서 찾으세요.
