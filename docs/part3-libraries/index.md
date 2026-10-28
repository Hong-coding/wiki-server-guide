---
title: Part 3. 라이브러리 사전
---

# Part 3. 라이브러리 사전

<PartLessons dir="part3-libraries" />

## 이 파트가 왜 필요한가

ts-wiki의 `package.json`을 열어 보면 `devDependencies`(개발할 때만 필요한 패키지 목록)에 딱 세 줄이 있습니다.

```json
"devDependencies": {
  "typescript": "5.6.3",
  "vitepress": "1.6.3",
  "vue": "3.5.13"
}
```

세 개뿐이라 단순해 보이지만, `npm install`을 하면 `node_modules` 폴더에는 수백 개의 패키지가 깔립니다. VitePress 혼자서 모든 일을 하는 것이 아니라 **Vite**(개발 서버와 번들러), **Vue**(화면을 그리는 UI 프레임워크), **markdown-it**(마크다운 → HTML 변환), **Shiki**(코드 색칠), **MiniSearch**(검색 엔진) 같은 도구가 각자 맡은 일을 하고, VitePress는 이것들을 한데 엮는 역할을 합니다.

그리고 위키를 다 만든 뒤 **사람들이 접속할 수 있게 띄우는** 단계에서는 또 다른 도구가 등장합니다.

- **nginx**: 만들어진 HTML 파일을 브라우저에 내려 주는 웹 서버
- **Docker / Docker Compose**: nginx와 위키 파일을 한 상자(이미지)에 담아 어느 PC에서나 똑같이 띄우는 도구
- **GitHub Actions**: `git push`만 하면 빌드와 GitHub Pages 배포를 자동으로 해 주는 도구

문제가 생겼을 때 "어느 도구의 문제인지"를 가려낼 수 있어야 고칠 수 있습니다. 예를 들어 "코드 블록 색이 이상하다"는 Shiki, "검색이 안 된다"는 MiniSearch, "다른 PC에서 주소를 치면 404가 뜬다"는 nginx 설정 쪽을 먼저 의심해야 합니다. 이 파트는 그 **지도**를 만들어 줍니다.

## 이 파트의 레슨은 모두 같은 순서로 되어 있습니다

각 레슨은 "사전"처럼 같은 틀을 따릅니다. 필요한 도구만 골라 읽어도 됩니다.

1. **이게 뭔가** — 한 문장 정의와 비유
2. **왜 필요한가** — 이 도구가 없으면 무엇이 불편한가
3. **설치** — 실제로 설치·확인하는 명령
4. **핵심 사용법** — 가장 많이 쓰는 기능 위주, 실제 실행한 예제와 출력
5. **ts-wiki에서는** — ts-wiki의 어느 파일 어느 줄에 어떻게 쓰였나
6. **더 알아볼 것** — 자주 하는 실수, 실습 과제, 퀴즈

## 학습 흐름

```text
[위키를 "만드는" 도구]                     [위키를 "띄우는" 도구]

 3-1 VitePress ── 전체를 묶는 틀            3-5 nginx ─── HTML 파일을 내려 주는 서버
   │                                          │
   ├ 3-2 Vite · Vue ── 개발 서버·화면        3-6 Docker ── nginx + 파일을 한 상자에
   ├ 3-3 markdown-it · Shiki ── 본문·코드     │
   └ 3-4 MiniSearch ── 검색                 3-7 GitHub Actions ── push하면 자동 배포
```

- **3-1 ~ 3-4**는 `npm run dev`, `npm run build`를 할 때 내 PC 안에서 일어나는 일입니다.
- **3-5 ~ 3-7**은 빌드 결과물(`docs/.vitepress/dist`)을 다른 사람이 볼 수 있게 만드는 일입니다.

순서대로 읽는 것을 권하지만, 3-5 nginx와 3-6 Docker는 서로 붙어 있으니 같이 읽는 것이 좋습니다.

## 이 파트를 마치면 할 수 있는 것

- ts-wiki의 `config.mts`에 나오는 옵션(`base`, `cleanUrls`, `markdown.lineNumbers`, `search` 등)이 각각 어떤 도구에 전달되는지 말할 수 있습니다.
- 마크다운에서 이중 중괄호가 왜 빌드를 깨뜨리는지, 코드 블록 안에서는 왜 괜찮은지 설명할 수 있습니다.
- nginx 설정 파일의 `server`, `location`, `try_files`를 읽고 고칠 수 있습니다.
- `docker build`, `docker run`, `docker compose up -d`로 위키를 컨테이너로 띄우고 끌 수 있습니다.
- GitHub Actions 워크플로 파일(`deploy.yml`)을 한 줄씩 읽고 무엇을 하는지 설명할 수 있습니다.

## 막힐 때 팁

::: tip 버전부터 확인합니다
이 파트의 출력은 모두 작성 시점(2026-10) 기준 VitePress 1.6.3, Vite 5.4.21, Vue 3.5.13, nginx 1.27.5, Docker 25.0.3에서 실제로 실행한 결과입니다. 내 화면과 다르면 먼저 `npm ls vitepress`, `docker --version`으로 버전을 비교합니다.
:::

- **오류 메시지 첫 줄을 그대로 검색합니다.** 도구 이름을 함께 넣으면(예: `vitepress Cannot read properties of undefined`) 훨씬 잘 찾아집니다.
- **어느 도구의 오류인지 먼저 가립니다.** 메시지에 `vite`, `rollup`이 보이면 번들 단계, `[emerg]`가 보이면 nginx 설정, `#12 [build 6/6]` 같은 줄이 보이면 Docker 빌드 단계입니다.
- **작게 다시 만들어 봅니다.** 각 레슨은 연습용 빈 폴더에서 작은 프로젝트를 새로 만들어 확인하는 방법을 보여 줍니다. ts-wiki를 직접 고치기 전에 작은 프로젝트에서 먼저 실험하면 원본을 망가뜨릴 걱정이 없습니다.
- 그래도 안 되면 [문제 해결: 서버가 안 뜰 때](../part6-serve/06-troubleshooting)를 봅니다.

## 다음 단계

[3-1. VitePress: 설정 · 라우팅 · 테마](./01-vitepress)에서 모든 것을 묶는 틀인 VitePress부터 시작합니다.
