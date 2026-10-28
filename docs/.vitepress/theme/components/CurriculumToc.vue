<script setup lang="ts">
// 전체 목차: curriculum.mts 한 곳의 정의로 렌더링합니다.
import { withBase } from 'vitepress'
import { curriculum } from '../../curriculum.mts'

// 부록은 참고 문서라 파트·레슨 수에서 뺍니다.
const lessonParts = curriculum.filter((p) => p.dir !== 'appendix')
const appendixCount = curriculum.find((p) => p.dir === 'appendix')?.lessons.length ?? 0
const totalLessons = lessonParts.reduce((sum, p) => sum + p.lessons.length, 0)
const totalHours = Math.round(
  curriculum.reduce((sum, p) => sum + p.lessons.reduce((s, l) => s + l.minutes, 0), 0) / 60,
)
const partHours = (minutes: number[]) => Math.round(minutes.reduce((a, b) => a + b, 0) / 6) / 10
</script>

<template>
  <p class="summary">
    총 <strong>{{ lessonParts.length }}개 파트</strong> · <strong>{{ totalLessons }}개 레슨</strong> · 부록 {{ appendixCount }}개 ·
    예상 학습 시간 약 <strong>{{ totalHours }}시간</strong> (연습 문제 포함)
  </p>
  <section v-for="part in curriculum" :key="part.dir" class="part">
    <h3>
      <a :href="withBase(`/${part.dir}/`)">
        {{ part.dir === 'appendix' ? part.title : `Part ${part.no}. ${part.title}` }}
      </a>
      <span class="level">{{ part.level }}</span>
      <span v-if="part.dir !== 'appendix'" class="hours">
        약 {{ partHours(part.lessons.map((l) => l.minutes)) }}시간
      </span>
    </h3>
    <p class="goal">🎯 {{ part.goal }}</p>
    <ol>
      <li v-for="lesson in part.lessons" :key="lesson.slug">
        <a :href="withBase(`/${part.dir}/${lesson.slug}`)">{{ lesson.title }}</a>
        <span v-if="lesson.minutes" class="min">{{ lesson.minutes }}분</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.summary {
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.part h3 {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.level,
.hours {
  font-size: 12px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.hours {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}
.goal {
  color: var(--vp-c-text-2);
  margin: 4px 0;
}
.min {
  margin-left: 8px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
