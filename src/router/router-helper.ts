import {Joi as JOI, OutputValidation} from 'koa-joi-router';
import {JoiObject, ObjectSchema, SchemaMap} from "joi";
import {MessageError, ModifiedContext} from "index";
import JoiMessageMapper from "../common/joi-message-mapper";
import ProjectConstantes from "../constante/project-constantes";

enum methods {
    POST = 'post',
    GET = 'get',
    DELETE = 'delete',
    PUT = 'put'
}

enum contentType {
    JSON = 'json'
}

type defaultObject = { length: number };

const defaults: defaultObject = {
    length: 255
};

class RouterHelper {
    public static defaults = defaults;
    public static methods = methods;
    public static contentType = contentType;
    public static mongoObjectRegEx = ProjectConstantes.mongoObjectRegEx;

    public static validation = async (ctx: ModifiedContext, next: Function) => {
        if (ctx.invalid) {
            let body: { details: Array<MessageError> } = ctx.invalid.body || ctx.invalid.query || ctx.invalid.params;
            let response: Array<MessageError | undefined | null> = body && body.details ? body.details : [];
            const message: any = (response.length > 0 && response[0].hasOwnProperty('context'))
                ? JoiMessageMapper.messageWrapper(response[0]) : response
            ctx.answerUserError(412, message)
        } else {
            return await next();
        }
    };

    public static validationErrorResponse() {
        return RouterHelper.errorResponse(412);
    };

    public static errorResponse(code: number) {
        return {
            [code]: {
                body: {
                    code,
                    error: JOI.object({
                        message: JOI.string()
                    })
                }
            }
        };
    };

    public static allErrorResponse() {
        return {
            '400-402,404-599': {
                body: {
                    code: JOI.number().min(400).max(599).required(),
                    error: JOI.object({
                        message: JOI.string()
                    })
                }
            },
            '403': {
                body: {
                    code: JOI.number().allow(403).required(),
                    error: JOI.object({
                        message: JOI.string()
                    }),
                    data: JOI.object({
                        user: JOI.object(RouterHelper.userOutput),
                        roles: JOI.array().items(JOI.string()).allow([]),
                    })
                }
            }
        };
    }

    public static readonly userOutput: SchemaMap = {
        id: JOI.string(),
        email: JOI.string(),
        name: JOI.string(),
        userName: JOI.string(),
        status: JOI.string(),
        createdAt: JOI.date(),
        profile: JOI.object({
            id: JOI.string().allow(''),
            name: JOI.string().allow(''),
            description: JOI.string().allow(''),
        })
    }

    public static successResponse<T = any>(code: number, data: T): { [status: string]: OutputValidation } {
        return {
            [code]: {
                body: {
                    code,
                    data,
                    PaginationDetails: JOI.object({
                        page: JOI.number().optional(),
                        size: JOI.number().optional(),
                        totalElements: JOI.number().optional()
                    }).optional(),
                }
            }
        };
    };

    public static allSuccessResponse<T extends JoiObject>(data: T, pagination = false): { [status: string]: OutputValidation } {
        return {

            '200-299': {
                body: JOI.object({
                    code: JOI.number().min(200).max(299).required(),
                    data,
                    pagination: pagination ? RouterHelper.paginationData().required() : RouterHelper.paginationData().optional(),
                }).options({stripUnknown: true})
            }
        };
    }

    public static paginationData<T = any>(): ObjectSchema {
        return JOI.object({
            page: JOI.number().required(),
            size: JOI.number().required(),
            sort: JOI.string().required(),
            direction: JOI.number().equal([1, -1]),
            totalElements: JOI.number().required(),
            globalFilter: JOI.string(),
            filters: JOI.object()
        });
    }

    public static defaultOutput<T extends JoiObject>(data: T, pagination = false): { [status: string]: OutputValidation } {

        return Object.assign({},
            RouterHelper.allErrorResponse(),
            RouterHelper.allSuccessResponse<T>(data, pagination),
        )
    }
}

export default RouterHelper;
