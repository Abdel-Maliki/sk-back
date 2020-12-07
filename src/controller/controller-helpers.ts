import {ClientSession, Document, Model, SaveOptions, startSession} from "mongoose";
import {Pagination} from "../common/pagination";
import {JwtFunctionResponse, ModifiedContext, Responses} from './../types';
import ProfileModel, {ProfileType} from "../model/profile";
import {DefaultUserCreator} from "../service/default-user-creator";
import {ObjectSchema} from "joi";
import ROUTER, {Joi as JOI, Spec} from "koa-joi-router";
import Roles from "../constante/roles";
import LogConstante from "../constante/log-constante";
import Middleware from "../middleware";
import BCRYPT from "bcrypt";
import UserModel from "../model/user";
const {env: ENV} = process;


/**
 * @author abdel-maliki
 * Date : 31/10/2020
 */

class ControllerHelpers {

    public static readonly paginationInput: ObjectSchema = JOI.object({
        page: JOI.number().min(0).required(),
        size: JOI.number().min(1).required(),
        sort: JOI.string(),
        direction: JOI.number().equal([1, -1]),
        globalFilter: JOI.string(),
        filters: JOI.object(),
    }).options({stripUnknown: true});

    public static getPaginationInput(filterSchema: ObjectSchema = JOI.object()): ObjectSchema{
        return JOI.object({
            page: JOI.number().min(0).required(),
            size: JOI.number().min(1).required(),
            sort: JOI.string(),
            direction: JOI.number().equal([1, -1]),
            globalFilter: JOI.string(),
            filters: filterSchema,
        }).options({stripUnknown: true});
    }

