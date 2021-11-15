import MONGOOSE from 'mongoose';
import {EntityBase} from "./entity-base";
import {DepartmentType} from "./department";

type toNormalizationFunction = () => MunicipalityType;

export type MunicipalityDocument = MONGOOSE.Document & EntityBase & {
    name?: string,
    department?: DepartmentType,
    toNormalization: toNormalizationFunction
};

export type MunicipalityType = EntityBase & {
    name?: string | null,
    department?: DepartmentType | null,
};


const municipalitySchema = new MONGOOSE.Schema({
    name: {type: String, unique: false},
    department: {type: Object, unique: false},
}, {timestamps: true});

const toNormalization: toNormalizationFunction = function () {
    let _municipalityObject: MunicipalityDocument = this.toObject();

    let MunicipalityObject: MunicipalityType = {
        id: _municipalityObject._id.toString(),
        name: _municipalityObject.name,
        department: _municipalityObject.department,
        createdAt: _municipalityObject.createdAt,
        updatedAt: _municipalityObject.updatedAt,
        createdBy: _municipalityObject.createdBy,
    };

    return MunicipalityObject;
};

municipalitySchema.methods.toNormalization = toNormalization;

const Municipality = MONGOOSE.model<MunicipalityDocument>('Municipality', municipalitySchema);

export default Municipality;


