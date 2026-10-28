---
title: localhost · 포트 · 호스트 · IP
---

# localhost · 포트 · 호스트 · IP

<LessonMeta level="입문" :minutes="45" prev="정적 서버는 미리 만든 파일을, 동적 서버는 요청마다 만든 응답을 보낸다" />

## 이번에 배울 것

- IP 주소, 호스트 이름, 포트가 각각 무엇을 가리키는지 설명할 수 있다.
- `localhost`, `127.0.0.1`, `0.0.0.0`의 차이를 말하고, 서버를 켤 때 어느 것을 써야 하는지 고를 수 있다.
- "내 PC에서는 되는데 다른 PC에서는 안 된다"의 원인 세 가지(바인딩 주소 · 방화벽 · 잘못된 IP)를 차례로 점검할 수 있다.
- Windows에서 `Get-NetTCPConnection`·`netstat`으로 어떤 프로그램이 어떤 포트를 쓰는지 찾고 끌 수 있다.
- ts-wiki의 `--host 0.0.0.0 --port 5180`, `"8090:80"`의 뜻을 읽을 수 있다.

## 먼저 알아 둘 것

- [정적 사이트와 동적 서버](./02-static-vs-dynamic)에서 만든 `server.mjs`를 다시 씁니다.
- URL의 호스트·포트: [웹은 어떻게 동작하나](./01-web-and-server)

## 비유로 이해하기

컴퓨터 한 대를 **큰 건물**이라고 생각해 봅시다.

| 건물 | 네트워크 |
|---|---|
| 건물의 도로명 주소 | **IP 주소** — 예: `192.168.0.15` |
| "한빛빌딩" 같은 건물 이름 | **호스트 이름** — 예: `hong-coding.github.io`. 주소록(DNS)에서 IP로 바뀜 |
| 건물 안 창구 번호 (1번 민원, 2번 세금…) | **포트** — 0~65535번. 한 창구에는 한 직원(프로그램)만 |
| "우리 건물" (건물 안에서 쓰는 말) | **localhost** = `127.0.0.1` — 언제나 "지금 이 컴퓨터 자신" |
| 직원이 "건물 안 사람만 받겠다" | 서버를 `127.0.0.1`에 바인딩 |
| 직원이 "모든 출입문으로 오는 손님을 받겠다" | 서버를 `0.0.0.0`에 바인딩 |
| 건물 경비실 | **방화벽** — 밖에서 들어오는 손님을 출입문에서 막을 수 있음 |

두 가지가 핵심입니다.

1. **한 창구에는 한 직원만** 앉을 수 있습니다. 같은 포트에 서버 두 개를 띄우면 두 번째가 실패합니다(`EADDRINUSE`).
2. 손님이 들어오려면 **직원이 그 출입문을 열어 두어야 하고(바인딩), 경비실도 통과시켜야 합니다(방화벽).** 둘 중 하나만 막혀도 밖의 손님은 못 들어옵니다.

## 개념 설명

### IP 주소와 호스트 이름

**IP 주소**는 네트워크에서 컴퓨터를 찾는 번호입니다. 흔히 보는 IPv4 형식은 `192.168.0.15`처럼 점으로 나뉜 숫자 네 개입니다. 숫자가 더 긴 IPv6 형식(`::1`, `fe80::...`)도 있습니다.

사람은 숫자를 외우기 어려우니 `hong-coding.github.io` 같은 **호스트 이름**(도메인 이름)을 씁니다. 브라우저는 요청을 보내기 전에 **DNS**(Domain Name System, 이름을 IP로 바꿔 주는 인터넷 주소록)에 물어 실제 IP를 알아냅니다.

내 PC의 IP는 이렇게 봅니다.

```powershell
# Windows
ipconfig | findstr /C:"IPv4"
```

```text
   IPv4 Address. . . . . . . . . . . : <이 PC의 IP>
   IPv4 Address. . . . . . . . . . . : <다른 네트워크 어댑터의 IP>
   ...
```

```bash
# macOS (Wi-Fi 기준, macOS 공식 명령)
ipconfig getifaddr en0
```

IP가 여러 개 나오는 것은 정상입니다. 유선·무선 랜카드, VPN, Docker·WSL이 만든 가상 어댑터가 각각 주소를 가지기 때문입니다. 옆자리 동료가 접속할 주소는 보통 **사무실·집 공유기에 연결된 어댑터**의 주소입니다(흔히 `192.168.`이나 `10.`으로 시작합니다).

