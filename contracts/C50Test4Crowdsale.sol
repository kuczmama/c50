
pragma solidity ^0.4.18;

import './C50Test4.sol';
import 'zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';

contract C50Test4Crowdsale is CappedCrowdsale, TimedCrowdsale {

  function C50Test4Crowdsale(uint256 _openingTime, uint256 _closingTime, uint256 _rate, address _wallet, uint256 _cap, C50Test4 _token) public
    Crowdsale(_rate, _wallet, _token)
    CappedCrowdsale(_cap)
    TimedCrowdsale(_openingTime, _closingTime)
    {
    }
}


