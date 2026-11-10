import { readFile } from 'fs/promises';

// Version of each running service, asked to the service itself.
// vre_db.version is only updated when someone runs utils/version_tracker.py, so it goes stale when a service
// is updated in any other way. The services page prefers this version and saves it to vre_db.version.

// A version as written by the images: '0.0.8', 'dev', '1.2.3-rc1'...
const VERSION_PATTERN = /^[0-9A-Za-z][0-9A-Za-z.+-]{0,39}$/;

const validVersion = (text) => {
  const version = String(text ?? '').trim();
  return VERSION_PATTERN.test(version) ? version : null;
};

// How to ask each service. Services not listed here (loader and workflow are one-off, minio has no repo)
// keep the version stored in the database.
export const versionSources = (env = process.env) => ({
  // vre_lite is this server: read the version file of its own image
  vre_lite: { file: env.VRE_LITE_VERSION_FILE || '/app/version.txt' },
  // The REST API reports its package version at /rest
  rest: { url: `http://rest:${env.REST_INNER_PORT || 3000}/rest`, field: 'software version' },
  // The client image serves its version file with the website
  client: { url: `http://client:${env.CLIENT_INNER_PORT || 80}/version.txt` },
});

// Returns the version the running service reports, or null when it cannot tell
// (service stopped or missing, or an image older than this feature). Null is an expected answer:
// the caller then keeps the version stored in the database.
export const runningVersion = async (service, sources = versionSources(), timeoutMs = 3000) => {
  const source = sources[service];
  if (!source) return null;
  if (source.file) {
    try {
      return validVersion(await readFile(source.file, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }
  let response;
  try {
    response = await fetch(source.url, { signal: AbortSignal.timeout(timeoutMs), redirect: 'manual' });
  } catch (error) {
    // Network errors (name not found, connection refused, timeout) mean the service cannot answer now
    return null;
  }
  if (!response.ok) return null;
  if (source.field) {
    // Older REST versions may answer something else at this path
    if (!(response.headers.get('content-type') || '').includes('application/json')) return null;
    const body = await response.json();
    return validVersion(body[source.field]);
  }
  // A single-page app may answer any path with its index.html: only accept a plain version string
  return validVersion(await response.text());
};
