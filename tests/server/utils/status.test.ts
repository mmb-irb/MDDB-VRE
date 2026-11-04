// tests/server/utils/status.test.ts
// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import http from 'http'
import net from 'net'
import { AddressInfo } from 'net'
import { checkService, serviceStatus, serviceUrls } from '../../../server/utils/status'

let server: http.Server
let upUrl: string
let closedUrl: string

beforeAll(async () => {
  server = http.createServer((req, res) => { res.statusCode = 404; res.end('nope') })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  upUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`
  // Get a free port and close it again, so nothing listens there
  const probe = net.createServer()
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve))
  const closedPort = (probe.address() as AddressInfo).port
  await new Promise<void>(resolve => probe.close(() => resolve()))
  closedUrl = `http://127.0.0.1:${closedPort}/`
})

afterAll(() => { server.close() })

const missingHostUrl = 'http://service-that-does-not-exist.invalid/'
// Resolving a missing name can take several seconds, depending on the DNS of the machine running the tests
const DNS_TIMEOUT = 30000

describe('checkService', () => {
  it('reports running for any HTTP answer, even a 404', async () => {
    expect(await checkService(upUrl)).toBe('running')
  })
  it('reports offline when nothing listens', async () => {
    expect(await checkService(closedUrl)).toBe('offline')
  })
  it('reports not-found when the host name does not exist', async () => {
    expect(await checkService(missingHostUrl)).toBe('not-found')
  }, DNS_TIMEOUT)
})

describe('serviceStatus', () => {
  // Built inside each test: the URLs only exist once beforeAll has run
  const urls = () => ({ client: upUrl, rest: closedUrl, minio: missingHostUrl, services_monitor: missingHostUrl })

  it('uses fixed statuses for vre_lite and one-off services', async () => {
    expect(await serviceStatus('vre_lite', 'core', urls())).toBe('running')
    expect(await serviceStatus('loader', 'core', urls())).toBe('idle')
    expect(await serviceStatus('workflow', 'core', urls())).toBe('idle')
  })
  it('checks the other services over HTTP', async () => {
    expect(await serviceStatus('client', 'core', urls())).toBe('running')
    expect(await serviceStatus('rest', 'core', urls())).toBe('offline')
  })
  it('reports a missing core service as offline, so services_monitor alerts', async () => {
    expect(await serviceStatus('minio', 'core', urls())).toBe('offline')
  }, DNS_TIMEOUT)
  it('reports a missing development service as not-found, so the page hides it', async () => {
    expect(await serviceStatus('services_monitor', 'development', urls())).toBe('not-found')
  }, DNS_TIMEOUT)
  it('reports unknown for services it has no URL for', async () => {
    expect(await serviceStatus('something_else', 'core', urls())).toBe('unknown')
  })
})

describe('serviceUrls', () => {
  it('builds the URLs from the environment', () => {
    expect(serviceUrls({ CLIENT_INNER_PORT: '80', REST_INNER_PORT: '3000', MINIO_ADDRESS: 'minio', MINIO_API_PORT: '9002' })).toEqual({
      client: 'http://client:80/',
      rest: 'http://rest:3000/',
      minio: 'http://minio:9002/minio/health/live',
      services_monitor: 'http://services_monitor:3001/',
    })
  })
})
