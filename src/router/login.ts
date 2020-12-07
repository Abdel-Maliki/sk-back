import {Joi as JOI, Spec } from 'koa-joi-router';

import ROUTER_HELPER from './router-helper';
import LOGIN_CONTROLLER from '../controller/login';
import LogConstante from "../constante/log-constante";
import LOG_CONSTANTE from "../constante/log-constante";

class LoginRouter {
  public static create:Spec = ({
    method: ROUTER_HELPER.methods.POST,
    path: '/login',
    validate: {
      continueOnError: true,
      type: ROUTER_HELPER.contentType.JSON,
      body: JOI.object({
        email: JOI.string().required(),
        password: JOI.string().max(ROUTER_HELPER.defaults.length).required()
      }).options({stripUnknown: true}),
      output: ROUTER_HELPER.defaultOutput(JOI.object({
        token: JOI.string()
      }))
    },
    handler: [ROUTER_HELPER.validation, LOGIN_CONTROLLER.create]
  });

  public static routes(): {data: {spec: Spec, log: LogConstante}[], prefix: string}  {
    return {
      prefix: '',
      data: [
        { spec: LoginRouter.create, log: LOG_CONSTANTE.LOGIN},
      ]
    }
  }
}

export default LoginRouter;
