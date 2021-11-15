import {ModifiedContext, Responses} from './../types';

import RegionModel, {RegionDocument, RegionType} from './../model/region';
import UserModel from './../model/user';
import {ClientSession, startSession} from "mongoose";


/**
 * @param name - A valid string that has already been validated by JOI
 * @param description - A valid string that has already been validated by JOI
 */
type InputCreateBodyType = { name: string, description: string };


class RegionController {

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const totalExisting: number = await RegionModel.countDocuments({name: body.name}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            return await next();
        } else {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        }
    };

    public static beforeUpdate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const region: RegionDocument = await RegionModel.findOne({name: body.name}).catch(() => null);


        if (region !== null && region._id.toString() !== ctx.request.params['id'].toString()) {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        } else {
            return await next();
        }
    };

    public static update = async (ctx: ModifiedContext, next?: Function) => {
        const query: any = {$set: ctx.request.body};
        const session: ClientSession = await startSession();
        session.startTransaction();

        const updateRegion: RegionDocument | null = await RegionModel
            .findByIdAndUpdate(ctx.request.params['id'], query, {new: true})
            .session(session).exec().catch(() => null);

        if (updateRegion) {
            const response: RegionType = updateRegion.toNormalization();
            const region = {region: response}
            const users: any = await UserModel
                .updateMany({'region.id': ctx.request.params['id']}, {$set: region})
                .session(session)
                .exec()
                .catch(() => null);

            if (users) {
                await session.commitTransaction();
                if (next) {
                    return await next();
                } else {
                    return ctx.answerSuccess(200, response);
                }
            }

        }
        await session.abortTransaction();
        return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);

    };

    public static condition(ctx: ModifiedContext): any {

        return ctx.pagination && ctx.pagination.filters && ctx.pagination.filters.value
            // ? {name: { $regex: '.*' + globalFilter + '.*' }}
            ? {
                $or: [
                    {name: {$regex: '.*' + ctx.pagination.filters.value + '.*', $options: 'i'}},
                    {description: {$regex: '.*' + ctx.pagination.filters.value + '.*', $options: 'i'}}
                ]
            }
            : {};
    }
}

export default RegionController;
