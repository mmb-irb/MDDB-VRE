<template>
  <v-container>

    <h1>Upload data to {{ $globals.shortName }}</h1>

    <v-row> 
      <v-col cols="12" >
        <v-stepper alt-labels :items="['Metadata', 'Data', 'Finish']" hide-actions>
          <template v-slot:item.1>
            <v-card>
              <template v-slot:title>
                <v-icon size="small" icon="mdi-list-box-outline"></v-icon>&nbsp;
                <span class="font-weight-black">Upload metadata</span>
              </template>

              <v-card-text>
                component form meta
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
                component form upload files
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
          :disabled="true"
          :next-text="step>1?'finish':'next'"
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

</script>


<style scoped>
  h1 { margin-bottom: 1rem; }
</style>