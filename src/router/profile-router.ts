import {Joi as JOI, Spec} from 'koa-joi-router';
import HELPER from './helper';
import PROFILE_CONTROLLER from '../controller/profile-controller';
import {ObjectSchema, SchemaMap} from "joi";


class ProfileRouter {

    static readonly baseRoute = "/profiles";

    public static readonly NAME_VALIDATION = JOI.string().max(HELPER.defaults.length).label("le nom du profile").required();
    public static readonly DESCRIPTION_VALIDATION = JOI.string().max(HELPER.defaults.length).label("la description du profile");


    private static readonly profileInput: ObjectSchema = JOI.object({
        name: ProfileRouter.NAME_VALIDATION,
        description: ProfileRouter.DESCRIPTION_VALIDATION,
    }).options({stripUnknown: true});

    private static readonly paginationInput: ObjectSchema = JOI.object({
        page: JOI.number().min(0).required(),
        size: JOI.number().min(1).required(),
        sort: JOI.string(),
        direction: JOI.number().equal([1, -1]),
        globalFilter: JOI.string(),
        filters: JOI.object(),
    }).options({stripUnknown: true});

    private static readonly profileOutput: SchemaMap = {
        id: JOI.string(),
        name: JOI.string(),
        description: JOI.string(),
        createdAt: JOI.date(),
        updatedAt: JOI.date(),
        createdBy: JOI.string(),
    };

    private static create: Spec = ({
        method: HELPER.methods.POST,
        path: ProfileRouter.baseRoute,
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: ProfileRouter.profileInput,
            output: HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [HELPER.validation, PROFILE_CONTROLLER.beforeCreate, PROFILE_CONTROLLER.create]
    });

    private static read: Spec = ({
        method: HELPER.methods.GET,
        path: ProfileRouter.baseRoute + '/:id',
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            output: HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [HELPER.validation, PROFILE_CONTROLLER.read]
    });

    private static update: Spec = ({
        method: HELPER.methods.PUT,
        path: ProfileRouter.baseRoute + '/:id',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: ProfileRouter.profileInput,
            output: HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [HELPER.validation, PROFILE_CONTROLLER.existeId, PROFILE_CONTROLLER.update]
    });

    private static delete: Spec = ({
        method: HELPER.methods.DELETE,
        path: ProfileRouter.baseRoute + '/:id',
        validate: {
            continueOnError: true,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            output: HELPER.defaultOutput(JOI.object(ProfileRouter.profileOutput))
        },
        handler: [HELPER.validation, PROFILE_CONTROLLER.existeId, PROFILE_CONTROLLER.delete]
    });

    private static all: Spec = ({
        method: HELPER.methods.GET,
        path: ProfileRouter.baseRoute + '/all',
        validate: {
            continueOnError: true,
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput))
        },
        handler: [
            HELPER.validation,
            //(ctx: ModifiedContext, next: Function)=> HELPER.validation2(ctx, next, 'role not found') ,
            PROFILE_CONTROLLER.all
        ]
    });

    private static deleteAll: Spec = ({
        method: HELPER.methods.PUT,
        path: ProfileRouter.baseRoute + '/delete/all',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.array().items(JOI.string().regex(HELPER.mongoObjectRegEx)).min(1),
            output: HELPER.defaultOutput(JOI.empty())
        },
        handler: [HELPER.validation, PROFILE_CONTROLLER.existeIds, PROFILE_CONTROLLER.deleteAll]
    });

    private static createAndGet: Spec = ({
        method: HELPER.methods.POST,
        path: ProfileRouter.baseRoute + '/create/and-get',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: JOI.object({entity: ProfileRouter.profileInput, pagination: ProfileRouter.paginationInput}),
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            HELPER.validation,
            PROFILE_CONTROLLER.beforeCreate,
            PROFILE_CONTROLLER.createAndNext,
            PROFILE_CONTROLLER.page
        ]
    });

    private static updateAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ProfileRouter.baseRoute + '/update/and-get/:id',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: JOI.object({entity: ProfileRouter.profileInput, pagination: ProfileRouter.paginationInput}),
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            HELPER.validation,
            PROFILE_CONTROLLER.existeId,
            PROFILE_CONTROLLER.updateAndNext,
            PROFILE_CONTROLLER.page
        ]
    });

    private static deleteAndGet: Spec = ({
        method: HELPER.methods.PUT,
        path: ProfileRouter.baseRoute + '/delete/and-get/:id',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({id: JOI.string().regex(HELPER.mongoObjectRegEx)}),
            body: ProfileRouter.paginationInput,
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [
            HELPER.validation,
            PROFILE_CONTROLLER.existeId,
            PROFILE_CONTROLLER.deleteAndNext,
            PROFILE_CONTROLLER.page
        ]
    });


    private static page: Spec = ({
        method: HELPER.methods.POST,
        path: ProfileRouter.baseRoute + '/page',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            body: ProfileRouter.paginationInput,
            output: HELPER.defaultOutput(JOI.array().items(ProfileRouter.profileOutput), true)
        },
        handler: [HELPER.validation, PROFILE_CONTROLLER.page]
    });

    public static specs: Spec[] = [
        ProfileRouter.create,
        ProfileRouter.read,
        ProfileRouter.update,
        ProfileRouter.delete,
        ProfileRouter.page,
        ProfileRouter.all,
        ProfileRouter.deleteAll,
        ProfileRouter.createAndGet,
        ProfileRouter.updateAndGet,
        ProfileRouter.deleteAndGet,
    ];

}

export default ProfileRouter;
