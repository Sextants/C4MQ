import glob         = require('glob');
import Path         = require('path');
import { TypeUtils, PathUtils, FSP } from 'c4utils';
import { MQHandlerOptions } from './MQHandlerType';
import { getMQHandlerOptions } from './MQHandler';
import { DeliveryInfo, Ack, C4SubscribeOption, SubscribeOptions } from '../C4MQTypes/C4MQTypes';

export function getMQHandlers(arg : Array<any | string>, debug : boolean = false) {
    let TargetDir = [
        './MQHandlers/',
        './out/MQHandlers/'
    ];

    if (TypeUtils.isArray(arg) && arg.length > 0) {
        let Models : any[] = [];
        for (let i = 0; i < TargetDir.length; i++) {
            let LoadPaths   = arg.reduce((paths : any[], dir) => {
                if (TypeUtils.isObject(dir)
                    && dir.dir
                    && TypeUtils.isString(dir.dir)
                    && !TypeUtils.isEmptyStr(dir.dir)
                ) {
                    if (!glob.hasMagic(dir.dir)) {
                        let parsedFile  = Path.parse(dir.dir);
                        let curPath     = Path.join(parsedFile.dir, parsedFile.name);
                        let fullPath    = Path.join(process.cwd(), TargetDir[i], curPath, '*.*');
                        let IsInside    = PathUtils.PathInside(process.cwd(), fullPath);
                        if (IsInside) {
                            paths.push(fullPath);
                            return paths;
                        }
                    }
                } else if (TypeUtils.isString(dir)
                    && !TypeUtils.isEmptyStr(dir)) {
                    if (!glob.hasMagic(dir)) {
                        let parsedFile  = Path.parse(dir);
                        let curPath     = Path.join(parsedFile.dir, parsedFile.name);
                        let fullPath    = Path.join(process.cwd(), TargetDir[i], curPath + '.*');
                        let IsInside    = PathUtils.PathInside(process.cwd(), fullPath);
                        if (IsInside) {
                            paths.push(fullPath);
                            return paths;
                        }
                    }
                }
            }, []);
            Models.push(...FSP.getModules(LoadPaths, "", debug));
        }

        return Models;
    }

    return arg as Array<any>;
}

function getBindBody(paramConfig : { index : number; value : string}[], message : any) {
    if (TypeUtils.isEmptyObj(paramConfig)) {
        return [];
    }

    let Params = [];
    let CurParamConfig  = paramConfig.reverse();
    for (let i = 0; i < CurParamConfig.length; i++) {
        let CurConifg = paramConfig[i];
        if (!TypeUtils.isNullOrUndefined(message[CurConifg.value])) {
            // for (let j = 0; j < (CurConifg.index - Params.length); j++) {
            //     Params.push(undefined);
            // }
            // Params.push(message[CurConifg.value]);
            Params[CurConifg.index] = message[CurConifg.value];
        } else {
            throw new Error("Need body property : " + CurConifg.value);
        }
    }

    return Params;
}

export function defineMQHandlers(handlers : Array<any>, logger : any) {
    let MQHandlers : C4SubscribeOption[] = [];
    let TempHandlers : any = {};
    let TempSubOption : any = {};
    handlers.forEach(handler => {
        let CurMQHandlerOptions : MQHandlerOptions = getMQHandlerOptions(handler);
        let CurOptions  = CurMQHandlerOptions.Options;
        let BodyOptions = CurMQHandlerOptions.Body;

        for (let i = 0; i< CurOptions.length; i++) {
            let CurOption   = CurOptions[i];
            let CurHandler  = async (message : any,
                headers : {[key : string] : any},
                deliveryInfo : DeliveryInfo,
                ack : Ack) => {
                let Params = [];

                // bind body param
                let BindBodyParams = [];
                let isError = false;
                try {
                    if (BodyOptions) {
                        BindBodyParams = getBindBody(BodyOptions[CurOption.Name], message);
                    }
                } catch (error) {
                    if (logger) {
                        (logger.err && logger.err(error)) ||
                        (logger.error && logger.error(error));
                        isError = true;
                    } else {
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

                let Result : any;
                try {
                    Result = await (<any>CurOption.Handler)(...Params);
                    if (!TypeUtils.isBoolean(Result)) {
                        Result = true;
                    }
                } catch (error) {
                    // 消息处理异常，应该重新入队
                    if (logger) {
                        (logger.err && logger.err(error)) ||
                        (logger.error && logger.error(error));
                        Result = null;
                    } else {
                        throw error;
                    }
                }

                return Result;

                // true为正常处理完
                // false为处理过程中发现问题，不重排，如果有死信队列，就入了死信队列
                // null处理异常了，重排
            };

            /// 
            let CurPublisherName = CurOption.PublisherName || "";
            let CurRoutingKey    = CurOption.RoutingKey || "";
            if (TypeUtils.isEmptyObj(TempHandlers[CurPublisherName])) {
                TempHandlers[CurPublisherName]  = {};
            }
            if (TypeUtils.isEmptyObj(TempHandlers[CurPublisherName][CurRoutingKey])) {
                TempHandlers[CurPublisherName][CurRoutingKey] = {};
            }
            TempHandlers[CurPublisherName][CurRoutingKey][CurOption.MsgType] = CurHandler;
            if (TypeUtils.isEmptyObj(TempSubOption[CurPublisherName])) {
                TempSubOption[CurPublisherName] = {};
            }
            if (TypeUtils.isEmptyObj(TempSubOption[CurPublisherName][CurRoutingKey])) {
                TempSubOption[CurPublisherName][CurRoutingKey] = CurOption.subscribeOption;
            }
        }

        let Publishers = Object.keys(TempHandlers);
        for (let i = 0; i < Publishers.length; i++) {
            let CurPublisher = TempHandlers[Publishers[i]];
            let Routings = Object.keys(CurPublisher);
            for (let j = 0; j < Routings.length; j++) {
                let CurRoute = CurPublisher[Routings[j]];
                let Msgs     = Object.keys(CurRoute);
                let CurSubOption : C4SubscribeOption = {
                    publisherName : Publishers[i],
                    routingKey    : Routings[j],
                    subscribeOption : TempSubOption[Publishers[i]][Routings[j]],
                    CBs : {}
                }
                for (let k = 0; k < Msgs.length; k++) {
                    let CurHL = CurRoute[Msgs[k]];
                    CurSubOption.CBs[Msgs[k]]   = CurHL;
                }
                if (!TypeUtils.isEmptyObj(CurSubOption.CBs)) {
                    MQHandlers.push(CurSubOption);
                }
            }
        }
    });

    return MQHandlers;
}
