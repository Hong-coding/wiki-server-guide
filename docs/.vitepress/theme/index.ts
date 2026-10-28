import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import LessonMeta from './components/LessonMeta.vue'
import CurriculumToc from './components/CurriculumToc.vue'
import PartLessons from './components/PartLessons.vue'
import ProgressChecklist from './components/ProgressChecklist.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 모든 마크다운에서 import 없이 쓸 수 있도록 전역 등록합니다.
    app.component('LessonMeta', LessonMeta)
    app.component('CurriculumToc', CurriculumToc)
    app.component('PartLessons', PartLessons)
    app.component('ProgressChecklist', ProgressChecklist)
  },
} satisfies Theme
