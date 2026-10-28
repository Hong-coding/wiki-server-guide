---
title: 빌드 결과물을 서버로 서비스하기
---

# 빌드 결과물을 서버로 서비스하기

<LessonMeta level="실전" :minutes="40" prev="npm run dev로 개발 서버를 띄우고 포트와 --host를 다뤘습니다" />

## 이번에 배울 것

- 빌드 결과물(`dist`)이 "HTML·CSS·JS 파일 묶음"이라서 **아무 정적 서버로나** 서비스할 수 있다는 것을 설명할 수 있다.
- `vitepress preview`, `npx serve`, `npx http-server`, `python -m http.server`로 같은 `dist`를 띄워 볼 수 있다.
- `cleanUrls` 때문에 확장자 없는 주소(`/guide/roadmap`)에서 생기는 404를 재현하고, 원인과 해결책을 설명할 수 있다.
- 정적 서버마다 동작이 조금씩 다르다는 것을 알고, `curl`로 직접 비교할 수 있다.

## 먼저 알아 둘 것

- 정적 사이트의 뜻: [정적 사이트와 동적 서버](../part1-concepts/02-static-vs-dynamic)
- 빌드가 하는 일: [정적 사이트 생성기(SSG)와 빌드](../part1-concepts/05-ssg), [빌드와 미리보기](../part5-build-along/06-build-preview)
- 6-1에서 만든 실습용 복사본

## 비유로 이해하기

빌드는 **도시락을 싸는 일**입니다. 마크다운(재료)을 HTML(완성된 도시락)로 바꿔 `dist`라는 냉장고에 넣어 둡니다.

정적 서버는 **도시락 판매대**입니다. 손님이 "3번 도시락이요" 하면 냉장고에서 3번을 꺼내 줄 뿐, 요리하지 않습니다. 그래서 판매대는 누가 맡아도 됩니다. VitePress가 직접 만든 판매대(preview)든, Node.js 판매대(serve, http-server)든, Python 판매대든, nginx 판매대든 같은 도시락을 팝니다.

차이는 **손님이 이름을 줄여 말할 때**입니다. 손님이 "불고기 도시락.html"이 아니라 "불고기 도시락"이라고만 말하면, 눈치 있는 판매원은 알아듣고(200), 융통성 없는 판매원은 "그런 상품 없습니다"(404)라고 답합니다. 이 차이가 이번 레슨의 핵심입니다.

## 따라 하기

### 1단계. 빌드해서 `dist` 만들기

6-1에서 만든 복사본 폴더에서 실행합니다.

```bash
npm run build
```

실제 출력:

```text
> ts-wiki@1.0.0 build
> vitepress build docs

  vitepress v1.6.3

✓ building client + server bundles...
✓ rendering pages...
build complete in 152.59s.
```

ts-wiki는 레슨이 많아 작성 PC에서 약 2분 반이 걸렸습니다. 결과물을 봅니다.

Windows(PowerShell):

```powershell
Get-ChildItem docs\.vitepress\dist | Select-Object Name
Get-ChildItem docs\.vitepress\dist\guide | Select-Object Name
```

macOS/Linux(bash):

```bash
ls docs/.vitepress/dist
ls docs/.vitepress/dist/guide
du -sh docs/.vitepress/dist
```

실제 출력:

```text
404.html
appendix
assets
favicon.svg
guide
hashmap.json
index.html
part0-start
...
vp-icons.css

checklist.html
how-to-study.html
roadmap.html
study-plan.html
toc.html
writing-guide.html

39M	docs/.vitepress/dist
```

- `docs/guide/roadmap.md` → `dist/guide/roadmap.html`처럼, 마크다운 하나가 HTML 파일 하나가 됐습니다.
- `assets/`에는 CSS·JS가, `404.html`에는 "없는 페이지" 화면이 들어 있습니다.
- 이 폴더 안에는 Node.js도 VitePress도 없습니다. **그냥 파일**입니다. 그래서 어떤 웹 서버든 이 폴더를 가리키기만 하면 위키가 뜹니다.

**확인 방법**: `dist/index.html`과 `dist/guide/roadmap.html`이 있으면 성공입니다.

### 2단계. 사이트 안의 링크 모양 보기

홈 HTML에서 링크가 어떻게 적혀 있는지 봅니다.

```bash
grep -o 'href="/guide/[^"]*"' docs/.vitepress/dist/index.html | sort -u
```

실제 출력:

```text
href="/guide/roadmap"
href="/guide/study-plan"
href="/guide/toc"
```

