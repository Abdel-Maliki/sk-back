import {Joi as JOI, Spec} from 'koa-joi-router';
import HELPER from './helper';
import PROFILE_ROLE_CONTROLLER from '../controller/profile-role-controller';
import {ModifiedContext} from "index";
import ProfileModel, {ProfileDocument} from "../model/profile";


class ProfileRoleRouter {

    private static read: Spec = ({
        method: HELPER.methods.GET,
        path: '/profile-role/:profileId',
        validate: {
            continueOnError: true,
            params: JOI.object({profileId: JOI.string().label("Le profile est").regex(HELPER.mongoObjectRegEx)}),
            output: HELPER.defaultOutput(JOI.array().items(JOI.string().min(1).required()))
        },
        handler: [HELPER.validation,PROFILE_ROLE_CONTROLLER.read]
    });


    private static update: Spec = ({
        method: HELPER.methods.PUT,
        path: '/profile-role/:profileId',
        validate: {
            continueOnError: true,
            type: HELPER.contentType.JSON,
            params: JOI.object({profileId: JOI.string().label("Le profile est").regex(HELPER.mongoObjectRegEx)}),
            body: JOI.array().unique().items(JOI.string().min(1).required()).label("L'identifiant du role "),
            output: HELPER.defaultOutput(JOI.array().items(JOI.string().min(1).required()))
        },
        handler: [HELPER.validation,ProfileRoleRouter.mapUpdateBody,PROFILE_ROLE_CONTROLLER.update]
    });

    private static async mapUpdateBody(ctx: ModifiedContext, next: Function) {
        const profile: ProfileDocument|null = await ProfileModel.findById(ctx.request.params['profileId']);
        if (profile) {
            ctx.profile = profile.toNormalization();
            ctx.request.body = ctx.request.body.map((role: string) => ({profile: ctx.profile, role}));
            await next();
        } else {
            ctx.answer(400, "Le profile n'existe pas");
        }
    }

    public static specs: Spec[] = [ ProfileRoleRouter.update, ProfileRoleRouter.read];
}

export default ProfileRoleRouter;
