<template>
  <v-text-field
    v-model="refModel"
    v-show="false"
  >
  </v-text-field>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'

  const { setMetadata } = structureStorage()

  const { props } = defineProps(['props'])
  const refModel = ref(props.default)
  if(props.default !== undefined) setMetadata(props.id, refModel.value)

</script>

<style scoped>

</style>