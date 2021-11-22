import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from "web3";

import * as BridgeBSCABI from '../abi/MKCBridgeBsc.json'
import * as MkcBSCABI from '../abi/MonkeyCoinBsc.json'
import { getAvaxWeb3Instance, BRIDGE_AVAX_ADDRESS, MKC_AVAX_ADDRESS, getBscWeb3Instance, BRIDGE_BSC_ADDRESS, MKC_BSC_ADDRESS } from './utils';

const main = async () => {
    console.log("BSC TO AVAX TRANSFER")
    const web3BSC = getBscWeb3Instance();
    const address = (web3BSC.currentProvider as HDWalletProvider).getAddress(0)
    console.log("USING ADDRESS: ", address)

    const bridgeContract = new web3BSC.eth.Contract(BridgeBSCABI as any, BRIDGE_BSC_ADDRESS)
    const mkcContract = new web3BSC.eth.Contract(MkcBSCABI as any, MKC_BSC_ADDRESS)
    console.log()
    await mkcContract.methods.approve(BRIDGE_BSC_ADDRESS, "5000000000000000000000000000000").send({ from: address })
    try {
        await bridgeContract.methods.burn(address, '5000000000000000000').send({ from: address, value: "1000000000000000" })

    }
    catch (err) {
        console.log("Error calling burn function")
        console.log(err)
    }
}

main()