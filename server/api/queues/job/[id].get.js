import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default defineEventHandler(async (event) => {

  // get project id
  const { id } = event.context.params

  try {
    const { stdout, stderr } = await execPromise(`docker run --rm --network jobnet client job ${id} --json`);
    const jsonOutput = JSON.parse(stdout);
    return jsonOutput;
  } catch (error) {
    setResponseStatus(event, 404)
    return {
      "error": error
    }
  }

})