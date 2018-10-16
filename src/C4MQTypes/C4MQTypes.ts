export interface ConnectionOptions {
    host?: string;
    url?: string;
    port?: number;
    login?: string;
    password?: string;
    connectionTimeout?: number;
    authMechanism?: string;
    vhost?: string;
    noDelay?: boolean;
    heartbeat?: number;
    ssl?: {
      enabled: boolean;
      keyFile?: string;
      certFile?: string;
      caFile?: string;
      rejectUnauthorized?: boolean;
    };
  
    /** Default: 'node-amqp' */
    product?: string;
  
    /** Default: 'node-{NODE_VERSION}' */
    platform?: string;
  
    /** Default: node-amqp/package.json version */
    version?: string;
  
    defaultExchangeName?: string;
  
    /** Default: true */
    reconnect?: boolean;
  
    /** Default: 'linear' */
    reconnectBackoffStrategy?: string;
  
    /** Default: 120000 */
    reconnectExponentialLimit?: number;
  
    /** Default: 1000 */
    reconnectBackoffTime?: number;
  
    clientProperties?: {
      applicationName?: string;
      capabilities?: {
        consumer_cancel_notify?: boolean
      }
      /** Default: 'node-' + process.version */
      platform?: string;
      /** Default: node-amqp */
      product?: string;
      /** Default: 'nodeAMQPVersion' */
      version?: string;
    };
};

export interface ExchangeOptions {
  /**
   * Default: 'topic'
   */
  type?: 'direct' | 'fanout' | 'topic';

  /**
   * Default: false
   *
   * If set, the server will not create the exchange. The client can use this to check whether an exchange exists without modifying the server state
   */
  passive?: boolean;

  /**
   * Default: true
   *
   * If set when creating a new exchange, the exchange will be marked as durable.
   *
   * Durable exchanges remain active when a server restarts.
   *
   * Non-durable exchanges (transient exchanges) are purged if/when a server restarts
   */
  durable?: boolean;

  /**
   * Default: true
   *
   * If set, the exchange is deleted when there are no longer queues bound to it
   */
  autoDelete?: boolean;

  /**
   * Default: false
   *
   * If set, the exchange will not be declared,
   * this will allow the exchange to be deleted if you dont know its previous options
   */
  noDeclare?: boolean;

  /**
   * Default: false
   *
   * If set, the exchange will be in confirm mode, and you will get a 'ack'|'error' event emitted on a publish,
   * or the callback on the publish will be called
   */
  confirm?: boolean;

  /**
   * a map of additional arguments to pass in when creating an exchange
   */
  arguments?: { [arg: string]: any };
}

export interface ExchangePublishOptions {
  /**
   * Default: false
   *
   * This flag tells the server how to react if the message cannot be routed to a queue.
   *
   * If this flag is set, the server will return an unroutable message with a Return method.
   *
   * If this flag is false, the server silently drops the message
   */
  mandatory?: boolean;

  /**
   * Default: false
   *
   * This flag tells the server how to react if the message cannot be routed to a queue consumer immediately.
   *
   * If this flag is set, the server will return an undeliverable message with a Return method.
   *
   * If this flag is false, the server will queue the message, but with no guarantee that it will ever be consumed
   */
  immediate?: boolean;

  /**
   * Default: 'application/octet-stream'
   */
  contentType?: string;

  /**
   * Default: null
   */
  contentEncoding?: string;

  /**
   * Default: {}
   *
   * Arbitrary application-specific message headers
   */
  headers?: any;

  /**
   * 1: Non-persistent
   * 2: Persistent
   */
  deliveryMode?: 1 | 2;

  priority?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | number;

  /**
   * Application correlation identifier
   */
  correlationId?: string;

  /**
   * Usually used to name a reply queue for a request message
   */
  replyTo?: string;

  /**
   * Default: null
   *
   * Message expiration specification -- ISO date string?
   */
  expiration?: string;

  /**
   * Default: null
   *
   * Application message identifier
   */
  messageId?: string;

