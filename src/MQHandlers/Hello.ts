import { MQHandler, MsgBody } from "../Annotation/MQHandler";

export default class Hello {

    @MQHandler({
        PublisherName : "C4MQTestExchange0",
        RoutingKey : "testKey",
        MsgType : "Hello"
    })
    static async Test(@MsgBody({
        value : "msg"
    }) msg : string) {

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
        console.log("Get a MQ message : " + msg + ".");
    }

    @MQHandler({
        PublisherName : "C4MQTestExchange2",
        RoutingKey : "testKey1",
        MsgType : "Test"
    })
    static async HelloWorld(@MsgBody({
        value : "msg"
    }) msg : string) {
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
        console.log("Get a MQ message : " + msg + ".");
    }
}
