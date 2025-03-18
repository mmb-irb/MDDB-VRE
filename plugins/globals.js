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
            defaultColor: 'sstruc',
            predefinedSelections: [
              { name: 'All', id: '*' },
              { name: 'Side Chain', id: 'sidechain' },
              { name: 'Side Chain Attached', id: 'sidechainAttached' },
              { name: 'Backbone', id: 'backbone' },
              { name: 'Protein', id: 'protein' },
              { name: 'Nucleic', id: 'nucleic' },
              { name: 'RNA', id: 'rna' },
              { name: 'DNA', id: 'dna' },
              { name: 'Hetero', id: 'hetero' },
              { name: 'Ligand', id: 'ligand' },
              { name: 'Ion', id: 'ion' },
              { name: 'Saccharide / Sugar', id: 'sugar' },
              { name: 'Polymer', id: 'polymer' },
              { name: 'Water', id: 'water' },
              { name: 'Hydrogen', id: 'hydrogen' },
              { name: 'Helix', id: 'helix' },
              { name: 'Sheet', id: 'sheet' },
              { name: 'Turn', id: 'turn' },
              { name: 'Small', id: 'small' },
              { name: 'Nucleophilic', id: 'nucleophilic' },
              { name: 'Hydrophobic', id: 'hydrophobic' },
              { name: 'Aromatic', id: 'aromatic' },
              { name: 'Amid', id: 'amid' },
              { name: 'Acidic', id: 'acidic' },
              { name: 'Basic', id: 'basic' },
              { name: 'Charged', id: 'charged' },
              { name: 'Polar', id: 'polar' },
              { name: 'Non Polar', id: 'nonpolar' },
              { name: 'Cyclic', id: 'cyclic' },
              { name: 'Aliphatic', id: 'aliphatic' },
              { name: 'Bonded', id: 'bonded' },
              { name: 'Ring', id: 'ring' },
            ],
            aminoacids: {
              ala: { name: 'alanine', id: 'A' },
              arg: { name: 'arginine', id: 'R' },
              asn: { name: 'asparagine', id: 'N' },
              asp: { name: 'aspartic acid', id: 'D' },
              cys: { name: 'cysteine', id: 'C' },
              gln: { name: 'glutamine', id: 'Q' },
              glu: { name: 'glutamic acid', id: 'E' },
              gly: { name: 'glycine', id: 'G' },
              his: { name: 'histidine', id: 'H' },
              ile: { name: 'isoleucine', id: 'I' },
              leu: { name: 'leucine', id: 'L' },
              lys: { name: 'lysine', id: 'K' },
              met: { name: 'methionine', id: 'M' },
              phe: { name: 'phenylalanine', id: 'F' },
              pro: { name: 'proline', id: 'P' },
              ser: { name: 'serine', id: 'S' },
              thr: { name: 'threonine', id: 'T' },
              trp: { name: 'tryptophan', id: 'W' },
              tyr: { name: 'tyrosine', id: 'Y' },
              val: { name: 'valine', id: 'V' },
              da: { name: 'deoxyadenosine', id: 'DA' },
              dc: { name: 'deoxycytidine', id: 'DC' },
              dg: { name: 'deoxyguanosine', id: 'DG' },
              dt: { name: 'deoxythymidine', id: 'DT' },
              di: { name: 'deoxyinosine', id: 'DI' },
              a: { name: 'adenosine', id: 'A' },
              c: { name: 'cytidine', id: 'C' },
              g: { name: 'guanosine', id: 'G' },
              u: { name: 'uridine', id: 'U' },
              i: { name: 'inosine', id: 'I' },
              hoh: { name: 'water', id: 'W' },
            },
          }
      }
    }
  }
})