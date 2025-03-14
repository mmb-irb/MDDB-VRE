export default function utilsNGL() {

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

  return { 
    convertNGLtoVMD
  }
  
}