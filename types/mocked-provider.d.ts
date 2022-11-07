import { Abi, ExtractAbiFunctionNames, ExtractAbiFunction } from 'abitype'
import { utils } from 'ethers'
import { GetReturnType, GetArgs } from './abitype'

export interface MockedContractMethod {
  encodedFunctionData: string
  contractInterface: utils.Interface
  returnValue: GetReturnType<{ abi: TAbi; functionName: TFunc }>
  address?: string
}
