function TestTopic() {
  console.log("123")
  return {
    publisherName: "TestPublisher2",
    routingKey: "testKey.*",
    subscribeOption: {
      ack: true,
      prefetchCount: 6 // 预读取数量
    },
    CBs: {
      Test: async function(msg: any,
        headers: any,
        deliveryInfo: any,
        ack: any) {
        console.log(msg);
        return true;
      }
    }
  }
}

exports.default = TestTopic;
