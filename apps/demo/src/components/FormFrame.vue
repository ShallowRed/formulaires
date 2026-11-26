<!-- Frame of a form as aides-simplifiées shows it: a card on the light blue background of the simulator -->
<template>
  <div class="fr-background-alt--blue-france fr-p-3v fr-p-md-3w">
    <div class="form-frame__content fr-card fr-p-2w fr-p-md-4w">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* aides-simplifiées centres the form on eight columns of its container */
.form-frame__content {
  max-width: var(--demo-form-max-width);
  margin-inline: auto;
}
</style>
