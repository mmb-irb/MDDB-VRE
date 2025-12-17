<template>
  <p style="color:#777;">{{ props.description }}</p>
  <v-text-field
    v-model="refModel[1]"
    :label="props.label"
    :append-inner-icon="structureId ? `mdi-eyedropper-plus`: null"
    @click:append-inner="openStructure"
    @mousedown:control="openStructure"
    density="compact"
    :disabled="!structureId"
    :readonly="true"
    clearable
    @click:clear="onClear"
  >
    
  </v-text-field>
  <v-text-field
    v-model="refModel[0]"
    v-show="false"
  ></v-text-field>

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
  const initModel = props.fields.reduce((acc, field) => {
    acc[field.id] = null;
    return acc;
  }, {});
  const refModel = ref({ })
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
    refModel.value[0] = getMetadataField(firstItemModel[0])
    refModel.value[1] = getMetadataField(secondItemModel[0])
  }

  const dialogRef = ref(null)
  const selectionRef = ref(null)
  const viewerRef = ref(null)
  const openStructure = async () => {

    dialog.value = true

    // trick for avoiding problems on loading the viewer
    await $waitFor(() => viewerRef.value )
    viewerRef.value.setID(structureId.value)
    selectionRef.value.setSelection(refModel.value[1])
  }

  const handleSaveSelection = () => {
    const s = selection.value
    dialog.value = false
    refModel.value[1] = s
    setMetadata(secondItemModel[0], refModel.value[1])

    let residues
    if(s !== '' && s !== null && s !== undefined) {
      residues = viewerRef.value.getResiduesFromSelection(s)
      refModel.value[0] = convertNGLtoVMD(residues.join(', '))
      setMetadata(firstItemModel[0], refModel.value[0])
    }
  }

  const handleCloseDialog = () => {
    dialog.value = false
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
    refModel.value[0] = null
    refModel.value[1] = null
    setMetadata(firstItemModel[0], null)
    setMetadata(secondItemModel[0], null)
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