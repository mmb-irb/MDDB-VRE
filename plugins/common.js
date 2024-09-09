export default defineNuxtPlugin(() => {
  
	const sleep = ms => new Promise(r => setTimeout(r, ms) )

	const waitFor = async function waitFor(f){
		while(!f()) await sleep(1000)
		return f()
	}

	return {
	  provide: {
			sleep,
			waitFor
		}	
	}
})


