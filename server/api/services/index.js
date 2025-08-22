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
      }

      serviceData.push({
        service: element.service,
        name: services[element.service].name,
        version: element.version,
        latestTag: latestTag,
        update: status
      });

    }));

    const otherServices = Object.keys(services).filter(svc => services[svc].repo === '');
    otherServices.forEach(svc => {
      serviceData.push({
        service: svc,
        name: services[svc].name,
        version: 'N/A',
        latestTag: 'N/A',
        update: 'no-repo'
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

//     const stdout = `{"ID":"0grxqpr8cbc9","Image":"apache_image:latest","Mode":"replicated","Name":"my_stack_apache","Ports":"*:80->80/tcp, *:443->443/tcp, *:7000->7000/tcp","Replicas":"1/1"}
// {"ID":"nqioq6e16rqg","Image":"client_image:latest","Mode":"replicated","Name":"my_stack_client","Ports":"*:8080->80/tcp","Replicas":"2/2"}
// {"ID":"9llxod6cpwjr","Image":"loader_image:latest","Mode":"replicated","Name":"my_stack_loader","Ports":"","Replicas":"0/0"}
// {"ID":"fu2cnk4421np","Image":"minio/minio:latest","Mode":"replicated","Name":"my_stack_minio","Ports":"*:9001-9002->9001-9002/tcp","Replicas":"1/1 (max 1 per node)"}
// {"ID":"4b33c8z8cro2","Image":"mongo:latest","Mode":"replicated","Name":"my_stack_mongo-backup","Ports":"","Replicas":"1/1"}
// {"ID":"2bkerbdxej68","Image":"mongo:6","Mode":"replicated","Name":"my_stack_mongodb","Ports":"*:27017->27017/tcp","Replicas":"1/1"}
// {"ID":"x2oksqiw9ho9","Image":"rest_image:latest","Mode":"replicated","Name":"my_stack_rest","Ports":"*:8081->3000/tcp","Replicas":"2/2"}
// {"ID":"0y2u1r6wwo36","Image":"utils_image:latest","Mode":"replicated","Name":"my_stack_utils","Ports":"","Replicas":"0/0"}
// {"ID":"ddpsn486kjm2","Image":"vre_lite_image:latest","Mode":"replicated","Name":"my_stack_vre_lite","Ports":"*:8082->3001/tcp","Replicas":"1/1"}
// {"ID":"ion8jcwei31i","Image":"workflow_image:latest","Mode":"replicated","Name":"my_stack_workflow","Ports":"","Replicas":"0/0"}`;

//     const containers = stdout
//         .trim()
//         .split("\n")
//         .filter(line => line.length > 0)
//         .map(line => JSON.parse(line));

    return serviceData

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch version'
    })
  }
})
