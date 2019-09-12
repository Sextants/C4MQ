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
const C4MQHelper_1 = __importDefault(require("./C4MQHelper"));
const C4MQ_1 = __importDefault(require("./C4MQ"));
const C4Publisher_1 = __importDefault(require("./C4Publisher"));
const C4Subscriber_1 = __importDefault(require("./C4Subscriber"));
const testHandler_1 = require("./testHandler");
const mqHost = "";
const mqLogin = "";
const mqPassword = "";
let MQConn;
let CurPublihser;
let CurPublihser2;
let CurSubscriber;
let Count0 = 0;
let Begin0 = 0;
let End0 = 0;
let Count1 = 0;
let Begin1 = 0;
let End1 = 0;
function Publish0() {
    if (undefined === CurPublihser) {
        return;
    }
    CurPublihser.publish({
        msgType: "Hello",
        msg: Count0++
    });
    if (Count0 > 10) {
        End0 = (new Date()).getTime();
        console.log("Used : " + (End0 - Begin0));
    }
    else {
        setTimeout(() => {
            Publish0();
        }, 0);
    }
}
function Publish1() {
    if (undefined === CurPublihser) {
        return;
    }
    Count1++;
    CurPublihser2.publish({
        msgType: "Test",
        msg: Count1 + 10
    }, "testKey.abcz");
    if (Count1 > 10) {
        Count1 = 0;
        End1 = (new Date()).getTime();
        console.log("Used : " + (End1 - Begin1));
    }
    else {
        setTimeout(() => {
            Publish1();
        }, 0);
    }
}
// 不是用C4MQHelper的示例
function SampleUseBaseObject() {
    return __awaiter(this, void 0, void 0, function* () {
        MQConn = new C4MQ_1.default();
        try {
            yield MQConn.init({
                host: mqHost,
                port: 5672,
                login: mqLogin,
                password: mqPassword,
                connectionTimeout: 30000,
                authMechanism: "AMQPLAIN",
                vhost: "/",
                noDelay: true,
                heartbeat: 50,
                clientProperties: {
                    applicationName: "C4MQ"
                }
            }, console);
        }
        catch (error) {
            console.log(error);
            process.exit(-1);
        }
        CurPublihser = new C4Publisher_1.default();
        let Res = yield CurPublihser.init(MQConn, {
            name: "C4MQTestExchange0",
            routingKey: "testKey",
            type: 'direct',
            durable: true,
            autoDelete: false,
            confirm: true,
            publicOption: {}
        }, console);
        CurSubscriber = new C4Subscriber_1.default();
        Res = yield CurSubscriber.init(MQConn, {
            name: "C4MQTestQueue0",
            publisherName: "C4MQTestExchange0",
            durable: true,
            autoDelete: false
        }, console);
        if (!Res) {
            process.exit(-1);
        }
        CurSubscriber.addMQHandler(["Hello"]);
        CurSubscriber.addSubscribe(testHandler_1.defineHandler());
        yield CurSubscriber.subscribeEx();
        Begin0 = (new Date()).getTime();
        Publish0();
    });
}
// 使用C4MQHelper和注解方式声明消息处理方法的实例
function SampleUseAnnotaion() {
    return __awaiter(this, void 0, void 0, function* () {
        const curHelper = yield C4MQHelper_1.default.create({
            connections: [
                {
                    name: "TestMQConnection",
                    host: mqHost,
                    port: 5672,
                    login: mqLogin,
                    password: mqPassword,
                    connectionTimeout: 30000,
                    authMechanism: "AMQPLAIN",
                    vhost: "/",
                    noDelay: true,
                    heartbeat: 50,
                    clientProperties: {
                        applicationName: "C4MQ"
                    }
                }
            ],
            publishers: [
                {
                    name: "TestPublisher",
                    connection: "TestMQConnection",
                    routingKey: "testKey",
                    type: "direct",
                    durable: true,
                    autoDelete: false,
                    confirm: true,
                    publicOption: {}
                }
            ],
            subscribers: [
                {
                    name: "TestSubscriber",
                    connection: "TestMQConnection",
                    publisherName: "TestPublisher",
                    durable: true,
                    autoDelete: false,
                    handlers: ["Hello"],
                    subscribeLater: false
                }
            ],
            handlerLoadPaths: [
                './out/MQHandlers'
            ],
            handlerType: "standard"
        }, console);
        if (curHelper) {
            CurPublihser = curHelper.getPublisher("TestPublisher");
            Begin0 = (new Date()).getTime();
            Publish0();
        }
    });
}
// 使用C4MQHelper和对象方式声明消息处理方法的实例
function SampleUseObject() {
    return __awaiter(this, void 0, void 0, function* () {
        const curHelper = yield C4MQHelper_1.default.create({
            connections: [
                {
                    name: "TestMQConnection",
                    host: mqHost,
                    port: 5672,
                    login: mqLogin,
                    password: mqPassword,
                    connectionTimeout: 30000,
                    authMechanism: "AMQPLAIN",
                    vhost: "/",
                    noDelay: true,
                    heartbeat: 50,
                    clientProperties: {
                        applicationName: "C4MQ"
                    }
                }
            ],
            publishers: [
                {
                    name: "TestPublisher2",
                    connection: "TestMQConnection",
                    routingKey: "testKey.abc",
                    type: "topic",
                    durable: true,
                    autoDelete: false,
                    confirm: true,
                    publicOption: {}
                }
            ],
            subscribers: [
                {
                    name: "TestSubscriber2",
                    connection: "TestMQConnection",
                    publisherName: "TestPublisher2",
                    durable: true,
                    autoDelete: false,
                    handlers: ["TestTopic"],
                    subscribeLater: false
                }
            ],
            handlerLoadPaths: [
                './out/MQHandlers'
            ]
        }, console);
        if (curHelper) {
            CurPublihser = curHelper.getPublisher("TestPublisher");
            CurPublihser2 = curHelper.getPublisher("TestPublisher2");
            Begin1 = (new Date()).getTime();
            Publish1();
        }
    });
}
// 解注释执行相应的示例代码
// SampleUseBaseObject();
// SampleUseAnnotaion();
// SampleUseObject();
//# sourceMappingURL=main.js.map