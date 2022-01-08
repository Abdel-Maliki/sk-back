import {ModifiedContext, Responses} from './../types';

import NeighborhoodModel, {NeighborhoodDocument, NeighborhoodType} from './../model/neighborhood';
import UserModel from './../model/user';
import MunicipalityModel from './../model/municipality';
import {ClientSession, startSession} from "mongoose";
import {MunicipalityDocument} from "../model/municipality";


/**
 * @param name - A valid string that has already been validated by JOI
 * @param description - A valid string that has already been validated by JOI
 */
type InputCreateBodyType = { name: string, municipality: { id: string }, description: string };


class NeighborhoodController {

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const totalExisting: number = await NeighborhoodModel.countDocuments({name: body.name}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            return await NeighborhoodController.municipalityValidation(ctx, next);
        } else {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        }
    };

    public static municipalityValidation = async (ctx: ModifiedContext, next: Function): Promise<any> => {

        const municipalityDocument: MunicipalityDocument = await MunicipalityModel.findById(ctx.request.body.municipality.id).exec().catch(() => null);

        if (municipalityDocument === null) {
            return ctx.answerUserError(400, "Cet departement n'existe pas");
        } else {
            ctx.request.body.municipality = municipalityDocument.toNormalization();
            return await next();
        }
    }

    public static beforeUpdate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const neighborhood: NeighborhoodDocument = await NeighborhoodModel.findOne({name: body.name}).catch(() => null);


        if (neighborhood !== null && neighborhood._id.toString() !== ctx.request.params['id'].toString()) {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        } else {
            return await NeighborhoodController.municipalityValidation(ctx, next)
        }
    };

    public static update = async (ctx: ModifiedContext, next?: Function) => {
        const query: any = {$set: ctx.request.body};
        const session: ClientSession = await startSession();
        session.startTransaction();

        const updateNeighborhood: NeighborhoodDocument | null = await NeighborhoodModel
            .findByIdAndUpdate(ctx.request.params['id'], query, {new: true})
            .session(session).exec().catch(() => null);

        if (updateNeighborhood) {
            const response: NeighborhoodType = updateNeighborhood.toNormalization();
            const neighborhood = {neighborhood: response}
            const users: any = await UserModel
                .updateMany({'neighborhood.id': ctx.request.params['id']}, {$set: neighborhood})
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
        const filters: { municipalityId: string } = ctx.pagination.filters;
        return {'municipality.id': filters.municipalityId}
    }
}

export default NeighborhoodController;
