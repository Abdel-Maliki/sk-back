import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import USER_CONTROLLER from '../controller/user';
import {JwtFunctionResponse, ModifiedContext} from "index";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import UserModel, {UserDocument, UserState, UserType} from './../model/user';
import PROFILE_CONTROLLER from "../controller/profile-controller";
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import ROLES from "../constante/roles";
import Roles from "../constante/roles";
import LOG_CONSTANTE from "../constante/log-constante";


class UserRouter {

    public static NAME_VALIDATION = JOI.string().max(ROUTER_HELPER.defaults.length).label("le nom").required();
    public static EMAIL_NAME_VALIDATION = JOI.string().lowercase().email().required();
    public static PASSWORD_NAME_VALIDATION = JOI.string().min(2).max(ROUTER_HELPER.defaults.length).label("le mot de passe").required();
    public static USERNAME_VALIDATION = JOI.string().min(2).max(ROUTER_HELPER.defaults.length).label("le nom d'utilisateur").required();
    public static PROFILE_VALIDATION = JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)});

    public static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.object(ROUTER_HELPER.userOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, UserModel)
        ]
    });

    public static allUsernames: Spec = ({
        method: ROUTER_HELPER.methods.GET,
        path: '/all-user-name',
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(JOI.string()))
        },
        handler: [
            ROUTER_HELPER.validation,
            USER_CONTROLLER.allUserNames,
        ]
    });


    public static activateAccount: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: '/activate/:id',
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({others: JOI.object({password: JOI.string().required()}), pagination: CONTROLLER_HELPERS.paginationInput}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifer"),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.activateOrDisableAccount(ctx, next, [ctx.request.params['id']], UserState.ACTIVE),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<UserDocument, UserType>(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })
    public static disableAccount: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: '/disable/:id',
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({others: JOI.object({password: JOI.string().required()}), pagination: CONTROLLER_HELPERS.paginationInput}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifer"),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.activateOrDisableAccount(ctx, next, [ctx.request.params['id']], UserState.DESACTIVE),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })
    public static activateAllAccount: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: '/activate-all',
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                ids: JOI.array().items(JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)).min(1),
                pagination: CONTROLLER_HELPERS.paginationInput,
                others: JOI.object({password: JOI.string().required()})
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckAdminNotInList(ctx, next, 'modifier'),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, UserModel, '_id', ctx.request.body, ctx.request.body.length, `Certaines utilisateur n'existent pas`),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.activateOrDisableAccount(ctx, next, ctx.request.body, UserState.ACTIVE),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })
    public static disableAllAccount: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: '/disable-all',
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                ids: JOI.array().items(JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)).min(1),
                pagination: CONTROLLER_HELPERS.paginationInput,
                others: JOI.object({password: JOI.string().required()})
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckAdminNotInList(ctx, next, 'modifier'),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, UserModel, '_id', ctx.request.body, ctx.request.body.length, `Certaines utilisateur n'existent pas`),
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.activateOrDisableAccount(ctx, next, ctx.request.body, UserState.DESACTIVE),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })
    public static currentUserData: Spec = ({
        method: ROUTER_HELPER.methods.GET,
        path: `/current-user-data`,
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.object({
                user: ROUTER_HELPER.userOutput,
                roles: JOI.array().items(JOI.string()).allow([]),
            }))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => USER_CONTROLLER.currentUserData(ctx),
        ]
    })
    public static resetPassword: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: '/reset-password/:id',
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({others: JOI.object({password: JOI.string().required()})}),
            output: ROUTER_HELPER.defaultOutput(JOI.empty())
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => USER_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifer"),
            USER_CONTROLLER.resetPassword,
        ]
    })
    private static readonly createBody = JOI.object({
        name: UserRouter.NAME_VALIDATION,
        email: UserRouter.EMAIL_NAME_VALIDATION,
        status: JOI.string().default(UserState.DESACTIVE),
        // password: UserRouter.PASSWORD_NAME_VALIDATION,
        userName: UserRouter.USERNAME_VALIDATION,
        profile: UserRouter.PROFILE_VALIDATION,
    }).options({stripUnknown: true});
    public static create: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: UserRouter.createBody,
                others: JOI.object({password: JOI.string().required()}),
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ROUTER_HELPER.userOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            UserRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, UserModel)
        ]
    })
    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: UserRouter.createBody,
                others: JOI.object({password: JOI.string().required()}),
                pagination: CONTROLLER_HELPERS.paginationInput
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            //CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            UserRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })
    private static readonly updateBody = JOI.object({
        name: UserRouter.NAME_VALIDATION,
        email: UserRouter.EMAIL_NAME_VALIDATION,
        status: JOI.string(),
        // password: UserRouter.PASSWORD_NAME_VALIDATION,
        userName: UserRouter.USERNAME_VALIDATION,
        active: JOI.bool().allow(null).optional(),
        profile: UserRouter.PROFILE_VALIDATION,
    }).options({stripUnknown: true});
    public static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({
                id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)
            }),
            body: JOI.object({
                entity: UserRouter.updateBody,
                others: JOI.object({password: JOI.string().required()}),
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ROUTER_HELPER.userOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            UserRouter.updateValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.update(ctx, UserModel)
        ]
    })
    private static updateAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updateAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({
                entity: UserRouter.updateBody,
                others: JOI.object({password: JOI.string().required()}),
                pagination: CONTROLLER_HELPERS.paginationInput
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            UserRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })
    private static deleteAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({others: JOI.object({password: JOI.string().required()}), pagination: CONTROLLER_HELPERS.paginationInput}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            CONTROLLER_HELPERS.dispatch,
            UserRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, UserModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, {}),
        ]
    })
    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({pagination: CONTROLLER_HELPERS.getPaginationInput()}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })
    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({others: JOI.object({others: JOI.object({password: JOI.string().required()})})}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ROUTER_HELPER.userOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            UserRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, UserModel),
        ]
    })
    private static deleteAll: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAllPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({others: JOI.object({password: JOI.string().required()}), ids: JOI.array().items(JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)).min(1)}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            UserRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, UserModel),
        ]
    })
    private static deleteAllAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAllAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                others: JOI.object({password: JOI.string().required()}),
                ids: JOI.array().items(JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)).min(1),
                pagination: CONTROLLER_HELPERS.paginationInput,
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            UserRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, UserModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, UserModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })
    private static all: Spec = ({
        method: ROUTER_HELPER.methods.GET,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ROUTER_HELPER.userOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, UserModel),
        ]
    });
    private static updateMyPassword: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: `/update-my-password`,
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                oldPassword: JOI.string().label('l\'ancien mot de passe'),
                newPassword: JOI.string().min(5).label('le nouveau mot de passe')
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object({token: JOI.string()}))
        },

        handler: [
            ROUTER_HELPER.validation,
            USER_CONTROLLER.updateMyPassword,
        ]
    })

    public static forgotPasswordRequest: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: '/forget-password-request',
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({email: JOI.string().email().required()}),
            output: ROUTER_HELPER.defaultOutput(JOI.empty())
        },
        handler: [
            ROUTER_HELPER.validation,
            USER_CONTROLLER.forgotPasswordRequest,
        ]
    })

    public static forgotPasswordFinalisation: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: '/forget-password-finatisation',
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({
                token: JOI.string().required(),
                password: JOI.string().required()
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.empty())
        },
        handler: [
            ROUTER_HELPER.validation,
            USER_CONTROLLER.forgotPasswordFinalisation,
        ]
    })

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(UserRouter.create, [ROLES.ADD_USER], LOG_CONSTANTE.ADD_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.createAndGet, [ROLES.ADD_USER], LOG_CONSTANTE.ADD_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.update, [ROLES.EDIT_USER], LOG_CONSTANTE.EDIT_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.updateAndGet, [ROLES.EDIT_USER], LOG_CONSTANTE.EDIT_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.delete, [ROLES.DELETE_USER], LOG_CONSTANTE.DELETE_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.deleteAndGet, [ROLES.DELETE_USER], LOG_CONSTANTE.DELETE_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.deleteAll, [ROLES.DELETE_USER], LOG_CONSTANTE.DELETE_MULTIPLE_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.deleteAllAndGet, [ROLES.DELETE_USER], LOG_CONSTANTE.DELETE_MULTIPLE_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.read, [ROLES.READ_USER, ROLES.DELETE_USER, ROLES.ADD_USER, ROLES.EDIT_USER, ROLES.RESET_PASSWORD, ROLES.DISABLED_ACCOUNT, ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.READ_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.page, [ROLES.READ_USER, ROLES.DELETE_USER, ROLES.ADD_USER, ROLES.EDIT_USER, ROLES.RESET_PASSWORD, ROLES.DISABLED_ACCOUNT, ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.PAGE_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.all, [ROLES.READ_USER, ROLES.DELETE_USER, ROLES.ADD_USER, ROLES.EDIT_USER, ROLES.RESET_PASSWORD, ROLES.DISABLED_ACCOUNT, ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.LISTER_USER, RoutesPrefix.user, jwtMiddleware),
            //CONTROLLER_HELPERS.buildRouter(UserRouter.search, [ROLES.READ_USER, ROLES.DELETE_USER, ROLES.ADD_USER, ROLES.EDIT_USER, ROLES.RESET_PASSWORD, ROLES.DISABLED_ACCOUNT, ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.FILTER_USER, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.activateAccount, [ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.ACTIVATE_ACCOUNT, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.disableAccount, [ROLES.DISABLED_ACCOUNT], LOG_CONSTANTE.DISABLED_ACCOUNT, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.disableAllAccount, [ROLES.DISABLED_ACCOUNT], LOG_CONSTANTE.DISABLED_MULTIPLE_ACCOUNT, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.activateAllAccount, [ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.ACTIVATE_MULTIPLE_ACCOUNT, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.currentUserData, [], LOG_CONSTANTE.CURRENT_USER_DATA, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.resetPassword, [ROLES.RESET_PASSWORD], LOG_CONSTANTE.RESET_PASSWORD, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.updateMyPassword, [], LOG_CONSTANTE.UPDATE_MY_PASSWORD, RoutesPrefix.user, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(UserRouter.allUsernames, [Roles.DELETE_LOG, Roles.READ_LOG], LOG_CONSTANTE.ALL_USERNAME, RoutesPrefix.user, jwtMiddleware),
        ]
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
