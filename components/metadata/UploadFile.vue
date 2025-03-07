<template>
  <p style="color:#777;">{{ props.description }}</p>
  <v-file-input 
    v-model="metaFile"
    :accept="props.formats"
    :label="`${props.label} ${required ? '*' : ''}`"
    :rules="rules"
    :prepend-icon="`${props.icon ? props.icon : 'mdi-file-upload-outline'}`"
    class="mt-5"
    density="comfortable"
    @update:model-value="uploadFile"
  >
  </v-file-input>
  <div v-if="metaFile" id="meta-file-name"><strong>{{ metaFile.name }}</strong> uploaded!</div>
</template>

<script setup>

  import useIndexedDB from '@/modules/helpers/useIndexedDB'
  import useRules from '@/modules/helpers/useRules'
  import structureStorage from '@/modules/structure/structureStorage'

  const { addFile, deleteAllFiles } = useIndexedDB()
  const { getRules } = useRules()
  const { setStructureId } = structureStorage()

  const { props } = defineProps(['props'])

  const metaFile = ref(props.default)
  const required = ref(props.required)
  const rules = ref(props.rules ? getRules(props.rules) : [])

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  const uploadFile = async () => {
    if (!metaFile.value) return

    try {
      const content = await readFileAsText(metaFile.value)

      const fileData = {
        name: metaFile.value.name,
        content,
        type: metaFile.value.type,
      };

      // first clean up all files
      await deleteAllFiles()

      // add new file and save id
      const idb_id = await addFile(fileData)
      setStructureId(idb_id)

    } catch (error) {
      console.error('Error reading file:', error);
    }

  }

  watch(metaFile, async (val) => {
    if(val === null || val === undefined) {
      setStructureId(null)
      await deleteAllFiles()
    }
  })

</script>

<style scoped>
  #meta-file-name {
    color: var(--palette-3);
    font-size: 0.8rem;
    margin-top: 0;
    padding-top: 0;
  }
</style>