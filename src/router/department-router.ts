import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import DEPARTMENT_CONTROLLER from '../controller/department-controller';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import DepartmentModel, {DepartmentDocument, DepartmentType} from './../model/department';
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';
import ROLES from "../constante/roles";
import LOG_CONSTANTS from "../constante/log-constants";

class DepartmentRouter {

    static readonly errorMessage = `Certaines departements n'existent pas`;
    static readonly departmentNotFound = `Cet departement n'existent pas`;


    public static readonly PAGINATION_VALIDATION = CONTROLLER_HELPERS.getPaginationInput(JOI.object({regionId: JOI.string().label("La region").regex(ROUTER_HELPER.mongoObjectRegEx).required()}).label("La region").required());
    public static readonly MANE_VALIDATION = JOI.string().trim().label("la nom du departement").optional();
    public static readonly REGION_VALIDATION = JOI.object({
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required()
    }).options({stripUnknown: true});


    private static readonly departmentInput = {
        name: DepartmentRouter.MANE_VALIDATION,
        region: DepartmentRouter.REGION_VALIDATION,
    }

    private static readonly departmentOutput: SchemaMap = {
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
        name: JOI.string().allow('', null).optional(),
        region: JOI.object({
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
            body: JOI.object({entity: DepartmentRouter.departmentInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(DepartmentRouter.departmentOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...DepartmentRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, DepartmentModel),
        ]
    });

    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: DepartmentRouter.departmentInput,
                pagination: DepartmentRouter.PAGINATION_VALIDATION
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(DepartmentRouter.departmentOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...DepartmentRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, DepartmentModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<DepartmentDocument, DepartmentType>(ctx, DepartmentModel, DEPARTMENT_CONTROLLER.condition(ctx)),
        ]
    });

    private static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(DepartmentRouter.departmentOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, DepartmentModel),
        ]
    });

    private static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: DepartmentRouter.departmentInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(DepartmentRouter.departmentOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...DepartmentRouter.updateValidation(),
            (ctx: ModifiedContext) => DEPARTMENT_CONTROLLER.update(ctx),
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
                entity: DepartmentRouter.departmentInput,
                pagination: DepartmentRouter.PAGINATION_VALIDATION
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(DepartmentRouter.departmentOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...DepartmentRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, DepartmentModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<DepartmentDocument, DepartmentType>(ctx, DepartmentModel, DEPARTMENT_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(DepartmentRouter.departmentOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...DepartmentRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, DepartmentModel),
        ]
    })

    private static deleteAndGet: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({pagination: DepartmentRouter.PAGINATION_VALIDATION}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(DepartmentRouter.departmentOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            ...DepartmentRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, DepartmentModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<DepartmentDocument, DepartmentType>(ctx, DepartmentModel, DEPARTMENT_CONTROLLER.condition(ctx)),
        ]
    })

    private static all: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(DepartmentRouter.departmentOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, DepartmentModel),
        ]
    });

    private static byRegion: Spec = ({
        method: ROUTER_HELPER.methods.GET,
        path: `/by-region/:id`,
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(DepartmentRouter.departmentOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.search(ctx, DepartmentModel, {'region.id': ctx.request.params['id']}),
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
            ...DepartmentRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, DepartmentModel),
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
                pagination: DepartmentRouter.PAGINATION_VALIDATION
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(DepartmentRouter.departmentOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            ...DepartmentRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, DepartmentModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<DepartmentDocument, DepartmentType>(ctx, DepartmentModel, DEPARTMENT_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                pagination: DepartmentRouter.PAGINATION_VALIDATION,
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(DepartmentRouter.departmentOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, DepartmentModel, DEPARTMENT_CONTROLLER.condition(ctx)),
        ]
    });

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.create, [ROLES.ADD_DEPARTMENT], LOG_CONSTANTS.ADD_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.createAndGet, [ROLES.ADD_DEPARTMENT], LOG_CONSTANTS.ADD_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.update, [ROLES.EDIT_DEPARTMENT], LOG_CONSTANTS.EDIT_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.updateAndGet, [ROLES.EDIT_DEPARTMENT], LOG_CONSTANTS.EDIT_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.delete, [ROLES.DELETE_DEPARTMENT], LOG_CONSTANTS.DELETE_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.deleteAndGet, [ROLES.DELETE_DEPARTMENT], LOG_CONSTANTS.DELETE_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.deleteAll, [ROLES.DELETE_DEPARTMENT], LOG_CONSTANTS.DELETE_MULTIPLE_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.deleteAllAndGet, [ROLES.DELETE_DEPARTMENT], LOG_CONSTANTS.DELETE_MULTIPLE_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.read, [ROLES.READ_DEPARTMENT, ROLES.DELETE_DEPARTMENT, ROLES.ADD_DEPARTMENT, ROLES.EDIT_DEPARTMENT], LOG_CONSTANTS.READ_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.page, [ROLES.READ_DEPARTMENT, ROLES.DELETE_DEPARTMENT, ROLES.ADD_DEPARTMENT, ROLES.EDIT_DEPARTMENT], LOG_CONSTANTS.PAGE_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.all, [ROLES.READ_DEPARTMENT, ROLES.DELETE_DEPARTMENT, ROLES.ADD_DEPARTMENT, ROLES.EDIT_DEPARTMENT], LOG_CONSTANTS.LISTER_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(DepartmentRouter.byRegion, [ROLES.READ_DEPARTMENT, ROLES.DELETE_DEPARTMENT, ROLES.ADD_DEPARTMENT, ROLES.EDIT_DEPARTMENT], LOG_CONSTANTS.LISTER_DEPARTMENT, RoutesPrefix.department, jwtMiddleware),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            // (ctx: ModifiedContext, next: Function) => DEPARTMENT_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, DepartmentModel, '_id', ctx.request.body, ctx.request.body.length, DepartmentRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'department.id',
                ctx.request.body, size => `ces departments sont associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, DepartmentModel, '_id', [ctx.request.params['id']], 1, DepartmentRouter.departmentNotFound),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'department.id',
                [ctx.request.params['id']], size => `ce departement est associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static createValidation(): Handler[] {
        return [
            DEPARTMENT_CONTROLLER.beforeCreate,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, DepartmentModel, '_id', [ctx.request.params['id']], 1, DepartmentRouter.departmentNotFound),
            DEPARTMENT_CONTROLLER.beforeUpdate,
        ];
    }


}

export default DepartmentRouter;
