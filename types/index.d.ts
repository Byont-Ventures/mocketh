import { BigNumber, utils } from 'ethers'
import { GetReturnType } from './abitype'

declare module 'abitype' {
  export interface Config {
    BigIntType: BigNumber
  }
}

export interface MockedContractMethod {
  encodedFunctionData: string
  contractInterface: utils.Interface
  returnValue: GetReturnType<{
    abi: unknown[]
    functionName: string
  }>
  address?: string
}

export interface MockedContractEvent {
  contractInterface: utils.Interface
  topic: string
  returnValue: AbiParametersToPrimitiveTypes<
    ExtractAbiEvent<TAbi, string>['inputs']
  >
  address?: string
}

export * from './abitype'
