import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default defineEventHandler(async (event) => {

  // Handle query params (GET)
  const query = getQuery(event);
  const files = query.files;

  // Check if files is present and is either a string or an array
  if (!files || (typeof files !== 'string' && !Array.isArray(files))) {
    setResponseStatus(event, 404);
    return { message: 'Invalid files parameter' };
  }

  // Ensure files is an array for consistent processing
  const filesArray = Array.isArray(files) ? files : [files];

  const generateUniqueId = (length = 10) => {
		const chars = 'abcdefghijklmnopqrstuvwxyz0123456789-';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

  const execCommand = (file, newBucket) => {
    return new Promise((resolve, reject) => {
      exec(`mc share upload myminio/${newBucket}/${file} --expire=24h`, (error, stdout, stderr) => {
        if (error) {
          reject({ message: `Error: ${error.message}` });
          return;
        }
        if (stderr) {
          reject({ message: `Stderr: ${stderr}` });
          return;
        }

        // Extract the curl command from the stdout
        const curlCommandMatch = stdout.match(/(curl .*)/);
        const curlCommand = curlCommandMatch ? curlCommandMatch[1] : 'Curl command not found';

        resolve({ message: curlCommand });
      });
    });
  };

  const newBucket = generateUniqueId();

  try {
    // Create the new bucket and await its completion
    await execPromise(`mc mb myminio/${newBucket}`);
    // Generate presigned URL for each file
    const results = await Promise.all(filesArray.map(file => execCommand(file, newBucket)));
    return { results, uid: newBucket };
  } catch (error) {
    return { error: error.message };
  }
});