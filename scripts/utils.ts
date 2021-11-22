import Web3 from "web3"
import HDWalletProvider from '@truffle/hdwallet-provider';
import * as secrets from '../secrets.json'

const mnemonic = secrets.mnemonic
export const TEST = false
export const ADMIN_ADDRESS = TEST ? "0x8813bd2dA50a1Fb95443a41d36Fd19D0FAF6E593" : "0xB722A8Af023A92Bc1764978fD926cDE1b48C5e28"

export const AVALANCHE_URL = TEST ? 'https://api.avax-test.network/ext/bc/C/rpc' : 'https://api.avax.network/ext/bc/C/rpc'
export const BSC_URL = TEST ? "https://data-seed-prebsc-1-s1.binance.org:8545" : 'https://bsc-dataseed.binance.org/'

export const BRIDGE_AVAX_ADDRESS = TEST ? "0xFdD7C285838c3DD8584BFcC7bEB1259ac658d17e" : "0xf572a9Bc621b23969D7232f1717eA2E63fE0A5DE"
export const MKC_AVAX_ADDRESS = TEST ? "0xE82c4ce37F381242E9082c28c84936778dFCc1D3" : "0xCA490D74e3e7044481a61A76f8f9995994e8DdFD"

export const BRIDGE_BSC_ADDRESS = TEST ? "0xDc7bE980b7b4D3A1aBB8237B6D795f84154C05B4" : "0x815Fa6B5E6FeD310914138a55130734cE5ac3D69"
export const MKC_BSC_ADDRESS = TEST ? "0xE82c4ce37F381242E9082c28c84936778dFCc1D3" : "0xb413A28a743A886901Ebc3383Fb7f055f86DD8f8"



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


