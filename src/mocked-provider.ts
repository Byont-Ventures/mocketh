import { GetReturnType } from '../types/abitype'
import { Abi, ExtractAbiFunctionNames } from 'abitype'
import { BigNumber, providers, utils } from 'ethers'
import type { MockedContractMethod } from '../types/provider'
import { MockNotFoundError, NotImplementedError } from './errors'

export class MockedProvider extends providers.BaseProvider {
  mockedMethods: MockedContractMethod[] = []

  getBlockNumber() {
    return new Promise<number>((resolve) => resolve(1))
  }

  detectNetwork() {
    return new Promise<providers.Network>((resolve) => resolve(this.network))
  }

  perform(
    method: 'getBlockNumber' | 'call',
    params: {
      transaction: { to: string; data: string; accessList: null }
      blockTag: string
    }
  ) {
    if (method === 'getBlockNumber') {
      return this.getBlockNumber()
    }

    if (method === 'call') {
      return this.#getContractMock(params.transaction.data)
    }

    throw new NotImplementedError(`Method ${method} is not implemented.`)
  }

  mockContractCall<
    TAbi extends Abi,
    TFunc extends ExtractAbiFunctionNames<TAbi>
  >({
    address,
    abi,
    functionName,
    returnValue,
  }: {
    address: string
    abi: TAbi
    functionName: TFunc
    returnValue: GetReturnType<{
      abi: typeof abi
      functionName: typeof functionName
    }>
  }) {
    const contractInterface = new utils.Interface(
      abi as unknown as ReadonlyArray<utils.Fragment>
    )

    const functionSignature = contractInterface.getSighash(functionName)

    this.mockedMethods = [
      ...this.mockedMethods,
      {
        abi,
        address,
        functionName,
        functionSignature,
        contractInterface,
        returnValue,
      },
    ]
  }

  clearMocks() {
    this.mockedMethods = []
  }

  #getContractMock(functionSignature: string) {
    const contractMock = this.mockedMethods.find(
      (mock) => mock.functionSignature === functionSignature
    )

    if (undefined === contractMock)
      throw new MockNotFoundError(
        `Mock with signature ${functionSignature} not found.`
      )

    const functionFragment =
      contractMock.contractInterface.getFunction(functionSignature)

    const functionData = contractMock.contractInterface.encodeFunctionResult(
      functionFragment,
      [contractMock.returnValue]
    )

    return new Promise((resolve) => resolve(functionData))
  }
}
