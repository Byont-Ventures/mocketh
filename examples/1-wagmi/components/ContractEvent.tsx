import { useState } from 'react'
import { useContractEvent } from 'wagmi'
import { baycAbi } from '../abis/BoredApeYachtClub'

export const ContractEvent: React.FC = () => {
  const [contractEventData, setContractEventData] = useState('')

  useContractEvent({
    abi: baycAbi,
    address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    eventName: 'Transfer',
    listener: (from, to, amount) => {
      setContractEventData(`${from}, ${to}, ${amount.toString()}`)
    },
  })

  return (
    <>
      <div>
        <span data-testid="baycApeFromContainer">{contractEventData}</span>
      </div>
    </>
  )
}

export default ContractEvent
