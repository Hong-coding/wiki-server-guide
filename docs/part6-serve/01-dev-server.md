---
title: '개발 서버: npm run dev와 포트'
---

# 개발 서버: npm run dev와 포트

<LessonMeta level="실전" :minutes="40" prev="빌드 결과물을 미리보기 서버로 열어 확인했습니다" />

## 이번에 배울 것

- `npm run dev`를 실행하면 내부에서 어떤 일이 일어나는지(Vite 개발 서버, HMR, 요청 시 컴파일) 설명할 수 있다.
- `--host 0.0.0.0`을 줄 때와 안 줄 때 누가 접속할 수 있는지 차이를 직접 확인할 수 있다.
- `--port`로 포트를 바꾸고, 포트가 이미 쓰이고 있을 때 서버가 어떻게 행동하는지 설명할 수 있다.
- 같은 네트워크의 다른 기기에서 접속하는 방법과, 막힐 때 Windows 방화벽에서 무엇을 확인해야 하는지 안다.
- 개발 서버를 안전하게 끄고, 남은 프로세스를 찾아 정리할 수 있다.

## 먼저 알아 둘 것

- 포트·localhost·IP의 뜻: [localhost · 포트 · 호스트 · IP](../part1-concepts/03-localhost-port-host)
- npm 스크립트: [Node.js와 npm](../part1-concepts/04-node-npm), [package.json과 npm 스크립트](../part4-anatomy/02-package-json)
- Vite가 무엇인지: [Vite와 Vue](../part3-libraries/02-vite-vue)

## 비유로 이해하기

개발 서버는 **주방이 손님 바로 앞에 있는 즉석 요리 코너**와 비슷합니다.

- 손님(브라우저)이 "이 메뉴(페이지) 주세요" 하면 그때 재료(마크다운)를 꺼내 요리(HTML·JS로 변환)해서 내줍니다. 미리 만들어 두지 않습니다. → **요청 시 컴파일**
- 요리사가 레시피(파일)를 고치면 이미 나간 접시에 고친 부분만 바로 얹어 줍니다. 손님은 다시 주문하지 않아도 됩니다. → **HMR**
- 코너에는 번호표(포트)가 붙어 있습니다. 5180번 코너에 이미 요리사가 있으면, 다음 요리사는 옆 5181번 코너로 갑니다. → **포트 충돌 시 다음 번호로 이동**
- 창구를 가게 안쪽에만 열지(localhost), 길가 쪽에도 열지(0.0.0.0) 정할 수 있습니다. → **`--host`**

반면 6-2에서 배울 정적 서버는 **도시락 가게**입니다. 미리 다 만들어 둔 도시락(빌드 결과물)을 꺼내 주기만 합니다. 빠르지만 레시피를 고치면 도시락을 다시 싸야(다시 빌드) 합니다.

## 따라 하기

### 1단계. 실습용 복사본 만들기

원본을 지키기 위해 복사본에서 실습합니다. `node_modules`(설치된 패키지), `dist`(빌드 결과물), `cache`, `.git`은 빼고 복사합니다. 복사할 위치 `D:\practice\ts-wiki`는 예시이므로 원하는 곳으로 바꿔도 됩니다.

Windows(PowerShell):

```powershell
robocopy D:\workspace\ts-wiki D:\practice\ts-wiki /E /XD node_modules dist cache .git
cd D:\practice\ts-wiki
npm ci
```

macOS/Linux(bash):

```bash
mkdir -p ~/practice/ts-wiki
cd ~/workspace/ts-wiki
tar --exclude=node_modules --exclude=dist --exclude=cache --exclude=.git -cf - . | (cd ~/practice/ts-wiki && tar -xf -)
cd ~/practice/ts-wiki
npm ci
```

실제 출력(robocopy 요약 부분):

```text
   Bytes :    2.81 m    2.81 m         0         0         0         0
...
```

