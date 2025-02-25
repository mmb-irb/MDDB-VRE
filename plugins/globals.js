export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const { $formatBytes} = useNuxtApp();
  return {
      provide: {
        globals: {
          shortName: 'MDDB VRElite',
          fullName: 'Molecular Dynamics Database Virtual Reality Environment',

          metaFormats: ['.yml', '.yaml'],
          topFormats: ['.pdb', '.top', '.cif'],
          trajFormats: ['.xtc', '.dcd', '.mdcrd', '.trr', '.nc', '.netcdf'],
          maxUploadTrjSize: config.public.maxUploadTrjSize,
          maxUploadTrjSizeHumanReadable: $formatBytes(config.public.maxUploadTrjSize),

          expire: `${config.public.timeDiff} days`,
      }
    }
  }
})