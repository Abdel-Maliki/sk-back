import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import PROFILE_CONTROLLER from '../controller/profile-controller';
import {ObjectSchema, SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import ProfileModel, {ProfileDocument, ProfileType} from './../model/profile';
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';
import ROLES from "../constante/roles";
import LOG_CONSTANTE from "../constante/log-constante";


class ProfileRouter {

    static readonly errorMessage = `Certaines profiles n'existent pas`;
    static readonly profileNotFound = `Ce profile n'existent pas`;

    public static readonly NAME_VALIDATION = JOI.string().trim().min(3).max(ROUTER_HELPER.defaults.length).label("le nom du profile").required();
    public static readonly DESCRIPTION_VALIDATION = JOI.string().trim().allow('', null).max(ROUTER_HELPER.defaults.length).label("la description du profile").optional();

    private static readonly profileInput: ObjectSchema = JOI.object({
        name: ProfileRouter.NAME_VALIDATION,
        description: ProfileRouter.DESCRIPTION_VALIDATION,
    }).options({stripUnknown: true});

    private static readonly profileOutput: SchemaMap = {
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
        name: JOI.string().required(),
        description: JOI.string().allow('', null).optional(),
        createdAt: JOI.date(),
    };

    private static create: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({entity: ProfileRouter.profileInput}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ProfileRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, ProfileModel),
        ]
    });

    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({entity: ProfileRouter.profileInput, pagination: CONTROLLER_HELPERS.paginationInput}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...ProfileRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, ProfileModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ProfileDocument, ProfileType>(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, ProfileModel),
        ]
    });

    private static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: ProfileRouter.profileInput}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ProfileRouter.updateValidation(),
            (ctx: ModifiedContext) => PROFILE_CONTROLLER.update(ctx),
        ]
    })

    private static updateAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updateAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: ProfileRouter.profileInput, pagination: CONTROLLER_HELPERS.paginationInput}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...ProfileRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.update(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ProfileDocument, ProfileType>(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ProfileRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, ProfileModel),
        ]
    })

    private static deleteAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({pagination: CONTROLLER_HELPERS.getPaginationInput()}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            ...ProfileRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, ProfileModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ProfileDocument, ProfileType>(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    })

    private static all: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, ProfileModel),
        ]
    });

    private static deleteAll: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAllPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({ids: JOI.array().items(JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)).min(1)}),
            output: ROUTER_HELPER.defaultOutput(JOI.empty())
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ProfileRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, ProfileModel),
        ]
    })

    private static deleteAllAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAllAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                ids: JOI.array().items(JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)).min(1),
                pagination: CONTROLLER_HELPERS.paginationInput
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            ...ProfileRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, ProfileModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ProfileDocument, ProfileType>(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({pagination: CONTROLLER_HELPERS.getPaginationInput()}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static getRoles: Spec = ({
        method: ROUTER_HELPER.methods.GET,
        path: `/roles/:id`,
        validate: {
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(JOI.string()))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => PROFILE_CONTROLLER.roles(ctx),
        ]
    });


    private static setRoles: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: `/set-roles/:id`,
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({
                others: JOI.object({password: JOI.string().required()}),
                roles: JOI.array().unique().allow([]).items(JOI.string()).label("roles ")
            }),
            output: ROUTER_HELPER.defaultOutput(JOI.array().empty())
        },
        handler: [
            ROUTER_HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, "roles"),
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.validateRoles(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, ProfileModel,
                '_id', [ctx.request.params['id']], 1, ProfileRouter.profileNotFound),
            (ctx: ModifiedContext) => PROFILE_CONTROLLER.setRoles(ctx),
        ]
    });

    /*public static routes(): Router {
        const router = ROUTER();
        router.prefix(RoutesPrefix.profile);
        router.route([
            ProfileRouter.create,
            ProfileRouter.read,
            ProfileRouter.update,
            ProfileRouter.delete,
            ProfileRouter.page,
            ProfileRouter.all,
            ProfileRouter.deleteAll,
            ProfileRouter.deleteAllAndGet,
            ProfileRouter.createAndGet,
            ProfileRouter.updateAndGet,
            ProfileRouter.deleteAndGet,
            ProfileRouter.search,
            ProfileRouter.getRoles,
            ProfileRouter.setRoles,
        ]);
        return router;
    }*/

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.create, [ROLES.ADD_PROFILE], LOG_CONSTANTE.ADD_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.createAndGet, [ROLES.ADD_PROFILE], LOG_CONSTANTE.ADD_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.update, [ROLES.EDIT_PROFILE], LOG_CONSTANTE.EDIT_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.updateAndGet, [ROLES.EDIT_PROFILE], LOG_CONSTANTE.EDIT_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.delete, [ROLES.DELETE_PROFILE], LOG_CONSTANTE.DELETE_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.deleteAndGet, [ROLES.DELETE_PROFILE], LOG_CONSTANTE.DELETE_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.deleteAll, [ROLES.DELETE_PROFILE], LOG_CONSTANTE.DELETE_MULTIPLE_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.deleteAllAndGet, [ROLES.DELETE_PROFILE], LOG_CONSTANTE.DELETE_MULTIPLE_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.read, [ROLES.READ_PROFILE, ROLES.DELETE_PROFILE, ROLES.ADD_PROFILE, ROLES.EDIT_PROFILE, ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.READ_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.page, [ROLES.READ_PROFILE, ROLES.DELETE_PROFILE, ROLES.ADD_PROFILE, ROLES.EDIT_PROFILE, ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.PAGE_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.all, [ROLES.READ_PROFILE, ROLES.DELETE_PROFILE, ROLES.ADD_PROFILE, ROLES.EDIT_PROFILE, ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.LISTER_PROFILE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.getRoles, [ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.READ_PROFILE_ROLE, RoutesPrefix.profile, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ProfileRouter.setRoles, [ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.AFFECT_PROFILE_ROLE, RoutesPrefix.profile, jwtMiddleware),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            // (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, ProfileModel, '_id', ctx.request.body, ctx.request.body.length, ProfileRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'profile.id',
                ctx.request.body, size => `ces profiles sont associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, ProfileModel, '_id', [ctx.request.params['id']], 1, ProfileRouter.profileNotFound),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'profile.id',
                [ctx.request.params['id']], size => `ce profile est associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static createValidation(): Handler[] {
        return [
            PROFILE_CONTROLLER.beforeCreate,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, ProfileModel, '_id', [ctx.request.params['id']], 1, ProfileRouter.profileNotFound),
            PROFILE_CONTROLLER.beforeUpdate,
        ];
    }




}

export default ProfileRouter;
