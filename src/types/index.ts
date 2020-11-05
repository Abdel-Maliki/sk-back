import { Middleware as KoaMiddleware, Context} from 'koa';
import JWT from './../lib/jwt';
import {Pagination} from "../common/pagination";

/**
 * @remarks
 * This method is part of the Server Config.
 *
 * @param port - A Port to run the server on
 * @param mongo_uri - The mongo uri mongo://127.0.0.1:27017/test
 * @param jwt_secret - The secret JWT uses to create a signature for the payload
*/
type ConfigServerType    = { port: number, mongo_uri: string, jwt_secret: string };

/**
 * @remarks
 * This method is part of the JWT Config.
 *
 * @param secret - The secret JWT uses to create a signature for the payload
*/
type ConfigJwtType       = { secret: string };

/**
 * @param middleware - A Koa Middleware thar injects JWT into Koa Context
 * @param authenticate - A Koa Middleware that checks if a jwt header is valid and allows the next middleware if so
*/
type JwtFunctionResponse = { middleware: KoaMiddleware, authenticate: KoaMiddleware };

type UserStateType       = { id: string , profile: string};

type MessageError = {
    message: string,
    path: [string],
    type: string, context: {  limit: number, value: any,  key: string, label: string
  }
}

/**
 * @remarks
 * Extends ctx.state.user type to the base context
*/
type ConfigStateType     = {
  user: UserStateType|null
};

/**
 * @remarks
 * Response options
*/
enum Responses {
  NOT_FOUND            = 'Not Found',
  CANT_CREATE_USER     = 'Impossible de créer l\'utilisateur',
  CANT_UPDATE_USER     = 'Impossible de mettre à jour l\'utilisateur',
  NO_ACCESS_USER       = 'Vous n\'avez pas accès à cet utilisateur',
  INTERNAL_ERROR       = 'Une erreur inconnue est survenue',
  SOMETHING_WENT_WRONG = 'Un problème est survenu',
  INVALID_CREDS        = 'Les informations d\'identification sont invalides'
}

/**
 * @remarks
 * Extends the base context with KWT, Respond and State
*/
interface ModifiedContext extends Context {
  jwt?: JWT;
  invalid?: any;
  answer?: (status: number, body: any, pagination?: Pagination) => ModifiedContext;
  pagination?: Pagination;
  state: ConfigStateType;
}


export {
  ConfigServerType,
  ConfigJwtType,
  Responses,
  JwtFunctionResponse,
  ModifiedContext,
  MessageError
};
