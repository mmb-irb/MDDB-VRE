import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path'; // Import join from path module
import { logMessage } from '../../utils/log'; 
import { getCurrentDateString, getExpirationDate } from '../../utils/utils'; 

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

  // Function to extract key-value pairs from the output
  const extractKeyValue = (output, key) => {
    const regex = new RegExp(`${key}:\\s*(.*)`);
    const match = output.match(regex);
    return match ? match[1] : null;
  }

  const config = useRuntimeConfig();

  // Handle query params (GET)
  const query = getQuery(event);
  const date = getCurrentDateString();
  const bucket = query.bucket;
  //const password = generateUniqueId(16);
  const minioURL = config.public.minioURL;
  const minioHost = config.public.minioHost;
  const minioUsr = config.public.minioUsr;
  const logPath = config.logPath;

  /*const createPresignedURL = (file, newBucket) => {
    return new Promise((resolve, reject) => {
      exec(`mc share upload myminio/${date}/${newBucket}/${file} --expire=24h`, (error, stdout, stderr) => {
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
  };*/

  // Define the policy JSON string
  const policyJson = JSON.stringify({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject"
        ],
        "Resource": [
          `arn:aws:s3:::${date}/${bucket}/*`
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "s3:ListBucket"
        ],
        "Resource": [
          `arn:aws:s3:::${date}`
        ],
        "Condition": {
          "StringLike": {
            "s3:prefix": [
              `${bucket}/*`
            ]
          }
        }
      },
      {
        "Effect": "Deny",
        "Action": [
          "admin:CreateServiceAccount"
        ],
        "Resource": [
        "arn:aws:s3:::*"
        ]
      }
    ]
  });
  // Write the JSON string to a temporary file
  const tempFilePath = join(tmpdir(), `${bucket}-policy.json`);
  await writeFile(tempFilePath, policyJson);

  try {
    // Get expiration date
    const expDate = getExpirationDate(config.public.timeDiff);
    // Create MinIO Access Keys
    const output = await execPromise(`mc admin user svcacct add myminio ${minioUsr} --policy ${tempFilePath} --expiry ${expDate}`);
    // Extract Access Key and Secret Key
    const accessKey = extractKeyValue(output.stdout, 'Access Key');
    const secretKey = extractKeyValue(output.stdout, 'Secret Key');
    // Clean up the temporary file
    await unlink(tempFilePath);


    /*await execPromise(`mc admin user add myminio ${bucket} ${password}`);
    // Set policy
    await execPromise(`mc admin policy create myminio ${bucket}-policy ${tempFilePath}`);
    // Clean up the temporary file
    await unlink(tempFilePath);
    // Attach policy to user
    await execPromise(`mc admin policy attach myminio ${bucket}-policy --user ${bucket}`);
    // Generate presigned URL for curl*/
    //const curl = await createPresignedURL('trajectory.file', bucket);
    const curl = {
      code: `
#!/bin/bash

# Check if no arguments are provided or if the number of arguments is odd
if [ \$# -eq 0 ] || [ \$(( \$# % 2 )) -ne 0 ]; then
  echo "Error: No arguments provided or arguments must be provided in pairs (file path and filename)."
  echo "Usage: \$0 <file path1> <filename1> <file path2> <filename2> ..."
  exit 1
fi

echo "Uploading files. Depending on the file(s) size, this may take a while."

# Loop through the pairs of arguments
while [ \$# -gt 0 ]; do
  file=\$1
  filename=\$2

  resource="/${date}/${bucket}/\${filename}"
  date=\`date -R\`
  request="PUT\\n\\napplication/octet-stream\\n\${date}\\n\${resource}"
  signature=\`echo -en \${request} | openssl sha1 -hmac ${secretKey} -binary | base64\`

  curl --progress-bar --upload-file "\${file}" \\
      -H "Host: ${minioHost}" \\
      -H "Date: \${date}" \\
      -H "Content-Type: application/octet-stream" \\
      -H "Authorization: AWS ${accessKey}:\${signature}" \\
      ${minioURL}\${resource} | type

  # Shift to the next pair of arguments
  shift 2
done

echo "Done!"
`.trim()
    };

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
          alias: `mc alias set myupload ${minioURL} ${accessKey} ${secretKey}`,
          file: `mc cp /path/to/file myupload/${date}/${bucket}/filename`,
          folder: `mc mirror /path/to/folder myupload/${date}/${bucket}/folder`,
          files: `mc mirror /path/to/folder myupload/${date}/${bucket}`
        },
        aws: {
          file: `AWS_ACCESS_KEY_ID=${accessKey} AWS_SECRET_ACCESS_KEY=${secretKey} aws --endpoint-url ${minioURL} s3 cp /path/to/file s3://${date}/${bucket}/filename`,
          files: `AWS_ACCESS_KEY_ID=${accessKey} AWS_SECRET_ACCESS_KEY=${secretKey} aws --endpoint-url ${minioURL} s3 sync /path/to/folder s3://${date}/${bucket}`,
          folder: `AWS_ACCESS_KEY_ID=${accessKey} AWS_SECRET_ACCESS_KEY=${secretKey} aws --endpoint-url ${minioURL} s3 sync /path/to/folder s3://${date}/${bucket}/folder`
        },
        rclone: {
          file: `rclone sync /path/to/file :s3:${date}/${bucket} --s3-access-key-id ${accessKey} --s3-secret-access-key ${secretKey} --s3-endpoint ${minioURL} --s3-provider Minio --s3-no-check-bucket --progress`,
          files: `rclone sync /path/to/folder :s3:${date}/${bucket} --s3-access-key-id ${accessKey} --s3-secret-access-key ${secretKey} --s3-endpoint ${minioURL} --s3-provider Minio --s3-no-check-bucket --progress`,
          folder: `rclone sync /path/to/folder :s3:${date}/${bucket}/folder --s3-access-key-id ${accessKey} --s3-secret-access-key ${secretKey} --s3-endpoint ${minioURL} --s3-provider Minio --s3-no-check-bucket --progress`
        },
        bucket: bucket
      }
    };
  } catch (error) {
    return { error: error.message };
  }
});