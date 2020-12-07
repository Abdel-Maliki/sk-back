import {Middleware as KoaMiddleware} from 'koa';
import {JwtFunctionResponse, ModifiedContext, Responses} from './../types/';
import JWT from './../lib/jwt';
import {Pagination} from "../common/pagination";
import UserModel, {UserDocument, UserState} from './../model/user';
import ControllerHelpers from "../controller/controller-helpers";
import {DefaultUserCreator} from "../service/default-user-creator";
import {LogState} from "../model/log";
import LoModel from './../model/log';
import ProfileModel from "../model/profile";
import LogConstante from "../constante/log-constante";
import {version} from "../../package.json";
import ProjectConstantes from "../constante/project-constantes";


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
                const payload: any = await Jwt.decode(token);
                let user: UserDocument = null;

                if (payload && payload.hasOwnProperty('id') && typeof payload.id === 'string' && ProjectConstantes.mongoObjectRegEx.test(payload.id)) {
                    user = await UserModel.findById(payload.id).exec().catch(() => null);
                    if (!user) return ctx.answerUserError(401, Responses.INVALID_CREDS);
                } else {
                    return ctx.answerUserError(401, Responses.INVALID_CREDS);
                }


                if (token !== null) {
                    const decodedToken: { id: string } | null = await Jwt.verify(token, Jwt.secret + ctx.header['user-agent'] + user.password).catch(() => null);
                    if (decodedToken && decodedToken.id) {
                        if (user && decodedToken.id && user._id.toString() === decodedToken.id.toString() && user.status === UserState.ACTIVE) {
                            ctx.state.user = user.toNormalization();
                            ctx.state.password = user.password;
                            if (ctx.state.user.userName === DefaultUserCreator.DEFAULT_PROFILE_NAME)
                                ctx.state.user.profile = {
                                    name: DefaultUserCreator.DEFAULT_PROFILE_NAME,
                                    description: DefaultUserCreator.DEFAULT_PROFILE_NAME,
                                    roles: []
                                }
                            UserModel.findByIdAndUpdate(user._id, {testAuthNumber: 0}).exec().then();
                            ctx.state.log.userName = user.userName;
                            return await next();
                        } else {
                            return ctx.answerUserError(401, Responses.INVALID_CREDS);
                        }
                    } else {
                        return ctx.answerUserError(401, Responses.INVALID_CREDS);
                    }
                } else {
                    return ctx.answerUserError(401, Responses.INVALID_CREDS);
                }
            }
        }

        return JwtClass;
    };

    public static answer: KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
        /**
         * @param status - The http code
         * @param errorMessage - An string input depending on the http code
         * @param body - An string input depending on the http code
         */
        ctx.answerUserError = (status: number, errorMessage: string, body?: any) => {
            ctx.state.log.code = status;
            ctx.status = status;
            ctx.state.log.errorMessage = errorMessage;
            ctx.body = {code: ctx.status, error: {message: errorMessage}}
            if (status === 403) ctx.body.data = body;
            ctx.state.log.time = new Date().getTime() - ctx.state.log.time;
            LoModel.create(ctx.state.log).then();
            return ctx;
        };

        ctx.answerServerError = () => {
            ctx.state.log.code = 500;
            ctx.status = 500;
            ctx.state.log.errorMessage = Responses.INTERNAL_ERROR;
            ctx.body = {code: ctx.status, error: {message: Responses.INTERNAL_ERROR}}
            ctx.state.log.time = new Date().getTime() - ctx.state.log.time;
            LoModel.create(ctx.state.log).then();
            return ctx;
        };

        /**
         * @param status - The http code
         * @param body - An Object or string input depending on the http code
         * @param pagination - Le nombre total d'element dans la collection
         */
        ctx.answerSuccess = (status: 200| 201 , body: any, pagination?: Pagination) => {
            ctx.state.log.code = status;
            ctx.status = status;
            ctx.state.log.state = LogState.SUCCESS;
            ctx.body = {
                code: ctx.status,
                data: body,
                pagination,
            };
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
            ctx.state.log.state = LogState.SERVER_ERROR;
            ctx.state.log.serverError = err.stack || err;
            ctx.state.log.time = ctx.state.log.timeError;
            ctx.answerServerError();
        }
    };

    public static initLog: KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
        ctx.state.log = {
            state: LogState.CLIENT_ERROR,
            userName: ctx.state.user.userName,
            action: LogConstante.NOT_FOUND,
            ipAddress: ctx.request.ip,
            url: ctx.request.url,
            method: ctx.request.method,
            host: ctx.header.host,
            version,
            userAgent: ctx.header['user-agent'],
            time: new Date().getTime(),
            timeError: new Date().getTime(),
            code: 404
        };
        await next();
    };

    public static anonymous: KoaMiddleware = async (ctx: ModifiedContext, next: Function) => {
        ctx.state.user = {
            activatedDate: undefined,
            status: UserState.DESACTIVE,
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

    public static addLog = async (ctx: ModifiedContext, next: Function, log: LogConstante) => {
        console.log('Class: Middleware, Function: addLog, Line 156 , log: '
            , log);
        if (log) {
            ctx.state.log.action = log;
            return await next();
        } else {
            return await ControllerHelpers.forbiddenError(ctx);
        }
    }

    public static haseRoleMidleWare = async (ctx: ModifiedContext, next: Function, roles: string[]) => {
        if (ctx.state.user.profile.name === DefaultUserCreator.DEFAULT_PROFILE_NAME || !roles || roles.length === 0) return await next();
        const size: boolean = await ProfileModel.exists({
            name: ctx.state.user.profile.name, $or: roles.map(role => ({roles: {"$in": [role]}}))
        }).catch(() => null);
        if (size) {
            return await next();
        } else {
            return await ControllerHelpers.forbiddenError(ctx);
        }
    }

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
