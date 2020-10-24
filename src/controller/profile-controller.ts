import {ModifiedContext, Responses} from './../types';

import ProfileModel, {ProfileDocument, ProfileType} from './../model/profile';
import {Document, Model, startSession} from "mongoose";
import {Pagination} from "../common/pagination";

/**
 * @param name - A valid string that has already been validated by JOI
 * @param description - A valid string that has already been validated by JOI
 */
type InputCreateBodyType = { name: string, description: string };

type InputCreateAndGetBodyType = { entity: InputCreateBodyType, pagination: Pagination };


class ProfileController {

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {

        const body: InputCreateBodyType = ctx.request.body;
        const totalExisting: number = await ProfileModel.countDocuments({name: body.name}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            await next();
        } else {
            return ctx.answer(400, `${body.name} existe déja`);
        }
    };

    public static existeId = async (ctx: ModifiedContext, next: Function) => {
        const totalExisting: number = await ProfileModel.findById(ctx.request.params['id']).catch(() => {
            return null;
        });

        if (totalExisting === null || totalExisting === 0) {
            return ctx.answer(400, `Le profile ${ctx.request.params['id']} n'existe pas`);
        } else {
            await next();
        }
    };

    public static existeIds = async (ctx: ModifiedContext, next: Function) => {
        const body: string[] = ctx.request.body;
        const totalExisting: number = await ProfileModel.countDocuments({_id: {$in: body}}).catch(() => {
            return null;
        });

        if (totalExisting === null || totalExisting !== body.length) {
            return ctx.answer(400, `Certaines profiles n'existent pas`);
        } else {
            await next();
        }
    };

    public static create = async (ctx: ModifiedContext) => {
        const body: InputCreateBodyType = ctx.request.body;
        const createProfile: ProfileDocument | null = await ProfileModel.create(body).catch(() => {
            return null;
        });
        if (createProfile) {
            let response: ProfileType = createProfile.toNormalization();
            return ctx.answer(201, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static read = async (ctx: ModifiedContext) => {
        const profile: ProfileDocument | null = await ProfileModel.findById(ctx.request.params['id']);

        if (profile) {
            let response: ProfileType = profile.toNormalization();
            return ctx.answer(200, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static update = async (ctx: ModifiedContext) => {

        const body: InputCreateBodyType = ctx.request.body;
        const updateProfile: ProfileDocument | null = await ProfileModel.findByIdAndUpdate(ctx.request.params['id'], {$set: body}, {new: true}).exec().catch(() => null);

        if (updateProfile) {
            let response: ProfileType = updateProfile.toNormalization();
            return ctx.answer(200, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static delete = async (ctx: ModifiedContext) => {
        const profile: ProfileDocument | null = await ProfileModel.findByIdAndDelete(ctx.request.params['id']);
        if (profile) {
            let response: ProfileType = profile.toNormalization();
            return ctx.answer(200, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static deleteAll = async (ctx: ModifiedContext) => {
        let error: any = null;
        const body: string[] = ctx.request.body;

        const session = await startSession();
        session.startTransaction();
        await ProfileModel.deleteMany({_id: {$in: body}}).session(session).catch(err => error = err);

        if (error) {
            await session.abortTransaction();
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        } else {
            await session.commitTransaction();
            return ctx.answer(200, {});
        }
    };

    public static all = async (ctx: ModifiedContext) => {

        const allrofiles: ProfileDocument[] | null = await ProfileModel.find({}).catch(() => null);

        if (allrofiles) {
            let response: ProfileType[] = allrofiles.map(profile => profile.toNormalization());
            return ctx.answer(200, response);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static createAndNext = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateAndGetBodyType = ctx.request.body;
        const createProfile: ProfileDocument | null = await ProfileModel.create(body.entity).catch(() => {
            return null;
        });
        if (createProfile) {
            ctx.request.body = body.pagination;
            await next();
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static updateAndNext = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateAndGetBodyType = ctx.request.body;
        const updateProfile: ProfileDocument | null = await ProfileModel.findByIdAndUpdate(ctx.request.params['id'], {$set: body.entity}, {new: true}).exec().catch(() => null);

        if (updateProfile) {
            ctx.request.body = body.pagination;
            await next();
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static deleteAndNext = async (ctx: ModifiedContext, next: Function) => {
        const profile: ProfileDocument | null = await ProfileModel.findByIdAndDelete(ctx.request.params['id']);

        if (profile) {
            await next();
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static condition(pagination: Pagination): any {
        const globalFilter = pagination.globalFilter;

        return globalFilter && globalFilter.length > 0
            // ? {name: { $regex: '.*' + globalFilter + '.*' }}
            ? {
                $or: [
                    {name: {$regex: '.*' + globalFilter + '.*', $options: 'i'}},
                    {description: {$regex: '.*' + globalFilter + '.*', $options: 'i'}}
                ]
            }
            : {};
    }

    public static async paginate<T extends Document & { toNormalization(): R }, R>(model: Model<T>, pagination: Pagination): Promise<{ body: R[], pagination?: Pagination }> {
        const page = pagination.page > 0 ? pagination.page * pagination.size : 0;
        const sort = pagination.sort ? pagination.sort : 'name';
        const size = +pagination.size;
        const direction = pagination.direction ? pagination.direction : -1;
        const condition = ProfileController.condition(pagination)

        const pageElements: T[] | null = await
            model
                .find(condition)
                .skip(page)
                .limit(size)
                .sort({[sort]: direction})
                .catch(() => null);

        const totalElements: number = await ProfileModel.countDocuments(condition);
        const response: R[] = pageElements.map(profile => profile.toNormalization());
        return {body: response, pagination: {page, size, sort, direction, totalElements}};
    }


    public static page = async (ctx: ModifiedContext) => {
        let newVar = await ProfileController.paginate<ProfileDocument, ProfileType>(ProfileModel, ctx.request.body);

        if (newVar.body && newVar.body.length === 0 && newVar.pagination.totalElements > 0 && ctx.request.body.page > 0) {
            ctx.request.body.page = Math.ceil((newVar.pagination.totalElements / newVar.pagination.size) - 1);
            newVar = await ProfileController.paginate<ProfileDocument, ProfileType>(ProfileModel, ctx.request.body);
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
}

export default ProfileController;
