---
title: '웹은 어떻게 동작하나: 브라우저 · 서버 · HTTP'
---

# 웹은 어떻게 동작하나: 브라우저 · 서버 · HTTP

<LessonMeta level="입문" :minutes="45" prev="Node.js · Git · VS Code · Docker를 설치하고 버전을 확인했다" />

## 이번에 배울 것

- 클라이언트(브라우저)와 서버가 무엇이고, 둘이 어떻게 대화하는지 설명할 수 있다.
- URL을 프로토콜 · 호스트 · 포트 · 경로로 나눠 읽을 수 있다.
- HTTP 요청과 응답의 구조(메서드, 상태 코드, 헤더, 본문)를 설명할 수 있다.
- `curl -i`로 응답 헤더를 직접 보고, `200`·`404`와 주요 헤더의 뜻을 읽을 수 있다.
- 브라우저가 HTML 하나를 받은 뒤 CSS·JS를 추가로 요청하는 과정을 안다.

## 먼저 알아 둘 것

- [준비물 설치](../part0-start/03-setup)에서 Node.js를 설치했어야 실습 서버를 띄울 수 있습니다.
- 터미널 여는 법과 `Ctrl+C`로 서버 끄기: [서버 구축을 공부하는 법](../part0-start/02-how-to-study)

## 비유로 이해하기

웹은 **식당**과 같습니다.

| 식당 | 웹 |
|---|---|
| 손님 | 브라우저 (클라이언트, client) |
| 식당 건물의 주소 | 호스트(host) — 예: `hong-coding.github.io` |
| 건물 안의 몇 번 창구 | 포트(port) — 예: `5180` |
| 메뉴판에서 고른 요리 이름 | 경로(path) — 예: `/guide/roadmap` |
| 주문서 | HTTP 요청(request) |
| 주문서 작성 규칙("메뉴 이름은 여기, 요청 사항은 여기") | HTTP(HyperText Transfer Protocol, 웹 대화 규칙) |
| 주방에서 나온 요리 + 영수증 | HTTP 응답(response) — 본문 + 헤더 |
| "그 메뉴는 없습니다" | 상태 코드 `404 Not Found` |
| 손님을 기다리며 창구를 지키는 직원 | 서버(server) 프로그램 |

핵심은 **손님이 먼저 주문해야 요리가 나온다**는 점입니다. 서버는 스스로 페이지를 보내지 않습니다. 브라우저가 요청해야만 응답합니다. 그래서 서버 프로그램의 일은 대부분 "창구를 지키며 기다리는 것"이고, 서버를 켰을 때 터미널이 멈춰 있는 것처럼 보이는 이유도 이것입니다.

## 개념 설명

### 클라이언트와 서버

- **클라이언트**(client): 요청을 보내는 쪽입니다. 대표적인 것이 브라우저이고, 이 레슨에서 쓸 `curl`(터미널에서 HTTP 요청을 보내는 프로그램)도 클라이언트입니다.
- **서버**(server): 요청을 받아 응답을 돌려주는 쪽입니다. ts-wiki에서는 VitePress 개발 서버, nginx, GitHub Pages가 서버 역할을 합니다.

"서버"라는 말은 두 가지 뜻으로 쓰입니다. **서버 프로그램**(요청을 받는 프로그램)과 **서버 컴퓨터**(그 프로그램이 돌아가는 기계)입니다. 내 노트북에서 `npm run dev`를 실행하면 내 노트북이 그 순간 서버 컴퓨터가 됩니다. 클라이언트와 서버가 **같은 컴퓨터 안에** 있어도 됩니다. 실습에서 가장 흔한 경우입니다.

### URL을 쪼개 읽기

브라우저 주소창에 입력하는 주소를 **URL**이라고 합니다. ts-wiki의 공개 주소를 쪼개 봅니다.

```text
https://hong-coding.github.io/ts-wiki/guide/roadmap
└─┬─┘   └────────┬────────┘└────────┬──────────┘
프로토콜        호스트               경로
```

개발 서버 주소도 같은 방식으로 읽습니다.

```text
http://localhost:5180/guide/roadmap
└┬─┘   └──┬────┘└┬─┘└─────┬──────┘
프로토콜 호스트  포트     경로
```

