import { connectToDatabase } from '../../utils/db'
import { compareVersions } from '../../utils/utils'; 

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
    const repos = config.public.repos || [];
    const services = [];
    await Promise.all(versions.map(async (element) => {

      const response = await $fetch(`https://api.github.com/repos/${repos[element.service].org}/${repos[element.service].repo}/tags`, {
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
      }

      services.push({
        service: element.service,
        name: repos[element.service].name,
        version: element.version,
        latestTag: latestTag,
        status: status
      });

      services.sort((a, b) => a.service.localeCompare(b.service));

    }));

    return services
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch version'
    })
  }
})
