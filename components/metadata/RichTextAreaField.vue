<template>
  <div class="container-area">
    <div class="container-editor">
      <div ref="refModel" class="editor"></div>
    </div>
    <div class="container-tooltip pt-3">
      <form-tooltip :props="{width: 300, text: props.description}" />
    </div>
  </div>
  <div class="v-input__details">
    <div class="v-messages" role="alert" aria-live="polite" id="input-14-messages">
      <div class="v-messages__message custom-rich" style="padding-left: 15px;"></div>
    </div>
  </div>
  <v-text-field
    v-model="refModel2"
    :rules="rules"
    v-show="false"
  ></v-text-field>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'

  const { setMetadata } = structureStorage()
  const { getRules } = useRules()

  const { props } = defineProps(['props'])
  const refModel = ref(null)
  const refModel2 = ref(null)
  if(props.default !== undefined) setMetadata(props.id, refModel.value)
  const required = ref(props.required)
  // TODO
  const rules = ref(props.rules ? getRules(props.rules) : [])

  onMounted(() => {
    const { $Quill } = useNuxtApp();

    // Initialize Quill editor with custom toolbar
    const editor = new $Quill(refModel.value, {
      theme: 'snow',
      placeholder: `${props.label} ${required.value ? '*' : ''}`,
      modules: {
        toolbar: [
          ['bold', 'italic', 'link'],                    // Link option
          ['clean'],                   // Remove all formatting
        ],
      },
    });

    // Set default text if provided
    if (props.default) {
      editor.clipboard.dangerouslyPasteHTML(props.default);
      setMetadata(props.id, editor.root.innerHTML)
      refModel2.value = editor.root.innerText == '\n' || editor.root.innerText == '' ? '' : editor.root.innerText
    }

    editor.on('text-change', () => {
      setMetadata(props.id, editor.root.innerHTML)
      refModel2.value = editor.root.innerText == '\n' || editor.root.innerText == '' ? '' : editor.root.innerText
      if(props.required && refModel2.value == '') {
        document.querySelector(' .container-tooltip').style.opacity = 1
        document.querySelector('.container-tooltip').style.color = 'rgb(var(--v-theme-error))'
        document.querySelector('.container-editor').style.borderBottom = '1px solid rgb(var(--v-theme-error))'
        document.querySelector('.v-messages__message.custom-rich').style.color = 'rgb(var(--v-theme-error))'
        document.querySelector('.v-messages__message.custom-rich').innerText = props.rules.filter(rule => rule.id === 'required')[0].message
      } else {
        document.querySelector('.container-tooltip').style.opacity = .6
        document.querySelector('.container-tooltip').style.color = '#000'
        document.querySelector('.container-editor').style.borderBottom = 'none'
        document.querySelector('.v-messages__message.custom-rich').innerText = ''
      }
    });
  });

</script>

<style>
  .ql-editor.ql-blank::before { font-style: normal!important; font-size:16px!important; }
  .ql-editor.ql-blank { background: #f6f6f6;}
  .ql-tooltip.ql-editing { left:0!important;}

  /** All toolbar buttons are inside of .ql-formats */
  .ql-formats button {
      position: relative;

      /** Set a tooltip with css pseudo-elements, when buttons are hover, active or focus  */
      &:hover::after,
      &:active::after,
      &:focus::after {
          background: #0d1e42;
          color: white;
          padding: 0.5em;
          border-radius: 0.4em;
          top: -120%;
          left: -10px;
          z-index: 999999;
          position: absolute;
          font-size: 12px;

      }
  }
  /** Set tooltip content for bold button **/
  .ql-bold {
      &:hover::after,
      &:active::after,
      &:focus::after {
          content: "Bold";
      }
  }

  .ql-italic {
      &:hover::after,
      &:active::after,
      &:focus::after {
          content: "Italic";
      }
  }

  .ql-underline {
      &:hover::after,
      &:active::after,
      &:focus::after {
          content: "Underline";
      }
  }
  .ql-strike {
      &:hover::after,
      &:active::after,
      &:focus::after {
          content: "Strikeout";
      }
  }
  .ql-link {
      &:hover::after,
      &:active::after,
      &:focus::after {
          content: "Hyperlink";
      }
  }
  .ql-clean {
      &:hover::after,
      &:active::after,
      &:focus::after { 
          content: "Clean";
      }
  }
  .ql-blockquote {
      &:hover::after,
      &:active::after,
      &:focus::after {
          content: "Quote";
      }
  }
  .ql-list[value="bullet"] {
      &:hover::after,
      &:active::after,
      &:focus::after {
          content: "Bulleted List";
          top: -200%;
      }
  }
  .ql-list[value="ordered"] {
      &:hover::after,
      &:active::after,
      &:focus::after {
          content: "Numbered List";
          top: -200%;
      }
  }

</style>
<style scoped>
  @import 'quill/dist/quill.snow.css';
  .editor { height: 100px; } 
  .container-area { width:100%;height: 145px; display: flex; align-items:flex-start; justify-content: space-between; }
  .container-editor { width: calc(100% - 40px); border-bottom: 1px solid #a5a5a5; }
  .container-tooltip { margin-inline-start:16px; font-size: 16px; opacity:.6; }
</style>
