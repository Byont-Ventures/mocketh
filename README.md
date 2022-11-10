# MockEth

A fully-typed ethers.js mocking library for mocking smart contracts

## Usage

```ts
import { MockedProvider } from '@byont/mocketh'
import { ExampleAbi } from './example-abi'

const providerMock = new MockedProvider({ chainId: 1, name: 'mainnet' })

providerMock.mockContractFunction({
  /** BAYC */
  address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
  abi: erc721Abi,
  functionName: 'balanceOf',
  args: ['0x31b0c4112a9aa5b79ca5883465bfc4cd013c6282'],
  returnValue: BigNumber.from('999999999'),
})

await waitFor(() =>
  expect(getByTestId('TestComponent')).toHaveTextContent('999999999')
)

providerMock.clearMocks()
```

See [tests](/tests/mocked-provider.test.ts) for more examples.

## Current status

- [x] `mockContractFunction`
- [x] `mockContractEvent`
