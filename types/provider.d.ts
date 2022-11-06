import { Abi } from 'abitype'
import { utils } from 'ethers'
import { GetReturnType } from './abitype'

export interface MockedContractMethod {
  abi: Abi
  address: string
  functionName: ExtractAbiFunctionNames<TAbi>
  functionSignature: string
  contractInterface: utils.Interface
  returnValue: GetReturnType<{ abi: TAbi; functionName: TFunc }>
}
