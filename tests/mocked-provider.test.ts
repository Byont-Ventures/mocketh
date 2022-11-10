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
      returnValue: BigNumber.from('42'),
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
      returnValue: BigNumber.from('42'),
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
      returnValue: BigNumber.from('1'),
    })

    provider.mockContractFunction({
      address: '0x3845874ec9df670d54eb3edebd33b18353905a44',
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: BigNumber.from('2'),
    })

    provider.mockContractFunction({
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: BigNumber.from('1'),
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
      returnValue: BigNumber.from('1'),
    })

    provider.mockContractFunction({
      abi: erc721Abi,
      functionName: 'balanceOf',
      args: ['0x3845874ec9df670d54eb3edebd33b18353905a44'],
      returnValue: BigNumber.from('2'),
    })

    provider.mockContractFunction({
      abi: erc721Abi,
      functionName: 'balanceOf',
      returnValue: BigNumber.from('1'),
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
})
