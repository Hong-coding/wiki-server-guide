---
title: GitHub Pages 자동 배포
---

# GitHub Pages 자동 배포

<LessonMeta level="실전" :minutes="60" prev="Docker Compose로 위키를 서버 PC에 상시 띄웠습니다" />

## 이번에 배울 것

- ts-wiki가 GitHub Pages에 배포되기까지의 전체 흐름(저장소 → Pages 설정 → 워크플로 → push → Actions → 주소)을 순서대로 설명할 수 있다.
- `.github/workflows/deploy.yml`을 한 줄씩 읽고 각 단계가 하는 일을 말할 수 있다.
- 프로젝트 페이지에서 `base` 경로(`/ts-wiki/`)가 왜 필요한지 설명하고, 빠뜨렸을 때 CSS가 깨지는 현상을 로컬에서 재현할 수 있다.
- `gh run list` 등 읽기 전용 명령으로 배포 기록과 결과를 확인할 수 있다.
- dead link로 빌드가 실패하는 경우를 재현하고 고칠 수 있다.

## 먼저 알아 둘 것

- [GitHub Actions와 Pages 배포 액션](../part3-libraries/07-github-actions)
- [왜 GitHub Pages와 Docker(nginx)인가](../part2-choices/05-why-hosting)
- [config.mts 한 줄씩 읽기](../part4-anatomy/03-config)의 `base` 부분
- GitHub 계정과 git 기본 명령(`add`, `commit`, `push`)

## 비유로 이해하기

GitHub Pages 배포는 **무인 인쇄소에 원고를 맡기는 일**입니다.

- 원고를 우편함(저장소의 `main` 브랜치)에 넣으면(`git push`),
- 인쇄소 직원(GitHub Actions)이 작업 지시서(`deploy.yml`)대로 원고를 책으로 만들고(`npm run build`),
- 완성된 책을 서점 진열대(GitHub Pages)에 꽂습니다.
- 서점 주소는 `https://<사용자>.github.io/<저장소 이름>/`입니다.

여기서 `base`는 **진열대 칸 번호**입니다. 내 책은 서점 입구(`/`)가 아니라 `ts-wiki` 칸(`/ts-wiki/`)에 꽂힙니다. 책 안의 "그림은 입구 옆 선반에 있음"(`/assets/...`)이라고 적혀 있으면 독자는 엉뚱한 선반을 찾게 됩니다. 그래서 책을 만들 때부터 "그림은 `ts-wiki` 칸 안 선반(`/ts-wiki/assets/...`)"이라고 적어야 합니다.

## 따라 하기

::: danger 이 레슨에서 외부에 쓰는 작업
저장소 만들기, Pages 설정 변경, `git push`는 **인터넷에 공개되는 작업**입니다. 이 레슨은 그 절차를 설명하고, 실제 확인은 이미 공개된 ts-wiki 저장소를 **읽기만 하는** 명령으로 합니다. 직접 따라 할 때는 공개해도 되는 내용인지(회사 정보, 개인정보, 비밀번호·토큰이 없는지) 먼저 확인합니다.
:::

### 1단계. 전체 흐름 한눈에 보기

```text
① GitHub에 저장소 만들기 (예: <사용자>/ts-wiki, 공개)
② Settings → Pages → Source = "GitHub Actions"
③ .github/workflows/deploy.yml 을 저장소에 넣기
④ git push (main 브랜치)
⑤ Actions 탭: build 작업 → deploy 작업
⑥ https://<사용자>.github.io/ts-wiki/ 에서 확인
```

①~③은 처음 한 번, ④~⑥은 글을 고칠 때마다 반복합니다.

### 2단계. 저장소 만들기와 Pages 설정 (처음 한 번)

1. GitHub 오른쪽 위 `+` → **New repository**. 이름(예: `ts-wiki`)과 공개 여부를 정합니다.
2. 내 PC의 위키 폴더를 그 저장소에 연결하고 올립니다.

   ```bash
   git remote add origin https://github.com/<사용자>/ts-wiki.git
   git push -u origin main
   ```

3. 저장소 페이지 → **Settings** → 왼쪽 **Pages** → **Build and deployment**의 **Source**를 **GitHub Actions**로 바꿉니다.

Source 선택지는 두 가지입니다(작성 시점 화면 기준).

