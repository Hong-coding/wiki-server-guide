---
title: GitHub Actions와 Pages 배포 액션
---

# GitHub Actions와 Pages 배포 액션

<LessonMeta level="초급" :minutes="45" prev="Dockerfile·멀티 스테이지·Compose로 위키를 컨테이너로 묶어 띄웠습니다." />

## 이번에 배울 것

- GitHub Actions의 용어(**workflow, job, step, runner, action, trigger**)를 구분해 설명할 수 있다.
- `on`, `permissions`, `concurrency`, `environment`, `needs`가 각각 무엇을 정하는지 말할 수 있다.
- Pages 배포에 쓰는 네 가지 액션(`checkout`, `setup-node`, `upload-pages-artifact`, `deploy-pages`)의 역할을 설명할 수 있다.
- ts-wiki의 `deploy.yml` 45줄을 한 줄씩 읽고, 실제 실행 기록(`gh run view`)과 연결할 수 있다.

## 먼저 알아 둘 것

- [왜 GitHub Pages와 Docker(nginx)인가](../part2-choices/05-why-hosting)
- [VitePress: 설정 · 라우팅 · 테마](./01-vitepress) — 특히 `base`
- Git의 `commit`, `push`, 브랜치(`main`) 개념. 처음이라면 [서버 구축을 공부하는 법](../part0-start/02-how-to-study)의 학습 순서를 참고합니다.

## 비유로 이해하기

GitHub Actions는 **택배 회사의 자동 분류 센터**입니다.

- **trigger**(방아쇠)는 "트럭이 도착하면"이라는 **조건**입니다. ts-wiki에서는 "`main`에 push가 오면"입니다.
- **workflow**(작업 흐름)는 센터의 **작업 지시서 한 장**입니다(`.github/workflows/deploy.yml`).
- **runner**는 지시서를 받아 일하는 **임시 작업자**입니다. GitHub가 깨끗한 가상 컴퓨터를 빌려주고, 일이 끝나면 치웁니다.
- **job**은 작업자 한 명이 맡는 **일 묶음**입니다(포장하기 = `build`, 배송하기 = `deploy`).
- **step**은 일 묶음 안의 **한 동작**입니다(상자 열기, 물건 넣기, 테이프 붙이기).
- **action**은 자주 하는 동작을 미리 만들어 둔 **자동 기계**입니다. "상자를 여는 기계"(`actions/checkout`)를 가져다 쓰면 됩니다.
- **artifact**는 job 사이에 넘기는 **완성된 상자**입니다. 포장 담당이 만든 상자를 배송 담당이 받아 갑니다.

## 이게 뭔가

**GitHub Actions**는 GitHub 저장소에서 어떤 일이 일어났을 때(push, PR, 시간 예약, 버튼 클릭) **자동으로 명령을 실행**해 주는 서비스입니다. 이런 자동화를 CI/CD(Continuous Integration / Continuous Deployment, 지속적 통합·배포)라고 부릅니다.

**GitHub Pages**는 저장소의 정적 파일을 `https://계정.github.io/저장소/` 주소로 무료 호스팅해 주는 서비스입니다(공개 저장소 기준, 요금·정책은 작성 시점 기준이며 공식 페이지에서 확인). Pages에 올리는 방법은 두 가지입니다.

| 방식 | 뜻 |
|---|---|
| 브랜치에서 배포 | 특정 브랜치의 폴더를 그대로 공개. 빌드가 필요 없는 사이트용 |
| **GitHub Actions로 배포** | 워크플로가 빌드한 결과를 공개. ts-wiki가 쓰는 방식 |

ts-wiki의 Pages 설정을 GitHub API로 읽어 보면 Actions 방식(`build_type: workflow`)인 것을 확인할 수 있습니다(읽기만 하는 명령입니다).

```bash
gh api repos/Hong-coding/ts-wiki/pages
```

```text
{"url":"https://api.github.com/repos/Hong-coding/ts-wiki/pages","status":null,...,
 "html_url":"https://hong-coding.github.io/ts-wiki/","build_type":"workflow",
 "source":{"branch":"main","path":"/"},"public":true,...,"https_enforced":true}
```

