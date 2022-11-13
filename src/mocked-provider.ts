import { providers, utils } from 'ethers'

import type {
  Abi,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
  ExtractAbiEventNames,
  AbiParametersToPrimitiveTypes,
  ExtractAbiEvent,
} from 'abitype'

import { MockNotFoundError, NotImplementedError } from './errors'
import type {
  MockedContractMethod,
  MockedContractEvent,
  GetArgs,
} from '../types'

interface PerformParamsCall {
  transaction: { to: string; data: string; accessList: null }
  blockTag: string
}

interface PerformParamsGetLogs {
  filter: {
    address: string
    fromBlock: string
    toBlock: string
    topics: string[]
  }
}

export class MockedProvider extends providers.BaseProvider {
  mockedMethods: MockedContractMethod[] = []
  mockedEvents: MockedContractEvent[] = []

  runningEvents: Promise<unknown>[] = []

  getBlockNumber() {
    return new Promise<number>((resolve) => resolve(1))
  }

  detectNetwork() {
    return new Promise<providers.Network>((resolve) => resolve(this.network))
  }

  perform(
    method: 'getBlockNumber' | 'getLogs' | 'call',
    params: PerformParamsCall | PerformParamsGetLogs
  ) {
    if (method === 'getBlockNumber') {
      return this.getBlockNumber()
    }

    if (method === 'call' && 'transaction' in params) {
      return this.getContractMethodResult(
        params.transaction.data,
        params.transaction.to
      )
    }

    if (method === 'getLogs' && 'filter' in params) {
      return this.getContractEventMockResult(
        params.filter.topics,
        params.filter.address
      )
    }

    throw new NotImplementedError(`Method ${method} is not implemented.`)
  }

  /**
   * @param eventName
   * @param listener
   * @returns
   */
  on(eventName: providers.EventType, listener: providers.Listener) {
    const promiseEvent = new Promise((resolve, reject) =>
      super
        .once(eventName, (...args) => {
          listener.apply(this, args)
          setTimeout(() => resolve(true), 0)
        })
        .once('error', reject)
    )

    this.runningEvents = [...this.runningEvents, promiseEvent]

    return this
  }

  /**
   * Events are async in ethers, this method can be used to wait for them to be
   * completed
   */
  async waitForEvents() {
    await Promise.all(this.runningEvents)
  }

  /**
   * Mock a contract call to a smart contract. You can provide a ABI with const
   * assertion (@see https://github.com/wagmi-dev/abitype#usage), to
   * automatically type the `functionName`, `returnValue`, and `args`
   * properties. When performing the actual smart contract call the best
   * matching mocked method will be used. When not supplying the args and
   * address any call to that method will be mocked.
   *
   * @param props.abi - The const asserted abi object that let's us type the
   *   other arguments
   * @param props.functionName - The function to mock
   * @param props.returnValue - The value to return
   * @param props.address - The address to match against
   * @param props.args - The argument list to match against
   */
  mockContractFunction<
    TAbi extends Abi,
    TFuncName extends ExtractAbiFunctionNames<TAbi>,
    TFunc extends ExtractAbiFunction<TAbi, TFuncName>
  >({
    abi,
    functionName,
    returnValue,
    address,
    args,
  }: {
    abi: TAbi
    functionName: TFuncName
    returnValue: AbiParametersToPrimitiveTypes<TFunc['outputs']>

    address?: string
    args?: GetArgs<
      typeof abi,
      ExtractAbiFunction<typeof abi, typeof functionName>
    >['args']
  }) {
    /**
     * The type do match but wagmi-dev/abitype is too specific for Ethers to
     * understand so we first cast the type to unknown.
     */
    const contractInterface = new utils.Interface(
      abi as unknown as ReadonlyArray<utils.Fragment>
    )

    /**
     * If arguments are not provided there is a type and value mismatch. The
     * data will be encoded as:
     * `{10:bytes:functionSignature}{...functionArgumentsData}`
     */
    const functionSignature = contractInterface.getSighash(functionName)
    const encodedFunctionData = args
      ? contractInterface.encodeFunctionData(functionSignature, args)
      : functionSignature

    /** Copies and sets the mocked methods to the supplied data */
    this.mockedMethods = [
      ...this.mockedMethods,
      {
        address,
        returnValue,
        encodedFunctionData,
        contractInterface,
      },
    ]
  }

