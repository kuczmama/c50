function ether (n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

function latestTime () {
  return web3.eth.getBlock('latest').timestamp;
}

function advanceBlock () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: Date.now(),
    }, (err, res) => {
      return err ? reject(err) : resolve(res);
    });
  });
}

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};

function increaseTime (duration) {
  const id = Date.now();

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1);

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id + 1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res);
      });
    });
  });
}

function increaseTimeTo (target) {
  let now = latestTime();
  if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
  let diff = target - now;
  return increaseTime(diff);
}

const EVMRevert = 'revert';
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const crowdsale = artifacts.require('C50Test4Crowdsale');
const c50Test4 = artifacts.require('C50Test4');

contract('C50Test4Crowdsale', function ([_, owner, wallet, investor, purchaser]) {
  const rate = new BigNumber(6720);
  const cap = ether(313);
  const lessThanCap = ether(312);
  const tokenSupply = new BigNumber('2.1e25');
  const value = ether(.1);
  const expectedTokenAmount = rate.mul(value);

    before(async function () {
      // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
      await advanceBlock();
    });


  beforeEach(async function () {
    this.openingTime = latestTime() + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(1);
    this.afterClosingTime = this.closingTime + duration.seconds(1);
    this.token = await c50Test4.new();
    this.crowdsale = await crowdsale.new(this.openingTime, this.closingTime, rate, wallet, cap, this.token.address, { from: owner });
    await this.token.transfer(this.crowdsale.address, tokenSupply);
  });

  describe('creating a valid crowdsale', function () {
    it('should fail with zero cap', async function () {
      await crowdsale.new(
        this.openingTime, this.closingTime, rate, wallet, 0, this.token.address, { from: owner }
      ).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('timed crowdsale', function() {
    it('should be ended only after end', async function () {
      let ended = await this.crowdsale.hasClosed();
      ended.should.equal(false);
      await increaseTimeTo(this.afterClosingTime);
      ended = await this.crowdsale.hasClosed();
      ended.should.equal(true);
    });

    describe('accepting payments', function () {
      it('should reject payments before start', async function () {
        await this.crowdsale.sendTransaction({ value: value, from: investor }).should.be.rejectedWith(EVMRevert);
        await this.crowdsale.buyTokens(investor, { from: purchaser, value: value }).should.be.rejectedWith(EVMRevert);
      });

      it('should accept payments after start', async function () {
        await increaseTimeTo(this.openingTime);
        await this.crowdsale.sendTransaction({ value: value, from: investor }).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
      });

      it('should reject payments after end', async function () {
        await increaseTimeTo(this.afterClosingTime);
        await this.crowdsale.sendTransaction({ value: value, from: investor }).should.be.rejectedWith(EVMRevert);
        await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      });
    });
  });

  describe('capped crowdsale', function() {
    describe('accepting payments', function () {
      it('should accept payments within cap', async function () {
        await increaseTimeTo(this.openingTime);
        await this.crowdsale.sendTransaction({ value: cap.minus(lessThanCap), from: investor }).should.be.fulfilled;;
        await this.crowdsale.sendTransaction({ value: lessThanCap, from: investor }).should.be.fulfilled;;
      });

      it('should reject payments outside cap', async function () {
        await increaseTimeTo(this.openingTime);
        await this.crowdsale.sendTransaction({ value: cap, from: investor });
        await this.crowdsale.sendTransaction({ value: value, from: investor }).should.be.rejectedWith(EVMRevert);
      });

      it('should reject payments that exceed cap', async function () {
        await this.crowdsale.sendTransaction({value: cap.plus(1), from: investor}).should.be.rejectedWith(EVMRevert);
      });
    });

    describe('ending', function () {
      it('should not reach cap if sent under cap', async function () {
        await increaseTimeTo(this.openingTime);
        let capReached = await this.crowdsale.capReached();
        capReached.should.equal(false);
        await this.crowdsale.sendTransaction({value: lessThanCap, from: investor});
        capReached = await this.crowdsale.capReached();
        capReached.should.equal(false);
      });

      it('should not reach cap if sent just under cap', async function () {
        await increaseTimeTo(this.openingTime);
        await this.crowdsale.sendTransaction({value: cap.minus(1), from: investor});
        let capReached = await this.crowdsale.capReached();
        capReached.should.equal(false);
      });

      it('should reach cap if cap sent', async function () {
        await increaseTimeTo(this.openingTime);
        await this.crowdsale.sendTransaction({value: cap, from: investor});
        let capReached = await this.crowdsale.capReached();
        capReached.should.equal(true);
      });

    });
  });

  describe('Basic crowdsale', function () {
    before(async function () {
      // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
      await advanceBlock();
    });
      describe('high-level purchase', function () {
        it('should log purchase', async function () {
          await increaseTimeTo(this.openingTime);
          const { logs } = await this.crowdsale.sendTransaction({ value: value, from: investor });
          const event = logs.find(e => e.event === 'TokenPurchase');
          event.args.purchaser.should.equal(investor);
          event.args.beneficiary.should.equal(investor);
          event.args.value.should.be.bignumber.equal(value);
          event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
        });

        it('should assign tokens to sender', async function () {
          await increaseTimeTo(this.openingTime);
          await this.crowdsale.sendTransaction({ value: value, from: investor });
          let balance = await this.token.balanceOf(investor);
          balance.should.be.bignumber.equal(expectedTokenAmount);
        });

        it('should forward funds to wallet immediately', async function () {
          await increaseTimeTo(this.openingTime);
          const pre = web3.eth.getBalance(wallet);
          await this.crowdsale.sendTransaction({ value, from: investor });
          const post = web3.eth.getBalance(wallet);
          post.minus(pre).should.be.bignumber.equal(value);
        });
      });

      describe('low-level purchase', function () {
        it('should log purchase', async function () {
          await increaseTimeTo(this.openingTime);
          const { logs } = await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
          const event = logs.find(e => e.event === 'TokenPurchase');
          event.args.purchaser.should.equal(purchaser);
          event.args.beneficiary.should.equal(investor);
          event.args.value.should.be.bignumber.equal(value);
          event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
        });

        it('should assign tokens to beneficiary', async function () {
          await increaseTimeTo(this.openingTime);
          await this.crowdsale.buyTokens(investor, { value, from: purchaser });
          const balance = await this.token.balanceOf(investor);
          balance.should.be.bignumber.equal(expectedTokenAmount);
        });

        it('should forward funds to wallet', async function () {
          await increaseTimeTo(this.openingTime);
          const pre = web3.eth.getBalance(wallet);
          await this.crowdsale.buyTokens(investor, { value, from: purchaser });
          const post = web3.eth.getBalance(wallet);
          post.minus(pre).should.be.bignumber.equal(value);
        });
      });

  });


});