import { formatEther } from 'ethers/lib/utils'
import { NextPage } from 'next'
import { useContractRead } from 'wagmi'
import { baycAbi } from '../abis/BoredApeYachtClub'

export const Index: NextPage = () => {
  const { data, isSuccess } = useContractRead({
    abi: baycAbi,
    address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    functionName: 'apePrice',
  })

  return (
    <div>
      Ξ
      <span data-testid="baycApePriceContainer">
        {isSuccess && data !== undefined ? formatEther(data) : '0.0'}
      </span>
    </div>
  )
}

export default Index
