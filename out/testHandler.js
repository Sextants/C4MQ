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
function defineHandler() {
    return {
        publisherName: "C4MQTestExchange0",
        routingKey: "testKey",
        subscribeOption: {
            ack: true,
            prefetchCount: 6 // 与读取数量
        },
        CBs: {
            "Hello": (message, headers, deliveryInfo, ack) => __awaiter(this, void 0, void 0, function* () {
                console.log(`testHandler get a message : ${message.msgType}, value : ${message.msg}.`);
                return true;
            })
        }
    };
}
exports.defineHandler = defineHandler;
//# sourceMappingURL=testHandler.js.map