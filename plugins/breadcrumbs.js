export default defineNuxtPlugin(() => {
  return {
    provide: {
      breadcrumbs: {
        'first-level': (section) => [
          {
          title: 'Upload data',
          disabled: false,
          to: '/',
          },
          {
            title: section,
            disabled: true
          }
        ],
        'second-level': (section, title, pth) => [
          {
          title: 'Upload data',
          disabled: false,
          to: '/',
          },
          {
            title: section,
            disabled: false,
            to: `/${pth}`
          },
          {
            title: title,
            disabled: true
          },
        ]
      },
    }
  }
})