`gh`는 GitHub 공식 명령줄 도구입니다(작성 시점 2.103.0). 설치하지 않았다면 이 명령은 건너뛰고, 브라우저에서 저장소의 **Settings → Pages**를 열어 "Source: GitHub Actions"를 확인해도 됩니다.

## 왜 필요한가

자동화가 없다면 글을 고칠 때마다 이렇게 해야 합니다.

1. 내 PC에서 `npm run build`
2. `dist` 폴더를 어딘가(예: `gh-pages` 브랜치)에 올림
3. 잊지 않고 매번 반복

Actions를 쓰면 **`git push` 한 번**으로 끝납니다. 그리고 빌드가 **매번 깨끗한 컴퓨터에서** 일어나므로, "내 PC에만 있는 파일 덕분에 빌드가 됐다" 같은 문제를 일찍 발견합니다. 깨진 링크가 있으면 빌드가 실패하고 배포되지 않으므로, 망가진 사이트가 공개되는 것도 막아 줍니다.

## 설치

설치할 것이 없습니다. 저장소에 **`.github/workflows/` 폴더 아래 `.yml` 파일**을 넣고 push하면 GitHub가 알아서 읽습니다. 한 번만 해야 할 설정은 저장소 **Settings → Pages → Source를 "GitHub Actions"로** 바꾸는 것입니다(자세한 절차는 [GitHub Pages 자동 배포](../part6-serve/05-github-pages)).

::: warning 이 레슨에서는 push하지 않습니다
워크플로는 push해야 실행되므로, 이 레슨은 ts-wiki가 **이미 실행한 기록**을 읽어 보는 방식으로 진행합니다. 직접 실험은 내 저장소를 만든 뒤 [GitHub Pages 자동 배포](../part6-serve/05-github-pages)에서 합니다.
:::

## 핵심 사용법 1 — 워크플로 파일의 구조

워크플로는 YAML로 씁니다. 가장 작은 예는 이렇습니다.

```yaml
name: Hello

on:
  push:
    branches: [main]

jobs:
  say-hello:
    runs-on: ubuntu-latest
    steps:
      - run: echo "안녕하세요"
```

| 키 | 뜻 |
|---|---|
| `name` | Actions 탭에 표시될 워크플로 이름 |
| `on` | **trigger**. 언제 실행할지 |
| `jobs` | **job** 목록. 각 job은 이름(`say-hello`)을 가짐 |
| `runs-on` | **runner** 종류. `ubuntu-latest`는 GitHub가 제공하는 최신 우분투 가상 컴퓨터 |
| `steps` | **step** 목록. 위에서부터 차례로 실행 |
| `run` | step에서 셸 명령 실행 |
| `uses` | step에서 **action**(남이 만든 동작 묶음) 사용 |

### trigger — on

| 쓰는 법 | 실행되는 때 |
|---|---|
| `push: branches: [main]` | `main` 브랜치에 push될 때 |
| `pull_request:` | PR이 열리거나 갱신될 때 |
| `workflow_dispatch:` | Actions 탭의 **Run workflow** 버튼을 눌렀을 때(수동 실행) |
| `schedule: - cron: '0 0 * * *'` | 정해진 시각마다(UTC 기준) |

`workflow_dispatch:` 뒤에 아무 값이 없는 것이 이상해 보이지만, "이 trigger를 켠다"는 뜻으로 키만 적는 YAML 문법입니다.

### job과 step, runner

- **job은 서로 다른 runner(가상 컴퓨터)에서** 실행됩니다. job 사이에는 파일이 공유되지 않으므로, 넘길 것이 있으면 **artifact**로 올리고 받습니다.
- 기본적으로 job은 **동시에** 실행됩니다. 순서가 필요하면 `needs: 앞job`을 씁니다.
- **step은 같은 runner 안에서 차례로** 실행되므로 앞 step이 만든 파일을 뒤 step이 쓸 수 있습니다.

### action과 버전

`uses: actions/checkout@v4`는 "GitHub의 `actions/checkout` 저장소에 있는 action을, `v4` 태그 버전으로 쓴다"는 뜻입니다. `with:` 아래에 action의 입력값을 넣습니다.

### 표현식

