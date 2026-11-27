import{C as l}from"./CodeBlock-CDTiUsRW.js";import{d as n,c as u,a as e,b as s,e as o,F as d,o as m}from"./index-UloXXHbr.js";const a="0.1.0",f=`<script setup lang="ts">
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
</template>`,g=n({__name:"InstallPage",setup(i){const t=`pnpm add https://github.com/ShallowRed/formulaires/releases/download/formulaires-vue-dsfr-v${a}/shallowred-formulaires-vue-dsfr-${a}.tgz`;return(p,r)=>(m(),u(d,null,[r[0]||(r[0]=e("h2",{class:"fr-h3"}," Installation ",-1)),r[1]||(r[1]=e("p",null,[e("code",null,"@shallowred/formulaires-vue-dsfr"),s(" affiche avec le DSFR le formulaire que "),e("a",{href:"https://jsonforms.io/",target:"_blank",rel:"noopener"},"JSON Forms"),s(" tire d'un JSON Schema 2020-12. ")],-1)),r[2]||(r[2]=e("h3",{class:"fr-h5"}," Archive ",-1)),r[3]||(r[3]=e("p",null," Chaque version est publiée en archive dans une release du dépôt formulaires : ",-1)),o(l,{code:t,language:"shellscript"}),r[4]||(r[4]=e("p",{class:"fr-mt-2w"},[s(" On installe aussi "),e("code",null,"vue"),s(", "),e("code",null,"@jsonforms/core"),s(" et "),e("code",null,"@jsonforms/vue"),s(" 3.8, "),e("code",null,"@gouvminint/vue-dsfr"),s(" 8.11 ou plus, et on charge les feuilles de style du DSFR. ")],-1)),r[5]||(r[5]=e("h3",{class:"fr-h5 fr-mt-4w"}," Utilisation ",-1)),o(l,{code:f,language:"vue"}),r[6]||(r[6]=e("p",{class:"fr-mt-2w"},[e("code",null,"createAjv2020"),s(" valide les schémas 2020-12, que l'instance d'Ajv par défaut de JSON Forms refuse. "),e("code",null,"dsfrI18n"),s(" traduit les messages d'erreur. Le "),e("a",{href:"https://github.com/ShallowRed/formulaires/tree/main/packages/formulaires-vue-dsfr#readme",target:"_blank",rel:"noopener"},"README du paquet"),s(" décrit l'effet de chaque mot-clé sur le formulaire. ")],-1))],64))}});export{g as default};
