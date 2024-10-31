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
    :chips="props.multiple"
    :multiple="props.multiple"
  >
    <template v-slot:chip="{ item, index }">
      <v-chip v-if="index < 2 && props.multiple" class="ma-1" small>
        <span>{{ item.value }}</span>
      </v-chip>
      <span v-if="!props.multiple">{{ item.value }}</span>
      <span
        v-if="index === 2"
        class="text-grey text-caption align-self-center"
      >
        (+{{ refModel.length - 2 }} others)
      </span>
    </template>
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

  // TODO MULTISELECTABLE OPTIONAL!!!!

  const { props } = defineProps(['props'])
  const refModel = ref(null)
  const rules = ref(props.rules ? getRules(props.rules) : [])
  const items = ref(await getSelectOptions(props.options))

</script>

<style scoped>

</style>