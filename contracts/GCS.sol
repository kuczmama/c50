pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract GCS is StandardToken {
    string public name = "Galactic Credit Standard";
    string public symbol = "GCS";
    uint8 public decimals = 18;
    uint256 public constant MAX_SUPPLY = 21000000 * (10 ** uint256(18));

    function GCS() public {
    	totalSupply_ = MAX_SUPPLY;
    	balances[msg.sender] = MAX_SUPPLY;
    	Transfer(0x0, msg.sender, MAX_SUPPLY);
    }
}