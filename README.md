# 위키 서버 구축 가이드

[ts-wiki(TypeScript 마스터 위키)](https://github.com/Hong-coding/ts-wiki)를 교재로, 위키 서버를 설계하고 띄우는 방법을 처음부터 배우는 가이드 위키입니다. 이 가이드 자체도 ts-wiki와 같은 구조(VitePress)로 만들었습니다.

- 8개 파트 · 레슨 45개 · 부록 4개
- 레슨 목록 단일 정의: [`docs/.vitepress/curriculum.mts`](docs/.vitepress/curriculum.mts)
- 문서 작성 규칙: [`docs/guide/writing-guide.md`](docs/guide/writing-guide.md)

## 로컬에서 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5181 을 엽니다. (ts-wiki는 5180이라 동시에 켜 둘 수 있습니다.)

## 정적 빌드

```bash
npm run build
npm run preview
```

## Docker로 상시 띄우기

```bash
docker compose up -d --build
```

http://localhost:8091 로 접속합니다. 끄려면 `docker compose down`.
