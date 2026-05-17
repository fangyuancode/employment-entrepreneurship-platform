<template>
  <div class="demo-guide" :class="{ 'is-playing': demoMode }">
    <div class="demo-guide__content">
      <strong>{{ title }}</strong>
      <span>{{ description }}</span>
    </div>
    <em>{{ stepText }}</em>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  demoMode: boolean
  title: string
  description: string
  stepText: string
}>()
</script>

<style scoped lang="scss">
.demo-guide {
  position: absolute;
  top: 58px;
  right: 24px;
  left: 24px;
  z-index: 7;
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  pointer-events: none;
  border: 1px solid rgba(95, 231, 255, 0.22);
  border-radius: 14px;
  background: rgba(5, 19, 43, 0.62);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(10px);
  transition: opacity 0.24s ease, transform 0.24s ease, border-color 0.24s ease;
}

.demo-guide__content {
  min-width: 0;
}

.demo-guide strong {
  display: block;
  font-size: 14px;
  color: #edf9ff;
  letter-spacing: 0.02em;
}

.demo-guide span {
  display: block;
  max-width: 780px;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: rgba(220, 241, 255, 0.74);
}

.demo-guide em {
  flex: 0 0 auto;
  min-width: 64px;
  padding: 5px 8px;
  font-size: 12px;
  font-style: normal;
  color: #7ee8ff;
  text-align: center;
  border: 1px solid rgba(95, 231, 255, 0.2);
  border-radius: 999px;
  background: rgba(95, 231, 255, 0.1);
}

.demo-guide.is-playing {
  border-color: rgba(130, 242, 186, 0.42);
  background: rgba(6, 28, 50, 0.76);
}

.demo-guide.is-playing em {
  color: #82f2ba;
  border-color: rgba(130, 242, 186, 0.3);
  background: rgba(130, 242, 186, 0.1);
}

@media (max-width: 1280px) {
  .demo-guide {
    right: 16px;
    left: 16px;
  }

  .demo-guide span {
    max-width: 560px;
  }
}
</style>
