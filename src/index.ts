import { MockedProvider } from './mocked-provider'

export function getMockedProvider(
  ...args: ConstructorParameters<typeof MockedProvider>
) {
  return new MockedProvider(...args)
}

export * from './mocked-provider'
export * from './errors'
