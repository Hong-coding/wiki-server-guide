---
title: '준비물 설치: Node.js · Git · VS Code · Docker'
---

# 준비물 설치: Node.js · Git · VS Code · Docker

<LessonMeta level="입문" :minutes="50" prev="서버 공부는 켜고, 끄고, 망가뜨리고, 로그를 읽으며 한다" />

## 이번에 배울 것

- 이 가이드에 필요한 도구 네 가지(Node.js · Git · VS Code · Docker Desktop)가 각각 무슨 일을 하는지 말할 수 있다.
- Windows(중심)와 macOS에 네 도구를 설치할 수 있다.
- 터미널에서 버전 확인 명령으로 설치가 제대로 됐는지 확인할 수 있다.
- 설치 직후 자주 나는 "명령을 찾을 수 없음" 문제를 스스로 해결할 수 있다.

## 먼저 알아 둘 것

- [서버 구축을 공부하는 법](./02-how-to-study)의 "터미널 여는 법"
- 관리자 권한: 설치 프로그램 실행 중 "이 앱이 디바이스를 변경할 수 있도록 허용하시겠어요?"가 뜰 수 있습니다. 회사 PC라면 설치 권한이 막혀 있을 수 있으니 IT 담당자에게 먼저 확인합니다.

## 비유로 이해하기

위키 서버 만들기를 **요리**에 비유하면, 네 도구는 이렇게 나뉩니다.

| 도구 | 요리에 비유하면 | 이 가이드에서 하는 일 |
|---|---|---|
| Node.js | 가스레인지(불) | VitePress를 실행해 마크다운을 HTML로 굽습니다. |
| Git | 레시피 노트의 수정 기록 | 문서가 언제 어떻게 바뀌었는지 저장하고, GitHub에 올립니다. |
| VS Code | 도마와 칼(작업대) | 파일을 열어 고치고, 터미널도 그 안에서 엽니다. |
| Docker Desktop | 도시락 통 | 완성된 사이트와 nginx를 상자에 담아 어디서나 똑같이 띄웁니다. |

가스레인지(Node.js)가 없으면 아예 요리를 못 하고, 도시락 통(Docker)은 손님에게 가져갈 때(Part 6) 필요합니다. 그래서 **Node.js → Git → VS Code → Docker** 순서로 설치합니다.

## 따라 하기

### 1단계. Node.js 설치

**Node.js**는 브라우저 밖에서 JavaScript 프로그램을 실행해 주는 프로그램입니다. VitePress가 JavaScript로 만들어졌기 때문에 꼭 필요합니다. Node.js를 설치하면 패키지(남이 만든 프로그램 묶음)를 내려받는 도구인 **npm**과, 패키지를 설치 없이 바로 실행하는 **npx**가 함께 설치됩니다.

#### 어떤 버전을 설치하나: LTS

Node.js 공식 사이트(`https://nodejs.org`)에 가면 버전이 두 종류로 나뉘어 있습니다.

- **LTS**(Long Term Support, 장기 지원): 오래 안정적으로 고쳐 주는 버전. **이것을 설치합니다.**
- **Current**(최신): 새 기능이 먼저 들어가는 버전. 실험용입니다.

어떤 번호가 LTS인지는 시기마다 바뀌므로 공식 사이트의 LTS 표시를 따릅니다(작성 시점 기준, 공식 페이지에서 확인). ts-wiki의 `README.md`는 **Node.js 20 이상**을 요구하고, ts-wiki의 Docker 빌드와 GitHub Actions는 **Node.js 22**를 씁니다. 이 가이드의 출력은 작성 PC의 **Node.js 24.13.1 / npm 11.8.0**에서 실제로 실행한 결과입니다.

#### Windows

1. `https://nodejs.org`에서 LTS 버전의 **Windows Installer(.msi)** 를 내려받습니다.
2. 내려받은 파일을 실행하고 기본값 그대로 **Next**를 눌러 진행합니다. "Add to PATH" 항목이 켜져 있는지 확인합니다(기본으로 켜져 있습니다).
3. 설치가 끝나면 **열려 있던 터미널을 모두 닫고 새로 엽니다.** (이유는 "자주 하는 실수" 1번)

#### macOS

`https://nodejs.org`에서 LTS 버전의 **macOS Installer(.pkg)** 를 내려받아 실행합니다. Homebrew(macOS용 패키지 관리자)를 이미 쓰고 있다면 `brew install node`로도 설치할 수 있습니다(Homebrew 공식 문서 기준).

