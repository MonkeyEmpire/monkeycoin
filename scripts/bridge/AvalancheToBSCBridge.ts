import { getAvaxWeb3Instance, getBscWeb3Instance, BRIDGE_AVAX_ADDRESS, BRIDGE_BSC_ADDRESS, ADMIN_ADDRESS } from '../utils';
import { Blockchain } from "./index";
import * as BridgeAvaxABI from '../../artifacts/contracts/MKCBridgeAvax.sol/MKCBridgeAvax.json'
import * as BridgeBscABI from '../../artifacts/contracts/MKCBridgeBsc.sol/MKCBridgeBsc.json'

const web3Avax = getAvaxWeb3Instance()
const web3Bsc = getBscWeb3Instance()

const bridgeAvaxContract = new web3Avax.eth.Contract(
    BridgeAvaxABI.abi as any,
    BRIDGE_AVAX_ADDRESS
)

const bridgeBSC = new web3Bsc.eth.Contract(
    BridgeBscABI.abi as any,
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