| Source | 동작 | ts-wiki에 맞나 |
|---|---|---|
| Deploy from a branch | 특정 브랜치·폴더의 파일을 **그대로** 공개 | 아니요. 저장소에는 마크다운만 있고 `dist`는 `.gitignore`로 빠져 있습니다. |
| GitHub Actions | 워크플로가 빌드해서 올린 결과물을 공개 | 예. 빌드를 GitHub가 대신합니다. |

이 설정이 실제로 어떻게 되어 있는지는 GitHub API로 **읽어서** 확인할 수 있습니다. `gh`는 GitHub 공식 명령줄 도구(GitHub CLI)입니다. 작성 시점 버전은 2.103.0이었습니다.

```bash
gh api repos/Hong-coding/ts-wiki/pages
```

실제 출력(줄 바꿈 정리):

```json
{
  "html_url": "https://hong-coding.github.io/ts-wiki/",
  "build_type": "workflow",
  "source": { "branch": "main", "path": "/" },
  "public": true,
  "https_enforced": true,
  ...
}
```

`"build_type": "workflow"`가 "Source = GitHub Actions"라는 뜻입니다. `"https_enforced": true`는 `http://`로 들어와도 `https://`로 보낸다는 뜻입니다.

### 3단계. deploy.yml 한 줄씩 읽기

ts-wiki의 `.github/workflows/deploy.yml` 전체입니다. GitHub는 `.github/workflows/` 폴더의 YAML 파일을 자동으로 찾아 실행합니다.

```yaml
# main 브랜치에 push하면 위키를 빌드해 GitHub Pages에 배포합니다.
name: Deploy wiki

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # lastUpdated(마지막 수정 시각) 표시에 git 이력이 필요합니다.
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          WIKI_BASE: /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

| 줄 | 내용 | 무엇을, 왜 |
|---|---|---|
| 2 | `name: Deploy wiki` | Actions 탭과 `gh run list`에 보이는 이름 |
| 4~7 | `on:` | 언제 실행하나. `main`에 push될 때, 그리고 `workflow_dispatch`(Actions 탭의 "Run workflow" 버튼으로 손으로 실행) |
| 9~12 | `permissions:` | 이 워크플로가 가질 권한. 저장소는 읽기만, Pages에는 쓰기, `id-token`은 Pages 배포 시 "진짜 이 저장소의 워크플로"임을 증명하는 데 씁니다. 필요한 만큼만 주는 것이 안전합니다. |
| 14~16 | `concurrency:` | 배포가 동시에 두 개 돌지 않게 `pages` 그룹으로 묶습니다. `cancel-in-progress: false`라서 진행 중인 배포를 취소하지 않고 끝날 때까지 기다립니다. |
| 19~20 | `build:` / `runs-on: ubuntu-latest` | 첫 작업(job). GitHub가 빌려주는 Ubuntu 가상 PC에서 돌립니다. |
| 22~24 | `actions/checkout@v4`, `fetch-depth: 0` | 저장소 코드를 받습니다. 기본은 마지막 커밋 하나만 받는데, `0`은 **전체 이력**을 받으라는 뜻입니다. `lastUpdated`가 파일별 마지막 수정 커밋을 찾아야 하기 때문입니다. |
| 25~28 | `actions/setup-node@v4` | Node.js 22를 설치하고, `cache: npm`으로 다운로드한 패키지를 다음 실행 때 재사용합니다. |
| 29 | `npm ci` | 패키지 설치 |
| 30~32 | `npm run build` + `env: WIKI_BASE` | 위키 빌드. 이때 환경 변수 `WIKI_BASE`에 `/저장소이름/`을 넣습니다. 4단계에서 자세히 봅니다. |
| 33~35 | `actions/upload-pages-artifact@v3` | 빌드 결과 `dist`를 Pages용 묶음(artifact, 작업 결과물 파일)으로 올립니다. |
| 37~38 | `deploy:` / `needs: build` | 두 번째 작업. `build`가 성공해야만 시작합니다. |
| 40~42 | `environment:` | GitHub의 `github-pages` 환경에 배포하고, 배포된 주소를 Actions 화면에 링크로 보여 줍니다. |
| 44~45 | `actions/deploy-pages@v4` | 올려 둔 묶음을 실제로 Pages에 공개합니다. |

32번째 줄의 `github.event.repository.name`은 **이 저장소의 이름**을 꺼내는 GitHub Actions 표현식입니다. 저장소 이름이 `ts-wiki`면 `WIKI_BASE`가 `/ts-wiki/`가 됩니다. 이름을 직접 적지 않았기 때문에 저장소를 복제(fork)하거나 이름을 바꿔도 파일을 고칠 필요가 없습니다.

### 4단계. base가 필요한 이유

GitHub Pages 주소는 두 종류입니다.

| 종류 | 저장소 이름 | 주소 | 사이트의 루트 |
|---|---|---|---|
| 사용자(조직) 페이지 | `<사용자>.github.io` | `https://<사용자>.github.io/` | `/` |
| 프로젝트 페이지 | 그 밖의 이름(예: `ts-wiki`) | `https://<사용자>.github.io/ts-wiki/` | `/ts-wiki/` |

