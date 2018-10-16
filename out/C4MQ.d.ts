import { ConnectionOptions } from "./C4MQTypes/C4MQTypes";
import { AMQPClient } from "amqp";
export default class C4MQ {
    private m_Channel;
    private m_Logger;
    constructor();
    /**
     * 初始化，用于配置Channel和连接MQ
     * @param config ConnectionOptions
     * @param logger 日志对象
     */
    init(config: ConnectionOptions, logger?: any): Promise<void>;
    /**
     * 断开连接
     */
    disconnect(): Promise<void>;
    /**
     * 获取mq的Channel对象
     */
    getChannel(): AMQPClient | null;
    /**
     * 是否初始化
     */
    isInit(): boolean;
}
