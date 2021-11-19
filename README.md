# TokenSwapper-ETH--Token
Headless node.js service invoked by script that swaps ETH to another ERC20 token, using kyber.network smart contracts. 

Code uses a smart contract deployed to the Rinkeby test network.

To use:
- run  `npm install`
- Set variables as necessary in the `config.js` file in `config` folder.
- Run `node SwapEtherToToken.js`


Notes:
- Contract address on rinkeby testnet is `0x3944501f6c528B183219a497597151Ae220AeD72`
- Token addresses for ERC20 tokens can be found on https://developer.kyber.network/docs/Addresses-Rinkeby/
- Contract uses KyberNetworkProxy solidity script from KyberNetwork repository on https://github.com/KyberNetwork/smart-contracts/tree/Katalyst/contracts/sol6, deployed using Remix IDE. 