ts-wiki는 프로젝트 페이지입니다. 그런데 VitePress는 기본적으로 사이트가 `/`에 있다고 가정하고 CSS를 `/assets/style.xxx.css`로 참조합니다. 프로젝트 페이지에서 이 주소는 `https://<사용자>.github.io/assets/...` — 즉 **다른 사이트의 자리**를 가리킵니다.

작성 시점에 실제로 확인한 결과입니다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://hong-coding.github.io/ts-wiki/
curl -s -o /dev/null -w "%{http_code}\n" https://hong-coding.github.io/
```

```text
200
404
```

ts-wiki 자리(`/ts-wiki/`)는 200, 그 위 루트(`/`)는 404입니다. CSS를 루트에서 찾으면 당연히 없습니다.

그래서 ts-wiki의 `config.mts`는 `base`를 환경 변수로 받습니다.

```ts
// GitHub Pages(프로젝트 페이지)에 올릴 때는 /저장소이름/ 아래에서 서비스되므로 base를 환경 변수로 받습니다.
const base = process.env.WIKI_BASE ?? '/'
```

- GitHub Actions에서는 `WIKI_BASE=/ts-wiki/`가 들어와 `base`가 `/ts-wiki/`가 됩니다.
- 내 PC나 Docker에서는 `WIKI_BASE`가 없으므로 `??`(값이 없으면 오른쪽을 씀) 덕분에 `/`가 됩니다.

하나의 설정 파일로 두 환경을 모두 맞춘 것입니다.

### 5단계. base 누락으로 CSS가 깨지는 현상 로컬 재현

ts-wiki 전체를 다시 빌드하면 2분 넘게 걸리므로, 6-1 복사본 안에 아주 작은 위키 `mini`를 만들어 실험합니다. 복사본 폴더에서 아래 파일 세 개를 만듭니다(복사본의 `node_modules`에 있는 VitePress를 그대로 씁니다).

`mini/.vitepress/config.mts`:

```ts
export default { base: process.env.WIKI_BASE ?? '/', cleanUrls: true }
```

`mini/index.md`:

```md
# 한빛 카페 위키

[메뉴 안내](./menu)
```

`mini/menu.md`:

```md
# 메뉴 안내

아메리카노, 라테
```

**① base 없이 빌드**

```bash
npx vitepress build mini
grep -o 'href="[^"]*css"' mini/.vitepress/dist/index.html
```

실제 출력:

```text
build complete in 10.12s.
href="/assets/style.DFTx90Kk.css"
href="/vp-icons.css"
```

이 결과물을 GitHub Pages처럼 `/ts-wiki/` 아래에 두고 띄웁니다. `srv` 폴더 안에 `ts-wiki` 폴더를 만들어 `dist` 내용을 복사한 뒤, `srv`를 서비스합니다.

Windows(PowerShell):

```powershell
New-Item -ItemType Directory -Force srv | Out-Null
Copy-Item -Recurse mini\.vitepress\dist srv\ts-wiki
cd srv
python -m http.server 5198
```

macOS/Linux(bash):

```bash
mkdir -p srv && cp -r mini/.vitepress/dist srv/ts-wiki
cd srv && python3 -m http.server 5198
```

다른 터미널에서 확인합니다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5198/ts-wiki/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5198/assets/style.DFTx90Kk.css
```

실제 출력:

```text
200
404
```

