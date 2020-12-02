import ROUTER, {Joi as JOI, Spec} from 'koa-joi-router';
import HELPER from './helper';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import LogModel from './../model/log';
import ROUTER_HELPER from "./router-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import ROLES from "../constante/roles";
import LOG_CONSTANTE from "../constante/log-constante";


class LogRouter {

    private static readonly ROLES_NOT_FOUND = `Certaines logs n'existent pas`;

    private static readonly pageOutput: SchemaMap = {
        id: JOI.string().regex(HELPER.mongoObjectRegEx).required(),
        action: JOI.string().optional().allow('', null),
        state: JOI.string().required(),
        userName: JOI.string().optional().allow('', null),
        code: JOI.number().optional().allow(null),
        errorMessage: JOI.string().optional().allow('', null),
        createdAt: JOI.date(),
    };

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
        time: JOI.number().optional().allow(null),
        host: JOI.string().optional().allow('', null),
        errorMessage: JOI.string().optional().allow('', null),
        serverError: JOI.string().optional().allow('', null),
        version: JOI.string().optional().allow('', null),
        createdAt: JOI.date(),
    };

    private static read: Spec = ({
        method: HELPER.methods.PUT,
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
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: JOI.object({others: JOI.object({password: JOI.string().required()})}),
            output: HELPER.defaultOutput(JOI.object(LogRouter.pageOutput)),
        },
        handler: [
            HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
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
            body: JOI.object({
                others: JOI.object({password: JOI.string().required()}),
                pagination: CONTROLLER_HELPERS.paginationInput
            }),
            output: HELPER.defaultOutput(JOI.array().items(LogRouter.pageOutput), true)
        },
        handler: [
            HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, LogModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, LogModel, LogRouter.condition(ctx)),
        ]
    });

    private static deleteAll: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.deleteAllPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({
                others: JOI.object({password: JOI.string().required()}),
                ids: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1)
            }),
            output: HELPER.defaultOutput(JOI.empty())
        },
        handler: [
            HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, LogModel, '_id', ctx.request.body, ctx.request.body.length, LogRouter.ROLES_NOT_FOUND),
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
                others: JOI.object({password: JOI.string().required()}),
                ids: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1),
                pagination: CONTROLLER_HELPERS.paginationInput,
            }),
            output: HELPER.defaultOutput(JOI.array().items(LogRouter.pageOutput), true)
        },
        handler: [
            HELPER.validation,
            CONTROLLER_HELPERS.checkPassword,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, LogModel, '_id', ctx.request.body, ctx.request.body.length, LogRouter.ROLES_NOT_FOUND),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, LogModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, LogModel, LogRouter.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({pagination: CONTROLLER_HELPERS.getPaginationInput()}),
            output: HELPER.defaultOutput(JOI.array().items(LogRouter.pageOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, LogModel, LogRouter.condition(ctx)),
        ]
    });

    public static condition(ctx: ModifiedContext): any {
        const filter: any = ctx.pagination.filters;
        if (!filter) return {};
        const cond: any = {createdAt: {}};

        if (filter.action && filter.action.length > 0) cond.action = {
            $regex: '.*' + filter.action + '.*',
            $options: 'i'
        };
        if (filter.errorMessage && filter.errorMessage.length > 0) cond.errorMessage = {
            $regex: '.*' + filter.errorMessage + '.*',
            $options: 'i'
        };

        if (filter.date && filter.date.length > 0 && filter.date[0]) {
            cond.createdAt.$gte = filter.date[0];
        }
        if (filter.date && filter.date.length > 1 && filter.date[1]) {
            cond.createdAt.$lt = new Date(new Date(filter.date[1]).getTime() + (24 * 60 * 60 * 1000));
        }
        if (filter.status) cond.state = filter.status;
        if (filter.codes && filter.codes.length && filter.codes.length > 0) cond.code = { $in: filter.codes}
        if (filter.username && filter.username.length && filter.username.length > 0) cond.userName = { $in: filter.username}
        if (!cond.createdAt.$gte) delete cond.createdAt;
        return cond;
    }

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(LogRouter.delete, [ROLES.DELETE_LOG], LOG_CONSTANTE.DELETE_LOG, RoutesPrefix.log, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(LogRouter.deleteAndGet, [ROLES.DELETE_LOG], LOG_CONSTANTE.DELETE_LOG, RoutesPrefix.log, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(LogRouter.deleteAll, [ROLES.DELETE_LOG], LOG_CONSTANTE.DELETE_MULTIPLE_LOG, RoutesPrefix.log, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(LogRouter.deleteAllAndGet, [ROLES.DELETE_LOG], LOG_CONSTANTE.DELETE_MULTIPLE_LOG, RoutesPrefix.log, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(LogRouter.read, [ROLES.READ_LOG, ROLES.DELETE_LOG], LOG_CONSTANTE.READ_LOG, RoutesPrefix.log, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(LogRouter.page, [ROLES.READ_LOG, ROLES.DELETE_LOG], LOG_CONSTANTE.PAGE_LOG, RoutesPrefix.log, jwtMiddleware),
        ];
    }

}

export default LogRouter;
