// tests/server/utils/runningVersion.test.ts
// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import http from 'http'
import net from 'net'
import os from 'os'
import path from 'path'
import { mkdtemp, writeFile, rm } from 'fs/promises'
import { AddressInfo } from 'net'
import { runningVersion } from '../../../server/utils/runningVersion'

let server: http.Server
let base: string
let closedBase: string
let tmpDir: string

beforeAll(async () => {
  server = http.createServer((req, res) => {
    if (req.url === '/rest') {
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ 'software version': '0.0.19' }))
    } else if (req.url === '/rest-old') {
      res.setHeader('content-type', 'text/html')
      res.end('<html>old</html>')
    } else if (req.url === '/version.txt') {
      res.end('0.0.21\n')
    } else if (req.url === '/spa.txt') {
      res.setHeader('content-type', 'text/html')
      res.end('<!doctype html><html><body>app</body></html>')
    } else {
      res.statusCode = 404
      res.end('not found')
    }
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  const probe = net.createServer()
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve))
  closedBase = `http://127.0.0.1:${(probe.address() as AddressInfo).port}`
  await new Promise<void>(resolve => probe.close(() => resolve()))
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'vre-version-'))
})

afterAll(async () => {
  server.close()
  await rm(tmpDir, { recursive: true })
})

describe('runningVersion', () => {
  it('reads the REST version from its JSON field', async () => {
    const sources = { rest: { url: `${base}/rest`, field: 'software version' } }
    expect(await runningVersion('rest', sources)).toBe('0.0.19')
  })
  it('reads a plain version file over HTTP', async () => {
    const sources = { client: { url: `${base}/version.txt` } }
    expect(await runningVersion('client', sources)).toBe('0.0.21')
  })
  it('reads a local version file', async () => {
    const file = path.join(tmpDir, 'version.txt')
    await writeFile(file, 'dev\n')
    expect(await runningVersion('vre_lite', { vre_lite: { file } })).toBe('dev')
  })
  it('returns null for a missing local version file', async () => {
    expect(await runningVersion('vre_lite', { vre_lite: { file: path.join(tmpDir, 'missing.txt') } })).toBeNull()
  })
  it('returns null for services it cannot ask', async () => {
    expect(await runningVersion('loader', { rest: { url: `${base}/rest` } })).toBeNull()
  })
  it('returns null when the service does not answer', async () => {
    expect(await runningVersion('client', { client: { url: `${closedBase}/version.txt` } })).toBeNull()
  })
  it('returns null for an HTTP error (old image without the file)', async () => {
    expect(await runningVersion('client', { client: { url: `${base}/nothing.txt` } })).toBeNull()
  })
  it('returns null when a single-page app answers with its HTML', async () => {
    expect(await runningVersion('client', { client: { url: `${base}/spa.txt` } })).toBeNull()
  })
  it('returns null when the REST answer is not JSON', async () => {
    expect(await runningVersion('rest', { rest: { url: `${base}/rest-old`, field: 'software version' } })).toBeNull()
  })
})
