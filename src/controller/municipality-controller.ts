import {ModifiedContext, Responses} from './../types';

import MunicipalityModel, {MunicipalityDocument, MunicipalityType} from './../model/municipality';
import UserModel from './../model/user';
import DepartmentModel from './../model/department';
import {ClientSession, startSession} from "mongoose";
import {DepartmentDocument} from "../model/department";


/**
 * @param name - A valid string that has already been validated by JOI
 * @param description - A valid string that has already been validated by JOI
 */
type InputCreateBodyType = { name: string, department: { id: string }, description: string };


class MunicipalityController {

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const totalExisting: number = await MunicipalityModel.countDocuments({name: body.name}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            return await MunicipalityController.departmentValidation(ctx, next);
        } else {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        }
    };

    public static departmentValidation = async (ctx: ModifiedContext, next: Function): Promise<any> => {

        const departmentDocument: DepartmentDocument = await DepartmentModel.findById(ctx.request.body.department.id).exec().catch(() => null);

        if (departmentDocument === null) {
            return ctx.answerUserError(400, "Cet departement n'existe pas");
        } else {
            ctx.request.body.department = departmentDocument.toNormalization();
            return await next();
        }
    }

    public static beforeUpdate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const municipality: MunicipalityDocument = await MunicipalityModel.findOne({name: body.name}).catch(() => null);


        if (municipality !== null && municipality._id.toString() !== ctx.request.params['id'].toString()) {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        } else {
            return await MunicipalityController.departmentValidation(ctx, next)
        }
    };

    public static update = async (ctx: ModifiedContext, next?: Function) => {
        const query: any = {$set: ctx.request.body};
        const session: ClientSession = await startSession();
        session.startTransaction();

        const updateMunicipality: MunicipalityDocument | null = await MunicipalityModel
            .findByIdAndUpdate(ctx.request.params['id'], query, {new: true})
            .session(session).exec().catch(() => null);

        if (updateMunicipality) {
            const response: MunicipalityType = updateMunicipality.toNormalization();
            const municipality = {municipality: response}
            const users: any = await UserModel
                .updateMany({'municipality.id': ctx.request.params['id']}, {$set: municipality})
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
        const filters: { departmentId: string } = ctx.pagination.filters;
        return {'department.id': filters.departmentId}
    }
}

export default MunicipalityController;
