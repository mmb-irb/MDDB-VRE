<template>
  <v-container>

    <h1>Welcome to {{ $globals.shortName }}</h1>

    <v-row> 
      <v-col cols="12" >
        <!-- INTRO -->
        <v-card>
          <template v-slot:title>
            <v-icon size="small" icon="mdi-button-pointer"></v-icon>&nbsp;
            <span class="font-weight-black">Select method to create metadata </span>
          </template>

          <v-card-text class="py-5">
            <p>The aim of this website is to <strong>generate</strong> the <strong>metadata</strong> needed for <strong>analysing the trajectories</strong> provided by the user. The website provides <strong>a form</strong> for this purpose. Although, there are <strong>two ways</strong> to generate this metadata: </p>
            <ul class="ml-5">
              <li><strong>Upload</strong> a previously generated <strong>metadata</strong> file compatible with <strong>{{ $globals.shortName }}</strong>. The form will be <strong>automatically filled</strong> with the provided data and can be modified <strong>before</strong> uploading <strong>topology</strong> and <strong>trajectory/ies</strong>.</li>
              <!--<li><strong>Upload</strong> a <strong>topology</strong> file and then fill the metadata in the form. The topology file will be used in the form.</li>-->
              <li>Use the <strong>form</strong> to generate the metadata <strong>from scratch</strong>.</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row> 
      <v-col lg="6" md="6" sm="12" class="d-flex **flex-column">
        <!-- UPLOAD METADATA -->
        <v-sheet
          class="pa-4 text-center mx-auto **flex-grow-1"
          elevation="2"
          rounded
          width="100%"
        >
          <v-icon
            class="mb-5"
            color="purple-accent-1"
            icon="mdi-file-upload"
            size="80"
          ></v-icon>

          <h2 class="text-h5 mb-6">{{ texts.upMeta.title }}</h2>

          <p class="mb-4 text-medium-emphasis text-body-2">
            This file must follow the <strong>{{ $globals.shortName }}</strong> metadata format.<br><a href="#" @click.prevent="downloadSampleYAML">Click here to download a sample file</a>.
          </p>

          <v-divider class="mb-4"></v-divider>

          <div class="text-end">
            <v-file-input 
              v-model="metaFile"
              :accept="texts.upMeta.formats"
              :label="texts.upMeta.label"
              :rules="rules.upMeta"
              prepend-icon="mdi-file-code-outline"
              class="mt-5"
            >
            <template v-slot:append>
              <v-btn density="comfortable" icon="mdi-upload" color="purple-accent-4" @click="uploadMetaFile" :disabled="metaDisabled"></v-btn>
            </template>
            </v-file-input>
          </div>
        </v-sheet>
      </v-col>
      <v-col lg="6" md="6" sm="12" cols="12" class="d-flex">
        <!-- START FORM -->
        <v-sheet
          class="pa-4 text-center mx-auto"
          elevation="2"
          rounded
          width="100%"
        >
          <span class="material-icons icon-stack">
            <v-icon
              color="purple-accent-1"
              icon="mdi-circle-outline"
              class="icon-back"
            ></v-icon>
            <v-icon
              color="purple-accent-1"
              icon="mdi-account-edit"
              class="icon-front"
            ></v-icon>
          </span>

          <h2 class="text-h5 mb-6">{{ texts.start.title }}</h2>

          <p class="mb-4 text-medium-emphasis text-body-2" v-html="texts.start.text"></p>

          <v-divider class="mb-4"></v-divider>

          <div class="text-end">
            <v-btn color="purple-accent-4" size="x-large" variant="flat" to="/upload" >
              <v-icon size="large" icon="mdi-chevron-right"></v-icon>
              {{ texts.start.label }}
            </v-btn>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row> 
      <v-col cols="12" >
        <!-- SCHEMA -->
        <v-card>
          <template v-slot:title>
            <v-icon size="small" icon="mdi-sitemap-outline"></v-icon>&nbsp;
            <span class="font-weight-black">{{ $globals.shortName }} operating schema </span>
          </template>

          <v-card-text class="py-5">
            <p style="text-align: center;"><img src="/img/schema.png" alt="Schema" class="img-schema" /></p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-container>

  <Dialog v-model="dialog" ref="dialogRef"></Dialog>

</template>
  
<script setup>

  import YAML from 'yaml'
  import structureStorage from '@/modules/structure/structureStorage'
  import validateYAML from '@/modules/structure/validateYAML'

  const { $globals } = useNuxtApp()
  const { setMetadata, cleanMetadata } = structureStorage()
  const { validate } = validateYAML()

  const dialog = ref(false)
  const metaFile = ref(null)
  const parsedYaml = ref(null)

  const metaDisabled = computed(() => !metaFile.value)

  cleanMetadata()

  useHead({
    title: 'Home'
  })

  const texts = {
    upMeta: {
      title: 'Upload metadata file',
      formats: $globals.metaFormats.toString(),
      label: 'Metadata file'
    },
    start: {
      title: 'Create metadata from scratch',
      text: 'Clicking <strong>Start</strong> will launch the form for generating the <strong>metadata from scratch</strong>.',
      label: 'Start'
    }
  }

  const rules = {
    upMeta: [
      v => !!v || 'Please add a metadata file'
    ]
  }

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  const uploadMetaFile = async () => {
    if (!metaFile.value) return

    try {
      // parse YAML
      const content = await readFileAsText(metaFile.value)
      parsedYaml.value = YAML.parse(content)
      const check = validate(content)
      // check if valid
      if(!check.isValid) {
        //console.error('Error parsing YAML:', check.errors)
        metaFile.value = null
        openDialog('Error parsing YAML', `Parameter <strong>${check.errors[0].instancePath}</strong> ${check.errors[0].message}`, 'error')
        return
      }
      // store and go to upload page
      Object.keys(parsedYaml.value).forEach(key => {
        setMetadata(key, parsedYaml.value[key])
      })
      navigateTo('/upload')
    } catch (err) {
      console.error('Error parsing YAML:', err)
    }

  }

  const downloadSampleYAML = async() => {
    const sampleUrl = new URL('@/assets/settings/inputs.yaml', import.meta.url)
    try {
      const resp = await fetch(sampleUrl)
      const fileContent = await resp.text()
      const sampleData = YAML.parse(fileContent)
      const blob = new Blob([YAML.stringify(sampleData, null, 2)], {type : 'application/yaml'});
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'sample.yaml';
      document.body.appendChild(a);
      a.click();    
      a.remove();
    } catch (err) {
      console.error('Error fetching/parsing YAML:', err)
    }
  }

  const dialogRef = ref(null)
  const openDialog = (tit, txt, type) => {
    dialogRef.value.updateContent(tit, txt, type)
    dialog.value = true
  }

</script>

<style scoped>
  h1 { margin-bottom: 1rem; }
  .text-end {
    margin-top: auto;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content:center;
  }
  .text-body-2 { min-height:40px; }
  .img-schema { max-width: 100%; }
  .icon-stack {
    position: relative;
    display: inline-block;
    margin-bottom: 20px;
  }

  .icon-back {
    font-size: 80px;
  }

  .icon-front {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 50px;
  }
</style>