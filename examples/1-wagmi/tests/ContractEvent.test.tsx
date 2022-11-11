import '@testing-library/jest-dom'

import { act, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@byont/mocketh'
import { createClient, chain, WagmiConfig } from 'wagmi'
import { BigNumber } from 'ethers'
import { baycAbi } from '../abis/BoredApeYachtClub'
import ContractEvent from '../components/ContractEvent'

describe('<ContractEvent />', () => {
  it('should render mocked event data from the mock provider', async () => {
    const mockProvider = new MockedProvider({
      chainId: chain.mainnet.id,
      name: chain.mainnet.name,
    })

    mockProvider.mockEvent({
      abi: baycAbi,
      eventName: 'Transfer',
      returnValue: [
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        BigNumber.from('1'),
      ],
    })

    const client = createClient({
      provider: mockProvider,
    })

    const { getByTestId } = render(<ContractEvent />, {
      wrapper: ({ children }) => (
        <WagmiConfig client={client}>{children}</WagmiConfig>
      ),
    })

    await act(async () => await mockProvider.waitForEvents())

    await waitFor(() =>
      expect(getByTestId('baycApeFromContainer')).toHaveTextContent(
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 1'
      )
    )
  })
})
