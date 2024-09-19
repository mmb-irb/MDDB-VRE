<template>
  <v-form
    v-model="form"
  >
    <v-row class="my-1">
      <v-col cols="12" class="pb-0">
        <v-file-input
          v-model="fields.top"
          :accept="texts.top.formats"
          :label="texts.top.label"
          :rules="rules.top"
          prepend-icon="mdi-molecule"
          show-size
        >
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: texts.top.tooltip}" />
          </template>
        </v-file-input>
      </v-col>
    </v-row>
    <v-row class="mb-1">
      <v-col cols="12" class="pb-0">
        <v-file-input
          v-model="fields.traj"
          :accept="texts.traj.formats"
          :label="texts.traj.label"
          :rules="rules.traj"
          prepend-icon="mdi-atom-variant"
          :disabled="trjDisabled"
          counter
          multiple
          show-size
        >
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: texts.traj.tooltip}" />
          </template>
        </v-file-input>
      </v-col>
    </v-row>
    <v-row class="mb-1 mt-0">
      <v-col cols="12" class="py-0">
        <v-switch
          v-model="fields.type"
          color="purple-accent-2"
          :label="texts.switch.label[fields.type]"
          false-value="small"
          true-value="large"
          hide-details
          theme="kk"
          @click="switchTrajSize"
        ></v-switch>
      </v-col>
    </v-row>
    <v-row class="mb-1 mt-1" v-if="fields.type === 'large'">
      <v-col cols="12">As the <strong>MDDB VRE</strong> doesn't support transference of big files, fill the fields below with the name of the trajectory files to upload. Please provide <strong>only the name</strong> with one of the accepted trajectory formats: <strong>{{ $globals.trajFormats.join(', ') }}</strong>. Further instructions will be provided in the next step after clicking the <strong>UPLOAD</strong> button. </v-col>
      <v-col lg="6" md="6" sm="12" cols="12" class="pb-0" v-for="(field, index) in trajNames" :key="index">
        <v-text-field
          v-model="trajNames[index]"
          :label="texts.trajName.label"
          append-icon="mdi-file-document-plus-outline"
          :append-inner-icon="index > 0 ? 'mdi-delete-outline' : ''"
          @click:append="createNewField(index)"
          @click:append-inner="removeField(index)"
          clearable
          :rules="rules.trjNames"
        ></v-text-field>
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
  
  const texts = {
    top: {
      formats: $globals.topFormats.toString(),
      label: 'Topology file',
      tooltip: `Click on the field for uploading the topology file. Accepted formats: ${$globals.topFormats.join(', ')}.`,
    },
    traj: {
      formats: $globals.trajFormats.toString(),
      label: 'Trajectory file(s)',
      tooltip: `Click on the field for uploading the trajectory file(s). Accepted formats: ${$globals.trajFormats.join(', ')}. If the total size of the trajectory files is larger than ${$globals.maxUploadTrjSizeHumanReadable}, please click the button below.`,
    },
    switch: {
      label: {
        small: `Click here if the total size of your trajectory files is larger than ${$globals.maxUploadTrjSizeHumanReadable}. In this case, he upload must be done manually.`,
        large: `Click again if the total size of your trajectory files is smaller than ${$globals.maxUploadTrjSizeHumanReadable}.`
      }
    },
    trajName: {
      label: 'Trajectory name',
      tooltip: 'Click on the field for adding a new trajectory name.'
    },
  }

  const form = ref(false)
  const fields = reactive({
    top: null,
    traj: null,
    type: 'small'
  })
  const isFormValid = computed(() => {
    return (
      fields.top && 
      (fields.type === 'large' && trajNames.value.every(name => name !== '' && name !== null && validExtension(name)) || 
        (fields.traj && 
        fields.traj.length && 
        fields.traj.reduce((acc, file) => acc + file.size, 0) < $globals.maxUploadTrjSize)
      )
    )
  })
  const trjDisabled = computed(() => fields.type === 'large')
  const trajNames = ref([''])
  const progress = ref(0)

  const emit = defineEmits(['endFormUpload', 'endUploadFiles']);

  const rules = {
    top: [
      v => !!v || 'Please add a topology file'
    ],
    traj: [
      v => !v || !v.length || v.reduce((acc, file) => acc + file.size, 0) < $globals.maxUploadTrjSize || `Total trajectories size should be less than ${$globals.maxUploadTrjSizeHumanReadable}! For uploading more than this size, please click the button below.`
    ],
    trjNames: [
      v => !!v || 'Field is required',
      v => validExtension(v) || `Please add a valid trajectory name with one of the following extensions: ${$globals.trajFormats.join(', ')}`
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

  const validExtension = (value) => {
    if (!value) return false;
    const extension = value.slice(value.lastIndexOf('.'));
    return $globals.trajFormats.includes(extension);
  }

  const createNewField = (index) => {
    if (trajNames.value[index] && validExtension(trajNames.value[index])) {
      // Add a new empty field
      trajNames.value.push('');
    }
  }

  const removeField = (index) => {
    if (index > 0) {
      // Remove the field
      trajNames.value.splice(index, 1);
    }
  }

  const sendToREST = async () => {

    const formData = new FormData()
    formData.append('top', fields.top)
    if(fields.traj) fields.traj.forEach(file => formData.append('traj', file))

    // Create JSON with metadata
    const metadata = getMetadata()
    metadata.trjType = fields.type
    if(fields.type === 'large') metadata.trajNames = trajNames.value
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