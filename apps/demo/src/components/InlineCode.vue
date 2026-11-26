<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  text: string
}>()

// Text between backticks is code, as in Markdown
const parts = computed(() => props.text.split('`').map((value, index) => ({ value, code: index % 2 === 1 })))
</script>

<template>
  <template
    v-for="(part, index) in parts"
    :key="index"
  >
    <code v-if="part.code">{{ part.value }}</code>
    <template v-else>
      {{ part.value }}
    </template>
  </template>
</template>
