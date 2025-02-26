<template>
  <v-number-input
    :max="props.max !== undefined ? props.max : Infinity"
    :min="props.min"
    :label="`${props.label} ${required ? '*' : ''}`"
    :rules="rules"
    v-model="refModel"
    :step="props.step"
    :suffix="props.suffix"
    @update:modelValue="setMetadata(props.id, refModel)"
    control-variant="stacked"
    density="comfortable"
    inset
  >
    <template v-slot:append>
      <form-tooltip :props="{width: 300, text: props.description}" />
    </template>
  </v-number-input>  
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