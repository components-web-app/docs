---
navigation: false
---

```vue [app/cwa/pages/PrimaryPageTemplate.vue]
<template>
  <div>
    <CwaComponentGroup
      reference="primary"
      :location="props.iri"
    />
  </div>
</template>

<script setup lang="ts">
  import type { IriProp }
    from '#cwa/runtime/composables/cwa-resource'

  const props = defineProps<IriProp>()
</script>
```