파일은 `roadmap.html`인데 링크는 `.html` 없이 `/guide/roadmap`입니다. ts-wiki의 `config.mts`에 `cleanUrls: true`가 있기 때문입니다. **cleanUrls**는 "주소에서 `.html`을 떼어 깔끔하게 보이게 하라"는 설정입니다. 주소가 짧고 보기 좋아지는 대신, 서버가 `/guide/roadmap` 요청을 받았을 때 `roadmap.html`을 찾아 줄 줄 알아야 합니다.

### 3단계. vitepress preview로 띄우기

VitePress에 들어 있는 미리보기 서버입니다. ts-wiki의 `npm run preview`가 이것입니다. 실습에서는 포트를 바꿔 직접 실행합니다.

```bash
npx vitepress preview docs --port 5195
```

실제 출력:

```text
Built site served at http://localhost:5195/
```

개발 서버와 달리 시작이 거의 즉시입니다. 변환할 것이 없기 때문입니다.

### 4단계. 같은 `dist`를 다른 정적 서버로 띄우기

이번에는 VitePress가 아닌 서버로 띄웁니다. 모두 `dist` 폴더를 가리킨다는 점만 같습니다. 각각 다른 터미널에서 실행합니다.

**① serve (Node.js, 작성 시점 확인 버전 14.2.4)**

```bash
cd docs/.vitepress
npx -y serve@14.2.4 dist -l 5196
```

실제 출력:

```text
 INFO  Accepting connections at http://localhost:5196
```

- `npx -y`는 "설치할까요?" 질문에 자동으로 예라고 답합니다. 처음 한 번은 npm 저장소에서 내려받습니다.
- `@14.2.4`처럼 버전을 박아 두면 나중에 실행해도 같은 동작을 얻습니다. 작성 시점에는 `The latest version of serve is 14.2.6` 안내가 함께 나왔습니다.
- `-l`은 listen(기다릴 포트)입니다.

**② http-server (Node.js, 작성 시점 확인 버전 14.1.1)**

```bash
cd docs/.vitepress
npx -y http-server@14.1.1 dist -p 5197
```

실제 출력(일부):

```text
Starting up http-server, serving dist

http-server version: 14.1.1
...
Available on:
  http://<이 PC의 IP>:5197
Hit CTRL-C to stop the server
```

**③ Python 내장 서버 (작성 시점 Python 3.13.3)**

Node.js가 없는 PC에서도 Python만 있으면 쓸 수 있습니다. 이 명령은 **현재 폴더**를 서비스하므로 `dist` 안으로 들어가서 실행합니다.

Windows(PowerShell):

```powershell
cd docs\.vitepress\dist
python -m http.server 5198
```

macOS/Linux(bash):

```bash
cd docs/.vitepress/dist
python3 -m http.server 5198
```

이 명령은 시작 메시지 없이 바로 요청 기록을 찍기 시작합니다.

::: warning 출처를 확인하고 실행하세요
`npx -y 패키지`는 인터넷에서 코드를 내려받아 바로 실행합니다. serve와 http-server는 널리 쓰이는 패키지지만, 이름이 비슷한 가짜 패키지도 있습니다. 철자를 확인하고, 회사 PC라면 사내 정책을 먼저 봅니다.
:::

### 5단계. 네 서버를 `curl`로 비교하기

다섯 가지 주소를 네 서버에 똑같이 요청해 상태 코드를 봅니다. 터미널을 하나 더 열어 실행합니다.

```bash
for p in 5195 5196 5197 5198; do
  for u in / /guide/roadmap /guide/roadmap.html /guide /nope; do
    curl -s -o /dev/null -w "$p $u %{http_code} %{size_download}\n" "http://localhost:$p$u"
  done
done
```

PowerShell에서는 `curl`이 다른 명령의 별칭일 수 있으므로 `curl.exe`로 씁니다.