HTML은 200인데 CSS는 404입니다. 브라우저로 `http://localhost:5198/ts-wiki/`를 열면 **글자만 덩그러니 있고 디자인이 전부 빠진 화면**이 보입니다. 개발자 도구(F12) → Network 탭에 `style.DFTx90Kk.css`가 빨간색 404로 보입니다. 사이드바나 검색처럼 JavaScript로 동작하는 부분도 같은 이유로 움직이지 않습니다.

**② base를 주고 빌드**

Windows(PowerShell):

```powershell
$env:WIKI_BASE = '/ts-wiki/'
npx vitepress build mini
Remove-Item Env:WIKI_BASE
```

macOS/Linux(bash):

```bash
WIKI_BASE=/ts-wiki/ npx vitepress build mini
```

실제 출력:

```text
build complete in 7.17s.
href="/ts-wiki/assets/style.q255pke8.css"
href="/ts-wiki/vp-icons.css"
```

이번에는 CSS 주소 앞에 `/ts-wiki/`가 붙었습니다. 같은 방법으로 `/ts-wiki/` 아래에 두고 확인하면 CSS도 200이었습니다.

::: warning Git Bash에서는 경로가 바뀌어 버립니다
Windows의 Git Bash에서 `WIKI_BASE=/ts-wiki/ npx vitepress build mini`를 그대로 실행했더니, Git Bash가 `/ts-wiki/`를 Windows 경로로 "친절하게" 바꿔서 실제로 이런 결과가 나왔습니다.

```text
href="C:/Program Files/Git/ts-wiki/assets/style.Rgu-bSQa.css"
```

Git Bash에서는 경로 변환을 끄는 `MSYS_NO_PATHCONV=1`을 앞에 붙입니다.

```bash
MSYS_NO_PATHCONV=1 WIKI_BASE=/ts-wiki/ npx vitepress build mini
```

GitHub Actions(Ubuntu)와 PowerShell, macOS·Linux 터미널에서는 이 문제가 없습니다.
:::

**확인 방법**: base를 준 빌드에서 `href`가 `/ts-wiki/`로 시작하면 성공입니다.

### 6단계. dead link로 빌드 실패 재현

VitePress는 빌드할 때 **존재하지 않는 페이지로 가는 링크(dead link)**를 찾으면 빌드를 실패시킵니다. 배포된 사이트에서 독자가 404를 만나기 전에 막아 주는 장치입니다.

`mini/menu.md`를 지우고(또는 이름을 바꾸고) 빌드합니다.

```bash
npx vitepress build mini
```

실제 출력:

```text
  vitepress v1.6.3

- building client + server bundles...

(!) Found dead link ./menu in file index.md

If this is expected, you can disable this check via config. Refer: https://vitepress.dev/reference/site-config#ignoredeadlinks

x Build failed in 4.09s
✖ building client + server bundles...
build error:
[vitepress] 1 dead link(s) found.
```

- `Found dead link ./menu in file index.md` — **어느 파일의 어느 링크**인지 정확히 알려 줍니다.
- 종료 코드는 1입니다. GitHub Actions에서는 `npm run build` 단계가 빨간 ✗가 되고, 그 뒤의 upload·deploy는 실행되지 않습니다. 그래서 **깨진 사이트가 공개되지 않고 이전 버전이 그대로 남습니다.**

해결: `menu.md`를 다시 만들거나, 링크를 실제 있는 페이지로 고칩니다. 안내문의 `ignoreDeadLinks` 설정으로 검사를 끌 수도 있지만, 진짜 깨진 링크까지 숨기므로 권하지 않습니다.

::: tip push 전에 로컬에서 빌드
push한 뒤 Actions에서 실패를 알게 되면 한 바퀴(1~2분)를 손해 봅니다. ts-wiki의 README도 "문서를 고친 뒤에는 꼭 빌드해 봅니다"라고 안내합니다. `npm run build`가 로컬에서 통과하면 Actions에서도 대부분 통과합니다.
:::

### 7단계. push하고 Actions 확인하기

글을 고친 뒤의 반복 작업입니다.

```bash
npm run build          # 로컬에서 먼저 확인
git add .
git commit -m "docs: 레슨 수정"
git push
```

