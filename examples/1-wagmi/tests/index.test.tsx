import '@testing-library/jest-dom'

import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@byont/mocketh'
import Index from '../pages'
import { createClient, chain, WagmiConfig } from 'wagmi'
import { MockConnector } from 'wagmi/connectors/mock'
import { BigNumber } from 'ethers'
import { WalletSigner } from './getSigner'
import { baycAbi } from '../abis/BoredApeYachtClub'

describe('Index', () => {
  const signer = new WalletSigner(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  )

  it('should render mocked read contract data from the mock provider', async () => {
    const mockProvider = new MockedProvider({
      chainId: chain.mainnet.id,
      ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      name: chain.mainnet.name,
    })

    const client = createClient({
      connectors: [new MockConnector({ options: { signer, flags: {} } })],
      provider: mockProvider,
    })

    mockProvider.mockContractFunction({
      abi: baycAbi,
      address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      functionName: 'apePrice',
      returnValue: BigNumber.from('9999999999999999999'),
    })

    const { getByTestId } = render(<Index />, {
      wrapper: ({ children }) => (
        <WagmiConfig client={client}>{children}</WagmiConfig>
      ),
    })

    await waitFor(() =>
      expect(getByTestId('baycApePriceContainer')).toHaveTextContent(
        '9.999999999999999999'
      )
    )
  })

  it('should render mocked event data from the mock provider', async () => {
    const mockProvider = new MockedProvider({
      chainId: chain.mainnet.id,
      ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      name: chain.mainnet.name,
    })

    mockProvider.mockContractFunction({
      abi: baycAbi,
      address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      functionName: 'apePrice',
      returnValue: BigNumber.from('9999999999999999999'),
    })

    mockProvider.mockEvent({
      abi: baycAbi,
      address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      eventName: 'Transfer',
      returnValue: [
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        BigNumber.from('1'),
      ],
    })

    const client = createClient({
      connectors: [new MockConnector({ options: { signer, flags: {} } })],
      provider: mockProvider,
    })

    const { getByTestId } = render(<Index />, {
      wrapper: ({ children }) => (
        <WagmiConfig client={client}>{children}</WagmiConfig>
      ),
    })

    await waitFor(() =>
      expect(getByTestId('baycApeFromContainer')).toHaveTextContent(
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 1'
      )
    )
  })
})