#### 확인

```powershell
node -v
npm -v
```

실제 출력(작성 PC):

```text
v24.13.1
11.8.0
```

**확인 방법**: `node -v`가 `v20` 이상의 숫자를, `npm -v`가 숫자를 출력하면 성공입니다. 설치된 위치도 확인해 볼 수 있습니다.

```powershell
# Windows: 명령이 어디 있는지 찾기
where.exe node npm
```

```text
C:\Program Files\nodejs\node.exe
C:\Program Files\nodejs\npm
C:\Program Files\nodejs\npm.cmd
```

```bash
# macOS/Linux
which node npm
```

간단한 JavaScript 한 줄을 실행해 Node.js가 정말 동작하는지도 봅니다.

```powershell
node -e "console.log('안녕하세요, Node.js ' + process.version)"
```

```text
안녕하세요, Node.js v24.13.1
```

::: info 버전 관리자: nvm-windows · fnm (소개만)
프로젝트마다 다른 Node.js 버전이 필요해지면 **버전 관리자**를 씁니다. 여러 버전을 설치해 두고 명령 하나로 바꿔 쓰는 도구입니다.

- **nvm-windows**: Windows용. `nvm install`, `nvm use` 같은 명령으로 버전을 바꿉니다.
- **fnm**(Fast Node Manager): Windows·macOS·Linux 공용. 폴더에 들어가면 그 프로젝트가 원하는 버전으로 자동 전환하는 기능이 있습니다.
- macOS·Linux에서는 **nvm**도 많이 씁니다.

처음에는 공식 설치 프로그램 하나로 충분합니다. 공식 설치 프로그램과 버전 관리자를 **동시에** 쓰면 어느 `node`가 실행되는지 헷갈리므로, 버전 관리자로 바꿀 때는 기존 Node.js를 먼저 제거합니다(각 도구의 공식 문서 기준). 이 가이드는 버전 관리자 없이 진행합니다.
:::

### 2단계. Git 설치

**Git**은 파일의 변경 이력을 저장하는 프로그램입니다. "어제 고친 것을 되돌리기", "누가 이 줄을 바꿨는지 보기", "GitHub에 올리기"를 모두 Git으로 합니다. ts-wiki를 GitHub Pages에 배포할 때(Part 6), 실습용 복사본을 만들 때(`git clone`) 필요합니다.

#### Windows

1. `https://git-scm.com`에서 **Download for Windows**를 눌러 설치 파일을 받습니다.
2. 설치 중 질문이 많이 나오지만 **기본값 그대로** 진행해도 됩니다. 기본 편집기 선택 화면에서 VS Code를 고르면 나중에 편합니다(VS Code를 먼저 설치했다면 목록에 보입니다).
3. 설치가 끝나면 터미널을 새로 엽니다.

#### macOS

터미널에서 `git --version`을 처음 실행하면, Git이 없을 경우 "명령어 라인 개발자 도구"를 설치하겠냐는 창이 뜹니다. **설치**를 누르면 Git이 함께 설치됩니다. Homebrew를 쓴다면 `brew install git`도 됩니다.

#### 확인

```powershell
git --version
```

```text
git version 2.42.0.windows.1
```

**확인 방법**: `git version 2.`로 시작하는 줄이 나오면 성공입니다.

#### 처음 한 번: 이름과 이메일 등록

Git은 변경을 저장(commit)할 때마다 "누가 했는지"를 함께 적습니다. 처음 한 번 등록해 둡니다.

```bash
git config --global user.name "<내 이름>"
git config --global user.email "<내 이메일>"
```

이 명령은 성공하면 아무것도 출력하지 않습니다. 확인은 다음 명령으로 합니다.

```bash
git config --global user.name
```

방금 넣은 이름이 출력되면 성공입니다. 여기 넣은 이메일은 GitHub에 올리면 공개될 수 있으니, 공개해도 되는 주소를 씁니다.

### 3단계. VS Code 설치

**VS Code**(Visual Studio Code)는 Microsoft가 만든 무료 코드 편집기입니다. 마크다운·TypeScript·Vue 파일을 색깔 구분해 보여 주고, 아래쪽에 터미널을 열 수 있어 이 가이드의 거의 모든 작업을 한 창에서 할 수 있습니다.

