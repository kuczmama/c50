pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract C50 is StandardToken {
    string public name = "Cryptocurrency 50 Index";
    string public symbol = "C50";
    uint8 public decimals = 18;
    // uint256 public constant INITIAL_SUPPLY = 2100000 * (10 ** uint256(18));
    uint256 public constant MAX_SUPPLY = 21000000 * (10 ** uint256(18));

    function C50() public {
    	totalSupply_ = MAX_SUPPLY;
    	balances[msg.sender] = MAX_SUPPLY;
    	Transfer(0x0, msg.sender, MAX_SUPPLY);
    }
}