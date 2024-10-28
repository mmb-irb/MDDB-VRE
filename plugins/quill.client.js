// plugins/quill.client.js
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('Quill', Quill);
});
