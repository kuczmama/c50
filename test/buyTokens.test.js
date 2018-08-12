const C50 = artifacts.require('C50V2');
const EVMRevert = 'revert';
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function ether (n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

contract('C50V2', function ([_, owner, investor, purchaser]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const _name = 'Cryptocurrency 50 Index';
  const _symbol = 'C50';
  const _decimals = 18;
  const _maxSupply = 250000000000 * 10** _decimals;
  const _initialSupply = 10000000 * 10** _decimals;
  const rate = new BigNumber(500);

  const value = 1 * 10 ** _decimals;
  const expectedTokenAmount = rate.mul(value);

  beforeEach(async function () {
    token = await C50.new({from: owner});
  });


  describe('total supply', function () {
    it('returns the total amount of initial tokens', async function () {
      const totalSupply = await token.maxSupply();
      assert.equal(totalSupply.toNumber(), _initialSupply);
    });
  });

  describe('accepting payments', function () {
    it('should accept payments', async function () {
      await token.send(value);
      await token.buyTokens(investor, { value: value, from: purchaser });
    });
  });

  describe('high-level purchase', function () {
    it('should log purchase', async function () {
      const { logs } = await token.sendTransaction({ value: value, from: investor });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.eq(investor);
      event.args.beneficiary.should.eq(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to sender', async function () {
      await token.sendTransaction({ value: value, from: investor });
      const balance = await token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to owner', async function () {
      const pre = await token.balanceOf(owner);
      await token.sendTransaction({ value, from: investor });
      const post = await token.balanceOf(owner);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });

  describe('low-level purchase', function () {
    it('should log purchase', async function () {
      const { logs } = await token.buyTokens(investor, { value: value, from: purchaser });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.eq(purchaser);
      event.args.beneficiary.should.eq(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to beneficiary', async function () {
      await token.buyTokens(investor, { value, from: purchaser });
      const balance = await token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to owner', async function () {
      const pre = await token.balanceOf(owner);
      await token.buyTokens(investor, { value, from: purchaser });
      const post = await token.balanceOf(owner);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });
});