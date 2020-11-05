import {ModifiedContext} from './../types';

import {Pagination} from "../common/pagination";
import ProfileModel, {ProfileDocument} from "../model/profile";

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

    public static setProfile = async (ctx: ModifiedContext, next: Function) => {
        const profile: ProfileDocument = await ProfileModel.findById(ctx.request.body.entity.profile.id).catch(() => {
            return null;
        });

        if (profile === null) {
            return ctx.answer(400, `Le profile ${ctx.request.params['id']} n'existe pas`);
        } else {
            ctx.request.body.entity.profile = profile.toNormalization();
            await next();
        }
    };


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
        const profile: ProfileDocument|null = await ProfileModel.findById(ctx.request.body.profile.id);
        if (profile) {
            ctx.request.body.profile = profile.toNormalization();
            await next();
        } else {
            ctx.answer(400, "Le profile n'existe pas");
        }
    }
}

export default UserController;
