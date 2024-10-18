<template>
  <p><strong>Copy the text below</strong> and <strong>execute it in terminal</strong> for uploading your trajectory file(s) <a href="https://curl.se/" target="_blank" class="font-weight-black">via curl</a>. Be aware to <strong>replace trajectory.file</strong> by the <strong>name</strong> of the trajectory file(s) to upload and <strong>&lt;FILE&gt;</strong> by the <strong>local path</strong> of the file(s) in your computer. The credentials will <strong>expire</strong> in <strong>{{ $globals.curl_expire }}</strong>.</p>
    
  <p>Due to its limitations, <strong>curl doesn't allow to upload folders and/or multiple files</strong>. For this operation, please <strong>repeat</strong> the instruction below or use any of the <strong>other methods</strong> in this same section.</p>
  <v-textarea
    class="my-2"
    append-inner-icon="mdi-content-copy"
    @click:append-inner="copyCode('curl', 'code')"
    v-model="codes.code"
    auto-grow
    readonly
    hide-details="auto"
  />
</template>

<script setup>
  const { codes } = defineProps(['codes'])
  const { $globals } = useNuxtApp()

  const emit = defineEmits(['copyCode']);

  const copyCode = (type, code) => {
    emit('copyCode', type, code)
  }
</script>

<style scoped></style>