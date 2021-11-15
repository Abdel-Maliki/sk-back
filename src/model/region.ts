import MONGOOSE from 'mongoose';
import {EntityBase} from "./entity-base";

type toNormalizationFunction = () => RegionType;

export type RegionDocument = MONGOOSE.Document & EntityBase & {
    name?: string,
    toNormalization: toNormalizationFunction
};

export type RegionType = EntityBase & {
    name?: string | null,
};


const regionSchema = new MONGOOSE.Schema({
    name: {type: String, unique: false},
}, {timestamps: true});

const toNormalization: toNormalizationFunction = function () {
    let _regionObject: RegionDocument = this.toObject();

    let RegionObject: RegionType = {
        id: _regionObject._id.toString(),
        name: _regionObject.name,
        createdAt: _regionObject.createdAt,
        updatedAt: _regionObject.updatedAt,
        createdBy: _regionObject.createdBy,
    };

    return RegionObject;
};

regionSchema.methods.toNormalization = toNormalization;

const Region = MONGOOSE.model<RegionDocument>('Region', regionSchema);

export default Region;


