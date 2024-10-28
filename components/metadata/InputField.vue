<template>
  <v-text-field
    v-model="refModel"
    :rules="rules"
    :label="props.label"
    @update:modelValue="setMetadata(props.id, refModel)"
    clearable
  >
    <template v-slot:append>
      <form-tooltip :props="{width: 300, text: props.description}" />
    </template>
  </v-text-field>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'

  const { setMetadata } = structureStorage()
  const { getRules } = useRules()

  const { props } = defineProps(['props'])
  const refModel = ref('')
  const rules = ref(props.rules ? getRules(props.rules) : [])

</script>

<style scoped>

</style>