### localhost와 127.0.0.1: "나 자신"

`localhost`는 **언제나 지금 이 컴퓨터**를 가리키는 특별한 호스트 이름입니다. IPv4로는 `127.0.0.1`, IPv6로는 `::1`입니다. 네트워크 선을 뽑아도 동작합니다. 요청이 컴퓨터 밖으로 나가지 않고 안에서 되돌아오기 때문에 이 주소를 **루프백**(loopback, 되돌아오는 고리)이라고 부릅니다.

```powershell
ping -n 1 localhost
```

```text
Pinging <이 PC의 이름> [::1] with 32 bytes of data:
Reply from ::1: time<1ms
...
```

(macOS/Linux는 `ping -c 1 localhost`) 작성 PC에서는 `localhost`가 IPv6 `::1`로 먼저 연결되었습니다. 이 사실은 뒤의 "localhost와 127.0.0.1이 다르게 동작할 때"에서 다시 나옵니다.

중요한 점: 내 PC에서 `localhost`는 내 PC이고, **동료 PC에서 `localhost`는 동료 PC 자신**입니다. 동료에게 "`http://localhost:5180`으로 들어와"라고 말하면, 동료는 자기 PC의 5180번 포트로 가서 아무것도 찾지 못합니다.

### 포트: 한 컴퓨터 안의 창구 번호

**포트**(port)는 한 컴퓨터 안에서 "어느 프로그램에게 온 요청인지"를 구분하는 번호(0~65535)입니다. IP가 건물 주소라면 포트는 창구 번호입니다.

| 포트 | 관례적으로 쓰는 곳 |
|---|---|
| 80 | `http` 기본 포트 |
| 443 | `https` 기본 포트 |
| 5173 | Vite 개발 서버 기본값 |
| 5180 | ts-wiki 개발 서버(`package.json`에서 지정) |
| 8090 | ts-wiki Docker(`docker-compose.yml`에서 지정) |

번호 자체에 마법은 없습니다. 비어 있는 번호라면 무엇이든 쓸 수 있고, 프로젝트마다 겹치지 않게 정해 두는 것이 요령입니다. 이 가이드 자체는 ts-wiki와 겹치지 않도록 개발 서버 5181, Docker 8091을 씁니다.

### 바인딩 주소: 127.0.0.1 vs 0.0.0.0

서버 프로그램은 켜질 때 "어느 IP의 몇 번 포트에서 기다릴지"를 정합니다. 이것을 **바인딩**(binding, 묶기)이라고 합니다. 지난 레슨의 `server.mjs`에서 `server.listen(port, host, ...)`가 바로 그 부분입니다.

| 바인딩 주소 | 뜻 | 누가 접속할 수 있나 |
|---|---|---|
| `127.0.0.1` (또는 `localhost`) | 루프백 출입문만 연다 | **이 PC 자신만** |
| `0.0.0.0` | 이 PC의 **모든** IPv4 출입문을 연다 | 이 PC + 같은 네트워크의 다른 PC(방화벽이 허락하면) |

`0.0.0.0`은 "모든 주소"라는 뜻의 **바인딩 전용 표기**입니다. 브라우저 주소창에 넣는 주소가 아니라, 서버가 "어디서 오든 받겠다"고 선언할 때 쓰는 값입니다.

### 따라 하기 1: 바인딩 주소에 따라 접속이 달라지는 것 보기

`server.mjs`(지난 레슨에서 만든 것)를 그대로 쓰고, 아래 `<이 PC의 IP>`는 `ipconfig`로 확인한 내 주소로 바꿔 넣습니다.

**① 127.0.0.1로 켜기(기본값)**

```bash
node server.mjs
```

```text
http://127.0.0.1:5196 에서 기다리는 중
```

다른 터미널에서 두 주소로 요청합니다(Windows는 `curl.exe`).

```bash
curl -s http://127.0.0.1:5196/
curl -sS -m 3 http://<이 PC의 IP>:5196/
```

실제 출력:

```text
<h1>1번째 방문입니다</h1><p>서버 시각: 2026-10-28T00:15:26.020Z</p>
curl: (7) Failed to connect to <이 PC의 IP> port 5196 after 2031 ms: Couldn't connect to server
```

