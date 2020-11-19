import {Middleware as KoaMiddleware} from 'koa';
import {JwtFunctionResponse, ModifiedContext, Responses} from './../types/';
import JWT from './../lib/jwt';
import {Pagination} from "../common/pagination";
import UserModel, {UserDocument} from './../model/user';
import ControllerHelpers from "../controller/controller-helpers";
import {DefaultUserCreator} from "../service/default-user-creator";
import {LogState} from "../model/log";
import LoModel from './../model/log';
import FREE_ROUTES from "../constante/free-routes";


/**
 * @param secret - The JWT Secret
 * @returns Returns a function for Koa middleware injection
 */
type JwtFunction = (secret: string) => JwtFunctionResponse;
type AuthorizationFunction = (ctx: ModifiedContext) => string | null;

class Middleware {
    public static jwt: JwtFunction = (secret) => {
        const Jwt = new JWT({secret});

        class JwtClass {
            public static middleware = async (ctx: ModifiedContext, next: Function) => {
                ctx.jwt = Jwt;
                return await next();
            };

            public static authenticate = async (ctx: ModifiedContext, next: Function) => {
                const token = Middleware.resolveAuthorizationHeader(ctx);
                if (token !== null) {
                    const decodedToken: { id: string } | null = await Jwt.verify(token).catch(() => null);
                    if (decodedToken && decodedToken.id) {
                        const user: UserDocument = await UserModel.findById(decodedToken.id).exec().catch(() => null);
                        if (user && decodedToken.id && user._id.toString() === decodedToken.id.toString() && user.active) {
                            ctx.state.user = user.toNormalization();
                            if (ctx.state.user.userName === DefaultUserCreator.DEFAULT_PROFILE_NAME)
                                ctx.state.user.profile = {
                                    name: DefaultUserCreator.DEFAULT_PROFILE_NAME,
                                    description: DefaultUserCreator.DEFAULT_PROFILE_NAME,
                                    roles: []
                                }
                            return ControllerHelpers.haseRoleMidleWare(ctx, next);
                        } else {
                            return ctx.answer(401, Responses.INVALID_CREDS);
                        }
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

    public static answer: KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
        /**
         * @param status - The http code
         * @param body - An Object or string input depending on the http code
         * @param pagination - Le nombre total d'element dans la collection
         */
        ctx.answer = (status: number, body: object | string, pagination?: Pagination) => {
            ctx.state.log.code = status;
            ctx.status = status;
            let error: boolean = false;

            if (status >= 299 || status < 200) {
                error = true;
                if (typeof body === "string") ctx.state.log.errorMessage = body;
            }

            if (error === true) {
                ctx.body = {
                    code: ctx.status,
                    error: (Array.isArray(body)) ? body : {message: body}
                };
            } else {
                ctx.state.log.state = LogState.SUCCES;
                ctx.body = {
                    code: ctx.status,
                    data: (typeof body === 'object') ? body : (Array.isArray(body)) ? body : {message: body}
                };
                if (pagination) ctx.body.pagination = pagination;
            }

            ctx.state.log.time = new Date().getTime() - ctx.state.log.time;
            LoModel.create(ctx.state.log).then();

            return ctx;
        };

        await next();
    };

    public static onError: KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
        try {
            await next();
        } catch (err) {
            console.error(err.stack || err);
            ctx.answer(500, Responses.INTERNAL_ERROR);
        }
    };

    public static initLog: KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
        ctx.state.log = {
            state: LogState.ERROR,
            userName: ctx.state.user.userName,
            action: "NOT FOUND",
            ipAddress: ctx.request.ip,
            url: ctx.request.url,
            method: ctx.request.method,
            host: ctx.header.host,
            userAgent: ctx.header['user-agent'],
            time: new Date().getTime(),
            code: 404
        };
        await next();
    };

    public static anonymous: KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
        ctx.state.user = {
            active: false,
            email: undefined,
            name: 'anonymous',
            profile: {
                name: 'anonymous',
                description: 'anonymous',
                roles: []
            },
            userName: 'anonymous'
        }
        await next();
    };

    public static freeRouteAction: KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
        const path = ctx.request.method + ctx.request.url.replace(/[a-f\d]{24}/gi, ':id');
        const result: [string] = new Map<string, [string]>(FREE_ROUTES).get(path);
        if (result && result.length > 0) {
            ctx.state.log.action = result[0];
            ctx.state.log.userName = ctx.state.user.userName;
            return await next();
        }
        await next();
    };

    private static resolveAuthorizationHeader: AuthorizationFunction = (ctx: ModifiedContext) => {
        if (!ctx.header || !ctx.header.authorization) {
            return;
        }

        const PARTS = ctx.header.authorization.split(' ');

        if (PARTS.length === 2) {
            const SCHEME: string = PARTS[0];
            const CREDENTIALS: string = PARTS[1];

            if (/^Bearer$/i.test(SCHEME)) {
                return CREDENTIALS;
            }
        }

        return null;
    };
}

export default Middleware;
