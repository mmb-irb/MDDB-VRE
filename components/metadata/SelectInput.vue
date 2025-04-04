<template>
  <div class="select-input">
    <div class="sel-class">
      <v-autocomplete
        v-if="!other"
        v-model="refModelSelect"
        :rules="selRules"
        :items="items"
        :label="`${select.label} ${select.required ? '*' : ''}`"
        item-title="name"
        item-value="option"
        @update:modelValue="handleInput"
        clearable
        density="comfortable"
        allow-new
      >
        <template v-slot:append>
          <form-tooltip :props="{width: 300, text: select.description}" />
        </template>
      </v-autocomplete>
      <v-text-field
        v-if="other"
        ref="otherField"
        v-model="refModelSelect"
        :rules="selRules"
        :label="`${select.label} (Other) ${select.required ? '*' : ''}`"
        @update:modelValue="setMetadata(select.id, refModelSelect)"
        @click:clear="other = false; refModelInput = null"
        density="comfortable"
        clearable
      >
        <template v-slot:append>
          <form-tooltip :props="{width: 300, text: select.description}" />
        </template>
      </v-text-field>
    </div>
    <div class="input-class">
      <v-text-field
        v-model="refModelInput"
        :rules="inpRules"
        :label="`${input.label} ${input.required ? '*' : ''}`"
        :prepend-inner-icon="setViewIcon(refModelInput)"
        @update:modelValue="setMetadata(input.id, refModelInput)"
        @click:prepend-inner="setViewIconLink(refModelInput)"
        :readonly="!other"
        :clearable="other"
        density="comfortable"
      >
        <template v-slot:append>
          <form-tooltip :props="{width: 300, text: input.description}" />
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'

  const { setMetadata, getMetadataField } = structureStorage()
  const { getRules } = useRules()
  const { $sleep } = useNuxtApp()

  const { props } = defineProps(['props'])
  const otherField = ref(null)
  const other = ref(null)

  const select = props.fields.filter(f => f.type === 'select')[0]
  const items = select.items
  const input = props.fields.filter(f => f.type === 'input')[0]
  const refModelSelect = ref(select.default)
  const refModelInput = ref(input.default)
  // if the default value is set and the metadata field is not set, set the metadata field to the default value
  if(select.default !== undefined && !getMetadataField(select.id)) setMetadata(select.id, refModelSelect.value)
  if(input.default !== undefined && !getMetadataField(input.id)) setMetadata(input.id, refModelInput.value)
  // if the metadata field is set, set the input value to the metadata field
  if(getMetadataField(select.id)) refModelSelect.value = getMetadataField(select.id)
  if(getMetadataField(input.id)) refModelInput.value = getMetadataField(input.id)
  /*setMetadata(select.id, refModelSelect.value)
  setMetadata(input.id, refModelInput.value)*/

  const selRules = ref(select.rules ? getRules(select.rules) : [])
  const inpRules = ref(input.rules ? getRules(input.rules) : [])
  // add Other option if props.other is true
  if(select.other) items.push({"name": "Other", "link": ""})

  // sets the metadata for the select input and in case of 'Other' option, it focuses on the input field
  const handleInput = async (value) => {
    if (value === 'Other') {
      refModelSelect.value = ''
      other.value = true
      await $sleep(1)
      otherField.value.focus()
    } else setMetadata(select.id, value)

    const lnk = value !== null && value !== '' ? items.filter(i => i.name === value)[0].link : null
    setMetadata(input.id, lnk)
    refModelInput.value = lnk
  }

  // shows / hides eye icon depending if the input fulfills the rules
  const setViewIcon = (val) => {
    switch (input.inputType) {
      case 'url':
        return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(val) ? 'mdi-eye-circle-outline' : ''
    }
  }

  // opens a new tab with the link of the input
  const setViewIconLink = (val) => {
    switch (input.inputType) {
      case 'url':
        window.open(val, '_blank')
        break
    }
  }

</script>

<style>
  .sel-class .v-input__append { margin-inline-start:15px;  }
</style>
<style scoped>
  .select-input { display: flex; }
  .sel-class { display: flex; width: 100%; }
  .input-class { display: flex; width: 100%; margin-left: 24px; }
</style>