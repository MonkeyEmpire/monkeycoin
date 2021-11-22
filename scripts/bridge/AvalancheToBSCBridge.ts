import { getAvaxWeb3Instance, getBscWeb3Instance, BRIDGE_AVAX_ADDRESS, BRIDGE_BSC_ADDRESS, ADMIN_ADDRESS } from '../utils';
import { Blockchain } from "./index";
import * as BridgeAvaxABI from '../../abi/MKCBridgeAvax.json'
import * as BridgeBscABI from '../../abi/MKCBridgeBsc.json'

const web3Avax = getAvaxWeb3Instance()
const web3Bsc = getBscWeb3Instance()

const bridgeAvaxContract = new web3Avax.eth.Contract(
    BridgeAvaxABI as any,
    BRIDGE_AVAX_ADDRESS
)

const bridgeBSC = new web3Bsc.eth.Contract(
    BridgeBscABI as any,
    BRIDGE_BSC_ADDRESS
)

import Bridge from "./Bridge";

export default class AvalancheToBscBridge extends Bridge {
    constructor(interval: number = 1000) {
        super(
            Blockchain.AVALANCHE,
            bridgeAvaxContract,
            web3Avax,
            Blockchain.BSC,
            bridgeBSC,
            web3Bsc,
            ADMIN_ADDRESS,
            interval
        )
    }
}
