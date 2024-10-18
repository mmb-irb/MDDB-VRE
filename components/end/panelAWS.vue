<template>
  <p>Follow and <strong>execute in terminal</strong> the instructions below for uploading your trajectory file(s) <a href="https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" target="_blank" class="font-weight-black">via Amazon Web Services Command Line Interface (AWS CLI)</a>.</p>

  <p class="mt-4"><strong>Upload single file:</strong> be aware to <strong>replace /path/to/file</strong> by the <strong>local path</strong> of the file in your computer.</p>
  <v-textarea
    class="my-2"
    append-inner-icon="mdi-content-copy"
    @click:append-inner="copyCode('aws', 'file')"
    label="single file"
    v-model="codes.file"
    rows="1"
    auto-grow
    readonly
    hide-details="auto"
  />
  <p class="mt-4"><strong>Upload multiple files from a folder:</strong> be aware to <strong>replace /path/to/folder</strong> by the <strong>local path</strong> of the folder in your computer.</p>
  <v-textarea
    class="my-2"
    append-inner-icon="mdi-content-copy"
    @click:append-inner="copyCode('aws', 'files')"
    label="multiple files"
    v-model="codes.files"
    rows="1"
    auto-grow
    readonly
    hide-details="auto"
  />
  <p class="mt-4"><strong>Upload folder:</strong> be aware to <strong>replace /path/to/folder</strong> by the <strong>local path</strong> of the folder in your computer. The name of the <strong>folder inside the {{ bucket }} bucket</strong> can be modified as well.</p>
  <v-textarea
    class="my-2"
    append-inner-icon="mdi-content-copy"
    @click:append-inner="copyCode('aws', 'folder')"
    label="folder"
    v-model="codes.folder"
    rows="1"
    auto-grow
    readonly
    hide-details="auto"
  />
</template>

<script setup>
  const { codes, bucket } = defineProps(['codes', 'bucket'])

  const emit = defineEmits(['copyCode']);

  const copyCode = (type, code) => {
    emit('copyCode', type, code)
  }
</script>

<style scoped></style>