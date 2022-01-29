import MONGOOSE from 'mongoose';
import LogConstants from "../constante/log-constants";
import {EntityBase} from "./entity-base";
import {version} from "../../package.json";

type toNormalizationFunction = () => LogType;

export enum LogState {SUCCESS = 'SUCCESS', CLIENT_ERROR = 'USER_ERROR', SERVER_ERROR = 'SERVER_ERROR' }

export type LogDocument = MONGOOSE.Document & {
    action: LogConstants,
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
    errorMessage: string,
    serverError: string;
    createdAt?: string;
    version?: string;
    toNormalization: toNormalizationFunction
};

export type LogType = EntityBase & {
    id?: string | null,
    action?: LogConstants | null,
    elementId?: string | null,
    userName?: string | null,
    state?: LogState | null,
    url?: string | null,
    method?: string | null,
    ipAddress?: string | null,
    userAgent?: string | null,
    code?: number | null,
    time?: number | null,
    timeError?: number | null,
    host?: string | null,
    errorMessage?: string | null,
    serverError?: string | null,
    version: string | null,
};

const logSchema = new MONGOOSE.Schema({
    action: {type: LogConstants, default: ''},
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
    serverError: {type: String, default: ''},
    version: {type: String, default: ''},
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
        version: _logObject.version,
        errorMessage: _logObject.errorMessage,
        serverError: _logObject.serverError,
        time: _logObject.time,
        createdAt: _logObject.createdAt,
    };

    return LogObject;
};

logSchema.methods.toNormalization = toNormalization;

const Log = MONGOOSE.model<LogDocument>('Log', logSchema);

export default Log;
