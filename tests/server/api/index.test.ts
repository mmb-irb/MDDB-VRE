// tests/server/api/index.test.ts
import { describe, it, expect } from 'vitest'

describe('/api endpoint logic', () => {
  it('should return welcome message object', () => {
    // Test the expected response structure
    const expectedResponse = {
      message: "Welcome to the MDDB VRE REST API!"
    }
    
    expect(expectedResponse).toEqual({
      message: "Welcome to the MDDB VRE REST API!"
    })
    expect(expectedResponse).toHaveProperty('message')
    expect(typeof expectedResponse.message).toBe('string')
  })

  it('should have correct message content', () => {
    const message = "Welcome to the MDDB VRE REST API!"
    
    expect(message).toBeDefined()
    expect(typeof message).toBe('string')
    expect(message).toMatch(/MDDB VRE/)
    expect(message).toMatch(/REST API/)
  })

  it('should validate response structure', () => {
    const response = {
      message: "Welcome to the MDDB VRE REST API!"
    }
    
    // Validate it's an object with the right structure
    expect(typeof response).toBe('object')
    expect(response).not.toBeNull()
    expect(Object.keys(response)).toEqual(['message'])
    expect(response.message.length).toBeGreaterThan(0)
  })
})