워크플로 안에서는 **표현식**으로 실행 중의 정보(저장소 이름, 앞 step의 출력 등)를 꺼내 씁니다. 표현식은 달러 기호와 이중 중괄호로 감쌉니다.

```yaml
env:
  WIKI_BASE: /${{ github.event.repository.name }}/
```

`github.event.repository.name`은 "이 워크플로를 실행시킨 이벤트의 저장소 이름"입니다. ts-wiki에서는 `ts-wiki`가 되므로 `WIKI_BASE`는 `/ts-wiki/`가 됩니다.

::: danger 이 가이드를 쓸 때 주의
위 표현식은 **반드시 코드 블록 안에만** 씁니다. 본문이나 인라인 코드에 쓰면 VitePress가 Vue 템플릿으로 해석해 `Cannot read properties of undefined (reading 'event')`로 빌드가 깨집니다([3-2](./02-vite-vue)에서 실제로 확인). 본문에서는 `github.event.repository.name`처럼 중괄호 없이 이름만 씁니다.
:::

## 핵심 사용법 2 — permissions · concurrency · environment

### permissions — 워크플로에 줄 권한

워크플로가 실행될 때 GitHub는 **임시 토큰**(`GITHUB_TOKEN`)을 줍니다. `permissions`는 그 토큰이 할 수 있는 일을 정합니다. **필요한 것만** 주는 것이 원칙입니다.

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

| 권한 | 왜 필요한가 |
|---|---|
| `contents: read` | 저장소 코드를 읽기(checkout). 쓰기는 주지 않음 |
| `pages: write` | Pages에 배포하기 |
| `id-token: write` | 배포할 때 "이 요청은 정말 이 저장소의 워크플로에서 왔다"는 신원 증명 토큰(OIDC)을 발급받기. `deploy-pages`가 요구함 |

### concurrency — 동시에 하나만

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

짧은 간격으로 두 번 push하면 워크플로가 두 번 실행됩니다. 둘이 동시에 Pages에 배포하면 어느 쪽이 최종 결과가 될지 알 수 없습니다. `group: pages`로 묶으면 **같은 그룹은 한 번에 하나만** 실행되고 나머지는 기다립니다.

- `cancel-in-progress: false` — 이미 진행 중인 배포는 **끝까지 마치게** 둡니다. `true`면 새 실행이 오자마자 진행 중인 것을 취소합니다. 배포를 중간에 끊으면 상태가 어정쩡해질 수 있어 `false`를 씁니다(GitHub의 Pages 예제 워크플로도 이렇게 씁니다, 공식 문서 기준).

### environment — 배포 대상

