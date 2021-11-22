import { getAvaxWeb3Instance, getBscWeb3Instance, BRIDGE_AVAX_ADDRESS, BRIDGE_BSC_ADDRESS, ADMIN_ADDRESS } from './utils';
import * as fs from 'fs'
import * as BridgeAvaxABI from '../abi/MKCBridgeAvax.json'
import * as BridgeBscABI from '../abi/MKCBridgeBsc.json'

const lastBlockAVAXFilename = "./last_block_avax.txt"
const lastBlockBSCFilename = "./last_block_bsc.txt"
const web3Avax = getAvaxWeb3Instance()
const web3Bsc = getBscWeb3Instance()

const bridgeAvax = new web3Avax.eth.Contract(
  BridgeAvaxABI as any,
  BRIDGE_AVAX_ADDRESS
)
const bridgeBSC = new web3Bsc.eth.Contract(
  BridgeBscABI as any,
  BRIDGE_BSC_ADDRESS
)

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const loadLastReadBlock = (filename: string): number => {
  try {
    const data = fs.readFileSync(filename, 'utf8')
    console.log(parseInt(data))
    return parseInt(data)
  }
  catch (err) {
    console.log("Error reading last block")
    return 0
  }
}

const writeLastReadBlock = (filename: string, i: number) => {
  console.log("Writing last read block: ", i)
  try {
    const data = fs.writeFileSync(filename, i.toString())
  }
  catch (err) {
    console.log("Cannot write ")
  }
}

const launchBridgeLoop = async (secondsDelay: number) => {
  console.log("====== MKC BRIDGE ==========")
  let lastBlockAVAX = 0
  let lastBlockBSC = 0
  lastBlockAVAX = loadLastReadBlock(lastBlockAVAXFilename)
  lastBlockBSC = loadLastReadBlock(lastBlockBSCFilename)
  while (true) {

    console.log("\n\nfetching Avalanche bridge transactions since block " + lastBlockAVAX)

    try {
      const avaxEvents = await bridgeAvax.getPastEvents("Transfer",
        { filter: { step: 0 }, fromBlock: lastBlockAVAX + 1, toBlock: 'latest' })
      console.log("Retrieved " + avaxEvents.length + " transactions")
      avaxEvents.forEach(async event => {
        // console.log("Return values: ", event.returnValues)
        const { from, to, amount, date, nonce } = event.returnValues;

        const tx = bridgeBSC.methods.mint(to, amount, nonce);
        try {
          const [gasPrice, gasCost] = await Promise.all([
            web3Bsc.eth.getGasPrice(),
            tx.estimateGas({ from: ADMIN_ADDRESS }),
          ]);
          const data = tx.encodeABI();
          const txData = {
            from: ADMIN_ADDRESS,
            to: bridgeBSC.options.address,
            data,
            gas: gasCost,
            gasPrice
          };
          try {
            const receipt = await web3Bsc.eth.sendTransaction(txData);
            console.log(`Transaction (BSC) hash: ${receipt.transactionHash}`);
            console.log(`
          Processed transfer:
          - from ${from} 
          - to ${to} 
          - amount ${amount} tokens
          - date ${date}
        `);

          }
          catch (err: any) {
            console.log("Error minting:")
            console.log(err.message)
          }

        }
        catch (error: any) {
          console.log('Error estimating tx : ', error.message)
        }
        lastBlockAVAX = Math.max(event.blockNumber, lastBlockAVAX)
        console.log("LAST BLOCK: ", lastBlockAVAX)
      })

    }
    catch (err) {
      console.log('Error fetching bridge data')
    }

    console.log("\n\nfetching BSC bridge transactions since block " + lastBlockBSC)

    try {
      const bscEvents = await bridgeBSC.getPastEvents("Transfer",
        { filter: { step: 0 }, fromBlock: lastBlockBSC + 1, toBlock: 'latest' })
      console.log("Retrieved " + bscEvents.length + " transactions")
      bscEvents.forEach(async event => {
        // console.log("Return values: ", event.returnValues)
        const { from, to, amount, date, nonce } = event.returnValues;

        const tx = bridgeAvax.methods.mint(to, amount, nonce);
        try {
          const [gasPrice, gasCost] = await Promise.all([
            web3Avax.eth.getGasPrice(),
            tx.estimateGas({ from: ADMIN_ADDRESS }),
          ]);
          const data = tx.encodeABI();
          const txData = {
            from: ADMIN_ADDRESS,
            to: bridgeAvax.options.address,
            data,
            gas: gasCost,
            gasPrice
          };
          try {
            const receipt = await web3Avax.eth.sendTransaction(txData);
            console.log(`Transaction (AVAX) hash: ${receipt.transactionHash}`);
            console.log(`
          Processed transfer:
          - from ${from} 
          - to ${to} 
          - amount ${amount} tokens
          - date ${date}
        `);

          }
          catch (err: any) {
            console.log("Error minting:")
            console.log(err.message)
          }

        }
        catch (error: any) {
          console.log('Error estimating tx: ', error.message)
        }
        lastBlockBSC = Math.max(event.blockNumber, lastBlockBSC)
        console.log("LAST BLOCK: ", lastBlockBSC)
      })

    }
    catch (err) {
      console.log('Error fetching bridge data')
    }



    writeLastReadBlock(lastBlockAVAXFilename, lastBlockAVAX)
    writeLastReadBlock(lastBlockBSCFilename, lastBlockBSC)
    console.log("WAITING " + secondsDelay + " SECONDS...")
    await delay(secondsDelay * 1000)
  }
}

