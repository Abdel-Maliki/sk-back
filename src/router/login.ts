import {Joi as JOI, Spec } from 'koa-joi-router';

import HELPER from './helper';
import LOGIN_CONTROLLER from '../controller/login';
import UserRouter from "./user";

class LoginRouter {
  public static create:Spec = ({
    method: HELPER.methods.POST,
    path: '/login',
    validate: {
      continueOnError: true,
      type: HELPER.contentType.JSON,
      body: JOI.object({
        email: JOI.string().required(),
        password: JOI.string().max(HELPER.defaults.length).required()
      }).options({stripUnknown: true}),
      output: HELPER.defaultOutput(JOI.object({
        token: JOI.string()
      }), false)
    },
    handler: [HELPER.validation, LOGIN_CONTROLLER.create]
  });
}

export default LoginRouter;
