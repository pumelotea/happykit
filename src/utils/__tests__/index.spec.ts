import { jsonReplacer } from '../index'

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
