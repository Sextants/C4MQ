import C4MQ from "./C4MQ";
import { C4SubscriberOption, C4SubscribeOption, SubscribeCallback, DEFAULT_PUBLISHER, DEFAULT_ROUTE } from "./C4MQTypes/C4MQTypes";
import { getMQHandlers, defineMQHandlers } from "./Annotation/MQHandlerUtils";
import C4Queue from "./C4Queue";
import { TypeUtils } from "c4utils";
import C4MQTopicRoute from "./C4MQTypes/C4MQTopicRoute";
import { DeliveryInfo, Ack } from './C4MQTypes/C4MQTypes';

type MsgCB = (message : any,
  headers : {[key : string] : any},
  deliveryInfo : DeliveryInfo,
  ack : Ack) => Promise<boolean> | boolean;

export default class C4Subscriber {

    private m_Queue             : C4Queue | null;
    private m_DefaultPublisher  : string;
    private m_SubscribeOptions  : C4SubscribeOption[];
    private m_Logger            : any | null;
    private m_CBs               : {
        "@_Default_Publisher_@" : {
            "@_Default_Route_@" : any
        }
    } | any;

    private m_ExCBs : {
      [key: string]: C4MQTopicRoute<{[key: string]: MsgCB}>
    }

    constructor() {
        this.m_Queue            = null;
        this.m_DefaultPublisher = "";
        this.m_SubscribeOptions = [];
        this.m_CBs              = {};
        this.m_CBs[DEFAULT_PUBLISHER]   = {};
        this.m_CBs[DEFAULT_PUBLISHER][DEFAULT_ROUTE] = {};
        this.m_Logger           = null;
        this.m_ExCBs            = {};
    }

