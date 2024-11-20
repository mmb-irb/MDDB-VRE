<template>
  <v-textarea 
    v-model="refModel"
    :rules="rules"
    :label="`${props.label} ${required ? '*' : ''}`"
    @update:modelValue="setMetadata(props.id, refModel)"
    :rows="props.rows"
    clearable
    density="comfortable"
    no-resize
  >
    <template v-slot:append>
      <form-tooltip :props="{width: 300, text: props.description}" />
    </template>
  </v-textarea>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'

  const { setMetadata } = structureStorage()
  const { getRules } = useRules()

  const { props } = defineProps(['props'])
  const refModel = ref(props.default)
  if(props.default !== undefined) setMetadata(props.id, refModel.value)
  const required = ref(props.required)
  const rules = ref(props.rules ? getRules(props.rules) : [])

</script>

<style scoped>
</style>