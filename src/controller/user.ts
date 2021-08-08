import {ModifiedContext, NonNullable, Responses} from './../types';

import {Pagination} from "../common/pagination";
import ProfileModel, {ProfileDocument, ProfileType} from "../model/profile";
import UserModel, {UserDocument, UserState, UserType} from "../model/user";
import {DefaultUserCreator} from "../service/default-user-creator";
import ControllerHelpers from "./controller-helpers";
import Roles from "../constante/roles";
import BCRYPT from "bcrypt";
import Mail from "../service/mail";
import {SentMessageInfo} from "nodemailer";
import ProjectConstantes from "../constante/project-constantes";

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
            return ctx.answerUserError(400, `Le profile ${ctx.request.params['id']} n'existe pas`);
        } else {
            ctx.request.body.profile = profile.toNormalization();
            await next();
        }
    };

    public static forgotPasswordRequest = async (ctx: ModifiedContext) => {
        const user: UserDocument = await UserModel.findOne({email: ctx.request.body.email}).catch(() => null);
        if (!user) return ctx.answerUserError(400, `Cet adresse email n'appartient à auccun utiliateur`);
        if (user.status === UserState.DESACTIVE){
            await UserModel.findByIdAndUpdate(user._id, { $inc: { testAuthNumber : 1 }}).exec().then();
            return ctx.answerUserError(401, "Votre compte a été désactivé contactez l'administrateur de votre système");
        }
        const token = await ctx.jwt.generateToken({id: user._id}, "1 days", ctx.jwt.secret + user.password).catch((error) => {
            return error;
        });
        if (!token) return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);

        const response: SentMessageInfo = await Mail.sendMail(ctx.request.body.email, "test", `Merci d'utiliser ce lien pour tapper votre nouveau mot de passe
        http://${'localhost:4300/forget-password-finalization/' + token}`).catch((error) => {
            return null;
        });

        if (!response) return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        return ctx.answerSuccess(200, []);
    }

    public static forgotPasswordFinalisation = async (ctx: ModifiedContext) => {

        const payload: any = await ctx.jwt.decode(ctx.request.body.token);
        let user: UserDocument = null;
        if (payload && payload.hasOwnProperty('id') && typeof payload.id === 'string' && ProjectConstantes.mongoObjectRegEx.test(payload.id)) {
            user = await UserModel.findById(payload.id).exec().catch(() => null);
            if (!user) return ctx.answerUserError(401, Responses.INVALID_CREDS);
        } else {
            return ctx.answerUserError(401, Responses.INVALID_CREDS);
        }

        const userId: {id: string} = await ctx.jwt.verify(ctx.request.body.token, ctx.jwt.secret + user.password).catch(() => null);
        if (!userId || !userId.id)  return ctx.answerUserError(401, 'invalid token');
        if (!user) return ctx.answerUserError(400, `Cet utiliateur n'existe pas`);
        if (user.status === UserState.DESACTIVE){
            return ctx.answerUserError(401, "Votre compte a été désactivé contactez l'administrateur de votre système");
        }
        const salt = await BCRYPT.genSalt().catch(() => null);
        if (!salt) return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        const hash = await BCRYPT.hash(ctx.request.body.password, salt).catch(() => null);
        if (!hash) return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);

        const result: any = await UserModel.findByIdAndUpdate(user.id,
            {$set: {password: hash, status: UserState.ACTIVE, testAuthNumber: 0}}).exec().catch(() => null);
        if (!result) return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        return ctx.answerSuccess(200, []);
    }

    public static setPassword = async (ctx: ModifiedContext, next: Function) => {
        ctx.request.body.password = UserController.DEFAULT_PASSWORD;
        await next();
    };


    public static adminCheck = async (ctx: ModifiedContext, next: Function) => {
        if (ctx.request.body.userName.toLowerCase() === DefaultUserCreator.ADMIN_USERNAME.toLowerCase()) {
            return ctx.answerUserError(400, `Le nom d'utilisateur ne peut pas être admin`);
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
            ctx.answerUserError(400, "Le profile n'existe pas");
        }
    }

    public static ckeckExistingAndNotAdmin = async (ctx: ModifiedContext, next: Function, action: string) => {
        const user: UserDocument = await UserModel.findById(ctx.request.params['id']).catch(() => null);

        if (user && user.userName === DefaultUserCreator.ADMIN_USERNAME) {
            return ctx.answerUserError(400, `Impossible de ${action} l'utilisateur admin`);
        } else if (user) {
            return await next();
        } else {
            return ctx.answerUserError(400, `Cet utilisateur n'existe pas`);
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

    public static allUserNames = async (ctx: ModifiedContext) => {
        const users: UserDocument[] = await UserModel.find({}, {userName: 1, _id: 0}).catch(() => null);
        if (users && users.length > 0) {
            return ctx.answerSuccess(200, users.map(value => value.userName));
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
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
        const criteria: any = {_id: {$in: ctx.request.body}, userName: DefaultUserCreator.ADMIN_USERNAME};
        const totalExisting: number = await UserModel.countDocuments(criteria).catch((e) => {
            return -1;
        });

        if (totalExisting === -1) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting > 0) {
            return ctx.answerUserError(400, `Impossible de ${action} l'utilisateur admin`);
        } else {
            await next();
        }
    };

    public static activateOrDisableAccount = async (ctx: ModifiedContext, next: Function, ids: NonNullable<string[]>, status: UserState.ACTIVE | UserState.DESACTIVE) => {

        let val = status === UserState.ACTIVE
            ? {status, activatedDate: new Date(), testAuthNumber: 0}
            : {
                status, deactivatedDate: new Date()
            };
        const data: any = await UserModel.updateMany({_id: {$in: ids}}, {$set: val}).catch(() => null);
        if (data) {
            return await next();
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        }
    };

    public static resetPassword = async (ctx: ModifiedContext) => {

        const salt = await BCRYPT.genSalt().catch(() => null);
        if (!salt) return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        const hash = await BCRYPT.hash(UserController.DEFAULT_PASSWORD, salt).catch(() => null);
        if (!hash) return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);

        const data: any = await UserModel.updateOne(
            {_id: ctx.request.params['id']},
            {$set: {password: hash}}).exec().catch(() => null);

        if (data) {
            await ctx.answerSuccess(200, []);
        } else {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
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
        if (ctx.state.user.profile.name === DefaultUserCreator.ADMIN_USERNAME) {
            return ctx.answerSuccess(200, {user: ctx.state.user, roles: Object.values(Roles)});
        } else {
            const profile: ProfileType = await ProfileModel
                .findOne({name: ctx.state.user.profile.name}, {roles: 1, _id: 0}).exec().catch(() => null);
            return ctx.answerSuccess(200, {user: ctx.state.user, roles: profile && profile.roles ? profile.roles : []});
        }

    }

    public static updateMyPassword = async (ctx: ModifiedContext) => {
        const requestBody: { oldPassword: string, newPassword: string } = ctx.request.body;
        const user: UserDocument | null = await UserModel.findById(ctx.state.user.id);

        const isMatched = await user.comparePassword(requestBody.oldPassword).catch(() => null);
        if (isMatched === true) {

            const salt = await BCRYPT.genSalt().catch(() => null);
            if (!salt) return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
            const hash = await BCRYPT.hash(requestBody.newPassword, salt).catch(() => null);
            if (!hash) return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);

            const result: any = await UserModel.findByIdAndUpdate(user.id, {$set: {password: hash}}).exec().catch(() => null);
            if (result) {
                const token: string = await ctx.jwt.generateToken({id: user._id},"20 days",
                    ctx.jwt.secret + ctx.header['user-agent'] + hash);
                return ctx.answerSuccess(200, {token});
            } else {
                return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
            }
        } else {
            const update = user.testAuthNumber >= 9
                ? {status: UserState.BLOQUE, blockedDate: new Date(), $inc: {testAuthNumber: 1}}
                : {$inc: {testAuthNumber: 1}}
            UserModel.findByIdAndUpdate(user._id, update).exec().then();
            return ctx.answerUserError(400, "l'ancien mot de passe est incorrect");
        }
    }


    private static finishedCheck = async (ctx: ModifiedContext, next: Function, userType: UserType, user: UserDocument) => {
        if (user && (userType.userName === user.userName || userType.userName === user.email)) {
            return ctx.answerUserError(400, `Ce nom d'utilisateur existe déja`);
        } else if (user && (userType.email === user.userName || userType.email === user.email)) {
            return ctx.answerUserError(400, `L'adresse email existe déja`);
        } else {
            return await next();
        }
    }

}

export default UserController;
