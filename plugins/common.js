export default defineNuxtPlugin(() => {
  
	const sleep = ms => new Promise(r => setTimeout(r, ms) )

	const waitFor = async function waitFor(f){
		while(!f()) await sleep(1000)
		return f()
	}

	const formatBytes = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1000;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	return {
	  provide: {
			sleep,
			waitFor,
			formatBytes
		}	
	}
})