#### Windows

1. `https://code.visualstudio.com`에서 **Download for Windows**를 받습니다.
2. 설치 중 **"PATH에 추가"** 와 **"탐색기 파일/디렉터리 상황에 맞는 메뉴에 'Code(으)로 열기' 작업 추가"** 를 체크합니다. 앞의 것은 터미널에서 `code` 명령을 쓰기 위해, 뒤의 것은 폴더를 오른쪽 클릭으로 바로 열기 위해 필요합니다.

#### macOS

1. 같은 사이트에서 macOS용 파일을 받아 압축을 풀고, `Visual Studio Code.app`을 **응용 프로그램** 폴더로 옮깁니다.
2. 터미널에서 `code` 명령을 쓰려면 VS Code를 열고 `Cmd+Shift+P` → `Shell Command: Install 'code' command in PATH`를 실행합니다.

#### 확인

```powershell
code --version
```

```text
1.143.1
e646868227c3e3a9e3f24277c8c7220be42c0be7
x64
```

첫 줄이 버전, 둘째 줄이 그 버전의 고유 번호(커밋 해시), 셋째 줄이 CPU 종류입니다. 숫자는 VS Code가 자동 업데이트되면서 계속 바뀝니다.

**확인 방법**: 숫자 세 줄이 나오면 성공입니다. 이제 프로젝트 폴더에서 `code .`(점은 "지금 폴더"라는 뜻)을 실행하면 VS Code가 그 폴더를 열고 뜹니다.

::: tip 추천 확장 (선택)
VS Code 왼쪽의 확장(Extensions) 아이콘에서 검색해 설치합니다.
- **Vue - Official**: ts-wiki의 `.vue` 컴포넌트 파일을 읽기 쉽게 색칠해 줍니다.
- **Docker**(Microsoft): Dockerfile·compose 파일을 읽기 쉽게 하고 컨테이너 목록을 보여 줍니다.

확장 이름은 바뀔 수 있으니 마켓플레이스에서 게시자를 확인하고 설치합니다(작성 시점 기준).
:::

### 4단계. Docker Desktop 설치

**Docker**는 프로그램과 그 프로그램이 필요한 모든 것을 **컨테이너**라는 상자에 담아 실행하는 도구입니다. ts-wiki는 Docker로 "빌드된 HTML + nginx"를 한 상자에 담아 사내 서버에 상시 띄웁니다. **Docker Desktop**은 Windows·macOS에서 Docker를 쓰게 해 주는 앱입니다.

Docker는 Part 3의 [Docker와 Docker Compose](../part3-libraries/06-docker)와 Part 6에서 본격적으로 씁니다. 지금 설치가 어렵다면 나중으로 미뤄도 Part 1~2는 따라올 수 있습니다.

#### Windows

1. `https://www.docker.com/products/docker-desktop/`에서 Windows용 설치 파일을 받습니다.
2. 설치 중 **"Use WSL 2 instead of Hyper-V"**(또는 비슷한 WSL 2 항목)를 켜 둔 채 진행합니다. WSL 2는 Windows 안에서 리눅스를 돌리는 기능으로, Docker 컨테이너가 그 위에서 실행됩니다.
3. 설치가 끝나면 재부팅을 요구할 수 있습니다.
4. 재부팅 후 **Docker Desktop 앱을 실행**합니다. 처음 실행하면 이용 약관 동의 화면이 나올 수 있습니다. 약관은 직접 읽고 판단합니다.

::: warning 이용 조건 확인
Docker Desktop은 개인·소규모 사용은 무료지만, 일정 규모 이상의 회사에서 쓰려면 유료 구독이 필요하다는 조건이 있습니다(작성 시점 기준, 공식 페이지에서 확인). 회사 PC라면 설치 전에 담당 부서에 확인합니다.
:::

#### macOS

같은 페이지에서 내 Mac의 칩에 맞는 파일(Apple 칩 / Intel 칩)을 받아 `Docker.app`을 응용 프로그램 폴더로 옮기고 실행합니다. Mac의 칩 종류는 화면 왼쪽 위 Apple 메뉴 → **이 Mac에 관하여**에서 볼 수 있습니다.

#### 확인

Docker는 확인할 것이 두 가지입니다. **명령이 설치됐는가**, 그리고 **Docker 엔진(실제로 컨테이너를 돌리는 부분)이 켜져 있는가**입니다.