  /**
   * Default: null
   *
   * Message timestamp
   *
   * ISO date string?
   */
  timestamp?: string;

  /**
   * Default: null
   *
   * Message type name
   */
  type?: string;

  /**
   * Default: null
   *
   * Creating user id
   */
  userId?: string;

  /**
   * Default: null
   *
   * Creating application id
   */
  appId?: string;
}

export interface QueueOptions {
  /**
   * Default: false
   *
   * If set, the server will not create the queue.
   *
   * The client can use this to check whether a queue exists without modifying the server state
   */
  passive?: boolean;

  /**
   * Default: false
   *
   * Durable queues remain active when a server restarts.
   *
   * Non-durable queues (transient queues) are purged if/when a server restarts.
   *
   * Note that durable queues do not necessarily hold persistent messages,
   * although it does not make sense to send persistent messages to a transient queue
   */
  durable?: boolean;

  /**
   * Default: false
   *
   * Exclusive queues may only be consumed from by the current connection.
   *
   * Setting the 'exclusive' flag always implies 'autoDelete'
   */
  exclusive?: boolean;

  /**
   * Default: true
   *
   * If set, the queue is deleted when all consumers have finished using it.
   *
   * Last consumer can be cancelled either explicitly or because its channel is closed.
   *
   * If there was no consumer ever on the queue, it won't be deleted
   */
  autoDelete?: boolean;

  /**
   * Default: false
   *
   * If set, the queue will not be declared, this will allow a queue to be deleted if you don't know its previous options
   */
  noDeclare?: boolean;

  /**
   * a map of additional arguments to pass in when creating a queue
   */
  arguments?: { [arg: string]: any };

  /**
   * Default: false
   *
   * when true the channel will close on unsubscribe
   */
  closeChannelOnUnsubscribe?: boolean;
}

export interface SubscribeOptions {
  /**
   * Default: false
   *
   * If set to true, only one subscriber is allowed at a time
   */
  exclusive?: boolean;

  /**
   * Default: false
   *
   * Make it so that the AMQP server only delivers single messages at a time.
   * When you want the next message, call queue.shift()
   *
   * When false, you will receive messages as fast as they are emitted
   */
  ack?: boolean;

  /**
   * Default: 1
   *
   * Will only send you N messages before you 'ack'.
   *
   * Setting to zero will widen that window to 'unlimited'. If this is set, queue.shift() should not be used
   */
  prefetchCount?: number;

  /**
   * Default: undefined
   *
   * Will inject the routingKey into the payload received
   */
  routingKeyInPayload?: boolean;

  /**
   * Default: undefined
   *
   * Will inject the routingKey into the payload received
   */
  deliveryKeyInPayload?: boolean;
}

export interface DeliveryInfo {
  contentType: string;
  consumerTag: string;
  deliveryTag: Uint8Array;
  exchange: string;
  queue: string;
  redelivered: boolean;
  routingKey: string;
}

export interface Ack extends DeliveryInfo {
    acknowledge(all: boolean): void;
    reject(requeue: boolean): void;
}

export type SubscribeCallback = (
    message: any,
    headers: { [key: string]: any },
    deliveryInfo: DeliveryInfo,
    ack: Ack
) => void;

export interface C4PublisherOption extends ExchangeOptions {
    name : string;
    routingKey : string;
    publicOption ?: ExchangePublishOptions;
};

export interface C4SubscribeOption {
    publisherName  ?: string;
    routingKey     ?: string;
    subscribeOption : SubscribeOptions;
    CBs            ?: any; /**
     * {
     *    "msgType_0" : CB0,
     *    "msgType_1" : CB1...
     * }
     */
}

export interface C4SubscriberOption extends QueueOptions {
    name : string;
    publisherName : string;
    subscribeOptions ?: C4SubscribeOption[];
}

export const DEFAULT_PUBLISHER = "@_Default_Publisher_@";
export const DEFAULT_ROUTE     = "@_Default_Route_@"
