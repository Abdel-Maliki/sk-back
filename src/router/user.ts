import {Joi as JOI, Spec } from 'koa-joi-router';
import HELPER from './helper';
import USER_CONTROLLER from '../controller/user';
import {SchemaMap} from "joi";
import {ModifiedContext} from "index";
import ProfileModel, {ProfileDocument} from "../model/profile";


class UserRouter {

  public static FIRST_NAME_VALIDATION = JOI.string().alphanum().max(HELPER.defaults.length).label("le nom").required();
  public static LAST_NAME_VALIDATION = JOI.string().alphanum().max(HELPER.defaults.length).label("le prenom").required();
  public static EMAIL_NAME_VALIDATION = JOI.string().lowercase().email().required();
  public static PASSWORD_NAME_VALIDATION = JOI.string().min(2).max(HELPER.defaults.length).label("le mot de passe").required();
  public static USERNAME_VALIDATION = JOI.string().min(2).max(HELPER.defaults.length).label("le nom d'utilisateur").required();
  public static PROFILE_VALIDATION = JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)});

  public static readonly userOutput: SchemaMap = {
    id: JOI.string(),
    email: JOI.string(),
    firstName: JOI.string(),
    lastName: JOI.string(),
    userName: JOI.string(),
    profile: JOI.object({
      id: JOI.string().required(),
      name: JOI.string().required(),
      description: JOI.string().required(),
    })
  };

  public static create:Spec = ({
    method: HELPER.methods.POST,
    path: '/user',
    validate: {
      continueOnError: true,
      type: HELPER.contentType.JSON,
      body: JOI.object({
        firstName: UserRouter.FIRST_NAME_VALIDATION,
        lastName: UserRouter.LAST_NAME_VALIDATION,
        email: UserRouter.EMAIL_NAME_VALIDATION,
        password: UserRouter.PASSWORD_NAME_VALIDATION,
        userName:UserRouter.USERNAME_VALIDATION,
        profile: UserRouter.PROFILE_VALIDATION,
      }).options({stripUnknown: true}),
      output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
    },
    handler: [HELPER.validation, UserRouter.addProfile, USER_CONTROLLER.create]
  });

  public static update:Spec = ({
    method: HELPER.methods.PUT,
    path: '/user/:id',
    validate: {
      continueOnError: true,
      type: HELPER.contentType.JSON,
      params: JOI.object({
        id: JOI.string().regex(HELPER.mongoObjectRegEx)
      }),
      body: JOI.object({
        firstName: UserRouter.FIRST_NAME_VALIDATION,
        lastName: UserRouter.LAST_NAME_VALIDATION,
        profile: UserRouter.PROFILE_VALIDATION,
      }).options({stripUnknown: true}),
      output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
    },
    handler: [HELPER.validation, USER_CONTROLLER.update]
  });

  private static async addProfile(ctx: ModifiedContext, next: Function) {
      const profile: ProfileDocument|null = await ProfileModel.findById(ctx.request.body.profile.id);
    if (profile) {
      ctx.request.body.profile = profile.toNormalization();
      await next();
    } else {
      ctx.answer(400, "Le profile n'existe pas");
    }
  }

  public static read:Spec = ({
    method: HELPER.methods.GET,
    path: '/user/:id',
    validate: {
      continueOnError: true,
      params: JOI.object({
        id: JOI.string().regex(HELPER.mongoObjectRegEx)
      }),
      output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
    },
    handler: [HELPER.validation, USER_CONTROLLER.read]
  });
}

export default UserRouter;
