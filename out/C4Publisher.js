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
const C4Exchange_1 = __importDefault(require("./C4Exchange"));
const c4utils_1 = require("c4utils");
class C4Publisher {
    constructor() {
        this.m_Exchagne = null;
        this.m_PublishOption = {};
        this.m_RoutingKey = "";
        this.m_Logger = null;
    }
    /**
     * 初始化
     * @param Conn C4MQ，MQ连接
     * @param option C4PublisherOption
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
                    (this.m_Logger.err && this.m_Logger.err("C4Publisher init : Invalid C4MQ.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Publisher init: Invalid C4MQ."));
                    return false;
                }
                else {
                    throw new Error("C4Publisher init : Invalid C4MQ.");
                }
            }
            if (option.publicOption)
                this.m_PublishOption = option.publicOption;
            this.m_RoutingKey = option.routingKey;
            let Name = option.name;
            delete option.name;
            delete option.publicOption;
            delete option.routingKey;
            let CurExchange = new C4Exchange_1.default();
            yield CurExchange.declared(Conn, Name, option);
            this.m_Exchagne = CurExchange;
            return true;
        });
    }
    /**
     * 发布消息
     * @param message 消息
     * @param routingKey routingKey
     * @param option ExchangePublishOptions
     */
    publish(message, routingKey, option) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit()) {
                if (this.m_Logger) {
                    (this.m_Logger.err && this.m_Logger.err("C4Publisher publish : Not init.")) ||
                        (this.m_Logger.error && this.m_Logger.error("C4Publisher publish: Not init."));
                }
                throw new Error("C4Publisher publish : Not init.");
            }
            let CurOption = this.m_PublishOption;
            let CurRoute = this.m_RoutingKey;
            if (routingKey) {
                CurRoute = routingKey;
            }
            if (option && c4utils_1.TypeUtils.isEmptyObj(option)) {
                CurOption = option;
            }
            return this.m_Exchagne.publish(CurRoute, message, CurOption);
        });
    }
    /**
     * 是否初始化
     */
    isInit() {
        return !(this.m_Exchagne === null);
    }
    /**
     * 获取Exchange的名字
     */
    getName() {
        if (this.m_Exchagne) {
            return this.m_Exchagne.getName();
        }
        return "";
    }
}
exports.default = C4Publisher;
//# sourceMappingURL=C4Publisher.js.map