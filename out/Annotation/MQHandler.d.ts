import 'reflect-metadata';
import { MQHandlerOptions } from './MQHandlerType';
/**
 *
 * @param MsgType    消息名
 * @param RoutingKey RoutingKey
 * TODO:增加对RouteKey通配符的支持
 */
export declare function MQHandler(option: {
    PublisherName?: string;
    RoutingKey?: string;
    MsgType: string;
}): (target: any, key: string, descriptor: PropertyDescriptor) => void;
/**
 *
 * @param options 消息体中属性的名字
 */
export declare function MsgBody(options: {
    value: string;
}): (target: any, key: string, index: number) => void;
export declare function getMQHandlerOptions(target: any): MQHandlerOptions;