push하면 저장소의 **Actions** 탭에 `Deploy wiki` 실행이 생깁니다. 노란 원(진행 중) → 초록 체크(성공) 또는 빨간 ✗(실패)로 바뀝니다.

터미널에서는 `gh`로 **읽기만** 해서 확인할 수 있습니다.

```bash
gh run list -R Hong-coding/ts-wiki --limit 5
```

실제 출력(작성 시점):

```text
completed	success	feat: TypeScript 마스터 위키 첫 공개	Deploy wiki	main	push	40592424236	1m16s	2026-10-27T22:08:11Z
```

칸 순서는 상태, 결과, 커밋 메시지, 워크플로 이름, 브랜치, 계기(push), 실행 ID, 걸린 시간, 시작 시각입니다. `-R 소유자/저장소`를 빼면 현재 폴더의 저장소를 봅니다.

실행 하나를 자세히 봅니다.

```bash
gh run view 40592424236 -R Hong-coding/ts-wiki
```

실제 출력(일부):

```text
✓ main Deploy wiki · 40592424236
Triggered via push about 4 hours ago

JOBS
✓ build in 58s (ID 122499782648)
✓ deploy in 10s (ID 122500248809)

ANNOTATIONS
! Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4, actions/upload-artifact@v4. ...
...
ARTIFACTS
github-pages
```

- `build` 58초, `deploy` 10초. 3단계의 두 작업이 순서대로 돌았습니다.
- `ANNOTATIONS`의 `!`는 경고입니다. 작성 시점에는 "이 액션들이 Node.js 20용인데 Node.js 24로 강제 실행 중"이라는 안내가 붙었습니다. 지금은 성공했지만, 액션의 새 주 버전이 나오면 `@v4` 등을 올려야 할 수 있다는 신호입니다(각 액션의 공식 저장소에서 확인).
- `ARTIFACTS`의 `github-pages`가 `upload-pages-artifact`로 올린 `dist` 묶음입니다.

진행 중인 실행을 실시간으로 지켜보려면 `gh run watch`, 실패한 단계의 로그만 보려면 `gh run view <실행 ID> --log-failed`를 씁니다(GitHub CLI 공식 문서 기준, 작성 시점에는 진행 중이거나 실패한 실행이 없어 출력은 확인하지 못했습니다).

```bash
gh run watch -R Hong-coding/ts-wiki
gh run list -R Hong-coding/ts-wiki --status failure --limit 3
```

두 번째 명령은 작성 시점에 아무것도 출력하지 않았습니다. 실패한 실행이 없다는 뜻입니다.

