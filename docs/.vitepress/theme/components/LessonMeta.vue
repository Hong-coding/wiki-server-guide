<script setup lang="ts">
// 레슨 상단의 난이도·예상 시간·선수 지식 배지
defineProps<{
  level: string
  minutes: number
  prev?: string
}>()
</script>

<template>
  <div class="lesson-meta">
    <span class="badge level">난이도 · {{ level }}</span>
    <span class="badge time">⏱ 약 {{ minutes }}분</span>
    <span v-if="prev" class="prev">이전 내용: {{ prev }}</span>
  </div>
</template>

<style scoped>
.lesson-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 12px 0 24px;
  font-size: 14px;
}
.badge {
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 600;
}
.level {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.time {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}
.prev {
  color: var(--vp-c-text-2);
}
</style>
