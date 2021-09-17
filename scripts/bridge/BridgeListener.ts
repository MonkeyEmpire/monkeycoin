import { Contract, EventData } from 'web3-eth-contract';
import { Blockchain } from './index';
import fs from 'fs'
import Web3 from 'web3';

export type Transfer = {
    from: string,
    to: string,
    amount: string,
    date: string,
    nonce: string
}
const LAST_BLOCK_PREFIX = "./last_block_"
const LAST_BLOCK_SUFFIX = ".txt"

export default class BridgeListener {
    chain: Blockchain;
    bridgeContract: Contract;
    lastBlock: number;
    lock = false;
    interval: number;
    intervalID?: NodeJS.Timer;
    web3: Web3;

    constructor(
        chain: Blockchain,
        bridgeContract: Contract,
        interval: number = 1000,
        web3: Web3
    ) {
        this.chain = chain;
        this.bridgeContract = bridgeContract
        this.interval = interval
        this.lastBlock = this.readLastBlockFromDisk()
        this.web3 = web3
    }

    private getLastBlockFilePath() {
        return `${LAST_BLOCK_PREFIX}${this.chain}${LAST_BLOCK_SUFFIX}`;
    }

    private readLastBlockFromDisk() {
        try {
            const data = fs.readFileSync(this.getLastBlockFilePath(), 'utf8')
            return parseInt(data)
        } catch (err) {
            console.log(`[${this.chain}] Error reading last block`)
            return 0
        }
    }

    private updateLastBlock(blockNumber: number) {
        this.lastBlock = blockNumber

        try {
            const data = fs.writeFileSync(this.getLastBlockFilePath(), blockNumber.toString())
        } catch (err) {
            console.log(`[${this.chain}] Cannot update last block file `)
        }

        return blockNumber;
    }

    convert(event: EventData): Transfer {
        const { from, to, amount, date, nonce } = event.returnValues;
        return { from, to, amount, date, nonce }
    }

    onEvent(event: EventData, onTransaction: (transfer: Transfer) => Promise<void>): Promise<void> {
        const transfer = this.convert(event)
        return new Promise((resolve, reject) => {
            onTransaction(transfer).then(
                () => {
                    this.updateLastBlock(event.blockNumber)
                    resolve()
                }
            ).catch(
                () => {
                    console.error(`[${this.chain}] an error occured with transfer nonce :` + transfer.nonce)
                    reject()
                }
            )
        })
    }

    runner(onTransaction: (transfer: Transfer) => Promise<void>, last_block: number) {

        const toBlock = Math.min(last_block, this.lastBlock + 4999)

        return new Promise((resolve, reject) => {
            this.bridgeContract.getPastEvents(
                'Transfer',
                { fromBlock: this.lastBlock + 1, toBlock: toBlock }
            ).then(
                events => {
                    const filteredEvents = events
                        .filter(event => event.returnValues[5] == 0)//keep only mint steps
                    console.log(`[${this.chain}] Retrieved ` + filteredEvents.length + ` transactions`)
                    if (filteredEvents.length === 0) {
                        console.log(`[${this.chain}]` + "No events in the past blocks. Updating from ", this.lastBlock, " to ", toBlock)
                        this.updateLastBlock(toBlock)
                    }
                    filteredEvents
                        .reduce(
                            (p, c) => p.then(_ => this.onEvent(c, onTransaction)),
                            Promise.resolve()
                        ).then(
                            resolve
                        ).catch(
                            reject
                        )
                }
            ).catch(
                err => {
                    if (err && err.code == -32000) {
                        console.log(`Error getting past events[${this.chain}] ${err.message}`)
                        resolve(null)
                    } else {
                        console.log('Error ' + err.message)
                        resolve(null)
                        // reject()
                    }
                }
            )
        })
    }

    listen(onTransaction: (transfer: Transfer) => Promise<void>) {
        this.intervalID = setInterval(
            () => {
                if (this.lock) return;
                this.lock = true;
                console.log(`[${this.chain}] listening to bridge transfers. Last block:` + this.lastBlock)
                this.web3.eth.getBlockNumber().then(
                    num => {
                        this.runner(onTransaction, num).then(
                            () => {
                                console.log(`[${this.chain}] finished listening to bridge transfers`)
                            }
                        ).catch(
                            () => {
                                console.error(`[${this.chain}] an error occured while listening to bridge transfers`)
                            }
                        ).finally(
                            () => {
                                this.lock = false;
                            }
                        )

                    }
                ).catch(err => {
                    console.log("Cannot get block number ", err)
                })
            }
            , this.interval
        )
    }

    stop() {
        if (this.intervalID)
            clearInterval(this.intervalID)
    }
}