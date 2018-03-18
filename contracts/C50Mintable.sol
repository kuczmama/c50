pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract C50Mintable is MintableToken {
    string public name = "Cryptocurrency 50 Index";
    string public symbol = "C50";
    uint8 public decimals = 18;
    uint256 public constant INITIAL_SUPPLY = 2100000 * (10 ** uint256(18));
    uint256 public constant MAX_SUPPLY = 21000000 * (10 ** uint256(18));

    function C50Mintable() public {
    	totalSupply_ = INITIAL_SUPPLY;
    	balances[msg.sender] = INITIAL_SUPPLY;
    	Transfer(0x0, msg.sender, INITIAL_SUPPLY);
    }

   /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwner canMint public returns (bool) {
  	require(totalSupply_.add(_amount) <= MAX_SUPPLY);

    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    return true;
  }

}