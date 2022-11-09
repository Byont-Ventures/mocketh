import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@byont/mocketh'
import Index from '../pages'
import { createClient, chain, configureChains, WagmiConfig } from 'wagmi'
import { MockConnector } from 'wagmi/connectors/mock'
import { BigNumber, providers, Wallet } from 'ethers'
import { WalletSigner } from './getSigner'
import { baycAbi } from '../abis/BoredApeYachtClub'

describe('Index', () => {
  const mockProvider = new MockedProvider({
    chainId: chain.mainnet.id,
    ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    name: chain.mainnet.name,
  })

  const signer = new WalletSigner(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  )

  beforeEach(() => {
    mockProvider.clearMocks()
  })

  it('should render mocked data from the mock provider', async () => {
    const client = createClient({
      connectors: [new MockConnector({ options: { signer, flags: {} } })],
      provider: mockProvider,
    })

    mockProvider.mockContractCall({
      abi: baycAbi,
      address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      functionName: 'apePrice',
      returnValue: BigNumber.from('9999999999999999999').toBigInt(),
    })

    const { getByTestId } = render(<Index />, {
      wrapper: ({ children }) => (
        <WagmiConfig client={client}>{children}</WagmiConfig>
      ),
    })

    await waitFor(() =>
      expect(getByTestId('baycApePriceContainer')).toEqual(
        '9.999999999999999999'
      )
    )
  })
})
