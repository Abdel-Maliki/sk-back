import { Responses, ModifiedContext } from './../types';

import UserModel, {UserDocument, UserType} from './../model/user';

/**
 * @param firstName - A valid string that has already been validated by JOI
 * @param lastName - A valid string that has already been validated by JOI
 * @param password - A valid string that has already been validated by JOI
 * @param email - A valid email that has already been validated by JOI
*/
type InputCreateBodyType = {firstName: string, lastName: string, password: string, email: boolean};


/**
 * @param firstName - A valid string that has already been validated by JOI
 * @param lastName - A valid string that has already been validated by JOI
*/
type InputUpdateBodyType = {firstName: string, lastName: string};

class UserController {
  public static create = async (ctx: ModifiedContext) => {
    //const body:InputCreateBodyType      = ctx.request.body;
    console.log('Class: UserController, Function: create, Line 23 , ctx.request.body: '
    , ctx.request.body);
    const createUser:UserDocument|null  = await UserModel.create(ctx.request.body).catch( err => {
      console.log('Class: UserController, Function: , Line 24 , err: '
      , err);
      return null;
    });

    if (createUser) {
      let response:UserType = createUser.toNormalization();
      return ctx.answer(201, response);
    } else {
      return ctx.answer(400, Responses.CANT_CREATE_USER);
    }
  };

  public static read = async (ctx: ModifiedContext) => {
    if (!ctx.state.user || ctx.params.id !== ctx.state.user.id) return ctx.answer(403, Responses.NO_ACCESS_USER);

    const user:UserDocument|null = await UserModel.findById(ctx.state.user.id);

    if (user) {
      let response:UserType = user.toNormalization();
      return ctx.answer(200, response);
    } else {
      return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
    }
  };

  public static update = async (ctx: ModifiedContext) => {
    if (!ctx.state.user || ctx.params.id !== ctx.state.user.id) return ctx.answer(403, Responses.NO_ACCESS_USER);

    const body:InputUpdateBodyType      = ctx.request.body;
    const updateUser:UserDocument|null  = await UserModel.findByIdAndUpdate(ctx.state.user.id, {$set: body}, {new: true}).exec().catch( err => null);

    if (updateUser) {
      let response:UserType = updateUser.toNormalization();
      return ctx.answer(200, response);
    } else {
      return ctx.answer(400, Responses.CANT_UPDATE_USER);
    }
  };
}

export default UserController;
