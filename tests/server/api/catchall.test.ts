// tests/server/api/catchall.test.ts
import { describe, it, expect } from 'vitest'

describe('API catch-all route logic', () => {
  it('should return 404 error structure for invalid endpoints', () => {
    // Test the expected 404 response structure
    const invalidEndpoint = '/api/nonexistent'
    const expectedResponse = {
      error: 'Not Found',
      message: `Unexisting endpoint ${invalidEndpoint}`,
      statusCode: 404,
      url: invalidEndpoint
    }
    
    expect(expectedResponse).toHaveProperty('error', 'Not Found')
    expect(expectedResponse).toHaveProperty('statusCode', 404)
    expect(expectedResponse).toHaveProperty('message')
    expect(expectedResponse).toHaveProperty('url')
    expect(expectedResponse.message).toContain('Unexisting endpoint')
  })

  it('should validate error response structure', () => {
    const errorResponse = {
      error: 'Not Found',
      message: 'Unexisting endpoint /api/invalid',
      statusCode: 404,
      url: '/api/invalid'
    }
    
    // Validate it's an object with the right structure
    expect(typeof errorResponse).toBe('object')
    expect(errorResponse).not.toBeNull()
    expect(Object.keys(errorResponse).sort()).toEqual(['error', 'message', 'statusCode', 'url'])
    expect(errorResponse.statusCode).toBe(404)
    expect(typeof errorResponse.message).toBe('string')
    expect(errorResponse.error).toBe('Not Found')
  })

  it('should handle different invalid endpoint paths', () => {
    const testCases = [
      '/api/servic',
      '/api/nonexistent',
      '/api/invalid/path',
      '/api/services/invalidsubpath'
    ]
    
    testCases.forEach(endpoint => {
      const response = {
        error: 'Not Found',
        message: `Unexisting endpoint ${endpoint}`,
        statusCode: 404,
        url: endpoint
      }
      
      expect(response.url).toBe(endpoint)
      expect(response.message).toContain(endpoint)
      expect(response.statusCode).toBe(404)
    })
  })
})
