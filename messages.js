const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const wordcount = require('word-count');
const boom = require('boom');
const ERROR_ENCODE_STORY_LEN = "Encoded HEX String greater then 500 Bytes!";
const ERROR_ENCODE_STORY_WORDS = "Story has mor than 250 words!";
const LEN_HEX_LEN = 500;
const MAX_WORDS = 250;

const HEX_FLAG = 'hex';
const UTF8_FLAG = 'utf8';

class MessageUtil {

    decodeHex(dataString) {
        const buffer = Buffer.from(dataString, HEX_FLAG);
        return buffer.toString(UTF8_FLAG);
    }

    encodeHex(dataString) {
        if (wordcount(dataString) > MAX_WORDS) {
            throw boom.badData(ERROR_ENCODE_STORY_WORDS);
        }
        const encodeBuffer = Buffer.from(dataString);
        const encodeString = encodeBuffer.toString(HEX_FLAG);
        if (encodeString.length > LEN_HEX_LEN) {
            throw boom.badData(ERROR_ENCODE_STORY_LEN);
        }
        return encodeString;
    }

    verify(address, signature, message) {
        try {
            return bitcoinMessage.verify(message, address, signature);
        } catch (err) {
            throw err;
        }
    }
}

// Factory for Singleton Pattern validation holds no data.
module.exports.messageUtilFactory = function messageUtilFactory() {
    return new MessageUtil();
}