import {ModifiedContext, Responses} from './../types';

import EnterpriseModel, {EnterpriseDocument, EnterpriseType} from './../model/enterprise';
import UserModel from './../model/user';
import {ClientSession, startSession} from "mongoose";


/**
 * @param name - A valid string that has already been validated by JOI
 * @param description - A valid string that has already been validated by JOI
 */
type InputCreateBodyType = { name: string, description: string };


class EnterpriseController {

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {
        console.log('Class: EnterpriseController, Function: beforeCreate, Line 19 (): '
            ,);
        const body: InputCreateBodyType = ctx.request.body;
        const totalExisting: number = await EnterpriseModel.countDocuments({name: body.name}).catch(() => {
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
        const enterprise: EnterpriseDocument = await EnterpriseModel.findOne({name: body.name}).catch(() => null);


        if (enterprise !== null && enterprise._id.toString() !== ctx.request.params['id'].toString()) {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        } else {
            return await next();
        }
    };

    /*public static checkNameAndDescription = async (ctx: ModifiedContext, next: Function) => {
        if (ctx.request.body.name.toLowerCase() === DefaultUserCreator.DEFAULT_ENTERPRISE_NAME.toLowerCase()) {
            return ctx.answerUserError(400, `Le nom est ne peut pas être admin`);
        } else if (ctx.request.body.description
            && ctx.request.body.description.toLowerCase() === DefaultUserCreator.DEFAULT_ENTERPRISE_NAME.toLowerCase()) {
            return ctx.answerUserError(400, `Le nom est ne peut pas être admin`);
        } else {
            await next();
        }
    }*/

    /*public static ckeckExistingAndNotAdmin = async (ctx: ModifiedContext, next: Function, action: string) => {

        const enterprise: EnterpriseDocument = await EnterpriseModel.findById(ctx.request.params['id']).catch(() => {
            return null;
        });

        if (enterprise && enterprise.toNormalization().name === DefaultUserCreator.ADMIN_USERNAME) {
            return ctx.answerUserError(400, `Impossible de ${action} le enterprise admin`);
        } else if (enterprise) {
            await next();
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };*/

    /*public static ckeckAdminNotInList = async (ctx: ModifiedContext, next: Function) => {

        const criteria: any = {_id: {$in: ctx.request.body}, name: DefaultUserCreator.ADMIN_USERNAME};
        const totalExisting: number = await EnterpriseModel.countDocuments(criteria).catch(() => {
            return null;
        });

        if (totalExisting === null || totalExisting > 0) {
            return ctx.answerUserError(400, `Impossible de supprimer le enterprise admin`);
        } else {
            await next();
        }
    };*/

    /*public static beforeDelete = async (ctx: ModifiedContext, next: Function) => {
        const totalExisting: number = await UserModel.countDocuments({'enterprise.id': ctx.request.params['id']}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            await next();
        } else {
            return ctx.answerUserError(400, `ce enterprise est associé à ${totalExisting} utilisateur${totalExisting > 1 ? 's' : ''}`);
        }
    };*/

    public static update = async (ctx: ModifiedContext, next?: Function) => {
        const query: any = {$set: ctx.request.body};
        const session: ClientSession = await startSession();
        session.startTransaction();

        const updateEnterprise: EnterpriseDocument | null = await EnterpriseModel
            .findByIdAndUpdate(ctx.request.params['id'], query, {new: true})
            .session(session).exec().catch(() => null);

        if (updateEnterprise) {
            const response: EnterpriseType = updateEnterprise.toNormalization();
            const enterprise = {enterprise: response}
            const users: any = await UserModel
                .updateMany({'enterprise.id': ctx.request.params['id']}, {$set: enterprise})
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

export default EnterpriseController;
