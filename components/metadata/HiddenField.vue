<template>
  <v-text-field
    v-model="refModel"
    v-show="false"
  >
  </v-text-field>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'

  const { setMetadata, getMetadataField } = structureStorage()

  const { props } = defineProps(['props'])
  const refModel = ref(props.default)
  // if the default value is set and the metadata field is not set, set the metadata field to the default value
  if(props.default !== undefined && !getMetadataField(props.id)) setMetadata(props.id, refModel.value)
  // if the metadata field is set, set the input value to the metadata field
  if(getMetadataField(props.id)) refModel.value = getMetadataField(props.id)

</script>

<style scoped>

</style>