import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { logMessage } from '../../utils/log'; // Import logMessage from log module

const execPromise = promisify(exec);

export default defineEventHandler(async (event) => {

  const config = useRuntimeConfig();

  const form = formidable({ maxFileSize: config.public.maxUploadTrjSize });
  const logPath = config.logPath;

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const bucket = fields.bucket;
      // Create the new bucket and await its completion
      await execPromise(`mc mb myminio/${bucket}`);

      try {
        for (const fieldName in files) {
          const fileArray = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]];

          for (const file of fileArray) {
            // Copy the file to a temporary location            
            const tempFilePath = path.join(tmpdir(), file.originalFilename);
            await fs.copyFile(file.filepath, tempFilePath);

            // Upload the file to MinIO
            await execPromise(`mc cp ${tempFilePath} myminio/${bucket}`);

            // Clean up the temporary file
            await fs.unlink(tempFilePath);
          }
        }

        if(fields.type == 'small') {
          // log
          const logObject = {
            date: new Date().toISOString(),
            bucket: `${bucket}`,
            type: 'small'
          };
          logMessage(logPath, `${JSON.stringify(logObject)}`);
        }

        resolve({ message: 'Files uploaded successfully' });
      } catch (error) {
        reject(error);
      }
    });
  });
});