`127.0.0.1`로는 되는데, **같은 PC인데도** 자기 IP로는 연결이 안 됩니다. 서버가 루프백 출입문만 열었기 때문입니다. 다른 PC에서 접속하면 당연히 안 됩니다. (`-m 3`은 3초 넘게 기다리지 말라는 옵션입니다.)

**② 0.0.0.0으로 켜기**

서버를 `Ctrl+C`로 끄고, 환경 변수 `HOST`를 주어 다시 켭니다. **환경 변수**는 프로그램을 실행할 때 바깥에서 넘겨주는 설정 값입니다. `server.mjs`의 `process.env.HOST`가 이 값을 읽습니다.

```powershell
# Windows (PowerShell)
$env:HOST = '0.0.0.0'; node server.mjs
```

```bash
# macOS/Linux
HOST=0.0.0.0 node server.mjs
```

```text
http://0.0.0.0:5196 에서 기다리는 중
```

```bash
curl -sS -m 3 http://<이 PC의 IP>:5196/
```

```text
<h1>1번째 방문입니다</h1><p>서버 시각: 2026-10-28T00:15:47.259Z</p>
```

이번에는 자기 IP로도 응답이 옵니다.

**확인 방법**: ①에서는 IP로 요청 시 `Failed to connect`, ②에서는 응답이 오면 성공입니다. 같은 네트워크의 다른 PC나 스마트폰 브라우저에서 `http://<이 PC의 IP>:5196`을 열어 보면 더 확실합니다(방화벽이 막을 수 있으니 아래 "방화벽" 절도 함께 봅니다). 실습이 끝나면 `Ctrl+C`로 끕니다. PowerShell에서 설정한 `$env:HOST`는 그 터미널을 닫으면 사라집니다.

### 방화벽: 경비실

`0.0.0.0`으로 열어도 다른 PC에서 안 될 때가 있습니다. **방화벽**(firewall)이 밖에서 들어오는 연결을 막기 때문입니다. Windows에는 Windows Defender 방화벽이 기본으로 켜져 있습니다.

```powershell
Get-NetFirewallProfile | Format-Table Name,Enabled
```

```text
Name    Enabled
----    -------
Domain     True
Private    True
Public     True
```

세 가지 프로필(회사 도메인 네트워크 · 개인 네트워크 · 공용 네트워크)이 모두 켜져 있다는 뜻입니다.

- 어떤 프로그램(예: `node.exe`)이 처음으로 `0.0.0.0` 같은 바깥 주소에 바인딩하면, Windows가 **"Windows 보안 경고 — 이 앱의 일부 기능이 차단되었습니다"** 창을 띄워 허용할지 묻는 경우가 많습니다(Microsoft 공식 동작 기준). 여기서 **개인 네트워크**만 허용하는 것이 안전합니다. 카페 와이파이 같은 공용 네트워크까지 허용하면 모르는 사람도 접속을 시도할 수 있습니다.
- 그 창에서 실수로 "취소"를 눌렀다면, 제어판의 **Windows Defender 방화벽 → 앱 또는 기능이 Windows Defender 방화벽을 통과하도록 허용**에서 `Node.js`를 찾아 바꿀 수 있습니다.

::: warning 방화벽은 보안 설정입니다
방화벽 규칙을 바꾸는 일은 PC 보안에 직접 영향을 줍니다. 회사 PC라면 직접 바꾸기 전에 담당 부서에 확인합니다. 실습이 끝나면 허용해 둔 규칙을 다시 점검하는 습관을 들입니다. macOS도 시스템 설정 → 네트워크 → 방화벽에서 비슷한 허용 여부를 관리합니다.
:::

### "다른 PC에서 안 열린다" 점검 순서

경험상 원인은 거의 다음 셋 중 하나입니다. **순서대로** 확인합니다.

```text
1. 바인딩: 서버 로그에 Network 주소가 나오나? (127.0.0.1/localhost에만 묶였나?)
      │ 나온다
      ▼
2. 내 PC에서 내 IP로: curl http://<이 PC의 IP>:포트  가 되나?
      │ 된다 (여기까지 되면 서버 쪽은 정상)
      ▼
3. 방화벽·네트워크: 다른 PC에서 안 되면 → 방화벽 허용? 같은 네트워크(같은 공유기·같은 VPN)인가?
```

2번이 되는데 3번이 안 되면 서버가 아니라 **방화벽이나 네트워크** 문제입니다. 이렇게 나눠 보면 "서버를 다시 설치해야 하나?" 같은 엉뚱한 고민을 하지 않게 됩니다.

