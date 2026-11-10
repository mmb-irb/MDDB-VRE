import { connectToDatabase } from '../../utils/db';
import { compareVersions } from '../../utils/utils';
import { serviceStatus } from '../../utils/status';
import { runningVersion } from '../../utils/runningVersion';

export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const versions = await db.collection('version').find({}).toArray()

    if (!versions || versions.length === 0) {
      setResponseStatus(event, 404)
      return {
        "error": "No versions found"
      }
    }

    const config = useRuntimeConfig();
    const services = config.public.services || [];
    const serviceData = [];
    await Promise.all(versions.map(async (element) => {

      // Prefer the version reported by the running service, and keep the database in step with it
      // (the database version is still used for services that cannot answer, like loader and workflow)
      const running = await runningVersion(element.service);
      if (running && running !== element.version) {
        await db.collection('version').updateOne(
          { service: element.service },
          { $set: { version: running, timestamp: new Date() } }
        );
        element.version = running;
      }
      const versionSource = running ? 'service' : 'database';

      const response = await $fetch(`https://api.github.com/repos/${services[element.service].org}/${services[element.service].repo}/tags`, {
        headers: {
          'Authorization': `token ${config.githubToken}`,
          'User-Agent': 'VRElite-Server'
        }
      });
      const latestTag = response[0]?.name?.replace(/^v/, '') || 'unknown';

      // Compare versions
      let status = 'unknown';
      if (latestTag !== 'unknown') {
        const comparison = compareVersions(element.version, latestTag);
        if (comparison === 0) status = 'up-to-date';
        else if (comparison < 0) status = 'updatable';
        else status = 'ahead'; // local version is newer than latest tag

        if(element.version === 'dev') status = 'dev';
      }

      serviceData.push({
        service: element.service,
        name: services[element.service].name,
        version: element.version,
        versionSource,
        latestTag: latestTag,
        update: status,
        type: services[element.service].type
      });

    }));

    const otherServices = Object.keys(services).filter(svc => services[svc].repo === 'no-repo');
    otherServices.forEach(svc => {
      serviceData.push({
        service: svc,
        name: services[svc].name,
        version: 'N/A',
        latestTag: 'N/A',
        update: 'no-repo',
        type: services[svc].type
      });
    });

    serviceData.sort((a, b) => a.service.localeCompare(b.service));

    // Ask each service directly instead of using the Docker socket
    await Promise.all(serviceData.map(async (service) => {
      service.status = await serviceStatus(service.service, service.type);
    }));

    return serviceData

  } catch (error) {
    // Force JSON response regardless of Accept header
    setResponseStatus(event, 500)
    setResponseHeader(event, 'content-type', 'application/json')

    return {
      "error": "Failed to fetch services",
      "details": error.message
    }
  }
})
