import { providers } from 'ethers'
import type { MockedContractMethod } from '../types/provider'

export class MockedProvider extends providers.BaseProvider {
  mockedMethods: MockedContractMethod[] = []

  mockReadContract() {}
}
