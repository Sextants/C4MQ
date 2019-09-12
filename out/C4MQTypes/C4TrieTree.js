"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class C4TrieTree {
    constructor() {
        this.root = {};
    }
    // 插入数据
    insert(key, data) {
        let cur = this.root;
        for (const c of key) {
            if (cur[c] === undefined) {
                cur[c] = {};
            }
            cur = (cur[c]);
        }
        cur["data"] = data || null;
    }
    // 完全匹配
    contains(key) {
        let cur = this.root;
        for (const i in key) {
            if (cur[key[i]]) {
                cur = cur[key[i]];
            }
            else {
                return {
                    prefix: key.slice(0, parseInt(i, 10)),
                    find: false,
                    data: undefined
                };
            }
        }
        return {
            prefix: key,
            find: cur["data"] !== undefined,
            data: cur["data"]
        };
    }
    // 前缀匹配，查找以给定key为前缀所有数据
    find(prefix) {
        let cur = this.root;
        const output = [];
        for (const i in prefix) {
            if (cur[prefix[i]]) {
                cur = cur[prefix[i]];
            }
            else {
                return [];
            }
        }
        function _getWord(node, _prefix) {
            if (node["data"] !== undefined) {
                output.push({
                    word: _prefix,
                    data: node["data"]
                });
            }
            for (const key in node) {
                if (key !== "data") {
                    _getWord(node[key], _prefix + key);
                }
            }
        }
        ;
        _getWord(cur, prefix);
        return output;
    }
    // 与给定key有相同前缀的所有数据
    match(key) {
        let cur = this.root;
        const output = [];
        let i = 0;
        for (; i < key.length; i++) {
            if (cur["data"] !== undefined) {
                output.push({
                    word: key.slice(0, i),
                    data: cur["data"]
                });
            }
            if (cur[key[i]]) {
                cur = cur[key[i]];
            }
            else {
                break;
            }
        }
        if (i >= key.length) {
            if (cur["data"] !== undefined) {
                output.push({
                    word: key.slice(0, i),
                    data: cur["data"]
                });
            }
        }
        return output;
    }
    // 根据key删除数据
    delete(key) {
        let cur = this.root;
        let detachParent = undefined;
        let detachIndex = -1;
        for (const i in key) {
            if (cur[key[i]]) {
                cur = cur[key[i]];
                if (Object.keys(cur).length > 1) {
                    detachParent = cur;
                    detachIndex = parseInt(i, 10);
                }
            }
            else {
                return {
                    find: false,
                    data: undefined
                };
            }
        }
        if (cur["data"] == undefined) {
            return {
                find: false,
                data: undefined
            };
        }
        const data = cur["data"];
        if (detachIndex === -1) {
            delete cur.data;
            return {
                find: true,
                data
            };
        }
        else {
            if (detachParent) {
                if (key[detachIndex + 1] === undefined) {
                    delete detachParent.data;
                }
                else {
                    delete detachParent[key[detachIndex + 1]];
                }
            }
            return {
                find: true,
                data
            };
        }
    }
}
exports.default = C4TrieTree;
//# sourceMappingURL=C4TrieTree.js.map