| 부분 | 뜻 | 예 |
|---|---|---|
| 프로토콜 | 어떤 규칙으로 대화할지 | `http`(암호화 없음), `https`(암호화) |
| 호스트 | 어느 컴퓨터에 갈지 | `localhost`, `hong-coding.github.io` |
| 포트 | 그 컴퓨터의 몇 번 창구로 갈지 | `5180`, `8090` |
| 경로 | 그 창구에서 무엇을 달라고 할지 | `/guide/roadmap` |

첫 번째 주소에 포트가 안 보이는 이유는, 포트를 생략하면 `http`는 **80번**, `https`는 **443번**으로 정해져 있기 때문입니다. 포트와 호스트는 [localhost · 포트 · 호스트 · IP](./03-localhost-port-host)에서 자세히 다룹니다.

### HTTP 요청과 응답의 생김새

HTTP는 사람도 읽을 수 있는 **글자**로 주고받습니다. 요청은 이렇게 생겼습니다.

```text
GET /guide/roadmap HTTP/1.1      ← 요청 줄: 메서드 · 경로 · HTTP 버전
Host: localhost:5191             ← 헤더(header): 부가 정보 "이름: 값"
User-Agent: curl/8.2.1
Accept: */*
                                 ← 빈 줄 = 헤더 끝
```

- **메서드**(method): 무엇을 하려는지. `GET`은 "가져다 주세요"입니다. 위키는 읽기만 하므로 거의 `GET`만 씁니다. 글을 등록하는 서비스라면 `POST`(보내기)도 씁니다.
- **헤더**: 요청에 붙는 메모입니다. `Host`는 어느 사이트를 원하는지, `User-Agent`는 어떤 프로그램이 요청했는지 알려 줍니다.

응답은 이렇게 생겼습니다.

```text
HTTP/1.1 200 OK                       ← 상태 줄: HTTP 버전 · 상태 코드 · 설명
Content-Type: text/html;charset=utf-8 ← 응답 헤더
Content-Length: 74249
                                      ← 빈 줄
<!DOCTYPE html>                       ← 본문(body): 실제 내용
<html lang="ko-KR" dir="ltr">
...
```

**상태 코드**(status code)는 세 자리 숫자로 결과를 알려 줍니다. 첫 자리만 알아도 대부분 짐작할 수 있습니다.

| 첫 자리 | 뜻 | 자주 보는 예 |
|---|---|---|
| 2 | 성공 | `200 OK` |
| 3 | 다른 곳으로 가세요 | `301 Moved Permanently`, `304 Not Modified`(바뀐 것 없음, 가지고 있는 것 쓰세요) |
| 4 | 요청한 쪽(클라이언트) 문제 | `404 Not Found`(없는 경로), `403 Forbidden`(권한 없음) |
| 5 | 서버 쪽 문제 | `500 Internal Server Error`, `502 Bad Gateway` |

### 따라 하기: curl -i로 응답 직접 보기

브라우저는 응답을 받아 화면을 그려 주지만, 헤더는 숨깁니다. `curl -i`를 쓰면 **헤더까지 그대로** 볼 수 있습니다(`-i`는 include, "헤더도 포함해서 보여 줘").

#### 1) 실습 서버 켜기

ts-wiki **실습용 복사본**에서 빌드한 뒤 미리보기 서버를 켭니다. ([실습용 복사본 만들기](../part0-start/02-how-to-study)를 먼저 해 둡니다. 원래 포트는 5180이지만, 원본 위키와 겹치지 않도록 이 문서에서는 5191을 씁니다.)

```bash
cd ts-wiki-practice
npm install
npm run build
npx vitepress preview docs --port 5191
```

마지막 명령의 실제 출력:

```text
Built site served at http://localhost:5191/
```

이 터미널은 그대로 두고, **새 터미널**을 하나 더 엽니다.

#### 2) 요청 보내기

::: warning Windows PowerShell 5.1에서는 curl.exe
Windows PowerShell 5.1에서 `curl`은 진짜 curl이 아니라 `Invoke-WebRequest`라는 다른 명령의 별명입니다. 실제로 확인해 보면 이렇습니다.

```powershell
Get-Alias curl
```

```text
CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Alias           curl -> Invoke-WebRequest
```

