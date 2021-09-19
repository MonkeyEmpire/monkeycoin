import Web3 from "web3"
import HDWalletProvider from '@truffle/hdwallet-provider';
import * as secrets from '../secrets.json'

const mnemonic = secrets.mnemonic
export const TEST = true
export const ADMIN_ADDRESS = TEST ? "0x8813bd2dA50a1Fb95443a41d36Fd19D0FAF6E593" : "0xC561Acf283e80e30eA2c301b50B0632Ffc983035"

export const AVALANCHE_URL = TEST ? 'https://api.avax-test.network/ext/bc/C/rpc' : 'https://api.avax.network/ext/bc/C/rpc'
export const BSC_URL = TEST ? "https://data-seed-prebsc-1-s1.binance.org:8545" : 'https://bsc-dataseed.binance.org/'

export const BRIDGE_AVAX_ADDRESS = TEST ? "0xFdD7C285838c3DD8584BFcC7bEB1259ac658d17e" : "0xde2AFcf0b176f68100f3F4bc6A9d0E7D788cafDb"
export const MKC_AVAX_ADDRESS = TEST ? "0xE82c4ce37F381242E9082c28c84936778dFCc1D3" : "0x65378b697853568dA9ff8EaB60C13E1Ee9f4a654"

export const BRIDGE_BSC_ADDRESS = TEST ? "0xDc7bE980b7b4D3A1aBB8237B6D795f84154C05B4" : "0x2ba832506284AF58abF5c677345e34d90A52875B"
export const MKC_BSC_ADDRESS = TEST ? "0xE82c4ce37F381242E9082c28c84936778dFCc1D3" : "0x52D88a9a2a20A840d7A336D21e427E9aD093dEEA"



export const getAvaxWeb3Instance = (): Web3 => {
    const provider = new HDWalletProvider(
        mnemonic,
        AVALANCHE_URL,
        0,
        1
    )
    const web3 = new Web3(provider)
    return web3
}

export const getBscWeb3Instance = (): Web3 => {
    const provider = new HDWalletProvider(
        mnemonic,
        BSC_URL,
        0,
        1
    )
    const web3 = new Web3(provider)
    return web3
}