```yaml
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

**environment**는 "이 job은 어디에 배포하는가"를 GitHub에 알려 주는 이름표입니다. `github-pages`는 Pages 배포용으로 GitHub가 정해 둔 환경 이름입니다. 이렇게 하면 저장소 첫 화면 오른쪽의 **Deployments**에 배포 기록과 주소가 표시되고, 환경별로 "어느 브랜치에서만 배포 가능" 같은 보호 규칙을 걸 수 있습니다. `url`은 그 기록에 링크로 표시될 주소로, 뒤 step(`id: deployment`)의 출력에서 가져옵니다.

## 핵심 사용법 3 — Pages 배포 액션 4종

| action | 하는 일 | ts-wiki에서 넘기는 값 |
|---|---|---|
| `actions/checkout@v4` | 저장소 코드를 runner에 내려받음(`git clone`과 비슷) | `fetch-depth: 0` |
| `actions/setup-node@v4` | 지정한 버전의 Node.js를 설치하고, npm 캐시를 저장·복원 | `node-version: 22`, `cache: npm` |
| `actions/upload-pages-artifact@v3` | 폴더를 Pages용 artifact(`github-pages`라는 이름의 압축 파일)로 올림 | `path: docs/.vitepress/dist` |
| `actions/deploy-pages@v4` | 올라간 artifact를 Pages에 공개 | (입력 없음) |

- `fetch-depth`는 내려받을 커밋 이력의 깊이입니다. 기본값은 1(최신 커밋 하나)이라 빠르지만, 그러면 모든 파일의 "마지막 수정"이 같은 시각이 됩니다. `0`은 **전체 이력**입니다.
- `cache: npm`은 `~/.npm` 폴더를 `package-lock.json` 내용 기준으로 캐시해, 다음 실행의 `npm ci`를 빠르게 합니다.

## ts-wiki에서는

`D:\workspace\ts-wiki\.github\workflows\deploy.yml` 전체(45줄)입니다.

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

| 줄 | 내용 | 설명 |
|---|---|---|
| 1 | 주석 | 이 파일이 하는 일 |
| 2 | `name: Deploy wiki` | Actions 탭에 보이는 이름 |
| 4~7 | `on: push: branches: [main]`, `workflow_dispatch:` | `main`에 push하면 자동, 또는 버튼으로 수동 실행 |
| 9~12 | `permissions` | 코드 읽기 + Pages 쓰기 + 신원 토큰. 그 밖의 권한은 없음 |
| 14~16 | `concurrency` | 배포는 한 번에 하나, 진행 중인 것은 끝까지 |
| 18~19 | `jobs:` → `build:` | 첫 번째 job: 빌드 |
| 20 | `runs-on: ubuntu-latest` | 우분투 runner |
| 22~24 | `actions/checkout@v4` + `fetch-depth: 0` | 전체 이력과 함께 코드 받기. `config.mts`의 `lastUpdated: true` 때문 |
| 25~28 | `actions/setup-node@v4` + `node-version: 22`, `cache: npm` | Node.js 22 설치, npm 캐시. Dockerfile의 `node:22-alpine`과 버전 계열을 맞춤 |
| 29 | `run: npm ci` | `package-lock.json` 그대로 설치 |
| 30~32 | `run: npm run build` + `env: WIKI_BASE` | 저장소 이름으로 `base`를 정해 빌드. `config.mts` 5줄의 `process.env.WIKI_BASE`가 이 값을 받음 |
| 33~35 | `actions/upload-pages-artifact@v3` + `path` | 빌드 결과 폴더를 artifact로 올림 |
| 37~38 | `deploy:` + `needs: build` | 두 번째 job: 배포. `build`가 **성공해야** 시작 |
| 39 | `runs-on: ubuntu-latest` | 새 runner(빌드한 컴퓨터와 다른 컴퓨터) |
| 40~42 | `environment` | `github-pages` 환경, 배포 기록에 주소 표시 |
| 44~45 | `id: deployment` + `actions/deploy-pages@v4` | artifact를 Pages에 공개. `id`를 붙여야 42줄에서 `steps.deployment.outputs.page_url`로 출력을 읽을 수 있음 |

job을 둘로 나눈 이유는 **권한과 실패 범위**를 분리하기 위해서입니다. 빌드가 실패하면(깨진 링크 등) `deploy` job은 아예 시작하지 않으므로 기존 사이트가 그대로 유지됩니다. `environment`도 배포 job에만 붙어 있습니다.

### 실제 실행 기록 읽기

ts-wiki 저장소는 공개 저장소라 실행 기록을 누구나 읽을 수 있습니다. `gh`로 최근 실행을 봅니다(읽기 전용).

```bash
gh run list -R Hong-coding/ts-wiki --limit 5
```

```text
completed	success	feat: TypeScript 마스터 위키 첫 공개	Deploy wiki	main	push	40592424236	1m16s	2026-10-27T22:08:11Z
```

상태(`completed success`), 커밋 메시지, 워크플로 이름(`Deploy wiki`, 2줄의 `name`), 브랜치(`main`), trigger(`push`), 실행 ID, 걸린 시간(1분 16초) 순서입니다.

```bash
gh run view 40592424236 -R Hong-coding/ts-wiki
```

```text
✓ main Deploy wiki · 40592424236
Triggered via push about 4 hours ago

JOBS
✓ build in 58s (ID 122499782648)
✓ deploy in 10s (ID 122500248809)

