<template>
  <p style="color:#777;" v-html="props.description"></p>
  <div v-for="(interaction, index) in modelGroup" :key="index" class="pt-2" >
    <v-row class="mb-0" >
      <v-col v-for="(item, idx) in props.fields" :key="idx" :lg="item.subCols" :md="item.subCols" sm="12" cols="12" class="pb-0">
        <v-text-field
          v-if="item.type === 'input'"
          v-model="modelGroup[index][item.id]"
          :label="item.label"
          @update:modelValue="handleInput(item.id, index)"
          :append-inner-icon="item.inputType === 'selection' && structureId ? `mdi-eyedropper-plus`: null"
          @click:append-inner="openStructure(index, item)"
          density="compact"
          clearable
        >
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: item.description}" />
          </template>
        </v-text-field>
        <!--<div v-if="item.type === 'select'">
          <v-autocomplete
            v-if="!other[index][item.id]"
            v-model="modelGroup[index][item.id]"
            :items="items[item.id]"
            :label="item.label"
            item-title="name"
            item-value="option"
            @update:modelValue="handleSelect(item.id, index)"
            clearable
            density="compact"
            allow-new
          >
            <template v-slot:append>
              <form-tooltip :props="{width: 300, text: item.description}" />
            </template>
          </v-autocomplete>
          <v-text-field
            v-if="other[index][item.id]"
            :ref="setRef(index, item.id)"
            v-model="modelGroup[index][item.id]"
            :label="`${item.label} (Other)`"
            @update:modelValue="handleSelect(item.id, index)"
            @click:clear="other[index][item.id] = false"
            density="compact"
            clearable
          >
            <template v-slot:append>
              <form-tooltip :props="{width: 300, text: item.description}" />
            </template>
          </v-text-field>
        </div>-->
      </v-col>
    </v-row>
    <div v-if="modelGroup.length > 1"  :class="`${index < modelGroup.length - 1 ? 'bg-bottom-interaction mb-2' : 'pt-2'} btn-remove`">
      <v-tooltip :text="`Remove group of ${ props.label }`" location="bottom" >
        <template v-slot:activator="{ props }">
          <v-btn 
            density="compact" 
            icon="mdi-delete-outline" 
            variant="text"
            color="purple-accent-4"
            class="mb-3"
            @click="removeGroup(index)"
            v-bind="props"
          >
          </v-btn>
        </template>
      </v-tooltip>
    </div>
  </div>
  <div :class="`container-add ${modelGroup.length === 1 ? '' : 'mt-40' }`">
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
  </div>

  <NGLDialog v-model="dialog" ref="dialogRef" @saveSelection="handleSaveSelection" @closeDialog="handleCloseDialog">
    <template v-slot:viewer>
      <NGLViewer ref="viewerRef" />
    </template>
  </NGLDialog>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'

  const { setMetadata, getMetadataField, getStructureId } = structureStorage()

  //import useREST from '@/modules/helpers/useREST'

  //const { getSelectOptions } = useREST()

  const { props } = defineProps(['props'])
  const { $sleep } = useNuxtApp()

  const dialog = ref(false)
  const initModel = {name: null, agent_1: null, selection_1: null, agent_2: null, selection_2: null}
  const modelGroup = ref([{ ...initModel }])
  const initOther = {agent_1: null, agent_2: null}
  const other = ref([{ ...initOther }])
  const refOther = ref([{ ...initOther }])
  const structureId = computed(() => getStructureId())

  if(getMetadataField(props.id)) {
    modelGroup.value = getMetadataField(props.id)
    // reset other fields to null with the same length as modelGroup
    other.value = modelGroup.value.map(() => ({ ...initOther }));
  }

  const items = {
    //type: await getSelectOptions(props.fields.filter(item => item.id === 'type')[0].options),
    agent_1: props.fields.filter(item => item.id === 'agent_1')[0].items,
    agent_2: props.fields.filter(item => item.id === 'agent_2')[0].items
  }

  const otherInit = {
    //type: props.fields.filter(item => item.id === 'type')[0].other,
    agent_1: props.fields.filter(item => item.id === 'agent_1')[0].other,
    agent_2: props.fields.filter(item => item.id === 'agent_2')[0].other
  }

  //if(otherInit.type) items.type.push('Other')
  if(otherInit.agent_1) items.agent_1.push({name: 'Other', option: 'other'})
  if(otherInit.agent_2) items.agent_2.push({name: 'Other', option: 'other'})

  // computed property to check if all values are non-empty and fulfill the rules
  const ngEnabled = computed(() => allValuesNonEmpty(modelGroup.value))

  // Set reference to input field
  /*const setRef = (index, id) => el => {
    refOther.value[index][id] = el
  }*/

  const handleInput = (id, index) => {
    //console.log(modelGroup.value[index][id])
    setMetadata(props.id, modelGroup.value)
  }

  /*const handleSelect = async (id, index) => {
    if (modelGroup.value[index][id] === 'other') {
      modelGroup.value[index][id] = ''
      other.value[index][id] = true
      await $sleep(1)
      refOther.value[index][id].focus();
    }
    //console.log(modelGroup.value[index][id])
    setMetadata(props.id, modelGroup.value)
  }*/

  // Check if all values in an array of objects are non-empty
  const allValuesNonEmpty = (arr) => {
    return arr.every(obj => {
      return Object.values(obj).every(value => value !== '' && value !== null);
    });
  };

  const createNewGroup = () => {
    if(allValuesNonEmpty(modelGroup.value)) {
      modelGroup.value.push({ ...initModel })
      other.value.push({ ...initOther })
      refOther.value.push({ ...initOther })
    }
  }

  const removeGroup = (index) => {
    //if (index > 0) {
      modelGroup.value.splice(index, 1)
      setMetadata(props.id, modelGroup.value)
    //}
  }

  const dialogRef = ref(null)
  const viewerRef = ref(null)
  let currSel = {
    id: null,
    index: null
  }
  const openStructure = async (index, item) => {

    currSel.id = item.id
    currSel.index = index

    dialog.value = true

    // trick for avoiding problems on loading the viewer
    await $sleep(500)    
    viewerRef.value.setID(structureId.value)
  }

  const handleSaveSelection = () => {
    console.log('save selection')
    const s = viewerRef.value.getSelection()
    console.log(s)
    dialog.value = false
    modelGroup.value[currSel.index][currSel.id] = s
  }

  const handleCloseDialog = () => {
    dialog.value = false
    currSel.id = null
    currSel.index = null
  }

</script>

<style scoped>
  .btn-add { text-transform: none; font-size: 12px; }
  .container-add { display: flex; justify-content: space-between; }
  .mt-40 { margin-top: -40px; }
  .btn-remove { display: flex; justify-content: end; border-radius: 10px; }
  .bg-bottom-interaction{
    background: rgb(191,191,191);
    background: linear-gradient(2deg, rgba(224,224,224,.7) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,1) 100%);
  }
</style>