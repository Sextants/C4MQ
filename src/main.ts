import C4MQHelper from './C4MQHelper';
import C4MQ from "./C4MQ";
import C4Publisher from "./C4Publisher";
import C4Subscriber from "./C4Subscriber";
import { defineHandler } from "./testHandler";

const mqHost = "";
const mqLogin = "";
const mqPassword = "";

let MQConn : C4MQ;
let CurPublihser  : C4Publisher;
let CurPublihser2 : C4Publisher;
let CurSubscriber : C4Subscriber;

let Count0 = 0;
let Begin0 = 0;
let End0   = 0;
let Count1 = 0;
let Begin1 = 0;
let End1   = 0;

function Publish0() {
    if (undefined === CurPublihser) {
        return;
    }

    CurPublihser.publish({
        msgType : "Hello",
        msg : Count0++
    });

    if (Count0 > 10) {
        End0 = (new Date()).getTime();
        console.log("Used : " + (End0 - Begin0));
    } else {
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
      msgType : "Test",
      msg : Count1 + 10
  }, "testKey.abcz")

  if (Count1 > 10) {
      Count1 = 0;
      End1 = (new Date()).getTime();
      console.log("Used : " + (End1 - Begin1));
  } else {
      setTimeout(() => {
        Publish1();
      }, 0);
  }
}

// 不是用C4MQHelper的示例
async function SampleUseBaseObject() {
    MQConn = new C4MQ();
    try {
      await MQConn.init({
        host : mqHost,  // <any>[ "host0", "host1", "host2" ] // 连接Cluster
        port : 5672,
        login : mqLogin,
        password : mqPassword,
        connectionTimeout : 30000,
        authMechanism : "AMQPLAIN",
        vhost : "/",
        noDelay : true,
        heartbeat : 50,
        clientProperties : {
            applicationName : "C4MQ"
        }
      }, console);
    } catch (error) {
      console.log(error);
      process.exit(-1);
    }

    CurPublihser    = new C4Publisher();
    let Res = await CurPublihser.init(MQConn, {
      name : "C4MQTestExchange0",
      routingKey : "testKey",
      type : 'direct',
      durable : true,
      autoDelete : false,
      confirm : true,
      publicOption : {}
    }, console);

    CurSubscriber   = new C4Subscriber();
    Res = await CurSubscriber.init(MQConn, {
      name : "C4MQTestQueue0",
      publisherName : "C4MQTestExchange0",
      durable : true,
      autoDelete : false
    }, console);
    if (!Res) {
      process.exit(-1);
    }

    CurSubscriber.addMQHandler(["Hello"]);
    CurSubscriber.addSubscribe(defineHandler());
    await CurSubscriber.subscribeEx();
    Begin0 = (new Date()).getTime();
    Publish0();
}

// 使用C4MQHelper和注解方式声明消息处理方法的实例
async function SampleUseAnnotaion() {
  const curHelper = await C4MQHelper.create({
    connections: [
      {
        name: "TestMQConnection",
        host: mqHost,  // <any>[ "host0", "host1", "host2" ] // 连接Cluster
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
}

// 使用C4MQHelper和对象方式声明消息处理方法的实例
async function SampleUseObject() {

  const curHelper = await C4MQHelper.create({
    connections: [
      {
        name: "TestMQConnection",
        host: mqHost,  // <any>[ "host0", "host1", "host2" ] // 连接Cluster
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
}

// 解注释执行相应的示例代码
// SampleUseBaseObject();
// SampleUseAnnotaion();
// SampleUseObject();
