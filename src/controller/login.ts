import { Responses, ModifiedContext } from './../types';

import UserModel, {UserDocument, UserType} from './../model/user';

/**
 *
 * @param email - A valid email that has already been validated by JOI
 * @param password - Password input that has been already validated by JOI
*/
type InputBodyType = {email: string, password: string};

class Login {
  public static create = async (ctx: ModifiedContext): Promise<ModifiedContext> => {
    const {
      email, password
    } = <InputBodyType>ctx.request.body;

    const user:UserDocument|null = await UserModel.findOne({email: email});

    if (user) {
      const isMatched = await user.comparePassword(password).catch(err => null);
      if (isMatched === true) {
        const {id}         = <UserType>user.toNormalization();
        const token:string = await ctx.jwt.sign(user.toNormalization());
        return ctx.answer(200, { token, user: user.toNormalization() });
      } else {
        return ctx.answer(401, Responses.INVALID_CREDS);
      }
    } else {
      return ctx.answer(401, Responses.INVALID_CREDS);
    }
  };
};

export default Login;
