<template>
  <v-container>

    <h1>Upload data to {{ $globals.shortName }}</h1>

    <v-row> 
      <v-col cols="12" >
        <v-stepper alt-labels :items="steps" hide-actions :model-value="step">
          <template v-slot:item.1>
            <v-card>
              <template v-slot:title>
                <v-icon size="small" icon="mdi-list-box-outline"></v-icon>&nbsp;
                <span class="font-weight-black">Upload metadata</span>
              </template>

              <v-card-text>
                <metadata-form1 @endFormMeta="handleEndFormMeta" />
              </v-card-text>
            </v-card>
          </template>

          <template v-slot:item.2>
            <v-card>
              <template v-slot:title>
                <v-icon size="small" icon="mdi-cloud-upload-outline"></v-icon>&nbsp;
                <span class="font-weight-black">Upload data</span>
              </template>

              <v-card-text>
                <upload-data @endFormMeta="handleEndFormMeta" />
              </v-card-text>
            </v-card>
          </template>

          <template v-slot:item.3>
            <v-card>
              <template v-slot:title>
                <v-icon size="small" icon="mdi-thumb-up-outline"></v-icon>&nbsp;
                <span class="font-weight-black">Process finished</span>
              </template>

              <v-card-text>
                2 possible components: ok, everything is up or return the keyphrase for completing the data upload!
              </v-card-text>
            </v-card>
          </template>

          <v-stepper-actions
            :disabled="false"
            color="purple-accent-2"
            :next-text="step>2?'finish':'next'"
            :prev-text="step>1?'back':''"
            @click:next="step=step+1"
            @click:prev="step=step-1"
          ></v-stepper-actions>

        </v-stepper>
      </v-col>
    </v-row>

  </v-container>

</template>
  
<script setup>

  const { $globals } = useNuxtApp()

  useHead({
    title: 'Upload data' 
  })

  const steps = ['Metadata', 'Data', 'Finish']
  const step = ref(1)
  const status = ref([null, false, false, false])

  let buttons, backButton, nextButton
  onMounted(async () => {
    // Select the div with class "v-stepper-actions"
    const stepperActionsDiv = document.querySelector('.v-stepper-actions');

    // Get all buttons inside the selected div
    buttons = stepperActionsDiv.querySelectorAll('button')

    // Access the first and second buttons
    backButton = buttons[0]
    nextButton = buttons[1]
    backButton.style.visibility = 'hidden'
    nextButton.disabled = true
    nextButton.classList.add('v-btn--disabled')
  })

  // handles the end of the metadata form
  const handleEndFormMeta = (v) => {
    nextButton.disabled = !v
    status.value[step.value] = v
    v ? nextButton.classList.remove('v-btn--disabled') : nextButton.classList.add('v-btn--disabled')
  }

  // shows or hides the back and next buttons based on the current step
  watch(step, (ns, os) => {

    // hide back button on first step
    if(ns === 1) backButton.style.visibility = 'hidden'
    else backButton.style.visibility = 'visible'

    // hide next button on last step
    if(ns === 3) nextButton.style.visibility = 'hidden'
    else nextButton.style.visibility = 'visible'

    // enable or disable next button based on the status of the current step
    if(ns !== os) {
      nextButton.disabled = !status.value[step.value]
      status.value[step.value] ? nextButton.classList.remove('v-btn--disabled') : nextButton.classList.add('v-btn--disabled')
    } 

  })

</script>


<style scoped>
  h1 { margin-bottom: 1rem; }
</style>