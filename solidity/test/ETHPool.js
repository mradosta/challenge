const ETHPool = artifacts.require("ETHPool");

// Ganache assumptions
// T accounts[0]
// A accounts[1]
// B accounts[2]

/*
Let say we have user A and B and team T.

A deposits 100, and B deposits 300 for a total of 400 in the pool. Now A has 25% of the pool and B has 75%. When T deposits 200 rewards, A should be able to withdraw 150 and B 450.

What if the following happens? A deposits then T deposits then B deposits then A withdraws and finally B withdraws. A should get their deposit + all the rewards. B should only get their deposit because rewards were sent to the pool before they participated.
*/

contract("ETHPool test", async accounts => {

  /* HELPER FUNCTION */
  const getSafeAmountFromEth = (eth) => {
    return web3.utils.fromWei(web3.utils.toBN("0x"+(eth*10**18).toString(16)), "ether");
  };

  // const getEthFromWei = (wei) => {
  //   return web3.utils.fromWei(wei, "ether");
  // };

  // const delay = (s) => {
  //   return new Promise(resolve => setTimeout(resolve, s * 1000));
  // };


  let contract;
  beforeEach('should setup the contract instance', async () => {
    contract = await ETHPool.new();
  });


  it("should sum rewards to deposits", async () => {

    await contract.addDeposit({ value : getSafeAmountFromEth(100), from : accounts[1] });
    await contract.addReward({ value : getSafeAmountFromEth(100), from : accounts[0] });

    let contractBalance = await contract.getContractBalance();
    let accountABalance = await contract.getBalance({ from : accounts[1] });
    assert.equal(contractBalance, 200, "Total in the contract is not correct");
    assert.equal(accountABalance, 100, "balance for A is not correct");
  });


  it("should consider reward's deposit dates", async () => {

    await contract.addDeposit({ value : getSafeAmountFromEth(100), from : accounts[1] });
    await contract.addReward({ value : getSafeAmountFromEth(200), from : accounts[0] });
    await contract.addDeposit({ value : getSafeAmountFromEth(300), from : accounts[2] });

    let contractBalance = await contract.getContractBalance();
    let accountABalance = await contract.getBalance({ from : accounts[1] });
    let accountBBalance = await contract.getBalance({ from : accounts[2] });
    assert.equal(contractBalance.toNumber(), 600, "Total in the contract is not correct");
    assert.equal(accountABalance.toNumber(), 100, "balance for A is not correct");
    assert.equal(accountBBalance.toNumber(), 300, "balance for B is not correct");
  });


  it("shouldn't allow deposit rewards when pool is empty", async () => {
    let err = null;
    let errReason = null;
    try {
      await contract.addReward({ value : getSafeAmountFromEth(100), from : accounts[0] });
    } catch (error) {
      err = error;

      for (let key in err.data) {
        if (errReason === null) {
          errReason = err.data[key].reason;
        }
      }
    }
    assert.ok(err instanceof Error)
    assert.equal(errReason, "Cannot add rewards. Will lost fund. Nobody will be able to withdraw it");


    await contract.addDeposit({ value : getSafeAmountFromEth(100), from : accounts[1] });
    let withdraw = await contract.withdraw({ from: accounts[1] });
    assert.equal(withdraw.logs[0].event, 'withdrawal', "Invalid withdrawal event");
    assert.equal(withdraw.logs[0].args[0], 100, "Invalid withdrawal event amount");


    err = null;
    errReason = null;
    try {
      await contract.addReward({ value : getSafeAmountFromEth(100), from : accounts[0] });
    } catch (error) {
      err = error;

      for (let key in err.data) {
        if (errReason === null) {
          errReason = err.data[key].reason;
        }
      }
    }
    assert.ok(err == null)
    assert.ok(errReason == null)
  });


  it("should split rewards", async () => {

    await contract.addDeposit({ value : getSafeAmountFromEth(100), from: accounts[1] });
    let contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 100, "Total in the contract after A deposits 100 is not correct");

    await contract.addDeposit({ value : getSafeAmountFromEth(300), from: accounts[2] });
    contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 400, "Total in the contract after A deposits 100, B deposit 300 is not correct");

    await contract.addReward({ value : getSafeAmountFromEth(100), from: accounts[0] });
    contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 500, "Total in the contract after A deposits 100, B deposit 300 and T deposits 100 is not correct");

    let withdraw = await contract.withdraw({ from: accounts[1] });
    assert.equal(withdraw.logs[0].event, 'withdrawal', "Invalid withdrawal event");
    assert.equal(withdraw.logs[0].args[0], 125, "Invalid withdrawal event amount");

    withdraw = await contract.withdraw({ from: accounts[2] });
    assert.equal(withdraw.logs[0].event, 'withdrawal', "Invalid withdrawal event");
    assert.equal(withdraw.logs[0].args[0], 375, "Invalid withdrawal event amount");

  });



  it("shouldn't withdraw T account", async () => {
    await contract.addDeposit({ value : getSafeAmountFromEth(100), from: accounts[1] });
    await contract.addReward({ value : getSafeAmountFromEth(100), from: accounts[0] });

    let contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 200, "Total in the contract after T rewards is not correct");

    let err = null;
    let errReason = null;
    try {
      await contract.withdraw({ from: accounts[0] });
      } catch (error) {
        err = error;

        for (let key in err.data) {
          if (errReason === null) {
            errReason = err.data[key].reason;
          }
        }
      }
      assert.ok(err instanceof Error)
      assert.equal(errReason, "ETHPool Team cannot withdraw");
  });


  it("should put 100 and withdraw 100 checking events", async () => {

    await contract.addDeposit({ value : getSafeAmountFromEth(100), from: accounts[1] });
    let contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal, 100, "Total in the contract after A deposits 100 is not correct");

    let accountABalance = await contract.getBalance({ from : accounts[1] });
    assert.equal(accountABalance.toNumber(), 100, "Total deposits for A is not correct");

    let withdraw = await contract.withdraw({ from: accounts[1] });
    assert.equal(withdraw.logs[0].event, 'withdrawal', "Invalid withdrawal event");
    assert.equal(withdraw.logs[0].args[0], 100, "Invalid withdrawal event amount");

    accountABalance = await contract.getBalance({ from : accounts[1] });
    assert.equal(accountABalance.toNumber(), 0, "Total deposits for A is not correct");

    contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 0, "Total in the contract after A withdraw is not correct");
  });


  it("should put 100 twice and withdraw 200 just once", async () => {

    await contract.addDeposit({ value : getSafeAmountFromEth(100), from: accounts[1] });
    let contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 100, "Total in the contract after A deposits 100 is not correct");

    await contract.addDeposit({ value : getSafeAmountFromEth(100), from: accounts[1] });
    contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 200, "Total in the contract after A deposits 100 is not correct");

    let accountABalance = await contract.getBalance({ from : accounts[1] });
    assert.equal(accountABalance.toNumber(), 200, "Total deposits for A is not correct");

    await contract.withdraw({ from: accounts[1] });
    accountABalance = await contract.getBalance({ from : accounts[1] });
    assert.equal(accountABalance.toNumber(), 0, "Total deposits for A is not correct");

    contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 0, "Total in the contract after A withdraw is not correct");

    // prevent more than one withdraw
    let err = null;
    let errReason = null;
    try {
      await contract.withdraw({ from: accounts[1] });
    } catch (error) {
      err = error;

      for (let key in err.data) {
        if (errReason === null) {
          errReason = err.data[key].reason;
        }
      }
    }
    assert.ok(err instanceof Error)
    assert.equal(errReason, "Nothing to withdraw");
  });


  it("should deposit multiple accounts", async () => {

    await contract.addDeposit({ value : getSafeAmountFromEth(100), from: accounts[1] });
    let contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 100, "Total in the contract after A deposits 100 is not correct");

    await contract.addDeposit({ value : getSafeAmountFromEth(200), from: accounts[2] });
    contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 300, "Total in the contract after B deposits 100 is not correct");

    let accountABalance = await contract.getBalance({ from : accounts[1] });
    assert.equal(accountABalance.toNumber(), 100, "Total deposits in A are not correct");

    let accountBBalance = await contract.getBalance({ from : accounts[2] });
    assert.equal(accountBBalance.toNumber(), 200, "Total deposits in B are not correct");


    await contract.withdraw({ from: accounts[1] });
    accountABalance = await contract.getBalance({ from : accounts[1] });
    assert.equal(accountABalance.toNumber(), 0, "Total deposits for A is not correct");
    contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 200, "Total in the contract after A withdraw is not correct");

    await contract.withdraw({ from: accounts[2] });
    accountBBalance = await contract.getBalance({ from : accounts[2] });
    assert.equal(accountBBalance.toNumber(), 0, "Total deposits for B is not correct");
    contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal.toNumber(), 0, "Total in the contract after A and B withdraw is not correct");
  });



  it("should put 100 to A and 300 to B", async () => {

    await contract.addDeposit({ value : getSafeAmountFromEth(100), from: accounts[1] });
    await contract.addDeposit({ value : getSafeAmountFromEth(300), from: accounts[2] });

    let contractTotal = await contract.getContractBalance();
    let accountABalance = await contract.getBalance({ from : accounts[1] });
    let accountBBalance = await contract.getBalance({ from : accounts[2] });

    assert.equal(contractTotal, 400, "Total in the contract is not correct");
    assert.equal((accountABalance * 1) + (accountBBalance * 1), 400, "Total in account's balance is not correct");
  });



  it("Only T can deposit rewards", async () => {

    await contract.addDeposit({ value : getSafeAmountFromEth(100), from: accounts[1] });

    let err = null;
    let errReason = null;
    try {
      await contract.addReward({ value : getSafeAmountFromEth(200), from : accounts[1] });
    } catch (error) {
      err = error;

      for (let key in err.data) {
        if (errReason === null) {
          errReason = err.data[key].reason;
        }
      }
    }
    contractTotal = await contract.getContractBalance();
    assert.equal(contractTotal, 100, "Total in the contract is not correct");
    assert.ok(err instanceof Error)
    assert.equal(errReason, "Sender not authorized.");
  });

});