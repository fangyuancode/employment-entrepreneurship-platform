<template>
  <div class="home-section-title" :class="{ light }">
    <div>
      <p class="section-kicker">{{ kicker }}</p>
      <h2>{{ title }}</h2>
    </div>
    <p v-if="desc" class="section-desc">{{ desc }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
  desc?: string
  light?: boolean
}>()
</script>

<style scoped lang="scss">
.home-section-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 26px;
}

.section-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #4f7ee8;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  color: #111827;
  letter-spacing: -0.02em;
}

.section-desc {
  max-width: 520px;
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: #64748b;
}

.light {
  .section-kicker,
  h2,
  .section-desc {
    color: #fff;
  }

  .section-desc {
    color: rgba(226, 232, 240, 0.78);
  }
}

@media screen and (max-width: 900px) {
  .home-section-title {
    align-items: flex-start;
    flex-direction: column;
  }

  h2 {
    font-size: 28px;
  }

  .section-desc {
    max-width: none;
  }
}
</style>
