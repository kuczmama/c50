pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

contract C50V2 is MintableToken, Pausable {
    string public name = "Cryptocurrency 50 Index";
    string public symbol = "C50";
    uint8 public decimals = 18;
    uint256 public constant INITIAL_SUPPLY = 10000000 * (10 ** uint256(18));
    uint256 public constant MAX_SUPPLY = 250000000000 * (10 ** uint256(18));
    uint256 public rate; // How many token units a buyer gets per wei
    address public wallet;  // Address where funds are collected
    uint256 public weiRaised; // Amount of wei raised
    bool public paused = false;

  /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 amount
  );

  event Mint(address indexed to, uint256 amount);
  event SetWallet(address wallet);
  event SetRate(uint256 indexed rate);

  constructor(address _owner) public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[_owner] = INITIAL_SUPPLY;
    rate = 500;
    wallet = _owner;
    owner = _owner;
    emit Transfer(0x0, _owner, INITIAL_SUPPLY);
  }

  //Fallback function
  function () external payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address _beneficiary) whenNotPaused public payable {
    uint256 _weiAmount = msg.value;
    require(_beneficiary != address(0));
    require(_weiAmount > 0);

    // calculate token amount to be created
    uint256 _amount = _weiAmount.mul(rate);

    // update state
    weiRaised = weiRaised.add(_weiAmount);

    require(totalSupply_.add(_amount) <= MAX_SUPPLY);

    totalSupply_ = totalSupply_.add(_amount);
    balances[_beneficiary] = balances[_beneficiary].add(_amount);
    emit Mint(_beneficiary, _amount);
    emit Transfer(address(0), _beneficiary, _amount);
    emit TokenPurchase(msg.sender, _beneficiary, _weiAmount, _amount);

    wallet.transfer(_weiAmount);
  }


  function setWallet(address _wallet) onlyOwner whenNotPaused public {
    require(_wallet != address(0));
    wallet = _wallet;
    emit SetWallet(wallet);
  }


  function setRate(uint256 _rate) onlyOwner whenNotPaused public {
    require(_rate > 0);
    rate = _rate;
    emit SetRate(rate);
  }
}