import { deepClone, jsonReplacer } from '../index'

test('nest map use JSON.stringify to string json', () => {
  const map = new Map<string, any>()
  const map1 = new Map<string, any>()
  map1.set('tmp', '123')
  map.set('tmp', '123')
  map.set('subMap', map1)

  const result = {
    tmp: '123',
    subMap: {
      tmp: '123',
    },
  }
  expect(JSON.stringify(map, jsonReplacer)).toBe(JSON.stringify(result))
})

test('deepClone', () => {
  const source = {
    a: 'string',
    b: 1000.01,
    c: true,
    d: {
      x: '1',
      y: false,
    },
    e: [1, 2, 3],
    f: [{ t: '1' }, { y: '2' }],
  }
  const target = deepClone(source)
  expect(target).toStrictEqual(source)
  expect(JSON.stringify(target)).toStrictEqual(JSON.stringify(source))

  expect(() => {
    deepClone('')
  }).toThrow('error arguments shallowClone')
})