ANNOTATIONS
! Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4, actions/upload-artifact@v4. ...
- "The ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026. ..."
...
ARTIFACTS
github-pages
```

- `build`(58초) → `deploy`(10초) 순서로 실행됐습니다. `needs: build` 그대로입니다.
- `ARTIFACTS`의 `github-pages`가 `upload-pages-artifact`가 올린 상자입니다.
- **ANNOTATIONS**(주석)에 경고가 두 가지 있습니다. 하나는 "`@v4` 액션들이 내부적으로 Node.js 20을 대상으로 만들어졌는데, Node.js 20 지원이 끝나 Node.js 24로 강제 실행 중"이라는 안내이고, 다른 하나는 `ubuntu-latest`가 가리키는 우분투 버전이 바뀐다는 안내입니다. 지금은 실패가 아니라 경고지만, 언젠가 액션의 새 주 버전으로 올려야 한다는 신호입니다. 이 레슨의 `deploy.yml` 설명은 작성 시점(2026-10)의 `@v4`/`@v3` 기준이며, 새 버전이 나왔는지는 각 액션 저장소에서 확인합니다.

step별 로그는 `--log`로 봅니다. 주요 줄만 추렸습니다.

```bash
gh run view 40592424236 -R Hong-coding/ts-wiki --log
```

```text
build   ##[group]Run actions/checkout@v4
build   ##[group]Run actions/setup-node@v4
build   Found in cache @ /opt/hostedtoolcache/node/22.23.3/x64
build   npm cache is not found
build   ##[group]Run npm ci
build   added 137 packages, and audited 138 packages in 4s
build   ##[group]Run npm run build
build   build complete in 44.61s.
build   ##[group]Run actions/upload-pages-artifact@v3
build   ##[group]Run actions/upload-artifact@v4
build   Artifact github-pages has been successfully uploaded! Final size is 5546356 bytes. ...
build   Cache saved with the key: node-cache-Linux-x64-npm-d83e67ba...
deploy  ##[group]Run actions/deploy-pages@v4
deploy  Created deployment for 4880e10762d21be09b868480618eb450eba5b07b, ...
deploy  Reported success!
```

| 로그 | 의미 |
|---|---|
| `node/22.23.3` | `node-version: 22`로 받은 실제 Node.js는 22.23.3 (runner에 미리 깔린 것 사용) |
| `npm cache is not found` → `Cache saved with the key: ...` | 첫 실행이라 캐시가 없었고, 끝날 때 저장. 다음 실행부터 `npm ci`가 빨라짐 |
| `added 137 packages` | 연습 프로젝트(136개)보다 하나 많은 것은 ts-wiki에 `typescript`가 더 있기 때문 |
| `Run actions/upload-artifact@v4` | `upload-pages-artifact`가 내부에서 다시 `upload-artifact`를 부름. 위 경고에 `upload-artifact@v4`가 나온 이유 |
| `Final size is 5546356 bytes` | 압축된 사이트 약 5.5MB |
| `Created deployment for 4880e10...` | 어떤 커밋을 배포했는지 |

배포된 사이트가 `base`를 제대로 반영했는지도 확인합니다.

```bash
curl -s https://hong-coding.github.io/ts-wiki/ | grep -o 'href="/ts-wiki/assets/[^"]*"'
```

```text
href="/ts-wiki/assets/style.BjZkXpDW.css"
href="/ts-wiki/assets/inter-roman-latin.Di8DUHzh.woff2"
```

모든 경로 앞에 `/ts-wiki/`가 붙었습니다. `WIKI_BASE: /ts-wiki/`가 `base`로 들어간 결과입니다.

### 내 PC에서 같은 빌드를 흉내 내기

push 없이도 워크플로의 핵심 단계(`npm ci` → `WIKI_BASE`를 주고 `npm run build`)를 내 PC에서 재현할 수 있습니다. 연습 프로젝트의 `config.mts`에 ts-wiki처럼 `const base = process.env.WIKI_BASE ?? '/'`와 `base,`를 넣고 실행했습니다.

::: code-group

```powershell [Windows (PowerShell)]
$env:WIKI_BASE = '/mini-wiki/'
npm run build
Remove-Item Env:WIKI_BASE
```

```bash [macOS / Linux]
WIKI_BASE=/mini-wiki/ npm run build
```

:::

```text
build complete in 5.44s.
href="/mini-wiki/assets/style.D7acpx5e.css"
```

빌드된 `index.html`의 CSS 경로 앞에 `/mini-wiki/`가 붙었습니다.

::: warning Git Bash에서는 경로가 바뀝니다
Windows의 Git Bash에서 `WIKI_BASE=/mini-wiki/ npm run build`를 실행했더니 CSS 경로가 `C:/Program Files/Git/mini-wiki/assets/...`가 되었습니다. Git Bash가 `/`로 시작하는 환경 변수 값을 Windows 경로로 바꿔 넘기기 때문입니다. Windows에서는 PowerShell을 쓰거나, Git Bash에서는 `MSYS_NO_PATHCONV=1`을 함께 붙입니다. GitHub의 runner(우분투)에서는 이 문제가 없습니다.
:::

## 자주 하는 실수

**1. 배포된 사이트가 하얗고 CSS가 404**

- 증상: `https://계정.github.io/저장소/`에서 글자만 보임
- 원인: `base` 없이(`/`) 빌드했습니다. 워크플로에서 `WIKI_BASE`를 빠뜨렸거나, `config.mts`가 환경 변수를 읽지 않습니다.
- 해결: 빌드 step의 `env: WIKI_BASE`와 `config.mts`의 `base` 설정을 확인합니다. 배포된 HTML에서 `href="/저장소/assets/...`로 시작하는지 봅니다.

