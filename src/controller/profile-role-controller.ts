import {ModifiedContext, Responses} from './../types';

import ProfileRoleModel, {ProfileRoleDocument} from './../model/profile-role';
import {startSession} from "mongoose";


class ProfileRoleController {
    public static update = async (ctx: ModifiedContext) => {
        await ProfileRoleModel.createCollection().catch(reason => console.log('reason', reason));
        let error: any = null;
        const session = await startSession();
        session.startTransaction();
        ProfileRoleModel.deleteMany({'profile.id': ctx.profile.id}).session(session).catch((err) => error = err);
        if (error) {
            await session.abortTransaction();
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }

        const profileRoles: ProfileRoleDocument[] | null = await ProfileRoleModel.insertMany(ctx.request.body, {session: session}).catch((err) => error = err);

        if (error) {
            await session.abortTransaction();
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }

        await session.commitTransaction();
        session.endSession();
        return ctx.answer(200, profileRoles.map(profileRoleDocument => profileRoleDocument.toNormalization().role.name));

    };


    public static read = async (ctx: ModifiedContext) => {
        const profileRoles: { role: { name: string } }[] | null = await ProfileRoleModel
            .find({'profile.id': ctx.request.params['profileId']}).select({_id: 0, 'role.name': 1});
        console.log('Class: ProfileRoleController, Function: read, Line 36 , profileRoles: '
            , profileRoles);
        if (profileRoles) {
            return ctx.answer(200, profileRoles.map(value => value.role.name));
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };
}

export default ProfileRoleController;