```powershell
docker --version
docker compose version
```

```text
Docker version 25.0.3, build 4debf41
Docker Compose version v2.24.5-desktop.1
```

여기까지는 명령만 있으면 나옵니다. 엔진이 켜져 있는지는 `docker version`으로 봅니다.

```powershell
docker version
```

```text
Client:
 Cloud integration: v1.0.35+desktop.10
 Version:           25.0.3
 API version:       1.44
 ...
 OS/Arch:           windows/amd64
 Context:           default

Server: Docker Desktop 4.27.2 (137060)
 Engine:
  Version:          25.0.3
  API version:      1.44 (minimum version 1.24)
  ...
  OS/Arch:          linux/amd64
```

- `Client:` 부분은 내가 명령을 입력하는 쪽(`docker` 명령)입니다. `windows/amd64`라고 나옵니다.
- `Server:` 부분은 실제로 컨테이너를 돌리는 엔진입니다. `linux/amd64`라고 나옵니다. Windows PC에서도 컨테이너는 WSL 2 안의 **리눅스**에서 돈다는 뜻입니다. ts-wiki의 `Dockerfile`이 `node:22-alpine`, `nginx:1.27-alpine` 같은 리눅스(Alpine Linux) 이미지를 쓸 수 있는 이유입니다.

**확인 방법**: `docker version`의 출력에 **`Server:` 부분이 있으면** 성공입니다. `Client:`만 나오고 그 아래에 에러가 나오면 Docker Desktop 앱이 아직 켜져 있지 않은 것입니다("자주 하는 실수" 3번).

### 5단계. 한꺼번에 점검하기

설치가 끝났으면 **새 터미널**을 열고 다섯 줄을 한 번에 실행해 봅니다.

```powershell
node -v; npm -v; git --version; code --version; docker --version
```

macOS/Linux의 bash·zsh에서도 `;`로 명령을 이어 쓸 수 있으므로 같은 줄을 그대로 쓰면 됩니다.

```text
v24.13.1
11.8.0
git version 2.42.0.windows.1
1.143.1
e646868227c3e3a9e3f24277c8c7220be42c0be7
x64
Docker version 25.0.3, build 4debf41
```

**확인 방법**: 다섯 도구 모두 에러 없이 버전이 나오면 준비 완료입니다. 이 출력은 질문할 때 "환경" 정보로 그대로 붙여 넣기 좋으니 메모해 둡니다.

## ts-wiki에서는

ts-wiki의 파일들이 이 도구들을 어떻게 요구하는지 연결해 봅니다.

| 도구 | ts-wiki에서 필요한 곳 | 근거 |
|---|---|---|
| Node.js | 개발 서버·빌드 | `README.md`: "Node.js 20 이상이 필요합니다." |
| Node.js 22 | Docker 빌드 | `Dockerfile`: `FROM node:22-alpine AS build` |
| Node.js 22 | GitHub Actions 빌드 | `.github/workflows/deploy.yml`: `node-version: 22` |
| npm | 패키지 설치·스크립트 실행 | `package.json`의 `scripts`, `devDependencies` |
| Git | 이력 관리·배포 | `.gitignore`, `.gitattributes`, `main`에 push하면 배포 |
| Docker | 사내 서버 상시 운영 | `Dockerfile`, `docker-compose.yml`, `nginx.conf` |

