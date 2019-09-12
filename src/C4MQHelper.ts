import C4MQ from './C4MQ';
import C4Publisher from './C4Publisher';
import C4Subscriber from './C4Subscriber';
import { TypeUtils, FSP } from 'c4utils';
import * as __ from 'lodash';
import { IC4MQHelperOptions } from './C4MQTypes/C4MQTypes';

class MQHelper {

  protected mConnections: {[name: string]: C4MQ} = {};
  protected mPublishers: {[name: string]: C4Publisher} = {};
  protected mSubscribers: {[name: string]: C4Subscriber} = {};
  protected mSubscribeLater: {[name: string]: C4Subscriber} = {};
  protected mbInit: boolean = false;
  protected mLogger: any = console;

  constructor() {}

  async init(options: IC4MQHelperOptions, logger: any) {
    if (this.mbInit) {
      this.mLogger.warn('MQHelpler Repeated initialization.');
      return true;
    }

    this.mLogger = console;
    if (logger) {
      this.mLogger = logger;
    }
    if (__.isNil(this.mLogger.err)) {
      this.mLogger.err = this.mLogger.error;
    }
    if (__.isNil(this.mLogger.debug)) {
      this.mLogger.debug = this.mLogger.info;
    }
    const self = this;
    this.mLogger.info('MQHelper init...');
    if (TypeUtils.isEmptyArray(options.connections)) {
      this.mLogger.warn('MQHelper get empty connections options.');
      return true;
    }
    // init mq connections
    this.mLogger.info('MQHelper init connections.');
    for (let i = 0; i < options.connections.length; i++) {
      const curOption = options.connections[i];
      const tempOption = __.cloneDeep(curOption);
      const connection = new C4MQ();
      delete tempOption.name;
      try {
        await connection.init(tempOption, this.mLogger);
      } catch (error) {
        this.mLogger.error(error);
        return false;
      }
      this.mConnections[curOption.name] = connection;
    }
    // init publishers
    if (TypeUtils.isArray(options.publishers)
      && !TypeUtils.isEmptyArray(options.publishers)) {
      this.mLogger.info('MQHelper init publishers.');
      for (let i = 0; i < options.publishers.length; i++) {
        const curOption = options.publishers[i];
        if (TypeUtils.isEmptyObj(curOption)) {
          continue;
        }
        if (TypeUtils.isEmptyObj(this.mPublishers[curOption.name])) {
          const connName = curOption.connection.replace(/^{MQConnections:[\s]*/g, '').replace(/[\s]*}/g, '');
          const connection = this.mConnections[connName];
          if (TypeUtils.isEmptyObj(connection)) {
            this.mLogger.error(`MQHelper init publisher can't find connection : ${connName}.`);
            return false;
          }
          const tempOption = __.cloneDeep(curOption);
          delete tempOption.connection;
          const publisher = new C4Publisher();
          const res = await publisher.init(connection, tempOption, this.mLogger).catch((err) => {
            self.mLogger.error(err);
            return false;
          });
          if (!res) {
            return false;
          }
          this.mPublishers[curOption.name] = publisher;
        }
      }
    }

    let curHandlerType = options.handlerType;
    if (!TypeUtils.isString(curHandlerType)
      || (curHandlerType !== "standard" && curHandlerType !== "")) {
      curHandlerType = "";
    }

    // init subscribers
    if (TypeUtils.isArray(options.subscribers)
      && !TypeUtils.isEmptyArray(options.subscribers)) {
      this.mLogger.info('MQHelper init subscribers.');
      for (let i = 0; i < options.subscribers.length; i++) {
        const curOption = options.subscribers[i];
        if (TypeUtils.isEmptyObj(curOption)) {
          continue;
        }
        if (TypeUtils.isEmptyObj(this.mSubscribers[curOption.name])) {
          const connName = curOption.connection.replace(/^{MQConnections:[\s]*/g, '').replace(/[\s]*}/g, '');
          const connection = this.mConnections[connName];
          if (TypeUtils.isEmptyObj(connection)) {
            this.mLogger.error(`MQHelper init subscriber can't find connection : ${connName}.`);
            return false;
          }
          const tempOption = __.cloneDeep(curOption);
          delete tempOption.connection;
          const subscriber = new C4Subscriber();
          let res = await subscriber.init(connection, tempOption, this.mLogger).catch((err) => {
            self.mLogger.error(err);
            return false;
          });
          if (!res) {
            return false;
          }
          // load handler
          res = await this._loadHandler(subscriber, curOption.handlers, options.handlerLoadPaths, curHandlerType).then(() => true).catch((err) => {
            self.mLogger.error(err);
            return false;
          });
          if (!res) {
            return false;
          }
          this.mSubscribers[curOption.name] = subscriber;
          if (curOption.subscribeLater) {
            this.mSubscribeLater[curOption.name] = subscriber;
          } else {
            res = await subscriber.subscribeEx().then(() => true).catch((err) => {
              self.mLogger.error(err);
              return false;
            });
            if (!res) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }
  async _loadHandler(subscribe: C4Subscriber, arg: string[] | any[], loadPaths: string[], handlerType: string) {
    if (handlerType === "standard") {
      await subscribe.addMQHandler(arg);
    } else {
      const handlers = FSP.getModulesEx(arg, loadPaths, '', false);
      for (let i = 0; i < handlers.length; i++) {
        subscribe.addSubscribe(handlers[i]());
      }
    }
    return true;
  }
  async subscribe() {
    for (const key in this.mSubscribeLater) {
      const curSub = this.mSubscribeLater[key];
      await curSub.subscribeEx();
    }
    return true;
  }
  public getPublisher(name: string) {
    return this.mPublishers[name];
  }
  getSubscriber(name: string) {
    return this.mSubscribers[name];
  }

  static sHelper: MQHelper | null = null;

  static async create(options: IC4MQHelperOptions, logger: any) {
    if (this.sHelper !== null) {
      return MQHelper.sHelper;
    }
    const curLogger = logger || console;
    const curHelper = new MQHelper();
    const res = await curHelper.init(options, curLogger);
    if (!res) {
      return null;
    }
    await curHelper.subscribe();
    MQHelper.sHelper = curHelper;
    return curHelper;
  }
}

export default MQHelper;
