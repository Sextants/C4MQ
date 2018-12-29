import C4MQ from './C4MQ';
import C4Publisher from './C4Publisher';
import C4Subscriber from './C4Subscriber';
import { IC4MQHelperOptions } from './C4MQTypes/C4MQTypes';
declare class MQHelper {
    protected mConnections: {
        [name: string]: C4MQ;
    };
    protected mPublishers: {
        [name: string]: C4Publisher;
    };
    protected mSubscribers: {
        [name: string]: C4Subscriber;
    };
    protected mSubscribeLater: {
        [name: string]: C4Subscriber;
    };
    protected mbInit: boolean;
    protected mLogger: any;
    constructor();
    init(options: IC4MQHelperOptions, logger: any): Promise<boolean>;
    _loadHandler(subscribe: C4Subscriber, arg: string[] | any[], loadPaths: string[], handlerType: string): Promise<boolean>;
    subscribe(): Promise<boolean>;
    getPublisher(name: string): C4Publisher;
    getSubscriber(name: string): C4Subscriber;
    static sHelper: MQHelper | null;
    static create(options: IC4MQHelperOptions, logger: any): Promise<MQHelper | null>;
}
export default MQHelper;
