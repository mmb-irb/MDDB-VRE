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

  const { setMetadata, getMetadataField } = structureStorage()
  const { getRules } = useRules()

  const { props } = defineProps(['props'])
  const refModel = ref(props.default)
  // if the default value is set and the metadata field is not set, set the metadata field to the default value
  if(props.default !== undefined && !getMetadataField(props.id)) setMetadata(props.id, refModel.value)
  // if the metadata field is set, set the input value to the metadata field
  if(getMetadataField(props.id)) refModel.value = getMetadataField(props.id)
  const required = ref(props.required)
  const rules = ref(props.rules ? getRules(props.rules) : [])

</script>

<style scoped>
</style>