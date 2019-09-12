declare const gData: unique symbol;
declare type IRouteNode<T> = {
    [key: string]: IRouteNode<T>;
    [gData]?: T | null;
};
export default class C4MQTopicRoute<T> {
    private root;
    constructor();
    insert(key: string, data: T): void;
    protected _match(root: IRouteNode<T>, words: string[]): {
        prefix: string;
        routeKey: string;
        find: boolean;
        data: any;
    };
    match(key: string): {
        prefix: string;
        routeKey: string;
        find: boolean;
        data: any;
    };
    delete(key: string): {
        find: boolean;
        data: T | null | undefined;
    };
}
export {};
