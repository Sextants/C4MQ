import C4MQ from "./C4MQ";
import { C4SubscriberOption, C4SubscribeOption } from "./C4MQTypes/C4MQTypes";
export default class C4Subscriber {
    private m_Queue;
    private m_DefaultPublisher;
    private m_SubscribeOptions;
    private m_Logger;
    private m_CBs;
    constructor();
    /**
     * 初始化
     * @param Conn C4MQ连接，MQ连接
     * @param option C4SubscriberOption
     * @param logger 日志对象
     */
    init(Conn: C4MQ, option: C4SubscriberOption, logger?: any): Promise<boolean>;
    /**
     * 添加订阅配置
     * @param option C4SubscribeOption
     */
    addSubscribe(option: C4SubscribeOption): boolean;
    /**
     * 开始订阅
     */
    subscribe(): Promise<void>;
    /**
     * 消息处理方法
     */
    __processMsg(): Promise<void>;
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
    addMQHandler(handlers: Array<any>): Promise<any>;
    addMQHandler(handlerPaths: string[]): Promise<any>;
    /**
     * 是否初始化
     */
    isInit(): boolean;
    /**
     * 获取Queue的名字
     */
    getName(): string;
}
/**
 * 支持绑定多个Exchange
 * 支持绑定多个Key
 */
