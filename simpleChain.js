/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const bm = require('./blockModel');
const ListStream = require('list-stream');
const boom = require('boom');

const db = level(chainDB);

const DB_HEIGHT = "CHAIN_HEIGHT";
const INIT_CHAIN_HEIGHT = parseInt(0);

class CheckRetValue {
    constructor(height, check) {
        this.height = height;
        this.check = check;
    }
}

function getBlock(key) {
    return new Promise(function (resolve, reject) {
        db.get(key, function (err, value) {
            if (err) {
                const notFoundErr = 'Block ' + key + ' not found!';
                console.log(notFoundErr, err);
                reject(boom.notFound(notFoundErr));
            } else {
                // console.log("getLevelDB DataValue: " + value);
                resolve(value);
            }
        });
    });
}

function saveToDB(block) {

    const jsonBlock = JSON.stringify(block).toString();
    console.log(jsonBlock);

    const ops = [
        // save Block with BlockHeight
        {type: 'put', key: block.height, value: jsonBlock},
        // reference (Index) HASH to BlockHeight, every hash in the chain must be unqiue.
        // The unique blockHeight ist part oft the Hash!
        {type: 'put', key: block.hash, value: block.height},
        // save last BLOCKHEIGHT
        {type: 'put', key: DB_HEIGHT, value: block.height}
    ];

    // add (Index) for wallet Address
    db.batch(ops, function (err) {

        if (err) {
            const message = "Error adding Block " + block.height + " to chain DB";
            console.log(message, err);
            throw boom.conflict(message);
        } else {
            console.log("Block " + block.height + " sucessfull added to chainDB!");
        }
    })

}

