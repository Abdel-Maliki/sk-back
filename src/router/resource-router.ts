import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import RESOURCE_CONTROLLER from '../controller/resource-controller';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import ResourceModel, {ResourceDocument, ResourceType} from './../model/resource';
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';
import ROLES from "../constante/roles";
import LOG_CONSTANTS from "../constante/log-constante";

class ResourceRouter {

    static readonly errorMessage = `Certaines ressources n'existent pas`;
    static readonly resourceNotFound = `Cette ressource n'existent pas`;


    public static readonly AGE_VALIDATION = JOI.number().min(1).label("l'age de la resource").required();
    public static readonly SEX_VALIDATION = JOI.string().trim().valid('M', 'F').label("le sexe de la resource").optional();
    public static readonly ETHNICITY_VALIDATION = JOI.string().trim().label("l'origine ethnique de la resource").optional();
    public static readonly MANE_VALIDATION = JOI.string().trim().label("la nom de la resource").optional();
    public static readonly REGION_VALIDATION = JOI.object({
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).optional().required()
    }).optional().options({stripUnknown: true});


    private static readonly resourceInput = {
        name: ResourceRouter.MANE_VALIDATION,
        region: ResourceRouter.REGION_VALIDATION,
        ethnicity: ResourceRouter.ETHNICITY_VALIDATION,
        age: ResourceRouter.AGE_VALIDATION,
        sex: ResourceRouter.SEX_VALIDATION,
    }

    private static readonly resourceOutput: SchemaMap = {
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
        name: JOI.string().allow('', null).optional(),
        age: JOI.number().optional(),
        sex: JOI.string().allow('', null).optional(),
        ethnicity: JOI.string().allow('', null).optional(),
        region: JOI.object({
            id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
            name: JOI.string().required(),
        }).optional(),
        createdAt: JOI.date(),
    };

    private static create: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({entity: ResourceRouter.resourceInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ResourceRouter.resourceOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ResourceRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, ResourceModel),
        ]
    });

    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: ResourceRouter.resourceInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ResourceRouter.resourceOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...ResourceRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, ResourceModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ResourceDocument, ResourceType>(ctx, ResourceModel, RESOURCE_CONTROLLER.condition(ctx)),
        ]
    });

    private static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ResourceRouter.resourceOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, ResourceModel),
        ]
    });

    private static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: ResourceRouter.resourceInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ResourceRouter.resourceOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ResourceRouter.updateValidation(),
            (ctx: ModifiedContext) => RESOURCE_CONTROLLER.update(ctx),
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
                entity: ResourceRouter.resourceInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ResourceRouter.resourceOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...ResourceRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, ResourceModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ResourceDocument, ResourceType>(ctx, ResourceModel, RESOURCE_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ResourceRouter.resourceOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ResourceRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, ResourceModel),
        ]
    })

    private static deleteAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({pagination: CONTROLLER_HELPERS.paginationInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ResourceRouter.resourceOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            ...ResourceRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, ResourceModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ResourceDocument, ResourceType>(ctx, ResourceModel, RESOURCE_CONTROLLER.condition(ctx)),
        ]
    })

    private static all: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ResourceRouter.resourceOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, ResourceModel),
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
            ...ResourceRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, ResourceModel),
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
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ResourceRouter.resourceOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            ...ResourceRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, ResourceModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ResourceDocument, ResourceType>(ctx, ResourceModel, RESOURCE_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                pagination: CONTROLLER_HELPERS.paginationInput,
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ResourceRouter.resourceOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, ResourceModel, RESOURCE_CONTROLLER.condition(ctx)),
        ]
    });

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.create, [ROLES.ADD_RESOURCE], LOG_CONSTANTS.ADD_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.createAndGet, [ROLES.ADD_RESOURCE], LOG_CONSTANTS.ADD_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.update, [ROLES.EDIT_RESOURCE], LOG_CONSTANTS.EDIT_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.updateAndGet, [ROLES.EDIT_RESOURCE], LOG_CONSTANTS.EDIT_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.delete, [ROLES.DELETE_RESOURCE], LOG_CONSTANTS.DELETE_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.deleteAndGet, [ROLES.DELETE_RESOURCE], LOG_CONSTANTS.DELETE_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.deleteAll, [ROLES.DELETE_RESOURCE], LOG_CONSTANTS.DELETE_MULTIPLE_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.deleteAllAndGet, [ROLES.DELETE_RESOURCE], LOG_CONSTANTS.DELETE_MULTIPLE_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.read, [ROLES.READ_RESOURCE, ROLES.DELETE_RESOURCE, ROLES.ADD_RESOURCE, ROLES.EDIT_RESOURCE], LOG_CONSTANTS.READ_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.page, [ROLES.READ_RESOURCE, ROLES.DELETE_RESOURCE, ROLES.ADD_RESOURCE, ROLES.EDIT_RESOURCE], LOG_CONSTANTS.PAGE_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ResourceRouter.all, [ROLES.READ_RESOURCE, ROLES.DELETE_RESOURCE, ROLES.ADD_RESOURCE, ROLES.EDIT_RESOURCE], LOG_CONSTANTS.LISTER_RESOURCE, RoutesPrefix.resource, jwtMiddleware),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            // (ctx: ModifiedContext, next: Function) => RESOURCE_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, ResourceModel, '_id', ctx.request.body, ctx.request.body.length, ResourceRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'resource.id',
                ctx.request.body, size => `ces resources sont associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, ResourceModel, '_id', [ctx.request.params['id']], 1, ResourceRouter.resourceNotFound),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'resource.id',
                [ctx.request.params['id']], size => `ce ressource est associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static createValidation(): Handler[] {
        return [
            RESOURCE_CONTROLLER.beforeCreate,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, ResourceModel, '_id', [ctx.request.params['id']], 1, ResourceRouter.resourceNotFound),
            RESOURCE_CONTROLLER.beforeUpdate,
        ];
    }


}

export default ResourceRouter;
