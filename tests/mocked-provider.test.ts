import { BigNumber, Contract, ethers } from 'ethers'
import { MockedProvider } from '../src/mocked-provider'
import { erc721Abi } from './abi/erc721'

describe('MockedProvider', () => {
  let provider: MockedProvider

  beforeEach(() => {
    provider = new MockedProvider({ name: '', chainId: 1 })
  })

  it('should remove mocks when calling clear mocks', () => {
    provider.mockContractFunction({
      address: '0x0000',
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: [BigNumber.from('42')],
    })

    expect(provider.mockedMethods.length).toStrictEqual(1)

    provider.clearMocks()

    expect(provider.mockedMethods.length).toEqual(0)
  })

  it('should mock return data for a contract call', async () => {
    provider.mockContractFunction({
      address: '0x3845874ec9df670d54eb3edebd33b18353905a44',
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: [BigNumber.from('42')],
      args: ['0x3845874ec9df670d54eb3edebd33b18353905a44'],
    })

    const contract = new ethers.Contract(
      '0x3845874ec9df670d54eb3edebd33b18353905a44',
      erc721Abi,
      provider
    )

    expect(
      await contract.balanceOf('0x3845874ec9df670d54eb3edebd33b18353905a44')
    ).toEqual(BigNumber.from('42'))
  })

  it('should prefer mocks with address over mock without address', async () => {
    provider.mockContractFunction({
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: [BigNumber.from('1')],
    })

    provider.mockContractFunction({
      address: '0x3845874ec9df670d54eb3edebd33b18353905a44',
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: [BigNumber.from('2')],
    })

    provider.mockContractFunction({
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: [BigNumber.from('1')],
    })

    const contract = new ethers.Contract(
      '0x3845874ec9df670d54eb3edebd33b18353905a44',
      erc721Abi,
      provider
    )

    expect(
      await contract.balanceOf('0x3845874ec9df670d54eb3edebd33b18353905a44')
    ).toEqual(BigNumber.from('2'))
  })

  it('should prefer mocks with args over mock without args', async () => {
    provider.mockContractFunction({
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: [BigNumber.from('1')],
    })

    provider.mockContractFunction({
      abi: erc721Abi,
      functionName: 'balanceOf',
      args: ['0x3845874ec9df670d54eb3edebd33b18353905a44'],
      returnValue: [BigNumber.from('2')],
    })

    provider.mockContractFunction({
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: [BigNumber.from('1')],
    })

    const contract = new ethers.Contract(
      '0x3845874ec9df670d54eb3edebd33b18353905a44',
      erc721Abi,
      provider
    )

    expect(
      await contract.balanceOf('0x3845874ec9df670d54eb3edebd33b18353905a44')
    ).toEqual(BigNumber.from('2'))
  })

  it('should mock listener after registering events', async () => {
    /** Mocked ERC721 Transfer event return values */
    const contractAddress = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'
    const fromAddress = '0x31B0C4112A9AA5B79cA5883465bFC4Cd013c6282'
    const toAddress = '0x31B0C4112A9AA5B79cA5883465bFC4Cd013c6282'
    const tokenId = BigNumber.from('999999999')

    /** Create a new mock provider */
    const mockProvider = new MockedProvider({ chainId: 1, name: 'mainnet' })

    /**
     * Create a mocked listener, later we can test if it was called with the
     * correct arguments
     */
    const mockedListener = jest.fn()

    mockProvider.mockEvent({
      abi: erc721Abi,
      address: contractAddress,
      /** We assume a standard ERC721 */
      eventName: 'Transfer',
      returnValue: [fromAddress, toAddress, tokenId],
    })

    /** Register the listener with Ethers */
    const contract = new Contract(contractAddress, erc721Abi, mockProvider)
    contract.on('Transfer', mockedListener)

    /**
     * Events in Ethers are on a timer, we can await for them to resolve using
     * this function
     */
    await mockProvider.waitForEvents()

    /** Notice how the balanceOf function returns the mocked value */
    expect(mockedListener).toHaveBeenCalledWith(
      fromAddress,
      toAddress,
      tokenId,
      /** The last parameters is the actual event */
      expect.anything()
    )

    mockProvider.removeAllListeners()

    /** Clear all mocks so we leave a clean test */
    mockProvider.clearMocks()
  })
})
