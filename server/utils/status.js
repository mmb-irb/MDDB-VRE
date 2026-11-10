import { lookup } from 'dns/promises';

// Service status without the Docker socket: ask each service directly over the internal network.
// Any HTTP answer (even an error code) means the service is up.

// One-off services only run when an operator launches them
export const ONE_OFF_SERVICES = ['loader', 'workflow'];

export const serviceUrls = (env = process.env) => ({
  client: `http://client:${env.CLIENT_INNER_PORT || 80}/`,
  rest: `http://rest:${env.REST_INNER_PORT || 3000}/`,
  minio: `http://${env.MINIO_ADDRESS || 'minio'}:${env.MINIO_API_PORT || 9000}/minio/health/live`,
  services_monitor: `http://services_monitor:${env.SERVICES_MONITOR_API_INNER_PORT || 3001}/`,
});

// Name lookup errors that mean "this service does not exist in the network".
// Docker's DNS forwards unknown names to the host's DNS server: most answer ENOTFOUND, but some
// (e.g. on irb.mddbr.eu) do not answer single-label names at all and the lookup ends in EAI_AGAIN.
const MISSING_NAME_CODES = ['ENOTFOUND', 'EAI_AGAIN'];

// Returns 'running', 'offline' or 'not-found' (the host name does not exist in the network).
// Network errors are the expected way to learn that a service is down, so they become a status here.
export const checkService = async (url, timeoutMs = 5000, resolve = lookup) => {
  // Resolve the name first: a missing name can take longer than the HTTP timeout to fail
  try {
    await resolve(new URL(url).hostname);
  } catch (error) {
    if (MISSING_NAME_CODES.includes(error.code)) return 'not-found';
    throw error;
  }
  try {
    await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: 'manual' });
    return 'running';
  } catch (error) {
    return 'offline';
  }
};

// Status for one entry of the services list.
// A core service that does not resolve is reported as offline: it should always exist,
// and services_monitor only alerts on 'offline'.
export const serviceStatus = async (service, type, urls = serviceUrls()) => {
  if (service === 'vre_lite') return 'running';
  if (ONE_OFF_SERVICES.includes(service)) return 'idle';
  const url = urls[service];
  if (!url) return 'unknown';
  const status = await checkService(url);
  if (status === 'not-found' && type === 'core') return 'offline';
  return status;
};
