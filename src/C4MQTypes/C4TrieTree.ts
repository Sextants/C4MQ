type INode<T> = {
  [key: string]: INode<T> | T | null;
};

export default class C4TrieTree<T> {
  private root: INode<T>;

  constructor() {
    this.root = {};
  }

  // 插入数据
  public insert(key: string, data: T) {
    let cur = this.root;
    for (const c of key) {
      if (cur[c] === undefined) {
        cur[c] = <INode<T>>{}
      }
      cur = <INode<T>>(cur[c]);
    }
    cur["data"] = data || null;
  }

  // 完全匹配
  public contains(key: string) {
    let cur = this.root;
    for (const i in <any>key) {
      if (cur[(<any>key)[i]]) {
        cur =  <INode<T>>cur[(<any>key)[i]]
      } else {
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
  public find(prefix: string) {
    let cur = this.root;
    const output: {
      word: string;
      data: T
    }[] = [];
    for (const i in <any>prefix) {
      if (cur[(<any>prefix)[i]]) {
        cur = <INode<T>>cur[(<any>prefix)[i]];
      } else {
        return [];
      }
    }

    function _getWord(node: INode<T> | T, _prefix: string) {
      if ((<any>node)["data"] !== undefined) {
        output.push({
          word: _prefix,
          data: (<any>node)["data"]
        });
      }
  
      for (const key in <any>node) {
        if (key !== "data") {
          _getWord((<any>node)[key], _prefix + key)
        }
      }
    };
    _getWord(cur, prefix)

    return output;
  }

  // 与给定key有相同前缀的所有数据
  public match(key: string) {
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
        cur = <INode<T>>cur[key[i]];
      } else {
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
  public delete(key: string) {
    let cur = this.root;
    let detachParent: INode<T> | undefined = undefined;
    let detachIndex: number = -1;
    for (const i in <any>key) {
      if (cur[(<any>key)[i]]) {
        
        cur = <INode<T>>cur[(<any>key)[i]];
        if (Object.keys(<any>cur).length > 1) {
          detachParent = cur;
          detachIndex = parseInt(i, 10);
        }
      } else {
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
      }
    }
    const data = cur["data"];
    if (detachIndex === -1) {
      delete cur.data;
      return {
        find: true,
        data
      };
    } else {
      if (detachParent) {
        if ((<any>key)[detachIndex + 1] === undefined) {
          delete detachParent.data;
        } else {
          delete detachParent[(<any>key)[detachIndex + 1]]
        }
      }
      return {
        find: true,
        data
      };
    }
  }
}
