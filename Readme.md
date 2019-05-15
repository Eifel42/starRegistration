# myStarBlockchain

Demonstration of a RESTful Web API with Node.js Framework and simple blockchain implementation.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Install nodejs and npm on your machine.

#### Mac with homebrew
```
brew update
```

If node already install, check the version and upgrade to the latest version.
```
node -v
npm -v
brew upgrade
```
#### Ohter operation systems

* [NodeJS Installation operation systems](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) - NodeJS Web Framework

### Installing

#### Files
* server.js - HapiJs server
* simpleChain.js - simple blockchain implementation

#### Install dependencies with package.json
* package.json - NodeJS Package file, contains framework dependencies

```
npm install
```

#### Manual Installation in directory:

```
npm init
npm install bitcoinjs-lib -save
npm install bitcoinjs-message -save
npm install crypto-js -save
npm install hapi -save
npm install joi -save
npm install level -save 
npm install boom -save
npm install list-stream -save
npm install word-count -save
```
## Running the tests
```

### Start server
node server.js
```
### Tests
These tests describe first initial tests. Every services section include a request and response.
```
curl http://localhost:8000/block/0
```
**Respone Example**
```
{"hash":"d72000174e9f641f941bd4cc9e7311ef48b3a03f466f0224a0dbf7e66c0360f7",
 "height":0,
 "body":"First block in the chain - Genesis block",
 "time":"1539717068",
 "previousBlockHash":""}
```
## Services Endpoints

### Validate User Request
Restful Post method which allow a user to register his wallet address to the services. 

```
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw"
}'
```
**Respone Example**
```
{"address":"1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw",
 "requestTimeStamp":1540306744010,
 "message":"1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw:1540306744010:starRegistry",
 "validationWindow":300}
```
#### Parameters
| Parameter| Description   | Required |
| :------- | :-------------| :-------:|
| address  | Wallet address. Contains 26 - 35 characters, only numbers and letters (upper and lower cases).    | yes |

#### Error

If required parameter not set or does not fit to the parameter validation:
```
{"statusCode":400,"error":"Bad Request","message":"Invalid request payload input"}
```
If address not registered and signend: Wallet Address is not registered or verified!   
If encoded HEX Story greater then 500 Bytes: Encoded HEX String greater then 500 Bytes!
### Allow User Message Signature
Restful Post method which allow user message signature. It checks the signed signature and post the validation window. 
The validation window is the time in seconds till the request expires.

```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
"address": "1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw",
    "signature": "H+PQWEHrgokD37rDKwLCU4PNh1ErFVTQZlB/XyrMvAveBb/W4sw+q62FnqD4kfVq/PXT+ODe+P7OJIf67g/Jq+M="
}'
```
**Respone Example**
```
{"registerStar":true,
 "status":{
    "address":"1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw",
    "requestTimeStamp":1540306744010,
    "message":"1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw:1540306744010:starRegistry",
    "validationWindow":154,
    "messageSignature":"valid"}} 
```
| Parameter| Description   | Required |
| :------- | :-------------| :-------:|
| address  | Wallet address. Contains 26 - 35 characters, only numbers and letters (upper and lower cases).    | yes |
| signature| Signed message of the response attribute from the validate user request service.  | yes |

#### Error

If the address not register: FAILED Address not register! Please start a validation request.  
It the time is expired: FAILED time has expired! Please start a new request.

### Star Registration
Restful Post method which add a star to the blockchain.  

```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```
**Respone Example**
```
{"hash":"5e42cef837e205d7a1420e893d69d89baaa6d2127cbc5507871dbf43d98cf19d",
 "height":1, 
 "body":
  {"address":"1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw",
   "star":{"dec":"-26° 29' 24.9",
           "ra":"16h 29m 1.0s",
           "story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"}},
  "time":"1540298682",
  "previousBlockHash":"3594637013c68f333da58ba4308100a88024ac8a0228e2136eac7c5cb8fb5fde"}
```

#### Parameters
| Parameter| Description   | Required |
| :------- | :-------------| :-------:|
| address  | Wallet address. Contains 26 - 35 characters, only numbers and letters (upper and lower cases).    | yes |
| star  | Star schema attributes describe as star:xxx.    | yes |
| star:dec  | Declination  | yes |
| star:ra  |  Right ascension | yes |
| star:story | ASCII String limited to 500 characters. Stored as hex encoded in the blockchain.   | yes |
| star:magnitude  | Magnitude  | no / optional |
| star:constellation  | Constellation  | no / optional |

#### Error

If required parameter not set or does not fit to the parameter validation:
```
{"statusCode":400,"error":"Bad Request","message":"Invalid request payload input"}
```
### Search by Blockchain Wallet Address

