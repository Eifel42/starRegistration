const INIT_VALIDATION_WINDOW = 300; // SECONDS
const INIT_VALID = "valid";
const INIT_FALID = "fail";
const FACTOR_MS = 1000;
const FIX_STAR_SIG = "starRegistry";
const DELIMIT = ":";

class ValidationResponse {
    constructor(address) {
        this.address = address;
        this.requestTimeStamp = new Date().getTime();
        this.message = this.address + DELIMIT + this.requestTimeStamp + DELIMIT + FIX_STAR_SIG;
        this.validationWindow = INIT_VALIDATION_WINDOW;
    }
}

class ValidationModel {
    constructor(validationResponse) {
        this.validationResponse = validationResponse;
        this.expireTime = this.validationResponse.requestTimeStamp
            + (this.validationResponse.validationWindow * FACTOR_MS);
        this.messageVerify=false;
    }


    hasAccess() {
        const now =  new Date().getTime();
        return (this.expireTime >= now);
    }

}

class SignatureResponse {
    constructor(validationResponse) {
        this.registerStar = true;
        this.status = validationResponse;
        this.status.messageSignature = INIT_FALID;
    }

    setMessageSignatureValid() {
         this.status.messageSignature = INIT_VALID;
    }

}

module.exports.validationFactory = function validationFactory(address) {
    let validationResponse = new ValidationResponse(address);
    let validationModel = new ValidationModel(validationResponse);
    return validationModel;
}

module.exports.buildValidation = function buildValidation(jsonValidationModel) {
    // Parse don't init methods.
    let parseModel = JSON.parse(jsonValidationModel);
    let validationModel = new ValidationModel(parseModel.validationResponse);
    validationModel.messageVerify = parseModel.messageVerify;
    validationModel.expireTime = parseModel.expireTime;
    validationModel.validationResponse.validationWindow = Math.round((validationModel.expireTime
        - new Date().getTime()) / FACTOR_MS);
    return validationModel;
}

module.exports.buildSignatureResponse = function buildSignatureResponse(validationModel) {
      return new SignatureResponse(validationModel.validationResponse);
}