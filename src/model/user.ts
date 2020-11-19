import BCRYPT from 'bcrypt';
import MONGOOSE from 'mongoose';
import {ProfileType} from "./profile";
import {EntityBase} from "./entity-base";

type comparePasswordFunction = (candidatePassword: string) => Promise<boolean>;
type toNormalizationFunction = () => UserType;

export enum UserState {
  ACTIVE = 'ACTIVE',
  DESACTIVE = 'DESACTIVE',
  BLOQUE = 'BLOQUE',
}

export type UserDocument = MONGOOSE.Document & EntityBase & {
  email: string,
  name: string,
  password: string,
  userName: string,
  status: UserState,
  activatedDate: Date,
  deactivatedDate: Date,
  testAuthNumber: number;
  blockedDate: Date,
  profile: ProfileType,
  comparePassword: comparePasswordFunction,
  toNormalization: toNormalizationFunction
};

export type UserType = EntityBase & {
  email: string | null,
  name: string | null,
  userName: string| null,
  profile: ProfileType| null,
  status: UserState | null,
  activatedDate: Date | null;
  deactivatedDate?: Date | null;
  blockedDate?: Date | null;
  testAuthNumber?: number | null;
};

const userSchema = new MONGOOSE.Schema({
  email: { type: String, unique: true },
  userName: { type: String, unique: true },
  name: { type: String, default: '' },
  testAuthNumber: { type: Number, default: 0 },
  status: { type: String, default: UserState.DESACTIVE },
  activatedDate: { type: Date },
  deactivatedDate: { type: Date },
  blockedDate: { type: Date },
  password: String,
  profile:  {
    id: { type: String, default: ''},
    name: { type: String, default: ''},
    description: { type: String, default: '' }
  }
}, { timestamps: true });

userSchema.pre('save', function save(next: Function) {
  const ctx = this;

  if (!this.isModified('password')) { return next(); }

  BCRYPT.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    BCRYPT.hash(this.get('password'), salt, (err: MONGOOSE.Error, hash: string) => {
      if (err) { return next(err); }
      ctx.set('password', hash);
      next();
    });
  });
});

/**
 * @remarks
 * Compare the bcrypted password
 *
 * @param candidatePassword - The string to bcrypt and compare to the real password
 */
const comparePassword: comparePasswordFunction = function (candidatePassword: string) {
  const ctx = this;
  return new Promise ((resolve, reject) => {
    BCRYPT.compare(candidatePassword, ctx.get('password'), (err: MONGOOSE.Error, isMatch: boolean) => {
      if (err) reject(err);
      else resolve(isMatch);
    });
  });
};

const toNormalization: toNormalizationFunction = function () {
  let _userObject: UserDocument = this.toObject();

  let UserObject: UserType = {
    id: _userObject._id.toString(),
    name: _userObject.name,
    email: _userObject.email,
    profile: _userObject.profile,
    userName: _userObject.userName,
    createdAt: _userObject.createdAt,
    updatedAt: _userObject.updatedAt,
    createdBy: _userObject.createdBy,
    activatedDate: _userObject.activatedDate,
    deactivatedDate: _userObject.deactivatedDate,
    blockedDate: _userObject.blockedDate,
    status: _userObject.status,
    testAuthNumber: _userObject.testAuthNumber,
  };

  return UserObject;
};

userSchema.methods.comparePassword = comparePassword;
userSchema.methods.toNormalization = toNormalization;

const User = MONGOOSE.model<UserDocument>('User', userSchema);

export default User;
