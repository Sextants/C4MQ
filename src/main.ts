import C4MQ from "./C4MQ";
import C4Publisher from "./C4Publisher";
import C4Subscriber from "./C4Subscriber";

let MQConn : C4MQ;
let CurPublihser  : C4Publisher;
let CurPublihser2 : C4Publisher;
let CurSubscriber : C4Subscriber;

let Count = 0;
let Begin = 0;
let End   = 0;

function Publish() {
    if (undefined === CurPublihser) {
        return;
    }

    CurPublihser.publish({
        msgType : "Hello",
        msg : Count++
    });

    CurPublihser2.publish({
        msgType : "Test",
        msg : Count + 10
    }, "testKey1")

    if (Count > 10) {
        End = (new Date()).getTime();
        console.log("Used : " + (End - Begin));
    } else {
        setTimeout(() => {
            Publish();
        }, 0);
    }
}

async function Launch() {
    MQConn = new C4MQ();
    try {
        await MQConn.init({
            host : "host",  // <any>[ "host0", "host1", "host2" ] // 连接Cluster
            port : 5672,
            login : "username",
            password : "password",
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
        publicOption : {

        }
    }, console);

    CurPublihser2   = new C4Publisher();
    Res = await CurPublihser2.init(MQConn, {
        name : "C4MQTestExchange2",
        routingKey : "testKey1",
        type : 'topic',
        durable : true,
        autoDelete : false,
        confirm : true,
        publicOption : {

        }
    }, console)

    if (!Res) {
        process.exit(-1);
    }

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

    if (!Res) {
        process.exit(-1);
    }

    CurSubscriber.addMQHandler(["Hello"]);
    // CurSubscriber.addSubscribe({
    //     //
    // });
    await CurSubscriber.subscribe();
    Begin = (new Date()).getTime();
    Publish();
    //
}

Launch();

/* import C4MQ from './C4MQ';
import C4Exchange from './C4Exchange';
import C4Queue from './C4Queue';
import * as C4MQTypes from './C4MQTypes/C4MQTypes';
import { AMQPClient } from 'amqp';
import { CONNREFUSED } from 'dns';

let MQConn : C4MQ;
let CurExchange : C4Exchange;
let CurQueue : C4Queue;

let DLX : C4Exchange;
let DLQ : C4Queue;

let Count = 0;
let Begin = 0;
let End   = 0;
function Publish() {
    if (undefined === CurExchange) {
        return;
    }

    // let CurPriority = parseInt((Math.random() * 10).toString());
    // console.log("CurMsg : " + Count + ", Priority : " + CurPriority);
    CurExchange.publish("testKey", {
        msg : Count++
    }, {
        // priority : CurPriority
        expiration : "10000"
    });
    if (Count > 10) {
        End = (new Date()).getTime();
        console.log("Used : " + (End - Begin));
        process.exit(-1);
    }
    setTimeout(() => {
        Publish();
    }, 0);
}

function ProcessMsg() {
    if (undefined === CurQueue) {
        return;
    }

    CurQueue.peekMsg((message, headers, deliveryInfo, ack) => {
        Count++;
        console.log(JSON.stringify(message));
        console.log(JSON.stringify(headers));
        console.log(JSON.stringify(deliveryInfo, null, 4));
        return true;
    });

    if (Count >= 99999) {
        End = (new Date()).getTime();
        console.log("Used : " + (End - Begin));
        process.exit(-1);
    }

    setTimeout(() => {
        ProcessMsg();
    }, 0);
}

async function Launch() {
    MQConn  = new C4MQ();
    try {
        await MQConn.init({
            host : "host",
            port : 5672,
            login : "username",
            password : "password",
            connectionTimeout : 30000,
            authMechanism : "AMQPLAIN",
            vhost : "/",
            noDelay : true,
            heartbeat : 5,
            clientProperties : {
                applicationName : "C4MQ"
            }
        }, console);
    } catch (error) {
        console.log(error);
        process.exit(-1);
    }
    
    CurExchange = new C4Exchange();
    DLX         = new C4Exchange();
    await CurExchange.declared(MQConn, "C4MQTestExchange", {
        type : 'direct',
        durable : true,
        autoDelete : false,
        confirm : true
    });
    await DLX.declared(MQConn, "C4MQTestDLX", {
        type : "topic",
        durable : true,
        autoDelete : false,
        confirm : true
    });


    console.log('xxxx')
    CurQueue    = new C4Queue();
    DLQ         = new C4Queue();
    await CurQueue.declared(MQConn, "C4MQTestQueue", {
        durable : true,
        autoDelete : false,
        arguments : {
            "x-max-priority" : 10,
            "x-message-ttl" : 60000,
            "x-dead-letter-exchange" : "C4MQTestDLX",
            "x-dead-letter-routing-key" : "testKey"
        }
    });
    await DLQ.declared(MQConn, "C4MQTestDLQ", {
        durable : true,
        autoDelete : false
    });

    console.log('zzzzz')
    await CurQueue.bindExchange("C4MQTestExchange", "testKey");
    await CurQueue.bindExchange("C4MQTestExchange", "123");
    await DLQ.bindExchange("C4MQTestDLX", "#");

    CurQueue.subscribe({
        ack : true,
        prefetchCount : 16
    });

    Begin = (new Date()).getTime();
    // Publish();
    // Publish();
    // Publish();
    // Publish();
    // Publish();
    // Publish();
    // Publish();
    Publish();
    // ProcessMsg();
    // ProcessMsg();
    // ProcessMsg();
    // ProcessMsg();
    // ProcessMsg();
    // ProcessMsg();
    // ProcessMsg();
    // ProcessMsg();
}

Launch(); */

