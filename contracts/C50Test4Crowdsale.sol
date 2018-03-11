
pragma solidity ^0.4.18;

import './C50Test4.sol';
import 'zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';

contract C50Test4Crowdsale is RefundableCrowdsale, CappedCrowdsale {

  function C50Test4Crowdsale(uint256 _openingTime, uint256 _closingTime, uint256 _rate, address _wallet, uint256 _cap, C50Test4 _token, uint256 _goal) public
    Crowdsale(_rate, _wallet, _token)
    CappedCrowdsale(_cap)
    TimedCrowdsale(_openingTime, _closingTime)
    RefundableCrowdsale(_goal)
    {
   		//As goal needs to be met for a successful crowdsale
	    //the value needs to less or equal than a cap which is limit for accepted funds
    	require(_goal <= _cap);
    }
}


