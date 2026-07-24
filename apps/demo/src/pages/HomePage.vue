<script lang="ts" setup>
</script>

<template>
  <div class="fr-grid-row fr-grid-row--center">
    <div class="fr-col-12 fr-col-lg-10">
      <h1 class="fr-h2">
        Le simulateur d'aides à l'innovation, reconstruit à partir de ses briques ouvertes
      </h1>
      <p class="fr-text--lg">
        Le simulateur exposé sur entreprise.service-public.fr repose sur trois briques
        indépendantes et open source. Ce site les réassemble hors de l'application
        aides-simplifiées, pour montrer que le simulateur peut être repris, hébergé et
        maintenu de façon autonome.
      </p>

      <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
        <div class="fr-col-12 fr-col-md-4">
          <div class="fr-card fr-p-3w">
            <h2 class="fr-h6">
              1. Le modèle de calcul
            </h2>
            <p class="fr-text--sm">
              Les règles des 6 dispositifs (CIR, CII, CICo, JEI, JEU, JEC), écrites en
              <a
                href="https://publi.codes"
                target="_blank"
                rel="noopener"
              >publicodes</a>, lisibles et auditables. Maintenues par les experts métier,
              exécutées dans le navigateur.
            </p>
            <p class="fr-text--xs">
              <a
                href="https://github.com/betagouv/publicodes-entreprise-innovation"
                target="_blank"
                rel="noopener"
              >betagouv/publicodes-entreprise-innovation</a>
            </p>
          </div>
        </div>
        <div class="fr-col-12 fr-col-md-4">
          <div class="fr-card fr-p-3w">
            <h2 class="fr-h6">
              2. Le formulaire déclaratif
            </h2>
            <p class="fr-text--sm">
              78 questions, 65 conditions de visibilité, 4 étapes : un fichier JSON,
              modifiable sans toucher au code. Le même fichier que celui servi en
              production.
            </p>
            <p class="fr-text--xs">
              <a
                href="https://github.com/ShallowRed/survey-kit/tree/main/packages/form-entreprise-innovation"
                target="_blank"
                rel="noopener"
              >@shallowred/form-entreprise-innovation</a>
            </p>
          </div>
        </div>
        <div class="fr-col-12 fr-col-md-4">
          <div class="fr-card fr-p-3w">
            <h2 class="fr-h6">
              3. Le moteur de rendu
            </h2>
            <p class="fr-text--sm">
              Le runtime extrait d'aides-simplifiées : navigation, visibilité
              conditionnelle, validation, rendu DSFR accessibles, projection des réponses
              vers le moteur de calcul.
            </p>
            <p class="fr-text--xs">
              <a
                href="https://github.com/ShallowRed/survey-kit"
                target="_blank"
                rel="noopener"
              >@shallowred/survey-schema + survey-vue-dsfr + survey-publicodes</a>
            </p>
          </div>
        </div>
      </div>

      <h2 class="fr-h4 fr-mt-4w">
        Essayer
      </h2>
      <ul class="fr-btns-group fr-btns-group--inline-md">
        <li>
          <RouterLink
            to="/simulateur"
            class="fr-btn"
          >
            Lancer le simulateur complet
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/exemple-minimal"
            class="fr-btn fr-btn--secondary"
          >
            Voir l'exemple minimal
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/assemblage"
            class="fr-btn fr-btn--secondary"
          >
            Comprendre l'assemblage
          </RouterLink>
        </li>
      </ul>

      <div class="fr-callout fr-mt-4w">
        <h2 class="fr-callout__title fr-h6">
          Reprendre ce site en local
        </h2>
        <pre class="demo-code">git clone https://github.com/ShallowRed/survey-kit
cd survey-kit
pnpm install
pnpm --filter demo dev</pre>
        <p class="fr-text--sm fr-mb-0">
          Tout est statique : le site se déploie sur n'importe quel hébergement de
          fichiers. Aucun serveur de calcul, aucune base de données.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-code {
  background-color: var(--background-alt-grey);
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.85rem;
  line-height: 1.6;
  overflow-x: auto;
}
</style>
