import {ClientSession, Document, Model, SaveOptions, startSession} from "mongoose";
import {Pagination} from "../common/pagination";
import {ModifiedContext, Responses} from './../types';
import ProfileModel from "../model/profile";
import {DefaultUserCreator} from "../service/default-user-creator";
import ROUTEURS_ROLE from "../constante/routeurs-role";


/**
 * @author abdel-maliki
 * Date : 31/10/2020
 */

class ControllerHelpers {

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
                return ctx.answer(200, newVar.body, newVar.pagination);
            } else {
                return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
            }
        } else if (newVar.body) {
            return ctx.answer(200, newVar.body, newVar.pagination);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
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
            return ctx.answer(201, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
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
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
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
            return ctx.answer(200, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
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
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    }

    public static async read<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>
    ) {
        const profile: MODEL | null = await model.findById(ctx.request.params['id']);

        if (profile) {
            let response: DOCUMENT_TYPE = profile.toNormalization();
            return ctx.answer(200, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
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
            return ctx.answer(200, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async deleteAndNext<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function,
        model: Model<MODEL>,
        session?: ClientSession,
    ) {
        const profile: MODEL | null = await model.findByIdAndDelete(ctx.request.params['id']).session(session);

        if (profile) {
            await next();
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async deleteAll<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>,
        session?: ClientSession
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
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        } else {
            if (!withSession) await session.commitTransaction();
            return ctx.answer(200, {});
        }
    };

    public static async all<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        model: Model<MODEL>
    ) {
        const allrofiles: MODEL[] | null = await model.find({}).exec().catch(() => null);
        if (allrofiles) {
            let response: DOCUMENT_TYPE[] = allrofiles.map(profile => profile.toNormalization());
            return ctx.answer(200, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    }

    public static async existeId<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function,
        model: Model<MODEL>,
        id?: string
    ) {
        if (!id) id = ctx.request.params['id'];
        const totalExisting: number = await model.findById(id).catch(() => {
            return null;
        });

        if (totalExisting === null || totalExisting === 0) {
            return ctx.answer(400, `Le profile ${ctx.request.params['id']} n'existe pas`);
        } else {
            await next();
        }
    };

    public static async existeIds<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function,
        model: Model<MODEL>,
        errorMessage: string
    ) {

        const criteria: any = {_id: {$in: ctx.request.body}};
        const totalExisting: number = await model.countDocuments(criteria).catch(() => {
            return null;
        });

        if (totalExisting === null || totalExisting !== ctx.request.body.length) {
            return ctx.answer(400, errorMessage);
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
            return ctx.answer(200, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static async setBodyEndPagination<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function
    ) {
        const entity = ctx.request.body.entity;
        ctx.pagination = ctx.request.body.pagination;
        ctx.request.body = entity;
        await next();
    };

    public static async setPagination<MODEL extends Document & { toNormalization(): DOCUMENT_TYPE }, DOCUMENT_TYPE>(
        ctx: ModifiedContext,
        next: Function
    ) {

        ctx.pagination = ctx.request.body;
        await next();
    };

    public static haseRole = async (ctx: ModifiedContext, next: Function, role?: string) => {
        if (!role) role = new Map<string, string>(ROUTEURS_ROLE).get(ctx.request.method + ctx.request.url.replace(/[a-f\d]{24}/gi, ':id'));
        if (!role) return ctx.answer(403, "Forbidden");
        if (ctx.state.user.profile === DefaultUserCreator.DEFAULT_PROFILE_NAME) return await next();
        const size: number = await ProfileModel.countDocuments({
            name: ctx.state.user.profile,
            roles: {"$in": [role]}
        }).catch(() => null);
        if (size && size > 0) {
            return await next();
        } else {
            return ctx.answer(403, "Forbidden");
        }
    };
}

export default ControllerHelpers;
