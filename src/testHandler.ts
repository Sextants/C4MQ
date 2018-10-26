import { C4SubscribeOption, DeliveryInfo, Ack } from "./C4MQTypes/C4MQTypes";


export function defineHandler() {
  return <C4SubscribeOption>{
    publisherName : "C4MQTestExchange0",
    routingKey    : "testKey",
    subscribeOption : {
      ack : true,           // 手动ack
      prefetchCount : 6     // 与读取数量
    },
    CBs           : {
      "Hello" : async (message : any,
        headers : {[key : string] : any},
        deliveryInfo : DeliveryInfo,
        ack : Ack
      ) => {
        console.log(`testHandler get a message : ${message.msgType}, value : ${message.msg}.`);
        return true;
      }
    }
  }
}