`.github/workflows/deploy.yml`의 25~28번째 줄은 GitHub의 빌드 서버에 Node.js 22를 설치하라는 뜻입니다. 내 PC가 아니라 **GitHub의 컴퓨터에** Node.js를 설치하는 부분이라, 내 PC의 Node.js 버전(24)과 달라도 됩니다.

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
```

`.gitattributes`는 Git 설치와 관련해 알아 둘 설정입니다.

```text
* text=auto eol=lf
*.png binary
*.jpg binary
```

Windows는 줄바꿈을 CRLF(두 글자), macOS·Linux는 LF(한 글자)로 저장하는 전통이 있습니다. 이 파일의 `eol=lf`는 "저장소 안에서는 줄바꿈을 LF로 통일한다"는 뜻이라, Windows에서 Git을 기본값으로 설치했어도 리눅스 컨테이너·GitHub Actions에서 같은 파일로 빌드됩니다. 이미지(`*.png`, `*.jpg`)는 글자가 아니므로 `binary`로 지정해 줄바꿈 변환을 하지 않게 했습니다.

ts-wiki `package.json`의 `devDependencies`에는 VitePress·Vue·TypeScript가 있지만, 이것들은 **따로 설치하지 않습니다.** 프로젝트 폴더에서 `npm install`(또는 `npm ci`)을 하면 npm이 알아서 받아 옵니다. 이번 레슨에서 직접 설치하는 것은 그 npm을 실행해 줄 Node.js까지입니다.

## 자주 하는 실수

### 1. 설치했는데 "인식되지 않습니다"

- **증상**: PowerShell에서 `node -v`를 입력하면 `'node' 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다.` 같은 빨간 메시지가 나옵니다. (명령 프롬프트에서는 `'node'은(는) 내부 또는 외부 명령...이 아닙니다`)
- **원인**: 설치 프로그램은 **PATH**(터미널이 명령을 찾아보는 폴더 목록)에 Node.js 폴더를 추가합니다. 그런데 이미 열려 있던 터미널은 설치 **전의** PATH를 기억하고 있습니다.
- **해결**: 터미널을 **모두 닫고 새로 엽니다.** VS Code 안의 터미널이라면 VS Code 자체를 껐다 켭니다. 그래도 안 되면 PC를 재시작하고, 그래도 안 되면 설치 중 "Add to PATH"를 껐는지 확인해 다시 설치합니다.

### 2. PowerShell에서 npm만 "스크립트를 실행할 수 없습니다"

- **증상**: `node -v`는 되는데 `npm -v`를 입력하면 `npm.ps1 파일을 로드할 수 없습니다. ... 이 시스템에서 스크립트를 실행할 수 없으므로` 같은 메시지가 나옵니다.
- **원인**: Windows PowerShell은 보안을 위해 스크립트 파일(`.ps1`) 실행을 막는 **실행 정책**을 가지고 있습니다. npm은 Windows에서 `npm.ps1`이라는 스크립트로도 설치되는데, 이것이 막힌 것입니다.
- **해결**: 가장 간단한 우회는 `npm.cmd -v`처럼 `.cmd`를 붙여 실행하거나, 명령 프롬프트(cmd)·VS Code 터미널의 다른 셸을 쓰는 것입니다. 실행 정책을 바꾸는 방법(`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, Microsoft 공식 문서 기준)도 있지만, **보안 설정을 바꾸는 일**이므로 회사 PC라면 담당 부서에 먼저 확인합니다.

### 3. docker 명령은 되는데 엔진에 연결이 안 된다

- **증상**: `docker --version`은 나오는데, `docker version`을 하면 `Client:` 부분 뒤에 `error during connect` 같은 메시지와 함께 `docker_engine`에 연결할 수 없다는 내용이 나옵니다. (정확한 문장은 Docker 버전마다 다를 수 있습니다)
- **원인**: `docker` 명령(클라이언트)은 설치됐지만, 실제로 컨테이너를 돌리는 엔진(서버)인 **Docker Desktop 앱이 꺼져 있습니다.**
- **해결**: 시작 메뉴에서 Docker Desktop을 실행하고, 앱 화면 아래쪽 상태가 "Engine running"(엔진 실행 중)이 될 때까지 기다린 뒤 다시 `docker version`을 실행합니다. 매번 켜기 번거롭다면 Docker Desktop 설정에서 "로그인 시 시작"을 켭니다.

### 4. WSL 2 관련 메시지로 Docker Desktop이 시작되지 않는다

- **증상**: Docker Desktop을 켜면 WSL 2를 설치·업데이트하라는 창이 뜨고 엔진이 시작되지 않습니다.
- **원인**: Windows의 WSL 2 기능이 꺼져 있거나 오래되었습니다. BIOS에서 가상화 기능이 꺼져 있는 경우도 있습니다.
- **해결**: 관리자 권한 PowerShell에서 `wsl --update`를 실행하라는 안내가 화면에 나오면 그대로 따릅니다(Microsoft·Docker 공식 문서 기준). 가상화 기능 같은 BIOS 설정은 PC마다 다르므로, 회사 PC라면 IT 담당자에게 요청합니다.

## 직접 해 보기

### 과제 1 ⭐ 다섯 줄 점검

새 터미널에서 "5단계. 한꺼번에 점검하기"의 명령을 실행하고, 출력을 메모장에 저장해 둡니다.

