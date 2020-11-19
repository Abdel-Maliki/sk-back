import MONGOOSE from 'mongoose';

type toNormalizationFunction = () => LogType;

export enum LogState {SUCCES = 'SUCCES', ERROR = 'ERROR'}

export type LogDocument = MONGOOSE.Document & {
    action: string,
    elementId: string,
    userName: string,
    state: LogState,
    url: string,
    method: string,
    ipAddress: string,
    userAgent: string
    host: string
    code: number,
    time: number,
    errorMessage: string
    toNormalization: toNormalizationFunction
};

export type LogType = {
    id?: string | null,
    action?: string | null,
    elementId?: string | null,
    userName?: string | null,
    state?: LogState | null,
    url?: string | null,
    method?: string | null,
    ipAddress?: string | null,
    userAgent?: string | null,
    code?: number | null,
    time?: number | null,
    host?: string | null,
    errorMessage?: string | null,
};

const logSchema = new MONGOOSE.Schema({
    action: {type: String, default: ''},
    elementId: {type: String, default: ''},
    userName: {type: String, default: ''},
    url: {type: String, default: ''},
    method: {type: String, default: ''},
    ipAddress: {type: String, default: ''},
    userAgent: {type: String, default: ''},
    host: {type: String, default: ''},
    code: {type: Number, default: ''},
    time: {type: Number, default: 0},
    state: {type: String, default: 'ERROR'},
    errorMessage: {type: String, default: ''},
}, {timestamps: true});

const toNormalization: toNormalizationFunction = function () {
    let _logObject: LogDocument = this.toObject();

    let LogObject: LogType = {
        id: _logObject._id.toString(),
        action: _logObject.action,
        elementId: _logObject.elementId,
        userName: _logObject.userName,
        state: _logObject.state,
        url: _logObject.url,
        method: _logObject.method,
        ipAddress: _logObject.ipAddress,
        userAgent: _logObject.userAgent,
        host: _logObject.host,
        code: _logObject.code,
        errorMessage: _logObject.errorMessage,
        time: _logObject.time,
    };

    return LogObject;
};

logSchema.methods.toNormalization = toNormalization;

const Log = MONGOOSE.model<LogDocument>('Log', logSchema);

export default Log;
