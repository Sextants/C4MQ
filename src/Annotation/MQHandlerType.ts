import { DeliveryInfo, Ack, SubscribeOptions } from "../C4MQTypes/C4MQTypes";

export interface MQHandlerOptions {
    Options : MQHandlerOption[];
    Body   ?: any;                      // 消息体与处理方式参数对应
}

export interface MQHandlerOption {
    Name            : string;                   // 方法名
    PublisherName  ?: string;                   // Exchange Name
    RoutingKey     ?: string;                   // RoutingKey
    MsgType         : string;                   // 消息名
    subscribeOption : SubscribeOptions;         // 订阅参数
    Handler        ?: (message : any,
        headers : {[key : string] : any},
        deliveryInfo : DeliveryInfo,
        ack : Ack) => void;      // 处理方法
};