- `robocopy`의 `/E`는 하위 폴더까지, `/XD`는 "이 이름의 폴더는 빼라(eXclude Directory)"입니다.
- `npm ci`는 `package-lock.json`에 적힌 버전 그대로 패키지를 설치합니다. 복사본에는 `node_modules`가 없으므로 꼭 필요합니다.

::: info robocopy의 종료 코드
robocopy는 파일을 복사했을 때 종료 코드 1을 돌려줍니다. 다른 명령과 달리 0~7은 성공, 8 이상이 실패입니다. 터미널에 "Exit code 1"이 보여도 놀라지 않아도 됩니다.
:::

**확인 방법**: 복사본 폴더에 `docs`, `package.json`, `Dockerfile`이 있고, `npm ci` 뒤에 `node_modules` 폴더가 생기면 성공입니다.

### 2단계. `npm run dev`가 실제로 실행하는 명령 보기

ts-wiki의 `package.json`에는 이렇게 적혀 있습니다.

```json
"scripts": {
  "dev": "vitepress dev docs --host 0.0.0.0 --port 5180",
  "build": "vitepress build docs",
  "fix:frontmatter": "node scripts/fix-frontmatter.mjs",
  "preview": "vitepress preview docs --host 0.0.0.0 --port 5180"
}
```

`npm run dev`는 결국 `vitepress dev docs --host 0.0.0.0 --port 5180`을 실행하라는 뜻입니다. 한 조각씩 보면 이렇습니다.

| 조각 | 뜻 |
|---|---|
| `vitepress` | `node_modules/.bin/vitepress` 프로그램 |
| `dev` | 개발 서버 모드로 실행 |
| `docs` | 문서가 들어 있는 폴더(이 폴더의 `.vitepress/config.mts`를 읽습니다) |
| `--host 0.0.0.0` | 이 PC의 모든 네트워크 주소에서 접속을 받음 |
| `--port 5180` | 5180번 포트에서 기다림 |

5180번은 원본 위키가 이미 쓰고 있을 수 있으므로, 실습에서는 `npx`로 같은 명령을 포트만 바꿔 직접 실행합니다. `npx`는 `node_modules/.bin`에 있는 프로그램을 찾아 실행해 주는 도구입니다.

```bash
npx vitepress dev docs --host 0.0.0.0 --port 5190
```

실제 출력:

```text
  vitepress v1.6.3

  ➜  Local:   http://localhost:5190/
  ➜  Network: http://<이 PC의 IP>:5190/
```

- `Local`은 이 PC에서 접속하는 주소, `Network`는 같은 네트워크의 다른 기기에서 접속하는 주소입니다.
- 랜카드·VPN·WSL 같은 가상 네트워크가 여러 개면 `Network` 줄도 여러 개 나옵니다. 작성 PC에서는 4줄이 나왔습니다. 다른 기기에서 쓸 주소는 보통 공유기에서 받은 `192.168.`으로 시작하는 주소입니다.
- 이 터미널은 이제 서버가 차지하고 있어서 다른 명령을 칠 수 없습니다. 서버는 **터미널이 열려 있는 동안만** 살아 있습니다.

**확인 방법**: 브라우저에서 `http://localhost:5190`을 열어 위키 홈이 뜨면 성공입니다. 터미널을 하나 더 열어 `curl`로도 확인할 수 있습니다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5190/
```

```text
200
```

`200`은 "정상적으로 응답했다"는 HTTP 상태 코드입니다.

::: warning npm run dev 뒤에 포트를 덧붙이면 안 됩니다
`npm run dev -- --port 5194`처럼 쓰면 `--` 뒤의 인자가 스크립트 끝에 **덧붙여질 뿐** 기존 `--port 5180`을 바꾸지 않습니다. 작성 시점에 실제로 실행하면 포트가 두 개 들어가 서버가 죽습니다.

```text
> ts-wiki@1.0.0 dev
> vitepress dev docs --host 0.0.0.0 --port 5180 --port 5194

