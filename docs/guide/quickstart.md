---
title: 5분 만에 바로 띄우기
---

# 5분 만에 바로 띄우기

설명은 나중에 듣고 일단 ts-wiki를 켜 보고 싶은 사람을 위한 페이지입니다. 여기 나오는 명령이 **왜** 이렇게 생겼는지는 [Part 6. 서버 띄우기와 배포](../part6-serve/)에서 한 줄씩 설명합니다.

## 준비물

- **Node.js 20 이상** (권장 22 이상). 확인: 터미널에서 `node -v`
- 3번 방법을 쓰려면 **Docker Desktop**. 확인: `docker --version`

설치가 안 되어 있다면 [준비물 설치](../part0-start/03-setup)를 먼저 봅니다.

## 방법 1. 개발 서버로 띄우기 (글을 쓰거나 고칠 때)

```bash
cd D:/workspace/ts-wiki
npm install
npm run dev
```

- `npm install`은 처음 한 번만 하면 됩니다. `node_modules` 폴더가 생기면 성공입니다.
- 터미널에 `Local: http://localhost:5180/`이 보이면 브라우저에서 그 주소를 엽니다.
- 마크다운 파일을 저장하면 브라우저가 **새로 고침 없이 바로** 바뀝니다.
- 끄려면 그 터미널에서 `Ctrl+C`를 누릅니다.

## 방법 2. 빌드해서 미리보기 (배포 전에 확인할 때)

```bash
cd D:/workspace/ts-wiki
npm run build
npm run preview
```

- `build`는 마크다운을 HTML 파일로 바꿔 `docs/.vitepress/dist` 폴더에 담습니다. 없는 페이지로 링크하면 여기서 실패하므로, 배포 전에 꼭 한 번 돌려 봅니다.
- `preview`는 그 HTML 파일을 그대로 서비스하는 간이 서버입니다. 주소는 개발 서버와 같은 `http://localhost:5180`입니다.

## 방법 3. Docker로 상시 띄우기 (서버에 계속 켜 둘 때)

```bash
cd D:/workspace/ts-wiki
docker compose up -d --build
```

- `http://localhost:8090`으로 접속합니다. 다른 PC에서는 `http://<이 PC의 IP>:8090`입니다.
- 터미널을 닫아도, PC를 재부팅해도(Docker Desktop이 켜져 있다면) 계속 떠 있습니다.
- 문서를 고친 뒤에는 같은 명령을 다시 실행해야 반영됩니다.
- 끄려면 `docker compose down`을 실행합니다.

## 방법 4. GitHub Pages (인터넷에 공개)

ts-wiki는 `main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드해 https://hong-coding.github.io/ts-wiki/ 에 올립니다. 따로 실행할 명령은 없습니다.

```bash
git add .
git commit -m "docs: 레슨 수정"
git push
```

진행 상황은 GitHub 저장소의 **Actions** 탭에서 봅니다. 1~2분 뒤 초록색 체크가 뜨면 사이트에 반영된 것입니다.

## 안 뜰 때

| 증상 | 먼저 볼 것 |
|---|---|
| `'npm'은(는) 내부 또는 외부 명령...이 아닙니다` | Node.js가 설치되지 않았거나 터미널을 새로 열지 않았습니다. |
| `Port 5180 is in use` | 이미 다른 터미널에서 켜져 있습니다. 그 터미널에서 `Ctrl+C`로 끄거나 브라우저로 바로 접속합니다. |
| 다른 PC에서 접속이 안 된다 | Windows 방화벽이 포트를 막고 있을 수 있습니다. |
| `docker: command not found` / 데몬 연결 에러 | Docker Desktop이 실행 중인지 확인합니다. |

더 자세한 내용은 [문제 해결: 서버가 안 뜰 때](../part6-serve/06-troubleshooting)에 있습니다.