그래서 Windows에서는 **`curl.exe`** 라고 끝까지 입력합니다. Windows 10(1803) 이후에는 `curl.exe`가 기본으로 들어 있습니다(Microsoft 공식 문서 기준). macOS·Linux에서는 그냥 `curl`입니다.
:::

```powershell
# Windows (PowerShell)
curl.exe -s -i http://localhost:5191/guide/roadmap
```

```bash
# macOS/Linux
curl -s -i http://localhost:5191/guide/roadmap
```

`-s`(silent)는 진행률 표시를 숨기는 옵션입니다. Windows의 `curl.exe`는 이것을 빼면 출력 중간에 `% Total % Received ...` 같은 진행률 표가 섞입니다.

실제 출력(앞부분):

```text
HTTP/1.1 200 OK
Cache-Control: no-cache
Content-Length: 74249
Content-Type: text/html;charset=utf-8
Last-Modified: Wed, 28 Oct 2026 00:04:18 GMT
ETag: W/"74249-1793145858815"
Date: Wed, 28 Oct 2026 00:05:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<!DOCTYPE html>
<html lang="ko-KR" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>학습 로드맵 | TypeScript 마스터 위키</title>
    ...
```

#### 3) 한 줄씩 읽기

| 줄 | 뜻 |
|---|---|
| `HTTP/1.1 200 OK` | 성공. 요청한 페이지가 있었습니다. |
| `Cache-Control: no-cache` | "보관해 둬도 되지만, 쓰기 전에 바뀌었는지 서버에 꼭 물어보세요." HTML은 자주 바뀌니까요. |
| `Content-Length: 74249` | 본문 크기가 74,249바이트(약 73KB)입니다. |
| `Content-Type: text/html;charset=utf-8` | 본문은 HTML이고 글자는 UTF-8로 인코딩되어 있습니다. 브라우저는 이 줄을 보고 "화면으로 그려야겠다"고 판단합니다. |
| `Last-Modified`, `ETag` | 이 파일이 언제 바뀌었는지, 이 내용의 지문(고유 값)이 무엇인지. 다음에 같은 요청을 할 때 "이 지문 그대로면 안 보내도 돼요"라고 물어볼 수 있게 합니다(그때 응답이 `304`). |
| `Date` | 서버가 응답한 시각(GMT, 한국 시각 −9시간). |
| `Connection: keep-alive` | 연결을 바로 끊지 않고 잠시 열어 둡니다. 곧 CSS·JS를 추가로 요청할 테니까요. |
| 빈 줄 다음 | 본문. `<title>학습 로드맵 \| TypeScript 마스터 위키</title>`처럼 실제 HTML이 옵니다. |

**확인 방법**: 첫 줄에 `200 OK`, 헤더에 `Content-Type: text/html`, 본문에 `<title>`이 보이면 성공입니다.

#### 4) 없는 페이지 요청하기

`-I`(대문자)는 **헤더만** 달라고 하는 옵션입니다.

```bash
curl -s -I http://localhost:5191/nope
```

```text
HTTP/1.1 404 Not Found
Date: Wed, 28 Oct 2026 00:05:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

서버는 살아 있지만 "그 메뉴는 없습니다"라고 답했습니다. **서버가 꺼진 것과 404는 다릅니다.** 404는 서버가 대답을 한 것입니다.

#### 5) CSS·JS 파일 요청하기

HTML 안을 보면 `/assets/style.BZYBsFKE.css`, `/assets/app.DY-ph0fJ.js` 같은 파일 이름이 보입니다. 이런 파일 하나를 요청해 봅니다. (파일 이름 가운데의 알 수 없는 글자는 빌드할 때마다 달라지므로, 내 빌드 결과의 `docs/.vitepress/dist/assets` 폴더에서 실제 이름을 확인해 바꿔 넣습니다.)

```bash
curl -s -I http://localhost:5191/assets/app.raH-w6km.js
```

```text
HTTP/1.1 200 OK
Content-Length: 1352
Content-Type: text/javascript
Last-Modified: Wed, 28 Oct 2026 00:03:37 GMT
ETag: W/"1352-1793145817369"
Cache-Control: public,max-age=31536000,immutable
Date: Wed, 28 Oct 2026 00:05:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

HTML과 두 가지가 다릅니다.

