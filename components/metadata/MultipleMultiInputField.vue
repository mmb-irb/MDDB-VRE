<template>
  <div class="multi-multi" v-for="(group, i) in modelGroup">
    <div class="container-input" >
      <v-text-field
        v-for="(input, j) in props.inputs"
        :key="j"
        v-model="modelGroup[i][input.id]"
        :rules="rules[input.id]"
        :label="input.label"
        :prepend-inner-icon="setViewIcon(modelGroup[i][input.id], input.inputType)"
        @update:modelValue="setMultiMultiMetadata(props.id, i, input.id, modelGroup[i][input.id])"
        @click:prepend-inner="setViewIconLink(modelGroup[i][input.id], input.inputType)"
        clearable
      >
        <template v-slot:append>
          <form-tooltip :props="{width: 300, text: input.description}" />
        </template>
      </v-text-field>
    </div>
    <div class="container-btn mt-1">
      <v-tooltip text="Remove group of inputs" location="bottom" v-if="i > 0">
        <template v-slot:activator="{ props }">
          <v-btn 
            variant="text" 
            color="purple-accent-1" 
            icon="mdi-trash-can-outline" 
            class="btn-remove" 
            @click="removeGroup(i)"
            v-bind="props"
            ></v-btn>
        </template>
      </v-tooltip>
    </div>
  </div>
  <v-btn
    variant="tonal" 
    prepend-icon="mdi-plus-circle-multiple-outline"
    color="purple-accent-2"
    class="mb-3 btn-add"
    @click="createNewGroup()"
    :disabled="!ngEnabled"
    >
    Add new group of {{ props.label }}
  </v-btn>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'

  const { setMultiMultiMetadata } = structureStorage()
  const { getMultipleRules, checkMultipleValuesAgainstRules } = useRules()

  const { props } = defineProps(['props'])

  const initModel = props.inputs.reduce((acc, input) => {
    acc[input.id] = ''
    return acc
  }, {})
  const modelGroup = ref([{ ...initModel }])

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
      modelGroup.value.push({ ...initModel })
      //console.log(modelGroup.value)
    }
  }

  const removeGroup = (index) => {
    if (index > 0) {
      modelGroup.value.splice(index, 1)
    }
  }

</script>

<style>
  .multi-multi .v-input__append { margin-inline-end:10px; margin-inline-start:16px; }
</style>
<style scoped>
  .multi-multi { display: flex; }
  .container-input { display: flex; width: 95%; }
  .container-btn { display: flex; width: 5%; justify-content: end; align-items:first baseline; }
  .btn-add { text-transform: none; font-size: 12px; }
</style>