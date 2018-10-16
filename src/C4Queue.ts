import { AMQPClient, AMQPQueue } from "amqp";
import { QueueOptions, SubscribeOptions, SubscribeCallback, DeliveryInfo, Ack } from './C4MQTypes/C4MQTypes';
import C4MQ from "./C4MQ";


export default class C4Queue {

    private m_Channel       : AMQPClient | null;
    private m_Queue         : AMQPQueue | null;
    private m_Name          : string;
    private m_ConsumerTag   : string;
    private m_MsgQueue      : any[];
    private m_Logger        : any | null;

    constructor() {
        this.m_Channel      = null;
        this.m_Queue        = null;
        this.m_Name         = "";
        this.m_ConsumerTag  = "";
        this.m_MsgQueue     = [];
        this.m_Logger       = null;
    }

    /**
     * 声明
     * @param Conn 连接
     * @param name 名字
     * @param options QueueOptions
     * @param logger 日志
     */
    async declared(Conn : C4MQ, name : string, options : QueueOptions, logger ?: any) {
        if (this.isInit()) {
            return;
        }

        if (logger) this.m_Logger = logger;

        this.m_Channel  = Conn.getChannel();
        let Self        = this;
        let Queue       = null;
        await new Promise((resolve, reject) => {
            Queue = (<AMQPClient>Self.m_Channel).queue(name, options, () => {
                resolve();
            });
        });

        this.m_Name     = name;
        this.m_Queue    = Queue;
        this.m_MsgQueue = [];
    }

    /**
     * 销毁
     * @param options {
     *  ifUnused : boolean,     // 是否在不用后销毁
     *  isEmpty : boolean,      // 是否在空后后销毁
     * }
     */
    desroy(options : { ifUnused : boolean, isEmpty : boolean}) {
        if (!this.isInit())
            return;

        (<AMQPQueue>this.m_Queue).destroy(options);
        this.m_Queue = null;
    }

    /**
     * 绑定Excahnge
     * @param exchangeName excahnge的名字
     * @param routingKey routingKey
     */
    async bindExchange(exchangeName : string, routingKey : string) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue bindExchange : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Queue bindExchange : Not init."));
            } else {
                throw new Error('C4Queue not init.');
            }
        }

        let Self = this;
        await new Promise((resolve, reject) => {
            (<AMQPQueue>Self.m_Queue).bind(exchangeName, routingKey, (queue) => {
                resolve();
            });
        });
    }

    /**
     * 解绑
     * @param exchangeName exchange的名字
     * @param routingKey routingKey
     */
    unbindExchange(exchangeName : string, routingKey : string) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue unbindExchange : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Queue unbindExchange : Not init."));
            } else {
                throw new Error("C4Queue not init.");
            }
        }

        (<AMQPQueue>this.m_Queue).unbind(exchangeName, routingKey);
    }

    /**
     * 绑定Headers
     * @param exchangeName excahnge名字
     * @param routingKey routingKey
     */
    bindHeaders(exchangeName : string, routingKey : string) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue bindHeaders : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Queue bindHeaders : Not init."));
            } else {
                throw new Error("C4Queue not init.");
            }
        }

        (<AMQPQueue>this.m_Queue).bind_headers(exchangeName, routingKey);
    }

    /**
     * 解绑Headers
     * @param exchangeName exchange名
     * @param routingKey routingKeys
     */
    unbindHeaders(exchangeName : string, routingKey : string) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue unbindHeaders : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Queue unbindHeaders : Not init."));
            } else {
                throw new Error("C4Queue not init.");
            }
        }

        if (this.m_ConsumerTag !== "")
            (<AMQPQueue>this.m_Queue).unbind_headers(exchangeName, routingKey);
    }

    /**
     * 订阅消息
     * @param options 订阅配置
     * @param CB 消息处理方法，如果不设置，则采用内部机制
     * 
     */
    async subscribe(options : SubscribeOptions, CB ?: SubscribeCallback) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue subscribe : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Queue subscribe : Not init."));
            } else {
                throw new Error("C4Queue not init.");
            }
        }

        let Self = this;
        let CurCB : SubscribeCallback;
        if ((typeof CB) === "function") {
            CurCB = <SubscribeCallback>CB;
        } else {
            CurCB = function(message : any,
                headers : {[key : string] : any},
                deliveryInfo : DeliveryInfo,
                ack : Ack) {
                Self.m_MsgQueue.push({
                    message : message,
                    headers : headers,
                    deliveryInfo : deliveryInfo,
                    ack : ack
                });
            }
        }
        await new Promise((resolve, reject) => {
            (<any>(<AMQPQueue>this.m_Queue).subscribe(options, CurCB)).addCallback((ok : any) => {
                Self.m_ConsumerTag = ok.consumerTag;
                // console.log(JSON.stringify(ok));
                // console.log(`subscribe : ${Self.m_ConsumerTag}`);
                resolve();
            });
        });
    }

    /**
     * 取消订阅
     */
    unsubscribe() {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue unsubscribe : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Queue unsubscribe : Not init."));
            } else {
                throw new Error("C4Queue not init.");
            }
        }

        (<AMQPQueue>this.m_Queue).unsubscribe(this.m_ConsumerTag);
    }

    /**
     * 去消息并处理
     * @param CB 消息处理方法
     * 订阅消息时没有设置处理方法，则会进行内部处理，然后使用该方法进行单个消息的处理
     * CB返回true，则消息正常ack
     * CB返回false，则消息丢弃不会重排
     * CB抛异常，则消息重排
     */
    async peekMsg(CB : (message : any,
        headers : {[key : string] : any},
        deliveryInfo : DeliveryInfo,
        ack : Ack) => Promise<boolean> | boolean) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue peekMsg : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Queue peekMsg : Not init."));
            } else {
                throw new Error('C4Queue not init.');
            }
        }
        if (this.m_MsgQueue.length > 0) {
            let CurMsg = this.m_MsgQueue.shift();
            let res;
            try {
                res = await CB(CurMsg.message, CurMsg.headers, CurMsg.deliveryInfo, CurMsg.ack);
            } catch (error) {
                res = null;
            }
            
            if (res === true) {
                // 正常消费
                CurMsg.ack.acknowledge(false);
            } else if (res === false) {
                // 消息格式错误，不再重排
                CurMsg.ack.reject(false);
                // (<AMQPQueue>this.m_Queue).shift(true, false);
            } else {
                // 处理过程异常，重排
                CurMsg.ack.reject(true);
                // (<AMQPQueue>this.m_Queue).shift(false, true)
            }
        }

        return this.m_MsgQueue.length;
    }

    /**
     * 获取Queue实例
     */
    getQueueInstance() {
        return this.m_Queue;
    }

    /**
     * 是否已经初始化
     */
    isInit() {
        return !(this.m_Queue === null);
    }

    /**
     * 获取Queue名
     */
    getName() {
        return this.m_Name;
    }
}
