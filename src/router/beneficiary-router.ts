import ROUTER, {Handler, Joi as JOI, Spec} from 'koa-joi-router';
import ROUTER_HELPER from './router-helper';
import BENEFICIARY_CONTROLLER from '../controller/beneficiary-controller';
import {SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {JwtFunctionResponse, ModifiedContext} from "index";
import BeneficiaryModel, {
    BeneficiaryDocument,
    BeneficiaryEducationalLevel, BeneficiaryStatus,
    BeneficiaryType
} from './../model/beneficiary';
import ROUTE_PATH_HELPER from "./route-path-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';
import ROLES from "../constante/roles";
import LOG_CONSTANTS from "../constante/log-constants";


class BeneficiaryRouter {

    static readonly errorMessage = `Certaines bénéficiaires n'existent pas`;
    static readonly beneficiaryNotFound = `Ce bénéficiaire n'existent pas`;

    public static readonly AGE_VALIDATION = JOI.number().min(1).label("l'age du bénéficiaire").required();
    public static readonly SEX_VALIDATION = JOI.string().trim().valid('M', 'F').label("la sexe du bénéficiaire").optional();
    public static readonly MANE_VALIDATION = JOI.string().trim().label("la nom du bénéficiaire").optional();
    public static readonly STATUS_VALIDATION = JOI.string().trim().valid(Object.keys(BeneficiaryStatus)).label("le status du bénéficiaire").optional();
    public static readonly EDUCATION_LEVEL_VALIDATION = JOI.string().trim().valid(Object.keys(BeneficiaryEducationalLevel)).label("le Niveau d'éducation ").optional();
    public static readonly TEL_VALIDATION = JOI.string().trim().allow('', null).max(ROUTER_HELPER.defaults.length).label("le numéro de téléphone de l'beneficiary").optional();
    public static readonly HANDICAP_VALIDATION = JOI.bool().default(false).label("l'adresse email de l'beneficiary").optional();

    private static readonly beneficiaryInput = {
        name: BeneficiaryRouter.MANE_VALIDATION,
        age: BeneficiaryRouter.AGE_VALIDATION,
        sex: BeneficiaryRouter.SEX_VALIDATION,
        status: BeneficiaryRouter.STATUS_VALIDATION,
        educationalLevel: BeneficiaryRouter.EDUCATION_LEVEL_VALIDATION,
        handicapped: BeneficiaryRouter.HANDICAP_VALIDATION,
        tel: BeneficiaryRouter.TEL_VALIDATION,
    }


    private static readonly beneficiaryOutput: SchemaMap = {
        id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx).required(),
        age: JOI.number().required(),
        name: JOI.string().allow('', null).optional(),
        sex: JOI.string().allow('', null).optional(),
        status: JOI.string().allow('', null).optional(),
        educationalLevel: JOI.string().allow('', null).optional(),
        handicapped: JOI.bool().allow('', null).optional(),
        tel: JOI.string().allow('', null).optional(),
        createdAt: JOI.date(),
    };

    private static create: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({entity: BeneficiaryRouter.beneficiaryInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(BeneficiaryRouter.beneficiaryOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...BeneficiaryRouter.createValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, BeneficiaryModel),
        ]
    });

    private static createAndGet: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({
                entity: BeneficiaryRouter.beneficiaryInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(BeneficiaryRouter.beneficiaryOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...BeneficiaryRouter.createValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, BeneficiaryModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<BeneficiaryDocument, BeneficiaryType>(ctx, BeneficiaryModel, BENEFICIARY_CONTROLLER.condition(ctx)),
        ]
    });

    private static read: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(BeneficiaryRouter.beneficiaryOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, BeneficiaryModel),
        ]
    });

    private static update: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: BeneficiaryRouter.beneficiaryInput}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(BeneficiaryRouter.beneficiaryOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...BeneficiaryRouter.updateValidation(),
            (ctx: ModifiedContext) => BENEFICIARY_CONTROLLER.update(ctx),
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
                entity: BeneficiaryRouter.beneficiaryInput,
                pagination: CONTROLLER_HELPERS.paginationInput
            }).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(BeneficiaryRouter.beneficiaryOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            ...BeneficiaryRouter.updateValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.updateAndNext(ctx, next, BeneficiaryModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<BeneficiaryDocument, BeneficiaryType>(ctx, BeneficiaryModel, BENEFICIARY_CONTROLLER.condition(ctx)),
        ]
    })

    private static delete: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(ROUTER_HELPER.mongoObjectRegEx)}),
            output: ROUTER_HELPER.defaultOutput(JOI.object(BeneficiaryRouter.beneficiaryOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            ...BeneficiaryRouter.deleteValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, BeneficiaryModel),
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
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(BeneficiaryRouter.beneficiaryOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            ...BeneficiaryRouter.deleteValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, BeneficiaryModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<BeneficiaryDocument, BeneficiaryType>(ctx, BeneficiaryModel, BENEFICIARY_CONTROLLER.condition(ctx)),
        ]
    })

    private static all: Spec = ({
        method: ROUTER_HELPER.methods.PUT,
        path: ROUTE_PATH_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(BeneficiaryRouter.beneficiaryOutput))
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, BeneficiaryModel),
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
            ...BeneficiaryRouter.deleteAllValidation(),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, BeneficiaryModel),
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
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(BeneficiaryRouter.beneficiaryOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            ...BeneficiaryRouter.deleteAllValidation(),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, BeneficiaryModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<BeneficiaryDocument, BeneficiaryType>(ctx, BeneficiaryModel, BENEFICIARY_CONTROLLER.condition(ctx)),
        ]
    });

    private static page: Spec = ({
        method: ROUTER_HELPER.methods.POST,
        path: ROUTE_PATH_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: ROUTER_HELPER.contentType.JSON,
            body: JOI.object({pagination: CONTROLLER_HELPERS.getPaginationInput()}).options({stripUnknown: true}),
            output: ROUTER_HELPER.defaultOutput(JOI.array().items(BeneficiaryRouter.beneficiaryOutput), true)
        },
        handler: [
            ROUTER_HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, BeneficiaryModel, BENEFICIARY_CONTROLLER.condition(ctx)),
        ]
    });

    public static routes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[] {
        return [
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.create, [ROLES.ADD_BENEFICIARY], LOG_CONSTANTS.ADD_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.createAndGet, [ROLES.ADD_BENEFICIARY], LOG_CONSTANTS.ADD_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.update, [ROLES.EDIT_BENEFICIARY], LOG_CONSTANTS.EDIT_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.updateAndGet, [ROLES.EDIT_BENEFICIARY], LOG_CONSTANTS.EDIT_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.delete, [ROLES.DELETE_BENEFICIARY], LOG_CONSTANTS.DELETE_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.deleteAndGet, [ROLES.DELETE_BENEFICIARY], LOG_CONSTANTS.DELETE_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.deleteAll, [ROLES.DELETE_BENEFICIARY], LOG_CONSTANTS.DELETE_MULTIPLE_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.deleteAllAndGet, [ROLES.DELETE_BENEFICIARY], LOG_CONSTANTS.DELETE_MULTIPLE_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.read, [ROLES.READ_BENEFICIARY, ROLES.DELETE_BENEFICIARY, ROLES.ADD_BENEFICIARY, ROLES.EDIT_BENEFICIARY], LOG_CONSTANTS.READ_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.page, [ROLES.READ_BENEFICIARY, ROLES.DELETE_BENEFICIARY, ROLES.ADD_BENEFICIARY, ROLES.EDIT_BENEFICIARY], LOG_CONSTANTS.PAGE_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
            CONTROLLER_HELPERS.buildRouter(BeneficiaryRouter.all, [ROLES.READ_BENEFICIARY, ROLES.DELETE_BENEFICIARY, ROLES.ADD_BENEFICIARY, ROLES.EDIT_BENEFICIARY], LOG_CONSTANTS.LISTER_BENEFICIARY, RoutesPrefix.beneficiary, jwtMiddleware),
        ];
    }

    private static deleteAllValidation(): Handler[] {
        return [
            // (ctx: ModifiedContext, next: Function) => BENEFICIARY_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, BeneficiaryModel, '_id', ctx.request.body, ctx.request.body.length, BeneficiaryRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'beneficiary.id',
                ctx.request.body, size => `ces beneficiarys sont associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static deleteValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, BeneficiaryModel, '_id', [ctx.request.params['id']], 1, BeneficiaryRouter.beneficiaryNotFound),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'beneficiary.id',
                [ctx.request.params['id']], size => `ce beneficiary est associé à ${size} utilisateur${size > 1 ? 's' : ''}`),
        ];
    }

    private static createValidation(): Handler[] {
        return [
            BENEFICIARY_CONTROLLER.beforeCreate,
        ];
    }

    private static updateValidation(): Handler[] {
        return [
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existValuesInKey(ctx, next, BeneficiaryModel, '_id', [ctx.request.params['id']], 1, BeneficiaryRouter.beneficiaryNotFound),
            BENEFICIARY_CONTROLLER.beforeUpdate,
        ];
    }


}

export default BeneficiaryRouter;