    public static async paginate<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        model: Model<MODEL>,
        pagination: Pagination,
        condition: any,
        defaultSort: string = 'createdAt'): Promise<{ body: DOCUMENT_TYPE[], pagination?: Pagination }> {

        const page = pagination.page > 0 ? pagination.page * pagination.size : 0;
        const sort = pagination.sort ? pagination.sort : defaultSort;
        const size = +pagination.size;
        const direction = pagination.direction ? pagination.direction : -1;

        const pageElements: MODEL[] | null = await
            model.find(condition).skip(page).limit(size).sort({[sort]: direction}).catch(() => null);

        const totalElements: number = await model.countDocuments(condition);
        const response: DOCUMENT_TYPE[] = pageElements.map(profile => profile.toNormalization());
        return {body: response, pagination: {page, size, sort, direction, totalElements}};
    }

    public static async page<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>,
        condition: any) {

        let newVar = await ControllerHelpers.paginate<MODEL, DOCUMENT_TYPE>(model, ctx.pagination, condition);

        if (newVar.body && newVar.body.length === 0 && newVar.pagination.totalElements > 0 && ctx.pagination.page > 0) {

            ctx.pagination.page = Math.ceil((newVar.pagination.totalElements / newVar.pagination.size) - 1);
            newVar = await ControllerHelpers.paginate<MODEL, DOCUMENT_TYPE>(model, ctx.pagination, condition);

            if (newVar.body) {
                return ctx.answerSuccess(200, newVar.body, newVar.pagination);
            } else {
                return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
            }
        } else if (newVar.body) {
            return ctx.answerSuccess(200, newVar.body, newVar.pagination);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async create<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>,
        options?: SaveOptions
    ) {
        const createProfile: MODEL | null = await model.create(ctx.request.body, options).catch(() => {
            return null;
        });
        if (createProfile) {
            let response: DOCUMENT_TYPE = createProfile.toNormalization();
            return ctx.answerSuccess(201, response);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async createAndNext<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function,
        model: Model<MODEL>,
        options?: SaveOptions
    ) {
        const createProfile: MODEL | null = await model.create(ctx.request.body, options).catch(() => null);
        if (createProfile) {
            await next();
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async update<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>,
        session?: ClientSession,
        options: any = {new: true}
    ) {
        const query: any = {$set: ctx.request.body};
        const updateProfile: MODEL | null = await model.findByIdAndUpdate(ctx.request.params['id'], query, options).session(session).exec().catch(() => null);

        if (updateProfile) {
            let response: DOCUMENT_TYPE = updateProfile.toNormalization();
            return ctx.answerSuccess(200, response);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    }

    public static async updateAndNext<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function,
        model: Model<MODEL>,
        session?: ClientSession,
        options: any = {new: true}
    ) {

        const update: any = {$set: ctx.request.body};
        const updateProfile: MODEL | null = await model.findByIdAndUpdate(
            ctx.request.params['id'], update, options
        ).session(session).exec().catch(() => null);

        if (updateProfile) {
            await next();
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    }

    public static async read<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>
    ) {
        const profile: MODEL | null = await model.findById(ctx.request.params['id']).exec().catch(() => null);

        if (profile) {
            let response: DOCUMENT_TYPE = profile.toNormalization();
            return ctx.answerSuccess(200, response);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async delete<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>,
        session?: ClientSession,
    ) {
        const profile: MODEL | null = await model.findByIdAndDelete(ctx.request.params['id']).session(session);
        if (profile) {
            let response: DOCUMENT_TYPE = profile.toNormalization();
            return ctx.answerSuccess(200, response);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async deleteAndNext<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function,
        model: Model<MODEL>,
        session?: ClientSession,
    ) {
        const data: MODEL | null = await model.findByIdAndDelete(ctx.request.params['id']).session(session);

        if (data) {
            return await next();
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async deleteAll<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>,
        next?: Function,
        session?: ClientSession,
    ) {
        const withSession: boolean = !!session
        let error: any = null;
        const body: string[] = ctx.request.body;
        if (!withSession) {
            session = await startSession();
            session.startTransaction();
        }

        const condition: any = {_id: {$in: body}};
        await model.deleteMany(condition).session(session).catch(err => error = err);

        if (error) {
            if (!withSession) await session.abortTransaction();
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else {
            if (!withSession) await session.commitTransaction();
            return !!next ? await next() : ctx.answerSuccess(200, {});
        }
    };

    public static async all<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>
    ) {
        const allrofiles: MODEL[] | null = await model.find({}).exec().catch(() => null);
        if (allrofiles) {
            let response: DOCUMENT_TYPE[] = allrofiles.map(profile => profile.toNormalization());
            return ctx.answerSuccess(200, response);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    }

    public static async existeValuesInKey<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function,
        model: Model<MODEL>,
        key: string,
        values: string[],
        requiredQuantity: number,
        errorMessage: string
    ) {
        const criteria: any = {[key]: {$in: values}};
        const totalExisting: number = await model.countDocuments(criteria).catch(() => {
            return -1;
        });

        if (totalExisting !== requiredQuantity) {
            return ctx.answerUserError(400, errorMessage);
        } else {
            await next();
        }
    };

    public static async existeValuesInKeyForUpdate<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function,
        model: Model<MODEL>,
        id: string,
        key: string,
        values: string[],
        requiredQuantity: number,
        errorMessage: string
    ) {
        const criteria: any = {[key]: {$in: values}};
        const documents: Document[] = await model.find(criteria).catch(() => null);

        if (!documents || documents.filter(value => value._id.toString() !== id.toString()).length > 0) {
            return ctx.answerUserError(400, errorMessage);
        } else {
            return await next();
        }
    };

    public static async checkRelation<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function,
        model: Model<MODEL>,
        key: string,
        values: string[],
        errorMessage: (totalExisting: number) => string
    ) {

        const criteria: any = {[key]: {$in: values}};
        const totalExisting: number = await model.countDocuments(criteria).catch(() => {
            return null;
        });

        if (totalExisting === null || totalExisting > 0) {
            return ctx.answerUserError(400, errorMessage(totalExisting));
        } else {
            await next();
        }
    };

    public static async search<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>,
        condition: any,
    ) {
        const allrofiles: MODEL[] | null = await model.find(condition)
            .catch(() => null);
        if (allrofiles) {
            let response: DOCUMENT_TYPE[] = allrofiles.map(profile => profile.toNormalization());
            return ctx.answerSuccess(200, response);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async dispatch(ctx: ModifiedContext, next: Function, dataName: string = 'entity') {
        console.log('Class: ControllerHelpers, Function: dispatch, Line 313 (): '
        , );
        const entity = ctx.request.body[dataName];
        ctx.pagination = ctx.request.body.pagination;
        ctx.request.body = entity;
        console.log('Class: ControllerHelpers, Function: dispatch, Line 318 (): '
        , );
        return await next();
    };

    public static async checkPassword(ctx: ModifiedContext, next: Function) {
        const isEquals = await BCRYPT.compare(ctx.request.body.others.password, ctx.state.password).catch(() => null);
        if (isEquals === true) return await next();
        else if (isEquals === false) {
            UserModel.findByIdAndUpdate(ctx.state.user.id, { $inc: { testAuthNumber : 1 }}).exec().then();
            return ctx.answerUserError(400, "Le mot de passe est incorrect");
        }
        console.log('Class: ControllerHelpers, Function: checkPassword, Line 330 (): '
        , );
        return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
    };

    public static async setPagination<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function
    ) {
        ctx.pagination = ctx.request.body.pagination;
        await next();
    }

    public static forbiddenError = async (ctx: ModifiedContext) => {
        if (ctx.state.user.profile.name === DefaultUserCreator.ADMIN_USERNAME) {
            return ctx.answerUserError(403, 'forbidden',{user: ctx.state.user, roles: Object.values(Roles)});
        } else {
            const profile: ProfileType = await ProfileModel
                .findOne({name: ctx.state.user.profile.name}, {roles: 1, _id: 0}).exec().catch(() => null);
            return ctx.answerUserError(403, 'forbidden',{user: ctx.state.user, roles: profile && profile.roles ? profile.roles : []});
        }
    }

    public static haseRoleMidleWare = async (ctx: ModifiedContext, next: Function, roles?: string[]) => {
        //const path = ctx.request.method + ctx.request.url.replace(/[a-f\d]{24}/gi, ':id');
        if (ctx.state.user.profile.name === DefaultUserCreator.ADMIN_USERNAME) return await next();
        const size: boolean = await ProfileModel.exists({
            name: ctx.state.user.profile.name, $or: roles.map(role => ({roles: {"$in": [role]}}))
        }).catch(() => null);
        if (size) {
            return await next();
        } else {
            return await ControllerHelpers.forbiddenError(ctx);
        }
    }

    public static haseRole = async (ctx: ModifiedContext, role: string): Promise<boolean> => {
        if (ctx.state.user.profile.name === DefaultUserCreator.ADMIN_USERNAME) return true;
        const size: number = await ProfileModel.countDocuments({
            name: ctx.state.user.profile.name,
            roles: {"$in": [role]}
        }).catch(() => null);
        return size && size > 0;
    }

    public static buildRouter = ( spec: Spec, roles: Roles[], log: LogConstante, prefix: string, jwtMiddleware: JwtFunctionResponse): ROUTER.Router => {
        const router = ROUTER();
        router.prefix(prefix);
        router.use(jwtMiddleware.authenticate);
        router.use((context, next) => Middleware.addLog(context, next, log));
        router.use((context, next) => Middleware.haseRoleMidleWare(context, next, roles));
        router.route(spec);
        return router;
    }
}

export default ControllerHelpers;
