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

          ngl: {
            representations: [{
              id: 'backbone',
              name: 'Backbone'
            }, {
              id: 'cartoon',
              name: 'Cartoon'
            }, {
              id: 'ball+stick',
              name: 'Ball and sticks'
            }, {
              id: 'surface',
              name: 'Surface'
            }, {
              id: 'licorice',
              name: 'Licorice'
            }, {
              id: 'spacefill',
              name: 'Spacefill'
            }],
            defaultRepresentation: 'licorice',
            colors: [{
              id: 'sstruc',
              name: 'Secondary structure'
            }, {
              id: 'chainname',
              name: 'Chain'
            }, {
              id: 'resname',
              name: 'Residue'
            }, {
              id: 'element',
              name: 'Element'
            }, {
              id: 'bfactor',
              name: 'Bfactor'
            }],
            defaultColor: 'sstruc'
          }
      }
    }
  }
})