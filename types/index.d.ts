import { Abi } from 'abitype'
import { BigNumber, utils } from 'ethers'

declare module 'abitype' {
  export interface Config {
    BigIntType: BigNumber
  }
}

export interface MockedContractMethod {
  encodedFunctionData: string
  contractInterface: utils.Interface
  returnValue: AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<Abi, string>['outputs']
  >
  address?: string
}

export interface MockedContractEvent {
  contractInterface: utils.Interface
  topic: string
  returnValue: AbiParametersToPrimitiveTypes<
    ExtractAbiEvent<Abi, string>['inputs']
  >
  address?: string
}

export * from './abitype'