TypeError [ERR_INVALID_ARG_VALUE]: The argument 'options' must have the property "port" or "path". Received [ 5180, 5194 ]
```

포트를 바꾸려면 `npx vitepress dev docs --port 5194`처럼 직접 실행하거나, `package.json`의 숫자를 고칩니다.
:::

### 3단계. 개발 서버가 하는 일: 요청 시 컴파일과 HMR

개발 서버는 시작할 때 모든 페이지를 만들어 두지 않습니다. 75개가 넘는 ts-wiki 레슨을 시작할 때 다 변환하면 수십 초가 걸리기 때문입니다. 대신 **브라우저가 어떤 페이지를 요청한 순간** 그 마크다운 하나만 JavaScript 모듈로 변환합니다.

같은 페이지 모듈을 두 번 요청해 시간을 재 보면 차이가 보입니다.

```bash
curl -s -o /dev/null -w "%{http_code} %{time_total}s %{size_download}B\n" "http://localhost:5190/part1-basics/02-primitive-types.md?import"
curl -s -o /dev/null -w "%{http_code} %{time_total}s %{size_download}B\n" "http://localhost:5190/part1-basics/02-primitive-types.md?import"
```

실제 출력:

```text
200 1.500549s 305276B
200 0.258905s 305276B
```

- 첫 요청은 1.5초: 이때 마크다운 → Vue 컴포넌트 → JavaScript로 변환했습니다.
- 두 번째는 0.26초: 변환 결과를 메모리에 두었다가 그대로 돌려줬습니다.
- `?import`는 브라우저가 페이지 모듈을 가져올 때 붙이는 표시입니다. 여기서는 브라우저 흉내를 내려고 붙였습니다.

변환된 내용의 첫 부분을 보면 HMR의 흔적이 있습니다.

```text
import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/part1-basics/02-primitive-types.md");
```

**HMR**(Hot Module Replacement, 실행 중 모듈 교체)은 파일을 저장하면 브라우저가 페이지 전체를 새로 고치지 않고 **바뀐 모듈만 갈아 끼우는** 기능입니다. 위 코드의 `import.meta.hot`이 "이 모듈이 바뀌면 알려 달라"고 서버에 등록하는 부분입니다. 서버와 브라우저는 웹소켓(WebSocket, 연결을 계속 열어 두고 양쪽이 아무 때나 메시지를 보내는 통신 방식)으로 이어져 있다가, 파일이 저장되면 서버가 "이 파일 바뀌었음"을 보냅니다.

**확인 방법**: 브라우저로 아무 레슨을 열어 둔 채 복사본의 그 마크다운 파일에서 한 글자를 고치고 저장합니다. 새로 고침 버튼을 누르지 않았는데 글자가 바뀌면 HMR이 동작한 것입니다.

::: info 개발 서버가 돌려주는 HTML
`curl http://localhost:5190/`로 받은 HTML에는 본문이 없고 `<div id="app"></div>`와 스크립트 두 줄만 있습니다. 실제 내용은 브라우저가 JavaScript를 실행하면서 채웁니다. 그래서 개발 서버 화면은 `curl`로 내용 확인이 안 되고, 빌드 결과물(6-2)은 됩니다.
:::

### 4단계. `--host`: 누가 접속할 수 있나

이번에는 `--host` 없이 띄워 봅니다. 터미널을 하나 더 열고(앞 서버는 그대로 둡니다) 실행합니다.

```bash
npx vitepress dev docs --port 5191
```

실제 출력:

```text
  vitepress v1.6.3

  ➜  Local:   http://localhost:5191/
  ➜  Network: use --host to expose
```

`Network` 줄이 사라지고 "`--host`를 써야 외부에 공개된다"는 안내가 나왔습니다. 두 서버가 어디서 기다리는지 운영체제에 물어봅니다.

Windows(PowerShell):

```powershell
netstat -ano | findstr LISTENING | findstr ":5190 :5191"
```

macOS/Linux(bash):

```bash
lsof -nP -iTCP:5190 -iTCP:5191 -sTCP:LISTEN
```

