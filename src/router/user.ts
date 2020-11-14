import ROUTER, {Handler, Joi as JOI, Router, Spec} from 'koa-joi-router';
import HELPER from './helper';
import USER_CONTROLLER from '../controller/user';
import {SchemaMap} from "joi";
import {ModifiedContext} from "index";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import UserModel from './../model/user';
import PROFILE_CONTROLLER from "../controller/profile-controller";
import ROUTER_HELPER from "./router-helper";
import {RoutesPrefix} from "../constante/routes-prefix";


class UserRouter {

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
        createdAt: JOI.date(),
        active: JOI.bool().default(false),
        profile: JOI.object({
            id: JOI.string().allow(''),
            name: JOI.string().allow(''),
            description: JOI.string().allow(''),
        })
    }
    public static read: Spec = ({
        method: HELPER.methods.GET,
        path: ROUTER_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({
                id: JOI.string().regex(HELPER.mongoObjectRegEx)
            }),
            output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, UserModel)
        ]
    })
    private static readonly createBody = JOI.object({
        name: UserRouter.NAME_VALIDATION,
        email: UserRouter.EMAIL_NAME_VALIDATION,
        // password: UserRouter.PASSWORD_NAME_VALIDATION,
        userName: UserRouter.USERNAME_VALIDATION,
        active: JOI.bool().default(false),
        profile: UserRouter.PROFILE_VALIDATION,
    }).options({stripUnknown: true});

    public static create: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: UserRouter.createBody,
            output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
        },
        handler: [
            HELPER.validation,
            UserRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, UserModel)
        ]
    })

    private static createAndGet: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({entity: UserRouter.createBody, pagination: CONTROLLER_HELPERS.paginationInput}),
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            UserRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })

    private static readonly updateBody = JOI.object({
        name: UserRouter.NAME_VALIDATION,
        email: UserRouter.EMAIL_NAME_VALIDATION,
        // password: UserRouter.PASSWORD_NAME_VALIDATION,
        userName: UserRouter.USERNAME_VALIDATION,
        active: JOI.bool().allow(null).optional(),
        profile: UserRouter.PROFILE_VALIDATION,
    }).options({stripUnknown: true});

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
            output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
        },
        handler: [
            HELPER.validation,
            UserRouter.updateValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.update(ctx, UserModel)
        ]
    })

    private static updateAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.updateAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: UserRouter.updateBody, pagination: CONTROLLER_HELPERS.paginationInput}),
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            UserRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })

    private static deleteAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: CONTROLLER_HELPERS.paginationInput,
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            UserRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })

    private static page: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: CONTROLLER_HELPERS.paginationInput,
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: HELPER.methods.DELETE,
        path: ROUTER_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            output: HELPER.defaultOutput(JOI.object(UserRouter.userOutput))
        },
        handler: [
            HELPER.validation,
            UserRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, UserModel),
        ]
    })

    private static deleteAll: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deleteAllPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1),
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            UserRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, UserModel),
        ]
    })

    private static deleteAllAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deleteAllAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({
                ids: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1),
                pagination: CONTROLLER_HELPERS.paginationInput,
            }),
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            UserRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, UserModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })


    private static all: Spec = ({
        method: HELPER.methods.GET,
        path: ROUTER_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, UserModel),
        ]
    });

    public static activateAccount: Spec = ({
        method: HELPER.methods.PUT,
        path: '/activate/:id',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: CONTROLLER_HELPERS.paginationInput,
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifer"),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.activateOrDesableAccount(ctx, next, [ctx.request.params['id']],true),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),

        ]
    })

    public static disableAccount: Spec = ({
        method: HELPER.methods.PUT,
        path: '/disable/:id',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: CONTROLLER_HELPERS.paginationInput,
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifer"),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.activateOrDesableAccount(ctx, next, [ctx.request.params['id']],false),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })

    public static activateAllAccount: Spec = ({
        method: HELPER.methods.PUT,
        path: '/activate-all',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({
                ids: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1),
                pagination: CONTROLLER_HELPERS.paginationInput,
            }),
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckAdminNotInList(ctx, next, 'modifier'),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, UserModel, '_id', ctx.request.body, ctx.request.body.length, `Certaines utilisateur n'existent pas`),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.activateOrDesableAccount(ctx, next, ctx.request.body,true),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })

    public static disableAllAccount: Spec = ({
        method: HELPER.methods.PUT,
        path: '/disable-all',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({
                ids: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1),
                pagination: CONTROLLER_HELPERS.paginationInput,
            }),
            output: HELPER.defaultOutput(JOI.array().items(UserRouter.userOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckAdminNotInList(ctx, next, 'modifier'),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, UserModel, '_id', ctx.request.body, ctx.request.body.length, `Certaines utilisateur n'existent pas`),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.activateOrDesableAccount(ctx, next, ctx.request.body,false),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })

    private static currentUserRoles: Spec = ({
        method: HELPER.methods.GET,
        path: `/current-user-roles`,
        validate: {
            continueOnError: true,
            output: HELPER.defaultOutput(JOI.array().items(JOI.string()).allow([]))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => USER_CONTROLLER.currentUserRoles(ctx),
        ]
    })

    public static resetPassword: Spec = ({
        method: HELPER.methods.GET,
        path: '/reset-password/:id',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            output: HELPER.defaultOutput(JOI.empty())
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifer"),
            USER_CONTROLLER.resetPassword,
        ]
    })

    public static routes(): Router {
        const router = ROUTER();
        router.prefix(RoutesPrefix.user);
        router.route([
            UserRouter.create,
            UserRouter.createAndGet,
            UserRouter.update,
            UserRouter.updateAndGet,
            UserRouter.delete,
            UserRouter.deleteAndGet,
            UserRouter.deleteAll,
            UserRouter.deleteAllAndGet,
            UserRouter.read,
            UserRouter.all,
            UserRouter.page,
            UserRouter.activateAccount,
            UserRouter.disableAccount,
            UserRouter.disableAllAccount,
            UserRouter.activateAllAccount,
            UserRouter.currentUserRoles,
            UserRouter.resetPassword,
        ]);
        return router;
    }

    private static createValidation(): Handler[] {
        return [
            USER_CONTROLLER.checkCreateActiveRole,
            USER_CONTROLLER.checkProfile,
            USER_CONTROLLER.adminCheck,
            USER_CONTROLLER.beforeCreate,
            USER_CONTROLLER.setPassword,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifier"),
            USER_CONTROLLER.checkProfile,
            USER_CONTROLLER.adminCheck,
            USER_CONTROLLER.checkUpdateActiveRole,
            USER_CONTROLLER.beforeUpdate,
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifer"),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckAdminNotInList(ctx, next, 'supprimer'),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, UserModel, '_id', ctx.request.body, ctx.request.body.length, `Certaines utilisateur n'existent pas`),
        ];
    }



}

export default UserRouter;
