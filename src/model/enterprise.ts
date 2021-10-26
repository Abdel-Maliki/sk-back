import MONGOOSE from 'mongoose';
import {EntityBase} from "./entity-base";

type toNormalizationFunction = () => EnterpriseType;

export type EnterpriseDocument = MONGOOSE.Document & EntityBase & {
  name: string,
  tel: string,
  description: string,
  address: string,
  email: string,
  toNormalization: toNormalizationFunction
};

export type EnterpriseType = EntityBase & {
  name: string | null,
  tel: string | null,
  description: string | null,
  address: string | null,
  email: string | null,
};

const enterpriseSchema = new MONGOOSE.Schema({
  name: { type: String, unique: true },
  tel: { type: String, unique: true },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  email: { type: String, default: '' },
}, { timestamps: true });

const toNormalization: toNormalizationFunction = function () {
  let _enterpriseObject: EnterpriseDocument = this.toObject();

  let EnterpriseObject: EnterpriseType = {
    id: _enterpriseObject._id.toString(),
    name: _enterpriseObject.name,
    tel: _enterpriseObject.tel,
    description: _enterpriseObject.description,
    address: _enterpriseObject.address,
    email: _enterpriseObject.email,
    createdAt: _enterpriseObject.createdAt,
    updatedAt: _enterpriseObject.updatedAt,
    createdBy: _enterpriseObject.createdBy,
  };

  return EnterpriseObject;
};

enterpriseSchema.methods.toNormalization = toNormalization;

const Enterprise = MONGOOSE.model<EnterpriseDocument>('Enterprise', enterpriseSchema);

export default Enterprise;
