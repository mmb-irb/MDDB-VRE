<template>
  <v-select
    :label="chains.length === 0 ? 'Loading...' : (chains.length <= 1 ? `Single chain structure [:${chains[0]}]` : 'Chains')"
    v-model="modelChains"
    :items="chains"
    multiple
    :disabled="!enabled || chains.length <= 1"
    density="compact"
    @update:model-value="changeRepresentation"
  ></v-select>
  <p class="supralabel">Custom selection. If you need help with <strong>NGL Viewer selection language</strong>, <a href="https://nglviewer.org/ngl/api/manual/usage/selection-language.html" target="_blank">please click here</a>.</p>
  <v-textarea
    v-model="modelSelection"
    label="NGL selection"
    clearable
    @update:modelValue="setSelection"
    @click:clear="modelChains = []"
    :disabled="!enabled"
    rows="16"
    no-resize
  />
</template>

<script setup>

  const emit = defineEmits(['setSelection'])

  const modelSelection = ref('')
  const modelChains = ref([])
  const chains = ref([])
  const enabled = ref(false)

  const setSelection = (value) => {
    modelSelection.value = value
    emit('setSelection', value)
  }

  const setEnabled = (value) => {
    enabled.value = value
  }

  const setChains = (cs) => {
    chains.value = cs
  }

  const removeRepeatedInSelection = (selection) => {
    const tokens = selection.split(' or ');
    const uniqueTokens = Array.from(new Set(tokens));
    return uniqueTokens.join(' or ');
  };

  const changeRepresentation = () => {
    if (modelSelection.value && modelSelection.value.trim() !== '') {
      // Split the current selection into individual tokens
      const currentSelectionTokens = modelSelection.value.split(' or ');

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
      const combinedSelection = [...filteredSelectionTokens, ...newChains].join(' or ');

      // Remove any repeated terms and set the new selection
      const newSel = removeRepeatedInSelection(combinedSelection);
      setSelection(newSel);
      return;
    }

    // If modelSelection is empty, just set the selection to the current modelChains
    const chsel = modelChains.value.map(c => `:${c}`).join(' or ');
    setSelection(chsel);
  };

  defineExpose({
    setSelection,
    setEnabled,
    setChains
  })

</script>

<style scoped>
  .supralabel { font-size: 13px; }
</style>
