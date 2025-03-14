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

  return { 
    convertNGLtoVMD,
    getChainsList,
    getResiduesList,
    getListOfResiduesFromSelection
  }
  
}