  mockEvent<
    TAbi extends Abi,
    TEventName extends ExtractAbiEventNames<TAbi>,
    TAbiEvent extends ExtractAbiEvent<TAbi, TEventName>
  >({
    abi,
    eventName,
    returnValue,
    address,
  }: {
    abi: TAbi
    eventName: TEventName
    returnValue: AbiParametersToPrimitiveTypes<TAbiEvent['inputs']>
    address?: string
  }) {
    /**
     * The type do match but wagmi-dev/abitype is too specific for Ethers to
     * understand so we first cast the type to unknown.
     */
    const contractInterface = new utils.Interface(
      abi as unknown as ReadonlyArray<utils.Fragment>
    )

    /**
     * Gets the full event fragment from the name. E.g., Transfer becomes
     * Transfer(address from, address to, uint256 amount)
     */
    const eventFragment = Object.keys(contractInterface.events).find(
      (key) => contractInterface.events[key].name === eventName
    )

    if (eventFragment === undefined) {
      throw new Error('')
    }

    const topic = utils.id(eventFragment)

    /** Copies and sets the mocked events to the supplied data */
    this.mockedEvents = [
      ...this.mockedEvents,
      { address, returnValue, topic, contractInterface },
    ]
  }

  /** Clears all mocks */
  clearMocks() {
    this.mockedMethods = []
    this.mockedEvents = []
    this.runningEvents = []
  }

  /**
   * Get's the encoded returnValue for a mock that best matches with address or
   * functionData.
   *
   * @param functionData
   * @param address The address the call is forwarded to, this value will be
   *   used to find the best matching mock
   * @returns Encoded function data
   */
  getContractMethodResult(functionData: string, address: string) {
    const contractMocks = this.mockedMethods
      /**
       * Filter out all potential mocks. The first 10 bytes of the functionData
       * is the actual function signature. Mocks without arguments are actually
       * contained in the functionData (e.g., the first 10 bytes should be the
       * same)
       */
      .filter(
        (mock) =>
          functionData.indexOf(mock.encodedFunctionData) !== -1 &&
          (mock.address === undefined ||
            utils.getAddress(mock.address) === utils.getAddress(address))
      )
      /**
       * Address match gets the highest priority, but if they're the same we'll
       * return the mock with matching function data. This works because
       * aUndefined - bUndefined === 0 is falsy, and thus the condition after
       * the or statement is checked
       */
      .sort((a, b) => {
        const aUndefined = a.address === undefined ? 1 : -1
        const bUndefined = b.address === undefined ? 1 : -1

        const aArgMatch = functionData === a.encodedFunctionData ? -1 : 1
        const bArgMatch = functionData === b.encodedFunctionData ? -1 : 1

        return aUndefined - bUndefined || aArgMatch - bArgMatch
      })

    if (contractMocks.length === 0)
      throw new MockNotFoundError(
        `Mock with signature ${functionData} not found.`
      )

    const contractMock = contractMocks[0]

    /** This extracts the solidity types for the function data */
    const functionFragment = contractMock.contractInterface.getFunction(
      functionData.substring(0, 10)
    )

    /** Encode the function data correctly */
    const functionResult = contractMock.contractInterface.encodeFunctionResult(
      functionFragment,
      contractMock.returnValue
    )

    return new Promise((resolve) => resolve(functionResult))
  }

  getContractEventMockResult(topics: string[], address: string) {
    this.mockedEvents.filter((event) => {
      return event.topic === topics[0]
    })

    const contractMocks = this.mockedEvents
      /**
       * Filter out all potential mocks. The first 10 bytes of the functionData
       * is the actual function signature. Mocks without arguments are actually
       * contained in the functionData (e.g., the first 10 bytes should be the
       * same)
       */
      .filter(
        (mock) =>
          mock.topic === topics[0] &&
          (mock.address === undefined ||
            utils.getAddress(mock.address) === utils.getAddress(address))
      )
      /**
       * Address match gets the highest priority, but if they're the same we'll
       * return the mock with matching function data. This works because
       * aUndefined - bUndefined === 0 is falsy, and thus the condition after
       * the or statement is checked
       */
      .sort((a, b) => {
        const aUndefined = a.address === undefined ? 1 : -1
        const bUndefined = b.address === undefined ? 1 : -1
        return aUndefined - bUndefined || 0
      })

    if (contractMocks.length === 0)
      throw new MockNotFoundError(`Mock with topics ${topics} not found.`)

    const contractMock = contractMocks[0]

    const eventFragment = contractMock.contractInterface.getEvent(
      contractMock.topic
    )

    const eventResult = contractMock.contractInterface.encodeEventLog(
      eventFragment,
      contractMock.returnValue
    )

    return new Promise((resolve) =>
      resolve([
        {
          ...eventResult,
          logIndex: '0x01',
          blockNumber: '0x01',
          blockHash:
            '0xb379544ce020fad519dab65138b8563cd0077608b941358d2d4afb062b8f2fe0',
          transactionIndex: '0x01',
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          transactionHash:
            '0xb379544ce020fad519dab65138b8563cd0077608b941358d2d4afb062b8f2fe0',
        },
      ])
    )
  }
}
