import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path'; // Import join from path module
import { logMessage } from '../../utils/log'; // Import logMessage from log module

const execPromise = promisify(exec);

export default defineEventHandler(async (event) => {

  const generateUniqueId = (length = 12) => {
		const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

  const config = useRuntimeConfig();

  // Handle query params (GET)
  const query = getQuery(event);
  const bucket = query.bucket;
  const password = generateUniqueId(16);
  const minioURL = config.public.minioURL;
  const logPath = config.logPath;

  const createPresignedURL = (file, newBucket) => {
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

        resolve({ code: curlCommand });
      });
    });
  };

  // Define the policy JSON string
  const policyJson = JSON.stringify({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket",
                "s3:PutObject"
            ],
            "Resource": [
                `arn:aws:s3:::${bucket}`,
                `arn:aws:s3:::${bucket}/*`
            ]
        }
    ]
  });
  // Write the JSON string to a temporary file
  const tempFilePath = join(tmpdir(), `${bucket}-policy.json`);
  await writeFile(tempFilePath, policyJson);

  try {
    // Create new user
    await execPromise(`mc admin user add myminio ${bucket} ${password}`);
    // Set policy
    await execPromise(`mc admin policy create myminio ${bucket}-policy ${tempFilePath}`);
    // Clean up the temporary file
    await unlink(tempFilePath);
    // Attach policy to user
    await execPromise(`mc admin policy attach myminio ${bucket}-policy --user ${bucket}`);
    // Generate presigned URL for curl
    const curl = await createPresignedURL('trajectory.file', bucket);

    // log
    const logObject = {
      bucket: bucket,
      type: 'large',
      processed: false
    };
    logMessage(logPath, logObject);

    return {
      results: {
        curl: curl,
        mc: {
          alias: `mc alias set myupload ${minioURL} ${bucket} ${password}`,
          file: `mc cp /path/to/file myupload/${bucket}`,
          folder: `mc mirror /path/to/folder myupload/${bucket}/folder`,
          files: `mc mirror /path/to/folder myupload/${bucket}`
        },
        aws: {
          file: `AWS_ACCESS_KEY_ID=${bucket} AWS_SECRET_ACCESS_KEY=${password} aws --endpoint-url ${minioURL} s3 cp /path/to/file s3://${bucket}`,
          files: `AWS_ACCESS_KEY_ID=${bucket} AWS_SECRET_ACCESS_KEY=${password} aws --endpoint-url ${minioURL} s3 sync /path/to/folder s3://${bucket}`,
          folder: `AWS_ACCESS_KEY_ID=${bucket} AWS_SECRET_ACCESS_KEY=${password} aws --endpoint-url ${minioURL} s3 sync /path/to/folder s3://${bucket}/folder`
        },
        rclone: {
          file: `rclone sync /path/to/file :s3:${bucket} --s3-access-key-id ${bucket} --s3-secret-access-key ${password} --s3-endpoint ${minioURL} --s3-provider Minio --s3-no-check-bucket --progress`,
          files: `rclone sync /path/to/folder :s3:${bucket} --s3-access-key-id ${bucket} --s3-secret-access-key ${password} --s3-endpoint ${minioURL} --s3-provider Minio --s3-no-check-bucket --progress`,
          folder: `rclone sync /path/to/folder :s3:${bucket}/folder --s3-access-key-id ${bucket} --s3-secret-access-key ${password} --s3-endpoint ${minioURL} --s3-provider Minio --s3-no-check-bucket --progress`
        },
        bucket: bucket
      }
    };
  } catch (error) {
    return { error: error.message };
  }
});