- `Content-Type: text/javascript` → 이건 화면에 그릴 것이 아니라 **실행할 프로그램**입니다.
- `Cache-Control: public,max-age=31536000,immutable` → "1년(31,536,000초) 동안 보관해 두고, 다시 묻지도 마세요(immutable, 변하지 않음)." 파일 이름에 내용의 지문이 들어 있어서, 내용이 바뀌면 **이름 자체가 바뀌기** 때문에 이렇게 해도 안전합니다.

#### 6) 서버를 끄고 다시 요청하기

미리보기 서버를 켠 터미널에서 `Ctrl+C`로 끈 뒤, 다시 요청합니다.

```bash
curl -sS -i http://localhost:5191/guide/roadmap
```

`-sS`는 진행률은 숨기되(`-s`) 에러 메시지는 보여 달라(`-S`)는 뜻입니다. 실제 출력:

```text
curl: (7) Failed to connect to localhost port 5191 after 2238 ms: Couldn't connect to server
```

(curl 버전에 따라 문장이 조금 다를 수 있습니다. Windows의 `curl.exe` 8.21.0에서는 `Could not connect to server`로 끝났습니다. 숫자 `(7)`은 같습니다.)

이번에는 상태 코드도 헤더도 없습니다. **창구에 아무도 없으니 주문서를 받을 사람이 없습니다.** "연결할 수 없음"과 "404"를 구분하는 것이 문제 해결의 첫걸음입니다.

| 보이는 것 | 뜻 | 먼저 의심할 것 |
|---|---|---|
| `Could not connect` / 브라우저 "사이트에 연결할 수 없음" | 그 주소·포트에서 기다리는 서버가 없음 | 서버가 꺼졌나? 포트가 다른가? |
| `404 Not Found` | 서버는 있는데 그 경로의 파일이 없음 | 경로 오타? 빌드에 그 페이지가 있나? |
| `500`번대 | 서버는 있는데 서버 안에서 오류 | 서버 터미널의 로그 |

### 브라우저는 요청을 여러 번 보낸다

브라우저 주소창에 Enter 한 번을 누르면 요청이 한 번만 가는 것 같지만, 실제로는 이렇습니다.

```text
브라우저                                  서버
   │  GET /guide/roadmap                   │
   │──────────────────────────────────────▶│
   │◀──────────── 200 text/html ───────────│  ① HTML을 받고 읽어 보니…
   │  GET /assets/style.BZYBsFKE.css       │
   │──────────────────────────────────────▶│  ② "CSS도 필요하네"
   │◀──────────── 200 text/css ────────────│
   │  GET /assets/app.DY-ph0fJ.js          │
   │──────────────────────────────────────▶│  ③ "JS도 필요하네"
   │◀──────────── 200 text/javascript ─────│
   │  GET /favicon.svg ...                 │  ④ 아이콘, 글꼴, 검색 색인…
   ▼                                       ▼
          화면 완성 (글자 → 모양 → 동작)
```

브라우저에서 `F12`를 눌러 **개발자 도구**를 열고 **Network(네트워크)** 탭을 본 상태에서 페이지를 새로 고치면, 이 요청 목록과 각각의 상태 코드·헤더를 볼 수 있습니다. `curl -i`로 본 것과 같은 내용입니다.

## ts-wiki에서는

### 상태 코드 404는 nginx.conf가 정한다

ts-wiki를 Docker로 띄우면 nginx가 응답합니다. `nginx.conf`의 다음 부분이 "요청 경로 → 파일" 연결과 404 처리를 정합니다.

```nginx
    # cleanUrls: /guide/roadmap → /guide/roadmap.html
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    error_page 404 /404.html;
```

- 브라우저가 `GET /guide/roadmap`을 보내면, nginx는 `/guide/roadmap` 파일 → `/guide/roadmap.html` 파일 → `/guide/roadmap/` 폴더 순서로 찾아보고, 아무것도 없으면 `404`를 돌려줍니다.
- `error_page 404 /404.html;`은 404일 때 VitePress가 만들어 둔 "페이지를 찾을 수 없습니다" 화면(`404.html`)을 본문으로 보내라는 뜻입니다.

