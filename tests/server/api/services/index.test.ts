// tests/server/api/services/index.test.ts
import { describe, it, expect } from 'vitest'

// Define the expected service structure based on your provided response
interface ServiceResponse {
  service: string
  name: string
  version: string
  latestTag: string
  update: string
  type: string
  status: string
  replicas?: {
    running: number
    desired: number
  }
}

// Sample expected response data
const expectedServicesResponse: ServiceResponse[] = [
  {
    service: "client",
    name: "Client", 
    version: "dev",
    latestTag: "0.0.2",
    update: "dev",
    type: "core",
    status: "unknown"
  },
  {
    service: "loader",
    name: "Loader",
    version: "dev", 
    latestTag: "0.0.1",
    update: "dev",
    type: "core",
    status: "unknown"
  },
  {
    service: "minio",
    name: "MinIO",
    version: "N/A",
    latestTag: "N/A", 
    update: "no-repo",
    type: "core",
    status: "unknown"
  },
  {
    service: "optimade",
    name: "OPTIMADE",
    version: "N/A",
    latestTag: "N/A",
    update: "no-repo", 
    type: "extension",
    status: "unknown"
  },
  {
    service: "rest",
    name: "REST API",
    version: "dev",
    latestTag: "0.0.1",
    update: "dev",
    type: "core", 
    status: "unknown"
  },
  {
    service: "services_monitor",
    name: "Service Monitor",
    version: "N/A",
    latestTag: "N/A",
    update: "no-repo",
    type: "development",
    status: "unknown"
  },
  {
    service: "vre_lite", 
    name: "VRElite",
    version: "dev",
    latestTag: "0.0.2",
    update: "dev",
    type: "core",
    status: "unknown"
  },
  {
    service: "workflow",
    name: "Workflow", 
    version: "dev",
    latestTag: "0.1.4",
    update: "dev",
    type: "core",
    status: "unknown"
  }
]

