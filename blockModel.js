const SHA256 = require('crypto-js/sha256');
const msg = require('./messages');
const messageUtil = msg.messageUtilFactory();
const INIT_CHAIN_HEIGHT = parseInt(0);
const INIT_GENESIS_BODY = "First block in the chain - Genesis block";
const INIT_STRING = "";

class Body {
    constructor(address, star) {
        this.address = address;
        this.star = star;
    }
}

class Block {
    constructor(data) {
        this.hash = INIT_STRING;
        this.height = INIT_CHAIN_HEIGHT;
        this.body = data;
        this.time = 0;
        this.previousBlockHash = INIT_STRING;
    }
}

module.exports.genesisFactory = function genesisFactory () {
    let genesis = new Block();
    genesis.body = INIT_GENESIS_BODY;
    genesis.time = new Date().getTime().toString().slice(0, -3);
    genesis.hash = SHA256(JSON.stringify(genesis)).toString();
    return genesis;
}

// not a real Builder Pattern (handle build or mapping  "complexer" structure)
module.exports.buildBlock = function buildBlock(address, star) {
    const body  = new Body(address, star);
    return new Block(body);
}

module.exports.compareBodyAddress = function compareBodyAddress(address, body) {
    let retValue = false;

    if (body !== undefined && body != null) {
        if (body.address !== undefined && body.address === address) {
            retValue = true;
        }
    }
    return retValue;
}

module.exports.decodeStoryAddToBlock = function decodeStoryAddToBlock(jsonBlock) {
    let block = JSON.parse(jsonBlock);
    if (block.body !== undefined && block.body.star !== undefined) {
        block.body.star.storyDecoded = messageUtil.decodeHex(block.body.star.story);
    }
    return block;
}

// functions JSON.parse don't init Class methods.
module.exports.setBlockTimestamp = function setBlockTimestamp(block) {
    block.time = new Date().getTime().toString().slice(0, -3);
    return block;
}
module.exports.setBlockHashes = function setBlockHashes(block, previousHashes) {
    block.previousBlockHash = previousHashes;
    block.hash = SHA256(JSON.stringify(block)).toString();
    return block;
}
module.exports.setEndoeStory = function setEncodeStory(block) {
    if (block.body !== undefined && block.body.star !== undefined) {
        block.body.star.story = messageUtil.encodeHex(block.body.star.story);
    }
    return block;
}