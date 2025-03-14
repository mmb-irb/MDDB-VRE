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
          <v-select
            v-model="representation"
            label="Representation"
            :items="representations"
            item-title="name"
            item-value="id"
            variant="underlined"
            @update:model-value="changeRepresentation"
          ></v-select>
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="color"
            label="Color"
            :items="colors"
            item-title="name"
            item-value="id"
            variant="underlined"
            @update:model-value="changeColor"
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
  import utilsNGL from '@/modules/ngl/utils'

  const { createStage, createSelection } = useStage()
  const { checkMouseSignals } = mouseObserver()
  const { getFile } = useIndexedDB()
  const { getChainsList, getResiduesList, getListOfResiduesFromSelection } = utilsNGL()

  const { $globals, $waitFor, $eventBus } = useNuxtApp()

  let stage = null
  let fileID = null
  let struct = null
  let viewer = null
  onMounted(async () => {
    stage = createStage("viewport")
		stage.setParameters({ backgroundColor: '#dedede' });

    await $waitFor(() => fileID )

    const file = await getFile(fileID)
    const blob = new Blob([file.content], { type: "text/plain" });

    stage.loadFile(blob, { defaultRepresentation: false, ext: 'pdb'})
      .then(async function (component) {
        viewer = component
				struct = component.addRepresentation("licorice", { sele: "*", color: 'sstruc' });
				component.autoView('*');

        //console.log(component.structure)

        const chains = getChainsList(component.structure)
        $eventBus.emit('chainsList', chains)

        const residues = getResiduesList(component.structure)
        $eventBus.emit('residuesList', residues)

				setTimeout(async () => {
					stage.viewer.handleResize()
					loading.value = false
          $eventBus.emit('nglReady', true);
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

  const representations = reactive($globals.ngl.representations)
  const colors = reactive($globals.ngl.colors)
  const representation = ref($globals.ngl.defaultRepresentation)
  const color = ref($globals.ngl.defaultColor)

  const setID = async (id) => fileID = id

  const changeColor = (v) => {
    struct.setColor(v)
  }

  const changeRepresentation = (v) => {
    viewer.removeRepresentation(struct);
    struct = viewer.addRepresentation( v, { sele: "*", color: color.value } );
  }

  let reprSel = null
  const setSelection = async (s) => {
    await $waitFor(() => viewer )
    if(reprSel) viewer.removeRepresentation(reprSel);
    if(s != '' && s != undefined) reprSel = viewer.addRepresentation( 'spacefill', { sele: s, color: '#7917a3', opacity: .4 } );
  }

  // Example function to convert a selection string (e.g. ':A' or 'backbone') into a list of residues
  const getResiduesFromSelection = (selectionString) => {
    const structure = stage.compList[0].structure
    let selection = createSelection(selectionString)

    const residueList = getListOfResiduesFromSelection(structure, selection)
    return residueList
  };

  defineExpose({
		setID,
    setSelection,
    getResiduesFromSelection
	});

</script>

<style scoped>
  #selectors { position: absolute; bottom: -1rem; left: 0; z-index: 2; width:100%; background-color: rgba(255, 255, 255, 0.75); }
  #loader-viewer { position: absolute; top: 0; left: 0; background: #dedede; width: 100%; height: 535px; z-index: 1;}
  #viewport { width: 100%; height: 535px; background-color: #dedede; }
</style>
