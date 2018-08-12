const C50 = artifacts.require('C50V2');
const EVMRevert = 'revert';
const BigNumber = web3.BigNumber;


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();



contract('C50V2', function ([_, owner, recipient, anotherAccount]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const _name = 'Cryptocurrency 50 Index';
  const _symbol = 'C50';
  const _decimals = 18;
  const _maxSupply = 250000000000 * 10** _decimals;
  const _initialSupply = 10000000 * 10** _decimals

  beforeEach(async function () {
    token = await C50.new({from: owner});
  });

  describe('accepting payments', function () {
    it('should accept payments', async function () {
      await token.send(value);
      await token.buyTokens(recipient, { value: value, from: anotherAccount });
    });
  });

  describe('high-level purchase', function () {
    it('should log purchase', async function () {
      const { logs } = await token.sendTransaction({ value: value, from: recipient });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.anotherAccount.should.eq(recipient);
      event.args.beneficiary.should.eq(recipient);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to sender', async function () {
      await token.sendTransaction({ value: value, from: recipient });
      const balance = await token.balanceOf(recipient);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to owner', async function () {
      const pre = await token.balanceOf(owner);
      await token.sendTransaction({ value, from: recipient });
      const post = await token.balanceOf(owner);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });

  describe('low-level purchase', function () {
    it('should log purchase', async function () {
      const { logs } = await token.buyTokens(recipient, { value: value, from: anotherAccount });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.anotherAccount.should.eq(anotherAccount);
      event.args.beneficiary.should.eq(recipient);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to beneficiary', async function () {
      await token.buyTokens(recipient, { value, from: anotherAccount });
      const balance = await token.balanceOf(recipient);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to owner', async function () {
      const pre = await token.balanceOf(owner);
      await token.buyTokens(recipient, { value, from: anotherAccount });
      const post = await token.balanceOf(owner);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });

  describe('total supply', function () {
    it('returns the total amount of initial tokens', async function () {
      const totalSupply = await token.maxSupply();
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

    describe('the owner receives the _initialSupply of tokens', function () {
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
          debugger
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

          // it('transfers the requested amount', async function () {
          //   let transactionAmount = 21000000 * 10 ** _decimals ;
          //   await token.transferFrom(owner, to, transactionAmount, { from: spender });

          //   const senderBalance = await token.balanceOf(owner);
          //   assert.equal(senderBalance, 0);

          //   const recipientBalance = await token.balanceOf(to);
          //   assert.equal(recipientBalance, transactionAmount);
          // });

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
