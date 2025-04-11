import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// TODO CONVERTO INTO A POST ENTRYPOINT
export default defineEventHandler(async (event) => {

  // Handle query params (GET)
  const query = getQuery(event);
  const command = query.command;
  const worker = query.worker;
  const queue = query.queue;
  
  // Check if a worker was passed
  if (!worker) {
    return { "warning": "No worker passed" };
  }

  // Check if a command was passed
  if (!command) {
    return { "warning": "No command passed" };
  }

  try {
    const { stdout, stderr } = await execPromise(`docker run --rm --network jobnet client add ${worker} --args ${command} ${queue ? "--queue " + queue : ""} --json`);
    const jsonOutput = JSON.parse(stdout);
    return jsonOutput;
  } catch (error) {
    setResponseStatus(event, 404)
    return {
      "error": error
    }
  }

})