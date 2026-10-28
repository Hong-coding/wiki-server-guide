import { defineConfig, type DefaultTheme } from 'vitepress'
import { curriculum } from './curriculum.mts'

// GitHub Pages(프로젝트 페이지)에 올릴 때는 /저장소이름/ 아래에서 서비스되므로 base를 환경 변수로 받습니다.
const base = process.env.WIKI_BASE ?? '/'

// 커리큘럼 정의에서 사이드바를 만들어, 문서 목록을 한 곳(curriculum.mts)에서만 관리합니다.
const curriculumSidebar: DefaultTheme.SidebarItem[] = curriculum.map((part) => ({
  text: part.dir === 'appendix' ? part.title : `Part ${part.no}. ${part.title}`,
  collapsed: part.no > 1,
  items: [
    { text: '📌 파트 소개', link: `/${part.dir}/` },
    ...part.lessons.map((lesson, i) => ({
      text: `${part.dir === 'appendix' ? '' : `${part.no}-${i + 1}. `}${lesson.title}`,
      link: `/${part.dir}/${lesson.slug}`,
    })),
  ],
}))

export default defineConfig({
  lang: 'ko-KR',
  title: '위키 서버 구축 가이드',
  description: 'ts-wiki를 예제로 위키 서버를 설계하고 띄우는 방법을 처음부터 배우는 가이드',
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: `${base}favicon.svg` }]],
  markdown: {
    lineNumbers: true,
  },
  // 로컬 검색 인덱스가 한 청크에 들어가 500kB를 넘을 수 있으므로 경고 기준만 올립니다.
  vite: {
    build: { chunkSizeWarningLimit: 4000 },
  },
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '학습 가이드', link: '/guide/roadmap' },
      { text: '전체 목차', link: '/guide/toc' },
      { text: '바로 띄우기', link: '/guide/quickstart' },
      { text: '명령어 모음', link: '/appendix/01-commands' },
    ],
    sidebar: [
      {
        text: '학습 가이드',
        items: [
          { text: '학습 로드맵', link: '/guide/roadmap' },
          { text: '전체 목차', link: '/guide/toc' },
          { text: '5분 만에 바로 띄우기', link: '/guide/quickstart' },
          { text: '진도 체크리스트', link: '/guide/checklist' },
          { text: '문서 작성 규칙', link: '/guide/writing-guide' },
        ],
      },
      ...curriculumSidebar,
    ],
    outline: { level: [2, 3], label: '이 페이지 목차' },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '검색', buttonAriaLabel: '검색' },
          modal: {
            noResultsText: '결과가 없습니다',
            resetButtonTitle: '지우기',
            footer: { selectText: '선택', navigateText: '이동', closeText: '닫기' },
          },
        },
      },
    },
    docFooter: { prev: '이전 레슨', next: '다음 레슨' },
    lastUpdated: { text: '마지막 수정' },
    darkModeSwitchLabel: '다크 모드',
    sidebarMenuLabel: '메뉴',
    returnToTopLabel: '맨 위로',
    editLink: {
      pattern: 'https://github.com/Hong-coding/wiki-server-guide/edit/main/docs/:path',
      text: 'GitHub에서 이 페이지 고치기',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Hong-coding/wiki-server-guide' }],
    footer: { message: 'VitePress 1.6 · Node.js 22 이상 기준', copyright: '위키 서버 구축 가이드' },
  },
})
