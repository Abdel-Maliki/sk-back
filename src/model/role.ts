import MONGOOSE from 'mongoose';

type toNormalizationFunction = () => RoleType;

export type RoleDocument = MONGOOSE.Document & {
  name: string,
  description: string,
  toNormalization: toNormalizationFunction
};

export type RoleType = {
  id: string | null,
  name: string | null,
};

const roleSchema = new MONGOOSE.Schema({
  name: { type: String, unique: true },
}, { timestamps: true });

const toNormalization: toNormalizationFunction = function () {
  let _roleObject: RoleDocument = this.toObject();

  let RoleObject: RoleType = {
    id: _roleObject._id.toString(),
    name: _roleObject.name,
  };

  return RoleObject;
};

roleSchema.methods.toNormalization = toNormalization;

const Role = MONGOOSE.model<RoleDocument>('Role', roleSchema);

export default Role;
