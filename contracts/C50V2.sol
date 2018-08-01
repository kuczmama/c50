pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol'

contract C50V2 is MintableToken, Ownable, Pausable {
    string public name = "Cryptocurrency 50 Index";
    string public symbol = "C50";
    uint8 public decimals = 18;
    uint256 public constant INITIAL_SUPPLY = 1000000 * (10 ** uint256(18));
    uint256 public constant MAX_SUPPLY = 250000000000 * (10 ** uint256(18));
    uint256 public rate; // How many token units a buyer gets per wei
    event SetRate();
    event SetWallet();
    address public wallet;  // Address where funds are collected


    function C50V2() public {
    	totalSupply_ = INITIAL_SUPPLY;
    	balances[msg.sender] = INITIAL_SUPPLY;
      rate = 500;
      wallet = msg.sender;
    	Transfer(0x0, msg.sender, INITIAL_SUPPLY);
    }

   /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwner canMint whenNotPaused public returns (bool) {
  	require(totalSupply_.add(_amount) <= MAX_SUPPLY);

    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    return true;
  }


  function setWallet(address _wallet) onlyOwner whenNotPaused public {
    require(_wallet != address(0));
    wallet = _wallet;
    SetWallet(wallet);
  }

  function setRate(uint256 _rate) onlyOwner whenNotPaused public {
    require(_rate > 0);
    rate = _rate;
    SetRate(rate);
  }

  //Fallback function
  function () external payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address _beneficiary) whenNotPaused public payable {
    uint256 weiAmount = msg.value;
    require(_beneficiary != address(0));
    require(_weiAmount != 0);
    require(weiAmount > 0);

    // calculate token amount to be created
    uint256 tokens = _weiAmount.mul(rate);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    require(mint(_beneficiary, _tokenAmount));
    TokenPurchase(msg.sender, _beneficiary, weiAmount, tokens);

    wallet.transfer(msg.value);
  }
}