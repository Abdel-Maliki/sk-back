import {ModifiedContext, Responses} from './../types';

import BeneficiaryModel, {BeneficiaryDocument, BeneficiaryType} from './../model/beneficiary';
import UserModel from './../model/user';
import {ClientSession, startSession} from "mongoose";


/**
 * @param name - A valid string that has already been validated by JOI
 * @param description - A valid string that has already been validated by JOI
 */
type InputCreateBodyType = { name: string, description: string };


class BeneficiaryController {

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {
        console.log('Class: BeneficiaryController, Function: beforeCreate, Line 19 (): '
            ,);
        const body: InputCreateBodyType = ctx.request.body;
        const totalExisting: number = await BeneficiaryModel.countDocuments({name: body.name}).catch(() => {
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
        const beneficiary: BeneficiaryDocument = await BeneficiaryModel.findOne({name: body.name}).catch(() => null);


        if (beneficiary !== null && beneficiary._id.toString() !== ctx.request.params['id'].toString()) {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        } else {
            return await next();
        }
    };

    /*public static checkNameAndDescription = async (ctx: ModifiedContext, next: Function) => {
        if (ctx.request.body.name.toLowerCase() === DefaultUserCreator.DEFAULT_BENEFICIARY_NAME.toLowerCase()) {
            return ctx.answerUserError(400, `Le nom est ne peut pas être admin`);
        } else if (ctx.request.body.description
            && ctx.request.body.description.toLowerCase() === DefaultUserCreator.DEFAULT_BENEFICIARY_NAME.toLowerCase()) {
            return ctx.answerUserError(400, `Le nom est ne peut pas être admin`);
        } else {
            await next();
        }
    }*/

    /*public static ckeckExistingAndNotAdmin = async (ctx: ModifiedContext, next: Function, action: string) => {

        const beneficiary: BeneficiaryDocument = await BeneficiaryModel.findById(ctx.request.params['id']).catch(() => {
            return null;
        });

        if (beneficiary && beneficiary.toNormalization().name === DefaultUserCreator.ADMIN_USERNAME) {
            return ctx.answerUserError(400, `Impossible de ${action} le beneficiary admin`);
        } else if (beneficiary) {
            await next();
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };*/

    /*public static ckeckAdminNotInList = async (ctx: ModifiedContext, next: Function) => {

        const criteria: any = {_id: {$in: ctx.request.body}, name: DefaultUserCreator.ADMIN_USERNAME};
        const totalExisting: number = await BeneficiaryModel.countDocuments(criteria).catch(() => {
            return null;
        });

        if (totalExisting === null || totalExisting > 0) {
            return ctx.answerUserError(400, `Impossible de supprimer le beneficiary admin`);
        } else {
            await next();
        }
    };*/

    /*public static beforeDelete = async (ctx: ModifiedContext, next: Function) => {
        const totalExisting: number = await UserModel.countDocuments({'beneficiary.id': ctx.request.params['id']}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            await next();
        } else {
            return ctx.answerUserError(400, `ce beneficiary est associé à ${totalExisting} utilisateur${totalExisting > 1 ? 's' : ''}`);
        }
    };*/

    public static update = async (ctx: ModifiedContext, next?: Function) => {
        const query: any = {$set: ctx.request.body};
        const session: ClientSession = await startSession();
        session.startTransaction();

        const updateBeneficiary: BeneficiaryDocument | null = await BeneficiaryModel
            .findByIdAndUpdate(ctx.request.params['id'], query, {new: true})
            .session(session).exec().catch(() => null);

        if (updateBeneficiary) {
            const response: BeneficiaryType = updateBeneficiary.toNormalization();
            const beneficiary = {beneficiary: response}
            const users: any = await UserModel
                .updateMany({'beneficiary.id': ctx.request.params['id']}, {$set: beneficiary})
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

export default BeneficiaryController;
