import { MockedProvider } from './provider'

export function getMockedProvider(
  ...args: ConstructorParameters<typeof MockedProvider>
) {
  return new MockedProvider(...args)
}

export * from './provider'
export * from './errors'
