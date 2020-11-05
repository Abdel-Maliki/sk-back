import ROUTER, {Joi as JOI, Router, Spec} from 'koa-joi-router';
import HELPER from './helper';
import USER_CONTROLLER from '../controller/user';
import {ObjectSchema, SchemaMap} from "joi";
import {ModifiedContext} from "index";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import UserModel from './../model/user';
import PROFILE_CONTROLLER from "../controller/profile-controller";
import ROUTER_HELPER from "./router-helper";
import {RoutesPrefix} from "../constante/routes-prefix";


class UserRouter {

    public static readonly baseRoute: string = "/users";

    public static NAME_VALIDATION = JOI.string().max(HELPER.defaults.length).label("le nom").required();
    public static EMAIL_NAME_VALIDATION = JOI.string().lowercase().email().required();
    public static PASSWORD_NAME_VALIDATION = JOI.string().min(2).max(HELPER.defaults.length).label("le mot de passe").required();
    public static USERNAME_VALIDATION = JOI.string().min(2).max(HELPER.defaults.length).label("le nom d'utilisateur").required();
    public static PROFILE_VALIDATION = JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)});

    public static readonly userOutput: SchemaMap = {
        id: JOI.string(),
        email: JOI.string(),
        name: JOI.string(),
        userName: JOI.string(),
        profile: JOI.object({
            id: JOI.string().required(),
            name: JOI.string().required(),
            description: JOI.string().required(),
        })
    };

    private static readonly createBody = JOI.object({
        name: UserRouter.NAME_VALIDATION,
        email: UserRouter.EMAIL_NAME_VALIDATION,
        password: UserRouter.PASSWORD_NAME_VALIDATION,
        userName: UserRouter.USERNAME_VALIDATION,
        profile: UserRouter.PROFILE_VALIDATION,
    }).options({stripUnknown: true});

    private static readonly updateBody = JOI.object({
        name: UserRouter.NAME_VALIDATION,
        profile: UserRouter.PROFILE_VALIDATION,
    }).options({stripUnknown: true});

    private static readonly paginationInput: ObjectSchema = JOI.object({
        page: JOI.number().min(0).required(),
        size: JOI.number().min(1).required(),
        sort: JOI.string(),
        direction: JOI.number().equal([1, -1]),
        globalFilter: JOI.string(),
        filters: JOI.object(),
    }).options({stripUnknown: true});

    public static read: Spec = ({
        method: HELPER.methods.GET,
        path: ROUTER_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({
                id: JOI.string().regex(HELPER.mongoObjectRegEx)
            }),
            //output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, UserModel)
        ]
    });

    public static create: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: UserRouter.createBody,
            //output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
        },
        handler: [
            HELPER.validation,
            USER_CONTROLLER.addProfile,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, UserModel)
        ]
    });

    public static update: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({
                id: JOI.string().regex(HELPER.mongoObjectRegEx)
            }),
            body: UserRouter.updateBody,
            //output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.update(ctx, UserModel)
        ]
    });

    private static createAndGet: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({entity: UserRouter.createBody, pagination: UserRouter.paginationInput}),
            //output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            USER_CONTROLLER.setProfile,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setBodyEndPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static updateAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.updateAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: UserRouter.updateBody, pagination: UserRouter.paginationInput}),
            //output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            USER_CONTROLLER.setProfile,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setBodyEndPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static deleteAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: UserRouter.paginationInput,
            //output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [

            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setBodyEndPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: UserRouter.paginationInput,
            //output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static delete: Spec = ({
        method: HELPER.methods.DELETE,
        path: ROUTER_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            //output: HELPER.defaultOutput(JOI.object(UserRouter.))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeId(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, UserModel),
        ]
    });

    private static deleteAll: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deleteAllPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1),
            //output: HELPER.defaultOutput(JOI.empty())
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeIds(ctx, next, UserModel, 'user not found'),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, UserModel),
        ]
    });

    private static all: Spec = ({
        method: HELPER.methods.GET,
        path: ROUTER_HELPER.allPath(),
        validate: {
            continueOnError: true,
           // output: HELPER.defaultOutput(JOI.array().items(UserRouter.profileOutput))
        },
        handler: [
            HELPER.validation,
            //(ctx: ModifiedContext, next: Function)=> HELPER.validation2(ctx, next, 'role not found') ,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, UserModel),
        ]
    });

    public static routes(): Router {
        const router  = ROUTER();
        router.prefix(RoutesPrefix.user);
        router.route([
            UserRouter.create,
            UserRouter.read,
            UserRouter.update,
            UserRouter.delete,
            UserRouter.page,
            UserRouter.all,
            UserRouter.createAndGet,
            UserRouter.updateAndGet,
            UserRouter.deleteAndGet,
            UserRouter.deleteAll,
        ]);
        return router;
    }
}

export default UserRouter;
