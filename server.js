'use strict';
const chain = require('./simpleChain');
const bm = require('./blockModel');
const vf = require('./validation');

const boom = require('boom');
const Hapi = require('hapi');
const Joi = require('joi');
const INIT_CHAIN_HEIGHT = parseInt(0);

const blockchain = chain.blockchainFactory();
const validation = vf.validationFactory();


// Create a server with a host and port
const server = Hapi.server({
    host: 'localhost',
    port: 8000
});

const getHashHandler = async function (request, h) {
    const hash = encodeURIComponent(request.params.blockhash);

    try {
        const block = await blockchain.getBlockByHash(hash)
            .catch((err) => {throw err});
        return block;
    } catch (err) {
        throw err;
    }
}


const getServerAddressHandler = async function (request, h) {

    const address = encodeURIComponent(request.params.address);

    try {
        const blocks = await blockchain.getBlocksByAddress(address)
            .catch((err) => {throw err});
        return blocks;
    } catch (err) {
        throw err;
    }

}


const getBlockHandler = async function (request, h) {

    const blockHeight = request.params.blockheight ?
        encodeURIComponent(request.params.blockheight) : INIT_CHAIN_HEIGHT;
    console.log('get BlockHeight ' + blockHeight);

    try {
        const block = await chain.getBlockObj(parseInt(blockHeight))
            .catch((err) => {throw err});
        return block;
    } catch (err) {
        return err;
    }
}

const postBlockHandler = async function (request, h) {
    console.log("Receive Block POST " + JSON.stringify(request.payload));

    try {
        let address = request.payload.address;
        const addressExist = await validation.existAddress(address);
        if (addressExist.hasEntry && addressExist.validationModel.messageVerify) {
            let newBlock = bm.buildBlock(address, request.payload.star);
            const addBlock = await blockchain.addBlock(newBlock)
                .catch((err) => {throw err});
            await validation.removeAddress(address)
                .catch((err) => {throw err});
            return addBlock;
        } else {
            throw boom.unauthorized("Wallet Address is not registered or verified!");
        }
    } catch (err) {
         return  err;
    }
}

const postRequestValidationHandler = async function (request, h) {
    console.log("Receive RequestValidation POST " + JSON.stringify(request.payload));

    try {
        const response = await validation.validateRequest(request.payload.address)
            .catch((err) => {throw err});
        return response;
    } catch (err) {
        throw err;
    }
}

const postMessageSignatureHandler = async function (request, h) {
    console.log("Receive MessageSignature POST " + JSON.stringify(request.payload));

    try {
        const response = await validation.signatureMessage(request.payload.address, request.payload.signature)
            .catch((err) => {throw err});
        return response;
    } catch (err) {
        throw err;
    }
 }

const getServerBlock = {
    handler: getBlockHandler
}

const getServerHash = {
    handler: getHashHandler
}

const getServerAddress = {
    handler: getServerAddressHandler
}

const postServerBlock = {
    handler: postBlockHandler,
    validate: {
        payload: {
            address: Joi.string().regex(/^[a-zA-Z0-9]{26,35}$/).required(),
            star: {
                dec: Joi.string().min(1).required(),
                ra: Joi.string().min(1).required(),
                story: Joi.string().min(1).required(),
                magnitude: Joi.string().min(1).optional(),
                constellation: Joi.string().min(1).optional()
            }
        }
    }
}

const postRequestValidation = {
    handler: postRequestValidationHandler,
    validate: {
        payload: {
            // Bitcoin addresses between 26 - 35 characters BASE58 check
            address: Joi.string().regex(/^[a-zA-Z0-9]{26,35}$/).required()
        }
    }
}

const postMessageSignature = {
    handler: postMessageSignatureHandler,
    validate: {
        payload: {
            // Bitcoin addresses between 26 - 35 characters BASE58 check
            address: Joi.string().regex(/^[a-zA-Z0-9]{26,35}$/).required(),
            signature: Joi.string().min(1).required()
        }
    }
}


// Add the route
server.route([{
        method: 'GET',
        path: '/block/{blockheight?}',
        config: getServerBlock
    }, {
        method: 'GET',
        path: '/stars/hash:{blockhash}',
        config: getServerHash
    }, {
        method: 'GET',
        path: '/stars/address:{address}',
        config: getServerAddress
    }, {
        method: 'POST',
        path: '/block',
        config: postServerBlock
    }, {
        method: 'POST',
        path: '/requestValidation',
        config: postRequestValidation
    }, {
        method: 'POST',
        path: '/message-signature/validate',
        config: postMessageSignature
    }]
);

// Start the server
async function start() {

    try {
        await server.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();