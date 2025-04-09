import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default defineEventHandler(async (event) => {

  // Handle query params (GET)
  const query = getQuery(event);
  let command = query.command;
  
  // Check if a command was passed
  if (!command) {
    return { "warning": "No command passed" };
  }

  try {
    const { stdout, stderr } = await execPromise(`docker run --rm --network jobnet client add ${command} --json`);
    const jsonOutput = JSON.parse(stdout);
    return jsonOutput;
  } catch (error) {
    return {
      "error": error
    }
  }

})