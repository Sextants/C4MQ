"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const C4MQ_1 = __importDefault(require("./C4MQ"));
const C4Publisher_1 = __importDefault(require("./C4Publisher"));
const C4Subscriber_1 = __importDefault(require("./C4Subscriber"));
const c4utils_1 = require("c4utils");
const __ = __importStar(require("lodash"));
class MQHelper {
    constructor() {
        this.mConnections = {};
        this.mPublishers = {};
        this.mSubscribers = {};
        this.mSubscribeLater = {};
        this.mbInit = false;
        this.mLogger = console;
    }
    init(options, logger) {
        return __awaiter(this, void 0, void 0, function* () {
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
            if (c4utils_1.TypeUtils.isEmptyArray(options.connections)) {
                this.mLogger.warn('MQHelper get empty connections options.');
                return true;
            }
            // init mq connections
            this.mLogger.info('MQHelper init connections.');
            for (let i = 0; i < options.connections.length; i++) {
                const curOption = options.connections[i];
                const tempOption = __.cloneDeep(curOption);
                const connection = new C4MQ_1.default();
                delete tempOption.name;
                try {
                    yield connection.init(tempOption, this.mLogger);
                }
                catch (error) {
                    this.mLogger.error(error);
                    return false;
                }
                this.mConnections[curOption.name] = connection;
            }
            // init publishers
            if (c4utils_1.TypeUtils.isArray(options.publishers)
                && !c4utils_1.TypeUtils.isEmptyArray(options.publishers)) {
                this.mLogger.info('MQHelper init publishers.');
                for (let i = 0; i < options.publishers.length; i++) {
                    const curOption = options.publishers[i];
                    if (c4utils_1.TypeUtils.isEmptyObj(curOption)) {
                        continue;
                    }
                    if (c4utils_1.TypeUtils.isEmptyObj(this.mPublishers[curOption.name])) {
                        const connName = curOption.connection.replace(/^{MQConnections:[\s]*/g, '').replace(/[\s]*}/g, '');
                        const connection = this.mConnections[connName];
                        if (c4utils_1.TypeUtils.isEmptyObj(connection)) {
                            this.mLogger.error(`MQHelper init publisher can't find connection : ${connName}.`);
                            return false;
                        }
                        const tempOption = __.cloneDeep(curOption);
                        delete tempOption.connection;
                        const publisher = new C4Publisher_1.default();
                        const res = yield publisher.init(connection, tempOption, this.mLogger).catch((err) => {
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
            if (!c4utils_1.TypeUtils.isString(curHandlerType)
                || (curHandlerType !== "standard" && curHandlerType !== "")) {
                curHandlerType = "";
            }
            // init subscribers
            if (c4utils_1.TypeUtils.isArray(options.subscribers)
                && !c4utils_1.TypeUtils.isEmptyArray(options.subscribers)) {
                this.mLogger.info('MQHelper init subscribers.');
                for (let i = 0; i < options.subscribers.length; i++) {
                    const curOption = options.subscribers[i];
                    if (c4utils_1.TypeUtils.isEmptyObj(curOption)) {
                        continue;
                    }
                    if (c4utils_1.TypeUtils.isEmptyObj(this.mSubscribers[curOption.name])) {
                        const connName = curOption.connection.replace(/^{MQConnections:[\s]*/g, '').replace(/[\s]*}/g, '');
                        const connection = this.mConnections[connName];
                        if (c4utils_1.TypeUtils.isEmptyObj(connection)) {
                            this.mLogger.error(`MQHelper init subscriber can't find connection : ${connName}.`);
                            return false;
                        }
                        const tempOption = __.cloneDeep(curOption);
                        delete tempOption.connection;
                        const subscriber = new C4Subscriber_1.default();
                        let res = yield subscriber.init(connection, tempOption, this.mLogger).catch((err) => {
                            self.mLogger.error(err);
                            return false;
                        });
                        if (!res) {
                            return false;
                        }
                        // load handler
                        res = yield this._loadHandler(subscriber, curOption.handlers, options.handlerLoadPaths, curHandlerType).then(() => true).catch((err) => {
                            self.mLogger.error(err);
                            return false;
                        });
                        if (!res) {
                            return false;
                        }
                        this.mSubscribers[curOption.name] = subscriber;
                        if (curOption.subscribeLater) {
                            this.mSubscribeLater[curOption.name] = subscriber;
                        }
                        else {
                            res = yield subscriber.subscribeEx().then(() => true).catch((err) => {
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
        });
    }
    _loadHandler(subscribe, arg, loadPaths, handlerType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (handlerType === "standard") {
                yield subscribe.addMQHandler(arg);
            }
            else {
                const handlers = c4utils_1.FSP.getModulesEx(arg, loadPaths, '', false);
                for (let i = 0; i < handlers.length; i++) {
                    subscribe.addSubscribe(handlers[i]());
                }
            }
            return true;
        });
    }
    subscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const key in this.mSubscribeLater) {
                const curSub = this.mSubscribeLater[key];
                yield curSub.subscribeEx();
            }
            return true;
        });
    }
    getPublisher(name) {
        return this.mPublishers[name];
    }
    getSubscriber(name) {
        return this.mSubscribers[name];
    }
    static create(options, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sHelper !== null) {
                return MQHelper.sHelper;
            }
            const curLogger = logger || console;
            const curHelper = new MQHelper();
            const res = yield curHelper.init(options, curLogger);
            if (!res) {
                return null;
            }
            yield curHelper.subscribe();
            MQHelper.sHelper = curHelper;
            return curHelper;
        });
    }
}
MQHelper.sHelper = null;
exports.default = MQHelper;
//# sourceMappingURL=C4MQHelper.js.map