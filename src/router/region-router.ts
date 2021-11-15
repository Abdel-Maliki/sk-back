import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import REGION_CONTROLLER from '../controller/region-controller';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import RegionModel, {RegionDocument, RegionType} from './../model/region';
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';
import ROLES from "../constante/roles";
import LOG_CONSTANTS from "../constante/log-constante";


class RegionRouter {

    static readonly errorMessage = `Certaines regions n'existent pas`;
    static readonly regionNotFound = `Cette region n'existent pas`;


    public static readonly MANE_VALIDATION = JOI.string().trim().label("la nom du region").optional();

    private static readonly regionInput = {
        name: RegionRouter.MANE_VALIDATION,
    }


    private static readonly regionOutput: SchemaMap = {
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
        name: JOI.string().allow('', null).optional(),
        createdAt: JOI.date(),
    };

    private static create: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({entity: RegionRouter.regionInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(RegionRouter.regionOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...RegionRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, RegionModel),
        ]
    });

    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: RegionRouter.regionInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(RegionRouter.regionOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...RegionRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, RegionModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<RegionDocument, RegionType>(ctx, RegionModel, REGION_CONTROLLER.condition(ctx)),
        ]
    });

    private static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(RegionRouter.regionOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, RegionModel),
        ]
    });

    private static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: RegionRouter.regionInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(RegionRouter.regionOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...RegionRouter.updateValidation(),
            (ctx: ModifiedContext) => REGION_CONTROLLER.update(ctx),
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
                entity: RegionRouter.regionInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(RegionRouter.regionOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...RegionRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, RegionModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<RegionDocument, RegionType>(ctx, RegionModel, REGION_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(RegionRouter.regionOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...RegionRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, RegionModel),
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
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(RegionRouter.regionOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            ...RegionRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, RegionModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<RegionDocument, RegionType>(ctx, RegionModel, REGION_CONTROLLER.condition(ctx)),
        ]
    })

    private static all: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(RegionRouter.regionOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, RegionModel),
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
            ...RegionRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, RegionModel),
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
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(RegionRouter.regionOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            ...RegionRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, RegionModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<RegionDocument, RegionType>(ctx, RegionModel, REGION_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({pagination: CONTROLLER_HELPERS.getPaginationInput()}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(RegionRouter.regionOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, RegionModel, REGION_CONTROLLER.condition(ctx)),
        ]
    });

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(RegionRouter.create, [ROLES.ADD_REGION], LOG_CONSTANTS.ADD_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.createAndGet, [ROLES.ADD_REGION], LOG_CONSTANTS.ADD_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.update, [ROLES.EDIT_REGION], LOG_CONSTANTS.EDIT_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.updateAndGet, [ROLES.EDIT_REGION], LOG_CONSTANTS.EDIT_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.delete, [ROLES.DELETE_REGION], LOG_CONSTANTS.DELETE_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.deleteAndGet, [ROLES.DELETE_REGION], LOG_CONSTANTS.DELETE_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.deleteAll, [ROLES.DELETE_REGION], LOG_CONSTANTS.DELETE_MULTIPLE_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.deleteAllAndGet, [ROLES.DELETE_REGION], LOG_CONSTANTS.DELETE_MULTIPLE_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.read, [ROLES.READ_REGION, ROLES.DELETE_REGION, ROLES.ADD_REGION, ROLES.EDIT_REGION], LOG_CONSTANTS.READ_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.page, [ROLES.READ_REGION, ROLES.DELETE_REGION, ROLES.ADD_REGION, ROLES.EDIT_REGION], LOG_CONSTANTS.PAGE_REGION, RoutesPrefix.region, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(RegionRouter.all, [ROLES.READ_REGION, ROLES.DELETE_REGION, ROLES.ADD_REGION, ROLES.EDIT_REGION], LOG_CONSTANTS.LISTER_REGION, RoutesPrefix.region, jwtMiddleware),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            // (ctx: ModifiedContext, next: Function) => REGION_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, RegionModel, '_id', ctx.request.body, ctx.request.body.length, RegionRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'region.id',
                ctx.request.body, size => `ces regions sont associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, RegionModel, '_id', [ctx.request.params['id']], 1, RegionRouter.regionNotFound),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'region.id',
                [ctx.request.params['id']], size => `ce region est associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static createValidation(): Handler[] {
        return [
            REGION_CONTROLLER.beforeCreate,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, RegionModel, '_id', [ctx.request.params['id']], 1, RegionRouter.regionNotFound),
            REGION_CONTROLLER.beforeUpdate,
        ];
    }


}

export default RegionRouter;
