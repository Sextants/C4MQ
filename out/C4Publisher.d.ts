import { C4PublisherOption, ExchangePublishOptions } from "./C4MQTypes/C4MQTypes";
import C4MQ from "./C4MQ";
export default class C4Publisher {
    private m_Exchagne;
    private m_PublishOption;
    private m_RoutingKey;
    private m_Logger;
    constructor();
    /**
     * 初始化
     * @param Conn C4MQ，MQ连接
     * @param option C4PublisherOption
     * @param logger 日志对象
     */
    init(Conn: C4MQ, option: C4PublisherOption, logger?: any): Promise<boolean>;
    /**
     * 发布消息
     * @param message 消息
     * @param routingKey routingKey
     * @param option ExchangePublishOptions
     */
    publish(message: {} | Buffer, routingKey?: string, option?: ExchangePublishOptions): Promise<void>;
    /**
     * 是否初始化
     */
    isInit(): boolean;
    /**
     * 获取Exchange的名字
     */
    getName(): string;
}
