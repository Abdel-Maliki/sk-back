import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import NEIGHBORHOOD_CONTROLLER from '../controller/neighborhood-controller';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import NeighborhoodModel, {NeighborhoodDocument, NeighborhoodType} from './../model/neighborhood';
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';
import ROLES from "../constante/roles";
import LOG_CONSTANTS from "../constante/log-constante";

class NeighborhoodRouter {

    static readonly errorMessage = `Certaines communes n'existent pas`;
    static readonly neighborhoodNotFound = `Cet commune n'existent pas`;

    public static readonly PAGINATION_VALIDATION = CONTROLLER_HELPERS.getPaginationInput(JOI.object({municipalityId: JOI.string().label("La municipality").regex(ROUTER_HELPER.mongoObjectRegEx).required()}).label("Le departement").required());
    public static readonly MANE_VALIDATION = JOI.string().trim().label("la nom du departement").optional();
    public static readonly REGION_VALIDATION = JOI.object({
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required()
    }).options({stripUnknown: true});


    private static readonly neighborhoodInput = {
        name: NeighborhoodRouter.MANE_VALIDATION,
        municipality: NeighborhoodRouter.REGION_VALIDATION,
    }

    private static readonly neighborhoodOutput: SchemaMap = {
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
        name: JOI.string().allow('', null).optional(),
        municipality: JOI.object({
            id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
            name: JOI.string().required(),
        }),
        createdAt: JOI.date(),
    };

    private static create: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({entity: NeighborhoodRouter.neighborhoodInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(NeighborhoodRouter.neighborhoodOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...NeighborhoodRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, NeighborhoodModel),
        ]
    });

    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: NeighborhoodRouter.neighborhoodInput,
                pagination: NeighborhoodRouter.PAGINATION_VALIDATION
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(NeighborhoodRouter.neighborhoodOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...NeighborhoodRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, NeighborhoodModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<NeighborhoodDocument, NeighborhoodType>(ctx, NeighborhoodModel, NEIGHBORHOOD_CONTROLLER.condition(ctx)),
        ]
    });

    private static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(NeighborhoodRouter.neighborhoodOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, NeighborhoodModel),
        ]
    });

    private static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: NeighborhoodRouter.neighborhoodInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(NeighborhoodRouter.neighborhoodOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...NeighborhoodRouter.updateValidation(),
            (ctx: ModifiedContext) => NEIGHBORHOOD_CONTROLLER.update(ctx),
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
                entity: NeighborhoodRouter.neighborhoodInput,
                pagination: NeighborhoodRouter.PAGINATION_VALIDATION
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(NeighborhoodRouter.neighborhoodOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...NeighborhoodRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, NeighborhoodModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<NeighborhoodDocument, NeighborhoodType>(ctx, NeighborhoodModel, NEIGHBORHOOD_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(NeighborhoodRouter.neighborhoodOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...NeighborhoodRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, NeighborhoodModel),
        ]
    })

    private static deleteAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({pagination: NeighborhoodRouter.PAGINATION_VALIDATION}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(NeighborhoodRouter.neighborhoodOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            ...NeighborhoodRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, NeighborhoodModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<NeighborhoodDocument, NeighborhoodType>(ctx, NeighborhoodModel, NEIGHBORHOOD_CONTROLLER.condition(ctx)),
        ]
    })

    private static all: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(NeighborhoodRouter.neighborhoodOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, NeighborhoodModel),
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
            ...NeighborhoodRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, NeighborhoodModel),
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
                pagination: NeighborhoodRouter.PAGINATION_VALIDATION
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(NeighborhoodRouter.neighborhoodOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            ...NeighborhoodRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, NeighborhoodModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<NeighborhoodDocument, NeighborhoodType>(ctx, NeighborhoodModel, NEIGHBORHOOD_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                pagination: NeighborhoodRouter.PAGINATION_VALIDATION,
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(NeighborhoodRouter.neighborhoodOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, NeighborhoodModel, NEIGHBORHOOD_CONTROLLER.condition(ctx)),
        ]
    });

    private static byMunicipality: Spec = ({
        method: ROUTER_HELPER.methods.GET,
        path: `/by-municipality/:id`,
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(NeighborhoodRouter.neighborhoodOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.search(ctx, NeighborhoodModel, {'municipality.id': ctx.request.params['id']}),
        ]
    });

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.create, [ROLES.ADD_NEIGHBORHOOD], LOG_CONSTANTS.ADD_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.createAndGet, [ROLES.ADD_NEIGHBORHOOD], LOG_CONSTANTS.ADD_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.update, [ROLES.EDIT_NEIGHBORHOOD], LOG_CONSTANTS.EDIT_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.updateAndGet, [ROLES.EDIT_NEIGHBORHOOD], LOG_CONSTANTS.EDIT_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.delete, [ROLES.DELETE_NEIGHBORHOOD], LOG_CONSTANTS.DELETE_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.deleteAndGet, [ROLES.DELETE_NEIGHBORHOOD], LOG_CONSTANTS.DELETE_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.deleteAll, [ROLES.DELETE_NEIGHBORHOOD], LOG_CONSTANTS.DELETE_MULTIPLE_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.deleteAllAndGet, [ROLES.DELETE_NEIGHBORHOOD], LOG_CONSTANTS.DELETE_MULTIPLE_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.read, [ROLES.READ_NEIGHBORHOOD, ROLES.DELETE_NEIGHBORHOOD, ROLES.ADD_NEIGHBORHOOD, ROLES.EDIT_NEIGHBORHOOD], LOG_CONSTANTS.READ_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.page, [ROLES.READ_NEIGHBORHOOD, ROLES.DELETE_NEIGHBORHOOD, ROLES.ADD_NEIGHBORHOOD, ROLES.EDIT_NEIGHBORHOOD], LOG_CONSTANTS.PAGE_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.all, [ROLES.READ_NEIGHBORHOOD, ROLES.DELETE_NEIGHBORHOOD, ROLES.ADD_NEIGHBORHOOD, ROLES.EDIT_NEIGHBORHOOD], LOG_CONSTANTS.LISTER_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(NeighborhoodRouter.byMunicipality, [ROLES.READ_NEIGHBORHOOD, ROLES.DELETE_NEIGHBORHOOD, ROLES.ADD_NEIGHBORHOOD, ROLES.EDIT_NEIGHBORHOOD], LOG_CONSTANTS.LISTER_NEIGHBORHOOD, RoutesPrefix.neighborhood, jwtMiddleware),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            // (ctx: ModifiedContext, next: Function) => NEIGHBORHOOD_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, NeighborhoodModel, '_id', ctx.request.body, ctx.request.body.length, NeighborhoodRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'neighborhood.id',
                ctx.request.body, size => `ces neighborhoods sont associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, NeighborhoodModel, '_id', [ctx.request.params['id']], 1, NeighborhoodRouter.neighborhoodNotFound),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'neighborhood.id',
                [ctx.request.params['id']], size => `ce commune est associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static createValidation(): Handler[] {
        return [
            NEIGHBORHOOD_CONTROLLER.beforeCreate,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, NeighborhoodModel, '_id', [ctx.request.params['id']], 1, NeighborhoodRouter.neighborhoodNotFound),
            NEIGHBORHOOD_CONTROLLER.beforeUpdate,
        ];
    }


}

export default NeighborhoodRouter;
