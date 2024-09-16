<template>
  <v-form
    v-model="form"
  >
    <v-row class="my-1">
      <v-col cols="12" class="pb-0">
        <v-file-input
          v-model="fields.top"
          accept=".pdb,.top,.cif"
          label="Topology file"
          :rules="rules.top"
          prepend-icon="mdi-molecule"
          show-size
        ></v-file-input>
      </v-col>
    </v-row>
    <v-row class="mb-1">
      <v-col cols="12" class="pb-0">
        <v-file-input
          v-model="fields.traj"
          accept=".xtc,.dcd,.mdcrd,.trr,.nc,.netcdf"
          label="Trajectory file(s)"
          :rules="rules.traj"
          prepend-icon="mdi-atom-variant"
          :disabled="trjDisabled"
          counter
          multiple
          show-size
        ></v-file-input>
      </v-col>
    </v-row>
    <v-row class="mb-1 mt-0">
      <v-col cols="12" class="py-0">
        <v-switch
          v-model="fields.type"
          color="purple-accent-2"
          :label="`Click here if your trajectory is larger than ${$globals.maxUploadTrjSizeHumanReadable}. The update must be done manually, further instructions will be provided in the next step.`"
          false-value="small"
          true-value="large"
          hide-details
          theme="kk"
          @click="switchTrajSize"
        ></v-switch>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="py-0">
        <v-progress-linear
          v-model="progress"
          color="deep-purple-lighten-4"
          height="15"
          v-if="progress > 0"
        >
          <template v-slot:default="{ value }">
            <strong style="font-size:.7rem;">{{ Math.ceil(value) }}%</strong>
          </template>
        </v-progress-linear>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'

  const { getMetadata } = structureStorage()

  const config = useRuntimeConfig()
  const { $globals, $axios } = useNuxtApp()
  
  const form = ref(false)
  const fields = reactive({
    top: null,
    traj: null,
    type: 'small'
  })
  const isFormValid = computed(() => {
    return (fields.top && (fields.type === 'large' || (fields.traj && fields.traj.length && fields.traj.reduce((acc, file) => acc + file.size, 0) < $globals.maxUploadTrjSize)))
  })
  const trjDisabled = computed(() => fields.type === 'large')
  const progress = ref(0)

  const emit = defineEmits(['endFormUpload', 'endUploadFiles']);

  const rules = {
    top: [
      v => !!v || 'Please add a topology file'
    ],
    traj: [
      v => !v || !v.length || v.reduce((acc, file) => acc + file.size, 0) < $globals.maxUploadTrjSize || `Total trajectories size should be less than ${$globals.maxUploadTrjSizeHumanReadable}! For uploading more than this size, please click the button below.`
    ],
  }

  onMounted(() => {
    let uploadButton = document.querySelector('#upload-btn')
    uploadButton.disabled = true
    uploadButton.classList.add('v-btn--disabled')
  })

  const switchTrajSize = () => {
    if (fields.type === 'small') {
      fields.traj = null
    }
  }

  const sendToREST = async () => {

    const formData = new FormData()
    formData.append('top', fields.top)
    if(fields.traj) fields.traj.forEach(file => formData.append('traj', file))

    // Create JSON with metadata
    const metadata = getMetadata()
    metadata.trjType = fields.type
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    formData.append('meta', metadataBlob, 'metadata.json');

    let resp = null
    $axios
      .post(`${config.public.apiBase}/upload`, formData,
      {
          onUploadProgress: (e) => {
              if (e.lengthComputable) {
                  progress.value = Math.floor((e.loaded/e.total) * 100)
                  if(progress.value >= 100) {
                    emit('endUploadFiles', true)
                  }
              }
          }
      })
      .then(function (response) {
          //console.log(response);
          resp = response.data
      })
      .catch(err => console.error(err.message))
      .finally( () => {

        console.log(resp)

      })
  }

  // controls "upload" button on parent component
  watch(isFormValid, (nv, ov) => {
    emit('endFormUpload', nv)
  })

  defineExpose({
		sendToREST
	});

</script>

<style >
  .v-theme--kk .v-label {
    font-size: .85rem!important;
  }
</style>