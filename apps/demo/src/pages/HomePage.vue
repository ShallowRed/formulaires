<script lang="ts" setup>
import PageHeader from '../components/PageHeader.vue'
import { sections } from '../sections'
</script>

<template>
  <PageHeader
    title="Formulaires de démarches décrits en JSON, affichés avec le DSFR"
    lead="Un format de formulaire, des composants DSFR pour JSON Forms et un adaptateur pour le moteur de calcul publicodes."
  />
  <div class="fr-container demo-container fr-py-6w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="section in sections"
        :key="section.to"
        class="fr-col-12 fr-col-md-4"
      >
        <div class="fr-tile fr-enlarge-link">
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <h2 class="fr-tile__title">
                <RouterLink :to="section.to">
                  {{ section.title }}
                </RouterLink>
              </h2>
              <p class="fr-tile__desc">
                {{ section.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
