import MONGOOSE from 'mongoose';
import {EntityBase} from "./entity-base";

type toNormalizationFunction = () => ProfileType;

export type ProfileDocument = MONGOOSE.Document & EntityBase & {
  name: string,
  description: string,
  toNormalization: toNormalizationFunction
};

export type ProfileType = EntityBase & {
  id: string | null,
  name: string | null,
  description: string | null,
};

const profileSchema = new MONGOOSE.Schema({
  name: { type: String, unique: true },
  description: { type: String, default: '' },
}, { timestamps: true });

const toNormalization: toNormalizationFunction = function () {
  let _profileObject: ProfileDocument = this.toObject();

  let ProfileObject: ProfileType = {
    id: _profileObject._id.toString(),
    name: _profileObject.name,
    description: _profileObject.description,
    createdAt: _profileObject.createdAt,
    updatedAt: _profileObject.updatedAt,
    createdBy: _profileObject.createdBy,
  };

  return ProfileObject;
};

profileSchema.methods.toNormalization = toNormalization;

const Profile = MONGOOSE.model<ProfileDocument>('Profile', profileSchema);

export default Profile;
