import MONGOOSE from 'mongoose';
import {EntityBase} from "./entity-base";
import {RegionType} from "./region";

type toNormalizationFunction = () => ResourceType;

export type ResourceDocument = MONGOOSE.Document & EntityBase & {
    name?: string,
    ethnicity?: string,
    age?: number,
    sex?: 'M' | 'F',
    region?: RegionType,
    toNormalization: toNormalizationFunction
};

export type ResourceType = EntityBase & {
    name?: string | null,
    region?: RegionType | null,
    ethnicity?: string | null,
    age?: number | null,
    sex?: 'M' | 'F' | null,
};


const resourceSchema = new MONGOOSE.Schema({
    name: {type: String, unique: false},
    region: {type: Object, unique: false},
    ethnicity: {type: String, unique: false},
    age: {type: Number, unique: false},
    sex: {type: String, unique: false},
}, {timestamps: true});

const toNormalization: toNormalizationFunction = function () {
    let _resourceObject: ResourceDocument = this.toObject();

    let ResourceObject: ResourceType = {
        id: _resourceObject._id.toString(),
        name: _resourceObject.name,
        region: _resourceObject.region,
        ethnicity: _resourceObject.ethnicity,
        sex: _resourceObject.sex,
        age: _resourceObject.age,
        createdAt: _resourceObject.createdAt,
        updatedAt: _resourceObject.updatedAt,
        createdBy: _resourceObject.createdBy,
    };

    return ResourceObject;
};

resourceSchema.methods.toNormalization = toNormalization;

const Resource = MONGOOSE.model<ResourceDocument>('Resource', resourceSchema);

export default Resource;


