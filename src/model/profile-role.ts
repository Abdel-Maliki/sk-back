import MONGOOSE from 'mongoose';

type toNormalizationFunction = () => ProfileRoleType;

export type ProfileRoleDocument = MONGOOSE.Document & {
  role: {
    name: string,
    description: string
  },
  profile: {
    id: string,
    name: string,
    description: string
  },
  toNormalization: toNormalizationFunction
};

export type ProfileRoleType = {
  id: string | null,
  role: {
    name: string | null,
    description: string | null
  },
  profile: {
    id: string,
    name: string | null,
    description: string | null
  }
};

const profileRoleSchema = new MONGOOSE.Schema({
  role: {
    name: { type: String },
    description: { type: String }
  },
  profile: {
    id: { type: String },
    name: { type: String },
    description: { type: String }
  },
}, { timestamps: true });

const toNormalization: toNormalizationFunction = function () {
  let _profileRoleObject: ProfileRoleDocument = this.toObject();

  let ProfileRoleObject: ProfileRoleType = {
    id: _profileRoleObject._id.toString(),
    role: _profileRoleObject.role,
    profile: _profileRoleObject.profile
  };

  return ProfileRoleObject;
};

profileRoleSchema.methods.toNormalization = toNormalization;

const ProfileRole = MONGOOSE.model<ProfileRoleDocument>('ProfileRole', profileRoleSchema);

export default ProfileRole;
