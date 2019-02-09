const level = require('level');
const vm = require('./ValidationModel');
const registrationDB = './validation';
const msg = require('./messages');
const boom = require('boom');
const db = level(registrationDB);
const messageUtil = msg.messageUtilFactory();

const ERR_TIME_EXPIRED = "FAILED time has expired! Please start a new request.";

class AddressExist {
    constructor() {
        this.hasEntry = false;
        this.validationModel = null;
    }
}

function getAddressDB(address) {
    return new Promise(function (resolve, reject) {
        db.get(address, function (err, value) {
            if (err) {
                const notFoundErr = 'Address ' + address + ' not found!';
                console.log(notFoundErr, err);
                reject(boom.notFound(notFoundErr));
            } else {
                resolve(value);
            }
        });
    });
}

function updateAddressDB(address, validationModel) {
    return new Promise((resolve, reject) => {
        const jsonValidationModel = JSON.stringify(validationModel);
        db.put(address, jsonValidationModel, function (err) {
            if (err) {
                const message = 'WalletAddress ' + address + ' put failed';
                console.log(message, err);
                const boomErr = new boom.Boom(message, err);
                reject(boomErr);
            } else {
                console.log("WalletAddress " + jsonValidationModel + " added.");
                resolve(jsonValidationModel);
            }
        });
    });
}

function delAddress(address) {
    return new Promise(function (resolve, reject) {
        db.del(address, function (err, value) {
            if (err) {
                const notFoundErr = 'Address ' + address + ' not deleted!';
                console.log(notFoundErr, err);
                reject(boom.notFound(notFoundErr));
            } else {
                console.log("delAddress " + address);
                resolve(true);
            }
        });
    });
}

class Validation {

    addAddress(address) {
        return new Promise((resolve, reject) => {
            const validationModel = vm.validationFactory(address);
            const jsonValidationModel = JSON.stringify(validationModel);
            db.put(address, jsonValidationModel, function (err) {
                if (err) {
                    const message = 'WalletAddress ' + address + ' put failed';
                    console.log(message, err);
                    const boomErr = new boom.Boom(message, err);
                    reject(boomErr);
                } else {
                    console.log("WalletAddress " + jsonValidationModel + " added.");
                    resolve(validationModel);
                }
            });
        });
    }

    existAddress(address) {

        return new Promise(function (resolve) {

            getAddressDB(address).then((jsonValidationModel) => {
                let validationModel = vm.buildValidation(jsonValidationModel);
                if (validationModel.hasAccess()) {
                    let addressExist = new AddressExist();
                    addressExist.hasEntry = true;
                    addressExist.validationModel = validationModel;
                    resolve(addressExist);
                } else {
                    delAddress(address).then((del) => {
                        resolve(new AddressExist());
                    });
                }
            }).catch((err) => {
                resolve(new AddressExist());
            });

        });
    }

    validateRequest(address) {

        return new Promise((resolve, reject) => {
            this.existAddress(address).then((addressExit) => {
                if (addressExit.hasEntry) {
                    resolve(addressExit.validationModel.validationResponse);
                } else {
                    this.addAddress(address).then((validationModel) => {
                        resolve(validationModel.validationResponse);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            })
            ;
        });

    }

    removeAddress(address) {
        return new Promise((resolve) => {
            delAddress(address).then((value) => {
                resolve(value);
            }).catch((err) => {throw err});
        });
    }


    signatureMessage(address, signature) {

        return new Promise(function (resolve, reject) {
            console.log("sig 1");

            getAddressDB(address).then((value) => {
                console.log("sig 2");
                let validationModel = vm.buildValidation(value);
                if (validationModel.hasAccess()) {
                    let signatureResponse = vm.buildSignatureResponse(validationModel);
                    if (messageUtil.verify(address, signature, validationModel.validationResponse.message)) {
                        // FALIED is default
                        signatureResponse.setMessageSignatureValid();
                        validationModel.messageVerify = true;
                        updateAddressDB(address, validationModel).then((value) => {
                            console.log("Address updated: " + value);
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                    resolve(signatureResponse);
                } else {
                    delAddress(address).then((del) => {
                        resolve(boom.clientTimeout(ERR_TIME_EXPIRED));
                    }).catch((err)=>{throw err});
                }
            }).catch((err) => {
                console.log(err);
                reject(boom.unauthorized(err.toString()));
            })

        });
    }

}

module.exports.validationFactory = function validationFactory() {
    return new Validation();
}

