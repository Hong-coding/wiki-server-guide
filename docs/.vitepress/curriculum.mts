// 학습 커리큘럼 단일 정의 파일
// 사이드바·목차·진도 체크리스트가 모두 이 파일을 기준으로 만들어지므로, 문서를 추가·이동할 때는 여기만 고칩니다.

export interface Lesson {
  /** 파일 이름(확장자 제외). 예: '01-what-we-build' */
  slug: string
  title: string
  /** 예상 학습 시간(분) */
  minutes: number
}

export interface Part {
  /** 폴더 이름. 예: 'part0-start' */
  dir: string
  no: number
  title: string
  /** 이 파트를 마치면 할 수 있게 되는 것 */
  goal: string
  level: '입문' | '초급' | '중급' | '실전'
  lessons: Lesson[]
}

export const curriculum: Part[] = [
  {
    dir: 'part0-start',
    no: 0,
    title: '시작하기',
    goal: '이 가이드에서 무엇을 만드는지 알고, 실습에 필요한 도구를 내 PC에 설치한다.',
    level: '입문',
    lessons: [
      { slug: '01-what-we-build', title: '이 가이드에서 만들 것: ts-wiki 한눈에 보기', minutes: 20 },
      { slug: '02-how-to-study', title: '서버 구축을 공부하는 법', minutes: 20 },
      { slug: '03-setup', title: '준비물 설치: Node.js · Git · VS Code · Docker', minutes: 50 },
    ],
  },
  {
    dir: 'part1-concepts',
    no: 1,
    title: '웹 서버 기초 개념',
    goal: '브라우저에 페이지가 뜨기까지의 과정을 설명하고, 서버·포트·빌드 같은 용어를 정확히 쓴다.',
    level: '입문',
    lessons: [
      { slug: '01-web-and-server', title: '웹은 어떻게 동작하나: 브라우저 · 서버 · HTTP', minutes: 45 },
      { slug: '02-static-vs-dynamic', title: '정적 사이트와 동적 서버', minutes: 30 },
      { slug: '03-localhost-port-host', title: 'localhost · 포트 · 호스트 · IP', minutes: 45 },
      { slug: '04-node-npm', title: 'Node.js와 npm: 패키지와 스크립트', minutes: 45 },
      { slug: '05-ssg', title: '정적 사이트 생성기(SSG)와 빌드', minutes: 30 },
    ],
  },
  {
    dir: 'part2-choices',
    no: 2,
    title: '기술 선택의 이유',
    goal: 'ts-wiki가 고른 도구·언어·배포 방식을 대안과 비교해 장단점으로 설명한다.',
    level: '초급',
    lessons: [
      { slug: '01-wiki-tools-compare', title: '위키 도구 비교: VitePress · Docusaurus · MkDocs · Wiki.js · Notion', minutes: 40 },
      { slug: '02-why-vitepress', title: '왜 VitePress인가', minutes: 30 },
      { slug: '03-why-markdown', title: '왜 Markdown으로 쓰나', minutes: 20 },
      { slug: '04-why-typescript', title: '설정과 컴포넌트를 왜 TypeScript로 쓰나', minutes: 30 },
      { slug: '05-why-hosting', title: '왜 GitHub Pages와 Docker(nginx)인가', minutes: 35 },
    ],
  },
  {
    dir: 'part3-libraries',
    no: 3,
    title: '라이브러리 사전',
    goal: 'ts-wiki를 이루는 라이브러리·도구가 각각 무슨 일을 하는지 알고 기본 사용법을 익힌다.',
    level: '초급',
    lessons: [
      { slug: '01-vitepress', title: 'VitePress: 설정 · 라우팅 · 테마', minutes: 60 },
      { slug: '02-vite-vue', title: 'Vite와 Vue: VitePress 밑에서 일하는 것들', minutes: 45 },
      { slug: '03-markdown-it-shiki', title: '마크다운 확장과 코드 하이라이트 (markdown-it · Shiki)', minutes: 30 },
      { slug: '04-local-search', title: '로컬 검색 (MiniSearch)', minutes: 20 },
      { slug: '05-nginx', title: 'nginx: 정적 파일 웹 서버', minutes: 50 },
      { slug: '06-docker', title: 'Docker와 Docker Compose', minutes: 60 },
      { slug: '07-github-actions', title: 'GitHub Actions와 Pages 배포 액션', minutes: 45 },
    ],
  },
  {
    dir: 'part4-anatomy',
    no: 4,
    title: 'ts-wiki 해부하기',
    goal: 'ts-wiki의 모든 파일이 왜 거기 있고 무슨 일을 하는지 한 줄씩 읽고 설명한다.',
    level: '중급',
    lessons: [
      { slug: '01-folder-structure', title: '폴더 구조와 파일의 역할', minutes: 30 },
      { slug: '02-package-json', title: 'package.json과 npm 스크립트', minutes: 30 },
      { slug: '03-config', title: 'config.mts 한 줄씩 읽기', minutes: 60 },
      { slug: '04-curriculum', title: '단일 출처 설계: curriculum.mts', minutes: 45 },
      { slug: '05-theme-components', title: '테마 확장과 커스텀 컴포넌트', minutes: 60 },
      { slug: '06-scripts-and-rules', title: '보조 스크립트와 문서 작성 규칙', minutes: 30 },
    ],
  },
  {
    dir: 'part5-build-along',
    no: 5,
    title: '처음부터 따라 만들기',
    goal: '빈 폴더에서 시작해 사이드바 자동 생성·검색·진도 체크리스트를 갖춘 나만의 위키를 완성한다.',
    level: '중급',
    lessons: [
      { slug: '01-init', title: '빈 폴더에서 VitePress 시작하기', minutes: 40 },
      { slug: '02-first-pages', title: '첫 페이지와 홈 화면', minutes: 40 },
      { slug: '03-nav-sidebar-search', title: '내비게이션 · 사이드바 · 검색', minutes: 45 },
      { slug: '04-curriculum-sidebar', title: '커리큘럼 파일로 사이드바 자동 생성', minutes: 50 },
      { slug: '05-components', title: '진도 체크리스트 컴포넌트 만들기', minutes: 60 },
      { slug: '06-build-preview', title: '빌드와 미리보기', minutes: 30 },
    ],
  },
  {
    dir: 'part6-serve',
    no: 6,
    title: '서버 띄우기와 배포',
    goal: '같은 위키를 개발 서버 · Docker(nginx) · GitHub Pages 세 가지 방법으로 띄우고, 안 뜰 때 원인을 찾는다.',
    level: '실전',
    lessons: [
      { slug: '01-dev-server', title: '개발 서버: npm run dev와 포트', minutes: 40 },
      { slug: '02-static-serve', title: '빌드 결과물을 서버로 서비스하기', minutes: 40 },
      { slug: '03-docker-nginx', title: 'Docker 이미지로 묶기: Dockerfile · nginx.conf', minutes: 60 },
      { slug: '04-compose', title: '서버에 상시 띄우기: Docker Compose', minutes: 45 },
      { slug: '05-github-pages', title: 'GitHub Pages 자동 배포', minutes: 60 },
      { slug: '06-troubleshooting', title: '문제 해결: 서버가 안 뜰 때', minutes: 45 },
    ],
  },
  {
    dir: 'part7-server-learning',
    no: 7,
    title: '서버 띄우기 학습 로드맵',
    goal: '위키를 넘어 일반 웹 서버를 직접 만들고 운영하는 데 필요한 공부 순서와 연습 과제를 소화한다.',
    level: '실전',
    lessons: [
      { slug: '01-roadmap', title: '서버 학습 로드맵', minutes: 30 },
      { slug: '02-node-http', title: 'Node.js로 정적 파일 서버 직접 만들기', minutes: 60 },
      { slug: '03-express', title: 'Express로 웹 서버 만들기', minutes: 60 },
      { slug: '04-reverse-proxy', title: '리버스 프록시와 HTTPS 개념', minutes: 45 },
      { slug: '05-linux-basics', title: '서버 운영에 필요한 리눅스 기초', minutes: 60 },
      { slug: '06-ops', title: '운영 기본기: 로그 · 재시작 · 백업 · 보안', minutes: 45 },
      { slug: '07-projects', title: '연습 과제와 자가 진단', minutes: 60 },
    ],
  },
  {
    dir: 'appendix',
    no: 8,
    title: '부록',
    goal: '자주 쓰는 명령어와 용어를 빠르게 찾아본다.',
    level: '입문',
    lessons: [
      { slug: '01-commands', title: '명령어 모음', minutes: 0 },
      { slug: '02-glossary', title: '용어 사전', minutes: 0 },
      { slug: '03-faq', title: '자주 묻는 질문', minutes: 0 },
      { slug: '04-resources', title: '참고 자료', minutes: 0 },
    ],
  },
]
