import {ModifiedContext, Responses} from './../types';

import {Pagination} from "../common/pagination";
import ProfileModel, {ProfileDocument, ProfileType} from "../model/profile";
import UserModel, {UserDocument, UserState, UserType} from "../model/user";
import {DefaultUserCreator} from "../service/default-user-creator";
import ControllerHelpers from "./controller-helpers";
import Roles from "../constante/roles";
import BCRYPT from "bcrypt";
import MONGOOSE from "mongoose";

/**
 * @param firstName - A valid string that has already been validated by JOI
 * @param lastName - A valid string that has already been validated by JOI
 * @param password - A valid string that has already been validated by JOI
 * @param email - A valid email that has already been validated by JOI
 */
type InputCreateBodyType = { firstName: string, lastName: string, password: string, email: boolean };


/**
 * @param firstName - A valid string that has already been validated by JOI
 * @param lastName - A valid string that has already been validated by JOI
 */

class UserController {

    private static readonly DEFAULT_PASSWORD = '12345678';

    public static checkProfile = async (ctx: ModifiedContext, next: Function) => {
        const profile: ProfileDocument = await ProfileModel.findById(ctx.request.body.profile.id).catch(() => {
            return null;
        });

        if (profile === null) {
            return ctx.answer(400, `Le profile ${ctx.request.params['id']} n'existe pas`);
        } else {
            ctx.request.body.profile = profile.toNormalization();
            await next();
        }
    };

    public static setPassword = async (ctx: ModifiedContext, next: Function) => {
        ctx.request.body.password = UserController.DEFAULT_PASSWORD;
        await next();
    };


    public static adminCheck = async (ctx: ModifiedContext, next: Function) => {
        if (ctx.request.body.userName.toLowerCase() === DefaultUserCreator.DEFAULT_PROFILE_NAME.toLowerCase()) {
            return ctx.answer(400, `Le nom d'utilisateur ne peut pas être admin`);
        } else {
            await next();
        }
    }

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

    public static async addProfile(ctx: ModifiedContext, next: Function) {
        const profile: ProfileDocument | null = await ProfileModel.findById(ctx.request.body.profile.id);
        if (profile) {
            ctx.request.body.profile = profile.toNormalization();
            await next();
        } else {
            ctx.answer(400, "Le profile n'existe pas");
        }
    }

    public static ckeckExistingAndNotAdmin = async (ctx: ModifiedContext, next: Function, action: string) => {
        console.log('Class: UserController, Function: ckeckExistingAndNotAdmin, Line 82 , : '
        , );
        const user: UserDocument = await UserModel.findById(ctx.request.params['id']).catch(() => null);
        console.log('Class: UserController, Function: ckeckExistingAndNotAdmin, Line 83 , user: '
        , user);
        if (user && user.userName === DefaultUserCreator.DEFAULT_PROFILE_NAME) {
             console.log('Class: UserController, Function: ckeckExistingAndNotAdmin, Line 88 , : '
             , );
            return ctx.answer(400, `Impossible de ${action} l'utilisateur admin`);
        } else if (user) {
            console.log('Class: UserController, Function: ckeckExistingAndNotAdmin, Line 92 , : '
            , );
            await next();
        } else {
            console.log('Class: UserController, Function: ckeckExistingAndNotAdmin, Line 96 , : '
            , );
            return ctx.answer(400, `Cet utilisateur n'existe pas`);
        }
    };

    public static checkCreateActiveRole = async (ctx: ModifiedContext, next: Function) => {
        const user: UserType = ctx.request.body;
        if (user.status === UserState.ACTIVE) {
            return ControllerHelpers.haseRoleMidleWare(ctx, next, [Roles.ACTIVATE_ACCOUNT]);
        } else {
            await next();
        }
    }

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {
        const userType: UserType = ctx.request.body;
        const user: UserDocument = await UserModel.findOne({
            $or: [{userName: {$in: [userType.userName, userType.email]}}, {email: {$in: [userType.userName, userType.email]}}]
        }).exec().catch(() => null);

        return await UserController.finishedCheck(ctx, next, userType, user);
    }

    public static beforeUpdate = async (ctx: ModifiedContext, next: Function) => {
        const userType: UserType = ctx.request.body;
        const user: UserDocument = await UserModel.findOne({
            _id: {$ne: ctx.request.params['id']},
            $or: [
                {userName: {$in: [userType.userName, userType.email]}},
                {email: {$in: [userType.userName, userType.email]}}
            ]
        }).exec().catch((s) => {
            return null;
        });
        return await UserController.finishedCheck(ctx, next, userType, user);
    }

