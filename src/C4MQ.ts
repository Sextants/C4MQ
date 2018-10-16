import { ConnectionOptions } from "./C4MQTypes/C4MQTypes";
import { AMQPClient, createConnection } from "amqp";


export default class C4MQ {
    
    private m_Channel   : AMQPClient | null;
    private m_Logger    : any;

    constructor() {
        this.m_Channel  = null;
    }

    /**
     * 初始化，用于配置Channel和连接MQ
     * @param config ConnectionOptions
     * @param logger 日志对象
     */
    async init(config : ConnectionOptions, logger ?: any) {
        if (this.m_Channel)
            return;

        this.m_Logger   = logger;
        this.m_Logger && this.m_Logger.debug("C4MQ init...");
        let NewChannel = createConnection(config);

        this.m_Logger && this.m_Logger.debug("C4MQ connect...");
        let Self = this;
        await new Promise((resolve, reject) => {
            NewChannel.on('error', (e) => {
                if (Self.m_Channel === null)
                    return reject(e);

                if (Self.m_Logger) {
                    (Self.m_Logger.err && Self.m_Logger.err("C4MQ error : " + e)) ||
                    (Self.m_Logger.error && Self.m_Logger.error("C4MQ error : " + e));
                }
            });

            NewChannel.on('ready', () => {
                Self.m_Logger && Self.m_Logger.debug("C4MQ connected.");
                resolve();
            });
        });

        this.m_Channel  = NewChannel;
        this.m_Logger && this.m_Logger.debug("C4MQ init finished.");
    }

    /**
     * 断开连接
     */
    async disconnect() {
        if (this.m_Channel === null) {
            return;
        }

        this.m_Logger && this.m_Logger.debug("C4MQ disconnect...");
        this.m_Channel.disconnect();

        let Self = this;
        await new Promise((resolve, reject) => {
            (<AMQPClient>Self.m_Channel).on('close', () => {
                resolve();
                Self.m_Channel = null;
            });
        });
        this.m_Logger && this.m_Logger.debug("C4MQ disconnected.");
    }

    /**
     * 获取mq的Channel对象
     */
    getChannel() {
        return this.m_Channel;
    }

    /**
     * 是否初始化
     */
    isInit() {
        return !(this.m_Channel === null);
    }
}