실제 출력(Windows):

```text
  TCP    0.0.0.0:5190           0.0.0.0:0              LISTENING       46156
  TCP    [::1]:5191             [::]:0                 LISTENING       39608
```

- `0.0.0.0:5190`: 이 PC의 **모든** IPv4 주소에서 기다립니다. 다른 기기도 접속할 수 있습니다.
- `[::1]:5191`: IPv6의 localhost(`::1`)에서만 기다립니다. 이 PC 안에서만 접속할 수 있습니다.
- 맨 끝 숫자는 PID(Process ID, 실행 중인 프로그램의 번호)입니다. 나중에 서버를 끌 때 씁니다.

같은 PC에서 주소를 바꿔 가며 접속해 보면 차이가 분명합니다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5190/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5190/
curl -s -o /dev/null -w "%{http_code}\n" http://<이 PC의 IP>:5190/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5191/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5191/
curl -s -o /dev/null -w "%{http_code}\n" http://<이 PC의 IP>:5191/
```

실제 결과:

| 주소 | 5190 (`--host 0.0.0.0`) | 5191 (`--host` 없음) |
|---|---|---|
| `localhost` | 200 | 200 |
| `127.0.0.1` | 200 | 연결 실패(000) |
| `<이 PC의 IP>` | 200 | 연결 실패(000) |

`000`은 curl이 서버와 연결 자체를 못 했다는 뜻입니다(curl 종료 코드 7, "Failed to connect").

::: tip 127.0.0.1로는 안 되는데 localhost로는 되는 이유
작성 시점의 Node.js 24 + Vite 5.4.21 환경에서는 `--host` 없이 띄우면 `localhost`를 IPv6 주소 `::1`로 풀어 거기서만 기다렸습니다. `127.0.0.1`은 IPv4 주소라 다른 문입니다. 브라우저와 curl은 `localhost`를 넣으면 `::1`도 시도하므로 접속됩니다. 다른 프로그램이 `127.0.0.1`로 붙으려 할 때 "왜 안 되지?"가 생기는 이유입니다.
:::

**왜 ts-wiki는 `--host 0.0.0.0`을 붙였을까요?** 사내에서 글을 쓰는 사람이 옆자리 동료에게 "내 PC 주소로 들어와 봐" 하고 작성 중인 화면을 보여 주기 위해서입니다. 대신 같은 네트워크의 누구나 접속할 수 있게 되므로, 카페나 공용 와이파이에서는 붙이지 않는 것이 안전합니다.

### 5단계. 같은 네트워크의 다른 기기에서 접속하기

1. 서버 PC의 IP를 확인합니다. 개발 서버 출력의 `Network` 줄을 보거나, 아래 명령을 씁니다.

   Windows(PowerShell):

   ```powershell
   ipconfig | findstr IPv4
   ```

   macOS/Linux(bash):

   ```bash
   ip -4 addr        # Linux
   ipconfig getifaddr en0   # macOS
   ```

2. 같은 공유기(같은 와이파이)에 붙은 휴대폰이나 다른 PC의 브라우저에서 `http://<이 PC의 IP>:5190`을 엽니다.
3. 안 열리면 대부분 **Windows 방화벽**이 막은 것입니다.

**방화벽**(firewall)은 밖에서 들어오는 연결 중 허락한 것만 통과시키는 문지기입니다. Node.js를 처음 실행할 때 "Windows 보안 경고 - 액세스 허용" 창이 뜨는데, 여기서 "개인 네트워크"를 허용하지 않았다면 다른 기기의 접속이 막힙니다.

현재 허용 규칙이 있는지는 **읽기만 하는** 명령으로 볼 수 있습니다.

```powershell
Get-NetFirewallRule -Direction Inbound -Enabled True | Where-Object DisplayName -like '*node*' | Select-Object DisplayName,Action,Profile
```

실제 출력(작성 PC):

