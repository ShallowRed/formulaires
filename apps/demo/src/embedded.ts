import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Whether the page is shown in an iframe with `?embed`, without the site header, menus and footer
 */
export function useEmbedded(): ComputedRef<boolean> {
  const route = useRoute()
  return computed(() => route.query.embed !== undefined)
}
