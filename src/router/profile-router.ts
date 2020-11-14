import ROUTER, {Joi as JOI, Router, Spec} from 'koa-joi-router';
import HELPER from './helper';
import PROFILE_CONTROLLER from '../controller/profile-controller';
import {ObjectSchema, SchemaMap} from "joi";
import CONTROLLER_HELPERS from "../controller/controller-helpers";
import {ModifiedContext} from "index";
import ProfileModel, {ProfileDocument, ProfileType} from './../model/profile';
import {DefaultUserCreator} from "../service/default-user-creator";
import ROUTER_HELPER from "./router-helper";
import {RoutesPrefix} from "../constante/routes-prefix";
import UserModel from './../model/user';


class ProfileRouter {

    static readonly errorMessage = `Certaines profiles n'existent pas`;


    public static readonly NAME_VALIDATION = JOI.string().trim().min(3).max(HELPER.defaults.length).label("le nom du profile").required();
    public static readonly DESCRIPTION_VALIDATION = JOI.string().trim().allow('', null).max(HELPER.defaults.length).label("la description du profile").optional();


    private static readonly profileInput: ObjectSchema = JOI.object({
        name: ProfileRouter.NAME_VALIDATION,
        description: ProfileRouter.DESCRIPTION_VALIDATION,
    }).options({stripUnknown: true});

    private static readonly createInput: ObjectSchema = JOI.object({
        name: ProfileRouter.NAME_VALIDATION.not(DefaultUserCreator.DEFAULT_PROFILE_NAME),
        description: ProfileRouter.DESCRIPTION_VALIDATION,
    }).options({stripUnknown: true});

    private static readonly profileOutput: SchemaMap = {
        id: JOI.string().regex(HELPER.mongoObjectRegEx).required(),
        name: JOI.string().required(),
        description: JOI.string().allow('', null).optional(),
        createdAt: JOI.date(),
    };

    private static create: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.createPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: ProfileRouter.createInput,
            output: HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [
            HELPER.validation,
            PROFILE_CONTROLLER.beforeCreate,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.create(ctx, ProfileModel),
        ]
    });

    private static read: Spec = ({
        method: HELPER.methods.GET,
        path: ROUTER_HELPER.readPath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            output: HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.read(ctx, ProfileModel),
        ]
    });

    private static update: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.updatePath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: ProfileRouter.profileInput,
            output: HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.checkNameAndDescription(ctx, next),
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifier"),
            (ctx: ModifiedContext) => PROFILE_CONTROLLER.update(ctx),
        ]
    });

    private static delete: Spec = ({
        method: HELPER.methods.DELETE,
        path: ROUTER_HELPER.deletePath(),
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            output: HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "supprimer"),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'profile.id',
                [ctx.request.params['id']], t => `ce profile est associé à ${t} utilisateur${t > 1 ? 's' : ''}`),
            PROFILE_CONTROLLER.beforeDelete,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.delete(ctx, ProfileModel),
        ]
    });

    private static all: Spec = ({
        method: HELPER.methods.GET,
        path: ROUTER_HELPER.allPath(),
        validate: {
            continueOnError: true,
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.all(ctx, ProfileModel),
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
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, ProfileModel, '_id', ctx.request.body, ctx.request.body.length, ProfileRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'profile.id',
                ctx.request.body, t => `ces profiles sont associé à ${t} utilisateur${t > 1 ? 's' : ''}`),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.deleteAll(ctx, ProfileModel),
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
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next, 'ids'),
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.ckeckAdminNotInList(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, ProfileModel, '_id', ctx.request.body, ctx.request.body.length, ProfileRouter.errorMessage),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.checkRelation(ctx, next, UserModel, 'profile.id',
                ctx.request.body, t => `ces profiles sont associé à ${t} utilisateur${t > 1 ? 's' : ''}`),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAll(ctx, ProfileModel, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ProfileDocument, ProfileType>(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static createAndGet: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.createAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({entity: ProfileRouter.createInput, pagination: CONTROLLER_HELPERS.paginationInput}),
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            PROFILE_CONTROLLER.beforeCreate,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.createAndNext(ctx, next, ProfileModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ProfileDocument, ProfileType>(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static updateAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.updateAndGetPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: ProfileRouter.profileInput, pagination: CONTROLLER_HELPERS.paginationInput}),
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.dispatch(ctx, next),
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.checkNameAndDescription(ctx, next),
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "modifier"),
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.update(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ProfileDocument, ProfileType>(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
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
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.ckeckExistingAndNotAdmin(ctx, next, "supprimer"),
            PROFILE_CONTROLLER.beforeDelete,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.deleteAndNext(ctx, next, ProfileModel),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page<ProfileDocument, ProfileType>(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });


    private static page: Spec = ({
        method: HELPER.methods.POST,
        path: ROUTER_HELPER.pagePath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: CONTROLLER_HELPERS.paginationInput,
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.setPagination(ctx, next),
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.page(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static search: Spec = ({
        method: HELPER.methods.PUT,
        path: ROUTER_HELPER.searchPath(),
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({global: JOI.string().optional()}),
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput))
        },

        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => CONTROLLER_HELPERS.search(ctx, ProfileModel, PROFILE_CONTROLLER.condition(ctx)),
        ]
    });

    private static getRoles: Spec = ({
        method: HELPER.methods.GET,
        path: `/roles/:id`,
        validate: {
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            continueOnError: true,
            output: HELPER.defaultOutput(JOI.array().items(JOI.string()))
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext) => PROFILE_CONTROLLER.roles(ctx),
        ]
    });


    private static setRoles: Spec = ({
        method: HELPER.methods.PUT,
        path: `/set-roles/:id`,
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: JOI.array().unique().items(JOI.string().required()).label("roles "),
            output: HELPER.defaultOutput(JOI.array().empty())
        },
        handler: [
            HELPER.validation,
            (ctx: ModifiedContext, next: Function) => PROFILE_CONTROLLER.validateRoles(ctx, next),
            (ctx: ModifiedContext, next: Function) => CONTROLLER_HELPERS.existeValuesInKey(ctx, next, ProfileModel,
                '_id', [ctx.request.params['id']], 1 ,`Le profile ${ctx.request.params['id']} n'existe pas`),
            (ctx: ModifiedContext) => PROFILE_CONTROLLER.setRoles(ctx),
        ]
    });

    public static routes(): Router {
        const router = ROUTER();
        router.prefix(RoutesPrefix.profile);
        router.route([
            ProfileRouter.create,
            ProfileRouter.read,
            ProfileRouter.update,
            ProfileRouter.delete,
            ProfileRouter.page,
            ProfileRouter.all,
            ProfileRouter.deleteAll,
            ProfileRouter.deleteAllAndGet,
            ProfileRouter.createAndGet,
            ProfileRouter.updateAndGet,
            ProfileRouter.deleteAndGet,
            ProfileRouter.search,
            ProfileRouter.getRoles,
            ProfileRouter.setRoles,
        ]);
        return router;
    }

}

export default ProfileRouter;
