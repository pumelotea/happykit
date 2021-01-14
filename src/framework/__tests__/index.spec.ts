import { createHappyFramework } from '../index'

test('createHappyFramework instance', () => {
  const framework = createHappyFramework()
  expect(framework).not.toBe(null)
})
