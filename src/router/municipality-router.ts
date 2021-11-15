import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import MUNICIPALITY_CONTROLLER from '../controller/municipality-controller';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import MunicipalityModel, {MunicipalityDocument, MunicipalityType} from './../model/municipality';
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';
import ROLES from "../constante/roles";
import LOG_CONSTANTS from "../constante/log-constante";

class MunicipalityRouter {

    static readonly errorMessage = `Certaines communes n'existent pas`;
    static readonly municipalityNotFound = `Cet commune n'existent pas`;

    public static readonly PAGINATION_VALIDATION = CONTROLLER_HELPERS.getPaginationInput(JOI.object({departmentId: JOI.string().label("La department").regex(ROUTER_HELPER.mongoObjectRegEx).required()}).label("Le departement").required());
    public static readonly MANE_VALIDATION = JOI.string().trim().label("la nom du departement").optional();
    public static readonly REGION_VALIDATION = JOI.object({
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required()
    }).options({stripUnknown: true});


    private static readonly municipalityInput = {
        name: MunicipalityRouter.MANE_VALIDATION,
        department: MunicipalityRouter.REGION_VALIDATION,
    }

    private static readonly municipalityOutput: SchemaMap = {
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
        name: JOI.string().allow('', null).optional(),
        department: JOI.object({
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
            body: JOI.object({entity: MunicipalityRouter.municipalityInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(MunicipalityRouter.municipalityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...MunicipalityRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, MunicipalityModel),
        ]
    });

    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: MunicipalityRouter.municipalityInput,
                pagination: MunicipalityRouter.PAGINATION_VALIDATION
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(MunicipalityRouter.municipalityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...MunicipalityRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, MunicipalityModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<MunicipalityDocument, MunicipalityType>(ctx, MunicipalityModel, MUNICIPALITY_CONTROLLER.condition(ctx)),
        ]
    });

    private static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(MunicipalityRouter.municipalityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, MunicipalityModel),
        ]
    });

    private static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: MunicipalityRouter.municipalityInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(MunicipalityRouter.municipalityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...MunicipalityRouter.updateValidation(),
            (ctx: ModifiedContext) => MUNICIPALITY_CONTROLLER.update(ctx),
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
                entity: MunicipalityRouter.municipalityInput,
                pagination: MunicipalityRouter.PAGINATION_VALIDATION
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(MunicipalityRouter.municipalityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...MunicipalityRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, MunicipalityModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<MunicipalityDocument, MunicipalityType>(ctx, MunicipalityModel, MUNICIPALITY_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(MunicipalityRouter.municipalityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...MunicipalityRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, MunicipalityModel),
        ]
    })

    private static deleteAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({pagination: MunicipalityRouter.PAGINATION_VALIDATION}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(MunicipalityRouter.municipalityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            ...MunicipalityRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, MunicipalityModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<MunicipalityDocument, MunicipalityType>(ctx, MunicipalityModel, MUNICIPALITY_CONTROLLER.condition(ctx)),
        ]
    })

    private static all: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(MunicipalityRouter.municipalityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, MunicipalityModel),
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
            ...MunicipalityRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, MunicipalityModel),
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
                pagination: MunicipalityRouter.PAGINATION_VALIDATION
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(MunicipalityRouter.municipalityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            ...MunicipalityRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, MunicipalityModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<MunicipalityDocument, MunicipalityType>(ctx, MunicipalityModel, MUNICIPALITY_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                pagination: MunicipalityRouter.PAGINATION_VALIDATION,
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(MunicipalityRouter.municipalityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, MunicipalityModel, MUNICIPALITY_CONTROLLER.condition(ctx)),
        ]
    });

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.create, [ROLES.ADD_MUNICIPALITY], LOG_CONSTANTS.ADD_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.createAndGet, [ROLES.ADD_MUNICIPALITY], LOG_CONSTANTS.ADD_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.update, [ROLES.EDIT_MUNICIPALITY], LOG_CONSTANTS.EDIT_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.updateAndGet, [ROLES.EDIT_MUNICIPALITY], LOG_CONSTANTS.EDIT_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.delete, [ROLES.DELETE_MUNICIPALITY], LOG_CONSTANTS.DELETE_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.deleteAndGet, [ROLES.DELETE_MUNICIPALITY], LOG_CONSTANTS.DELETE_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.deleteAll, [ROLES.DELETE_MUNICIPALITY], LOG_CONSTANTS.DELETE_MULTIPLE_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.deleteAllAndGet, [ROLES.DELETE_MUNICIPALITY], LOG_CONSTANTS.DELETE_MULTIPLE_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.read, [ROLES.READ_MUNICIPALITY, ROLES.DELETE_MUNICIPALITY, ROLES.ADD_MUNICIPALITY, ROLES.EDIT_MUNICIPALITY], LOG_CONSTANTS.READ_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.page, [ROLES.READ_MUNICIPALITY, ROLES.DELETE_MUNICIPALITY, ROLES.ADD_MUNICIPALITY, ROLES.EDIT_MUNICIPALITY], LOG_CONSTANTS.PAGE_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(MunicipalityRouter.all, [ROLES.READ_MUNICIPALITY, ROLES.DELETE_MUNICIPALITY, ROLES.ADD_MUNICIPALITY, ROLES.EDIT_MUNICIPALITY], LOG_CONSTANTS.LISTER_MUNICIPALITY, RoutesPrefix.municipality, jwtMiddleware),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            // (ctx: ModifiedContext, next: Function) => MUNICIPALITY_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, MunicipalityModel, '_id', ctx.request.body, ctx.request.body.length, MunicipalityRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'municipality.id',
                ctx.request.body, size => `ces municipalitys sont associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, MunicipalityModel, '_id', [ctx.request.params['id']], 1, MunicipalityRouter.municipalityNotFound),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'municipality.id',
                [ctx.request.params['id']], size => `ce commune est associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static createValidation(): Handler[] {
        return [
            MUNICIPALITY_CONTROLLER.beforeCreate,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, MunicipalityModel, '_id', [ctx.request.params['id']], 1, MunicipalityRouter.municipalityNotFound),
            MUNICIPALITY_CONTROLLER.beforeUpdate,
        ];
    }


}

export default MunicipalityRouter;
