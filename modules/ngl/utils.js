const multipleResidues = reactive({
  status: false,
  firstRes: null,
  lastRes: null,
  error: false,
  msg: null
})

export default function utilsNGL() {

  // Convert NGL selection string into VMD selection string
  const convertNGLtoVMD = (nglSelection) => {
    // Split the NGL string by comma and trim each token
    const tokens = nglSelection.split(',').map(token => token.trim());
    
    // Map each token "resNum:chain" into VMD format: resid "resNum" and chain chain
    const vmdTokens = tokens.map(token => {
      const parts = token.split(':');
      if (parts.length !== 2) return token;
      const resid = parts[0].trim();
      const chain = parts[1].trim();
      return `resid "${resid}" and chain ${chain}`;
    });
    
    // Join all parts into one VMD selection string with " or " separator
    return vmdTokens.join(' or ');
  };

  const getNumberOfModels = (structure) => {
    let models = []
    structure.eachModel(model => {
      models.push(model.index)
    });
    models = Array.from(new Set(models))
    return models.length
  }

  // Get the list of chains in the structure
  const getChainsList = (structure) => {
    let chains = []
    structure.eachChain(chain => {
      chains.push(chain.chainname)
    });
    chains = Array.from(new Set(chains))
    return chains
  }

  const getResiduesList = (structure) => {
    let residues = []
    structure.eachResidue(residue => {
      residues.push(`${residue.resno}:${residue.chainname}`)
    });
    residues = Array.from(new Set(residues))
    return residues
  }

  // Loop through residues and check if they are in the selection
  const getListOfResiduesFromSelection = (structure, selection) => {
    // Create a Set to store unique residues
    let residues = new Set()
    // Loop through all atoms in the structure
    structure.eachAtom(atom => {
      // Check if the atom is in the selection
      if (selection.test(atom)) {
        residues.add(`${atom.resno}:${atom.chainname}`)
      }
    });
    // Convert Set to an array
    const residueList = Array.from(residues);
    return residueList
  }

  const getStructureObj = (structure) => {
    // Use an object to accumulate chain data, keyed by chain name.
    const chainsObj = {};
  
    // First iteration: go through all chains in the structure.
    structure.eachChain(chain => {
      const chainName = chain.chainname;
      // Gather residues from this chain
      const residues = [];
      chain.eachResidue(residue => {
        residues.push({
          num: residue.resno,
          chain: residue.chainname,
          resname: residue.resname,
        });
      });
  
      // If we already encountered this chain, merge unique residues.
      if (chainsObj[chainName]) {
        // Add new residues that are not already in the array (by comparing resno)
        residues.forEach(r => {
          // A simple check: you can expand this to check both resno and resname
          const exists = chainsObj[chainName].some(existing => existing.num === r.num);
          if (!exists && r.resname !== 'HOH') {
            chainsObj[chainName].push(r);
          }
        });
      } else {
        chainsObj[chainName] = residues;
      }
    });
  
    // Convert the chains object to an array of objects.
    const chainsArray = Object.entries(chainsObj).map(([chain, residues]) => ({
      chain,
      residues,
    }));
  
    return chainsArray;
  };

  const addMultipleResidues = function (residue) {
    multipleResidues.status = !multipleResidues.status
    if(multipleResidues.status) {
        multipleResidues.lastRes = null
        multipleResidues.firstRes = residue
        multipleResidues.error = false
    } else {
        multipleResidues.lastRes = residue
        //if(multipleResidues.firstRes.model === multipleResidues.lastRes.model && multipleResidues.firstRes.chain === multipleResidues.lastRes.chain) {
        if(multipleResidues.firstRes.chain === multipleResidues.lastRes.chain) {
          //console.log('multiple selection wit range: ', multipleResidues.firstRes, multipleResidues.lastRes)
          multipleResidues.error = false
        } else {
          //console.error('You can\'t do a multiple selection with different chain')
          multipleResidues.status = false
          multipleResidues.firstRes = null
          multipleResidues.lastRes = null
          multipleResidues.error = true
          multipleResidues.msg = 'You can\'t do a multiple selection with different chain'
        }        
    }

    return multipleResidues
  }

  function getResidueRange(tokenA, tokenB, residuesArray) {
    const numA = tokenA.num;
    const chainA = tokenA.chain;
    const numB = tokenB.num;
    const chainB = tokenB.chain;

    // Check if the chains are different
    if (chainA !== chainB) {
      console.error('You can\'t do a multiple selection with different chain')
      return false
    }
  
    const start = Math.min(parseInt(numA, 10), parseInt(numB, 10));
    const end = Math.max(parseInt(numA, 10), parseInt(numB, 10));
  
    const mapped = residuesArray.map((token, index) => ({ token, index }));
    const filtered = mapped.filter(({ token }) => {
      const [numStr, chain] = token.split(':');
      const num = parseInt(numStr, 10);
      return chain === chainA && num >= start && num <= end;
    });
    const indexes = filtered.map(item => item.index);
    const items = filtered.map(item => item.token);

    return [items, indexes];
  }

  return { 
    convertNGLtoVMD,
    getNumberOfModels,
    getChainsList,
    getResiduesList,
    getListOfResiduesFromSelection,
    getStructureObj,
    addMultipleResidues,
    getResidueRange
  }
  
}