### 8단계. 주소로 확인하기

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://hong-coding.github.io/ts-wiki/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://hong-coding.github.io/ts-wiki
curl -s -o /dev/null -w "%{http_code}\n" https://hong-coding.github.io/ts-wiki/guide/roadmap
curl -s -o /dev/null -w "%{http_code}\n" https://hong-coding.github.io/ts-wiki/nope
```

실제 출력(작성 시점):

```text
200
301 https://hong-coding.github.io/ts-wiki/
200
404
```

- 끝에 `/`가 없는 주소는 `/`가 붙은 주소로 이동시킵니다(301).
- `/guide/roadmap`(확장자 없음)이 200 — GitHub Pages는 `.html`을 붙여 찾아 줍니다. 그래서 nginx처럼 `try_files`를 설정하지 않아도 cleanUrls가 동작합니다.
- 배포 직후에는 1분 정도 예전 내용이 보일 수 있습니다(GitHub의 캐시). 조금 기다린 뒤 강력 새로 고침합니다.

### 9단계. 사용자 정의 도메인 (소개)

`wiki.example.com` 같은 내 도메인으로 Pages를 서비스할 수도 있습니다. 절차의 큰 틀은 이렇습니다(GitHub 공식 문서 기준, 작성 시점에는 직접 해 보지 않았습니다).

1. 도메인을 산 곳(DNS 관리 화면)에 `CNAME` 레코드로 `wiki.example.com → <사용자>.github.io`를 등록합니다.
2. 저장소 Settings → Pages → **Custom domain**에 `wiki.example.com`을 입력하고 저장합니다.
3. DNS 확인이 끝나면 **Enforce HTTPS**를 켭니다.

이때 사이트가 도메인의 루트(`/`)에서 서비스되므로 `base`는 `/`여야 합니다. ts-wiki 방식이라면 워크플로의 `WIKI_BASE`를 `/`로 바꿔야 합니다. 도메인 비용과 정책은 바뀔 수 있으니 작성 시점 기준이며, 공식 페이지에서 확인합니다.

## ts-wiki에서는

- `docs/.vitepress/config.mts` 4~5번째 줄 — `base`를 `WIKI_BASE` 환경 변수로 받고 없으면 `/`. 24번째 줄에서 `base`를 설정에 넘기고, 27번째 줄 파비콘(favicon, 브라우저 탭 아이콘) 경로에도 `${base}`를 붙였습니다. `head`에 직접 쓴 경로는 VitePress가 자동으로 base를 붙여 주지 않기 때문입니다.
- `.github/workflows/deploy.yml` 30~32번째 줄 — 빌드할 때만 `WIKI_BASE`를 저장소 이름으로 채웁니다. 같은 저장소가 Docker(base `/`)와 Pages(base `/ts-wiki/`) 양쪽에서 동작하는 비결입니다.
- `deploy.yml` 24번째 줄 `fetch-depth: 0` — `config.mts` 26번째 줄 `lastUpdated: true`와 짝입니다. 이력이 없으면 모든 페이지의 "마지막 수정"이 틀리게 나옵니다. (6-3에서 Dockerfile에 git을 설치하는 이유와 같은 뿌리입니다.)
- `.gitignore`의 `docs/.vitepress/dist/` — 결과물을 저장소에 넣지 않으므로 Pages Source를 "Deploy from a branch"로 할 수 없고, Actions가 빌드해야 합니다.
- `config.mts`의 `editLink.pattern`이 `https://github.com/Hong-coding/ts-wiki/edit/main/docs/:path` — 공개된 위키의 "GitHub에서 이 페이지 고치기" 링크가 이 저장소로 연결되어, 독자가 바로 수정 제안을 할 수 있습니다.

## 자주 하는 실수

**1. 배포는 성공했는데 화면이 하얗거나 디자인이 없다**

- 증상: Actions는 초록 체크, 사이트는 글자만 있거나 흰 화면. 개발자 도구 Network 탭에 `/assets/...css` 404.
- 원인: `base` 누락. 프로젝트 페이지인데 `/`로 빌드했습니다.
- 해결: 빌드 시 `WIKI_BASE=/<저장소 이름>/`가 들어가는지 워크플로의 `env:`를 확인합니다. 저장소 이름의 대소문자까지 같아야 합니다.

**2. Actions의 build 단계가 빨간 ✗**

- 증상: `[vitepress] 1 dead link(s) found.`
- 원인: 없는 페이지로 가는 링크.
- 해결: 로그의 `Found dead link ... in file ...` 줄에서 파일을 찾아 고치고, 로컬 `npm run build`로 확인한 뒤 다시 push합니다.

**3. push했는데 Actions가 아예 안 돈다**

- 증상: Actions 탭에 새 실행이 없음.
- 원인: `main`이 아닌 브랜치에 push했거나, 워크플로 파일이 `.github/workflows/`가 아닌 곳에 있습니다.
- 해결: `git branch`로 현재 브랜치를 확인합니다. `on.push.branches`에 적힌 브랜치에 push해야 합니다.

**4. 사이트 주소가 404**

- 증상: `https://<사용자>.github.io/ts-wiki/`가 GitHub의 404 화면.
- 원인: Pages Source가 GitHub Actions로 설정되지 않았거나, 아직 첫 배포가 성공하지 않았습니다.
- 해결: Settings → Pages 설정과 Actions 탭의 deploy 작업 결과를 확인합니다. 자세한 순서는 [6-6](./06-troubleshooting).

## 직접 해 보기

**⭐ 과제 1.** `gh run list -R Hong-coding/ts-wiki`로 최근 배포가 성공했는지, 얼마나 걸렸는지 확인하세요.

::: details 정답 보기
두 번째 칸이 `success`면 성공, 끝에서 두 번째 칸이 걸린 시간입니다.
:::

**⭐ 과제 2.** 5단계를 따라 `mini`를 base 없이/있게 두 번 빌드하고, `index.html`의 CSS 주소를 비교하세요.

::: details 정답 보기
base 없이: `href="/assets/style.<해시>.css"`, base `/ts-wiki/`: `href="/ts-wiki/assets/style.<해시>.css"`.
:::

