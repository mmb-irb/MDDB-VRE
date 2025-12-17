<template>
  <p style="color:#777;" v-html="props.description"></p>
  <div v-for="(interaction, index) in modelGroup" :key="index" class="pt-2" >
    <v-row class="mb-0" >
      <v-col v-for="(item, idx) in props.fields.filter(item => item.hidden !== true)" :key="idx" :lg="item.subCols" :md="item.subCols" sm="12" cols="12" class="pb-0">
        <v-text-field
          v-if="item.type === 'input'"
          v-model="modelGroup[index][item.id]"
          :label="item.label"
          @update:modelValue="handleInput"
          :append-inner-icon="item.inputType === 'selection' && structureId ? `mdi-eyedropper-plus`: null"
          @click:append-inner="openStructure(index, item)"
          @mousedown:control="item.id.startsWith('selection_') ? openStructure(index, item) : null"
          density="compact"
          :disabled="!structureId"
          :readonly="item.id.startsWith('selection_')"
          clearable
          @click:clear="onClear"
        >
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: item.description}" />
          </template>
        </v-text-field>
      </v-col>
      <v-text-field
        v-for="(item, k) in props.fields.filter(item => item.hidden === true)"
        v-model="modelGroup[index][item.id]"
        v-show="false"
      ></v-text-field>
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
      :disabled="!ngEnabled || !structureId"
      >
      Add new group of {{ props.label }}
    </v-btn>
  </div>

  <NGLDialog v-model="dialog" ref="dialogRef" @saveSelection="handleSaveSelection" @closeDialog="handleCloseDialog">
    <template v-slot:viewer>
      <NGLViewer ref="viewerRef" />
    </template>
    <template v-slot:selection>
      <NGLSelection ref="selectionRef" @setSelection="handleSelection" @setPreview="handlePreview" @setView="handleSetView" />
    </template>
  </NGLDialog>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import utilsNGL from '@/modules/ngl/utils'

  const { setMetadata, getMetadataField, getStructureId } = structureStorage()
  const { convertNGLtoVMD } = utilsNGL()

  const { props } = defineProps(['props'])
  const { $waitFor } = useNuxtApp()

  const dialog = ref(false)
  const initModel = {name: null, agent_1: null, selection_1: null, selection_1_ngl: null, agent_2: null, selection_2: null, selection_2_ngl: null}
  const modelGroup = ref([{ ...initModel }])
  const structureId = computed(() => {
    if(!getStructureId() && !getMetadataField(props.id)) {
      setMetadata(props.id, [{ ...initModel }])
      modelGroup.value = [{ ...initModel }]
    }
    return getStructureId()
  })

  if(getMetadataField(props.id)) {
    modelGroup.value = getMetadataField(props.id)
  }

  const items = {
    //type: await getSelectOptions(props.fields.filter(item => item.id === 'type')[0].options),
    agent_1: props.fields.filter(item => item.id === 'agent_1')[0].items,
    agent_2: props.fields.filter(item => item.id === 'agent_2')[0].items
  }

  // computed property to check if all values are non-empty and fulfill the rules
  const ngEnabled = computed(() => allValuesNonEmpty(modelGroup.value))

  const handleInput = () => {
    setMetadata(props.id, modelGroup.value)
  }

  // Check if all values in an array of objects are non-empty
  const allValuesNonEmpty = (arr) => {
    return arr.every(obj => {
      return Object.values(obj).every(value => value !== '' && value !== null);
    });
  };

  const createNewGroup = () => {
    if(allValuesNonEmpty(modelGroup.value)) {
      modelGroup.value.push({ ...initModel })
      /*other.value.push({ ...initOther })
      refOther.value.push({ ...initOther })*/
    }
  }

  const removeGroup = (index) => {
    //if (index > 0) {
      modelGroup.value.splice(index, 1)
      setMetadata(props.id, modelGroup.value)
    //}
  }

  const dialogRef = ref(null)
  const selectionRef = ref(null)
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
    await $waitFor(() => viewerRef.value )
    viewerRef.value.setID(structureId.value)
    selectionRef.value.setSelection(modelGroup.value[currSel.index][currSel.id])
  }

  const handleSaveSelection = () => {
    const s = selection.value
    dialog.value = false
    modelGroup.value[currSel.index][currSel.id] = s
    setMetadata(props.id, modelGroup.value)

    let residues
    if(s !== '' && s !== null && s !== undefined) {
      residues = viewerRef.value.getResiduesFromSelection(s)
      modelGroup.value[currSel.index][currSel.id.substring(0, currSel.id.length - 4)] = convertNGLtoVMD(residues.join(', '))
    }
  }

  const handleCloseDialog = () => {
    dialog.value = false
    currSel.id = null
    currSel.index = null
  }

  const selection = ref('')
  const handleSelection = (s) => {
    selection.value = s
    viewerRef.value.setSelection(s)
  }

  const handlePreview = (s, t) => {
    viewerRef.value.setSelectionPreview(s, t)
  }

  const handleSetView = (s) => {
    viewerRef.value.setView(s)
  }

  const onClear = () => {
    modelGroup.value[currSel.index][currSel.id] = null
    modelGroup.value[currSel.index][currSel.id.substring(0, currSel.id.length - 4)] = null
    setMetadata(props.id, modelGroup.value)
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