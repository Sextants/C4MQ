"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const c4utils_1 = require("c4utils");
const MQHANDLER_OPTIONS_KEY = "c4mq:handler_options";
/**
 *
 * @param MsgType    消息名
 * @param RoutingKey RoutingKey
 * TODO:增加对RouteKey通配符的支持
 */
function MQHandler(option) {
    return function (target, key, descriptor) {
        let HandlerOptions = getMQHandlerOptions(target);
        let CurOption = {
            Name: key,
            PublisherName: option.PublisherName,
            MsgType: option.MsgType,
            RoutingKey: option.RoutingKey,
            subscribeOption: {
                ack: true,
                prefetchCount: 8
            },
            Handler: descriptor.value
        };
        HandlerOptions.Options.push(CurOption);
        Reflect.defineMetadata(MQHANDLER_OPTIONS_KEY, HandlerOptions, target);
    };
}
exports.MQHandler = MQHandler;
/**
 *
 * @param options 消息体中属性的名字
 */
function MsgBody(options) {
    return function (target, key, index) {
        let HandlerOptions = getMQHandlerOptions(target);
        if (HandlerOptions.Body === undefined) {
            HandlerOptions.Body = {};
        }
        if (c4utils_1.TypeUtils.isEmptyObj(HandlerOptions.Body[key])) {
            HandlerOptions.Body[key] = [];
        }
        HandlerOptions.Body[key].push({
            index: index,
            value: options.value
        });
        Reflect.defineMetadata(MQHANDLER_OPTIONS_KEY, HandlerOptions, target);
    };
}
exports.MsgBody = MsgBody;
function getMQHandlerOptions(target) {
    let HandlerConfigs = Reflect.getMetadata(MQHANDLER_OPTIONS_KEY, target);
    if (HandlerConfigs === undefined) {
        HandlerConfigs = {
            Options: []
        };
        Reflect.defineMetadata(MQHANDLER_OPTIONS_KEY, HandlerConfigs, target);
    }
    return HandlerConfigs;
}
exports.getMQHandlerOptions = getMQHandlerOptions;
//# sourceMappingURL=MQHandler.js.map