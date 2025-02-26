<template>
  <v-text-field
    v-model="refModel"
    :rules="rules"
    :label="`${props.label} ${required ? '*' : ''}`"
    :prepend-inner-icon="setViewIcon(refModel)"
    @update:modelValue="setMetadata(props.id, refModel)"
    @click:prepend-inner="setViewIconLink(refModel)"
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

  // shows / hides eye icon depending if the input fulfills the rules
  const setViewIcon = (val) => {
    switch (props.inputType) {
      case 'url':
        return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(val) ? 'mdi-eye-circle-outline' : ''
    }
  }

  // opens a new tab with the link of the input
  const setViewIconLink = (val) => {
    switch (props.inputType) {
      case 'url':
        window.open(val, '_blank')
        break
    }
  }

</script>

<style scoped>

</style>