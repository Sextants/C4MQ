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
class C4Exchange {
    constructor() {
        this.m_Channel = null;
        this.m_Exchange = null;
        this.m_Name = "";
        this.m_Logger = null;
    }
    /**
     * 声明Exchange
     * @param Conn C4MQ，MQ连接
     * @param name Exchange名
     * @param options ExchangeOptions，配置属性
     * @param logger 日志对象
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
            let exchange = null;
            yield new Promise((resolve, reject) => {
                exchange = Self.m_Channel.exchange(name, options, () => {
                    resolve();
                });
            });
            this.m_Name = name;
            this.m_Exchange = exchange;
        });
    }
    /**
     * 发布消息
     * @param routingKey routingKey
     * @param message message
     * @param options ExchangePublishOptions，配置项
     */
    publish(routingKey, message, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Exchange publish : Not init.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Exchange publish : Not init."));
                }
                else {
                    throw new Error('C4Exchange not init.');
                }
            }
            let Self = this;
            yield new Promise((resolve, reject) => {
                Self.m_Exchange.publish(routingKey, message, options, (err, msg) => {
                    if (err === true) {
                        return reject(msg);
                    }
                    resolve();
                });
            });
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
        this.m_Exchange.destroy(ifUnused);
        this.m_Exchange = null;
    }
    /**
     * 绑定到另一个Exchange
     * @param srcExchangeName exchange的名字
     * @param routingKey routingkey
     */
    bindExchange(srcExchangeName, routingKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Exchange bindExchange : Not init.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Exchange bindExchange : Not init."));
                }
                else {
                    throw new Error("C4Exchange not init.");
                }
            }
            let Self = this;
            yield new Promise((resolve, reject) => {
                Self.m_Exchange.bind(srcExchangeName, routingKey, () => {
                    resolve();
                });
            });
        });
    }
    /**
     * 解除绑定
     * @param srcExchangeName exchange名
     * @param routingKey routingKey
     */
    unbindExchange(srcExchangeName, routingKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Exchange unbindExchange : Not init.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Exchange unbindExchange : Not init."));
                }
                else {
                    throw new Error("C4Exchange not init.");
                }
            }
            let Self = this;
            yield new Promise((resolve, reject) => {
                Self.m_Exchange.unbind(srcExchangeName, routingKey, () => {
                    resolve();
                });
            });
        });
    }
    /**
     * 绑定Header
     * @param exchangeName exchange名
     * @param routingKey routingKey
     */
    bindHeaders(exchangeName, routingKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Exchange bindHeaders : Not init.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Exchange bindHeaders : Not init."));
                }
                else {
                    throw new Error("C4Exchange not init.");
                }
            }
            let Self = this;
            yield new Promise((resolve, reject) => {
                Self.m_Exchange.bind_headers(exchangeName, routingKey, () => {
                    resolve();
                });
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
exports.default = C4Exchange;
//# sourceMappingURL=C4Exchange.js.map