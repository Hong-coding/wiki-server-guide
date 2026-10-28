<script setup lang="ts">
// 레슨별 완료 체크. 진도는 이 브라우저의 localStorage에만 저장됩니다(서버 저장 없음).
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { curriculum } from '../../curriculum.mts'

const STORAGE_KEY = 'wiki-server-guide-progress-v1'
const done = ref<Record<string, boolean>>({})
const parts = curriculum.filter((p) => p.dir !== 'appendix')
const total = parts.reduce((sum, p) => sum + p.lessons.length, 0)

const keyOf = (dir: string, slug: string) => `${dir}/${slug}`
const doneCount = computed(() => Object.values(done.value).filter(Boolean).length)
const percent = computed(() => Math.round((doneCount.value / total) * 100))
const partDone = (dir: string) =>
  parts.find((p) => p.dir === dir)!.lessons.filter((l) => done.value[keyOf(dir, l.slug)]).length

// SSR 빌드 중에는 localStorage가 없으므로 마운트 후에만 읽습니다.
onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) done.value = JSON.parse(saved) as Record<string, boolean>
  } catch {
    // 사생활 보호 모드 등에서 저장소 접근이 막히면 저장 없이 동작합니다.
  }
})

watch(
  done,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // 저장 실패는 무시합니다.
    }
  },
  { deep: true },
)

function reset() {
  if (confirm('진도 기록을 모두 지울까요?')) done.value = {}
}
</script>

<template>
  <div class="progress">
    <div class="bar"><div class="fill" :style="{ width: `${percent}%` }" /></div>
    <p>
      <strong>{{ doneCount }} / {{ total }}</strong> 레슨 완료 ({{ percent }}%)
      <button class="reset" type="button" @click="reset">초기화</button>
    </p>
  </div>
  <section v-for="part in parts" :key="part.dir">
    <h3>
      Part {{ part.no }}. {{ part.title }}
      <small>{{ partDone(part.dir) }} / {{ part.lessons.length }}</small>
    </h3>
    <ul class="list">
      <li v-for="lesson in part.lessons" :key="lesson.slug">
        <label>
          <input v-model="done[keyOf(part.dir, lesson.slug)]" type="checkbox" />
          <a :href="withBase(`/${part.dir}/${lesson.slug}`)">{{ lesson.title }}</a>
        </label>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.progress {
  position: sticky;
  top: calc(var(--vp-nav-height) + 8px);
  z-index: 1;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.bar {
  height: 10px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  overflow: hidden;
}
.fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.3s;
}
.reset {
  margin-left: 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-decoration: underline;
}
.list {
  list-style: none;
  padding-left: 0;
}
.list label {
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
}
h3 small {
  margin-left: 8px;
  color: var(--vp-c-text-3);
  font-weight: 500;
}
</style>
