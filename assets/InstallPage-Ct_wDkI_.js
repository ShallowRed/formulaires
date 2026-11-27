import{C as l}from"./CodeBlock-BsOm8zSR.js";import{d as n,c as u,a as e,b as r,e as o,F as d,o as m}from"./index-DvtFmx6i.js";const a="0.1.0",f=`<script setup lang="ts">
import { JsonForms } from '@jsonforms/vue'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/formulaires-vue-dsfr'
import '@shallowred/formulaires-vue-dsfr/styles'

const ajv = createAjv2020()
<\/script>

<template>
  <form novalidate>
    <JsonForms
      :schema="schema"
      :data="data"
      :renderers="dsfrRenderers"
      :ajv="ajv"
      :i18n="dsfrI18n"
      @change="onChange"
    />
  </form>
</template>`,g=n({__name:"InstallPage",setup(i){const t=`pnpm add https://github.com/ShallowRed/survey-kit/releases/download/formulaires-vue-dsfr-v${a}/shallowred-formulaires-vue-dsfr-${a}.tgz`;return(p,s)=>(m(),u(d,null,[s[0]||(s[0]=e("h2",{class:"fr-h3"}," Installation ",-1)),s[1]||(s[1]=e("p",null,[e("code",null,"@shallowred/formulaires-vue-dsfr"),r(" affiche avec le DSFR le formulaire que "),e("a",{href:"https://jsonforms.io/",target:"_blank",rel:"noopener"},"JSON Forms"),r(" tire d'un JSON Schema 2020-12. ")],-1)),s[2]||(s[2]=e("h3",{class:"fr-h5"}," Archive ",-1)),s[3]||(s[3]=e("p",null," Chaque version est publiée en archive dans une release de survey-kit : ",-1)),o(l,{code:t,language:"shellscript"}),s[4]||(s[4]=e("p",{class:"fr-mt-2w"},[r(" On installe aussi "),e("code",null,"vue"),r(", "),e("code",null,"@jsonforms/core"),r(" et "),e("code",null,"@jsonforms/vue"),r(" 3.8, "),e("code",null,"@gouvminint/vue-dsfr"),r(" 8.11 ou plus, et on charge les feuilles de style du DSFR. ")],-1)),s[5]||(s[5]=e("h3",{class:"fr-h5 fr-mt-4w"}," Utilisation ",-1)),o(l,{code:f,language:"vue"}),s[6]||(s[6]=e("p",{class:"fr-mt-2w"},[e("code",null,"createAjv2020"),r(" valide les schémas 2020-12, que l'instance d'Ajv par défaut de JSON Forms refuse. "),e("code",null,"dsfrI18n"),r(" traduit les messages d'erreur. Le "),e("a",{href:"https://github.com/ShallowRed/survey-kit/tree/main/packages/formulaires-vue-dsfr#readme",target:"_blank",rel:"noopener"},"README du paquet"),r(" décrit l'effet de chaque mot-clé sur le formulaire. ")],-1))],64))}});export{g as default};