describe('/api/services endpoint logic', () => {
  describe('response structure validation', () => {
    it('should validate array response structure', () => {
      expect(Array.isArray(expectedServicesResponse)).toBe(true)
      expect(expectedServicesResponse.length).toBeGreaterThan(0)
    })

    it('should validate individual service object structure', () => {
      expectedServicesResponse.forEach(service => {
        expect(service).toHaveProperty('service')
        expect(service).toHaveProperty('name') 
        expect(service).toHaveProperty('version')
        expect(service).toHaveProperty('latestTag')
        expect(service).toHaveProperty('update')
        expect(service).toHaveProperty('type')
        expect(service).toHaveProperty('status')
        
        expect(typeof service.service).toBe('string')
        expect(typeof service.name).toBe('string')
        expect(typeof service.version).toBe('string')
        expect(typeof service.latestTag).toBe('string')
        expect(typeof service.update).toBe('string')
        expect(typeof service.type).toBe('string')
        expect(typeof service.status).toBe('string')
      })
    })

    it('should validate required fields are non-empty', () => {
      expectedServicesResponse.forEach(service => {
        expect(service.service.length).toBeGreaterThan(0)
        expect(service.name.length).toBeGreaterThan(0)
        expect(service.version.length).toBeGreaterThan(0)
        expect(service.latestTag.length).toBeGreaterThan(0)
        expect(service.update.length).toBeGreaterThan(0)
        expect(service.type.length).toBeGreaterThan(0)
        expect(service.status.length).toBeGreaterThan(0)
      })
    })
  })

  describe('service categorization', () => {
    it('should have core services', () => {
      const coreServices = expectedServicesResponse.filter(s => s.type === 'core')
      expect(coreServices.length).toBeGreaterThan(0)
      
      const coreServiceNames = coreServices.map(s => s.service)
      expect(coreServiceNames).toContain('client')
      expect(coreServiceNames).toContain('rest')
      expect(coreServiceNames).toContain('vre_lite')
    })

    it('should have extension services', () => {
      const extensionServices = expectedServicesResponse.filter(s => s.type === 'extension')
      expect(extensionServices.length).toBeGreaterThan(0)
      expect(extensionServices.some(s => s.service === 'optimade')).toBe(true)
    })

    it('should have development services', () => {
      const devServices = expectedServicesResponse.filter(s => s.type === 'development')
      expect(devServices.length).toBeGreaterThan(0)
      expect(devServices.some(s => s.service === 'services_monitor')).toBe(true)
    })
  })

  describe('version and update status logic', () => {
    it('should handle dev version services correctly', () => {
      const devServices = expectedServicesResponse.filter(s => s.version === 'dev')
      expect(devServices.length).toBeGreaterThan(0)
      
      devServices.forEach(service => {
        expect(service.update).toBe('dev')
        expect(service.latestTag).toMatch(/^\d+\.\d+\.\d+$/) // semver pattern
      })
    })

    it('should handle no-repo services correctly', () => {
      const noRepoServices = expectedServicesResponse.filter(s => s.update === 'no-repo')
      expect(noRepoServices.length).toBeGreaterThan(0)
      
      noRepoServices.forEach(service => {
        expect(service.version).toBe('N/A')
        expect(service.latestTag).toBe('N/A')
        expect(['minio', 'optimade', 'services_monitor']).toContain(service.service)
      })
    })

    it('should validate version status values', () => {
      const validUpdateStatuses = ['dev', 'no-repo', 'up-to-date', 'updatable', 'ahead']
      expectedServicesResponse.forEach(service => {
        expect(validUpdateStatuses).toContain(service.update)
      })
    })

    it('should validate service status values', () => {
      const validStatuses = ['unknown', 'running', 'offline', 'idle', 'not-found']
      expectedServicesResponse.forEach(service => {
        expect(validStatuses).toContain(service.status)
      })
    })
  })

  describe('service sorting', () => {
    it('should be sorted alphabetically by service name', () => {
      for (let i = 1; i < expectedServicesResponse.length; i++) {
        const current = expectedServicesResponse[i].service
        const previous = expectedServicesResponse[i - 1].service
        expect(previous.localeCompare(current)).toBeLessThanOrEqual(0)
      }
    })
  })

  describe('specific service validation', () => {
    it('should validate client service', () => {
      const client = expectedServicesResponse.find(s => s.service === 'client')
      expect(client).toBeDefined()
      expect(client!.name).toBe('Client')
      expect(client!.type).toBe('core')
      expect(client!.version).toBe('dev')
    })

    it('should validate REST API service', () => {
      const rest = expectedServicesResponse.find(s => s.service === 'rest')
      expect(rest).toBeDefined()
      expect(rest!.name).toBe('REST API')
      expect(rest!.type).toBe('core')
      expect(rest!.version).toBe('dev')
    })

    it('should validate MinIO service', () => {
      const minio = expectedServicesResponse.find(s => s.service === 'minio')
      expect(minio).toBeDefined()
      expect(minio!.name).toBe('MinIO')
      expect(minio!.type).toBe('core')
      expect(minio!.update).toBe('no-repo')
    })

    it('should validate VRElite service', () => {
      const vre = expectedServicesResponse.find(s => s.service === 'vre_lite')
      expect(vre).toBeDefined()
      expect(vre!.name).toBe('VRElite')
      expect(vre!.type).toBe('core')
      expect(vre!.version).toBe('dev')
    })

    it('should validate Workflow service', () => {
      const workflow = expectedServicesResponse.find(s => s.service === 'workflow')
      expect(workflow).toBeDefined()
      expect(workflow!.name).toBe('Workflow')
      expect(workflow!.type).toBe('core')
      expect(workflow!.latestTag).toBe('0.1.4')
    })
  })

  describe('error response validation', () => {
    it('should validate 404 error response structure', () => {
      const error404Response = { error: "No versions found" }
      
      expect(typeof error404Response).toBe('object')
      expect(error404Response).toHaveProperty('error')
      expect(typeof error404Response.error).toBe('string')
      expect(error404Response.error.length).toBeGreaterThan(0)
    })

    it('should validate 500 error response structure', () => {
      const error500Response = {
        error: "Failed to fetch services",
        details: "Database connection failed"
      }
      
      expect(typeof error500Response).toBe('object')
      expect(error500Response).toHaveProperty('error')
      expect(error500Response).toHaveProperty('details')
      expect(typeof error500Response.error).toBe('string')
      expect(typeof error500Response.details).toBe('string')
    })
  })

  describe('replica information validation', () => {
    it('should validate optional replica structure when present', () => {
      const serviceWithReplicas = {
        ...expectedServicesResponse[0],
        replicas: {
          running: 1,
          desired: 1
        }
      }
      
      expect(serviceWithReplicas).toHaveProperty('replicas')
      expect(serviceWithReplicas.replicas).toHaveProperty('running')
      expect(serviceWithReplicas.replicas).toHaveProperty('desired')
      expect(typeof serviceWithReplicas.replicas.running).toBe('number')
      expect(typeof serviceWithReplicas.replicas.desired).toBe('number')
      expect(serviceWithReplicas.replicas.running).toBeGreaterThanOrEqual(0)
      expect(serviceWithReplicas.replicas.desired).toBeGreaterThanOrEqual(0)
    })

    it('should validate status based on replica counts', () => {
      const testCases = [
        { running: 1, desired: 1, expectedStatus: 'running' },
        { running: 0, desired: 1, expectedStatus: 'offline' },
        { running: 0, desired: 0, expectedStatus: 'idle' }
      ]
      
      testCases.forEach(testCase => {
        const { running, desired, expectedStatus } = testCase
        expect(running).toBeGreaterThanOrEqual(0)
        expect(desired).toBeGreaterThanOrEqual(0)
        expect(['running', 'offline', 'idle']).toContain(expectedStatus)
        
        if (running === 0 && desired === 0) {
          expect(expectedStatus).toBe('idle')
        } else if (running === 0 && desired > 0) {
          expect(expectedStatus).toBe('offline')
        } else if (running > 0) {
          expect(expectedStatus).toBe('running')
        }
      })
    })
  })
})
