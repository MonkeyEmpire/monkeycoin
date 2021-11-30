import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from "web3";

import * as BridgeAVAX from '../artifacts/contracts/MKCBridgeAvax.sol/MKCBridgeAvax.json'
import * as MkcAVAX from '../artifacts/contracts/MonkeyCoinAvax.sol/MonkeyCoinAvax.json'
import { getAvaxWeb3Instance, BRIDGE_AVAX_ADDRESS, MKC_AVAX_ADDRESS } from './utils';

const main = async () => {
    console.log("AVAX TO BSC TRANSFER")
    const web3Avax = getAvaxWeb3Instance();
    const account = (web3Avax.currentProvider as HDWalletProvider).getAddress(0);
    console.log("account: ", account)

    const bridgeContract = new web3Avax.eth.Contract(BridgeAVAX.abi as any, BRIDGE_AVAX_ADDRESS)
    // const mkcContract = new web3Avax.eth.Contract(MkcAVAX.abi as any, MKC_AVAX_ADDRESS)
    // await mkcContract.methods.approve(BRIDGE_AVAX_ADDRESS, "210000000000000000000000000000").send({ from: account })
    // console.log("APPROVED 210B MKC");
    await bridgeContract.methods.burn('5000000000000000000').send({ from: account, value: "10000000000000000" }) // 0.01 AVAX
    console.log("TRANSFERRED 5 MKC");
}

main()