```text
DisplayName                Action         Profile
-----------                ------         -------
Node.js JavaScript Runtime  Allow Private, Public
...
```

`Action`이 `Allow`이고, 지금 연결된 네트워크 종류(`Private` 개인 / `Public` 공용)가 `Profile`에 들어 있으면 허용된 상태입니다.

규칙이 없을 때 특정 포트만 여는 명령은 아래와 같습니다. **관리자 권한 PowerShell**에서 실행해야 하고, PC의 보안 설정을 바꾸는 명령이므로 회사 PC라면 먼저 IT 담당자에게 확인합니다. (이 가이드 작성 중에는 실제로 실행하지 않았습니다. 명령 형식은 Microsoft 공식 문서 기준입니다.)

```powershell
New-NetFirewallRule -DisplayName "wiki dev 5190" -Direction Inbound -Protocol TCP -LocalPort 5190 -Action Allow -Profile Private
```

- `-Profile Private`: 집·회사처럼 "개인 네트워크"로 지정된 곳에서만 엽니다. 공용 와이파이에서는 열지 않습니다.
- 다 쓴 뒤 지우는 명령: `Remove-NetFirewallRule -DisplayName "wiki dev 5190"`

macOS는 "시스템 설정 → 네트워크 → 방화벽"에서, Linux(Ubuntu)는 `sudo ufw allow 5190/tcp`로 엽니다(각 OS 공식 문서 기준).

**확인 방법**: 다른 기기의 브라우저에서 위키 홈이 뜨면 성공입니다.

### 6단계. 포트 충돌: 이미 쓰고 있는 번호로 띄우면

5190번 서버를 켜 둔 채 터미널을 하나 더 열어 같은 포트로 또 띄워 봅니다.

```bash
npx vitepress dev docs --host 0.0.0.0 --port 5190
```

실제 출력(이때 5191번도 다른 서버가 쓰고 있었습니다):

```text
Port 5190 is in use, trying another one...
Port 5191 is in use, trying another one...

  vitepress v1.6.3

  ➜  Local:   http://localhost:5192/
```

에러로 멈추지 않고 **조용히 다음 번호로 옮겨 갑니다.** Vite 5.4.21 소스에서 이 동작을 하는 부분은 이렇습니다(`node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js`).

```js
if (e.code === "EADDRINUSE") {
  if (strictPort) {
    httpServer.removeListener("error", onError);
    reject(new Error(`Port ${port} is already in use`));
  } else {
    logger.info(`Port ${port} is in use, trying another one...`);
    httpServer.listen(++port, host);
  }
}
```

`EADDRINUSE`는 운영체제가 "그 주소(포트)는 이미 사용 중"이라고 알려 주는 에러 코드입니다. `strictPort`가 꺼져 있으면(기본값) 포트 번호를 1 올려 다시 시도합니다.

편해 보이지만 함정이 있습니다. 동료에게 "5190으로 들어와"라고 알려 줬는데 내 서버는 5192에 떠 있으면, 동료는 **예전에 켜 둔 다른 서버**를 보게 됩니다. 번호가 고정되어야 하는 상황이면 `--strictPort`를 붙입니다.

```bash
npx vitepress dev docs --host 0.0.0.0 --port 5193 --strictPort
```

5193번이 이미 쓰이고 있을 때 실제 출력:

```text
failed to start server. error:
Port 5193 is already in use
Error: Port 5193 is already in use
```

이번에는 다른 번호로 가지 않고 종료 코드 1로 멈췁니다.

**누가 그 포트를 쓰고 있는지** 찾는 명령입니다.

Windows(PowerShell):

```powershell
Get-NetTCPConnection -LocalPort 5190 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
Get-Process -Id (Get-NetTCPConnection -LocalPort 5190 -State Listen).OwningProcess
```

실제 출력:

```text
LocalAddress LocalPort OwningProcess
------------ --------- -------------
0.0.0.0           5190         46156

   Id ProcessName
   -- -----------
46156 node
```

macOS/Linux(bash):

