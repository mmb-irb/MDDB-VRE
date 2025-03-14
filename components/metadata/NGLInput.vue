<template>
  <v-text-field
    v-model="refModel[0]"
    :label="props.label"
    :append-inner-icon="structureId ? `mdi-eyedropper-plus`: null"
    @click:append-inner="openStructure"
    @mousedown:control="openStructure"
    density="compact"
    :disabled="!structureId"
    :readonly="true"
    clearable
  >
    <template v-slot:append>
      <form-tooltip :props="{width: 300, text: props.description}" />
    </template>
  </v-text-field>
  <v-text-field
    v-model="refModel[1]"
    v-show="false"
  ></v-text-field>

  <NGLDialog v-model="dialog" ref="dialogRef" @saveSelection="handleSaveSelection" @closeDialog="handleCloseDialog">
    <template v-slot:viewer>
      <NGLViewer ref="viewerRef" @nglReady="handleNGLReady" @chainsList="handleChainsList" />
    </template>
    <template v-slot:selection>
      <NGLSelection ref="selectionRef" @setSelection="handleSelection" />
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
  const isNGLReady = ref(false)
  const initModel = props.fields.reduce((acc, field) => {
    acc[field.id] = null;
    return acc;
  }, {});
  const refModel = ref({ ...initModel })
  const entries = Object.entries(initModel);
  const [firstItemModel, secondItemModel] = entries;
  const structureId = computed(() => {
    if(!getStructureId() && !getMetadataField(props.id)) {
      setMetadata(firstItemModel[0], firstItemModel[1])
      setMetadata(secondItemModel[0], secondItemModel[1])
      refModel.value = { ...initModel }
    }
    return getStructureId()
  })

  if(getMetadataField(props.id)) {
    refModel.value = getMetadataField(props.id)
  }

  const dialogRef = ref(null)
  const selectionRef = ref(null)
  const viewerRef = ref(null)
  const openStructure = async () => {

    dialog.value = true

    // trick for avoiding problems on loading the viewer
    await $waitFor(() => viewerRef.value )
    viewerRef.value.setID(structureId.value)
    selectionRef.value.setSelection(refModel.value[0])
  }

  const handleSaveSelection = () => {
    const s = selection.value
    dialog.value = false
    refModel.value[0] = s
    setMetadata(firstItemModel[0], refModel.value[0])

    let residues
    if(s !== '' && s !== null && s !== undefined) {
      residues = viewerRef.value.getResiduesFromSelection(s)
      refModel.value[1] = convertNGLtoVMD(residues.join(', '))
      setMetadata(secondItemModel[0], refModel.value[1])
    }
  }

  const handleCloseDialog = () => {
    dialog.value = false
    isNGLReady.value = false
    selectionRef.value.setEnabled(isNGLReady.value)
  }

  const selection = ref('')
  const handleSelection = (s) => {
    selection.value = s
    viewerRef.value.setSelection(s)
  }

  const handleNGLReady = () => {
    isNGLReady.value = true
    selectionRef.value.setEnabled(isNGLReady.value)
  }

  const handleChainsList = (chains) => {
    selectionRef.value.setChains(chains)
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