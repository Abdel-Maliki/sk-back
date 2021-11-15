import MONGOOSE from 'mongoose';
import {EntityBase} from "./entity-base";

type toNormalizationFunction = () => BeneficiaryType;

export type BeneficiaryDocument = MONGOOSE.Document & EntityBase & {
    name?: string,
    age?: number,
    sex: 'M' | 'F',
    status: BeneficiaryStatus,
    educationalLevel: BeneficiaryEducationalLevel,
    handicapped: boolean,
    tel: string,
    toNormalization: toNormalizationFunction
};

export type BeneficiaryType = EntityBase & {
    name?: string | null,
    age?: number | null,
    sex: 'M' | 'F' | null,
    status: BeneficiaryStatus | null,
    educationalLevel: BeneficiaryEducationalLevel | null,
    handicapped: boolean | null,
    tel: string | null,
};


const beneficiarySchema = new MONGOOSE.Schema({
    age: {type: Number, unique: false},
    name: {type: String, unique: false},
    sex: {type: String, unique: false},
    status: {type: String, unique: false},
    educationalLevel: {type: String, unique: false},
    handicapped: {type: Boolean, unique: false, default: false},
    tel: {type: String, unique: false},
}, {timestamps: true});

const toNormalization: toNormalizationFunction = function () {
    let _beneficiaryObject: BeneficiaryDocument = this.toObject();

    let BeneficiaryObject: BeneficiaryType = {
        id: _beneficiaryObject._id.toString(),
        name: _beneficiaryObject.name,
        age: _beneficiaryObject.age,
        sex: _beneficiaryObject.sex,
        status: _beneficiaryObject.status,
        educationalLevel: _beneficiaryObject.educationalLevel,
        handicapped: _beneficiaryObject.handicapped,
        tel: _beneficiaryObject.tel,
        createdAt: _beneficiaryObject.createdAt,
        updatedAt: _beneficiaryObject.updatedAt,
        createdBy: _beneficiaryObject.createdBy,
    };

    return BeneficiaryObject;
};

beneficiarySchema.methods.toNormalization = toNormalization;

const Beneficiary = MONGOOSE.model<BeneficiaryDocument>('Beneficiary', beneficiarySchema);

export default Beneficiary;


export enum BeneficiaryEducationalLevel {
    NOME = 'NONE',
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY',
    SUPERIOR = 'SUPERIOR',
    KORANIC = 'KORANIC',
}

export enum BeneficiaryStatus {
    SINGLE = 'SINGLE',
    MARRIED = 'MARRIED',
    DIVORCED = 'DIVORCED',
    WIDOW = 'WIDOW',
}