```bash
lsof -nP -iTCP:5190 -sTCP:LISTEN
```

### 7단계. 끄는 법

- **기본**: 서버가 돌고 있는 터미널을 클릭하고 `Ctrl+C`를 누릅니다. Windows에서 "일괄 작업을 끝내시겠습니까 (Y/N)?"가 나오면 `Y`를 누릅니다.
- **터미널을 잃어버렸을 때**: 6단계 명령으로 PID를 찾아 끕니다.

Windows(PowerShell):

```powershell
Stop-Process -Id 46156
```

macOS/Linux(bash):

```bash
kill 46156
```

**확인 방법**: 같은 `netstat`/`lsof` 명령을 다시 실행했을 때 그 포트 줄이 안 나오면 꺼진 것입니다.

::: warning 부모만 끄면 자식이 남습니다
`npx vitepress dev ...`를 실행하면 `npx`(부모)가 `node vitepress.js`(자식, 실제 서버)를 띄웁니다. 작성 중 실제로 `npx` 프로세스만 `Stop-Process`로 껐더니, 포트는 여전히 열려 있었습니다.

```text
  TCP    [::1]:5194             [::]:0                 LISTENING       47216
```

PID 47216은 자식 `node`였습니다. 그래서 끌 때는 **포트를 차지한 PID**를 찾아서 끄는 것이 정확합니다. Windows에서 자식까지 한꺼번에 끄려면 `taskkill /PID <PID> /T /F`(`/T`는 자식 포함, `/F`는 강제)를 씁니다.
:::

### 8단계. 백그라운드로 띄우기 (소개)

터미널을 닫아도 서버가 살아 있게 하는 방법들입니다. 이 레슨에서는 소개만 하고, 실제로 상시 띄우는 방법은 6-4의 Docker Compose를 권합니다.

| 방법 | 명령 예 | 특징 |
|---|---|---|
| 터미널 하나 더 열기 | (VS Code 터미널 `+` 버튼) | 가장 쉽습니다. 창을 닫으면 꺼집니다. |
| PowerShell `Start-Process` | `Start-Process npx.cmd -ArgumentList 'vitepress','dev','docs','--port','5194' -WindowStyle Hidden` | 숨은 창으로 실행. 끌 때 위 경고처럼 포트의 PID로 끕니다. |
| bash `nohup ... &` | `nohup npx vitepress dev docs --port 5194 > dev.log 2>&1 &` | macOS/Linux. 로그는 `dev.log`에 쌓입니다. |
| pm2 같은 프로세스 관리자 | `pm2 start ...` | 죽으면 다시 살려 줍니다. 별도 설치가 필요합니다(공식 문서 기준). |

`Start-Process` 방식은 작성 중 실제로 실행해 5194번이 열리는 것을 확인했습니다. `nohup`과 pm2는 작성 PC(Windows)에서 확인하지 않았으므로 각 공식 문서를 참고합니다.

::: tip 개발 서버는 "상시 서버"가 아닙니다
개발 서버는 요청마다 변환하고, 파일 변경을 감시하고, 디버깅용 코드를 붙여 보내므로 느리고 무겁습니다. 여러 사람이 늘 보는 위키는 빌드한 뒤 nginx로 서비스합니다(6-3, 6-4).
:::

## ts-wiki에서는