### 따라 하기 2: 포트를 쓰는 프로그램 찾고 끄기

"포트가 이미 사용 중"이라는데 어느 터미널에서 켰는지 기억나지 않을 때가 있습니다. 운영체제에 직접 물어봅니다. 아래 출력은 ts-wiki 복사본의 개발 서버를 5198·5199번 포트에 띄워 둔 상태에서 실제로 확인한 것입니다.

**Windows: Get-NetTCPConnection (PowerShell)**

```powershell
Get-NetTCPConnection -LocalPort 5198,5199 -State Listen |
  Select-Object LocalAddress,LocalPort,State,OwningProcess
```

```text
LocalAddress LocalPort  State OwningProcess
------------ ---------  ----- -------------
::1               5198 Listen         43968
0.0.0.0           5199 Listen         19760
0.0.0.0           5198 Listen         12100
```

- `State`가 `Listen`이면 "그 포트에서 손님을 기다리는 중"입니다.
- `LocalAddress`가 바인딩 주소입니다. `0.0.0.0`은 모든 IPv4 출입문, `::1`은 IPv6 루프백입니다.
- `OwningProcess`가 그 포트를 쓰는 프로그램의 **PID**(프로세스 ID, 실행 중인 프로그램의 번호)입니다.

PID가 어떤 프로그램인지 봅니다.

```powershell
Get-Process -Id 19760 | Format-Table Id,ProcessName -AutoSize
```

```text
   Id ProcessName
   -- -----------
19760 node
```

`node`, 즉 Node.js로 실행한 프로그램(여기서는 VitePress 개발 서버)입니다. 끄는 방법은 두 가지입니다.

1. **그 서버를 켠 터미널을 찾아 `Ctrl+C`** (가장 안전합니다)
2. 터미널을 찾을 수 없다면 PID로 끄기: `Stop-Process -Id 19760`

::: danger PID를 확인하고 끕니다
`Stop-Process`는 묻지 않고 프로그램을 강제로 끝냅니다. 반드시 `Get-Process`로 **내가 켠 서버가 맞는지** 확인한 뒤 실행합니다. 잘못된 PID를 넣으면 작업 중인 다른 프로그램이 저장 없이 꺼질 수 있습니다.
:::

**Windows: netstat (명령 프롬프트·PowerShell 공통)**

```powershell
netstat -ano | findstr "LISTENING" | findstr ":5198 :5199"
```

```text
  TCP    0.0.0.0:5198           0.0.0.0:0              LISTENING       12100
  TCP    0.0.0.0:5199           0.0.0.0:0              LISTENING       19760
  TCP    [::1]:5198             [::]:0                 LISTENING       43968
```

`-a`는 모든 연결, `-n`은 이름 대신 숫자로, `-o`는 PID까지 보여 달라는 옵션입니다. 맨 오른쪽 숫자가 PID입니다. 어떤 프로그램인지는 `tasklist`로 봅니다.

```powershell
tasklist /FI "PID eq 19760"
```

```text
Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
node.exe                     19760 Console                    1    371,484 K
```

**macOS/Linux: lsof (공식 명령, 작성 PC에서는 실행하지 않음)**

```bash
lsof -nP -iTCP:5180 -sTCP:LISTEN
```

`COMMAND`(프로그램 이름)와 `PID` 열이 나옵니다. 끄려면 그 터미널에서 `Ctrl+C`, 또는 `kill <PID>`를 씁니다.

### localhost와 127.0.0.1이 다르게 동작할 때

위 표를 다시 보면 **같은 5198번 포트에 서버가 두 개**(`0.0.0.0`과 `::1`) 떠 있습니다. "한 창구에 한 직원"이라고 했는데 어떻게 된 걸까요?

`0.0.0.0`은 IPv4 출입문 전체이고, `::1`은 IPv6 루프백 출입문입니다. **다른 출입문**이라서 둘 다 자리를 잡을 수 있었습니다. 이때 `localhost`로 접속하면 `::1` 쪽 서버가, `127.0.0.1`로 접속하면 `0.0.0.0` 쪽 서버가 응답합니다. 실제로 이 문서를 쓰는 동안 `localhost:5190`으로 요청했더니 **내가 켠 서버가 아니라 다른 실습에서 켜 둔 서버**가 응답한 일이 있었습니다. `curl -v`로 보면 어느 주소로 연결했는지 나옵니다.

