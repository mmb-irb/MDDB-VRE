export const schema = {
  type: 'object',
  properties: {
    name: { type: ['string', 'null'] },
    description: { type: ['string', 'null'] },
    authors: {
      type: ['array', 'null'],
      items: { type: 'string' }
    },
    groups: {
      type: ['array', 'null'],
      items: { type: 'string' }
    },
    citation: { type: ['string', 'null'] },
    thanks: { type: ['string', 'null'] },
    contact: { type: ['string', 'null'], format: 'email' },
    type: { type: ['string', 'null'] },
    program: { type: ['string', 'null'] },
    version: { type: ['string', 'null'] },
    license: { type: ['string', 'null'] },
    linkcense: { type: ['string', 'null'], format: 'uri' },
    method: { type: ['string', 'null'] },
    accession: { type: ['string', 'null'], pattern: '^[a-zA-Z0-9]+$' },
    links: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          url: { type: 'string', format: 'uri' }
        },
        required: ['name', 'url'],
        additionalProperties: false
      }
    },
    pdbIds: {
      type: ['array', 'null'],
      items: { type: 'string', pattern: '^[0-9][A-Za-z0-9]{3}$' }
    },
    forced_references: {
      type: ['array', 'null'],
      items: { type: 'string', pattern: '^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}|[A-Za-z]: ?(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}|noref))$' }
    },
    ligands: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          residue: {
            type: 'array',
            items: { type: 'number' }
          },
          pubchem: { 
            oneOf: [
              { type: 'string', pattern: '^[1-9][0-9]*$' },
              { type: 'number' }
            ]
          },
          CHEMBL: { type: 'string', pattern: '^CHEMBL\\d+$' },
          drugbank: { type: 'string', pattern: '^DB\\d{5}$' },
          name: { type: 'string' }
        },
        anyOf: [
          { required: ['pubchem'] },
          { required: ['CHEMBL'] },
          { required: ['drugbank'] },
          { required: ['name'] }
        ],
        additionalProperties: false
      }
    },
    framestep: { type: ['number', 'null'] },
    timestep: { type: ['number', 'null'] },
    ensemble: { type: ['string', 'null'] },
    ff: {
      type: ['array', 'null'],
      items: { type: 'string' }
    },
    wat: { type: ['string', 'null'] },
    boxtype: { type: ['string', 'null'] },
    mds: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          mdir: { type: 'string' },
          temp: { type: 'number' }
        },
        required: ['name', 'mdir', 'temp'],
        additionalProperties: false
      }
    },
    mdref: { type: ['number', 'null'] },
    pbc_selection: { type: ['string', 'null'] },
    interactions: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          agent_1: { type: 'string' },
          selection_1: { type: 'string' },
          agent_2: { type: 'string' },
          selection_2: { type: 'string' }
        },
        required: ['name', 'type', 'agent_1', 'selection_1', 'agent_2', 'selection_2'],
        additionalProperties: false
      }
    }
  },
  required: [
    'name'
  ]
}