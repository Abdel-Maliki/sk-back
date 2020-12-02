import {ModifiedContext, Responses} from './../types';

import ProfileModel, {ProfileDocument, ProfileType} from './../model/profile';
import UserModel from './../model/user';
import {ClientSession, startSession} from "mongoose";
import Roles from "../constante/roles";
import {DefaultUserCreator} from "../service/default-user-creator";


/**
 * @param name - A valid string that has already been validated by JOI
 * @param description - A valid string that has already been validated by JOI
 */
type InputCreateBodyType = { name: string, description: string };


class ProfileController {

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const totalExisting: number = await ProfileModel.countDocuments({name: body.name}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            return await ProfileController.checkNameAndDescription(ctx, next);
        } else {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        }
    };

    public static checkNameAndDescription = async (ctx: ModifiedContext, next: Function) => {
        if (ctx.request.body.name.toLowerCase() === DefaultUserCreator.DEFAULT_PROFILE_NAME.toLowerCase()) {
            return ctx.answerUserError(400, `Le nom est ne peut pas être admin`);
        } else if (ctx.request.body.description
            && ctx.request.body.description.toLowerCase() === DefaultUserCreator.DEFAULT_PROFILE_NAME.toLowerCase()) {
            return ctx.answerUserError(400, `Le nom est ne peut pas être admin`);
        } else {
            await next();
        }
    }

    public static ckeckExistingAndNotAdmin = async (ctx: ModifiedContext, next: Function, action: string) => {

        const profile: ProfileDocument = await ProfileModel.findById(ctx.request.params['id']).catch(() => {
            return null;
        });

        if (profile && profile.toNormalization().name === DefaultUserCreator.DEFAULT_PROFILE_NAME) {
            return ctx.answerUserError(400, `Impossible de ${action} le profile admin`);
        } else if (profile) {
            await next();
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static ckeckAdminNotInList = async (ctx: ModifiedContext, next: Function) => {

        const criteria: any = {_id: {$in: ctx.request.body}, name: DefaultUserCreator.DEFAULT_PROFILE_NAME};
        const totalExisting: number = await ProfileModel.countDocuments(criteria).catch(() => {
            return null;
        });

        if (totalExisting === null || totalExisting > 0) {
            return ctx.answerUserError(400, `Impossible de supprimer le profile admin`);
        } else {
            await next();
        }
    };

    public static beforeDelete = async (ctx: ModifiedContext, next: Function) => {
        const totalExisting: number = await UserModel.countDocuments({'profile.id': ctx.request.params['id']}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            await next();
        } else {
            return ctx.answerUserError(400, `ce profile est associé à ${totalExisting} utilisateur${totalExisting > 1 ? 's' : ''}`);
        }
    };

    public static update = async (ctx: ModifiedContext, next?: Function) => {
        const query: any = {$set: ctx.request.body};
        const session: ClientSession = await startSession();
        session.startTransaction();

        const updateProfile: ProfileDocument | null = await ProfileModel
            .findByIdAndUpdate(ctx.request.params['id'], query, {new: true})
            .session(session).exec().catch(() => null);

        if (updateProfile) {
            const response: ProfileType = updateProfile.toNormalization();
            const profile = {profile: response}
            const users: any = await UserModel
                .updateMany({'profile.id': ctx.request.params['id']}, {$set: profile})
                .session(session)
                .exec()
                .catch(() => null);

            if (users) {
                await session.commitTransaction();
                if (next) {
                    await next();
                } else {
                    return ctx.answerSuccess(200, response);
                }
            } else {
                await session.abortTransaction();
                return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
            }

        } else {
            await session.abortTransaction();
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static condition(ctx: ModifiedContext): any {
        const filter: { [key: string]: any } = ctx.request.body.filters;
        return filter && filter.global && filter.global > 0
            // ? {name: { $regex: '.*' + globalFilter + '.*' }}
            ? {
                $or: [
                    {name: {$regex: '.*' + filter.global + '.*', $options: 'i'}},
                    {description: {$regex: '.*' + filter.global + '.*', $options: 'i'}}
                ]
            }
            : {};
    }

    public static roles = async (ctx: ModifiedContext) => {
        const profiles: ProfileType[] = await ProfileModel
            .find({_id: ctx.request.params['id']}, {roles: 1, _id: 0}).exec().catch(() => {
                return null;
            });

        if (profiles && profiles.length > 0) {
            return ctx.answerSuccess(200, profiles[0].roles ? profiles[0].roles : []);
        } else if (profiles) {
            return ctx.answerUserError(400, `Le profile ${ctx.request.params['id']} n'existe pas`);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static validateRoles = async (ctx: ModifiedContext, next: Function) => {
        const allRoles: string[] = Object.values(Roles);
        const profileRoles: string[] = ctx.request.body;
        for (let i = 0; i < profileRoles.length; i++) {
            if (!allRoles.includes(profileRoles[i])) return ctx.answerUserError(400, `${profileRoles[i]} n'est pas valide`);
        }
        await next();
    };

    public static setRoles = async (ctx: ModifiedContext) => {
        const result: any = await ProfileModel
            .findByIdAndUpdate({_id: ctx.request.params['id']}, {$set: {roles: ctx.request.body}}).exec().catch(() => {
                return null;
            });

        if (result) {
            return ctx.answerSuccess(200, []);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };


}

export default ProfileController;