`.html`을 붙여 찾는 이유는 `config.mts`의 `cleanUrls: true` 때문입니다. 주소에서 `.html`을 빼고 깔끔하게 보이게 하는 설정이라, 서버가 그 빠진 `.html`을 대신 붙여 찾아 줘야 합니다.

### 캐시 헤더도 nginx.conf에 있다

```nginx
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
```

위 실습에서 본 `Cache-Control: ... immutable`과 같은 생각입니다. `/assets/` 아래 파일은 이름에 내용 지문이 들어 있으므로 30일 동안 다시 묻지 말고 보관하게 합니다. 미리보기 서버(`vitepress preview`)는 1년, ts-wiki의 nginx는 30일로 값만 다를 뿐 원리는 같습니다.

### HTML의 title은 config.mts에서 온다

`curl -i` 결과의 `<title>학습 로드맵 | TypeScript 마스터 위키</title>`에서, 앞의 "학습 로드맵"은 그 페이지의 제목이고 뒤의 "TypeScript 마스터 위키"는 `config.mts` 22번째 줄입니다.

```ts
  title: 'TypeScript 마스터 위키',
```

`<html lang="ko-KR">`도 21번째 줄 `lang: 'ko-KR',`에서 왔습니다. 설정 파일 한 줄이 HTTP 응답 본문의 어디로 가는지 보이기 시작하면, Part 4에서 `config.mts`를 읽을 때 훨씬 수월합니다.

## 자주 하는 실수

### 1. PowerShell에서 curl을 썼더니 표나 경고가 나온다

- **증상**: `curl -i http://localhost:5191`을 입력했더니 `StatusCode : 200`, `Content : ...` 같은 표 형식이 나오거나, `-i` 매개변수를 이해하지 못한다는 빨간 에러가 나옵니다.
- **원인**: Windows PowerShell 5.1의 `curl`은 `Invoke-WebRequest`의 별명입니다. 옵션 체계가 진짜 curl과 다릅니다.
- **해결**: `curl.exe -i ...`처럼 `.exe`를 붙입니다.

### 2. 404를 "서버가 죽었다"로 오해한다

- **증상**: 브라우저에 404 화면이 떠서 서버를 재시작했지만 그대로입니다.
- **원인**: 404는 서버가 **정상적으로 대답한 것**입니다. 그 경로에 해당하는 파일이 없을 뿐입니다.
- **해결**: 주소의 경로에 오타가 없는지, 빌드 결과(`docs/.vitepress/dist`)에 그 경로의 `.html` 파일이 있는지 확인합니다. 서버가 정말 꺼졌다면 404가 아니라 "연결할 수 없음"이 나옵니다.

### 3. https를 http로(또는 반대로) 입력한다

- **증상**: `https://localhost:5180`으로 접속했더니 "보안 연결을 할 수 없음" 같은 화면이 나옵니다.
- **원인**: 개발 서버는 암호화 없는 `http`로만 기다립니다. `https`로 말을 걸면 서로 규칙이 맞지 않습니다.
- **해결**: 로그에 찍힌 주소(`http://localhost:...`)를 그대로 복사해 씁니다. GitHub Pages처럼 공개 사이트는 반대로 `https`를 씁니다.

### 4. 파일 이름의 지문 부분을 그대로 따라 친다

- **증상**: 문서에 나온 `curl -I http://localhost:5191/assets/app.raH-w6km.js`를 그대로 실행했더니 `404`가 나옵니다.
- **원인**: `raH-w6km` 같은 부분은 빌드할 때마다, 내용이 바뀔 때마다 달라집니다.
- **해결**: 내 `docs/.vitepress/dist/assets` 폴더나 `curl -i`로 받은 HTML 안에서 실제 파일 이름을 찾아 씁니다.

## 직접 해 보기

### 과제 1 ⭐ URL 쪼개기

`http://localhost:8090/part0-start/03-setup`을 프로토콜 · 호스트 · 포트 · 경로로 나눠 봅니다.

::: details 정답 보기
- 프로토콜: `http`
- 호스트: `localhost`
- 포트: `8090` (ts-wiki를 Docker로 띄웠을 때의 포트)
- 경로: `/part0-start/03-setup`
:::

### 과제 2 ⭐ 홈 페이지 헤더 읽기