Restful GET method which retrieve blocks from the blockchain by wallet address.  
```
curl "http://localhost:8000/stars/address:[ADDRESS]"
curl "http://localhost:8000/stars/address:142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
```
**Respone Example**
```
[{"hash":"aa0e9c438560447046f7bf880e4b8bebb08da9d3225e394f010f62359f745043",
  "height":1,
  "body":
  {"address":"142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
   "star":{"dec":"-26° 29' 24.9",
           "ra":"16h 29m 1.0s",
           "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
           "storyDecoded":"Found star using https://www.google.com/sky/"}},
   "time":"1540303898",
   "previousBlockHash":"c9155f7b4bf3c43d31307e7b9862ccd8fc59e63eba66cfce3310931224463730"},
 {"hash":"48fff5d8479f2c22810fdaa9bcf1e7d3473931a4bc8818495ee71cd815d9975c",
  "height":2,
  "body":
  {"address":"142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
   "star":{"dec":"-25° 19' 13.9",
           "ra":"15h 29m 1.0s",
           "story":"4c6f6f6b696e6720696e746f2074686520736b792c204d616a6f7220546f6d21",
           "storyDecoded":"Looking into the sky, Major Tom!"}},
   "time":"1540303952",
   "previousBlockHash":"aa0e9c438560447046f7bf880e4b8bebb08da9d3225e394f010f62359f745043"}]
```
#### Parameter 
| Parameter| Description   | Required |
| :------- | :-------------| :-------:|
| address  | Wallet address. Contains 26 - 35 characters, only numbers and letters (upper and lower cases).    | yes |

#### Error
If no block found the service returns following error message: No entries found for address 142BDC...<br>
If no hash parameter set: 
```
{"statusCode":404,"error":"Not Found","message":"Not Found"}
```
### Search by Star Block Hash

Restful GET method which retrieve a block from the blockchain by block hash.  
```
curl "http://localhost:8000/stars/hash:[HASH]"
curl "http://localhost:8000/stars/hash:5e42cef837e205d7a1420e893d69d89baaa6d2127cbc5507871dbf43d98cf19d"
```
**Respone Example**
```
{"hash":"5e42cef837e205d7a1420e893d69d89baaa6d2127cbc5507871dbf43d98cf19d",
 "height":1,
 "body":
 {"address":"142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star":{"dec":"-26° 29' 24.9",]
  "ra":"16h 29m 1.0s",
  "story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
  "storyDecoded":"Found star using https://www.google.com/sky/"}},
 "time":"1540298682",
 "previousBlockHash":"3594637013c68f333da58ba4308100a88024ac8a0228e2136eac7c5cb8fb5fde"}
```
#### Parameter 
| Parameter| Description   | Required |
| :------- | :-------------| :-------:|
| blockhash  | The hash value for the request. | yes |

#### Error
If the block not found the service returns following error message: Block height for Hash ... not found!  
If no hash parameter set: 
```
{"statusCode":404,"error":"Not Found","message":"Not Found"}
```
### Search by Star Block Height

Restful GET method which retrieve a block from the blockchain by block height.  
```
curl "http://localhost:8000/block/1"
```
**Respone Example**
```
{"hash":"5e42cef837e205d7a1420e893d69d89baaa6d2127cbc5507871dbf43d98cf19d",
 "height":1,
 "body":
 {"address":"1Rb9dFx4jVmjmyZrHCGiBStBGH4eesMXw",
  "star":{"dec":"-26° 29' 24.9",
  "ra":"16h 29m 1.0s",
  "story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
  "storyDecoded":"Found star using https://www.google.com/sky/"}},
 "time":"1540298682",
 "previousBlockHash":"3594637013c68f333da58ba4308100a88024ac8a0228e2136eac7c5cb8fb5fde"}
```
#### Parameter 
| Parameter| Description   | Required |
| :------- | :-------------| :-------:|
| blockheight  | The number of the blockheight for the request. If no Parameter set, the service retrieves the Genesis block (0).| yes |

#### Error
If the block not found the service returns following error message: Block xxx not found!

## HapiJS Framework Decision

HapiJS is a rich framework for building applications and services. The advantages are the framework covers a lot of work compare to express. HapiJS is plug able and for these purposes more lightweight than sails. As a disadvantage HapiJS as a smaller user base than express and sails.

## Built with

* [NodeJs](https://nodejs.org) - As an asynchronous event driven JavaScript runtime.
* [HapiJs](https://hapijs.com/) - A rich framework for building applications and services.

## Authors

* **Stefan Zils** - *Initial work* - [Bitbucket Repository](https://bitbucket.org/basteStefan/udacity-projects/src/master/star-blockchain/)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thank's to Udactiy Blockchain programm.
