declare type INode<T> = {
    [key: string]: INode<T> | T | null;
};
export default class C4TrieTree<T> {
    private root;
    constructor();
    insert(key: string, data: T): void;
    contains(key: string): {
        prefix: string;
        find: boolean;
        data: undefined;
    } | {
        prefix: string;
        find: boolean;
        data: T | INode<T> | null;
    };
    find(prefix: string): {
        word: string;
        data: T;
    }[];
    match(key: string): {
        word: string;
        data: T | INode<T> | null;
    }[];
    delete(key: string): {
        find: boolean;
        data: undefined;
    } | {
        find: boolean;
        data: T | INode<T> | null;
    };
}
export {};
