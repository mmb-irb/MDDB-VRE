<template>
  <div v-for="(group, i) in modelGroup">
    <v-row class="mb-0">
      <v-col v-for="(input, j) in props.inputs.filter(item => item.hidden !== true)" :key="j" :lg="props.subCols" :md="props.subCols" sm="12" cols="12" class="pb-0">
        <v-text-field
          v-if="input.inputType === 'text' || input.inputType === 'url'"
          v-model="modelGroup[i][input.id]"
          :rules="rules[input.id]"
          :label="`${input.label} ${required ? '*' : ''}`"
          :prepend-inner-icon="setViewIcon(modelGroup[i][input.id], input.inputType)"
          @update:modelValue="setMultiMultiMetadata(props.id, i, input.id, modelGroup[i][input.id])"
          @click:prepend-inner="setViewIconLink(modelGroup[i][input.id], input.inputType)"
          density="comfortable"
          clearable
        >
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: input.description}" />
            <v-icon v-if="modelGroup.length > 1  && j%props.inputs.length !== 0" @click="removeGroup(i)" color="purple-accent-1" class="ml-1">mdi-delete-outline</v-icon>
          </template>
        </v-text-field>
        <v-number-input
          v-if="input.inputType === 'number'"
          :max="input.max !== undefined ? input.max : Infinity"
          :min="input.min"
          :label="`${input.label} ${required ? '*' : ''}`"
          :rules="rules[input.id]"
          v-model="modelGroup[i][input.id]"
          :step="input.step"
          :suffix="input.suffix"
          @update:modelValue="setMultiMultiMetadata(props.id, i, input.id, modelGroup[i][input.id])"
          control-variant="stacked"
          density="comfortable"
          inset
        >
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: input.description}" />
            <v-icon v-if="modelGroup.length > 1  && j%props.inputs.length !== 0" @click="removeGroup(i)" color="purple-accent-1" class="ml-1">mdi-delete-outline</v-icon>
          </template>
        </v-number-input>  
      </v-col>
      <v-text-field
        v-for="(input, k) in props.inputs.filter(item => item.hidden === true)"
        v-model="modelGroup[i][input.id]"
        v-show="false"
      ></v-text-field>
    </v-row>
  </div>
  <v-btn
    variant="tonal" 
    prepend-icon="mdi-plus-circle-multiple-outline"
    color="purple-accent-2"
    class="mb-3 btn-add"
    @click="createNewGroup()"
    :disabled="!ngEnabled"
    >
    Add new {{ props.label }}
  </v-btn>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'

  const { setMultiMultiMetadata, setMetadata } = structureStorage()
  const { getMultipleRules, checkMultipleValuesAgainstRules } = useRules()

  const { props } = defineProps(['props'])

  const initModel = props.inputs.reduce((acc, input) => {
    acc[input.id] = input.default !== undefined ? input.default : null
    return acc
  }, {})

  const modelGroup = ref([{ ...initModel }])
  setMetadata(props.id, modelGroup.value)

  const required = ref(props.required)
  const rules = ref(props.rules ? getMultipleRules(props.rules, Object.keys(initModel)) : [])

  // computed property to check if all values are non-empty and fulfill the rules
  const ngEnabled = computed(() => allValuesNonEmpty(modelGroup.value) && checkMultipleValuesAgainstRules(modelGroup.value, rules.value) === true)

  // shows / hides eye icon depending if the input fulfills the rules
  const setViewIcon = (val, inputType) => {
    switch (inputType) {
      case 'url':
        return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(val) ? 'mdi-eye-circle-outline' : ''
    }
  }

  // opens a new tab with the link of the input
  const setViewIconLink = (val, inputType) => {
    switch (inputType) {
      case 'url':
        window.open(val, '_blank')
        break
    }
  }

  // Check if all values in an array of objects are non-empty
  const allValuesNonEmpty = (arr) => {
    return arr.every(obj => {
      return Object.values(obj).every(value => value !== '' && value !== null);
    });
  };

  const createNewGroup = () => {
    if(allValuesNonEmpty(modelGroup.value) && checkMultipleValuesAgainstRules(modelGroup.value, rules.value) === true) {
      props.inputs.forEach(field => { if (field.hidden) initModel[field.id] = initModel[field.id].replace(/\d+$/, modelGroup.value.length + 1) });
      modelGroup.value.push({ ...initModel })
    }
  }

  const removeGroup = (index) => {
    //if (index > 0) {
      modelGroup.value.splice(index, 1)
      // TO CKECK????
      setMetadata(props.id, modelGroup.value)
    //}
  }

</script>

<style scoped>
  .container-input { display: flex; width: 100%;  background-color: aquamarine; }
  .btn-add { text-transform: none; font-size: 12px; }
</style>