const C50 = artifacts.require('C50V2');
const EVMRevert = 'revert';
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();




contract('C50', function ([_, owner, recipient, anotherAccount, anyone]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const _name = 'Cryptocurrency 50 Index';
  const _symbol = 'C50';
  const _decimals = 18;
  const _maxSupply = 250000000000 * 10 ** _decimals;
  const _initialSupply = 10000000 * (10 ** _decimals);

  beforeEach(async function () {
    token = await C50.new(owner, {from: anotherAccount});
  });

  describe("ownable", function() {
    it('should have an owner', async function () {
      (await token.owner()).should.equal(owner);
    });

    it('changes owner after transfer', async function () {
      await token.transferOwnership(anyone, { from: owner });
      (await token.owner()).should.equal(anyone);
    });

    it('should prevent non-owners from transfering', async function () {
      await token.transferOwnership(anyone, { from: anyone }).should.be.rejectedWith(EVMRevert);
    });

    it('should guard ownership against stuck state', async function () {
      await token.transferOwnership(null, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('loses owner after renouncement', async function () {
      await token.renounceOwnership({ from: owner });
      (await token.owner()).should.equal(ZERO_ADDRESS);
    });

    it('should prevent non-owners from renouncement', async function () {
      await token.renounceOwnership({ from: anyone }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('total supply', function () {
    it('returns the total amount of initial tokens', async function () {
      const totalSupply = await token.totalSupply();
      assert.equal(totalSupply.toNumber(), _initialSupply);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        const balance = await token.balanceOf(anotherAccount);

        assert.equal(balance, 0);
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        const balance = await token.balanceOf(owner);
        assert.equal(balance.toNumber(), _initialSupply);
      });
    });
  });


  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient;

      describe('when the sender does not have enough balance', function () {
        const amount = 21000000 * 100** _decimals ;

        it('reverts', async function () {
          await token.transfer(to, amount, { from: owner }).should.be.rejectedWith(EVMRevert);
        });
      });

      describe('when the sender has enough balance', function () {
        it('transfers the requested amount', async function () {
          await token.transfer(to, _initialSupply, { from: owner });

          const senderBalance = await token.balanceOf(owner);
          assert.equal(senderBalance, 0);

          const recipientBalance = await token.balanceOf(to);
          assert.equal(recipientBalance, _initialSupply);
        });

        it('emits a transfer event', async function () {
          const amount = 100;
          const { logs } = await token.transfer(to, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Transfer');
          assert.equal(logs[0].args.from, owner);
          assert.equal(logs[0].args.to, to);
          assert(logs[0].args.value.eq(amount));
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;

      it('reverts', async function () {
        await token.transfer(to, 100, { from: owner }).should.be.rejectedWith(EVMRevert);
      });
    });
  });

  describe('approve', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('emits an approval event', async function () {
          const { logs } = await token.approve(spender, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.spender, spender);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await token.approve(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await token.approve(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, amount);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await token.approve(spender, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.spender, spender);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await token.approve(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await token.approve(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, amount);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const amount = 100;
      const spender = ZERO_ADDRESS;

      it('approves the requested amount', async function () {
        await token.approve(spender, amount, { from: owner });

        const allowance = await token.allowance(owner, spender);
        assert.equal(allowance, amount);
      });

      it('emits an approval event', async function () {
        const { logs } = await token.approve(spender, amount, { from: owner });

        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'Approval');
        assert.equal(logs[0].args.owner, owner);
        assert.equal(logs[0].args.spender, spender);
        assert(logs[0].args.value.eq(amount));
      });
    });
  });

  describe('transfer from', function () {
    const spender = recipient;

    describe('when the recipient is not the zero address', function () {
      const to = anotherAccount;

      describe('when the spender has enough approved balance', function () {
        beforeEach(async function () {
          await token.approve(spender, 100, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('decreases the spender allowance', async function () {
            await token.transferFrom(owner, to, amount, { from: spender });

            const allowance = await token.allowance(owner, spender);
            assert(allowance.eq(0));
          });

          it('emits a transfer event', async function () {
            const { logs } = await token.transferFrom(owner, to, amount, { from: spender });

            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'Transfer');
            assert.equal(logs[0].args.from, owner);
            assert.equal(logs[0].args.to, to);
            assert(logs[0].args.value.eq(amount));
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await token.transferFrom(owner, to, amount, { from: spender }).should.be.rejectedWith(EVMRevert);
          });
        });
      });

      describe('when the spender does not have enough approved balance', function () {
        beforeEach(async function () {
          await token.approve(spender, 99, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('reverts', async function () {
            await token.transferFrom(owner, to, amount, { from: spender }).should.be.rejectedWith(EVMRevert);
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await token.transferFrom(owner, to, amount, { from: spender }).should.be.rejectedWith(EVMRevert);
          });
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const amount = 100;
      const to = ZERO_ADDRESS;

      beforeEach(async function () {
        await token.approve(spender, amount, { from: owner });
      });

      it('reverts', async function () {
        await token.transferFrom(owner, to, amount, { from: spender }).should.be.rejectedWith(EVMRevert);
      });
    });
  });

  describe('decrease approval', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('emits an approval event', async function () {
          const { logs } = await token.decreaseApproval(spender, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.spender, spender);
          assert(logs[0].args.value.eq(0));
        });

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await token.decreaseApproval(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, 0);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await token.approve(spender, amount + 1, { from: owner });
          });

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await token.decreaseApproval(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, 1);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await token.decreaseApproval(spender, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.spender, spender);
          assert(logs[0].args.value.eq(0));
        });

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await token.decreaseApproval(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, 0);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await token.approve(spender, amount + 1, { from: owner });
          });

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await token.decreaseApproval(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, 1);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const amount = 100;
      const spender = ZERO_ADDRESS;

      it('decreases the requested amount', async function () {
        await token.decreaseApproval(spender, amount, { from: owner });

        const allowance = await token.allowance(owner, spender);
        assert.equal(allowance, 0);
      });

      it('emits an approval event', async function () {
        const { logs } = await token.decreaseApproval(spender, amount, { from: owner });

        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'Approval');
        assert.equal(logs[0].args.owner, owner);
        assert.equal(logs[0].args.spender, spender);
        assert(logs[0].args.value.eq(0));
      });
    });
  });

  describe('increase approval', function () {
    const amount = 100;

    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          const { logs } = await token.increaseApproval(spender, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.spender, spender);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await token.increaseApproval(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await token.approve(spender, 1, { from: owner });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await token.increaseApproval(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, amount + 1);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await token.increaseApproval(spender, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.spender, spender);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await token.increaseApproval(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await token.approve(spender, 1, { from: owner });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await token.increaseApproval(spender, amount, { from: owner });

            const allowance = await token.allowance(owner, spender);
            assert.equal(allowance, amount + 1);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS;

      it('approves the requested amount', async function () {
        await token.increaseApproval(spender, amount, { from: owner });

        const allowance = await token.allowance(owner, spender);
        assert.equal(allowance, amount);
      });

      it('emits an approval event', async function () {
        const { logs } = await token.increaseApproval(spender, amount, { from: owner });

        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'Approval');
        assert.equal(logs[0].args.owner, owner);
        assert.equal(logs[0].args.spender, spender);
        assert(logs[0].args.value.eq(amount));
      });
    });
  });
});