**2. `deploy` job이 권한 오류로 실패**

- 증상: `Ensure GITHUB_TOKEN has permission "id-token: write".` 같은 메시지
- 원인: `permissions`에 `pages: write`나 `id-token: write`가 빠졌습니다.
- 해결: 위의 세 줄 `permissions`를 넣습니다.

**3. 워크플로는 성공했는데 사이트가 안 열림(404)**

- 증상: Actions는 초록색, 주소는 GitHub 404 화면
- 원인: Settings → Pages의 Source가 "GitHub Actions"가 아닙니다.
- 해결: Source를 "GitHub Actions"로 바꾸고 Actions 탭에서 **Run workflow**(`workflow_dispatch`)로 다시 실행합니다.

**4. 모든 페이지의 "마지막 수정"이 같은 시각**

- 증상: 고치지 않은 레슨도 방금 수정된 것으로 표시
- 원인: `checkout`의 기본값 `fetch-depth: 1`이라 최신 커밋 하나만 받았습니다.
- 해결: `fetch-depth: 0`을 넣습니다.

**5. 이 가이드에 워크플로를 인용했더니 빌드 실패**

- 증상: `Cannot read properties of undefined (reading 'event')` 또는 `(reading 'deployment')`
- 원인: 표현식을 코드 블록 밖(본문·인라인 코드)에 썼습니다.
- 해결: 코드 블록 안으로 옮기고, 본문에서는 중괄호 없이 이름만 씁니다.

## 직접 해 보기

**과제 1 ⭐** `deploy.yml`에서 job, step, action, trigger에 해당하는 줄을 각각 하나씩 찾아 줄 번호를 적어 보세요.

::: details 힌트·정답 보기
trigger: 4~7줄(`on`), job: 19줄(`build:`)과 37줄(`deploy:`), step: 22줄 등 `- `로 시작하는 줄, action: 22줄 `actions/checkout@v4` 등 `uses:`가 있는 줄.
:::

**과제 2 ⭐** `gh run list -R Hong-coding/ts-wiki`로 최근 실행 기록을 보고, 가장 최근 실행의 상태와 걸린 시간을 적어 보세요(`gh`가 없으면 브라우저로 저장소의 Actions 탭을 엽니다).

::: details 힌트·정답 보기
출력의 첫 두 칸이 상태(`completed success` 등), 뒤에서 두 번째 칸이 걸린 시간입니다. 작성 시점에는 `1m16s`였고, 그 뒤 push가 있었다면 실행이 더 늘어나 있을 것입니다.
:::

**과제 3 ⭐⭐** `pull_request`가 열릴 때 **빌드만** 하고 배포는 하지 않는 워크플로를 설계해 보세요(파일로 써 보기만 하고 push는 하지 않습니다).

::: details 힌트·정답 보기
```yaml
name: Build check

on:
  pull_request:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
```
배포가 없으므로 `pages`, `id-token` 권한과 `upload-pages-artifact`, `deploy` job이 필요 없습니다. 깨진 링크가 있는 PR을 합치기 전에 잡아 줍니다.
:::

