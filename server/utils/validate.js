import path from 'path';
import { createError } from 'h3';

// The client creates bucket ids with $generateUniqueId() (plugins/common.js): 6 chars of [a-z0-9].
// Anything else is rejected: the bucket ends up in mc paths and in a MinIO access policy,
// where a value like "*" would grant access to every upload of the day.
const BUCKET_RE = /^[a-z0-9]{6,32}$/;

const badRequest = (message) => createError({ statusCode: 400, statusMessage: message });

// formidable v3 returns every field as an array; getQuery returns a string (or an array if repeated)
const singleValue = (value) => {
  if (Array.isArray(value)) return value.length === 1 ? value[0] : undefined;
  return value;
};

export const parseBucket = (value) => {
  const bucket = singleValue(value);
  if (typeof bucket !== 'string' || !BUCKET_RE.test(bucket)) throw badRequest('Invalid bucket name');
  return bucket;
};

// Browsers send only the base name of the file. Reject anything that is not a plain file name
// (path separators, "..", NUL) instead of trying to clean it.
export const parseFileName = (name) => {
  if (typeof name !== 'string' || name === '' || name === '.' || name === '..') throw badRequest('Invalid file name');
  if (name.includes('\0') || name.includes('/') || name.includes('\\') || path.basename(name) !== name) {
    throw badRequest('Invalid file name');
  }
  return name;
};
