import { C4SubscribeOption } from '../C4MQTypes/C4MQTypes';
export declare function getMQHandlers(arg: Array<any | string>, debug?: boolean): any[];
export declare function defineMQHandlers(handlers: Array<any>, logger: any): C4SubscribeOption[];
