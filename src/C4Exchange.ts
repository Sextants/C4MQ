import { AMQPClient, AMQPExchange, ExchangePublishOptions as abc } from "amqp";
import { ExchangeOptions, ExchangePublishOptions } from "./C4MQTypes/C4MQTypes";
import C4MQ from "./C4MQ";

export default class C4Exchange {

    private m_Channel   : AMQPClient | null;
    private m_Exchange  : AMQPExchange | null;
    private m_Name      : string;
    private m_Logger    : any | null;

    constructor() {
        this.m_Channel  = null;
        this.m_Exchange = null;
        this.m_Name     = "";
        this.m_Logger   = null;
    }

    /**
     * 声明Exchange
     * @param Conn C4MQ，MQ连接
     * @param name Exchange名
     * @param options ExchangeOptions，配置属性
     * @param logger 日志对象
     */
    async declared(Conn : C4MQ, name : string, options : ExchangeOptions, logger ?: any) {
        if (this.isInit()) {
            return;
        }

        if (logger) this.m_Logger   = logger;

        this.m_Channel  = Conn.getChannel();
        let Self        = this;
        let exchange    = null;
        await new Promise((resolve, reject) => {
            exchange = (<AMQPClient>Self.m_Channel).exchange(name, options,
                () => {
                resolve();
            });
        });
        this.m_Name     = name;
        this.m_Exchange = exchange;
    }

    /**
     * 发布消息
     * @param routingKey routingKey
     * @param message message
     * @param options ExchangePublishOptions，配置项
     */
    async publish(routingKey : string, message : Buffer | {}, options : ExchangePublishOptions) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Exchange publish : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Exchange publish : Not init."));
            } else {
                throw new Error('C4Exchange not init.');
            }
        }

        let Self = this;
        await new Promise((resolve, reject) => {
            (<AMQPExchange>Self.m_Exchange).publish(routingKey, message, <abc>options, (err, msg) => {
                if (err === true) {
                    return reject(msg);
                }
                resolve();
            })
        });
    }

    /**
     * 销毁
     * @param ifUnused 是否在不再使用时销毁
     */
    destroy(ifUnused = true) {
        if (!this.isInit()) {
            return;
        }

        (<AMQPExchange>this.m_Exchange).destroy(ifUnused);
        this.m_Exchange = null;
    }

    /**
     * 绑定到另一个Exchange
     * @param srcExchangeName exchange的名字
     * @param routingKey routingkey
     */
    async bindExchange(srcExchangeName : string, routingKey : string) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Exchange bindExchange : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Exchange bindExchange : Not init."));
            } else {
                throw new Error("C4Exchange not init.");
            }
        }

        let Self = this;
        await new Promise((resolve, reject) => {
            (<AMQPExchange>Self.m_Exchange).bind(srcExchangeName, routingKey, () => {
                resolve();
            });
        });
    }

    /**
     * 解除绑定
     * @param srcExchangeName exchange名
     * @param routingKey routingKey
     */
    async unbindExchange(srcExchangeName : string, routingKey : string) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Exchange unbindExchange : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Exchange unbindExchange : Not init."));
            } else {
                throw new Error("C4Exchange not init.");
            }
        }

        let Self = this;
        await new Promise((resolve, reject) => {
            (<AMQPExchange>Self.m_Exchange).unbind(srcExchangeName, routingKey, () => {
                resolve();
            });
        });
    }

    /**
     * 绑定Header
     * @param exchangeName exchange名
     * @param routingKey routingKey
     */
    async bindHeaders(exchangeName : string, routingKey : string) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Exchange bindHeaders : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Exchange bindHeaders : Not init."));
            } else {
                throw new Error("C4Exchange not init.");
            }
        }

        let Self = this;
        await new Promise((resolve, reject) => {
            (<AMQPExchange>Self.m_Exchange).bind_headers(exchangeName, routingKey, () => {
                resolve();
            });
        });
    }

    /**
     * 获取Exchange的实例
     */
    getExchagneInstance() {
        return this.m_Exchange;
    }

    /**
     * 是否初始化
     */
    isInit() {
        return !(this.m_Exchange === null);
    }

    /**
     * 获取Exchange名
     */
    getName() {
        return this.m_Name;
    }
}
