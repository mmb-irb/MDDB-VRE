<template>
  <p>Follow and <strong>execute in terminal</strong> the instructions below for uploading your trajectory file(s) <a href="https://min.io/docs/minio/linux/reference/minio-mc.html#install-mc" target="_blank" class="font-weight-black">via MinIO Client (mc)</a>. The <strong>credentials are temporary</strong> and they will <strong>expire in {{ $globals.curl_expire }}</strong>.</p>

  <p>First off, <strong>create an mc alias</strong> with the new <strong>temporary credentials</strong> generated for uploading files to the <strong>{{ bucket }} bucket</strong>.</p>
  <v-textarea
    class="my-2"
    append-inner-icon="mdi-content-copy"
    @click:append-inner="copyCode('mc', 'alias')"
    label="mc alias"
    v-model="codes.alias"
    rows="1"
    auto-grow
    readonly
    hide-details="auto"
  />
  <p class="mt-4"><strong>Upload single file:</strong> be aware to <strong>replace /path/to/file</strong> by the <strong>local path</strong> of the file in your computer and <strong>filename</strong> by the <strong>name of the file</strong>.</p>
  <v-textarea
    class="my-2"
    append-inner-icon="mdi-content-copy"
    @click:append-inner="copyCode('mc', 'file')"
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
    @click:append-inner="copyCode('mc', 'files')"
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
    @click:append-inner="copyCode('mc', 'folder')"
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
  const { $globals } = useNuxtApp()

  const copyCode = (type, code) => {
    emit('copyCode', type, code)
  }
</script>

<style scoped></style>