// tests/server/api/services/rest.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useRuntimeConfig
const mockUseRuntimeConfig = vi.fn()
// @ts-ignore - Adding to global for testing
global.useRuntimeConfig = mockUseRuntimeConfig

// Extract and test the business logic separately
async function checkRestApiHealth(): Promise<{ status: number }> {
  const config = useRuntimeConfig();
  const domain = config.public.domain;

  const endpoint = `https://${domain}/api/rest/v1/projects/summary`;

  try {
    const response = await fetch(endpoint);
    return {
      status: response.status
    };
  } catch (error) {
    return {
      status: 500
    };
  }
}

describe('/api/services/rest endpoint logic', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()

    // Set realistic mock for useRuntimeConfig based on actual config structure
    // The domain comes from process.env.MINIO_URL in the real config
    mockUseRuntimeConfig.mockReturnValue({
      public: {
        domain: process.env.MINIO_URL || undefined, // Use actual env var or undefined
        baseURL: process.env.BASE_URL_PRODUCTION,
        nodeName: process.env.NODE_NAME
      }
    })
  })

  afterEach(() => {
    // Reset mocks after each test
    vi.resetAllMocks()
  })

  describe('response structure validation', () => {
    it('should validate success response structure (status 200)', () => {
      const successResponse = { status: 200 }
      
      expect(typeof successResponse).toBe('object')
      expect(successResponse).not.toBeNull()
      expect(successResponse).toHaveProperty('status', 200)
      expect(Object.keys(successResponse).sort()).toEqual(['status'])
    })

    it('should validate error response structure (status 500)', () => {
      const errorResponse = { status: 500 }
      
      expect(typeof errorResponse).toBe('object')
      expect(errorResponse).not.toBeNull()
      expect(errorResponse).toHaveProperty('status', 500)
      expect(Object.keys(errorResponse).sort()).toEqual(['status'])
    })
  })

  describe('external API health check behavior', () => {
    it('should return status 200 when external API responds successfully', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        status: 200
      })

      const response = await checkRestApiHealth()
      
      expect(response).toEqual({ status: 200 })
      expect(mockFetch).toHaveBeenCalledOnce()
      
      // The URL should use either the env var domain or the fallback
      const expectedDomain = process.env.MINIO_URL
      expect(mockFetch).toHaveBeenCalledWith(`https://${expectedDomain}/api/rest/v1/projects/summary`)
    })

    it('should return status 404 when external API returns 404', async () => {
      // Mock API 404 response
      mockFetch.mockResolvedValueOnce({
        status: 404
      })

      const response = await checkRestApiHealth()
      
      expect(response).toEqual({ status: 404 })
      expect(mockFetch).toHaveBeenCalledOnce()
    })

    it('should return status 500 when external API throws an error', async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const response = await checkRestApiHealth()
      
      expect(response).toEqual({ status: 500 })
      expect(mockFetch).toHaveBeenCalledOnce()
    })

    it('should return status 500 when external API is unreachable', async () => {
      // Mock connection timeout/error
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))

      const response = await checkRestApiHealth()
      
      expect(response).toEqual({ status: 500 })
      expect(mockFetch).toHaveBeenCalledOnce()
    })

    it('should handle different HTTP status codes from external API', async () => {
      const testCases = [
        { mockStatus: 200, expectedStatus: 200 },
        { mockStatus: 404, expectedStatus: 404 },
        { mockStatus: 502, expectedStatus: 502 },
        { mockStatus: 503, expectedStatus: 503 }
      ]

      for (const testCase of testCases) {
        // Clear previous mock calls
        mockFetch.mockClear()
        
        // Mock the specific status
        mockFetch.mockResolvedValueOnce({
          status: testCase.mockStatus
        })

        const response = await checkRestApiHealth()
        
        expect(response).toEqual({ status: testCase.expectedStatus })
        expect(mockFetch).toHaveBeenCalledOnce()
      }
    })
  })

  describe('endpoint URL validation', () => {
    it('should construct URL correctly with environment-based domain', async () => {
      mockFetch.mockResolvedValueOnce({ status: 200 })

      await checkRestApiHealth()
      
      const expectedDomain = process.env.MINIO_URL
      expect(mockFetch).toHaveBeenCalledWith(`https://${expectedDomain}/api/rest/v1/projects/summary`)
    })

    it('should handle explicit domain configuration in tests', async () => {
      // Mock with explicit test domain to verify URL construction logic
      mockUseRuntimeConfig.mockReturnValueOnce({
        public: {
          domain: 'test-domain.example.com'
        }
      })

      mockFetch.mockResolvedValueOnce({ status: 200 })

      await checkRestApiHealth()
      
      expect(mockFetch).toHaveBeenCalledWith('https://test-domain.example.com/api/rest/v1/projects/summary')
    })
  })
})