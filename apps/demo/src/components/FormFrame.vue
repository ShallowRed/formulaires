<!-- Frame of a form as aides-simplifiées shows it: a card on the light blue background of the simulator -->
<script lang="ts" setup>
defineProps<{
  /** Caps the frame at the height of a code block, and the card scrolls inside it */
  scrollable?: boolean
}>()
</script>

<template>
  <div
    class="form-frame fr-background-alt--blue-france fr-p-3v fr-p-md-3w"
    :class="{ 'form-frame--scrollable': scrollable }"
  >
    <div class="form-frame__content fr-card fr-p-2w fr-p-md-4w">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.form-frame--scrollable {
  display: flex;
  flex-direction: column;
  max-height: var(--demo-panel-max-height);
}

.form-frame--scrollable .form-frame__content {
  width: 100%;
  min-height: 0;
  overflow-y: auto;
}

/* aides-simplifiées centres the form on eight columns of its container */
.form-frame__content {
  max-width: var(--demo-form-max-width);
  margin-inline: auto;
}
</style>
