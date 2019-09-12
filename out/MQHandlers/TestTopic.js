"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function TestTopic() {
    console.log("123");
    return {
        publisherName: "TestPublisher2",
        routingKey: "testKey.*",
        subscribeOption: {
            ack: true,
            prefetchCount: 6 // 预读取数量
        },
        CBs: {
            Test: function (msg, headers, deliveryInfo, ack) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(msg);
                    return true;
                });
            }
        }
    };
}
exports.default = TestTopic;
//# sourceMappingURL=TestTopic.js.map