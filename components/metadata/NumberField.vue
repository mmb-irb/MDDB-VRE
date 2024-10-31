<template>
  <v-number-input
    :max="props.max !== undefined ? props.max : Infinity"
    :min="props.min"
    :label="props.label"
    :rules="rules"
    v-model="refModel"
    :step="props.step"
    :suffix="props.suffix"
    @update:modelValue="setMetadata(props.id, refModel)"
    control-variant="stacked"
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

  const { setMetadata } = structureStorage()
  const { getRules } = useRules()

  const { props } = defineProps(['props'])
  const refModel = ref(props.default)
  const rules = ref(props.rules ? getRules(props.rules) : [])

</script>

<style scoped>

</style>