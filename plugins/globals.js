export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const { $formatBytes} = useNuxtApp();
  return {
      provide: {
        globals: {
          shortName: 'MDDB VRElite',
          fullName: 'Molecular Dynamics Database Virtual Reality Environment',

          topFormats: ['.pdb', '.top', '.cif'],
          trajFormats: ['.xtc', '.dcd', '.mdcrd', '.trr', '.nc', '.netcdf'],
          maxUploadTrjSize: config.public.maxUploadTrjSize,
          maxUploadTrjSizeHumanReadable: $formatBytes(config.public.maxUploadTrjSize),

          curl_expire: `${config.public.timeDiff} days`,
      }
    }
  }
})