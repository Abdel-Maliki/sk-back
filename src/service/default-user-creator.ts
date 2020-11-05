import UserModel, {UserType} from './../model/user';
import ProfileModel, {ProfileType} from "../model/profile";
import {ClientSession, startSession} from "mongoose";

/**
 * @author abdel-maliki
 * Date : 01/11/2020
 */

export class DefaultUserCreator {

    public static readonly DEFAULT_PROFILE_NAME = "admin";

    private static readonly defaultProfile: ProfileType = {
        createdBy: "DEFAULT",
        description: DefaultUserCreator.DEFAULT_PROFILE_NAME,
        roles: [],
        name:  DefaultUserCreator.DEFAULT_PROFILE_NAME,
    }

    private static readonly defaultUser: UserType & { password: string } = {
        email: "malikiamadou00@gmail.com",
        createdBy: "DEFAULT",
        name: "admin",
        userName: "admin",
        password: "admin",
        profile: null,
        updatedAt: "",
    };

    public static async createDefaultUser(): Promise<void> {
        const session: ClientSession = await startSession();
        session.startTransaction();

        const result: number = await UserModel.countDocuments().exec().catch(() => null);
        if (result && result > 0) return;
        const user: UserType = DefaultUserCreator.defaultUser;
        user.profile = await DefaultUserCreator.createDefaultProfile(session).catch(async () => DefaultUserCreator.exit(session));
        delete user.profile.roles;
        UserModel.create(user)
            .then(async () => {
                await session.commitTransaction();
                console.log("Default user creted!!!");
            })
            .catch(async () => DefaultUserCreator.exit(session));
    }

    public static async createDefaultProfile(session: ClientSession): Promise<ProfileType> {
        await ProfileModel.deleteMany({}).session(session).exec().catch(() => null);
        return new Promise<ProfileType>((resolve, reject) => {
            ProfileModel.create([DefaultUserCreator.defaultProfile], {session: session})
                .then(document => resolve(document[0].toNormalization()))
                .catch(reason => {
                    reject(reason);
                });
        });
    }

    private static async exit(session: ClientSession): Promise<any> {
        await session.abortTransaction();
        console.log("Echec de la création de l'utilisateur par defaut");
        process.exit(1);
        return null;
    }
}
