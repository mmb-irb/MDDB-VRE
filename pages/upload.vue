<template>
  <v-container>

    <h1>Upload data to {{ $globals.shortName }}</h1>

    <v-row> 
      <v-col cols="12" >
        <v-stepper alt-labels :items="steps" hide-actions :model-value="step">
          <template v-for="(item, index) in formData" :key="index" v-slot:[`item.${parseInt(index)+1}`]>
            <v-card>
              <template v-slot:title>
                <v-icon size="small" :icon="item.icon"></v-icon>&nbsp;
                <span class="font-weight-black">{{ item.name }}</span>
              </template>

              <v-card-text v-for="(dsc, i) in item.description" class="pt-0">
                <p v-html="dsc"></p>
                <metadata-form :fields="item.fields.filter(itm => itm.section === i)" @endFormMeta="handleEndFormMeta" />
              </v-card-text>

              <template v-slot:actions>
                <v-card-actions style="display: flex; justify-content: space-between; width:100%;">
                  <v-btn color="purple-accent-1" variant="outlined" @click="step=step-1" id="prev-btn" v-if="step > 1">
                    <v-icon size="large" icon="mdi-chevron-left"></v-icon>
                    Previous
                  </v-btn>
                  <span v-else>&nbsp;</span>
                  <v-btn color="purple-accent-1" variant="flat" @click="step=step+1" id="next-btn" :disabled="disableNext">
                    <v-icon size="large" icon="mdi-chevron-right"></v-icon>
                    Next
                  </v-btn>
                </v-card-actions>
              </template>
            </v-card>
          </template>

          <template v-slot:[`item.${parseInt(lengthFormData)+1}`]>
            <v-card>
              <template v-slot:title>
                <v-icon size="small" icon="mdi-cloud-upload-outline"></v-icon>&nbsp;
                <span class="font-weight-black">Upload data</span>
              </template>

              <v-card-text>
                <upload-data @endFormUpload="handleEndFormUpload" @endUploadFiles="handleEndUploadFiles" ref="uploadRef" />
              </v-card-text>

              <template v-slot:actions>
                <v-card-actions style="display: flex; justify-content: space-between; width:100%; ">
                  <v-btn color="purple-accent-1" variant="outlined" @click="step=step-1" id="prev-btn">
                    <v-icon size="large" icon="mdi-chevron-left"></v-icon>
                    Previous
                  </v-btn>
                  <v-btn color="purple-accent-1" variant="flat" @click="startUploadData" id="upload-btn" :loading="uploading">
                    <v-icon size="large" icon="mdi-tray-arrow-up"></v-icon>
                    Upload
                  </v-btn>
                </v-card-actions>
              </template>

            </v-card>
          </template>

          <template v-slot:[`item.${parseInt(lengthFormData)+2}`]>
            <v-card>
              <template v-slot:title>
                <v-icon size="small" icon="mdi-thumb-up-outline"></v-icon>&nbsp;
                <span class="font-weight-black">Process finished</span>
              </template>

              <v-card-text>
                <end-process />
              </v-card-text>
            </v-card>
          </template>

        </v-stepper>
      </v-col>
    </v-row>

  </v-container>

</template>
  
<script setup>

  import structureStorage from '@/modules/structure/structureStorage'

  const { storeFData } = structureStorage()

  const config = useRuntimeConfig()
  const { $globals, $axios } = useNuxtApp()

  const conf = await $axios.get(`${config.public.baseURL}form.json`)
  const formData = conf.data
  storeFData(formData)
  const lengthFormData = formData.length

  useHead({
    title: 'Upload data' 
  })

  const steps = [...formData.map(item => item.shortName), ...['Data', 'Finish']]
  const step = ref(1)
  const uploading = ref(false)
  const uploadRef = ref(null)

  let nextButton
  let disableNext = ref(true)
  onMounted(async () => {

    nextButton = document.querySelector('#next-btn')
    nextButton.classList.add('v-btn--disabled')

  })

  // handles if all the mandatory fields of the metadata form are filled
  const handleEndFormMeta = (v) => {
    disableNext.value = !v
    v ? nextButton.classList.remove('v-btn--disabled') : nextButton.classList.add('v-btn--disabled')
  }

  const handleEndFormUpload = (v) => {
    let uploadButton = document.querySelector('#upload-btn')
    uploadButton.disabled = !v
    v ? uploadButton.classList.remove('v-btn--disabled') : uploadButton.classList.add('v-btn--disabled')
  }

  const startUploadData = () => {
    uploading.value = true
    let prevButton = document.querySelector('#prev-btn')
    prevButton.disabled = true
    prevButton.classList.add('v-btn--disabled')
    //console.log('uploading data...')
    uploadRef.value.sendToREST()
  }

  const handleEndUploadFiles = (v) => {
    uploading.value = false
    if(v) {
      //console.log('upload finished!')
      step.value = step.value + 1
    }
  }

</script>


<style scoped>
  h1 { margin-bottom: 1rem; }
</style>