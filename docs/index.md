---
layout: home

hero:
  name: 위키 서버 구축 가이드
  text: 내 손으로 설계하고, 띄우고, 배포하기
  tagline: ts-wiki(TypeScript 마스터 위키)가 어떻게 설계됐고 어떻게 서버로 떠 있는지 한 줄씩 뜯어봅니다. 서버를 한 번도 띄워 본 적 없어도 괜찮습니다. 마지막에는 같은 위키를 직접 만들어 세 가지 방법으로 띄우게 됩니다.
  image:
    src: /favicon.svg
    alt: 서버
  actions:
    - theme: brand
      text: 처음이라면 여기서 시작
      link: /guide/roadmap
    - theme: alt
      text: 5분 만에 바로 띄우기
      link: /guide/quickstart
    - theme: alt
      text: 전체 목차
      link: /guide/toc

features:
  - icon: 🧭
    title: 개념부터
    details: 브라우저·서버·HTTP·포트·빌드가 무엇인지부터 시작합니다. 처음 나오는 용어는 그 자리에서 풀어 설명합니다.
  - icon: ⚖️
    title: 왜 이 기술인가
    details: VitePress·Markdown·TypeScript·GitHub Pages·Docker를 고른 이유를 대안과 비교해 장단점으로 설명합니다.
  - icon: 🔍
    title: 실제 코드 해부
    details: ts-wiki의 package.json, config.mts, curriculum.mts, Dockerfile, nginx.conf, 배포 워크플로를 한 줄씩 읽습니다.
  - icon: 🚀
    title: 서버 띄우기 학습
    details: 개발 서버 → Docker(nginx) → GitHub Pages, 그리고 Node.js·Express로 서버를 직접 만들며 서버 운영의 기본기를 익힙니다.
---
