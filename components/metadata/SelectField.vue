<template>
  <v-autocomplete
    v-model="refModel"
    :rules="rules"
    :items="items"
    :label="props.label"
    item-title="text"
    item-value="option"
    @update:modelValue="setMetadata(props.id, refModel)"
    clearable
  >
    <template v-slot:append>
      <form-tooltip :props="{width: 300, text: props.description}" />
    </template>
  </v-autocomplete>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'
  import useREST from '@/modules/helpers/useREST'; 

  const { setMetadata } = structureStorage()
  const { getRules } = useRules()
  const { getSelectOptions } = useREST()

  const { props } = defineProps(['props'])
  const refModel = ref(null)
  const rules = ref(props.rules ? getRules(props.rules) : [])
  const items = ref(await getSelectOptions(props.options))

</script>

<style scoped>

</style>