function getBlockObj(key) {
    return new Promise(function (resolve, reject) {
        getBlock(key).then((jsonBlock) => {
            const blockObj = bm.decodeStoryAddToBlock(jsonBlock);
            resolve(blockObj);
        }).catch((err) => {
            reject(err);
        });
    });
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
    constructor() {
        this.getBlockHeight().then(height => {

            if (height == INIT_CHAIN_HEIGHT) {
                console.log("INIT GENESIS BLOCK");
                let genesis = bm.genesisFactory();
                saveToDB(genesis);
            }
        });

    }

    // Add new block()
    addBlock(newBlock) {

        return new Promise((resolve, reject) => {
            this.getBlockHeight().then(height => {

                newBlock.height = height;
                const previousHeight = newBlock.height - 1;

                if (newBlock.height > 0) {
                    getBlockObj(previousHeight).then(previousBlock => {
                        newBlock = bm.setBlockTimestamp(newBlock);
                        newBlock = bm.setBlockHashes(newBlock, previousBlock.hash);
                        newBlock = bm.setEndoeStory(newBlock);
                        saveToDB(newBlock);
                        resolve(newBlock);
                    }).catch((error) => {
                        console.log(error);
                        reject(error);
                    });
                } else {
                    reject(boom.notFound("No Genesis Block set !"));
                }
            });
        });

    }


// New Version suggestion of Coach
    getBlockHeight() {

        return new Promise(function (resolve) {
            db.get(DB_HEIGHT, function (err, value) {
                if (err) {
                    db.put(DB_HEIGHT, INIT_CHAIN_HEIGHT, function (err) {
                        if (err) return console.log('DB_HEIGHT ' + key + ' failed. NOT increased', err);
                    });
                    resolve(INIT_CHAIN_HEIGHT);
                } else {
                    const retValue = parseInt(value) + 1;
                    resolve(retValue);
                }
            });
        });

    }

    getBlockByHash(hashValue) {

        return new Promise(function (resolve, reject) {
            getBlock(hashValue).then((blockHeight) => {
                 getBlockObj(blockHeight).then((block) => {
                    resolve(block);
                }).catch((err) => {
                    const message = "Block for Hash " + hashValue + " block height "
                        + blockHeight + " not found!";
                    reject(boom.notFound(message));
                });
            }).catch((err) => {
                const message = "Block height for Hash " + hashValue + " not found!";
                reject(boom.notFound(message));
            });
        });
    }

    getBlocksByAddress(address) {

        console.log("search for address " + address);
        return new Promise(function (resolve, reject) {
            let addressBlocks = [];

            db.createValueStream().pipe(
                ListStream.obj(function (err, data) {
                    if (err) {
                        reject(boom.boomify(err));
                    } else {

                        data.forEach(function (value, i) {;
                            let block = bm.decodeStoryAddToBlock(value);

                            if (bm.compareBodyAddress(address, block.body)) {
                                console.log("push block " + block.height + " into result.");
                                addressBlocks.push(block);
                            }
                        });
                        if (addressBlocks.length > 0) {
                            resolve(addressBlocks);
                        } else {
                            const emptyERR = "No entries found for address " + address;
                            reject(boom.notFound(emptyERR));
                        }
                    }
                })
            );
        });
    }


    // validate block
    validateBlock(blockHeight) {
        return new Promise((resolve, reject) => {

            this.getBlock(blockHeight).then((block) => {
                let blockObj = JSON.parse(block);
                const blockHash = blockObj.hash;
                blockObj.hash = '';
                const validBlockHash = SHA256(JSON.stringify(blockObj)).toString();
                if (blockHash === validBlockHash) {
                    console.log('Block # ' + blockHeight + ' valid hash:\n' + blockHash);
                    resolve(new CheckRetValue(blockHeight, true));
                } else {
                    console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
                    resolve(new CheckRetValue(blockHeight, false));
                }
            }).catch((err) => {
                console.log('Error in getBlock at ValidateBlock() with Block ' + err);
                reject(new CheckRetValue(blockHeight, false));
            });

        });
    }

    validatePreviousBlockHash(blockHeight, chainHeight) {
        return new Promise((resolve, reject) => {

            this.getBlock(blockHeight).then((block) => {
                let blockObj = JSON.parse(block);
                const blockHash = blockObj.hash;
                const nextHeight = blockHeight + 1;
                if (nextHeight < chainHeight) {

                    this.getBlock(nextHeight).then(nextBlock => {
                        let nextBlockObj = JSON.parse(nextBlock);
                        const previousBlockHash = nextBlockObj.previousBlockHash;
                        if (blockHash === previousBlockHash) {
                            console.log('Block # ' + blockHeight + ' valid previous hash:\n' + blockHash)
                            resolve(new CheckRetValue(blockHeight, true));
                        } else {
                            console.log('Block #' + blockHeight + ' invalid previous hash:\n' + blockHash + '<>'
                                + previousBlockHash);
                            resolve(new CheckRetValue(blockHeight, false));
                        }
                    }).catch((err) => {
                        console.log('Error in getBlock at validatePreviousBlockHash() with next Block ' + err);
                        reject(new CheckRetValue(blockHeight, false));
                    });

                } else {
                    console.log('Last Block, no check for previousBlockHash possible!');
                    resolve(new CheckRetValue(blockHeight, true));
                }
            }).catch((err) => {
                console.log('Error in getBlock at validatePreviousBlockHash() with Block ' + err);
                reject(new CheckRetValue(blockHeight, false));
            });


        });

    }

// Validate blockchain
    validateChain() {

        this.getBlockHeight().then(height => {

            let chainPromises = [];
            let errorLog = [];

            for (let i = 0; i < height; i++) {
                chainPromises.push(this.validateBlock(i));
                chainPromises.push(this.validatePreviousBlockHash(i, height));
            }

            Promise.all(chainPromises).then((results) => {

                for (let i in results) {
                    const result = results[i];
                    if (!Boolean(result.check)) {
                        const errorHeight = parseInt(result.height);
                        console.log("push error " + errorHeight);
                        errorLog.push(errorHeight);
                    }
                }

                // remove duplicate errors Block
                // e.g. validate Block false and validatePreviousBlockHash is false
                const uniqueErrorLogs = [...new Set(errorLog)];
                if (uniqueErrorLogs.length > 0) {
                    console.log('Block errors = ' + uniqueErrorLogs.length);
                    console.log('Blocks: ' + uniqueErrorLogs);
                } else {
                    console.log('No errors detected');
                }

            });
        });
    }
}

function blockchainFactory() {
    return new Blockchain();
}

module.exports = {
    blockchainFactory: blockchainFactory,
    getBlockObj: getBlockObj
}