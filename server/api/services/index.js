import { connectToDatabase } from '../../utils/db';
import { compareVersions } from '../../utils/utils';
import { exec } from "child_process"; 
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // Wait for docker service command to complete
    try {
      const { stdout, stderr } = await execAsync("docker service ls --format '{{json .}}'");
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }

      // Split output by newlines, filter out empty lines, and parse JSON
      const containers = stdout
        .trim()
        .split("\n")
        .filter(line => line.length > 0)
        .map(line => JSON.parse(line));

      // Match serviceData with Docker services and add status based on replicas
      serviceData.forEach(service => {
        // Find matching Docker service by partial name match
        const dockerService = containers.find(srv => 
          srv.Name.toLowerCase().includes(service.service.toLowerCase())
        );
        
        if (dockerService) {
          // Extract replicas numbers (e.g., "1/1 (max 1 per node)" -> "1/1")
          const replicasMatch = dockerService.Replicas.match(/^(\d+)\/(\d+)/);
          
          if (replicasMatch) {
            const running = parseInt(replicasMatch[1]);
            const desired = parseInt(replicasMatch[2]);
            
            // Determine status based on replicas
            if (running === 0 && desired === 0) {
              service.status = 'idle';
            } else if (running === 0 && desired > 0) {
              service.status = 'offline';
            } else {
              service.status = 'running';
            }
            
            // Optionally add replica info
            service.replicas = {
              running: running,
              desired: desired
            };
          }
        } else {
          // Service not found in Docker services
          service.status = 'not-found';
        }
      });

    } catch (execError) {
      console.error('Docker exec error:', execError);
      // Set all services to unknown status if docker command fails
      serviceData.forEach(service => {
        service.status = 'unknown';
      });
    }

    return serviceData

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch version'
    })
  }
})
