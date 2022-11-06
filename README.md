# MockEth

A fully-typed ethers.js mocking library for mocking smart contracts

## Usage

```ts
import { getMockedProvider } from '@byont/mocketh'
import { ExampleAbi } from './example-abi'

const providerMock = getMockedProvider()

providerMock.mockReadContract(
  '0x0000000000000000000000000000000000000000',
  ExampleAbi,
  'getSomeString',
  'Mocked string'
)
```
