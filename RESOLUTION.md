
# Smart Contract Challenge Resolution



## A) Software / Services I Used


#### - Infura account (to deploy to rinkeby)
#### - truffle suite
#### - ganache-cli (running in docker)
#### - visual code (editor)
#### - react js / web3js (front end)
#### - metamask


## B) Rinkeby deployed contract
https://rinkeby.etherscan.io/address/0xFaE85216eeB820549108e3f5fF734c985DB2e1f4

## C) Run the project (locally)
git clone https://github.com/mradosta/challenge.git
cd challenge
npm install

### Deploy to local (check truffle-config.js for your own settings)
truffle migrate --reset

### Run tests local
truffle test --show-events

### Deploy to test network (Rinkeby)
truffle migrate --network rinkeby

### Run react app locally
cd frontend/react
npm install
npm start
open your browser: http://localhost:3000/

## D) Interact with the UI
https://www.loom.com/share/7675e78986b94c1c9d21707092ef802e