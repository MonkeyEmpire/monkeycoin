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

export default class BSCToAvalancheBridge extends Bridge {
    constructor(interval: number = 1000) {
        super(
            Blockchain.BSC,
            bridgeBSC,
            web3Bsc,
            Blockchain.AVALANCHE,
            bridgeAvaxContract,
            web3Avax,
            ADMIN_ADDRESS,
            interval
        )
    }
}
