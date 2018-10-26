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
const amqp_1 = require("amqp");
class C4MQ {
    constructor() {
        this.m_Channel = null;
    }
    /**
     * 初始化，用于配置Channel和连接MQ
     * @param config ConnectionOptions
     * @param logger 日志对象
     */
    init(config, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.m_Channel)
                return;
            this.m_Logger = logger;
            this.m_Logger && this.m_Logger.debug && this.m_Logger.debug("C4MQ init...");
            let NewChannel = amqp_1.createConnection(config);
            this.m_Logger && (this.m_Logger.debug ? this.m_Logger.debug("C4MQ connect...") : "");
            let Self = this;
            yield new Promise((resolve, reject) => {
                NewChannel.on('error', (e) => {
                    if (Self.m_Channel === null)
                        return reject(e);
                    if (Self.m_Logger) {
                        (Self.m_Logger.err && Self.m_Logger.err("C4MQ error : " + e)) ||
                            (Self.m_Logger.error && Self.m_Logger.error("C4MQ error : " + e));
                    }
                });
                NewChannel.on('ready', () => {
                    Self.m_Logger && Self.m_Logger.debug && Self.m_Logger.debug("C4MQ connected.");
                    resolve();
                });
            });
            this.m_Channel = NewChannel;
            this.m_Logger && this.m_Logger.debug && this.m_Logger.debug("C4MQ init finished.");
        });
    }
    /**
     * 断开连接
     */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.m_Channel === null) {
                return;
            }
            this.m_Logger && this.m_Logger.debug && this.m_Logger.debug("C4MQ disconnect...");
            this.m_Channel.disconnect();
            let Self = this;
            yield new Promise((resolve, reject) => {
                Self.m_Channel.on('close', () => {
                    resolve();
                    Self.m_Channel = null;
                });
            });
            this.m_Logger && this.m_Logger.debug && this.m_Logger.debug("C4MQ disconnected.");
        });
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
exports.default = C4MQ;
//# sourceMappingURL=C4MQ.js.map