import MONGOOSE from 'mongoose';
import {EntityBase} from "./entity-base";
import {MunicipalityType} from "./municipality";

type toNormalizationFunction = () => NeighborhoodType;

export type NeighborhoodDocument = MONGOOSE.Document & EntityBase & {
    name?: string,
    municipality?: MunicipalityType,
    toNormalization: toNormalizationFunction
};

export type NeighborhoodType = EntityBase & {
    name?: string | null,
    municipality?: MunicipalityType | null,
};


const neighborhoodSchema = new MONGOOSE.Schema({
    name: {type: String, unique: false},
    municipality: {type: Object, unique: false},
}, {timestamps: true});

const toNormalization: toNormalizationFunction = function () {
    let _neighborhoodObject: NeighborhoodDocument = this.toObject();

    let NeighborhoodObject: NeighborhoodType = {
        id: _neighborhoodObject._id.toString(),
        name: _neighborhoodObject.name,
        municipality: _neighborhoodObject.municipality,
        createdAt: _neighborhoodObject.createdAt,
        updatedAt: _neighborhoodObject.updatedAt,
        createdBy: _neighborhoodObject.createdBy,
    };

    return NeighborhoodObject;
};

neighborhoodSchema.methods.toNormalization = toNormalization;

const Neighborhood = MONGOOSE.model<NeighborhoodDocument>('Neighborhood', neighborhoodSchema);

export default Neighborhood;