```bash
curl -v -s -o /dev/null http://localhost:5191/
```

```text
*   Trying [::1]:5191...
* Connected to localhost (::1) port 5191
> GET / HTTP/1.1
> Host: localhost:5191
...
```

(`-o /dev/null`은 본문을 버리라는 뜻입니다. Windows PowerShell에서는 `-o NUL`로 씁니다.) `Trying [::1]`이 "IPv6 루프백으로 먼저 시도했다"는 뜻입니다.

::: tip 이상하면 127.0.0.1로 다시 해 본다
"코드를 고쳤는데 화면이 안 바뀐다", "분명 껐는데 접속이 된다"처럼 이상한 일이 생기면, `localhost` 대신 `127.0.0.1`로 접속해 보고 `Get-NetTCPConnection`으로 그 포트에 서버가 몇 개 떠 있는지 확인합니다. 엉뚱한 서버와 대화하고 있는 경우가 생각보다 많습니다.
:::

## ts-wiki에서는

### 개발 서버: --host 0.0.0.0 --port 5180

`package.json`의 `dev` 스크립트입니다.

```json
    "dev": "vitepress dev docs --host 0.0.0.0 --port 5180",
```

- `--port 5180`: 5180번 창구에서 기다립니다. 지정하지 않으면 Vite 기본값(5173)을 씁니다.
- `--host 0.0.0.0`: 모든 출입문을 엽니다. 그래서 `README.md`에 "같은 네트워크의 다른 PC에서는 `http://<이 PC의 IP>:5180` 으로 접속합니다."라고 적혀 있습니다.

`--host`가 있을 때와 없을 때의 로그를 실제로 비교해 보면 차이가 바로 보입니다(실습용 포트 5198).

```text
# --host 0.0.0.0 을 준 경우
  vitepress v1.6.3

  ➜  Local:   http://localhost:5198/
  ➜  Network: http://<이 PC의 IP>:5198/
  ➜  Network: http://<다른 어댑터의 IP>:5198/
```

```text
# --host 없이 실행한 경우
  vitepress v1.6.3

  ➜  Local:   http://localhost:5198/
  ➜  Network: use --host to expose
```

`Network: use --host to expose`는 "지금은 이 PC 안에서만 접속할 수 있다. 밖에 공개하려면 `--host`를 붙여라"라는 뜻입니다. 로그 한 줄이 바인딩 주소를 알려 줍니다. `preview` 스크립트에도 같은 `--host 0.0.0.0 --port 5180`이 붙어 있습니다.

포트가 이미 사용 중이면 VitePress는 에러 대신 다음 번호로 넘어갑니다.

```text
Port 5198 is in use, trying another one...
```

그래서 ts-wiki를 두 번 켜면 두 번째는 5181에 뜹니다. 그런데 5181은 이 가이드(wiki-server-guide)의 개발 서버 포트이기도 합니다. ts-wiki가 밀려나 5181을 차지하면, 나중에 이 가이드를 켤 때 이 가이드가 다시 5182로 밀려납니다. 이렇게 번호가 연쇄적으로 밀리면 "어느 주소가 어느 위키지?"가 헷갈리므로, 동료에게 주소를 알려 주기 전에 **로그의 실제 포트를 꼭 확인**하고, 쓰지 않는 서버는 바로 끕니다.

### Docker: "8090:80"

`docker-compose.yml`의 포트 설정입니다.

```yaml
    ports:
      - "8090:80"
```

"**내 PC의 8090번** 창구로 온 손님을 **컨테이너 안의 80번** 창구로 안내하라"는 뜻입니다. 왼쪽이 바깥(호스트 PC), 오른쪽이 안쪽(컨테이너)입니다. 컨테이너 안의 nginx는 `nginx.conf`의 첫 줄대로 80번에서 기다립니다.

```nginx
server {
    listen 80;
```

`Dockerfile`의 `EXPOSE 80`은 "이 이미지는 80번을 쓴다"는 **안내문**일 뿐, 실제로 바깥 포트를 연결하는 것은 compose의 `ports`입니다. 컨테이너는 그 자체로 작은 별도의 건물이라, 안쪽 80번과 바깥 8090번을 이어 주는 통로가 필요한 것입니다. 왜 바깥을 80이 아니라 8090으로 했을까요? 80번은 다른 웹 서버가 이미 쓰고 있을 가능성이 높아서, 겹치지 않는 번호를 고른 것입니다. 자세한 것은 [Docker와 Docker Compose](../part3-libraries/06-docker)에서 다룹니다.

