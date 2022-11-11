import { NextPage } from 'next'

import ContractEvent from '../components/ContractEvent'
import ContractRead from '../components/ContractRead'

export const Index: NextPage = () => (
  <>
    <ContractRead />
    <ContractEvent />
  </>
)

export default Index
