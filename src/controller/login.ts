import {ModifiedContext, Responses} from './../types';

import UserModel, {UserDocument, UserState, UserType} from './../model/user';

/**
 *
 * @param email - A valid email that has already been validated by JOI
 * @param password - Password input that has been already validated by JOI
 */
type InputBodyType = { email: string, password: string };

class Login {
    public static create = async (ctx: ModifiedContext): Promise<ModifiedContext> => {
        const {
            email, password
        } = <InputBodyType>ctx.request.body;

        const user: UserDocument | null = await UserModel.findOne({$or: [{email: email}, {userName: email}]});

        if (user && user.status === UserState.DESACTIVE){
            await UserModel.findByIdAndUpdate(user._id, { $inc: { testAuthNumber : 1 }}).exec().then();
            return ctx.answer(401, "Votre compte a été désactivé contactez l'administrateur de votre système");
        } else if (user && user.status === UserState.BLOQUE){
            await UserModel.findByIdAndUpdate(user._id, { $inc: { testAuthNumber : 1 }}).exec().then();
            return ctx.answer(401, "Votre compte a été bloqué contactez l'administrateur de votre système");
        }else if (user && UserState.ACTIVE) {
            ctx.state.log.userName = user.userName;
            const isMatched = await user.comparePassword(password).catch(err => null);
            if (isMatched === true) {
                const {id} = <UserType>user.toNormalization();
                const token: string = await ctx.jwt.sign({id, agent: ctx.header['user-agent'], password: user.password});
                return ctx.answer(200, {token});
            } else {
                const update = user.testAuthNumber >= 9
                    ? { status: UserState.BLOQUE, blockedDate: new Date(),  $inc: { testAuthNumber : 1 }}
                    : { $inc: { testAuthNumber : 1 }}
                await UserModel.findByIdAndUpdate(user._id, update).exec().then();
                return ctx.answer(401, Responses.INVALID_CREDS);
            }
        } else {
            return ctx.answer(401, Responses.INVALID_CREDS);
        }
    };
}

export default Login;
