import '@testing-library/jest-dom'

import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@byont/mocketh'
import { createClient, chain, WagmiConfig } from 'wagmi'
import { BigNumber } from 'ethers'
import { baycAbi } from '../abis/BoredApeYachtClub'
import ContractRead from '../components/ContractRead'

describe('<ContractRead />', () => {
  it('should render mocked read contract data from the mock provider', async () => {
    const mockProvider = new MockedProvider({
      chainId: chain.mainnet.id,
      ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      name: chain.mainnet.name,
    })

    const client = createClient({
      provider: mockProvider,
    })

    mockProvider.mockContractFunction({
      abi: baycAbi,
      address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      functionName: 'apePrice',
      returnValue: [BigNumber.from('9999999999999999999')],
    })

    const { getByTestId } = render(<ContractRead />, {
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
})