```powershell
foreach ($p in 5195,5196,5197,5198) {
  foreach ($u in '/','/guide/roadmap','/guide/roadmap.html','/guide','/nope') {
    curl.exe -s -o NUL -w "$p $u %{http_code}`n" "http://localhost:$p$u"
  }
}
```

실제 결과를 표로 정리하면 이렇습니다(괄호는 받은 바이트 수).

| 요청 주소 | vitepress preview | serve 14.2.4 | http-server 14.1.1 | python http.server |
|---|---|---|---|---|
| `/` | 200 | 200 | 200 | 200 |
| `/guide/roadmap` | 200 | 200 | 200 | **404** (335) |
| `/guide/roadmap.html` | 200 | 301 → `/guide/roadmap` | 200 | 200 |
| `/guide` | 404 | 200 (폴더 목록) | 302 | 301 |
| `/nope` | 404 (18055) | 404 (18055) | 404 (18055) | 404 (335) |

읽는 법:

- **`/guide/roadmap`**: Python만 404입니다. Python 서버는 주소와 똑같은 이름의 파일만 찾습니다. `dist/guide/roadmap`이라는 파일은 없고 `roadmap.html`만 있으니 "없음"입니다. 이것이 **cleanUrls 404 문제**입니다.
- **`/guide/roadmap.html`**: serve는 오히려 `.html` 붙은 주소를 `.html` 없는 주소로 돌려보냅니다(301 영구 이동). serve는 기본으로 cleanUrls를 켜 둔 서버입니다.
- **`/guide`**: `guide` 폴더에는 `index.html`이 없습니다. 서버마다 404, 폴더 목록 보여 주기, `/guide/`로 이동시키기 등 반응이 제각각입니다.
- **`/nope` 18055바이트**: `dist/404.html`의 크기입니다. VitePress·serve·http-server는 없는 주소에 위키의 404 화면을 보여 주고, Python은 자기 기본 에러 화면(335바이트)을 보여 줍니다.

Python 서버 터미널에 찍힌 실제 기록:

```text
::1 - - [28/Oct/2026 09:13:26] "GET / HTTP/1.1" 200 -
::1 - - [28/Oct/2026 09:13:26] code 404, message File not found
::1 - - [28/Oct/2026 09:13:26] "GET /guide/roadmap HTTP/1.1" 404 -
::1 - - [28/Oct/2026 09:13:26] "GET /guide/roadmap.html HTTP/1.1" 200 -
```

**확인 방법**: 내 결과가 표와 같으면 성공입니다. 특히 Python의 `/guide/roadmap`이 404인지 확인합니다.

### 6단계. 브라우저에서 404 문제를 겪어 보기

Python 서버(5198)로 실제 증상을 봅니다.

1. 브라우저에서 `http://localhost:5198/`을 엽니다. 홈이 잘 뜹니다.
2. 사이드바에서 "학습 로드맵"을 클릭합니다. **잘 열립니다.** 주소창은 `/guide/roadmap`입니다.
3. 그 상태에서 `F5`(새로 고침)를 누릅니다. **"Error response / File not found"** 화면이 뜹니다.

왜 2번은 되고 3번은 안 될까요?

- 2번: 이미 위키의 JavaScript가 브라우저에 올라와 있어서, 클릭하면 JavaScript가 필요한 조각만 받아 화면을 바꿉니다(클라이언트 라우팅, client-side routing). 서버에 `/guide/roadmap`을 **파일로** 요청하지 않습니다.
- 3번: 새로 고침이나 주소창 직접 입력, 북마크, 동료가 보낸 링크는 서버에 `/guide/roadmap`을 그대로 요청합니다. 서버가 `roadmap.html`을 찾아 주지 못하면 404입니다.

그래서 이 문제는 "링크로 들어가면 되는데 새로 고침하면 깨진다"는, 처음 보면 당황스러운 모습으로 나타납니다.

### 7단계. 해결하기

해결책은 세 가지입니다. 상황에 맞게 고릅니다.

**해결 ① cleanUrls를 이해하는 서버를 쓴다**

vitepress preview, serve, http-server는 5단계에서 본 것처럼 `/guide/roadmap`을 처리합니다. 로컬 확인용이면 이것으로 충분합니다.

**해결 ② 서버에 "없으면 .html을 붙여 찾아라"를 가르친다**

nginx라면 6-3에서 볼 ts-wiki의 `nginx.conf` 한 줄이 이 일을 합니다.

```nginx
try_files $uri $uri.html $uri/ =404;
```

Python 서버도 몇 줄만 덧붙이면 같은 일을 하게 만들 수 있습니다. 아래 파일을 `dist` **바깥**(예: 복사본 폴더의 상위)에 `clean_http.py`로 저장합니다.

```python
# cleanUrls(확장자 없는 주소)를 지원하는 간이 정적 서버: /guide/roadmap 요청에 roadmap.html을 돌려줍니다.
import http.server
import os
import sys


class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        # 파일도 폴더도 없고, 같은 이름의 .html이 있으면 그 파일로 바꿉니다.
        if not os.path.exists(path) and os.path.isfile(path + ".html"):
            self.path = self.path.split("?", 1)[0] + ".html"
        return super().send_head()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
http.server.ThreadingHTTPServer(("", port), CleanUrlHandler).serve_forever()
```

`dist` 안에서 실행합니다.

```bash
cd docs/.vitepress/dist
python ../../../../clean_http.py 5199
```

