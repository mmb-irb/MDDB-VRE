<template>
	<div style="position: relative;">
    <div id="loader-viewer" class="d-flex justify-center align-center" v-if="loading">
      <v-progress-circular
        :width="5"
        :size="80"
        color="purple-lighten-3"
        indeterminate
      ></v-progress-circular>
    </div>
    <div id="selectors" class="px-2" v-if="!loading">
      <v-row>
        <v-col cols="6">
          <!-- TODO WITH PROPER VALUES AND REDO REPRESENTATIONS!! -->
          <v-select
            v-model="representation"
            label="Representation"
            :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
            variant="underlined"
          ></v-select>
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="color"
            label="Color"
            :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
            variant="underlined"
          ></v-select>
        </v-col>
      </v-row>
    </div>
    <div id="viewport"></div>
    <LegendViewer v-model="legendText" position="tr" v-if="legend" />
  </div>
</template>

<script setup>

  import useStage from '@/modules/ngl/useStage'
  import mouseObserver from '@/modules/ngl/mouseObserver'
  import useIndexedDB from '@/modules/helpers/useIndexedDB'
  
  const { createStage, createSelection } = useStage()
  const { checkMouseSignals } = mouseObserver()
  const { getFile } = useIndexedDB()

  const { $waitFor } = useNuxtApp()

  let stage = null
  let fileID = null
  onMounted(async () => {
    stage = createStage("viewport")
		stage.setParameters({ backgroundColor: '#dedede' });

    await $waitFor(() => fileID )

    const file = await getFile(fileID)
    const blob = new Blob([file.content], { type: "text/plain" });

    stage.loadFile(blob, { defaultRepresentation: false, ext: 'pdb'})
      .then(async function (component) {
				component.addRepresentation("licorice", { sele: "*", color: 'sstruc' });
				component.autoView('*');

				setTimeout(async () => {
					stage.viewer.handleResize()
					loading.value = false
				}, 500)
      })

    const updateLegend = (v, s) => {
			legendText.value = v
			legend.value = s
		}

    checkMouseSignals(stage, updateLegend)

    window.addEventListener("resize", () => stage.viewer.handleResize())

  })

  onBeforeUnmount(() => {
    if (stage) stage.dispose()
    fileID = null
  })

  const loading = ref(true)
  const legend = ref(false)
	const legendText = ref('')

  const representation = ref('California')
  const color = ref('Georgia')

  const setID = async (id) => fileID = id

  const getSelection = () => {
    return 'MOCK SELECTION'
  }

  defineExpose({
		setID,
    getSelection
	});

</script>

<style scoped>
  #selectors { position: absolute; bottom: 0; left: 0; z-index: 2; width:100%; background-color: rgba(255, 255, 255, 0.75); }
  #loader-viewer { position: absolute; top: 0; left: 0; background: #dedede; width: 100%; height: 400px; z-index: 1;}
  #viewport { width: 100%; height: 400px; background-color: #dedede; }
</style>
