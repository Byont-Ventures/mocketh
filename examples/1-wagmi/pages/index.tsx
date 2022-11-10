import { formatEther } from 'ethers/lib/utils'
import { NextPage } from 'next'
import { useState } from 'react'
import { useContractRead, useContractEvent } from 'wagmi'
import { baycAbi } from '../abis/BoredApeYachtClub'

export const Index: NextPage = () => {
  const [contractEventData, setContractEventData] = useState('')

  const { data, isSuccess } = useContractRead({
    abi: baycAbi,
    address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    functionName: 'apePrice',
  })

  useContractEvent({
    abi: baycAbi,
    address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    eventName: 'Transfer',
    listener: (from, to, amount) => {
      console.log(from)
      setContractEventData(`${from}, ${to}, ${amount.toString()}`)
    },
  })

  return (
    <>
      <div>
        Ξ
        <span data-testid="baycApePriceContainer">
          {isSuccess && data !== undefined ? formatEther(data) : '0.0'}
        </span>
      </div>
      <div>
        <span data-testid="baycApeFromContainer">{contractEventData}</span>
      </div>
    </>
  )
}

export default Index
