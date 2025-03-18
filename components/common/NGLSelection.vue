<template>
  <v-row>
    <v-col md="6" cols="12" sm="12" >
      <v-select
        :label="chains.length === 0 ? 'Loading...' : (chains.length <= 1 ? `Single chain structure [:${chains[0]}]` : 'Chains')"
        v-model="modelChains"
        :items="chains"
        multiple
        :disabled="!enabled || chains.length <= 1"
        density="compact"
        @update:model-value="changeRepresentationChains"
      ></v-select>
    </v-col>
    <v-col md="6" cols="12" sm="12" >
      <v-select
        label="Predefined selections"
        v-model="modelPredefSels"
        :items="predefSels"
        item-title="name"
        item-value="id"
        multiple
        density="compact"
        @update:model-value="changeRepresentationPdfSel"
      >
        <template v-slot:selection="{ item, index }">
          <!-- Display the first two selected items -->
          <span v-if="index < 2">
            {{ item.title }}
            {{ index < modelPredefSels.length - 1 && index < 1 ? ', ' : '' }}
          </span>
          <span
            v-if="index === 2"
            class="text-grey text-caption align-self-center"
          >
            (+{{ modelPredefSels.length - 2 }} others)
          </span>
        </template>
      </v-select>
    </v-col>
  </v-row>  
  <v-select
    :label="residues.length === 0 ? 'Loading...' : 'Residues'"
    v-model="modelResidues"
    :items="residues"
    multiple
    :disabled="!enabled || residues.length <= 1"
    density="compact"
    @update:model-value="changeRepresentationRes"
  ></v-select>
  <v-card
    variant="tonal"
    color="grey-darken-1"
  >
    <v-card-text class="pl-2 py-1 pr-0">
      <div id="container-residues" style="word-break: break-all;line-height: 35px;
        word-break: break-all;
        overflow-y: auto; 
        overflow-x: hidden; 
        max-height:15rem;">
        <div class="chain-sequence margin-bottom-10" v-for="(chain, i) in strObj" :key="i">
          <div class="chain-title margin-bottom-10" v-if="chain.residues.length > 0">Chain {{ chain.chain }}</div>
          <!--<Residue 
            v-for="(item, index) in chain.residues" 
            :key="index" 
            :residue="item" 
            :index="index" 
            :sheets="modelSheets" 
            :helixes="modelHelixes" 
            :window="false"
            :stage="stage" />-->
          <residue
            v-for="(residue, j) in chain.residues" 
            :index="j"
            :residue="residue"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
  <p class="supralabel mt-2">Custom selection. If you need help with <strong>NGL Viewer selection language</strong>, <a href="https://nglviewer.org/ngl/api/manual/usage/selection-language.html" target="_blank">please click here</a>.</p>
  <v-textarea
    v-model="modelSelection"
    label="NGL selection"
    clearable
    @update:modelValue="setSelection"
    @click:clear="modelChains = []; modelResidues = []; modelPredefSels = []"
    :disabled="!enabled"
    rows="7"
    no-resize
  />
</template>