### GitHub Pages: 포트를 신경 쓰지 않는 이유

`https://hong-coding.github.io/ts-wiki/`에는 포트가 없습니다. `https`의 기본 포트 443을 쓰고, 그 서버는 GitHub가 운영하기 때문입니다. 호스트 이름 `hong-coding.github.io`는 DNS에서 GitHub의 서버 IP로 바뀝니다.

## 자주 하는 실수

### 1. 동료에게 localhost 주소를 알려 준다

- **증상**: 동료가 "`http://localhost:5180`이 안 열려요"라고 합니다.
- **원인**: `localhost`는 각자 자기 PC를 뜻합니다. 동료의 PC에는 서버가 없습니다.
- **해결**: 로그의 `Network: http://<이 PC의 IP>:5180/` 주소를 알려 줍니다. `Network: use --host to expose`가 나온다면 `--host 0.0.0.0`으로 다시 켭니다.

### 2. 브라우저에 0.0.0.0을 입력한다

- **증상**: 로그에 `0.0.0.0:5196`이 보여서 `http://0.0.0.0:5196`으로 접속했더니 브라우저·환경에 따라 열리지 않거나 동작이 일정하지 않습니다.
- **원인**: `0.0.0.0`은 "모든 주소에서 받겠다"는 **바인딩용 표기**이지 접속할 주소가 아닙니다.
- **해결**: 내 PC에서는 `localhost`나 `127.0.0.1`, 다른 PC에서는 `<이 PC의 IP>`로 접속합니다.

### 3. EADDRINUSE / Port is in use

- **증상**: `Error: listen EADDRINUSE: address already in use 127.0.0.1:5196` 또는 `Port 5180 is in use, trying another one...`
- **원인**: 같은 주소·포트를 이미 다른 프로그램(대개 내가 전에 켜 둔 서버)이 쓰고 있습니다.
- **해결**: `Get-NetTCPConnection -LocalPort 5196 -State Listen`(macOS/Linux는 `lsof -nP -iTCP:5196 -sTCP:LISTEN`)으로 PID를 찾고, `Get-Process -Id <PID>`로 무엇인지 확인한 뒤, 그 터미널에서 `Ctrl+C` 하거나 `Stop-Process -Id <PID>`로 끕니다. 또는 다른 포트를 씁니다.

### 4. 0.0.0.0으로 열었는데도 다른 PC에서 안 된다

- **증상**: 로그에 `Network:` 주소도 나오고, 내 PC에서 `curl http://<이 PC의 IP>:포트`도 되는데 다른 PC에서만 안 됩니다.
- **원인**: 서버는 정상이고, 방화벽이 막거나 두 PC가 서로 다른 네트워크(예: 한쪽은 VPN, 한쪽은 손님용 와이파이)에 있습니다.
- **해결**: Windows 방화벽에서 `Node.js`가 **개인 네트워크**에 허용되어 있는지 확인하고, 두 PC가 같은 공유기·같은 네트워크에 있는지 확인합니다. 회사 네트워크라면 네트워크 정책으로 막혀 있을 수 있으니 담당 부서에 문의합니다.

## 직접 해 보기

### 과제 1 ⭐ 내 IP 찾기

`ipconfig`(macOS는 `ipconfig getifaddr en0`)로 내 PC의 IP를 찾고, 그중 공유기에 연결된 주소가 어느 것인지 골라 봅니다.

::: details 힌트
보통 `192.168.`이나 `10.`으로 시작하는 주소입니다. Docker·WSL·VPN이 만든 가상 어댑터의 주소도 함께 나오니, `ipconfig`(옵션 없이)의 어댑터 이름("Wi-Fi", "이더넷" 등)을 같이 봅니다. 찾은 주소는 남에게 공유하는 문서에 그대로 적지 않습니다.
:::

### 과제 2 ⭐ 바인딩 실험

`server.mjs`를 ① 기본값으로, ② `HOST=0.0.0.0`으로 켜고, 각각 `127.0.0.1`과 `<이 PC의 IP>`로 요청해 결과를 표로 정리합니다.

::: details 정답 보기
| 바인딩 | `127.0.0.1`로 요청 | `<이 PC의 IP>`로 요청 |
|---|---|---|
| `127.0.0.1` | 응답 옴 | `Failed to connect` |
| `0.0.0.0` | 응답 옴 | 응답 옴 |
:::

