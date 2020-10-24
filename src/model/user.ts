import BCRYPT from 'bcrypt';
import MONGOOSE from 'mongoose';
import {ProfileType} from "./profile";

type comparePasswordFunction = (candidatePassword: string) => Promise<boolean>;
type toNormalizationFunction = () => UserType;

export type UserDocument = MONGOOSE.Document & {
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  userName: string,
  profile: ProfileType,
  comparePassword: comparePasswordFunction,
  toNormalization: toNormalizationFunction
};

export type UserType = {
  id: string | null,
  email: string | null,
  firstName: string | null,
  lastName: string | null,
  userName: string| null,
  profile: ProfileType| null,
};

const userSchema = new MONGOOSE.Schema({
  email: { type: String, unique: true },
  userName: { type: String, unique: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: ''},
  password: String,
  profile: {
    id: { type: String, default: '', required: true },
    name: { type: String, default: '', required: true },
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
    firstName: _userObject.firstName,
    lastName: _userObject.lastName,
    email: _userObject.email,
    profile: _userObject.profile,
    userName: _userObject.userName
  };

  return UserObject;
};

userSchema.methods.comparePassword = comparePassword;
userSchema.methods.toNormalization = toNormalization;

const User = MONGOOSE.model<UserDocument>('User', userSchema);

export default User;
