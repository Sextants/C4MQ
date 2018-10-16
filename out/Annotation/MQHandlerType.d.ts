import { DeliveryInfo, Ack, SubscribeOptions } from "../C4MQTypes/C4MQTypes";
export interface MQHandlerOptions {
    Options: MQHandlerOption[];
    Body?: any;
}
export interface MQHandlerOption {
    Name: string;
    PublisherName?: string;
    RoutingKey?: string;
    MsgType: string;
    subscribeOption: SubscribeOptions;
    Handler?: (message: any, headers: {
        [key: string]: any;
    }, deliveryInfo: DeliveryInfo, ack: Ack) => void;
}