### 과제 3 ⭐⭐ 범인 찾기

터미널 두 개에서 `server.mjs`를 하나씩 실행해 `EADDRINUSE`를 일부러 낸 뒤, **터미널을 보지 않고** `Get-NetTCPConnection`(또는 `netstat -ano`)과 `Get-Process`만으로 첫 번째 서버의 PID와 프로그램 이름을 알아냅니다. 그다음 첫 번째 서버를 끄고 두 번째 터미널에서 다시 실행해 봅니다.

::: details 정답 보기
```powershell
Get-NetTCPConnection -LocalPort 5196 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
Get-Process -Id <위에서 나온 PID>
```

`ProcessName`이 `node`로 나오면 맞습니다. 첫 번째 터미널에서 `Ctrl+C`로 끄면, 두 번째 터미널에서 `node server.mjs`가 정상적으로 `기다리는 중`을 출력합니다.
:::

### 과제 4 ⭐⭐⭐ 스마트폰으로 접속하기

ts-wiki 실습용 복사본에서 `npm run dev`를 켜고(스크립트에 이미 `--host 0.0.0.0`이 있습니다), 같은 와이파이에 연결된 스마트폰 브라우저로 로그의 `Network:` 주소를 열어 봅니다. 안 되면 "다른 PC에서 안 열린다 점검 순서"를 따라 원인을 찾습니다.

::: details 힌트
1단계(로그에 `Network:` 주소가 있나) → 2단계(내 PC에서 `curl http://<이 PC의 IP>:5180`이 되나) → 3단계(방화벽에서 Node.js 개인 네트워크 허용, 같은 와이파이인가). 회사·학교 와이파이는 기기끼리 통신을 막아 두는 경우가 있어 3단계에서 막힐 수 있습니다. 실습이 끝나면 `Ctrl+C`로 끕니다.
:::

## 확인 퀴즈

1. `localhost`는 IPv4로 어떤 주소인가요?
2. 서버를 `127.0.0.1`에 바인딩하면 다른 PC에서 접속할 수 있나요?
3. `0.0.0.0`은 브라우저 주소창에 넣는 주소인가요?
4. `docker-compose.yml`의 `"8090:80"`에서 8090과 80은 각각 어디의 포트인가요?
5. Windows에서 5180번 포트를 쓰는 프로그램의 PID를 찾는 PowerShell 명령은?

::: details 정답 보기
1. `127.0.0.1`입니다(IPv6로는 `::1`).
2. 없습니다. 그 PC 자신만 접속할 수 있습니다.
3. 아닙니다. 서버가 "모든 주소에서 받겠다"고 선언할 때 쓰는 바인딩용 표기입니다.
4. 8090은 바깥(호스트 PC), 80은 컨테이너 안(nginx)의 포트입니다.
5. `Get-NetTCPConnection -LocalPort 5180 -State Listen`이고, `OwningProcess` 열이 PID입니다. (`netstat -ano | findstr :5180`도 됩니다.)
:::

## 정리

- **IP**는 컴퓨터의 주소, **호스트 이름**은 DNS로 IP가 되는 이름, **포트**는 한 컴퓨터 안의 창구 번호입니다.
- `localhost`(`127.0.0.1`, `::1`)는 언제나 "이 컴퓨터 자신"이라 남에게 알려 줄 주소가 아닙니다.
- 서버를 `127.0.0.1`에 묶으면 나만, `0.0.0.0`에 묶으면 다른 PC도(방화벽이 허락하면) 접속할 수 있습니다.
- 다른 PC에서 안 되면 **바인딩 → 내 IP로 자가 접속 → 방화벽·네트워크** 순서로 점검합니다.
- 포트를 누가 쓰는지는 `Get-NetTCPConnection`·`netstat -ano`(macOS/Linux는 `lsof`)로 찾고, PID를 확인한 뒤 끕니다.
- ts-wiki의 `--host 0.0.0.0 --port 5180`은 "같은 네트워크에 5180번으로 공개", `"8090:80"`은 "바깥 8090을 컨테이너 안 80으로 연결"입니다.

## 다음 단계

[Node.js와 npm: 패키지와 스크립트](./04-node-npm)에서 `npm run dev`의 `npm run`이 무엇이고, `node_modules`와 `package-lock.json`이 왜 있는지 배웁니다.
