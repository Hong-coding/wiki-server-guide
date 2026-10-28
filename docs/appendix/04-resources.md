---
title: 참고 자료
---

# 참고 자료

이 가이드에서 언급한 도구의 **공식 문서**만 모았습니다. 블로그·강의처럼 출처가 제각각인 자료는 넣지 않았습니다. 모든 주소는 작성 시점(2026-10)에 접속해 열리는 것을 확인했습니다.

::: tip 공식 문서를 읽는 순서
1. **Getting Started(시작하기)** 를 먼저 끝까지 따라 합니다.
2. 막히는 설정이 생기면 **Reference(레퍼런스, 설정 항목 사전)** 에서 그 항목만 찾습니다.
3. 버전·요금·정책은 블로그나 이 가이드보다 **공식 페이지가 항상 우선**입니다.
:::

## VitePress와 그 아래 도구

| 자료 | 주소 | 언제 보나 |
|---|---|---|
| VitePress 공식 사이트 | https://vitepress.dev/ | 전체 문서 시작점 |
| VitePress 시작하기 | https://vitepress.dev/guide/getting-started | 빈 폴더에서 시작할 때([Part 5](../part5-build-along/)) |
| VitePress 사이트 설정 레퍼런스 | https://vitepress.dev/reference/site-config | `base`, `cleanUrls`, `lastUpdated` 등 |
| VitePress 기본 테마 설정 레퍼런스 | https://vitepress.dev/reference/default-theme-config | `nav`, `sidebar`, `outline` 등 |
| VitePress 검색 | https://vitepress.dev/reference/default-theme-search | 로컬 검색(MiniSearch) 설정 |
| VitePress 마크다운 확장 | https://vitepress.dev/guide/markdown | `::: tip` 컨테이너, 코드 블록 기능 |
| VitePress에서 Vue 쓰기 | https://vitepress.dev/guide/using-vue | Vue 템플릿 해석, `v-pre`, 컴포넌트 사용 |
| VitePress 기본 테마 확장 | https://vitepress.dev/guide/extending-default-theme | `theme/index.ts`, 전역 컴포넌트 등록 |
| VitePress 배포 | https://vitepress.dev/guide/deploy | GitHub Pages·nginx 등 배포 방법 |
| Vite | https://vite.dev/ | 개발 서버·빌드 도구 |
| Vue (영문) | https://vuejs.org/ | 컴포넌트·SFC·`script setup` |
| Vue (한국어) | https://ko.vuejs.org/ | 같은 내용의 한국어판 |
| markdown-it | https://github.com/markdown-it/markdown-it | 마크다운 → HTML 변환 라이브러리 |
| Shiki | https://shiki.style/ | 코드 하이라이트 |
| MiniSearch | https://lucaong.github.io/minisearch/ | 로컬 검색 라이브러리 |

## 언어와 실행 환경

| 자료 | 주소 | 언제 보나 |
|---|---|---|
| TypeScript 문서 | https://www.typescriptlang.org/docs/ | 문법·타입 개념 |
| TypeScript tsconfig 레퍼런스 | https://www.typescriptlang.org/tsconfig/ | `strict`, `noEmit`, `allowImportingTsExtensions` 등 |
| Node.js | https://nodejs.org/ | 설치·버전 확인 |
| npm 문서 | https://docs.npmjs.com/ | `npm install`, 스크립트, `package.json` |
| npm ci 명령 | https://docs.npmjs.com/cli/v11/commands/npm-ci | `npm ci`와 `npm install`의 차이 |

## Markdown 규격

| 자료 | 주소 | 언제 보나 |
|---|---|---|
| CommonMark | https://commonmark.org/ | Markdown 기본 규격, 연습 튜토리얼 |
| GitHub Flavored Markdown 규격 | https://github.github.com/gfm/ | 표·체크박스 같은 GitHub 확장 문법 |

## Git과 GitHub

