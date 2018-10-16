import { C4PublisherOption, ExchangePublishOptions, ExchangeOptions } from "./C4MQTypes/C4MQTypes";
import C4MQ from "./C4MQ";
import C4Exchange from "./C4Exchange";
import { TypeUtils } from "c4utils";

export default class C4Publisher {

    private m_Exchagne      : C4Exchange | null;
    private m_PublishOption : ExchangePublishOptions;
    private m_RoutingKey    : string;
    private m_Logger        : any | null;

    constructor() {
        this.m_Exchagne         = null;
        this.m_PublishOption    = {};
        this.m_RoutingKey       = "";
        this.m_Logger           = null;
    }

    /**
     * 初始化
     * @param Conn C4MQ，MQ连接
     * @param option C4PublisherOption
     * @param logger 日志对象
     */
    async init(Conn : C4MQ, option : C4PublisherOption, logger ?: any) {
        if (this.isInit()) {
            return true;
        }

        if (logger) {
            this.m_Logger   = logger;
        }

        if (!Conn.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Publisher init : Invalid C4MQ.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Publisher init: Invalid C4MQ."));
                return false;
            } else {
                throw new Error("C4Publisher init : Invalid C4MQ.");
            }
        }

        if (option.publicOption)
            this.m_PublishOption    = option.publicOption;

        this.m_RoutingKey   = option.routingKey;

        let Name = option.name;
        delete option.name;
        delete option.publicOption;
        delete option.routingKey;
        
        let CurExchange = new C4Exchange();
        await CurExchange.declared(Conn, Name, option);
        this.m_Exchagne = CurExchange;

        return true;
    }

    /**
     * 发布消息
     * @param message 消息
     * @param routingKey routingKey
     * @param option ExchangePublishOptions
     */
     async publish(message : {} | Buffer, routingKey ?: string, option ?: ExchangePublishOptions) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Publisher publish : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Publisher publish: Not init."));
            }
            throw new Error("C4Publisher publish : Not init.");
        }
        
        let CurOption   = this.m_PublishOption;
        let CurRoute    = this.m_RoutingKey;
        if (routingKey) {
            CurRoute = routingKey;
        }
        if (option && TypeUtils.isEmptyObj(option)) {
            CurOption   = option;
        }

        return (<C4Exchange>this.m_Exchagne).publish(CurRoute, message, CurOption);
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