같은 비교를 하면 실제 결과는 이렇습니다.

```text
5199 / 200 27552
5199 /guide/roadmap 200 74249
5199 /guide/roadmap.html 200 74249
5199 /guide 301 0
5199 /nope 404 335
```

`/guide/roadmap`이 200으로 바뀌었습니다. 74249바이트는 `roadmap.html`의 크기와 같습니다.

**해결 ③ cleanUrls를 끈다**

`config.mts`에서 `cleanUrls: false`로 바꾸면 링크가 `/guide/roadmap.html`로 만들어져 어떤 서버에서도 동작합니다. 대신 주소가 길어지고, 이미 공유된 `.html` 없는 링크가 깨질 수 있습니다. ts-wiki는 nginx와 GitHub Pages가 모두 확장자 없는 주소를 처리할 수 있으므로 켜 둔 채로 씁니다.

::: tip GitHub Pages는?
작성 시점에 ts-wiki의 Pages 주소 `https://hong-coding.github.io/ts-wiki/guide/roadmap`을 `curl`로 요청하면 200이 나왔습니다. GitHub Pages는 `.html`을 붙여 찾는 동작을 기본으로 합니다(6-5).
:::

### 8단계. 끄기

각 서버 터미널에서 `Ctrl+C`를 누릅니다. 터미널을 잃어버렸다면 6-1의 방법으로 포트의 PID를 찾아 끕니다.

```powershell
foreach ($p in 5195,5196,5197,5198,5199) {
  Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ }
}
```

**확인 방법**: `netstat -ano | findstr ":519"`에 LISTENING 줄이 남아 있지 않으면 됩니다.

## ts-wiki에서는

- `docs/.vitepress/config.mts` 25번째 줄 `cleanUrls: true` — 링크에서 `.html`을 뗍니다. 이 한 줄 때문에 서버 쪽에 "`.html` 붙여 찾기"가 필요해졌습니다.
- `nginx.conf` 7~10번째 줄 — 주석 `# cleanUrls: /guide/roadmap → /guide/roadmap.html` 바로 아래 `try_files $uri $uri.html $uri/ =404;`가 해결 ②를 nginx로 한 것입니다. 주석이 "왜 이 줄이 있는지"를 설정 이름(cleanUrls)으로 연결해 둔 점을 눈여겨봅니다.
- `nginx.conf` 12번째 줄 `error_page 404 /404.html;` — 5단계 표에서 VitePress·serve가 없는 주소에 18055바이트(위키 404 화면)를 준 것과 같은 동작을 nginx에도 시킵니다.
- `package.json`의 `"preview": "vitepress preview docs --host 0.0.0.0 --port 5180"` — 개발 서버와 같은 주소로 열리게 해서, 사용자가 "주소는 늘 5180"으로만 기억하면 되도록 했습니다.
- `.gitignore`의 `docs/.vitepress/dist/` — `dist`는 언제든 다시 만들 수 있는 결과물이라 저장소에 넣지 않습니다. 서버(Docker, GitHub Actions)가 각자 빌드합니다.

## 자주 하는 실수

**1. 새로 고침하면 404 (Python, 설정 안 된 nginx 등)**

- 증상: Python이면 `Error response` / `Error code: 404` / `File not found` 화면. 링크로 들어갈 때는 멀쩡함.
- 원인: cleanUrls 주소(`/guide/roadmap`)를 서버가 `roadmap.html`로 연결하지 못함.
- 해결: cleanUrls를 아는 서버로 바꾸거나, `try_files $uri $uri.html ...` 같은 설정을 넣습니다.

**2. Python 서버에서 폴더 목록만 보인다**

- 증상: 브라우저에 "Directory listing for /" 와 `docs/`, `package.json` 같은 목록.
- 원인: `dist`가 아니라 프로젝트 폴더에서 `python -m http.server`를 실행했습니다.
- 해결: `cd docs/.vitepress/dist` 후 다시 실행합니다.

**3. 글을 고쳤는데 preview에 반영되지 않는다**

- 증상: 개발 서버에서는 보이던 수정이 preview에는 없음.
- 원인: preview는 `dist`(이미 싼 도시락)를 보여 줄 뿐입니다.
- 해결: `npm run build`를 다시 한 뒤 preview를 새로 고칩니다.

**4. `npx serve`가 엉뚱한 포트에 뜬다**

- 증상: `-l 5196`을 줬는데 `Accepting connections at http://localhost:60998`처럼 다른 번호.
- 원인: 5196이 이미 쓰이고 있어 serve가 빈 포트를 골랐습니다(작성 중 실제로 겪었습니다).
- 해결: 출력에 적힌 주소를 그대로 쓰거나, 6-1 방법으로 포트 주인을 찾아 정리합니다.

