import {ModifiedContext, Responses} from './../types';

import DepartmentModel, {DepartmentDocument, DepartmentType} from './../model/department';
import UserModel from './../model/user';
import RegionModel from './../model/region';
import {ClientSession, startSession} from "mongoose";
import {RegionDocument} from "../model/region";


/**
 * @param name - A valid string that has already been validated by JOI
 * @param description - A valid string that has already been validated by JOI
 */
type InputCreateBodyType = { name: string, region: { id: string }, description: string };


class DepartmentController {

    public static beforeCreate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const totalExisting: number = await DepartmentModel.countDocuments({name: body.name}).catch(() => {
            return null;
        });

        if (totalExisting === null) {
            return ctx.answerUserError(400, Responses.SOMETHING_WENT_WRONG);
        } else if (totalExisting === 0) {
            return await DepartmentController.regionValidation(ctx, next);
        } else {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        }
    };

    public static regionValidation = async (ctx: ModifiedContext, next: Function): Promise<any> => {

        const regionDocument: RegionDocument = await RegionModel.findById(ctx.request.body.region.id).exec().catch(() => null);

        if (regionDocument === null) {
            return ctx.answerUserError(400, "Cette region n'existe pas");
        } else {
            ctx.request.body.region = regionDocument.toNormalization();
            return await next();
        }
    }

    public static beforeUpdate = async (ctx: ModifiedContext, next: Function) => {
        const body: InputCreateBodyType = ctx.request.body;
        const department: DepartmentDocument = await DepartmentModel.findOne({name: body.name}).catch(() => null);


        if (department !== null && department._id.toString() !== ctx.request.params['id'].toString()) {
            return ctx.answerUserError(400, `${body.name} existe déja`);
        } else {
            return await DepartmentController.regionValidation(ctx, next)
        }
    };

    public static update = async (ctx: ModifiedContext, next?: Function) => {
        const query: any = {$set: ctx.request.body};
        const session: ClientSession = await startSession();
        session.startTransaction();

        const updateDepartment: DepartmentDocument | null = await DepartmentModel
            .findByIdAndUpdate(ctx.request.params['id'], query, {new: true})
            .session(session).exec().catch(() => null);

        if (updateDepartment) {
            const response: DepartmentType = updateDepartment.toNormalization();
            const department = {department: response}
            const users: any = await UserModel
                .updateMany({'department.id': ctx.request.params['id']}, {$set: department})
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
        const filters: { regionId: string } = ctx.pagination.filters;
        return {'region.id': filters.regionId}
    }
}

export default DepartmentController;
