import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default defineEventHandler(async (event) => {

  // Handle query params (GET)
  const query = getQuery(event);
  let status = query.status;
  if (Array.isArray(status)) {
    status = status.join(" ");
  }

  try {
    const { stdout, stderr } = await execPromise(`docker run --rm --network jobnet client list --json ${status ? "--status " + status : ""}`);
    const jsonOutput = JSON.parse(stdout);
    return jsonOutput;
  } catch (error) {
    return {
      "error": error
    }
  }

})