    /**
     * 初始化
     * @param Conn C4MQ连接，MQ连接
     * @param option C4SubscriberOption
     * @param logger 日志对象
     */
    async init(Conn : C4MQ, option : C4SubscriberOption, logger ?: any) {
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
            } else {
                throw new Error("C4Subscriber init : Invalid C4MQ.");
            }
        }

        if (option.subscribeOptions) {
            this.m_SubscribeOptions  = option.subscribeOptions;
        }
        let Name                = option.name;
        this.m_DefaultPublisher = option.publisherName;

        delete option.subscribeOptions;
        delete option.name;
        delete option.publisherName;

        this.m_CBs[this.m_DefaultPublisher] = {
            "@_Default_Route_@" : {}
        };

        let CurQueue= new C4Queue();
        await CurQueue.declared(Conn, Name, option);
        this.m_Queue = CurQueue;

        return true;
    }

    /**
     * 添加订阅配置
     * @param option C4SubscribeOption
     */
    addSubscribe(option : C4SubscribeOption) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Subscriber addSubscribe : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Subscriber addSubscribe : Not init."));
                return false;
            } else {
                throw new Error("C4Subscriber addSubscribe : Not init.");
            }
        }

        this.m_SubscribeOptions.push(option);
        return true;
    }

    async subscribeEx() {
      if (!this.isInit()) {
        if (this.m_Logger) {
          (this.m_Logger.err && this.m_Logger.err("C4Subscriber subscribeEx : Not init.")) ||
          (this.m_Logger.error && this.m_Logger.error("C4Subscriber subscribeEx : Not init."));
        }
        throw new Error("C4Subscriber subscribeEx : Not init.");
      }

      for (let i = 0; i < this.m_SubscribeOptions.length; i++) {
        const curSubOption = this.m_SubscribeOptions[i];
        let PublisherName = curSubOption.publisherName || "";
        let RoutingKey = curSubOption.routingKey || "";
        if (PublisherName !== "") {
          // 配置了Exchange
          await (<C4Queue>this.m_Queue).bindExchange(PublisherName, RoutingKey);
          await (<C4Queue>this.m_Queue).subscribe(curSubOption.subscribeOption);
        } else {
          // 没有Exchange，绑定到默认设置的Exchagne上
          await (<C4Queue>this.m_Queue).bindExchange(this.m_DefaultPublisher, RoutingKey);
          await (<C4Queue>this.m_Queue).subscribe(curSubOption.subscribeOption);
          PublisherName = DEFAULT_PUBLISHER;
        }

        RoutingKey = RoutingKey || DEFAULT_ROUTE;

        if (TypeUtils.isEmptyObj(this.m_ExCBs[PublisherName])) {
          this.m_ExCBs[PublisherName] = new C4MQTopicRoute<{[key: string]: MsgCB}>();
          
        }
        let data = this.m_ExCBs[PublisherName].match(RoutingKey);
        if (data.find != true) {
          this.m_ExCBs[PublisherName].insert(RoutingKey, {})
        }
        data = this.m_ExCBs[PublisherName].match(RoutingKey);
        if (data.data == null ) {
          throw new Error("C4Subscriber subscribeEx : Unknown error.");
        }
        for (const key in curSubOption.CBs) {
          data.data[key] = curSubOption.CBs[key];
        }
      }

      this.__processMsgEx();
    }

    async __processMsgEx() {
      const Self = this;
      await (<C4Queue>this.m_Queue).peekMsg(async function(message, headers, deliveryInfo, ack) {
        const curExchangeName = deliveryInfo.exchange;
        const curRoutingKey   = deliveryInfo.routingKey;
        const curMsgType      = message.msgType;
        if (curMsgType) {
          let res = false;
          try {
            let curMsgHandler = null;
            do {
              if (TypeUtils.isEmptyObj(Self.m_ExCBs[curExchangeName])) break;
              const cbs = Self.m_ExCBs[curExchangeName].match(curRoutingKey);
              if (cbs.find !== true) break;
              if (TypeUtils.isEmptyObj(cbs.data) || TypeUtils.isNullOrUndefined(cbs.data[curMsgType])) break;

              curMsgHandler = cbs.data[curMsgType]
            } while(false);

            if (null === curMsgHandler) {
              if (Self.m_Logger) {
                let err = `C4Subscriber process msg : can't find Msg Handler.ExN : ${curExchangeName}, RK : ${curRoutingKey}, MT : ${curMsgType}.`;
                Self.m_Logger.err ? Self.m_Logger.err(err) : Self.m_Logger.error(err);
              }
              // return null;    // 没有找到任何合适的处理方法，重新入队
              return false;   // 没有找到合适的处理方法，抛弃消息
            }

            res = await curMsgHandler(message, headers, deliveryInfo, ack);
          } catch (error) {
            if (Self.m_Logger) {
              (Self.m_Logger.err && Self.m_Logger.err(error)) ||
              (Self.m_Logger.error && Self.m_Logger.error(error));
              // 重新入队 res = null;

              // 不再重排
              res = false;
            } else {
              throw error;
            }
          }

          return res;
        } else {
          // 消息格式错误，抛弃
          return false;
        }
      });

      setTimeout(() => {
        Self.__processMsgEx();
      }, 20);
    }

    /**
     * 开始订阅
     */
    async subscribe(/*option : C4SubscribeOption, CB : SubscribeCallback*/) {
        if (!this.isInit()) {
            if (this.m_Logger) {
                (this.m_Logger.err && this.m_Logger.err("C4Subscriber subscribe : Not init.")) ||
                (this.m_Logger.error && this.m_Logger.error("C4Subscriber subscribe : Not init."));
            }
            throw new Error("C4Subscriber subscribe : Not init.");
        }

        for (let i = 0; i < this.m_SubscribeOptions.length; i++) {
            let CurSubscribeOption = this.m_SubscribeOptions[i];
            let PublisherName   = "";
            let RoutingKey      = "";
            if (CurSubscribeOption.publisherName)
                PublisherName   = CurSubscribeOption.publisherName;     // 存在Publisher配置
            if (CurSubscribeOption.routingKey)
                RoutingKey      = CurSubscribeOption.routingKey;        // 存在RoutingKey配置
            
            if (PublisherName !== "") {
                // 有配置Exchange
                await (<C4Queue>this.m_Queue).bindExchange(PublisherName, RoutingKey);
                await (<C4Queue>this.m_Queue).subscribe(CurSubscribeOption.subscribeOption);
            } else {
                // 没有Exchagne就绑定到默认设置的Exchange上
                await (<C4Queue>this.m_Queue).bindExchange(this.m_DefaultPublisher, RoutingKey);
                await (<C4Queue>this.m_Queue).subscribe(CurSubscribeOption.subscribeOption);
                PublisherName = DEFAULT_PUBLISHER;
            }

            if (RoutingKey === "")
                RoutingKey = DEFAULT_ROUTE;

            // 构建Object
            if (TypeUtils.isEmptyObj(this.m_CBs[PublisherName])) {
                this.m_CBs[PublisherName] = {};
            }
            if (TypeUtils.isEmptyObj(this.m_CBs[PublisherName][RoutingKey])) {
                this.m_CBs[PublisherName][RoutingKey] = {};
            }
            let msgTypeKeys = Object.keys(CurSubscribeOption.CBs);
            for (let j = 0; j < msgTypeKeys.length; j++) {
                this.m_CBs[PublisherName][RoutingKey][msgTypeKeys[j]] = CurSubscribeOption.CBs[msgTypeKeys[j]];
            }
        }

        // 绑定分发函数
        this.__processMsg();
    }

    /**
     * 消息处理方法
     */
    async __processMsg() {
        let Self = this;
        await (<C4Queue>this.m_Queue).peekMsg(async function (message, headers, deliveryInfo, ack) {

            // TODO: 使用trieTree进行RoutingKey的匹配
            let CurExchangeName = deliveryInfo.exchange;
            let CurRoutingKey   = deliveryInfo.routingKey;
            let CurMsgType      = message.msgType;
            if (CurMsgType) {
                let CurMsgHandler = null;
                
                // 优先使用针对Exchange的处理方法
                do {
                    if (TypeUtils.isEmptyObj(Self.m_CBs[CurExchangeName])) break;                       // 没找到对应Exchange
                    if (TypeUtils.isEmptyObj(Self.m_CBs[CurExchangeName][CurRoutingKey])) {             // 没找到对应Routing
                        if (TypeUtils.isEmptyObj(Self.m_CBs[CurExchangeName][DEFAULT_ROUTE])) break;    // 默认的Routing也不存在
                        if (Self.m_CBs[CurExchangeName][DEFAULT_ROUTE][CurMsgType]) {                   // 默认的Routing下有对应的MsgTeyp处理方法
                            CurMsgHandler = Self.m_CBs[CurExchangeName][DEFAULT_ROUTE][CurMsgType];
                        }
                        break;      // 默认Routing下没有对应的MsgType的处理方法
                    }
                    // 对应的Routing存在
                    if (Self.m_CBs[CurExchangeName][CurRoutingKey][CurMsgType]) {           // 对应Routing下有MsgType的处理方法
                        CurMsgHandler = Self.m_CBs[CurExchangeName][CurRoutingKey][CurMsgType];
                    }
                    break;      // 对应Routing下没有MsgType的处理方法
                } while (false);

                if (null === CurMsgHandler) {
                    // 精确匹配没有找到，查找默认方法
                    do {
                        if (TypeUtils.isEmptyObj(Self.m_CBs[DEFAULT_PUBLISHER])) break;
                        if (TypeUtils.isEmptyObj(Self.m_CBs[DEFAULT_PUBLISHER][CurRoutingKey])) {
                            if (TypeUtils.isEmptyObj(Self.m_CBs[DEFAULT_PUBLISHER][DEFAULT_ROUTE])) break;
                            if (Self.m_CBs[DEFAULT_PUBLISHER][DEFAULT_ROUTE][CurMsgType]) {
                                CurMsgHandler   = Self.m_CBs[DEFAULT_PUBLISHER][DEFAULT_ROUTE][CurMsgType];
                            }
                            break;
                        }
                        if (Self.m_CBs[DEFAULT_PUBLISHER][CurRoutingKey][CurMsgType]) {
                            CurMsgHandler   = Self.m_CBs[DEFAULT_PUBLISHER][CurRoutingKey][CurMsgType];
                        }
                        break;
                    } while (false)
                }

                if (null === CurMsgHandler) {
                    if (Self.m_Logger) {
                        let err = `C4Subscriber process msg : can't find Msg Handler.ExN : ${CurExchangeName}, RK : ${CurRoutingKey}, MT : ${CurMsgType}.`;
                        Self.m_Logger.err ? Self.m_Logger.err(err) : Self.m_Logger.error(err);
                    }
                    // return null;    // 没有找到任何合适的处理方法，重新入队
                    return false;   // 没有找到合适的处理方法，抛弃消息
                }

                let Res;
                try {
                    Res = await CurMsgHandler(message, headers, deliveryInfo, ack);
                } catch (error) {
                    if (Self.m_Logger) {
                        (Self.m_Logger.err && Self.m_Logger.err(error)) ||
                        (Self.m_Logger.error && Self.m_Logger.error(error));
                        // 重新入队
                        // Res = null;
                        // 不再重排
                        Res = false;
                    } else {
                        throw error;
                    }
                }
                return Res;
            } else {
                // 消息格式错误，抛弃
                return false;
            }
        });
        setTimeout(() => {
            Self.__processMsg();
        }, 20);
    }

    /**
     * 添加消息处理方法
     * @param handlers 方法对象或者加名字
     * 当handlers为名字时，会从
     * './MQHandlers/',
     * './out/MQHandlers/'
     * 两个位置尝试进行搜索对应的文件并加载
     * ts：默认放到在src/MQHandlers目下编写ts代码，
     * 编译后在out目录下自动得到'./out/MQHandlers/'
     * js：工程目录下创建MQHandlers，然后放入编译后的js代码
     */
    async addMQHandler(handlers : Array<any>) : Promise<any>;
    async addMQHandler(handlerPaths : string[]) : Promise<any>;
    async addMQHandler(arg : Array<any | string>) {
        const handlers = getMQHandlers(arg);

        let MQHandlers = defineMQHandlers(handlers, null);
        for (let i = 0; i < MQHandlers.length; i++) {
            let CurSubOpt = MQHandlers[i];
            this.m_SubscribeOptions.push(CurSubOpt);
        }
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

/**
 * 支持绑定多个Exchange
 * 支持绑定多个Key
 */
