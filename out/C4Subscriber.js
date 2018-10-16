"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const C4MQTypes_1 = require("./C4MQTypes/C4MQTypes");
const MQHandlerUtils_1 = require("./Annotation/MQHandlerUtils");
const C4Queue_1 = __importDefault(require("./C4Queue"));
const c4utils_1 = require("c4utils");
class C4Subscriber {
    constructor() {
        this.m_Queue = null;
        this.m_DefaultPublisher = "";
        this.m_SubscribeOptions = [];
        this.m_CBs = {};
        this.m_CBs[C4MQTypes_1.DEFAULT_PUBLISHER] = {};
        this.m_CBs[C4MQTypes_1.DEFAULT_PUBLISHER][C4MQTypes_1.DEFAULT_ROUTE] = {};
        this.m_Logger = null;
    }
    /**
     * 初始化
     * @param Conn C4MQ连接，MQ连接
     * @param option C4SubscriberOption
     * @param logger 日志对象
     */
    init(Conn, option, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isInit()) {
                return true;
            }
            if (logger) {
                this.m_Logger = logger;
            }
            if (!Conn.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Subscriber init : Invalid C4MQ.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Subscriber init : Invalid C4MQ."));
                    return false;
                }
                else {
                    throw new Error("C4Subscriber init : Invalid C4MQ.");
                }
            }
            if (option.subscribeOptions) {
                this.m_SubscribeOptions = option.subscribeOptions;
            }
            let Name = option.name;
            this.m_DefaultPublisher = option.publisherName;
            delete option.subscribeOptions;
            delete option.name;
            delete option.publisherName;
            this.m_CBs[this.m_DefaultPublisher] = {
                "@_Default_Route_@": {}
            };
            let CurQueue = new C4Queue_1.default();
            yield CurQueue.declared(Conn, Name, option);
            this.m_Queue = CurQueue;
            return true;
        });
    }
    /**
     * 添加订阅配置
     * @param option C4SubscribeOption
     */
    addSubscribe(option) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Subscriber addSubscribe : Not init.")) ||
                    (this.m_Logger.error && this.m_Logger.error("C4Subscriber addSubscribe : Not init."));
                return false;
            }
            else {
                throw new Error("C4Subscriber addSubscribe : Not init.");
            }
        }
        this.m_SubscribeOptions.push(option);
        return true;
    }
    /**
     * 开始订阅
     */
    subscribe( /*option : C4SubscribeOption, CB : SubscribeCallback*/) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Subscriber subscribe : Not init.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Subscriber subscribe : Not init."));
                }
                throw new Error("C4Subscriber subscribe : Not init.");
            }
            for (let i = 0; i < this.m_SubscribeOptions.length; i++) {
                let CurSubscribeOption = this.m_SubscribeOptions[i];
                let PublisherName = "";
                let RoutingKey = "";
                if (CurSubscribeOption.publisherName)
                    PublisherName = CurSubscribeOption.publisherName; // 存在Publisher配置
                if (CurSubscribeOption.routingKey)
                    RoutingKey = CurSubscribeOption.routingKey; // 存在RoutingKey配置
                if (PublisherName !== "") {
                    // 有配置Exchange
                    yield this.m_Queue.bindExchange(PublisherName, RoutingKey);
                    yield this.m_Queue.subscribe(CurSubscribeOption.subscribeOption);
                }
                else {
                    // 没有Exchagne就绑定到默认设置的Exchange上
                    yield this.m_Queue.bindExchange(this.m_DefaultPublisher, RoutingKey);
                    yield this.m_Queue.subscribe(CurSubscribeOption.subscribeOption);
                    PublisherName = C4MQTypes_1.DEFAULT_PUBLISHER;
                }
                if (RoutingKey === "")
                    RoutingKey = C4MQTypes_1.DEFAULT_ROUTE;
                // 构建Object
                if (c4utils_1.TypeUtils.isEmptyObj(this.m_CBs[PublisherName])) {
                    this.m_CBs[PublisherName] = {};
                }
                if (c4utils_1.TypeUtils.isEmptyObj(this.m_CBs[PublisherName][RoutingKey])) {
                    this.m_CBs[PublisherName][RoutingKey] = {};
                }
                let msgTypeKeys = Object.keys(CurSubscribeOption.CBs);
                for (let j = 0; j < msgTypeKeys.length; j++) {
                    this.m_CBs[PublisherName][RoutingKey][msgTypeKeys[j]] = CurSubscribeOption.CBs[msgTypeKeys[j]];
                }
            }
            // 绑定分发函数
            this.__processMsg();
        });
    }
    /**
     * 消息处理方法
     */
    __processMsg() {
        return __awaiter(this, void 0, void 0, function* () {
            let Self = this;
            yield this.m_Queue.peekMsg(function (message, headers, deliveryInfo, ack) {
                return __awaiter(this, void 0, void 0, function* () {
                    let CurExchangeName = deliveryInfo.exchange;
                    let CurRoutingKey = deliveryInfo.routingKey;
                    let CurMsgType = message.msgType;
                    if (CurMsgType) {
                        let CurMsgHandler = null;
                        // 优先使用针对Exchange的处理方法
                        do {
                            if (c4utils_1.TypeUtils.isEmptyObj(Self.m_CBs[CurExchangeName]))
                                break; // 没找到对应Exchange
                            if (c4utils_1.TypeUtils.isEmptyObj(Self.m_CBs[CurExchangeName][CurRoutingKey])) { // 没找到对应Routing
                                if (c4utils_1.TypeUtils.isEmptyObj(Self.m_CBs[CurExchangeName][C4MQTypes_1.DEFAULT_ROUTE]))
                                    break; // 默认的Routing也不存在
                                if (Self.m_CBs[CurExchangeName][C4MQTypes_1.DEFAULT_ROUTE][CurMsgType]) { // 默认的Routing下有对应的MsgTeyp处理方法
                                    CurMsgHandler = Self.m_CBs[CurExchangeName][C4MQTypes_1.DEFAULT_ROUTE][CurMsgType];
                                }
                                break; // 默认Routing下没有对应的MsgType的处理方法
                            }
                            // 对应的Routing存在
                            if (Self.m_CBs[CurExchangeName][CurRoutingKey][CurMsgType]) { // 对应Routing下有MsgType的处理方法
                                CurMsgHandler = Self.m_CBs[CurExchangeName][CurRoutingKey][CurMsgType];
                            }
                            break; // 对应Routing下没有MsgType的处理方法
                        } while (false);
                        if (null === CurMsgHandler) {
                            // 精确匹配没有找到，查找默认方法
                            do {
                                if (c4utils_1.TypeUtils.isEmptyObj(Self.m_CBs[C4MQTypes_1.DEFAULT_PUBLISHER]))
                                    break;
                                if (c4utils_1.TypeUtils.isEmptyObj(Self.m_CBs[C4MQTypes_1.DEFAULT_PUBLISHER][CurRoutingKey])) {
                                    if (c4utils_1.TypeUtils.isEmptyObj(Self.m_CBs[C4MQTypes_1.DEFAULT_PUBLISHER][C4MQTypes_1.DEFAULT_ROUTE]))
                                        break;
                                    if (Self.m_CBs[C4MQTypes_1.DEFAULT_PUBLISHER][C4MQTypes_1.DEFAULT_ROUTE][CurMsgType]) {
                                        CurMsgHandler = Self.m_CBs[C4MQTypes_1.DEFAULT_PUBLISHER][C4MQTypes_1.DEFAULT_ROUTE][CurMsgType];
                                    }
                                    break;
                                }
                                if (Self.m_CBs[C4MQTypes_1.DEFAULT_PUBLISHER][CurRoutingKey][CurMsgType]) {
                                    CurMsgHandler = Self.m_CBs[C4MQTypes_1.DEFAULT_PUBLISHER][CurRoutingKey][CurMsgType];
                                }
                                break;
                            } while (false);
                        }
                        if (null === CurMsgHandler) {
                            if (Self.m_Logger) {
                                let err = `C4Subscriber process msg : can't find Msg Handler.ExN : ${CurExchangeName}, RK : ${CurRoutingKey}, MT : ${CurMsgType}.`;
                                Self.m_Logger.err ? Self.m_Logger.err(err) : Self.m_Logger.error(err);
                            }
                            // return null;    // 没有找到任何合适的处理方法，重新入队
                            return false; // 没有找到合适的处理方法，抛弃消息
                        }
                        let Res;
                        try {
                            Res = yield CurMsgHandler(message, headers, deliveryInfo, ack);
                        }
                        catch (error) {
                            if (Self.m_Logger) {
                                (Self.m_Logger.err && Self.m_Logger.err(error)) ||
                                    (Self.m_Logger.error && Self.m_Logger.error(error));
                                // 重新入队
                                // Res = null;
                                // 不再重排
                                Res = false;
                            }
                            else {
                                throw error;
                            }
                        }
                        return Res;
                    }
                    else {
                        // 消息格式错误，抛弃
                        return false;
                    }
                });
            });
            setTimeout(() => {
                Self.__processMsg();
            }, 20);
        });
    }
    addMQHandler(arg) {
        return __awaiter(this, void 0, void 0, function* () {
            const handlers = MQHandlerUtils_1.getMQHandlers(arg);
            let MQHandlers = MQHandlerUtils_1.defineMQHandlers(handlers, null);
            for (let i = 0; i < MQHandlers.length; i++) {
                let CurSubOpt = MQHandlers[i];
                this.m_SubscribeOptions.push(CurSubOpt);
            }
        });
    }
    /**
     * 是否初始化
     */
    isInit() {
        return !(this.m_Queue === null);
    }
    /**
     * 获取Queue的名字
     */
    getName() {
        if (this.m_Queue) {
            return this.m_Queue.getName();
        }
        return "";
    }
}
exports.default = C4Subscriber;
/**
 * 支持绑定多个Exchange
 * 支持绑定多个Key
 */
//# sourceMappingURL=C4Subscriber.js.map