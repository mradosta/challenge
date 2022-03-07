import React, {useState, useEffect} from 'react'
import Web3 from 'web3';
import ETHPoolAbi from '../../contracts/ETHPool.json'


const ETHPool = () => {

  const ETHPoolAddress = '0x536522Dc771D846a9d5f1dF842534343ab7Eef65';
  const web3 = new Web3(window.ethereum);
  const tokenContract = new web3.eth.Contract(ETHPoolAbi, ETHPoolAddress);

	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [account, setaccount] = useState('0x0');

  const getSafeAmountInWeiFromEth = (eth) => {
    return web3.utils.toBN("0x"+(eth*10**18).toString(16));
  };

	useEffect(() => {
    setError(null);
    setSuccess(null);

	  if (!window.ethereum) {
		  // Nothing to do here... no ethereum provider found
      setError({code : 1, message : 'Please, install metamask'});
		  return;
	  }

	  const accountWasChanged = (accounts) => {
      setaccount(accounts[0]);
      setError(null);
      setSuccess(null);
      console.log('accountWasChanged');
	  }
	  const getAndSetAccount = async () => {
  		const changedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setaccount(changedAccounts[0]);
      console.log('getAndSetAccount');
	  }
	  const clearAccount = () => {
		  setaccount('0x0');
		  console.log('clearAccount');
	  };
	  window.ethereum.on('accountsChanged', accountWasChanged);
	  window.ethereum.on('connect', getAndSetAccount);
	  window.ethereum.on('disconnect', clearAccount);
    // window.ethereum.request({ method: 'eth_requestAccounts' });

	}, [/* empty array to avoid re-request on every render, but if you have state related to a connect button, put here */]);


  const resetErrors = () => {
    setError(null);
    setSuccess(null);
  };

  const setConnectHandler = () => {
    window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const withdrawHandler = (event) => {
    event.preventDefault();
    resetErrors();
    tokenContract.events.withdrawal({}, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        setSuccess({ message : success.message + ', Amount withdrawn: ' + web3.utils.fromWei(data.returnValues.amount, 'ether') + ' ETH'});
      }
    });
    tokenContract.methods.withdraw().send({ from : account }).then(tx => {
      console.log(tx);
      setSuccess({ message : 'Transaction Hash: ' + tx.transactionHash });
    }).catch(err => {
      console.log(err);
      setError(err);
    });
  };

  const checkDepositsHandler = (event) => {
		event.preventDefault();
    resetErrors();
    tokenContract.methods.getBalance().call({ from : account }).then((total) => {
      console.log(total)
      setSuccess({ message : 'Balance Total: ' + web3.utils.fromWei(total, 'ether') + ' ETH'});
    }).catch(err => {
      console.log(err);
      setError(err);
    });
  };

  const checkRewardsHandler = (event) => {
		event.preventDefault();
    resetErrors();
    tokenContract.methods.getRewardsTotal().call({ from : account }).then((total) => {
      console.log(total)
      setSuccess({ message : 'Rewards Total: ' + web3.utils.fromWei(total, 'ether') + ' ETH'});
    }).catch(err => {
      // console.log(JSON.parse(err.replace('Error: Internal JSON-RPC error.', '')));
      // console.log(err.replace('Error: Internal JSON-RPC error.', ''));
      console.log(err);
      setError(err);
    });
  };

  const checkContractBalanceHandler = (event) => {
		event.preventDefault();
    resetErrors();
    tokenContract.methods.getContractBalance().call({ from : account }).then((total) => {
      console.log(total)
      setSuccess({ message : 'Balance Total: ' + web3.utils.fromWei(total, 'ether') + ' ETH'});
    }).catch(err => {
      // console.log(JSON.parse(err.replace('Error: Internal JSON-RPC error.', '')));
      // console.log(err.replace('Error: Internal JSON-RPC error.', ''));
      console.log(err);
      setError(err);
    });
  };

  const rewardHandler = (event) => {
		event.preventDefault();
    resetErrors();

    const amount = event.target.amount.value;
    if (!amount || isNaN(amount) || amount <= 0) {
      return setError({code : 20, message : 'Invalid amount'});
    }

    tokenContract.methods.addReward().send({ value : getSafeAmountInWeiFromEth(amount), from : account, gas: '5500000' }).then(tx => {
      console.log(tx)
      setSuccess({ message : 'Transaction Hash: ' + tx.transactionHash });
    }).catch(err => {
      console.log(err);
      setError(err);
    });
  };

  const depositHandler = (event) => {
		event.preventDefault();
    resetErrors();

    const amount = event.target.amount.value;
    if (!amount || isNaN(amount) || amount <= 0) {
      return setError({code : 20, message : 'Invalid amount'});
    }

    tokenContract.methods.addDeposit().send({ value : getSafeAmountInWeiFromEth(amount), from : account, gas: '5500000' }).then(tx => {
      console.log(tx)
      setSuccess({ message : 'Transaction Hash: ' + tx.transactionHash });
    }).catch(err => {
      console.log(err);
      setError(err);
    });
	};

	return (
    <>
    { account && account !== '0x0' &&
      <div className="alert alert-info alert-dismissible fade show" role="alert">
        <strong>Account Connected: { account }</strong>
      </div>
    }
    { (!account || account === '0x0') &&
      <div className="alert alert-info alert-dismissible fade show" role="alert">
        <strong>Account Not Connected</strong>&nbsp;&nbsp;
        <button className="w-30 btn btn-xl btn-primary" type="button" onClick={setConnectHandler}>Connect</button>
      </div>
    }
    { error &&
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>ERROR {error.code}:</strong> { error.message }
    </div>
    }
    { success &&
    <div className="alert alert-success alert-dismissible fade show" role="alert">
      {/* <strong>SUCCESS:</strong> */}{ success.message }
    </div>
    }


    <main className="flex-shrink-0">
      <div className="container">
        <div className="row">
          <div className="alert alert-secondary" role="alert">
            Account T Actions
          </div>
          <div className="col-md-4">
            <div className="card p-2">
              <h1 className="mt-4 h3 mb-3 fw-normal pb-1">Contract Balance</h1>
              <button onClick={checkContractBalanceHandler} className="mt-4 w-100 btn btn-lg btn-primary" type="button">Check</button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-2">
              <h1 className="mt-4 h3 mb-3 fw-normal pb-1">Rewards Balance</h1>
              <button onClick={checkRewardsHandler} className="mt-4 w-100 btn btn-lg btn-primary" type="button">Check</button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-2">

            <form onSubmit={rewardHandler}>

                <h1 className="mt-4 h3 mb-3 fw-normal">Deposit Rewards</h1>

                <div className="row">
                  <div className="col">
                    <div className="form-floating mt-3">
                      <input type="number" className="form-control" id="amount"/>
                      <label htmlFor="amount">Amount (ETH)</label>
                    </div>
                  </div>

                  <div className="col">
                    <button className="mt-4 w-100 btn btn-lg btn-primary" type="submit">Deposit</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="alert alert-secondary" role="alert">
            Account A / B Actions
          </div>
          <div className="col-md-4">
            <div className="card p-2">
              <h1 className="mt-4 h3 mb-3 fw-normal pb-1">Deposits Balance</h1>
              <button onClick={checkDepositsHandler} className="mt-4 w-100 btn btn-lg btn-primary" type="button">Check</button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-2">
              <h1 className="mt-4 h3 mb-3 fw-normal pb-1">Withdraw</h1>
              <button onClick={withdrawHandler} className="mt-4 w-100 btn btn-lg btn-primary" type="button">Withdraw</button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-2">

            <form onSubmit={depositHandler}>

                <h1 className="mt-4 h3 mb-3 fw-normal">Deposit Funds</h1>


                <div className="row">
                  <div className="col">
                    <div className="form-floating mt-3">
                      <input type="number" className="form-control" id="amount"/>
                      <label htmlFor="amount">Amount (ETH)</label>
                    </div>
                  </div>

                  <div className="col">
                    <button className="mt-4 w-100 btn btn-lg btn-primary" type="submit">Deposit</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  </main>
</>
	);
}

export default ETHPool;