<template>
  <p><strong>Copy the text below</strong> and use it for creating a new <strong>shell script</strong> (ie named curl.sh) for uploading your trajectory file(s) <a href="https://curl.se/" target="_blank" class="font-weight-black">via curl</a>. Once created, <strong>open a terminal console</strong>, change the file permissions to executable and execute it:</p>
    
  <p>
    <code>chmod +x curl.sh</code><br>
    <code>./curl.sh /path/to/file1 filename1 /path/to/file2 filename2 ...</code>
  </p>

  <p>The credentials used <strong>are temporary</strong> and they will <strong>expire in {{ $globals.curl_expire }}</strong>. Due to its limitations, <strong>curl doesn't allow to upload folders</strong>. So for uploading <strong>multiple files</strong>, please pass them to the shell script <strong>one after the other</strong>. For uploading an entire folder, the <strong>other methods</strong> in this same section can be used in a more confortable way. </p>

  <v-textarea
    class="my-2"
    append-inner-icon="mdi-content-copy"
    @click:append-inner="copyCode('curl', 'code')"
    v-model="codes.code"
    rows="15"
    no-resize
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