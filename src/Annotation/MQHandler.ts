
import 'reflect-metadata';

import { TypeUtils } from 'c4utils';
import { MQHandlerOptions, MQHandlerOption } from './MQHandlerType';

const MQHANDLER_OPTIONS_KEY = "c4mq:handler_options";

/**
 * 
 * @param MsgType    消息名
 * @param RoutingKey RoutingKey
 * TODO:增加对RouteKey通配符的支持
 */
export function MQHandler(option : {PublisherName ?: string, RoutingKey ?: string, MsgType : string}) {
    return function (target : any, key : string, descriptor : PropertyDescriptor) {
        let HandlerOptions : MQHandlerOptions = getMQHandlerOptions(target);
        let CurOption : MQHandlerOption = {
            Name            : key,
            PublisherName   : option.PublisherName,
            MsgType         : option.MsgType,
            RoutingKey      : option.RoutingKey,
            subscribeOption : {
                ack : true,
                prefetchCount : 8
            },
            Handler         : descriptor.value
        };

        HandlerOptions.Options.push(CurOption);
        Reflect.defineMetadata(MQHANDLER_OPTIONS_KEY, HandlerOptions, target);
    }
}

/**
 * 
 * @param options 消息体中属性的名字
 */
export function MsgBody(options : {
    value : string
}) {
    return function(target : any, key : string, index : number) {
        let HandlerOptions : MQHandlerOptions = getMQHandlerOptions(target);
        if (HandlerOptions.Body === undefined) {
            HandlerOptions.Body = {};
        }
        if (TypeUtils.isEmptyObj(HandlerOptions.Body[key])) {
            HandlerOptions.Body[key] = [];
        }
        HandlerOptions.Body[key].push({
            index : index,
            value : options.value
        });
        Reflect.defineMetadata(MQHANDLER_OPTIONS_KEY, HandlerOptions, target);
    }
}

export function getMQHandlerOptions(target : any) {
    let HandlerConfigs : MQHandlerOptions = Reflect.getMetadata(MQHANDLER_OPTIONS_KEY, target);
    if (HandlerConfigs === undefined) {
        HandlerConfigs = {
            Options : []
        };
        Reflect.defineMetadata(MQHANDLER_OPTIONS_KEY, HandlerConfigs, target);
    }
    return HandlerConfigs;
}