**과제 4 ⭐⭐** 내 PC에서 `WIKI_BASE`를 `/my-wiki/`로 주고 연습 프로젝트를 빌드한 뒤, `npm run preview`로 열어 `http://localhost:5191/my-wiki/`에서 페이지가 제대로 보이는지 확인하세요.

::: details 힌트·정답 보기
`config.mts`가 `process.env.WIKI_BASE`를 읽어야 합니다. 빌드 후 `preview`는 `base` 경로 아래에서 서비스합니다. 확인 후 환경 변수를 지웁니다(PowerShell: `Remove-Item Env:WIKI_BASE`).
:::

**과제 5 ⭐⭐⭐** `concurrency`를 빼면 어떤 문제가 생길 수 있는지, `cancel-in-progress: true`로 바꾸면 어떤 문제가 생길 수 있는지 각각 설명해 보세요.

::: details 힌트·정답 보기
빼면 연속 push 때 두 배포가 동시에 진행되어 늦게 시작한 쪽보다 먼저 시작한 쪽이 나중에 끝나, **옛 버전이 최종 결과로 남을** 수 있습니다. `true`로 바꾸면 새 push가 올 때 진행 중인 배포가 중간에 취소되어, 배포가 어정쩡한 상태로 끊길 수 있습니다.
:::

## 확인 퀴즈

**1.** job과 step의 차이는?

::: details 정답 보기
job은 별도의 runner(가상 컴퓨터)에서 실행되는 일 묶음이고, step은 한 job 안에서 같은 runner에서 차례로 실행되는 동작입니다.
:::

**2.** `build` job이 만든 `dist`를 `deploy` job은 어떻게 받나요?

::: details 정답 보기
`upload-pages-artifact`가 `github-pages`라는 artifact로 올리고, `deploy-pages`가 그 artifact를 Pages에 공개합니다. job끼리는 파일 시스템을 공유하지 않습니다.
:::

**3.** `fetch-depth: 0`이 필요한 이유는?

::: details 정답 보기
`lastUpdated`가 파일별 마지막 커밋 시각을 git 이력에서 읽는데, 기본값(1)은 최신 커밋만 받아 모든 파일의 시각이 같아지기 때문입니다.
:::

**4.** `permissions`에 `contents: write`를 주지 않은 이유는?

::: details 정답 보기
이 워크플로는 코드를 읽기만 하면 되므로, 필요 없는 쓰기 권한을 주지 않는 것이 안전합니다(최소 권한 원칙).
:::

**5.** `workflow_dispatch`는 언제 쓰나요?

::: details 정답 보기
코드를 push하지 않고 Actions 탭의 Run workflow 버튼으로 다시 배포하고 싶을 때(예: Pages 설정을 바꾼 직후) 씁니다.
:::

## 정리

- workflow(파일) ⊃ job(runner 하나) ⊃ step(명령 하나). step에서 `run`은 셸 명령, `uses`는 action입니다.
- ts-wiki는 `main` push 또는 수동 실행(`workflow_dispatch`)으로 시작합니다.
- `permissions`는 최소한으로(`contents: read`, `pages: write`, `id-token: write`), `concurrency`로 배포를 한 번에 하나씩 합니다.
- `build` job: checkout(`fetch-depth: 0`) → setup-node(22, npm 캐시) → `npm ci` → `WIKI_BASE`를 주고 build → artifact 업로드.
- `deploy` job: `needs: build`, `environment: github-pages`, `deploy-pages`로 공개합니다.
- 실제 기록: build 58초 + deploy 10초, artifact 약 5.5MB. Node.js 20 지원 종료 관련 경고가 있어 액션 버전을 언젠가 올려야 합니다.
- 표현식(이중 중괄호)은 이 가이드에서 코드 블록 안에만 씁니다.

## 다음 단계

라이브러리 사전을 모두 마쳤습니다. [Part 4. ts-wiki 해부하기](../part4-anatomy/)에서는 이 도구들이 ts-wiki의 각 파일에서 어떻게 맞물리는지 [폴더 구조와 파일의 역할](../part4-anatomy/01-folder-structure)부터 한 줄씩 읽어 나갑니다.
