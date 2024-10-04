---
navigation: false
---

::code-group
```vue [Page]
<!-- cwa/pages/PrimaryPageTemplate.vue -->
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

```vue [Component]
<!-- cwa/components/Title/Title.vue -->
<template>
  <h1 class="text-primary text-4xl font-extrabold">
    {{ resource?.data?.title || 'No Title' }}
  </h1>
</template>

<script setup lang="ts">
  import { toRef } from 'vue'
  import {
    useCwaResource
  } from '#imports'
  import type { IriProp }
    from "#cwa/runtime/composables/cwa-resource";

  const props = defineProps<IriProp>()

  const { getResource, exposeMeta } =
    useCwaResource(toRef(props, 'iri'))

  const resource = getResource()

  defineExpose(exposeMeta)
</script>
```

```vue [Admin]
<!-- cwa/components/Title/Title.vue -->
<template>
  <CwaUiFormLabelWrapper label="Title">
    <CwaUiFormInput
      v-model="titleModel.model.value" 
    />
  </CwaUiFormLabelWrapper>
</template>

<script setup lang="ts">
  import {
    useCwaResourceManagerTab,
    useCwaResourceModel
  } from '#imports'

  const { exposeMeta, iri } =
    useCwaResourceManagerTab({ name: 'Title' })

  const titleModel =
    useCwaResourceModel<string>(iri, 'title')

  defineExpose(exposeMeta)
</script>
```
::
