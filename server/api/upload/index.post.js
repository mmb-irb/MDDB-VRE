import formidable from 'formidable';
import { promises as fs } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { logMessage } from '../../utils/log';
import { getCurrentDateString } from '../../utils/utils';
import { parseBucket, parseFileName } from '../../utils/validate';

// execFile runs mc without a shell, so no argument can be interpreted as a shell command
const execFilePromise = promisify(execFile);

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

      const allFiles = Object.values(files).flatMap(f => Array.isArray(f) ? f : [f]);
      try {
        const bucket = parseBucket(fields.bucket);
        const date = getCurrentDateString();
        // Check every file name before creating anything in MinIO
        const uploads = allFiles.map(file => ({ source: file.filepath, name: parseFileName(file.originalFilename) }));

        // Create the new bucket and await its completion
        await execFilePromise('mc', ['mb', `myminio/${date}/${bucket}`]);

        for (const upload of uploads) {
          // Upload the file to MinIO straight from formidable's temporary file
          await execFilePromise('mc', ['cp', upload.source, `myminio/${date}/${bucket}/${upload.name}`]);
        }

        if(fields.type == 'small') {
          // log
          const logObject = {
            date: `${date}`,
            bucket: `${bucket}`,
            type: 'small',
            processed: null
          };
          logMessage(logPath, logObject);
        }

        resolve({ message: 'Files uploaded successfully' });
      } catch (error) {
        reject(error);
      } finally {
        // Remove formidable's temporary files, also when the upload was rejected
        await Promise.all(allFiles.map(file => fs.rm(file.filepath, { force: true })));
      }
    });
  });
});
