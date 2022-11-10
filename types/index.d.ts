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

export * from './abitype'
