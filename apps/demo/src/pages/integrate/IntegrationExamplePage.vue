<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import InlineCode from '../../components/InlineCode.vue'
import SchemaPreview from '../../components/SchemaPreview.vue'
import { integrationExamples } from '../../examples/integration'

const route = useRoute()
const example = computed(() => integrationExamples.find(item => item.slug === route.params.slug))
</script>

<template>
  <template v-if="example">
    <h1 class="fr-h3">
      {{ example.title }}
    </h1>
    <p
      v-for="(paragraph, index) in example.description"
      :key="index"
    >
      <InlineCode :text="paragraph" />
    </p>
    <h2 class="fr-h6 fr-mb-1w">
      Ce que lisent les composants
    </h2>
    <ul class="fr-mb-4w">
      <li
        v-for="(item, index) in example.reads"
        :key="index"
      >
        <InlineCode :text="item" />
      </li>
    </ul>
    <SchemaPreview
      :key="example.slug"
      :schema="example.schema"
      :uischema="example.uischema"
      :data="example.data"
      :validation-mode="example.validationMode"
    />
  </template>
  <p v-else>
    Cet exemple n'existe pas.
  </p>
</template>
