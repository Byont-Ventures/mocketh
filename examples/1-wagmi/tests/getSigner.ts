import { providers, Wallet } from 'ethers'

/**
 * Implements uncheck connection based on [Wagmi's
 * tests](https://github.com/wagmi-dev/wagmi/blob/main/packages/core/test/utils.ts)
 */
export class WalletSigner extends Wallet {
  connectUnchecked(): providers.JsonRpcSigner {
    const uncheckedSigner = (<providers.StaticJsonRpcProvider>(
      this.provider
    )).getUncheckedSigner(this.address)
    return uncheckedSigner
  }
}
