<template>
  <div class="rp-pos-icon-row row q-gutter-md" role="toolbar">
    <q-btn
      v-for="icon in icons"
      :key="icon"
      outline
      no-caps
      class="col rp-pos-icon-row__btn"
      :aria-label="icon"
    >
      <q-icon :name="icon" size="22px" class="rp-icon-fg" />
    </q-btn>
  </div>
</template>

<script setup lang="ts">
const icons = ['remove', 'language', 'mail', 'favorite'] as const;
</script>

<style scoped lang="scss">
.rp-pos-icon-row {
  padding: 0 16px 16px;
}

.rp-pos-icon-row__btn {
  min-height: 48px;
  border-radius: var(--rp-radius-md);
  border-color: color-mix(in srgb, var(--rp-foreground) 18%, transparent) !important;
  background: var(--rp-background) !important;
}

.rp-icon-fg {
  color: var(--rp-foreground);
}
</style>
