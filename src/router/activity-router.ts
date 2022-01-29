import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import ACTIVITY_CONTROLLER from '../controller/activity-controller';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import ActivityModel, {
    ActivityDocument,
    ActivityType
} from './../model/activity';
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';
import ROLES from "../constante/roles";
import LOG_CONSTANTS from "../constante/log-constants";


class ActivityRouter {

    static readonly errorMessage = `Certaines activités n'existent pas`;
    static readonly activityNotFound = `Ce activité n'existent pas`;

    public static readonly MANE_VALIDATION = JOI.string().trim().label("la nom du activité").optional();
    public static readonly BENEFICIARIES_VALIDATION = JOI.array().has({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}).optional();
    public static readonly RESOURCES_VALIDATION = JOI.array().has({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}).optional();
    public static readonly BEGIN_DATE_VALIDATION = JOI.date().required();
    public static readonly END_DATE_VALIDATION = JOI.date().required();
    public static readonly REGION_VALIDATION = JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}).optional();
    public static readonly DEPARTMENT_VALIDATION = JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}).optional();
    public static readonly MUNICIPALITY_VALIDATION = JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}).optional();
    public static readonly NEIGHBORHOOD_VALIDATION = JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}).optional();

    public static readonly ENTITY_VALIDATION = JOI.object({
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx),
        name: JOI.string().optional()
    }).allow(null).optional();

    private static readonly activityInput = {
        name: ActivityRouter.MANE_VALIDATION,
        beneficiaries: ActivityRouter.BENEFICIARIES_VALIDATION,
        resources: ActivityRouter.RESOURCES_VALIDATION,
        beginDate: ActivityRouter.BEGIN_DATE_VALIDATION,
        endDate: ActivityRouter.END_DATE_VALIDATION,
        region: ActivityRouter.REGION_VALIDATION,
        department: ActivityRouter.DEPARTMENT_VALIDATION,
        municipality: ActivityRouter.MUNICIPALITY_VALIDATION,
        neighborhood: ActivityRouter.NEIGHBORHOOD_VALIDATION,
    }


    private static readonly activityOutput: SchemaMap = {
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
        name: JOI.string().allow('', null).optional(),
        beneficiaries: JOI.array().allow([], null).optional(),
        resources: JOI.array().allow([], null).optional(),
        beginDate: JOI.date(),
        endDate: JOI.date(),
        region: ActivityRouter.ENTITY_VALIDATION,
        department: ActivityRouter.ENTITY_VALIDATION,
        municipality: ActivityRouter.ENTITY_VALIDATION,
        neighborhood: ActivityRouter.ENTITY_VALIDATION,
        createdAt: JOI.date(),
    };

    private static create: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({entity: ActivityRouter.activityInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ActivityRouter.activityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ActivityRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, ActivityModel),
        ]
    });

    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: ActivityRouter.activityInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ActivityRouter.activityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...ActivityRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, ActivityModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ActivityDocument, ActivityType>(ctx, ActivityModel, ACTIVITY_CONTROLLER.condition(ctx)),
        ]
    });

    private static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ActivityRouter.activityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, ActivityModel),
        ]
    });

    private static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: ActivityRouter.activityInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ActivityRouter.activityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ActivityRouter.updateValidation(),
            (ctx: ModifiedContext) => ACTIVITY_CONTROLLER.update(ctx),
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
                entity: ActivityRouter.activityInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ActivityRouter.activityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...ActivityRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, ActivityModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ActivityDocument, ActivityType>(ctx, ActivityModel, ACTIVITY_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(ActivityRouter.activityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...ActivityRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, ActivityModel),
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
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ActivityRouter.activityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            ...ActivityRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, ActivityModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ActivityDocument, ActivityType>(ctx, ActivityModel, ACTIVITY_CONTROLLER.condition(ctx)),
        ]
    })

    private static all: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ActivityRouter.activityOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, ActivityModel),
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
            ...ActivityRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, ActivityModel),
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
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ActivityRouter.activityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            ...ActivityRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, ActivityModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ActivityDocument, ActivityType>(ctx, ActivityModel, ACTIVITY_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({pagination: CONTROLLER_HELPERS.getPaginationInput()}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(ActivityRouter.activityOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, ActivityModel, ACTIVITY_CONTROLLER.condition(ctx)),
        ]
    });

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.create, [ROLES.ADD_ACTIVITY], LOG_CONSTANTS.ADD_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.createAndGet, [ROLES.ADD_ACTIVITY], LOG_CONSTANTS.ADD_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.update, [ROLES.EDIT_ACTIVITY], LOG_CONSTANTS.EDIT_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.updateAndGet, [ROLES.EDIT_ACTIVITY], LOG_CONSTANTS.EDIT_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.delete, [ROLES.DELETE_ACTIVITY], LOG_CONSTANTS.DELETE_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.deleteAndGet, [ROLES.DELETE_ACTIVITY], LOG_CONSTANTS.DELETE_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.deleteAll, [ROLES.DELETE_ACTIVITY], LOG_CONSTANTS.DELETE_MULTIPLE_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.deleteAllAndGet, [ROLES.DELETE_ACTIVITY], LOG_CONSTANTS.DELETE_MULTIPLE_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.read, [ROLES.READ_ACTIVITY, ROLES.DELETE_ACTIVITY, ROLES.ADD_ACTIVITY, ROLES.EDIT_ACTIVITY], LOG_CONSTANTS.READ_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.page, [ROLES.READ_ACTIVITY, ROLES.DELETE_ACTIVITY, ROLES.ADD_ACTIVITY, ROLES.EDIT_ACTIVITY], LOG_CONSTANTS.PAGE_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(ActivityRouter.all, [ROLES.READ_ACTIVITY, ROLES.DELETE_ACTIVITY, ROLES.ADD_ACTIVITY, ROLES.EDIT_ACTIVITY], LOG_CONSTANTS.LISTER_ACTIVITY, RoutesPrefix.activity, jwtMiddleware),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            // (ctx: ModifiedContext, next: Function) => ACTIVITY_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, ActivityModel, '_id', ctx.request.body, ctx.request.body.length, ActivityRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'activity.id',
                ctx.request.body, size => `ces activitys sont associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, ActivityModel, '_id', [ctx.request.params['id']], 1, ActivityRouter.activityNotFound),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'activity.id',
                [ctx.request.params['id']], size => `ce activity est associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static createValidation(): Handler[] {
        return [
            ACTIVITY_CONTROLLER.beforeCreate,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, ActivityModel, '_id', [ctx.request.params['id']], 1, ActivityRouter.activityNotFound),
            ACTIVITY_CONTROLLER.beforeUpdate,
        ];
    }

}

export default ActivityRouter;
