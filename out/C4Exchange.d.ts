import { AMQPExchange } from "amqp";
import { ExchangeOptions, ExchangePublishOptions } from "./C4MQTypes/C4MQTypes";
import C4MQ from "./C4MQ";
export default class C4Exchange {
    private m_Channel;
    private m_Exchange;
    private m_Name;
    private m_Logger;
    constructor();
    /**
     * 声明Exchange
     * @param Conn C4MQ，MQ连接
     * @param name Exchange名
     * @param options ExchangeOptions，配置属性
     * @param logger 日志对象
     */
    declared(Conn: C4MQ, name: string, options: ExchangeOptions, logger?: any): Promise<void>;
    /**
     * 发布消息
     * @param routingKey routingKey
     * @param message message
     * @param options ExchangePublishOptions，配置项
     */
    publish(routingKey: string, message: Buffer | {}, options: ExchangePublishOptions): Promise<void>;
    /**
     * 销毁
     * @param ifUnused 是否在不再使用时销毁
     */
    destroy(ifUnused?: boolean): void;
    /**
     * 绑定到另一个Exchange
     * @param srcExchangeName exchange的名字
     * @param routingKey routingkey
     */
    bindExchange(srcExchangeName: string, routingKey: string): Promise<void>;
    /**
     * 解除绑定
     * @param srcExchangeName exchange名
     * @param routingKey routingKey
     */
    unbindExchange(srcExchangeName: string, routingKey: string): Promise<void>;
    /**
     * 绑定Header
     * @param exchangeName exchange名
     * @param routingKey routingKey
     */
    bindHeaders(exchangeName: string, routingKey: string): Promise<void>;
    /**
     * 获取Exchange的实例
     */
    getExchagneInstance(): AMQPExchange | null;
    /**
     * 是否初始化
     */
    isInit(): boolean;
    /**
     * 获取Exchange名
     */
    getName(): string;
}