## 직접 해 보기

**⭐ 과제 1.** `npm run build` 후 `dist` 안에 `part1-basics` 폴더의 HTML 파일이 몇 개인지 세어 보고, `docs/part1-basics`의 `.md` 개수와 같은지 비교하세요.

::: details 힌트
PowerShell: `(Get-ChildItem docs\.vitepress\dist\part1-basics\*.html).Count`
bash: `ls docs/.vitepress/dist/part1-basics/*.html | wc -l`
파트 소개(`index.md`)도 `index.html`이 됩니다.
:::

**⭐ 과제 2.** Python 서버로 `dist`를 띄우고, 사이드바 클릭으로는 열리지만 새로 고침하면 404가 나는 것을 직접 확인하세요.

::: details 정답 보기
6단계를 그대로 따라 합니다. 새로 고침 뒤 Python 터미널에 `"GET /guide/roadmap HTTP/1.1" 404`가 찍힙니다.
:::

**⭐⭐ 과제 3.** `clean_http.py`로 띄운 뒤 `/guide/roadmap?x=1`처럼 쿼리 문자열이 붙은 주소도 200이 나오는지 확인하세요. 코드의 어느 부분이 쿼리를 처리하나요?

::: details 정답 보기
`self.path.split("?", 1)[0]`이 `?` 뒤를 떼어 낸 뒤 `.html`을 붙입니다. 이 처리가 없으면 `/guide/roadmap?x=1.html`을 찾게 됩니다.
:::

**⭐⭐⭐ 과제 4.** 5단계 표의 `/guide` 행처럼 서버마다 반응이 다른 주소를 하나 더 찾아보세요. (힌트: 맨 끝 `/`가 있는 `/guide/`, 대문자 `/Guide/roadmap`)

::: details 힌트
같은 반복문에 주소만 추가합니다. Windows의 파일 시스템은 대소문자를 구분하지 않아서, Linux 서버(Docker·GitHub Pages)와 결과가 다를 수 있다는 점도 관찰해 보세요.
:::

## 확인 퀴즈

**1.** `dist` 폴더를 Node.js가 없는 PC로 복사했습니다. 위키를 띄울 수 있나요?

::: details 정답 보기
있습니다. `dist`는 그냥 HTML·CSS·JS 파일이라 Python, nginx 등 아무 정적 서버로 서비스할 수 있습니다.
:::

**2.** cleanUrls를 켜면 서버에 어떤 능력이 필요해지나요?

::: details 정답 보기
`/guide/roadmap`처럼 확장자 없는 요청을 받았을 때 `roadmap.html` 파일을 찾아 돌려주는 능력입니다.
:::

**3.** 링크 클릭으로는 열리는데 새로 고침하면 404가 나는 이유는?

::: details 정답 보기
링크 클릭은 브라우저의 JavaScript가 화면을 바꾸는 클라이언트 라우팅이라 서버에 그 주소를 파일로 요청하지 않습니다. 새로 고침은 서버에 그 주소를 그대로 요청하므로 서버가 처리하지 못하면 404입니다.
:::

**4.** `/nope`에 대해 어떤 서버는 18055바이트, Python은 335바이트를 돌려줬습니다. 차이는?

::: details 정답 보기
18055바이트는 위키의 `404.html`입니다. Python 기본 서버는 `404.html`을 모르고 자기 에러 화면을 보여 줍니다.
:::

## 정리

- 빌드 결과물 `dist`는 그냥 파일 묶음이라 **어떤 정적 서버로도** 서비스할 수 있습니다.
- vitepress preview, `npx serve@14.2.4`, `npx http-server@14.1.1`은 확장자 없는 주소를 처리했고, `python -m http.server`는 404를 냈습니다(작성 시점 확인).
- 이 404는 `cleanUrls: true` 때문이며, "링크 클릭은 되고 새로 고침은 안 됨"으로 나타납니다.
- 해결: cleanUrls를 아는 서버 사용, 서버에 `.html` 붙여 찾기 설정(nginx `try_files`), 또는 cleanUrls 끄기.
- 서버마다 세부 동작(폴더 주소, 404 화면)이 다르므로 `curl`로 직접 비교해 보는 습관을 들입니다.

## 다음 단계

[Docker 이미지로 묶기: Dockerfile · nginx.conf](./03-docker-nginx) — 빌드와 nginx 서버를 한 상자(이미지)에 담아, 어느 PC에서든 같은 명령으로 위키를 띄웁니다.
