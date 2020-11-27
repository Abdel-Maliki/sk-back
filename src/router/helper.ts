import {Joi as JOI, OutputValidation} from 'koa-joi-router';
import {JoiObject, ObjectSchema, SchemaMap} from "joi";
import {MessageError, ModifiedContext} from "index";
import UserRouter from "./user";

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

class Helper {
    public static defaults = defaults;
    public static methods = methods;
    public static contentType = contentType;
    public static mongoObjectRegEx = /^[a-f\d]{24}$/i;

    public static validation = async (ctx: ModifiedContext, next: Function) => {
        new Map([['lll', 'lll'], ['lll', 'lll']]);
        if (ctx.invalid) {
            let body: { details: Array<MessageError> } = ctx.invalid.body || ctx.invalid.query || ctx.invalid.params;
            let response: Array<MessageError | undefined | null> = body && body.details ? body.details : [];
            const message: any = (response.length > 0 && response[0].hasOwnProperty('context'))
                ? Helper.messageWrapper(response[0]) : response
            ctx.answer(412, message)
        } else {
            return await next();
        }
    };

    public static numberMessageWrapper(messageError: MessageError) {
        return (messageError.type === 'number.max')
            ? `${messageError.context.label} doit être inférieur ou égal à ${messageError.context.limit}`
            : (messageError.type === 'number.min')
                ? `${messageError.context.label} doit être supérieur ou égal à ${messageError.context.limit}`
                : (messageError.type === 'number.base')
                    ? `${messageError.context.label} doit être un nombre`
                    : (messageError.type === 'number.integer')
                        ? `${messageError.context.label} doit être un entier`
                        : (messageError.type === 'number.negative')
                            ? `${messageError.context.label} doit être un nombre négatif`
                            : (messageError.type === 'number.positive')
                                ? `${messageError.context.label} doit être un nombre positif`
                                : `${messageError.context.label} invalid`


        /*if (messageError.type.includes('max'))
            return `La taille maximale pour ${messageError.context.label} est ${messageError.context.limit}`*/
    };

    public static stringMessageWrapper(messageError: MessageError) {
        return (messageError.type === 'string.max')
            ? `${messageError.context.label} la longueur doit être inférieure ou égale à ${messageError.context.limit} caractère`
            : (messageError.type === 'string.min')
                ? `${messageError.context.label} la longueur doit être d'au moins ${messageError.context.limit} caractères`
                : (messageError.type === 'string.base')
                    ? `${messageError.context.label} doit être un text`
                    : (messageError.type === 'string.email')
                        ? `${messageError.context.label} doit être un email valide`
                        : (messageError.type === 'string.alphanum')
                            ? `${messageError.context.label} ne doit contenir que des caractères alphanumériques`
                            : (messageError.type === 'string.creditCard')
                                ? `${messageError.context.label} doit être une carte de crédit`
                                : (messageError.type === 'string.base64')
                                    ? `${messageError.context.label} doit être une chaîne base64 valide`
                                    : (messageError.type === 'string.guid')
                                        ? `${messageError.context.label} doit être un GUID valide`
                                        : (messageError.type === 'string.dataUri')
                                            ? `${messageError.context.label} doit être un schéma d'URI valide`
                                            : (messageError.type === 'string.hex')
                                                ? `${messageError.context.label} ne doit contenir que des caractères hexadécimaux`
                                                : (messageError.type === 'string.isoDate')
                                                    ? `${messageError.context.label} doit être une date ISO 8601 valide`
                                                    : (messageError.type === 'string.hostname')
                                                        ? `${messageError.context.label} doit être un hostname`
                                                        : (messageError.type === 'string.token')
                                                            ? `${messageError.context.label} ne doit contenir que des caractères alphanumériques et des traits de soulignement`
                                                            : (messageError.type === 'string.uri')
                                                                ? `${messageError.context.label} doit être un uri valide`
                                                                : (messageError.type === 'string.ip')
                                                                    ? `${messageError.context.label} doit être une adresse IP valide avec un CIDR facultatif`
                                                                    : `${messageError.context.label} invalid`


        /*if (messageError.type.includes('max'))
            return `La taille maximale pour ${messageError.context.label} est ${messageError.context.limit}`*/
    };

    public static messageWrapper(messageError: MessageError) {
        console.log('Class: Helper, Function: messageWrapper, Line 109 , messageError: '
            , messageError);

        return (messageError.type.includes('required'))
            ? `${messageError.context.label} est requis${messageError.context.label.toLowerCase().startsWith('la') ? 'e' : ''}`
            : messageError.type.startsWith('number')
                ? Helper.numberMessageWrapper(messageError)
                : messageError.type.startsWith('string')
                    ? Helper.stringMessageWrapper(messageError)
                    : (messageError.type.endsWith('empty'))
                        ? `${messageError.context.label} n'est pas autorisé à être vide`
                        : messageError.type.includes('unique')
                            ? `${messageError.context.label} doit être unique`
                            : `${messageError.context.label} invalid`

        /*if (messageError.type.includes('max'))
            return `La taille maximale pour ${messageError.context.label} est ${messageError.context.limit}`*/
    };

    public static validationErrorResponse() {
        return Helper.errorResponse(412);
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
                        user: JOI.object(Helper.userOutput),
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
                    pagination: pagination ? Helper.paginationData().required() : Helper.paginationData().optional(),
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
            Helper.allErrorResponse(),
            Helper.allSuccessResponse<T>(data, pagination),
        )
    }
}

export default Helper;
