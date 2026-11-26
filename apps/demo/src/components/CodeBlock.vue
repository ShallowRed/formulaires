<script lang="ts" setup>
import type { CodeLanguage } from '../highlighter'
import { computed } from 'vue'
import { highlight } from '../highlighter'

const props = defineProps<{
  code: string
  language: CodeLanguage
}>()

const html = computed(() => highlight(props.code, props.language))
</script>

<template>
  <pre class="demo-code"><code v-html="html" /></pre>
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