- `package.json` 8번째 줄: `"dev": "vitepress dev docs --host 0.0.0.0 --port 5180"` — 같은 네트워크 동료가 볼 수 있게 `--host 0.0.0.0`을, 다른 프로젝트와 겹치지 않게 흔치 않은 번호 5180을 골랐습니다. (Vite 기본 포트는 5173이고, 이 가이드 자체는 5181을 씁니다.)
- `package.json` 11번째 줄: `"preview"`도 같은 `--host`·`--port`를 써서, 개발 서버와 미리보기 서버를 **같은 주소**로 열게 했습니다. 그래서 둘을 동시에 띄우면 같은 포트를 두고 부딪힙니다(6단계).
- `README.md`의 "로컬에서 실행" 절은 다른 PC에서 `http://<이 PC의 IP>:5180`으로 접속하라고 안내합니다. 이 안내가 동작하는 이유가 `--host 0.0.0.0`입니다.
- `docs/.vitepress/config.mts`는 개발 서버가 시작할 때 읽는 설정입니다. 이 파일을 고치면 HMR로 일부만 바꾸는 대신 VitePress가 설정을 다시 읽으며 서버를 재시작합니다(사이드바 구조처럼 사이트 전체에 영향을 주기 때문입니다. 작성 중 직접 확인하지는 않았으므로 터미널 출력으로 확인해 보세요).

## 자주 하는 실수

**1. 포트를 바꿨는데 예전 화면이 뜬다**

- 증상: 출력에 `Port 5190 is in use, trying another one...`이 있었고, 브라우저는 `localhost:5190`을 보고 있다.
- 원인: 5190은 예전 서버가 쓰고 있고, 새 서버는 5191 이상으로 밀려났습니다.
- 해결: 출력의 `Local:` 줄에 적힌 실제 주소로 접속하거나, 예전 서버를 끄고 다시 띄웁니다. 번호를 고정하려면 `--strictPort`.

**2. `npm run dev -- --port 5194`가 `ERR_INVALID_ARG_VALUE`로 죽는다**

- 증상: `Received [ 5180, 5194 ]`
- 원인: 스크립트에 이미 `--port 5180`이 있는데 하나 더 붙어 포트가 배열이 됐습니다.
- 해결: `npx vitepress dev docs --port 5194`로 직접 실행합니다.

**3. 다른 PC에서 접속이 안 된다**

- 증상: 다른 기기 브라우저에서 "사이트에 연결할 수 없음", 서버 터미널에는 아무 기록이 없다.
- 원인: (1) `--host` 없이 띄웠거나, (2) 방화벽이 막았거나, (3) 두 기기가 다른 네트워크(예: 한쪽은 유선 사내망, 한쪽은 손님용 와이파이)입니다.
- 해결: `netstat`으로 `0.0.0.0:포트`인지 먼저 보고, 맞으면 방화벽 규칙을 확인합니다. 자세한 순서는 [6-6](./06-troubleshooting).

**4. 터미널을 닫았더니 위키가 꺼졌다**

- 증상: 아침에 켜 둔 위키가 점심에 안 열린다.
- 원인: 개발 서버는 그 터미널의 자식 프로세스라 터미널과 함께 꺼집니다.
- 해결: 상시 서비스는 6-4의 Docker Compose로 띄웁니다.

## 직접 해 보기

**⭐ 과제 1.** 복사본에서 5195번 포트로 개발 서버를 띄우고, `curl`로 200이 나오는지 확인한 뒤 `Ctrl+C`로 끄세요.

::: details 정답 보기
```bash
npx vitepress dev docs --port 5195
# 다른 터미널에서
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5195/
```
`200`이 나오면 성공입니다. 끈 뒤 같은 curl을 다시 하면 `000`이 나옵니다.
:::

**⭐ 과제 2.** `--host` 없이 띄운 서버와 `--host 0.0.0.0`으로 띄운 서버를 `netstat`(또는 `lsof`)으로 비교하고, 어느 쪽이 다른 기기에서 접속 가능한지 설명하세요.

::: details 힌트
주소 칸이 `0.0.0.0`(또는 `[::]`)이면 모든 주소, `127.0.0.1`이나 `[::1]`이면 이 PC 안에서만입니다.
:::

**⭐⭐ 과제 3.** 같은 포트로 서버 두 개를 띄워 두 번째가 몇 번으로 밀려나는지 보고, 이번에는 `--strictPort`를 붙여 어떤 메시지로 멈추는지 확인하세요.