<script setup>

  const emit = defineEmits(['setSelection'])
  const { $globals, $eventBus } = useNuxtApp();

  const modelSelection = ref('')
  const modelChains = ref([])
  const modelResidues = ref([])
  const modelPredefSels = ref([])
  const chains = ref([])
  const residues = ref([])
  const strObj = ref({})
  const enabled = ref(false)
  const predefSels = $globals.ngl.predefinedSelections

  onMounted(() => {
    $eventBus.on('nglReady', setEnabled)
    $eventBus.on('chainsList', setChains)
    $eventBus.on('residuesList', setResidues)
    $eventBus.on('strObj', setStructureObject)
  });

  onUnmounted(() => {
    $eventBus.off('nglReady', setEnabled)
    $eventBus.off('chainsList', setChains)
    $eventBus.off('residuesList', setResidues)
    $eventBus.off('strObj', setStructureObject)
  });

  const splitSelection = (selection) => {
    let tokens;
    if (selection.includes('or')) {
      tokens = selection.split(/\s*or\s*/);
    } else {
      tokens = selection.split(/\s+/);
    }
    return tokens;
  }

  const setSelection = (value) => {
    modelSelection.value = value
    emit('setSelection', value)

    if(modelSelection.value) {
      // update modelChains based on the current modelSelection
      const currentSelectionTokens = splitSelection(modelSelection.value)

      // Filter out chain-specific tokens
      const filteredSelectionTokensCh = currentSelectionTokens
      .filter(token => token.startsWith(':'))
      .map(token => token.replace(/:+/g, ''));
      // Update modelChains
      modelChains.value = filteredSelectionTokensCh

      // Filter out predef-specific tokens
      const filteredSelectionTokensPdf = currentSelectionTokens
      .filter(token => predefSels.some(item => item.id === token))
      .map(token => token.replace(/:+/g, ''));
      // Update modelChains
      modelPredefSels.value = filteredSelectionTokensPdf

      // Filter out residue-specific tokens
      const filteredSelectionTokensRes = currentSelectionTokens
      .filter(token => token.match(/^[\-A-Za-z0-9]{1,3}:[A-Za-z]$/))
      // Update modelResidues
      modelResidues.value = filteredSelectionTokensRes
    } else {
      // If the selection is empty, reset the modelChains, modelPredefSels, and modelResidues
      modelChains.value = []
      modelPredefSels.value = []
      modelResidues.value = []
    }
  }

  const setEnabled = (value) => {
    enabled.value = value
  }

  const setChains = (cs) => {
    chains.value = cs
  }

  const setResidues = (rs) => {
    residues.value = rs
  }

  const setStructureObject = (obj) => {
    strObj.value = obj
    console.log(strObj.value)
  }

  const removeRepeatedInSelection = (selection) => {
    const tokens = splitSelection(selection)
    const uniqueTokens = Array.from(new Set(tokens));
    return uniqueTokens.join(' ');
  };

  const changeRepresentationChains = () => {
    if (modelSelection.value && modelSelection.value.trim() !== '') {
      // Split the current selection into individual tokens
      const currentSelectionTokens = splitSelection(modelSelection.value)

      // Filter out chain-specific tokens that are no longer in modelChains
      const filteredSelectionTokens = currentSelectionTokens.filter(token => {
        // Check if the token is a chain-specific term (e.g., :J, :C)
        if (token.startsWith(':')) {
          const chain = token.slice(1); // Remove the ':' prefix to get the chain ID
          return modelChains.value.includes(chain); // Keep only if the chain is still in modelChains
        }
        // Keep non-chain terms (e.g., 73, 50)
        return true;
      });

      // Add new chains from modelChains that are not already in the selection
      const newChains = modelChains.value
        .filter(chain => !currentSelectionTokens.includes(`:${chain}`))
        .map(chain => `:${chain}`);

      // Combine the filtered selection and new chains
      const combinedSelection = [...filteredSelectionTokens, ...newChains].join(' ');

      // Remove any repeated terms and set the new selection
      const newSel = removeRepeatedInSelection(combinedSelection);
      setSelection(newSel);
      return;
    }

    // If modelSelection is empty, just set the selection to the current modelChains
    const chsel = modelChains.value.map(c => `:${c}`).join(' ');
    setSelection(chsel);
  };

  const changeRepresentationPdfSel = () => {

    if (modelSelection.value && modelSelection.value.trim() !== '') {
      // Split the current selection into individual tokens
      const currentSelectionTokens = splitSelection(modelSelection.value)

      // Filter out predefined-specific tokens that are no longer in modelPredefSels
      const filteredSelectionTokens = currentSelectionTokens.filter(token => {
        // Check if the token is a predefined-specific term (e.g., helix, sheet)
        if (predefSels.some(item => item.id === token)) {
          return modelPredefSels.value.includes(token); // Keep only if the predefined selection is still in modelPredefSels
        }
        // Keep non-predefined terms (e.g., :A, 1:45)
        return true;
      });

      // Add new predefined selections from modelPredefSels that are not already in the selection
      const newSelections = modelPredefSels.value
        .filter(selection => !currentSelectionTokens.includes(selection))
        .map(selection => `${selection}`);

      // Combine the filtered selection and new predefined selections
      const combinedSelection = [...filteredSelectionTokens, ...newSelections].join(' ');

      // Remove any repeated terms and set the new selection
      const newSel = removeRepeatedInSelection(combinedSelection);
      setSelection(newSel);
      return;
    }

    // If modelSelection is empty, just set the selection to the current modelPredefSels
    const resel = modelPredefSels.value.map(c => `${c}`).join(' ');
    setSelection(resel);
  };

  const changeRepresentationRes = () => {

    if (modelSelection.value && modelSelection.value.trim() !== '') {
      // Split the current selection into individual tokens
      const currentSelectionTokens = splitSelection(modelSelection.value)

      // Filter out residue-specific tokens that are no longer in modelResidues
      const filteredSelectionTokens = currentSelectionTokens.filter(token => {
        // Check if the token is a residue-specific term (e.g., 1:J, -73:C)
        if (token.match(/^[\-A-Za-z0-9]{1,3}:[A-Za-z]$/)) {
          return modelResidues.value.includes(token); // Keep only if the residue is still in modelResidues
        }
        // Keep non-residue terms (e.g., :A, sheet)
        return true;
      });

      // Add new residues from modelResidues that are not already in the selection
      const newResidues = modelResidues.value
        .filter(residue => !currentSelectionTokens.includes(residue))
        .map(residue => `${residue}`);

      // Combine the filtered selection and new residues
      const combinedSelection = [...filteredSelectionTokens, ...newResidues].join(' ');

      // Remove any repeated terms and set the new selection
      const newSel = removeRepeatedInSelection(combinedSelection);
      setSelection(newSel);
      return;
    }

    // If modelSelection is empty, just set the selection to the current modelResidues
    const resel = modelResidues.value.map(c => `${c}`).join(' ');
    setSelection(resel);
  };

  defineExpose({
    setSelection,
    setEnabled,
    setChains
  })

</script>

<style scoped>
  .supralabel { font-size: 13px; }
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    /*max-width: v-bind(truncateWidth);  */
    max-width: 100%;
  }
  #container-residues {
    height: 145px;
    overflow-y: auto;
  }
  .chain-sequence {
    border-bottom: solid 1px #d1d1d1;
    padding-bottom: .5rem;
  }
  .chain-title {
    font-family: 'Open Sans';
    border-bottom: solid 1px #555;
    padding-left: .5rem;
    line-height: 25px;
    margin-bottom: .5rem;
  }
</style>
