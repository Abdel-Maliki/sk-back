import MONGOOSE from 'mongoose';

type toNormalizationFunction = () => LogType;

export enum LogState {SUCCES = 'SUCCES', ERROR = 'ERROR'}

export type LogDocument = MONGOOSE.Document & {
    action: string,
    elementId: string,
    userName: string,
    state: LogState,
    toNormalization: toNormalizationFunction
};

export type LogType = {
    id?: string | null,
    action: string | null,
    elementId?: string | null,
    userName: string | null,
    state: LogState | null,
};

const logSchema = new MONGOOSE.Schema({
    action: {type: String, default: ''},
    elementId: {type: String, default: ''},
    userName: {type: String, default: ''},
    state: {type: String, default: 'ERROR'},
}, {timestamps: true});

const toNormalization: toNormalizationFunction = function () {
    let _logObject: LogDocument = this.toObject();

    let LogObject: LogType = {
        id: _logObject._id.toString(),
        action: _logObject.action,
        elementId: _logObject.elementId,
        userName: _logObject.userName,
        state: _logObject.state,
    };

    return LogObject;
};

logSchema.methods.toNormalization = toNormalization;

const Log = MONGOOSE.model<LogDocument>('Log', logSchema);

export default Log;
