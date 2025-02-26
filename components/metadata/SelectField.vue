<template>
  <v-autocomplete
    v-if="!other"
    v-model="refModel"
    :rules="rules"
    :items="items"
    :label="`${props.label} ${required ? '*' : ''}`"
    item-title="text"
    item-value="option"
    @update:modelValue="handleInput"
    density="comfortable"
    clearable
    allow-new
    :chips="props.multiple"
    :multiple="props.multiple"
    ref="autocompleteRefs"
  >
    <template v-slot:chip="{ item, index }">
      <v-chip v-if="index < 2 && props.multiple" class="ma-1" small>
        <span>{{ item.value }}</span>
      </v-chip>
      <span v-if="!props.multiple" class="truncate">{{ item.value }}</span>
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
  <v-text-field
    v-if="other"
    ref="otherField"
    v-model="refModel"
    :rules="rules"
    :label="`${props.label} (Other) ${required ? '*' : ''}`"
    @update:modelValue="setMetadata(props.id, refModel)"
    @click:clear="other = false"
    density="comfortable"
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
  import useREST from '@/modules/helpers/useREST'

  const { setMetadata, getDependingItems, getMetadataField } = structureStorage()
  const { getRules } = useRules()
  const { getSelectOptions } = useREST()
  const { $sleep } = useNuxtApp()

  const { props } = defineProps(['props'])
  const autocompleteRefs = ref([])
  const truncateWidth = computed(() => {
    if(autocompleteRefs.value?.[0]?.$el) return autocompleteRefs.value[0].$el.offsetWidth + 'px'
    else return '100px'
  })
  const refModel = ref(props.default)
  //if(props.default !== undefined) setMetadata(props.id, refModel.value)
  // if the default value is set and the metadata field is not set, set the metadata field to the default value
  if(props.default !== undefined && !getMetadataField(props.id)) setMetadata(props.id, refModel.value)
  // if the metadata field is set, set the input value to the metadata field
  if(getMetadataField(props.id)) refModel.value = getMetadataField(props.id)
  const required = ref(props.required)
  const otherField = ref(null)
  const other = ref(null)
  const rules = ref(props.rules ? getRules(props.rules) : [])
  // define items depending on the options (get from REST API), items (get from list) or depending (get from another field) properties
  let items
  if(props.options) items = ref(await getSelectOptions(props.options))
  else if(props.items) items = ref(props.items)
  else if(props.depending) {
    items = computed(() => getDependingItems(props.depending))
    if(props.default !== undefined) refModel.value = items.value[props.default]
    if(getMetadataField(props.id)) refModel.value = items.value[getMetadataField(props.id)]
  } else items.value = ref([])

  // add Other option if props.other is true
  if(props.other) items.value.push('Other')

  // sets the metadata for the select input and in case of 'Other' option, it focuses on the input field
  const handleInput = async (value) => {
    if (value === 'Other') {
      refModel.value = ''
      other.value = true
      await $sleep(1)
      otherField.value.focus()
    } else setMetadata(props.id, value)
}

</script>

<style scoped>
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: v-bind(truncateWidth); /* Adjust this value as needed */
  }
</style>