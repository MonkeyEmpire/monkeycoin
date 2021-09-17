import { Blockchain } from "./index";
import BridgeListener, { Transfer } from "./BridgeListener";
import { TransactionReceipt } from 'web3-eth'
import { Contract } from 'web3-eth-contract';
import Web3 from "web3";

export default class Bridge {
    sourceChain: Blockchain
    sourceBridgeContract: Contract
    sourceWeb3: Web3
    destinationChain: Blockchain
    destinationBridgeContract: Contract
    destinationWeb3: Web3
    destinationAdminAddress: string;
    bridgeListener: BridgeListener;

    constructor(
        sourceChain: Blockchain,
        sourceBridgeContract: Contract,
        sourceWeb3: Web3,
        destinationChain: Blockchain,
        destinationBridgeContract: Contract,
        destinationWeb3: Web3,
        destinationAdminAddress: string,
        interval: number = 1000
    ) {
        this.sourceChain = sourceChain
        this.sourceBridgeContract = sourceBridgeContract
        this.sourceWeb3 = sourceWeb3
        this.destinationChain = destinationChain
        this.destinationBridgeContract = destinationBridgeContract
        this.destinationWeb3 = destinationWeb3
        this.destinationAdminAddress = destinationAdminAddress
        this.bridgeListener = new BridgeListener(sourceChain, sourceBridgeContract, interval, sourceWeb3)
    }

    private getGasData(tx: any): Promise<{ gasPrice: string, gasCost: string }> {
        return Promise.all([
            this.destinationWeb3.eth.getGasPrice(),
            tx.estimateGas({ from: this.destinationAdminAddress }),
        ]).then(
            res => {
                return { gasPrice: res[0], gasCost: res[1] }
            }
        )
    }

    private sendTransaction(tx: any, gasData: { gasPrice: string, gasCost: string }): Promise<TransactionReceipt> {
        return this.destinationWeb3.eth.getTransactionCount(this.destinationAdminAddress).then(
            nonce => {
                const data = tx.encodeABI();
                const txData = {
                    from: this.destinationAdminAddress,
                    to: this.destinationBridgeContract.options.address,
                    data,
                    gas: gasData.gasCost,
                    gasPrice: gasData.gasPrice,
                    nonce: nonce
                };
                return this.destinationWeb3.eth.sendTransaction(txData);
            })
    }

    mint(transfer: Transfer): Promise<void> {
        const tx = this.destinationBridgeContract.methods.mint(transfer.to, transfer.amount, transfer.nonce);
        return new Promise((resolve, reject) => {
            this.getGasData(tx).then(
                gasData => {
                    this.sendTransaction(tx, gasData).then(
                        receipt => {
                            console.log(`Transaction (${this.destinationChain}) hash: ${receipt.transactionHash}`);
                            console.log(`
                            Processed transfer:
                            - from ${transfer.from} 
                            - to ${transfer.to} 
                            - amount ${transfer.amount} tokens
                            - date ${transfer.date}
                            - nonce ${transfer.nonce}
                            `)
                            resolve()
                        }
                    ).catch(
                        err => {
                            console.log("Error minting:")
                            console.log(err.message)
                            reject(err)
                        }
                    )

                }
            ).catch(
                err => {
                    console.log(`#${err.message}#`)
                    if (err && (err.message as string).startsWith("execution reverted: transfer already processed")) {
                        console.log(`[${this.destinationChain}] nonce: ${transfer.nonce} already processed`)
                        resolve()
                    } else {
                        console.log('Error estimating tx : ', err.message)
                        reject()
                    }
                }
            )
        })
    }

    start() {
        this.bridgeListener.listen(this.mint.bind(this))
    }

    stop() {
        this.bridgeListener.stop()
    }

}