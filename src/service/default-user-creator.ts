import UserModel, {UserType} from './../model/user';
import {ClientSession, startSession} from "mongoose";

/**
 * @author abdel-maliki
 * Date : 01/11/2020
 */

export class DefaultUserCreator {
    public static readonly DEFAULT_PROFILE_NAME = "admin";

    private static readonly defaultUser: UserType & { password: string } = {
        email: "malikiamadou00@gmail.com",
        createdBy: "DEFAULT",
        name: "admin",
        userName: "admin",
        password: "admin",
        active: true,
        profile: null,
        updatedAt: "",
    };

    public static async createDefaultUser(): Promise<void> {
        const session: ClientSession = await startSession();
        session.startTransaction();

        const result: number = await UserModel.countDocuments().exec().catch(() => null);
        if (result && result > 0) return ;

        const user: UserType = DefaultUserCreator.defaultUser;
        UserModel.create(user)
            .then(async () => {
                await session.commitTransaction();
                console.log("Default user creted!!!");
            })
            .catch(() => DefaultUserCreator.exit(session));
    }

    private static async exit(session: ClientSession): Promise<any> {
        await session.abortTransaction();
        console.log("Echec de la création de l'utilisateur par defaut");
        process.exit(1);
        return null;
    }
}
