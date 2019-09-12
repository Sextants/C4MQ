"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class C4Queue {
    constructor() {
        this.m_Channel = null;
        this.m_Queue = null;
        this.m_Name = "";
        this.m_ConsumerTag = "";
        this.m_MsgQueue = [];
        this.m_Logger = null;
    }
    /**
     * 声明
     * @param Conn 连接
     * @param name 名字
     * @param options QueueOptions
     * @param logger 日志
     */
    declared(Conn, name, options, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isInit()) {
                return;
            }
            if (logger)
                this.m_Logger = logger;
            this.m_Channel = Conn.getChannel();
            let Self = this;
            let Queue = null;
            yield new Promise((resolve, reject) => {
                Queue = Self.m_Channel.queue(name, options, () => {
                    resolve();
                });
            });
            this.m_Name = name;
            this.m_Queue = Queue;
            this.m_MsgQueue = [];
        });
    }
    /**
     * 销毁
     * @param options {
     *  ifUnused : boolean,     // 是否在不用后销毁
     *  isEmpty : boolean,      // 是否在空后后销毁
     * }
     */
    desroy(options) {
        if (!this.isInit())
            return;
        this.m_Queue.destroy(options);
        this.m_Queue = null;
    }
    /**
     * 绑定Excahnge
     * @param exchangeName excahnge的名字
     * @param routingKey routingKey
     */
    bindExchange(exchangeName, routingKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Queue bindExchange : Not init.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Queue bindExchange : Not init."));
                }
                else {
                    throw new Error('C4Queue not init.');
                }
            }
            let Self = this;
            yield new Promise((resolve, reject) => {
                Self.m_Queue.bind(exchangeName, routingKey, (queue) => {
                    resolve();
                });
            });
        });
    }
    /**
     * 解绑
     * @param exchangeName exchange的名字
     * @param routingKey routingKey
     */
    unbindExchange(exchangeName, routingKey) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue unbindExchange : Not init.")) ||
                    (this.m_Logger.error && this.m_Logger.error("C4Queue unbindExchange : Not init."));
            }
            else {
                throw new Error("C4Queue not init.");
            }
        }
        this.m_Queue.unbind(exchangeName, routingKey);
    }
    /**
     * 绑定Headers
     * @param exchangeName excahnge名字
     * @param routingKey routingKey
     */
    bindHeaders(exchangeName, routingKey) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue bindHeaders : Not init.")) ||
                    (this.m_Logger.error && this.m_Logger.error("C4Queue bindHeaders : Not init."));
            }
            else {
                throw new Error("C4Queue not init.");
            }
        }
        this.m_Queue.bind_headers(exchangeName, routingKey);
    }
    /**
     * 解绑Headers
     * @param exchangeName exchange名
     * @param routingKey routingKeys
     */
    unbindHeaders(exchangeName, routingKey) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Queue unbindHeaders : Not init.")) ||
                    (this.m_Logger.error && this.m_Logger.error("C4Queue unbindHeaders : Not init."));
            }
            else {
                throw new Error("C4Queue not init.");
            }
        }
        if (this.m_ConsumerTag !== "")
            this.m_Queue.unbind_headers(exchangeName, routingKey);
    }
    /**
     * 订阅消息
     * @param options 订阅配置
     * @param CB 消息处理方法，如果不设置，则采用内部机制
     *
     */
    subscribe(options, CB) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Queue subscribe : Not init.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Queue subscribe : Not init."));
                }
                else {
                    throw new Error("C4Queue not init.");
                }
            }
            let Self = this;
            let CurCB;
            if ((typeof CB) === "function") {
                CurCB = CB;
            }
            else {
                CurCB = function (message, headers, deliveryInfo, ack) {
                    Self.m_MsgQueue.push({
                        message: message,
                        headers: headers,
                        deliveryInfo: deliveryInfo,
                        ack: ack
                    });
                };
            }
            yield new Promise((resolve, reject) => {
                this.m_Queue.subscribe(options, CurCB).addCallback((ok) => {
                    Self.m_ConsumerTag = ok.consumerTag;
                    // console.log(JSON.stringify(ok));
                    // console.log(`subscribe : ${Self.m_ConsumerTag}`);
                    resolve();
                });
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
            }
            else {
                throw new Error("C4Queue not init.");
            }
        }
        this.m_Queue.unsubscribe(this.m_ConsumerTag);
    }
    /**
     * 取消息并处理
     * @param CB 消息处理方法
     * 订阅消息时没有设置处理方法，则会进行内部处理，然后使用该方法进行单个消息的处理
     * CB返回true，则消息正常ack
     * CB返回false，则消息丢弃不会重排
     * CB抛异常，则消息重排
     */
    peekMsg(CB) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Queue peekMsg : Not init.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Queue peekMsg : Not init."));
                }
                else {
                    throw new Error('C4Queue not init.');
                }
            }
            if (this.m_MsgQueue.length > 0) {
                let CurMsg = this.m_MsgQueue.shift();
                let res;
                try {
                    res = yield CB(CurMsg.message, CurMsg.headers, CurMsg.deliveryInfo, CurMsg.ack);
                }
                catch (error) {
                    res = null;
                }
                if (res === true) {
                    // 正常消费
                    CurMsg.ack.acknowledge(false);
                }
                else if (res === false) {
                    // 消息格式错误，不再重排
                    CurMsg.ack.reject(false);
                    // (<AMQPQueue>this.m_Queue).shift(true, false);
                }
                else {
                    // 处理过程异常，重排
                    CurMsg.ack.reject(true);
                    // (<AMQPQueue>this.m_Queue).shift(false, true)
                }
            }
            return this.m_MsgQueue.length;
        });
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
exports.default = C4Queue;
//# sourceMappingURL=C4Queue.js.map