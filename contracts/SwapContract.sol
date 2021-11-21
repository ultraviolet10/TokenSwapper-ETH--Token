// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/sol6/KyberNetworkProxy.sol";

contract TokenSwap {
    ERC20 internal constant ETH_TOKEN_ADDRESS = ERC20(address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE));
    KyberNetworkProxy public kyberProxy;
    
    event Swap(address indexed sender, ERC20 destToken, address indexed destination, uint amount);
    
    constructor(
        KyberNetworkProxy _kyberProxy //0x0d5371e5EE23dec7DF251A8957279629aa79E9C5
    ) public
    {
        kyberProxy = _kyberProxy; 
    }
    
    function checkGas() public view returns (uint256){
        uint256 gasPrice = kyberProxy.maxGasPrice();
        return gasPrice;
    }
    
    function swap(ERC20 token, address destAddress) public payable {
        uint minConversionRate;

        // Get the minimum conversion rate
        (minConversionRate,) = kyberProxy.getExpectedRate(ETH_TOKEN_ADDRESS, token, msg.value);
        
        //will send back tokens to this contract's address
        uint destAmount = kyberProxy.swapEtherToToken{value: msg.value}(token, minConversionRate);
        
        //send received tokens to destination address
        token.transfer(destAddress, destAmount);
       
        emit Swap(msg.sender, token, destAddress, destAmount);
        
    }
}
