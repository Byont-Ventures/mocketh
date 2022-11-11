# MockEth

MockEth is a typed ethers.js mocking library for mocking Ethereum calls. It works by implementing a custom provider that intercepts and impersonates Ethereum calls.

## Install

```bash
pnpm install --save-dev @byont/mocketh
```

## Features

- [x] Mock smart contract function calls
- [x] Mock smart contract events
- [ ] Mock sending transactions
- [ ] Mock getting block number
- [ ] Mock sign typed-data
- [ ] Mock estimate gas fees
- [x] Fully typed mock arguments and returned values using [abitype](https://github.com/wagmi-dev/abitype)

## Usage

For this library to work with types you should define your ABI using [`const assertion`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)

```ts
// ./example-abi.ts
const ExampleAbi = [...] as const
```

### Mock smart contract function calls

```ts
// ethers.test.ts
import { Contract, BigNumber } from 'ethers'
import { MockedProvider } from '@byont/mocketh'
import { ExampleAbi } from './example-abi'

/** Mocking parameters */
const contractAddress = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'
const balanceAddress = '0x31b0c4112a9aa5b79ca5883465bfc4cd013c6282'
const mockedBalance = BigNumber.from('999999999')

/** Create a new mock provider */
const mockProvider = new MockedProvider({ chainId: 1, name: 'mainnet' })

/** Mock the actual function */
mockProvider.mockContractFunction({
  abi: ExampleAbi,
  address: contractAddress,
  functionName: 'balanceOf',
  args: [balanceAddress],
  returnValue: mockedBalance,
})

/** Execute the call how you would normally do it */
const contract = new Contract(contractAddress, ExampleAbi, mockProvider)
const [returnedBalance] = await contract.functions.balanceOf(balanceAddress)

/** Notice how the balanceOf function returns the mocked value */
expect(mockedBalance).toEqual(returnedBalance)

/** Clear all mocks so we leave a clean test */
mockProvider.clearMocks()
```

### Mock smart contract events

```ts
// ethers.test.ts
import { Contract, BigNumber, utils } from 'ethers'
import { MockedProvider } from '@byont/mocketh'
import { ExampleAbi } from './example-abi'

/** Mocked ERC721 Transfer event return values */
const contractAddress = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'
const fromAddress = '0x31B0C4112A9AA5B79cA5883465bFC4Cd013c6282'
const toAddress = '0x31B0C4112A9AA5B79cA5883465bFC4Cd013c6282'
const tokenId = BigNumber.from('999999999')

/** Create a new mock provider */
const mockProvider = new MockedProvider({ chainId: 1, name: 'mainnet' })

/**
 * Create a mocked listener, later we can test if it was called with the correct
 * arguments
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
 * Events in Ethers are on a timer, we can await for them to resolve using this
 * function
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

/** Clear all mocks so we leave a clean test */
mockProvider.clearMocks()
```

See [tests](/tests/mocked-provider.test.ts) for how to implement this with [Wagmi](https://github.com/wagmi-dev/wagmi).
