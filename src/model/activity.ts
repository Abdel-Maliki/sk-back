import MONGOOSE from 'mongoose';
import {EntityBase} from "./entity-base";
import {ResourceType} from "./resource";
import {RegionType} from "./region";
import {DepartmentType} from "./department";
import {MunicipalityType} from "./municipality";
import {NeighborhoodType} from "./neighborhood";
import {BeneficiaryType} from "./beneficiary";

type toNormalizationFunction = () => ActivityType;

export type ActivityDocument = MONGOOSE.Document & EntityBase & {
    beneficiaries?: BeneficiaryType [],
    resources: ResourceType [],
    beginDate?: Date,
    endDate?: Date,
    name?: string,
    region?: RegionType,
    department?: DepartmentType,
    municipality?: MunicipalityType,
    neighborhood?: NeighborhoodType,
    toNormalization: toNormalizationFunction
};

export type ActivityType = EntityBase & {
    beneficiaries?: BeneficiaryType [],
    resources?: ResourceType [],
    beginDate?: Date,
    endDate?: Date,
    name?: string,
    region?: RegionType,
    department?: DepartmentType,
    municipality?: MunicipalityType,
    neighborhood?: NeighborhoodType,
};


const activitySchema = new MONGOOSE.Schema({
    beneficiaries: {type: Array, unique: false},
    resources: {type: Array, unique: false},
    beginDate: {type: Date, unique: false},
    endDate: {type: Date, unique: false},
    name: {type: String, unique: false},
    region: {type: Object, unique: false},
    department: {type: Object, unique: false},
    municipality: {type: Object, unique: false},
    neighborhood: {type: Object, unique: false},
}, {timestamps: true});

const toNormalization: toNormalizationFunction = function () {
    let _activityObject: ActivityDocument = this.toObject();

    let ActivityObject: ActivityType = {
        id: _activityObject._id.toString(),
        name: _activityObject.name,
        beneficiaries: _activityObject.beneficiaries,
        resources: _activityObject.resources,
        beginDate: _activityObject.beginDate,
        endDate: _activityObject.endDate,
        region: _activityObject.region,
        department: _activityObject.department,
        municipality: _activityObject.municipality,
        neighborhood: _activityObject.neighborhood,
        createdAt: _activityObject.createdAt,
        updatedAt: _activityObject.updatedAt,
        createdBy: _activityObject.createdBy,
    };

    return ActivityObject;
};

activitySchema.methods.toNormalization = toNormalization;

const Activity = MONGOOSE.model<ActivityDocument>('Activity', activitySchema);

export default Activity;

