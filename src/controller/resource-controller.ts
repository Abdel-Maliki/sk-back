import {ModifiedContext, Responses} from './../types';

import ResourceModel, {ResourceDocument, ResourceType} from './../model/resource';
import UserModel from './../model/user';
import RegionModel from './../model/region';
import {ClientSession, startSession} from "mongoose";
import {RegionDocument} from "../model/region";


/**
 * @param name - A valid string that has already been validated by JOI
 * @param description - A valid string that has already been validated by JOI
 */
type InputCreateBodyType = { name: string, region: { id: string }, description: string };


class ResourceController {

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const totalExisting: number = await ResourceModel.countDocuments({name: body.name}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            return await ResourceController.regionValidation(ctx, next);
        } else {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        }
    };

    public static regionValidation = async (ctx: ModifiedContext, next: Function): Promise<any> => {

        const regionDocument: RegionDocument = await RegionModel.findById(ctx.request.body.region.id).exec().catch(() => null);

        if (regionDocument === null) {
            return ctx.answerUserError(400, "Cette region n'existe pas");
        } else {
            ctx.request.body.region = regionDocument.toNormalization();
            return await next();
        }
    }

    public static beforeUpdate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const resource: ResourceDocument = await ResourceModel.findOne({name: body.name}).catch(() => null);


        if (resource !== null && resource._id.toString() !== ctx.request.params['id'].toString()) {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        } else {
            return await ResourceController.regionValidation(ctx, next)
        }
    };

    public static update = async (ctx: ModifiedContext, next?: Function) => {
        const query: any = {$set: ctx.request.body};
        const session: ClientSession = await startSession();
        session.startTransaction();

        const updateResource: ResourceDocument | null = await ResourceModel
            .findByIdAndUpdate(ctx.request.params['id'], query, {new: true})
            .session(session).exec().catch(() => null);

        if (updateResource) {
            const response: ResourceType = updateResource.toNormalization();
            const resource = {resource: response}
            const users: any = await UserModel
                .updateMany({'resource.id': ctx.request.params['id']}, {$set: resource})
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
        return {};
    }
}

export default ResourceController;
