const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

let keyPair = bitcoin.ECPair.fromWIF('L11HtxA574cF2jwvvbu6fLxxngD8MJqCYTviRTbMzb587giLH2Pi');
let privateKey = keyPair.privateKey
let address = '1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw'
let timestamp = '1540130742731'
let message = address + ":" + timestamp + ":starRegistry";

let signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);console.log(signature.toString('base64'));

/*

curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw",
  "signature": "H85v77UY3X22tXzH7g5MUCSTIMI4LKcCa2b370GmqCMuFoNrCe0j5yG8HqNzooCDNa5lL5R9F10TIndGPICtSA8="
}'

curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw"
}'

address 1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw
secret L11HtxA574cF2jwvvbu6fLxxngD8MJqCYTviRTbMzb587giLH2Pi
 */