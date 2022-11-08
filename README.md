# MockEth

A fully-typed ethers.js mocking library for mocking smart contracts

## Usage

```ts
import { getMockedProvider } from '@byont/mocketh'
import { ExampleAbi } from './example-abi'

const providerMock = getMockedProvider()

providerMock.mockContractCall({
  /** BAYC */
  address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
  abi: erc721Abi,
  functionName: 'balanceOf',
  returnValue: BigNumber.from('1').toBigInt(),
  args: ['0x31b0c4112a9aa5b79ca5883465bfc4cd013c6282'],
})

// Your test

providerMock.clearMocks()
```

See [tests](/tests/mocked-provider.test.ts) for more examples.
