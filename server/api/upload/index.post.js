import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {

  const config = useRuntimeConfig();

  const form = formidable({ maxFileSize: config.public.maxUploadTrjSize }); // 1GB
  const uploadDir = config.dataPath;

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        for (const fieldName in files) {
          const fileArray = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]];

          for (const file of fileArray) {
            const filePath = path.join(uploadDir, file.originalFilename);
            await fs.rename(file.filepath, filePath);
          }
        }
        resolve({ message: 'Files uploaded successfully' });
      } catch (error) {
        reject(error);
      }
    });
  });
});