::: details 확인 방법
다섯 도구 모두 버전이 출력되면 성공입니다. 하나라도 "인식되지 않습니다"가 나오면 "자주 하는 실수" 1번부터 봅니다. 이 메모는 나중에 질문할 때 "환경" 칸에 붙여 넣습니다.
:::

### 과제 2 ⭐ node로 계산하기

`node -e` 뒤에 따옴표로 JavaScript를 넣어 `3000 + 3500`을 계산해 출력해 봅니다.

::: details 정답 보기
```powershell
node -e "console.log(3000 + 3500)"
```

```text
6500
```

Node.js가 브라우저 없이 JavaScript를 실행했습니다. VitePress도 이런 식으로 Node.js 위에서 실행됩니다.
:::

### 과제 3 ⭐⭐ VS Code로 ts-wiki 열기

ts-wiki 폴더(또는 지난 레슨에서 만든 실습용 복사본)로 이동해 `code .`을 실행하고, VS Code 왼쪽 파일 목록에서 `package.json`, `Dockerfile`, `docs/.vitepress/config.mts`를 찾아 열어 봅니다.

::: details 힌트
`code`가 인식되지 않으면 VS Code 설치 중 "PATH에 추가"를 체크하지 않은 것입니다. VS Code를 다시 설치하거나(Windows), `Shell Command: Install 'code' command in PATH`를 실행합니다(macOS). 그 뒤 터미널을 새로 엽니다.
:::

### 과제 4 ⭐⭐⭐ Client와 Server 구분하기

Docker Desktop을 **끈 상태**에서 `docker version`을 실행하고, 다시 **켠 상태**에서 실행해 두 출력을 비교합니다. 무엇이 달라지나요?

::: details 정답 보기
꺼진 상태에서는 `Client:` 부분만 나오고 그 뒤에 엔진에 연결할 수 없다는 에러가 나옵니다. 켠 상태에서는 `Server: Docker Desktop ...` 부분까지 나옵니다. `docker`는 명령을 받아 엔진에 전달하는 **클라이언트**이고, 실제 일은 **서버**(엔진)가 한다는 것을 보여 주는 실험입니다. 이 "클라이언트 → 서버" 구조는 다음 파트의 브라우저와 웹 서버 관계와 같습니다.
:::

## 확인 퀴즈

1. Node.js를 설치하면 함께 설치되는 명령 두 가지는 무엇인가요?
2. Node.js를 내려받을 때 LTS와 Current 중 무엇을 고르나요? 이유는?
3. 설치 후 "인식되지 않습니다"가 나오면 가장 먼저 할 일은 무엇인가요?
4. `docker --version`은 되는데 `docker version`에 `Server:`가 없습니다. 무엇을 확인하나요?
5. ts-wiki의 VitePress·Vue·TypeScript는 따로 설치해야 하나요?

::: details 정답 보기
1. `npm`과 `npx`입니다.
2. LTS입니다. 오래 안정적으로 유지·보수되는 버전이기 때문입니다.
3. 터미널을 모두 닫고 새로 엽니다(PATH를 다시 읽게 하기 위해).
4. Docker Desktop 앱이 실행 중이고 엔진이 시작됐는지 확인합니다.
5. 아닙니다. 프로젝트 폴더에서 `npm install`(또는 `npm ci`)을 하면 `package.json`을 보고 npm이 받아 옵니다.
:::

## 정리

- **Node.js**(+npm·npx)는 VitePress를 실행하는 불, **Git**은 이력 관리와 배포, **VS Code**는 작업대, **Docker Desktop**은 사이트를 상자에 담는 도구입니다.
- Node.js는 **LTS**를 설치합니다. ts-wiki는 20 이상이 필요하고, Docker·Actions 빌드는 22를 씁니다.
- 확인 명령: `node -v`, `npm -v`, `git --version`, `code --version`, `docker --version`, `docker version`(엔진 확인).
- 설치 후 명령이 인식되지 않으면 **터미널을 새로 엽니다.**
- Docker는 명령(Client)과 엔진(Server)이 따로이고, 엔진은 Docker Desktop 앱이 켜져 있어야 동작합니다.

## 다음 단계

도구가 모두 준비됐습니다. [Part 1. 웹 서버 기초 개념](../part1-concepts/)에서 브라우저에 페이지가 뜨기까지 무슨 일이 일어나는지, 방금 설치한 Node.js로 직접 확인하며 배웁니다.