**⭐⭐ 과제 3.** `mini/index.md`에 `[없는 페이지](./nope)` 링크를 추가해 빌드를 실패시키고, 에러에서 파일과 링크를 찾아 고치세요.

::: details 정답 보기
`(!) Found dead link ./nope in file index.md`가 나옵니다. 링크를 지우거나 `nope.md`를 만들면 통과합니다.
:::

**⭐⭐ 과제 4.** 저장소 이름을 `team-wiki`로 바꾸면 ts-wiki의 `deploy.yml`이나 `config.mts`를 고쳐야 하나요? 이유와 함께 답하세요.

::: details 정답 보기
고칠 필요가 없습니다. 워크플로가 저장소 이름을 표현식으로 읽어 `WIKI_BASE=/team-wiki/`를 만들고, `config.mts`는 그 값을 받기만 합니다. 다만 `editLink`와 `socialLinks`의 주소는 직접 적혀 있으므로 그 둘은 바꿔야 합니다.
:::

**⭐⭐⭐ 과제 5.** (공개해도 되는 연습용 저장소가 있다면) 내 계정에 `mini`만 담은 저장소를 만들어 Pages로 배포해 보고, `gh run list`와 `curl`로 확인하세요.

::: details 힌트
`mini` 폴더 구조를 저장소 루트에 맞게 옮기고, `deploy.yml`의 `npm run build`와 `path:`를 그 구조에 맞게 고칩니다. `package.json`에 vitepress가 있어야 Actions에서 `npm ci`로 설치됩니다. 공개 저장소에는 회사 정보·개인정보·토큰을 넣지 않습니다.
:::

## 확인 퀴즈

**1.** Pages Source를 "Deploy from a branch"가 아니라 "GitHub Actions"로 한 이유는?

::: details 정답 보기
저장소에는 마크다운만 있고 빌드 결과물 `dist`는 `.gitignore`로 빠져 있어서, 누군가 빌드해야 합니다. Actions가 그 빌드를 맡습니다.
:::

**2.** 프로젝트 페이지에서 `base`를 빠뜨리면 어떤 증상이 나오고, 왜 그런가요?

::: details 정답 보기
HTML은 뜨지만 CSS·JS가 404라 디자인이 빠지거나 흰 화면이 됩니다. 결과물이 `/assets/...`를 참조하는데 사이트는 `/ts-wiki/` 아래에 있기 때문입니다.
:::

**3.** `fetch-depth: 0`이 없으면 무엇이 잘못되나요?

::: details 정답 보기
마지막 커밋 하나만 받으므로 `lastUpdated`(마지막 수정 시각)가 파일별 실제 수정 시각이 아니라 틀린 값으로 나옵니다.
:::

**4.** dead link로 build가 실패하면 공개된 사이트는 어떻게 되나요?

::: details 정답 보기
deploy 작업이 실행되지 않으므로 이전에 성공한 버전이 그대로 남습니다.
:::

## 정리

- 흐름: 저장소 → Settings → Pages → Source = GitHub Actions → `deploy.yml` → push → Actions(build → deploy) → `https://<사용자>.github.io/<저장소>/`.
- `deploy.yml`은 Ubuntu에서 checkout(전체 이력) → Node 22 → `npm ci` → `WIKI_BASE`를 넣어 build → artifact 업로드 → deploy-pages 순으로 동작합니다.
- 프로젝트 페이지는 `/저장소이름/` 아래에 있으므로 `base`가 필요합니다. 빠뜨리면 CSS가 404가 되어 화면이 깨집니다.
- dead link가 있으면 빌드가 실패하고 배포되지 않습니다. push 전에 로컬 `npm run build`.
- 배포 기록은 `gh run list`, `gh run view`, `gh run watch`로 읽을 수 있습니다.
- Git Bash에서 `/`로 시작하는 환경 변수 값은 경로로 바뀔 수 있으니 `MSYS_NO_PATHCONV=1`을 붙입니다.

## 다음 단계

[문제 해결: 서버가 안 뜰 때](./06-troubleshooting) — 지금까지 겪은 에러들을 증상별로 모아 "증상 → 원인 → 확인 명령 → 해결 → 재발 방지" 순서로 정리합니다.
