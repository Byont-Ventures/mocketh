import { MockedProvider } from '../src/mocked-provider'
import { erc721Abi } from './abi/erc721'

describe('MockedProvider', () => {
  let provider: MockedProvider

  beforeEach(() => {
    provider = new MockedProvider({ name: '', chainId: 1 })
  })

  it('should remove mocks when calling clear mocks', () => {
    provider.mockContractCall({
      address: '0x0000',
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: BigInt('42'),
    })

    expect(provider.mockedMethods.length).toStrictEqual(1)

    provider.clearMocks()

    expect(provider.mockedMethods.length).toEqual(0)
  })
})
