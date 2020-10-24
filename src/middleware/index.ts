import { Middleware as KoaMiddleware} from 'koa';
import {Responses, JwtFunctionResponse, ModifiedContext} from './../types/';
import JWT from './../lib/jwt';
import {Pagination} from "../common/pagination";

/**
 * @param secret - The JWT Secret
 * @returns Returns a function for Koa middleware injection
*/
type JwtFunction           = (secret: string) => JwtFunctionResponse;
type AuthorizationFunction = (ctx: ModifiedContext) => string|null;

class Middleware {
  private static resolveAuthorizationHeader:AuthorizationFunction = (ctx: ModifiedContext) => {
    if (!ctx.header || !ctx.header.authorization) {
      return;
    }

    const PARTS = ctx.header.authorization.split(' ');

    if (PARTS.length === 2) {
      const SCHEME:string      = PARTS[0];
      const CREDENTIALS:string = PARTS[1];

      if (/^Bearer$/i.test(SCHEME)) {
        return CREDENTIALS;
      }
    }

    return null;
  };

  public static jwt:JwtFunction = (secret) => {
    const Jwt = new JWT({secret});

    class JwtClass {
      public static middleware = async (ctx: ModifiedContext, next: Function) => {
        ctx.jwt = Jwt;
        return await next();
      };

      public static authenticate = async (ctx: ModifiedContext, next: Function) => {
        const token = Middleware.resolveAuthorizationHeader(ctx);

        if (token !== null) {
          const decodedToken:{id: string}|null = await Jwt.verify(token).catch( () => null);
          if (decodedToken) {
            ctx.state.user = decodedToken;
            return await next();
          } else {
            return ctx.answer(401, Responses.INVALID_CREDS);
          }
        } else {
          return ctx.answer(401, Responses.INVALID_CREDS);
        }
      }
    }

    return JwtClass;
  };

  public static answer:KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
    /**
     * @param status - The http code
     * @param body - An Object or string input depending on the http code
     * @param pagination - Le nombre total d'element dans la collection
     */
    ctx.answer = (status: number, body: object|string, pagination?: Pagination) => {
      ctx.status        = status;
      let error:boolean = false;

      if (status >= 299 || status < 200) {
        error = true;
      }

      if (error === true) {
        ctx.body = {
          code: ctx.status,
          error: (Array.isArray(body)) ? body : {message: body}
        };
      } else {
        ctx.body = {
          code: ctx.status,
          data: (typeof body === 'object') ? body : (Array.isArray(body)) ? body : {message: body}
        };
        if (pagination)  ctx.body.pagination = pagination;
      }

      return ctx;
    };

    await next();
  };

  public static onError:KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
    try {
      await next();
    } catch (err) {
      console.error(err.stack || err);
      ctx.answer(500, Responses.INTERNAL_ERROR);
    }
  };
}

export default Middleware;
