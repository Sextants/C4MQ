"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
const Path = require("path");
const c4utils_1 = require("c4utils");
const MQHandler_1 = require("./MQHandler");
function getMQHandlers(arg, debug = false) {
    let TargetDir = [
        './MQHandlers/',
        './out/MQHandlers/'
    ];
    if (c4utils_1.TypeUtils.isArray(arg) && arg.length > 0) {
        let Models = [];
        for (let i = 0; i < TargetDir.length; i++) {
            let LoadPaths = arg.reduce((paths, dir) => {
                if (c4utils_1.TypeUtils.isObject(dir)
                    && dir.dir
                    && c4utils_1.TypeUtils.isString(dir.dir)
                    && !c4utils_1.TypeUtils.isEmptyStr(dir.dir)) {
                    if (!glob.hasMagic(dir.dir)) {
                        let parsedFile = Path.parse(dir.dir);
                        let curPath = Path.join(parsedFile.dir, parsedFile.name);
                        let fullPath = Path.join(process.cwd(), TargetDir[i], curPath, '*.*');
                        let IsInside = c4utils_1.PathUtils.PathInside(process.cwd(), fullPath);
                        if (IsInside) {
                            paths.push(fullPath);
                            return paths;
                        }
                    }
                }
                else if (c4utils_1.TypeUtils.isString(dir)
                    && !c4utils_1.TypeUtils.isEmptyStr(dir)) {
                    if (!glob.hasMagic(dir)) {
                        let parsedFile = Path.parse(dir);
                        let curPath = Path.join(parsedFile.dir, parsedFile.name);
                        let fullPath = Path.join(process.cwd(), TargetDir[i], curPath + '.*');
                        let IsInside = c4utils_1.PathUtils.PathInside(process.cwd(), fullPath);
                        if (IsInside) {
                            paths.push(fullPath);
                            return paths;
                        }
                    }
                }
            }, []);
            Models.push(...c4utils_1.FSP.getModules(LoadPaths, "", debug));
        }
        return Models;
    }
    return arg;
}
exports.getMQHandlers = getMQHandlers;
function getBindBody(paramConfig, message) {
    if (c4utils_1.TypeUtils.isEmptyObj(paramConfig)) {
        return [];
    }
    let Params = [];
    let CurParamConfig = paramConfig.reverse();
    for (let i = 0; i < CurParamConfig.length; i++) {
        let CurConifg = paramConfig[i];
        if (!c4utils_1.TypeUtils.isNullOrUndefined(message[CurConifg.value])) {
            // for (let j = 0; j < (CurConifg.index - Params.length); j++) {
            //     Params.push(undefined);
            // }
            // Params.push(message[CurConifg.value]);
            Params[CurConifg.index] = message[CurConifg.value];
        }
        else {
            throw new Error("Need body property : " + CurConifg.value);
        }
    }
    return Params;
}
function defineMQHandlers(handlers, logger) {
    let MQHandlers = [];
    let TempHandlers = {};
    let TempSubOption = {};
    handlers.forEach(handler => {
        let CurMQHandlerOptions = MQHandler_1.getMQHandlerOptions(handler);
        let CurOptions = CurMQHandlerOptions.Options;
        let BodyOptions = CurMQHandlerOptions.Body;
        for (let i = 0; i < CurOptions.length; i++) {
            let CurOption = CurOptions[i];
            let CurHandler = (message, headers, deliveryInfo, ack) => __awaiter(this, void 0, void 0, function* () {
                let Params = [];
                // bind body param
                let BindBodyParams = [];
                let isError = false;
                try {
                    if (BodyOptions) {
                        BindBodyParams = getBindBody(BodyOptions[CurOption.Name], message);
                    }
                }
                catch (error) {
                    if (logger) {
                        (logger.err && logger.err(error)) ||
                            (logger.error && logger.error(error));
                        isError = true;
                    }
                    else {
                        throw error;
                    }
                }
                // 消息格式错误，抛弃消息
                if (isError) {
                    return false;
                }
                if (BindBodyParams.length > 0) {
                    Params = BindBodyParams;
                }
                // 最后添加Msg本体
                Params.push(message);
                Params.push(headers);
                Params.push(deliveryInfo);
                Params.push(ack);
                let Result;
                try {
                    Result = yield CurOption.Handler(...Params);
                    if (!c4utils_1.TypeUtils.isBoolean(Result)) {
                        Result = true;
                    }
                }
                catch (error) {
                    // 消息处理异常，应该重新入队
                    if (logger) {
                        (logger.err && logger.err(error)) ||
                            (logger.error && logger.error(error));
                        Result = null;
                    }
                    else {
                        throw error;
                    }
                }
                return Result;
                // true为正常处理完
                // false为处理过程中发现问题，不重排，如果有死信队列，就入了死信队列
                // null处理异常了，重排
            });
            /// 
            let CurPublisherName = CurOption.PublisherName || "";
            let CurRoutingKey = CurOption.RoutingKey || "";
            if (c4utils_1.TypeUtils.isEmptyObj(TempHandlers[CurPublisherName])) {
                TempHandlers[CurPublisherName] = {};
            }
            if (c4utils_1.TypeUtils.isEmptyObj(TempHandlers[CurPublisherName][CurRoutingKey])) {
                TempHandlers[CurPublisherName][CurRoutingKey] = {};
            }
            TempHandlers[CurPublisherName][CurRoutingKey][CurOption.MsgType] = CurHandler;
            if (c4utils_1.TypeUtils.isEmptyObj(TempSubOption[CurPublisherName])) {
                TempSubOption[CurPublisherName] = {};
            }
            if (c4utils_1.TypeUtils.isEmptyObj(TempSubOption[CurPublisherName][CurRoutingKey])) {
                TempSubOption[CurPublisherName][CurRoutingKey] = CurOption.subscribeOption;
            }
        }
        let Publishers = Object.keys(TempHandlers);
        for (let i = 0; i < Publishers.length; i++) {
            let CurPublisher = TempHandlers[Publishers[i]];
            let Routings = Object.keys(CurPublisher);
            for (let j = 0; j < Routings.length; j++) {
                let CurRoute = CurPublisher[Routings[j]];
                let Msgs = Object.keys(CurRoute);
                let CurSubOption = {
                    publisherName: Publishers[i],
                    routingKey: Routings[j],
                    subscribeOption: TempSubOption[Publishers[i]][Routings[j]],
                    CBs: {}
                };
                for (let k = 0; k < Msgs.length; k++) {
                    let CurHL = CurRoute[Msgs[k]];
                    CurSubOption.CBs[Msgs[k]] = CurHL;
                }
                if (!c4utils_1.TypeUtils.isEmptyObj(CurSubOption.CBs)) {
                    MQHandlers.push(CurSubOption);
                }
            }
        }
    });
    return MQHandlers;
}
exports.defineMQHandlers = defineMQHandlers;
//# sourceMappingURL=MQHandlerUtils.js.map