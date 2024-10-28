<template>
  <div class="multi-multi" v-for="(group, i) in modelGroup">
    <div class="container-input" >
      <v-text-field
        v-for="(input, j) in props.inputs"
        :key="j"
        v-model="refModel"
        :rules="rules"
        :label="input.label"
        @update:modelValue="setMetadata(input.id, refModel)"
        clearable
      >
        <template v-slot:append>
          <form-tooltip :props="{width: 300, text: input.description}" />
        </template>
      </v-text-field>
    </div>
    <div class="container-btn mt-1">
      <v-tooltip text="Add new group of inputs" location="bottom" v-if="i === modelGroup.length - 1">
        <template v-slot:activator="{ props }">
          <v-btn 
            variant="text" 
            color="purple-accent-1" 
            icon="mdi-plus-circle-multiple-outline" 
            class="btn-plus" 
            @click="createNewGroup(i)"
            v-bind="props"
            ></v-btn>
        </template>
      </v-tooltip>
      <v-tooltip text="Remove group of inputs" location="bottom" v-if="i < modelGroup.length - 1">
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
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'

  const { setMetadata } = structureStorage()
  const { getRules } = useRules()

  const { props } = defineProps(['props'])
  const refModel = ref('')
  // TODO: FILL modelGroup with props.inputs.id
  const modelGroup = ref([{id: 'name', value: ''}])
  // TODO: second v-for to iterate over modelGroup[0]
  // REDO RULES!!!
  const rules = ref(props.rules ? getRules(props.rules) : [])

  const createNewGroup = (index) => {
    console.log('createNewGroup', index)
    //modelGroup.value.push({id: 'name', value: ''})
  }

  const removeGroup = (index) => {
    if (index > 0) {
      console.log('removeGroup', index)
      //modelGroup.value.splice(index, 1)
    }
  }

</script>

<style>
  .multi-multi .v-input__append { margin-inline-end:10px; margin-inline-start:16px; }
</style>
<style scoped>
  .multi-multi { display: flex; }
  .container-input { display: flex; width: 95%; }
  .container-btn { display: flex; width: 5%; justify-content: end; align-items:first baseline;}
  .btn-plus { font-size: 25px;}
</style>