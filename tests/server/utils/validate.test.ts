// tests/server/utils/validate.test.ts
import { describe, it, expect } from 'vitest'
import { parseBucket, parseFileName } from '../../../server/utils/validate'

const expect400 = (fn: () => unknown) => {
  try {
    fn()
  } catch (error: any) {
    expect(error.statusCode).toBe(400)
    return
  }
  throw new Error('expected a 400 error')
}

describe('parseBucket', () => {
  it('accepts ids made by the client', () => {
    expect(parseBucket('a1b2c3')).toBe('a1b2c3')
    expect(parseBucket(['a1b2c3'])).toBe('a1b2c3') // formidable v3 fields are arrays
  })

  it.each([
    undefined, '', 'abc', 'ABCDEF', '*', 'a1b2c3*', 'a1b2c3/x', '../a1b2c3',
    'a1b2c3; id', 'a1b2c3$(id)', 'a1b2c3`id`', 'a1b2c3 x', 'a1b2c3\n', 'a'.repeat(33),
    ['a1b2c3', 'd4e5f6'], [], 123
  ])('rejects %j', (value) => {
    expect400(() => parseBucket(value))
  })
})

describe('parseFileName', () => {
  it.each(['traj.xtc', 'inputs.yaml', 'my topology (1).pdb', '-weird.dcd'])('accepts %j', (name) => {
    expect(parseFileName(name)).toBe(name)
  })

  it.each([
    undefined, null, '', '.', '..', '../etc/passwd', '/etc/passwd', 'a/b.xtc', 'a\\b.xtc', 'a\0b'
  ])('rejects %j', (name) => {
    expect400(() => parseFileName(name))
  })
})
