import ROUTER, {Joi as JOI, Spec} from 'koa-joi-router';
import HELPER from './helper';
import PROFILE_CONTROLLER from '../controller/profile-controller';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import LogModel from './../model/log';
import ROUTER_HELPER from "./router-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
 import ROLES from "../constante/roles";
import LOG_CONSTANTE from "../constante/log-constante";


class LogRouter {

    static readonly errorMessage = `Certaines logs n'existent pas`;


    public static readonly NAME_VALIDATION = JOI.string().trim().min(3).max(HELPER.defaults.length).label("le nom du profile").required();
    public static readonly DESCRIPTION_VALIDATION = JOI.string().trim().allow('', null).max(HELPER.defaults.length).label("la description du profile").optional();

    private static readonly readOutPut: SchemaMap = {
        id: JOI.string().regex(HELPER.mongoObjectRegEx).required(),
        action: JOI.string().optional().allow('', null),
        elementId: JOI.string().optional().allow('', null),
        state: JOI.string().required(),
        userName: JOI.string().optional().allow('', null),
        url: JOI.string().optional().allow('', null),
        method: JOI.string().optional().allow('', null),
        ipAddress: JOI.string().optional().allow('', null),
        userAgent: JOI.string().optional().allow('', null),
        code: JOI.number().optional().allow(null),
        time: JOI.number().optional().allow( null),
        host: JOI.string().optional().allow('', null),
        errorMessage: JOI.string().optional().allow('', null),
        createdAt: JOI.date(),
    };


    private static read: Spec = ({
        method: HELPER.methods.GET,
        path: ROUTER_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            output: HELPER.defaultOutput(JOI.object(LogRouter.readOutPut))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, LogModel),
        ]
    });

    private static delete: Spec = ({
        method: HELPER.methods.DELETE,
        path: ROUTER_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            output: HELPER.defaultOutput(JOI.object(LogRouter.readOutPut))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, LogModel),
        ]
    });

    private static deleteAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deleteAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: CONTROLLER_HELPERS.paginationInput,
            output: HELPER.defaultOutput(JOI.array().items(LogRouter.readOutPut), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, LogModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, LogModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static deleteAll: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deleteAllPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1),
            output: HELPER.defaultOutput(JOI.empty())
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, LogModel, '_id', ctx.request.body, ctx.request.body.length, LogRouter.errorMessage),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, LogModel),
        ]
    });

    private static deleteAllAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deleteAllAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({
                ids: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1),
                pagination: CONTROLLER_HELPERS.paginationInput
            }),
            output: HELPER.defaultOutput(JOI.array().items(LogRouter.readOutPut), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
             (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, LogModel, '_id', ctx.request.body, ctx.request.body.length, LogRouter.errorMessage),
             (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, LogModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, LogModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: CONTROLLER_HELPERS.paginationInput,
            output: HELPER.defaultOutput(JOI.array().items(LogRouter.readOutPut), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, LogModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static search: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.searchPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({global: JOI.string().optional()}),
            output: HELPER.defaultOutput(JOI.array().items(LogRouter.readOutPut))
        },

        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.search(ctx, LogModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
                CONTROLLER_HELPERS.buildRouter(LogRouter.delete, [ROLES.DELETE_LOG], LOG_CONSTANTE.DELETE_LOG, RoutesPrefix.log, jwtMiddleware),
                CONTROLLER_HELPERS.buildRouter(LogRouter.deleteAndGet, [ROLES.DELETE_LOG], LOG_CONSTANTE.DELETE_LOG, RoutesPrefix.log, jwtMiddleware),
                CONTROLLER_HELPERS.buildRouter(LogRouter.deleteAll, [ROLES.DELETE_LOG], LOG_CONSTANTE.DELETE_MULTIPLE_LOG, RoutesPrefix.log, jwtMiddleware),
                CONTROLLER_HELPERS.buildRouter(LogRouter.deleteAllAndGet, [ROLES.DELETE_LOG], LOG_CONSTANTE.DELETE_MULTIPLE_LOG, RoutesPrefix.log, jwtMiddleware),
                CONTROLLER_HELPERS.buildRouter(LogRouter.read, [ROLES.READ_LOG, ROLES.DELETE_LOG], LOG_CONSTANTE.READ_LOG, RoutesPrefix.log, jwtMiddleware),
                CONTROLLER_HELPERS.buildRouter(LogRouter.page, [ROLES.READ_LOG, ROLES.DELETE_LOG], LOG_CONSTANTE.PAGE_LOG, RoutesPrefix.log, jwtMiddleware),
                CONTROLLER_HELPERS.buildRouter(LogRouter.search, [ROLES.READ_LOG, ROLES.DELETE_LOG], LOG_CONSTANTE.FILTER_LOG, RoutesPrefix.log, jwtMiddleware),
            ];
    }

}

export default LogRouter;
