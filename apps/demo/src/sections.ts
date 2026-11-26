import { integrationExamples } from './examples/integration'

export interface Section {
  to: string
  title: string
  description: string
  /** Pages of the section, listed in its side menu */
  pages: { to: string, text: string }[]
}

export const sections: Section[] = [
  {
    to: '/integrer',
    title: 'Intégrer un formulaire',
    description: 'Afficher le formulaire d\'un JSON Schema avec le DSFR, base légale et source certifiable comprises.',
    pages: [
      { to: '/integrer', text: 'Installation' },
      ...integrationExamples.map(example => ({ to: `/integrer/${example.slug}`, text: example.title })),
    ],
  },
  {
    to: '/ecrire',
    title: 'Écrire un formulaire',
    description: 'Répartir les champs en étapes, poser des conditions d\'affichage et voir le formulaire obtenu.',
    pages: [],
  },
  {
    to: '/assembler',
    title: 'Assembler un simulateur',
    description: 'Relier un formulaire à un modèle publicodes et afficher l\'éligibilité dans le navigateur.',
    pages: [
      { to: '/assembler', text: 'Parties d\'un simulateur' },
      { to: '/assembler/exemple-minimal', text: 'Exemple minimal' },
      { to: '/assembler/aides-innovation', text: 'Simulateur des aides à l\'innovation' },
      { to: '/assembler/code', text: 'Code du simulateur' },
    ],
  },
]