::: details 정답 보기
첫 번째와 같은 포트가 사용 중이면 `Port 5190 is in use, trying another one...` 뒤에 다음 번호로 뜹니다. `--strictPort`를 붙이면 `Port 5190 is already in use`로 멈춥니다.
:::

**⭐⭐ 과제 4.** 개발 서버를 띄운 터미널을 일부러 잃어버렸다고 가정하고, 포트 번호만으로 PID를 찾아 끄세요.

::: details 정답 보기
Windows: `Get-NetTCPConnection -LocalPort 5190 -State Listen` → `OwningProcess` 값을 `Stop-Process -Id <PID>`로 끕니다.
macOS/Linux: `lsof -nP -iTCP:5190 -sTCP:LISTEN` → `kill <PID>`.
:::

**⭐⭐⭐ 과제 5.** 휴대폰에서 개발 서버에 접속해 보고, 안 된다면 원인을 "`--host` / 방화벽 / 네트워크" 중 무엇인지 하나씩 지워 가며 찾으세요. (방화벽 규칙을 바꿔야 한다면 반드시 PC 관리자와 상의합니다.)

::: details 힌트
1) PC에서 `curl http://<이 PC의 IP>:5190/`이 200인지 → 아니면 `--host` 문제. 2) PC에서는 200인데 휴대폰은 안 됨 → 방화벽이나 네트워크. 3) 휴대폰이 PC와 같은 공유기에 붙어 있는지 IP 앞자리(예: `192.168.0.`)를 비교합니다.
:::

## 확인 퀴즈

**1.** 개발 서버에서 처음 여는 페이지가 두 번째보다 느린 이유는?

::: details 정답 보기
요청이 들어온 순간 그 마크다운을 변환(요청 시 컴파일)하기 때문입니다. 두 번째부터는 변환 결과를 메모리에서 꺼내 줍니다.
:::

**2.** `netstat` 결과에 `[::1]:5191`이 보입니다. 다른 PC에서 5191로 접속할 수 있나요?

::: details 정답 보기
없습니다. `::1`은 IPv6 localhost로, 이 PC 안에서만 접속할 수 있습니다.
:::

**3.** 포트가 사용 중일 때 VitePress 개발 서버의 기본 동작은?

::: details 정답 보기
에러로 멈추지 않고 포트 번호를 1씩 올려 빈 번호를 찾습니다. `--strictPort`를 주면 멈춥니다.
:::

**4.** HMR이 무엇의 약자이고, 사용자 입장에서 무엇이 좋은가요?

::: details 정답 보기
Hot Module Replacement. 파일을 저장하면 브라우저를 새로 고치지 않아도 바뀐 부분만 바로 반영됩니다. 스크롤 위치도 유지됩니다.
:::

## 정리

- `npm run dev` = `vitepress dev docs --host 0.0.0.0 --port 5180`. 터미널이 열려 있는 동안만 사는 서버입니다.
- 개발 서버는 **요청 시 컴파일**하고 **HMR**로 바뀐 부분만 갈아 끼웁니다. 글 쓸 때 편하지만 상시 서비스용은 아닙니다.
- `--host` 없음 = 이 PC 안에서만(작성 환경에서는 `::1`), `--host 0.0.0.0` = 같은 네트워크 누구나.
- 포트가 사용 중이면 조용히 다음 번호로 갑니다. 출력의 `Local:` 줄을 꼭 읽고, 고정이 필요하면 `--strictPort`.
- 포트의 주인 PID는 `Get-NetTCPConnection`/`netstat -ano`(Windows), `lsof`(macOS/Linux)로 찾고, 그 PID로 끕니다.
- 다른 기기 접속이 안 되면 `--host` → 방화벽 → 네트워크 순으로 확인합니다.

## 다음 단계

[빌드 결과물을 서버로 서비스하기](./02-static-serve) — 이번에는 미리 만든 도시락(`dist`)을 vitepress preview, `npx serve`, Python 등 여러 정적 서버로 서비스하고, 확장자 없는 주소에서 생기는 404를 직접 재현해 고칩니다.