launchBridgeLoop(15)

// const bridgeBsc = new web3Bsc.eth.Contract(
//   BridgeBscABI.abi as any,
//   BridgeBscABI.networks['97'].address
// );

// console.log(bridgeAvax)
// bridgeAvax.events.Transfer(
// )
//   .on('data', async event => {
//     console.log("zeeeeeb")
//     //   const { from, to, amount, date, nonce } = event.returnValues;

//     //   const tx = bridgeBsc.methods.mint(to, amount, nonce);
//     //   const [gasPrice, gasCost] = await Promise.all([
//     //     web3Bsc.eth.getGasPrice(),
//     //     tx.estimateGas({ from: admin }),
//     //   ]);
//     //   const data = tx.encodeABI();
//     //   const txData = {
//     //     from: admin,
//     //     to: bridgeBsc.options.address,
//     //     data,
//     //     gas: gasCost,
//     //     gasPrice
//     //   };
//     //   const receipt = await web3Bsc.eth.sendTransaction(txData);
//     //   console.log(`Transaction hash: ${receipt.transactionHash}`);
//     //   console.log(`
//     //   Processed transfer:
//     //   - from ${from} 
//     //   - to ${to} 
//     //   - amount ${amount} tokens
//     //   - date ${date}
//     // `);
//   })
//   .on("connected", function (subscriptionId) {
//     console.log(subscriptionId);
//   })
//   .on('changed', function (event) {
//     console.log("CHANGED")
//     // remove event from local database
//   })
//   .on('error', console.error);


// bridgeAvax.getPastEvents("allEvents",
//   { fromBlock: 100, toBlock: 'latest' }).then(event => console.log(event))
//   .catch((err) => console.log("ERROOR : ", err))

/*bridgeBsc.events.Transfer( // PAS SUUUUUUUUR A MODIFIER
  {fromBlock: 0, step: 0}
)
.on('data', async event => {
  const { from, to, amount, date, nonce } = event.returnValues;

  const tx = bridgeAvax.methods.mint(to, amount, nonce);
  const [gasPrice, gasCost] = await Promise.all([
    web3Avax.eth.getGasPrice(),
    tx.estimateGas({from: admin}),
  ]);
  const data = tx.encodeABI();
  const txData = {
    from: admin,
    to: bridgeAvax.options.address,
    data,
    gas: gasCost,
    gasPrice
  };
  const receipt = await web3Avax.eth.sendTransaction(txData);
  console.log(`Transaction hash: ${receipt.transactionHash}`);
  console.log(`
    Processed transfer:
    - from ${from}
    - to ${to}
    - amount ${amount} tokens
    - date ${date}
  `);
});*/