<script setup lang="ts">
// 파트 소개 페이지의 레슨 목록
import { withBase } from 'vitepress'
import { curriculum } from '../../curriculum.mts'

const props = defineProps<{ dir: string }>()
const part = curriculum.find((p) => p.dir === props.dir)
</script>

<template>
  <div v-if="part">
    <p class="goal">🎯 <strong>이 파트를 마치면:</strong> {{ part.goal }}</p>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>레슨</th>
          <th>예상 시간</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(lesson, i) in part.lessons" :key="lesson.slug">
          <td>{{ part.dir === 'appendix' ? i + 1 : `${part.no}-${i + 1}` }}</td>
          <td>
            <a :href="withBase(`/${part.dir}/${lesson.slug}`)">{{ lesson.title }}</a>
          </td>
          <td>{{ lesson.minutes ? `${lesson.minutes}분` : '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.goal {
  padding: 12px 16px;
  border-left: 4px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
}
</style>
