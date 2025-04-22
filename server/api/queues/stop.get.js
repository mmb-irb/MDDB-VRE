import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default defineEventHandler(async (event) => {

  // Handle query params (GET)
  const query = getQuery(event);
  let job = query.job;
  // make sure that only one job is passed
  if (Array.isArray(job)) job = job[0];

  try {    
    const { stdout, stderr } = await execPromise(`docker run --rm --network jobnet -v /var/run/docker.sock:/var/run/docker.sock client stop ${job} --json`);
    const jsonOutput = JSON.parse(stdout);
    return jsonOutput;
  } catch (error) {
    setResponseStatus(event, 404)
    return {
      "error": error
    }
  }

})