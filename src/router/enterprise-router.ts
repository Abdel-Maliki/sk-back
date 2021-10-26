import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import ENTERPRISE_CONTROLLER from '../controller/enterprise-controller';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import EnterpriseModel, {EnterpriseDocument, EnterpriseType} from './../model/enterprise';
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';
import ROLES from "../constante/roles";
import LOG_CONSTANTS from "../constante/log-constante";


class EnterpriseRouter {

    static readonly errorMessage = `Certaines enterprises n'existent pas`;
    static readonly enterpriseNotFound = `Ce enterprise n'existent pas`;

    public static readonly NAME_VALIDATION = JOI.string().trim().min(3).max(ROUTER_HELPER.defaults.length).label("le nom de l'enterprise").required();
    public static readonly DESCRIPTION_VALIDATION = JOI.string().trim().allow('', null).max(ROUTER_HELPER.defaults.length).label("la description de l'enterprise").optional();
    public static readonly ADDRESS_VALIDATION = JOI.string().trim().allow('', null).max(ROUTER_HELPER.defaults.length).label("l'adresse de l'enterprise").optional();
    public static readonly TEL_VALIDATION = JOI.string().trim().allow('', null).max(ROUTER_HELPER.defaults.length).label("le numéro de téléphone de l'enterprise").optional();
    public static readonly EMAIL_VALIDATION = JOI.string().trim().allow('', null).max(ROUTER_HELPER.defaults.length).label("l'adresse email de l'enterprise").optional();

    private static readonly enterpriseInput = {
        name: EnterpriseRouter.NAME_VALIDATION,
        description: EnterpriseRouter.DESCRIPTION_VALIDATION,
        tel: EnterpriseRouter.TEL_VALIDATION,
        address: EnterpriseRouter.ADDRESS_VALIDATION,
        email: EnterpriseRouter.EMAIL_VALIDATION,
    }


    private static readonly enterpriseOutput: SchemaMap = {
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
        name: JOI.string().required(),
        description: JOI.string().allow('', null).optional(),
        tel: JOI.string().allow('', null).optional(),
        address: JOI.string().allow('', null).optional(),
        email: JOI.string().allow('', null).optional(),
        createdAt: JOI.date(),
    };

    private static create: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({entity: EnterpriseRouter.enterpriseInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(EnterpriseRouter.enterpriseOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...EnterpriseRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, EnterpriseModel),
        ]
    });

    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: EnterpriseRouter.enterpriseInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(EnterpriseRouter.enterpriseOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...EnterpriseRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, EnterpriseModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<EnterpriseDocument, EnterpriseType>(ctx, EnterpriseModel, ENTERPRISE_CONTROLLER.condition(ctx)),
        ]
    });

    private static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(EnterpriseRouter.enterpriseOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, EnterpriseModel),
        ]
    });

    private static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: EnterpriseRouter.enterpriseInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(EnterpriseRouter.enterpriseOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...EnterpriseRouter.updateValidation(),
            (ctx: ModifiedContext) => ENTERPRISE_CONTROLLER.update(ctx),
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
                entity: EnterpriseRouter.enterpriseInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(EnterpriseRouter.enterpriseOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...EnterpriseRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, EnterpriseModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<EnterpriseDocument, EnterpriseType>(ctx, EnterpriseModel, ENTERPRISE_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(EnterpriseRouter.enterpriseOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...EnterpriseRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, EnterpriseModel),
        ]
    })

    private static deleteAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({pagination: CONTROLLER_HELPERS.getPaginationInput()}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(EnterpriseRouter.enterpriseOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            ...EnterpriseRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, EnterpriseModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<EnterpriseDocument, EnterpriseType>(ctx, EnterpriseModel, ENTERPRISE_CONTROLLER.condition(ctx)),
        ]
    })

    private static all: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(EnterpriseRouter.enterpriseOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, EnterpriseModel),
        ]
    });

    private static deleteAll: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAllPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({ids: JOI.array().items(JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)).min(1)}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.empty())
        },
        handler: [
            ROUTER_HELPER.validation,
            ...EnterpriseRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, EnterpriseModel),
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
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(EnterpriseRouter.enterpriseOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            ...EnterpriseRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, EnterpriseModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<EnterpriseDocument, EnterpriseType>(ctx, EnterpriseModel, ENTERPRISE_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({pagination: CONTROLLER_HELPERS.getPaginationInput()}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(EnterpriseRouter.enterpriseOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, EnterpriseModel, ENTERPRISE_CONTROLLER.condition(ctx)),
        ]
    });

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.create, [ROLES.ADD_ENTERPRISE], LOG_CONSTANTS.ADD_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.createAndGet, [ROLES.ADD_ENTERPRISE], LOG_CONSTANTS.ADD_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.update, [ROLES.EDIT_ENTERPRISE], LOG_CONSTANTS.EDIT_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.updateAndGet, [ROLES.EDIT_ENTERPRISE], LOG_CONSTANTS.EDIT_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.delete, [ROLES.DELETE_ENTERPRISE], LOG_CONSTANTS.DELETE_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.deleteAndGet, [ROLES.DELETE_ENTERPRISE], LOG_CONSTANTS.DELETE_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.deleteAll, [ROLES.DELETE_ENTERPRISE], LOG_CONSTANTS.DELETE_MULTIPLE_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.deleteAllAndGet, [ROLES.DELETE_ENTERPRISE], LOG_CONSTANTS.DELETE_MULTIPLE_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.read, [ROLES.READ_ENTERPRISE, ROLES.DELETE_ENTERPRISE, ROLES.ADD_ENTERPRISE, ROLES.EDIT_ENTERPRISE], LOG_CONSTANTS.READ_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.page, [ROLES.READ_ENTERPRISE, ROLES.DELETE_ENTERPRISE, ROLES.ADD_ENTERPRISE, ROLES.EDIT_ENTERPRISE], LOG_CONSTANTS.PAGE_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(EnterpriseRouter.all, [ROLES.READ_ENTERPRISE, ROLES.DELETE_ENTERPRISE, ROLES.ADD_ENTERPRISE, ROLES.EDIT_ENTERPRISE], LOG_CONSTANTS.LISTER_ENTERPRISE, RoutesPrefix.enterprise, jwtMiddleware),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            // (ctx: ModifiedContext, next: Function) => ENTERPRISE_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, EnterpriseModel, '_id', ctx.request.body, ctx.request.body.length, EnterpriseRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'enterprise.id',
                ctx.request.body, size => `ces enterprises sont associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, EnterpriseModel, '_id', [ctx.request.params['id']], 1, EnterpriseRouter.enterpriseNotFound),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'enterprise.id',
                [ctx.request.params['id']], size => `ce enterprise est associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static createValidation(): Handler[] {
        return [
            ENTERPRISE_CONTROLLER.beforeCreate,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, EnterpriseModel, '_id', [ctx.request.params['id']], 1, EnterpriseRouter.enterpriseNotFound),
            ENTERPRISE_CONTROLLER.beforeUpdate,
        ];
    }


}

export default EnterpriseRouter;