실습 서버를 켜고 `curl.exe -s -I http://localhost:5191/`(macOS/Linux는 `curl -s -I ...`)을 실행합니다. 상태 코드, `Content-Type`, `Content-Length`를 찾아 적어 봅니다.

::: details 정답 예시
`HTTP/1.1 200 OK`, `Content-Type: text/html;charset=utf-8`, `Content-Length:`는 빌드 결과에 따라 다르지만 이 문서 작성 때는 `27552`였습니다. 홈 화면 HTML이 약 27KB라는 뜻입니다.
:::

### 과제 3 ⭐⭐ 개발자 도구로 요청 세어 보기

브라우저로 실습 서버의 아무 레슨이나 열고, `F12` → Network 탭 → 새로 고침을 합니다. 요청이 모두 몇 개인지, 그중 `text/html`은 몇 개인지 세어 봅니다.

::: details 힌트
Network 탭 아래쪽에 "requests"(요청 수) 합계가 나옵니다. HTML은 보통 1개이고, 나머지는 CSS · JS · 글꼴 · 아이콘입니다. "Enter 한 번 = 요청 한 번"이 아니라는 것을 확인하는 과제입니다.
:::

### 과제 4 ⭐⭐⭐ 꺼진 서버 vs 없는 페이지

같은 실습 서버로 다음 세 가지를 차례로 해 보고, 각각 `curl`의 출력이 어떻게 다른지 표로 정리합니다. ① 서버를 켠 채로 `/guide/roadmap` 요청 ② 켠 채로 `/no-such-page` 요청 ③ 서버를 `Ctrl+C`로 끈 뒤 `/guide/roadmap` 요청

::: details 정답 보기
| 상황 | curl 출력 | 뜻 |
|---|---|---|
| ① | `HTTP/1.1 200 OK` + HTML | 성공 |
| ② | `HTTP/1.1 404 Not Found` | 서버는 대답했지만 페이지가 없음 |
| ③ | `curl: (7) Failed to connect ...` | 대답할 서버가 없음 |

끝나면 서버가 꺼져 있는지 다시 확인합니다.
:::

## 확인 퀴즈

1. 서버는 브라우저가 요청하지 않아도 먼저 페이지를 보내나요?
2. `https://hong-coding.github.io/ts-wiki/`의 포트는 몇 번인가요?
3. 응답 헤더 중 "이 본문이 HTML인지, JavaScript인지"를 알려 주는 것은 무엇인가요?
4. `404`와 "연결할 수 없음"의 차이는 무엇인가요?
5. ts-wiki의 nginx가 `/guide/roadmap` 요청에 `roadmap.html` 파일을 찾아 주는 설정은 어디에 있나요?

::: details 정답 보기
1. 아닙니다. 서버는 요청이 와야만 응답합니다.
2. 443번입니다. `https`에서 포트를 생략하면 443입니다.
3. `Content-Type`입니다.
4. 404는 서버가 "그런 페이지 없다"고 대답한 것이고, "연결할 수 없음"은 그 주소·포트에서 대답할 서버 자체가 없는 것입니다.
5. `nginx.conf`의 `try_files $uri $uri.html $uri/ =404;`입니다.
:::

## 정리

- 웹은 **클라이언트가 요청하고, 서버가 응답하는** 대화이고, 그 대화 규칙이 HTTP입니다.
- URL은 프로토콜 · 호스트 · 포트 · 경로로 나뉘고, 포트를 생략하면 `http`는 80, `https`는 443입니다.
- 응답은 **상태 줄(`200 OK`) + 헤더 + 빈 줄 + 본문**입니다. `curl -i`(Windows는 `curl.exe -i`)로 직접 볼 수 있습니다.
- `Content-Type`은 본문의 종류, `Cache-Control`은 보관 규칙입니다.
- 브라우저는 HTML을 받은 뒤 CSS·JS·글꼴을 **추가로 여러 번** 요청합니다.
- `404`(서버가 대답함)와 "연결할 수 없음"(대답할 서버 없음)을 구분합니다.

## 다음 단계

[정적 사이트와 동적 서버](./02-static-vs-dynamic)에서 "미리 만들어 둔 파일을 보내는 서버"와 "요청마다 응답을 새로 만드는 서버"를 직접 띄워 비교합니다.
