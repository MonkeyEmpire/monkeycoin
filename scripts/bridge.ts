import { getAvaxWeb3Instance, getBscWeb3Instance, BRIDGE_AVAX_ADDRESS, BRIDGE_BSC_ADDRESS, ADMIN_ADDRESS } from './utils';
import * as fs from 'fs'
import * as BridgeAvaxABI from '../artifacts/contracts/MKCBridgeAvax.sol/MKCBridgeAvax.json'
import * as BridgeBscABI from '../artifacts/contracts/MKCBridgeBsc.sol/MKCBridgeBsc.json'

const lastBlockAVAXFilename = "./last_block_avax.txt"
const lastBlockBSCFilename = "./last_block_bsc.txt"
const web3Avax = getAvaxWeb3Instance()
const web3Bsc = getBscWeb3Instance()

const bridgeAvax = new web3Avax.eth.Contract(
  BridgeAvaxABI.abi as any,
  BRIDGE_AVAX_ADDRESS
)
const bridgeBSC = new web3Bsc.eth.Contract(
  BridgeBscABI.abi as any,
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

// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWMMMMMWMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWWWMMMMMWWMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWMMMWWWWMWWMWWMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWWXxodxKWMWMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWK0O0XWMMMMMMMMMMMMMMMMMMMMMMMMMMMMWMXdoO0kodXWWMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMWWNxdOKOk0WMMMMWMMMMMMMMMMMMMMMMMMMMMMWXxxKK0XXxlOWMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMNxck00XXkkXWMMMMMMMMMMMMMMMMMMMMMMMMWXkkXK0O0NNxcxNMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMWMMO:dKOO0NN0kOXWMMMMMMMMMMMMMMMMMMMMMWKOKXK0OkkKWNx:xNMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMWMXll0KOkkKNWNOxkXWWWMMMMMMMMMMMMMMMWN0OKNX0OOkxkKWNd;kWMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMWx:kXK0kxkKNWWXdckNWMMMMMMMMMMMMMWWXO0NNXKOkkxxx0NWK::KMWMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMXlcKX0kkxxkKWWWNx;lXWWWWWWNNNNNNXNXO0NWNK0kxddxxOXWWd.dWWMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMM0:dXK0kxdxkKX0kxl,.;cccc::;;;,,,,;;;lxOK0OxdddddxKWWk.;KMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMWx:kXK0kddxxo;'.........................;ldxdooodxKWWk.'OMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMWd:ONK0koc,...............................':loooxOXWWk..xWMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMWx;kN0kl,....'..............................':okKNWWNo..oNMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMWO;lXO:..'ck00d;............:dkko;............:0WWWW0:..oWMWMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMXl,c,..;kXNNNN0:.........;kNWWWWXx;...........:dOKKo. .xWMWMWMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMWWWKc....lKNXXXKXNk,.......;OWWWWWWWW0c.............,,.. .oNWWMMWMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMWXkl'....oXNXKOkkOKKc.....,lkNWNNXNWWWWXo'.............    .o0XWMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMWMWXd,...';:xXKdlcclcckXd....'xXNNKkollokKNWNO:.............    ..,dNMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMNKkd:..,oOKXNWNd.,c:oo:xNd...;kNWN0l,;;lo:;o0NWXd;..............    .oXMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMWO;...'cONWWWWNW0c'. ..cKNl.'lKWWWK:.,:.,lc.'kWWWNKx:..................lOXWMMMMMMMM
// MMMMMMMMMMMMMMMMMNo.,dOKNWWWWWWNNN0l,. ,OWNxo0NWWX0o. .'   .,xNWWWWWWXOo:'.........,;....'xWMMMMMMMM
// MMMMMMMMMMMMMMMMMXl.:XWWWWWWWNWWNNNKxldKWWWWWWWWN0Oxc'.',,:dKNWWNWWWWWWNXKOkddddxk0X0;...'xWMMMMMMMM
// MMMMMMMMMMMMMMMMMXl.;0WWWWWWWWNWNXK00KWWWWWWWWMWWNNNXXKKXNNWWWWWWWWWNWWWNWWWWWWWWWWWKc...,OWMMMMMMMM
// MMMMMMMMMMMMMMMMMNo.c0WWWWWWNNNNKKXNNNNNNWWWMMMWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNO:..lXMMMMMMMMM
// MMMMMMMMMMMMMMMMMNd:kWWWWWWWNXXKKOxdolcclodk0NWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWK:.,kWMMMMMMMMM
// MMMMMMMMMMMMMMMMMWO:dNWWWWWNNXXKkc;;;;;;;:::cOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNx..,dNMMMMMMMMM
// MMMMMMMMMMMMMMMMMMK:cKWWWWNNNXXNk;,;:ccc::;':0WWWWWWWWWWWWWNXXWWWWWWWWWWWWWWWWWWWWWW0;..'xWMMMMMMMMM
// MMMMMMMMMMMMMMMMMMK:,xNWWWNWNKKNKl..''''.  'xNWWWWWWWWWWWWKockNWWWWWWWWWWWWWWWWWWWWXl...,0MMMMMMMMMM
// MMMMMMMMMMMMMMMMMMXo':KWWWWWNXKXN0o,......;kNNWWWWWWWWWWXx:l0NWWWWWWNNNNNNNNWWWWWWWOc...:XMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMWO,'oNWWWWNX00XX0d:. .,lkKNNWWWWWWWWXx;;xNWWWWWWWWNNNNNWWWWWWWWWWXo.  lNMMWWMMMMMM
// MMMMMMMMMMMMMMMMMMMNd;lKWNWWNXKkxkkkl'  'lkKXWWWWNXKkl'.;ONWWWWNNNNNNNNNWWWWWWWWWWXd.   :XMWWWMMMMMM
// MMMMMMMMMMMMMMMMMWWMKdkNWWWWNXXKkoc;'.   .,:odolc,'.   :0WWWWNNNNNNNNNNWWWWWWWWWW0l..   .lKWWWMMMMMM
// MMMMMMMMMMMMMMMMMMMWW0dOWWWWWNXXKOdl,.               .lKWWWNNNNNNNNNNNNNNWWWWWWXx;....    ':xKWMMMMM
// MMMMMMMMMMMMMMMMMMMWMNxcOWWWWNNNX0kdc,..............,xNWWNNNNNNNNNNNNNNNWWWWWXx:.......      .l0WMMM
// MMMMMMMMMMMMMMMMMMWMMWXdcxNWWWNNNK0kl;;;;,,;;;;;;cldKNWWNNNNNNNNNWWNNNWWWWWXkc'........        .lKWM
// MMMMMMMMMMMMMMMMMMMMMMMNxco0WWWWNNX0dlllcccllllld0NWWNNNXNNNNNNNNNNNWWWWWWNOc'.........          .lO
// MMMMMMMMMMMMMMMMMMMMWWMMW0ockXWWWNNKxddddddddxdxKWWNXXXXNNNNNNNNNWWWWWWWN0d:'...............       .
// MMMMMMMMMMMMMMMMMMMMMMMWMWNOldKNWWWXOxxxxxxkxddOK000KXXXNNNNWWWWWWWWWXOo:,..''................      
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMXdoKWWWWX0OkkkkkxdkOO00KXXNNWNWWWWWWWWXko:,'''''....................    
// MMMMMMMMMMMMMMMMMMMMMMMMWWMMM0cdXWWWWN0kkxxkkOO0KKXXNNNWWWWWWWWX0xl;,,,''.........................  
// MMMMMMMMMMMMMMMMMMMMMMMMWWMWMXl,cxKWWWNKOOO000KKXNNNNNWWWMWWWXxc;,,,''........'..................   
// MMMMMMMMMMMMMMMMMMMMMMMMMMWWMNd;,;dNWWWWNXKKKKXXNWWWWWMWWMWWWO:,;;,'.......''''...................  
// MMMMMMMMMMMMMMMMMMMMMMMMMWWWWNx:;:lkNMWWWWNXXXXNNWMMWWMMWWWW0l;::'...'',,,,,'''''''.................
// MMMMMMMMMMMMMMMMMMMMMMMMWWMMWWO:,;;ckNWWWWWWWNNNWMMMWWMMWWWNklc;',:c::;;,,''''''....................
// MMMMMMMMMMMMMMMMMMMMMMMMMWMMMMXl,;;:xNWWWMMMMWWWMMMMWWMMWWWWXd;;clc:;,''''''''......................
// MMMMMMMMMMMMMMMMMMMMMMMMMMWWWMWk:,,;l0WWWWWWMMWWMMMMWMMMWWWW0l;:ccclodoc;'....''....................