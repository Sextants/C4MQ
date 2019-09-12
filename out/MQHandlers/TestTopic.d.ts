declare function TestTopic(): {
    publisherName: string;
    routingKey: string;
    subscribeOption: {
        ack: boolean;
        prefetchCount: number;
    };
    CBs: {
        Test: (msg: any, headers: any, deliveryInfo: any, ack: any) => Promise<boolean>;
    };
};
