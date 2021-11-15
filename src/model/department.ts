import MONGOOSE from 'mongoose';
import {EntityBase} from "./entity-base";
import {RegionType} from "./region";

type toNormalizationFunction = () => DepartmentType;

export type DepartmentDocument = MONGOOSE.Document & EntityBase & {
    name?: string,
    region?: RegionType,
    toNormalization: toNormalizationFunction
};

export type DepartmentType = EntityBase & {
    name?: string | null,
    region?: RegionType | null,
};


const departmentSchema = new MONGOOSE.Schema({
    name: {type: String, unique: false},
    region: {type: Object, unique: false},
}, {timestamps: true});

const toNormalization: toNormalizationFunction = function () {
    let _departmentObject: DepartmentDocument = this.toObject();

    let DepartmentObject: DepartmentType = {
        id: _departmentObject._id.toString(),
        name: _departmentObject.name,
        region: _departmentObject.region,
        createdAt: _departmentObject.createdAt,
        updatedAt: _departmentObject.updatedAt,
        createdBy: _departmentObject.createdBy,
    };

    return DepartmentObject;
};

departmentSchema.methods.toNormalization = toNormalization;

const Department = MONGOOSE.model<DepartmentDocument>('Department', departmentSchema);

export default Department;


