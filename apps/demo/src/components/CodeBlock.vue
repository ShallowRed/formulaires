<script lang="ts" setup>
defineProps<{
  code: string
}>()
</script>

<template>
  <pre class="demo-code"><code>{{ code }}</code></pre>
</template>

<style scoped>
.demo-code {
  margin: 0;
  background-color: var(--background-alt-grey);
  border-radius: 0.25rem;
  padding: 1rem;
  font-size: 0.75rem;
  line-height: 1.5;
  overflow: auto;
  max-height: 32rem;
}
</style>
