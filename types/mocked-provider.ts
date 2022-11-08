import { utils } from 'ethers'
import { GetReturnType } from './abitype'

export interface MockedContractMethod {
  encodedFunctionData: string
  contractInterface: utils.Interface
  returnValue: GetReturnType<{
    abi: unknown[]
    functionName: string
  }>
  address?: string
}
