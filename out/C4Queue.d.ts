import { AMQPQueue } from "amqp";
import { QueueOptions, SubscribeOptions, SubscribeCallback, DeliveryInfo, Ack } from './C4MQTypes/C4MQTypes';
import C4MQ from "./C4MQ";
export default class C4Queue {
    private m_Channel;
    private m_Queue;
    private m_Name;
    private m_ConsumerTag;
    private m_MsgQueue;
    private m_Logger;
    constructor();
    /**
     * 声明
     * @param Conn 连接
     * @param name 名字
     * @param options QueueOptions
     * @param logger 日志
     */
    declared(Conn: C4MQ, name: string, options: QueueOptions, logger?: any): Promise<void>;
    /**
     * 销毁
     * @param options {
     *  ifUnused : boolean,     // 是否在不用后销毁
     *  isEmpty : boolean,      // 是否在空后后销毁
     * }
     */
    desroy(options: {
        ifUnused: boolean;
        isEmpty: boolean;
    }): void;
    /**
     * 绑定Excahnge
     * @param exchangeName excahnge的名字
     * @param routingKey routingKey
     */
    bindExchange(exchangeName: string, routingKey: string): Promise<void>;
    /**
     * 解绑
     * @param exchangeName exchange的名字
     * @param routingKey routingKey
     */
    unbindExchange(exchangeName: string, routingKey: string): void;
    /**
     * 绑定Headers
     * @param exchangeName excahnge名字
     * @param routingKey routingKey
     */
    bindHeaders(exchangeName: string, routingKey: string): void;
    /**
     * 解绑Headers
     * @param exchangeName exchange名
     * @param routingKey routingKeys
     */
    unbindHeaders(exchangeName: string, routingKey: string): void;
    /**
     * 订阅消息
     * @param options 订阅配置
     * @param CB 消息处理方法，如果不设置，则采用内部机制
     *
     */
    subscribe(options: SubscribeOptions, CB?: SubscribeCallback): Promise<void>;
    /**
     * 取消订阅
     */
    unsubscribe(): void;
    /**
     * 去消息并处理
     * @param CB 消息处理方法
     * 订阅消息时没有设置处理方法，则会进行内部处理，然后使用该方法进行单个消息的处理
     * CB返回true，则消息正常ack
     * CB返回false，则消息丢弃不会重排
     * CB抛异常，则消息重排
     */
    peekMsg(CB: (message: any, headers: {
        [key: string]: any;
    }, deliveryInfo: DeliveryInfo, ack: Ack) => Promise<boolean> | boolean): Promise<number>;
    /**
     * 获取Queue实例
     */
    getQueueInstance(): AMQPQueue | null;
    /**
     * 是否已经初始化
     */
    isInit(): boolean;
    /**
     * 获取Queue名
     */
    getName(): string;
}