    public static ckeckAdminNotInList = async (ctx: ModifiedContext, next: Function, action: string) => {
        const criteria: any = {_id: {$in: ctx.request.body}, userName: DefaultUserCreator.DEFAULT_PROFILE_NAME};
        const totalExisting: number = await UserModel.countDocuments(criteria).catch((e) => {
            return -1;
        });

        if (totalExisting === -1) {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting > 0) {
            return ctx.answer(400, `Impossible de ${action} l'utilisateur admin`);
        } else {
            await next();
        }
    };

    public static activateOrDesableAccount = async (ctx: ModifiedContext, next: Function, ids: string[], status: UserState.ACTIVE | UserState.DESACTIVE) => {
        let val = status === UserState.ACTIVE
            ? {status, activatedDate: new Date(), testAuthNumber: 0}
            : {
                status, deactivatedDate: new Date()
            };
        const data: any = await UserModel.updateMany({_id: {$in: ids}}, {$set: val}).catch(() => {
            return null;
        });
        if (data) {
            await next();
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static resetPassword = async (ctx: ModifiedContext) => {

        const salt = await BCRYPT.genSalt().catch(() => null);
        if (!salt) return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        const hash = await BCRYPT.hash(UserController.DEFAULT_PASSWORD, salt).catch(() => null);
        if (!hash) return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);

        const data: any = await UserModel.updateOne(
            {_id: ctx.request.params['id']},
            {$set: {password: hash}}).exec().catch(() => null);

        if (data) {
            await ctx.answer(200, []);
        } else {
            return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static checkUpdateActiveRole = async (ctx: ModifiedContext, next: Function) => {
        const user: UserDocument = await UserModel.findOne({_id: {$ne: ctx.request.params['id']}}).exec().catch(() => null);
        const requestUser: UserType = ctx.request.body;
        if (user.status === requestUser.status) {
            return next();
        } else if (user.status === UserState.DESACTIVE || user.status === UserState.BLOQUE) {
            return ControllerHelpers.haseRoleMidleWare(ctx, next, [Roles.ACTIVATE_ACCOUNT]);
        } else {
            return ControllerHelpers.haseRoleMidleWare(ctx, next, [Roles.DISABLED_ACCOUNT]);

        }

    };

    public static currentUserData = async (ctx: ModifiedContext) => {
        if (ctx.state.user.profile.name === DefaultUserCreator.DEFAULT_PROFILE_NAME) {
            return ctx.answer(200, {user: ctx.state.user, roles: Object.values(Roles)});
        } else {
            const profile: ProfileType = await ProfileModel
                .findOne({name: ctx.state.user.profile.name}, {roles: 1, _id: 0}).exec().catch(() => null);
            return ctx.answer(200, {user: ctx.state.user, roles: profile && profile.roles ? profile.roles : []});
        }

    }

    public static updateMyPassword = async (ctx: ModifiedContext) => {
        const requestBody: { oldPassword: string, newPassword: string } = ctx.request.body;
        const user: UserDocument | null = await UserModel.findById(ctx.state.user.id);

        const isMatched = await user.comparePassword(requestBody.oldPassword).catch(() => null);
        if (isMatched === true) {

            const salt = await BCRYPT.genSalt().catch(() => null);
            if (!salt) return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
            const hash = await BCRYPT.hash(requestBody.newPassword, salt).catch(() => null);
            if (!hash) return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);

            const result: any = await UserModel.findByIdAndUpdate(user.id, {$set: {password: hash}}).exec().catch(() => null);
            if (result) {
                const token: string = await ctx.jwt.sign({id: user._id, agent: ctx.header['user-agent'], password: hash});
                return ctx.answer(200, {token});
            } else {
                return ctx.answer(400, Responses.SOMETHING_WENT_WRONG);
            }
        } else {
            const update = user.testAuthNumber >= 9
                ? {status: UserState.BLOQUE, blockedDate: new Date(), $inc: {testAuthNumber: 1}}
                : {$inc: {testAuthNumber: 1}}
            UserModel.findByIdAndUpdate(user._id, update).exec().then();
            return ctx.answer(400, "l'ancien mot de passe est incorrect");
        }
    }


    private static finishedCheck = async (ctx: ModifiedContext, next: Function, userType: UserType, user: UserDocument) => {
        if (user && (userType.userName === user.userName || userType.userName === user.email)) {
            return ctx.answer(400, `Ce nom d'utilisateur existe déja`);
        } else if (user && (userType.email === user.userName || userType.email === user.email)) {
            return ctx.answer(400, `L'adresse email existe déja`);
        } else {
            return await next();
        }
    }

}

export default UserController;