| 자료 | 주소 | 언제 보나 |
|---|---|---|
| Git 공식 문서 | https://git-scm.com/doc | 명령 레퍼런스 |
| Pro Git (한국어판) | https://git-scm.com/book/ko/v2 | git을 처음부터 체계적으로 |
| GitHub Pages 문서 | https://docs.github.com/en/pages | Pages 설정·사용 조건 |
| GitHub Pages 한도 | https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits | 크기·대역폭·빌드 한도, 용도 제한 |
| GitHub Actions 문서 | https://docs.github.com/en/actions | 워크플로 문법 |
| actions/upload-pages-artifact | https://github.com/actions/upload-pages-artifact | ts-wiki `deploy.yml`의 결과물 업로드 단계 |
| actions/deploy-pages | https://github.com/actions/deploy-pages | ts-wiki `deploy.yml`의 배포 단계 |

## Docker와 nginx

| 자료 | 주소 | 언제 보나 |
|---|---|---|
| Docker 문서 | https://docs.docker.com/ | 설치, 이미지·컨테이너 개념 |
| Docker Compose 문서 | https://docs.docker.com/compose/ | `docker-compose.yml` 문법 |
| nginx 공식 이미지(Docker Hub) | https://hub.docker.com/_/nginx | 태그 목록(`1.27-alpine` 등), 사용법 |
| Node.js 공식 이미지(Docker Hub) | https://hub.docker.com/_/node | 태그 목록(`22-alpine` 등) |
| nginx 문서 | https://nginx.org/en/docs/ | `server`, `location`, `try_files` 등 지시어 |

## 웹 기초

| 자료 | 주소 | 언제 보나 |
|---|---|---|
| MDN HTTP (한국어) | https://developer.mozilla.org/ko/docs/Web/HTTP | HTTP·상태 코드·캐시 |
| PowerShell 문서 (한국어) | https://learn.microsoft.com/ko-kr/powershell/ | Windows 터미널 명령 |
| VS Code 문서 | https://code.visualstudio.com/docs | 에디터 사용법, 확장 기능 |

## 비교한 다른 도구 (Part 2)

[위키 도구 비교](../part2-choices/01-wiki-tools-compare)에서 다룬 도구의 공식 사이트입니다. 요금·기능·유지보수 상황은 바뀌기 쉬우니 고르기 전에 꼭 확인하세요.

| 도구 | 주소 | 메모 |
|---|---|---|
| Docusaurus | https://docusaurus.io/ | React 기반 SSG |
| MkDocs | https://www.mkdocs.org/ | Python 기반 SSG |
| Material for MkDocs | https://squidfunk.github.io/mkdocs-material/ | 작성 시점 유지보수 일정·후속 도구 공지 확인 |
| Wiki.js | https://js.wiki/ | 동적 위키 |
| Wiki.js 문서 | https://docs.requarks.io/ | 설치 요구사항(데이터베이스 등) |
| Hugo | https://gohugo.io/ | Go 기반 SSG |
| Jekyll | https://jekyllrb.com/ | Ruby 기반 SSG |
| GitBook 문서 | https://docs.gitbook.com/ | SaaS 문서 도구 |
| Notion 도움말 | https://www.notion.com/help | SaaS 문서·협업 도구 |
| Netlify 문서 | https://docs.netlify.com/ | 정적 사이트 호스팅 서비스 |
| Vercel 문서 | https://vercel.com/docs | 정적 사이트·웹 앱 호스팅 서비스 |

## 이 가이드의 교재

| 자료 | 위치 |
|---|---|
| ts-wiki 저장소 | https://github.com/Hong-coding/ts-wiki |
| ts-wiki 사이트(GitHub Pages) | https://hong-coding.github.io/ts-wiki/ |
| 이 가이드의 작성 규칙 | [문서 작성 규칙](../guide/writing-guide) |

## 다음 단계

공부 순서가 고민이라면 [서버 학습 로드맵](../part7-server-learning/01-roadmap)에서 이 자료들을 어떤 순서로 읽으면 좋은지 확인하세요.
