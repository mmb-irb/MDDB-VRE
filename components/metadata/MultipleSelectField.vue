<template>
  <p style="color:#777;">{{ props.description }}</p>
  <v-row class="mb-0">
    <v-col v-for="(input, index) in refInputs" :key="index" :lg="props.subCols" :md="props.subCols" sm="12" cols="12" class="pb-0">
      <v-autocomplete
        v-if="!other[index]"
        v-model="refInputs[index]"
        :rules="rules"
        :items="items"
        :label="`${props.label} ${required ? '*' : ''}`"
        item-title="text"
        item-value="option"
        :append-inner-icon="refInputs.length > 1 ? 'mdi-delete-outline' : ''"
        @click:append-inner="removeInput(index)"
        @update:modelValue="handleInput(refInputs[index], index)"
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
            (+{{ refInputs[index].length - 2 }} others)
          </span>
        </template>
        <template v-slot:append>
          <v-icon :color="!nfEnabled ? 'grey-lighten-1' : ''" @click="createNewInput()" v-if="index === refInputs.length - 1">mdi-plus-circle-outline</v-icon>
        </template>
      </v-autocomplete>
      <v-text-field
        v-if="other[index]"
        :ref="setRef(index)"
        v-model="refInputs[index]"
        :rules="rules"
        :label="`${props.label} (Other) ${required ? '*' : ''}`"
        :append-inner-icon="refInputs.length > 1 ? 'mdi-delete-outline' : ''"
        @click:append-inner="removeInput(index)"
        @update:modelValue="setMetadata(props.id, refInputs)"
        @click:clear="other[index] = false"
        density="comfortable"
        clearable
      >
        <template v-slot:append>
          <v-icon :color="!nfEnabled ? 'grey-lighten-1' : ''" @click="createNewInput()" v-if="index === refInputs.length - 1">mdi-plus-circle-outline</v-icon>
        </template>
      </v-text-field>
    </v-col>
  </v-row>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'
  import useREST from '@/modules/helpers/useREST'

  const { setMetadata/*, getDependingItems*/, getMetadataField } = structureStorage()
  const { getRules, checkAllValuesAgainstRules } = useRules()
  const { getSelectOptions } = useREST()
  const { $sleep } = useNuxtApp()

  const { props } = defineProps(['props'])
  const autocompleteRefs = ref([])
  const truncateWidth = computed(() => {
    if(autocompleteRefs.value?.[0]?.$el) return autocompleteRefs.value[0].$el.offsetWidth + 'px'
    else return '100px'
  })
  let refInputs = ref([null])
  if(props.default !== undefined && !getMetadataField(props.id)) setMetadata(props.id, refInputs.value)
  /*if(props.default !== undefined) {
    refInputs.value[0] = props.default
    setMetadata(props.id, refInputs.value)
  }*/
  if(getMetadataField(props.id)) refInputs.value = getMetadataField(props.id)


  /*const refModel = ref(props.default)
  if(props.default !== undefined) setMetadata(props.id, refModel.value)*/
  const required = ref(props.required)
  //const otherField = ref(null)
  const refOther = ref([])
  const other = ref([false])
  const rules = ref(props.rules ? getRules(props.rules) : [])

  // computed property to check if all values are non-empty and fulfill the rules
  const nfEnabled = computed(() => allValuesNonEmpty(refInputs.value) && checkAllValuesAgainstRules(refInputs.value, rules.value) === true)

  // define items depending on the options (get from REST API), items (get from list) or depending (get from another field) properties
  let items
  if(props.options) items = ref(await getSelectOptions(props.options))
  else if(props.items) items = ref(props.items)
  /*else if(props.depending) {
    items = computed(() => getDependingItems(props.depending))
    if(props.default !== undefined) refModel.value = items.value[props.default]
  }*/ else items.value = ref([])

  // add Other option if props.other is true
  if(props.other) items.value.push('Other')

  // Set reference to input field
  const setRef = (index) => el => {
    refOther.value[index] = el
  }

  // sets the metadata for the select input and in case of 'Other' option, it focuses on the input field
  const handleInput = async (value, index) => {
    if (value === 'Other') {
      refInputs.value[index] = ''
      other.value[index] = true
      await $sleep(1)
      refOther.value[index].focus();
    } else setMetadata(props.id, refInputs.value)
  }

   // Check if all values in an array of objects are non-empty
  const allValuesNonEmpty = (arr) => arr.every((val) => val !== '' && val !== null)

  const createNewInput = () => {
    if(allValuesNonEmpty(refInputs.value) && checkAllValuesAgainstRules(refInputs.value, rules.value) === true) {
      refInputs.value.push('')
      other.value.push(false)
    }    
  }

  const removeInput = (index) => {
    //if (index > 0) {
      refInputs.value.splice(index, 1)
      setMetadata(props.id, refInputs.value)
    //}
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