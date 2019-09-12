const gData = Symbol("data");

type IRouteNode<T> = {
  [key: string]: IRouteNode<T>;
  [ gData ]?: T | null;
};

export default class C4MQTopicRoute<T> {
  private root: IRouteNode<T>;

  constructor() {
    this.root = {};
  }

  public insert(key: string, data: T) {
    const words = key.split(".");
    let cur = this.root;
    for (let i = 0; i < words.length; i++) {
      const curWord = words[i];
      if (cur[curWord] === undefined) {
        cur[curWord] = <IRouteNode<T>>{}
      }
      cur = cur[curWord];
    }
    cur[gData] = data || null;
  }

  protected _match(root: IRouteNode<T>, words: string[]) {
    let cur = root;
    let outKey = [];
    let res: any = {
      find: false
    };
    let hashKey: IRouteNode<T> | undefined = undefined;
    for (let i = 0; i < words.length; i++) {
      const curWord = words[i];
      if (cur[curWord]) {
        outKey.push(curWord);
        cur = cur[curWord];
        hashKey = undefined;
        res.find = false;
      } else {
        if (hashKey) {
          cur = hashKey;
          continue;
        }
        if (cur["*"] || cur["#"]) {
          if (cur["*"]) {
            res = this._match(cur["*"], words.slice(i + 1));
            if (res.find) {
              outKey.push("*");
              if (res.routeKey !== "") outKey.push(res.routeKey);
            }
          }
          if (res.find === false && cur["#"]) {
            outKey.push("#");
            cur =  cur["#"];
            res.find = true;
            if (Object.keys(cur).length === 0) {
              break;
            } else {
              hashKey = cur;
            }
            continue;
          }
          if (res.find) {
            return {
              prefix: words.join("."),
              routeKey: outKey.join("."),
              find: true,
              data: res.data
            };
          }
        }
        
        if (res.find === false) {
          return {
            prefix: words.slice(0, i).join("."),
            routeKey: outKey.join("."),
            find: false,
            data: undefined
          };
        }
      } // cur[curWord] === undefined
    }

    if (cur[gData]) {
      return {
        prefix: words.join("."),
        routeKey: outKey.join("."),
        find: cur[gData] !== undefined,
        data: cur[gData]
      };
    } else {
      return {
        prefix: words.join("."),
        routeKey: cur["#"] !== undefined ? outKey.join(".") + ".#" : outKey.join("."),
        find: cur[gData] !== undefined || (cur["#"] !== undefined && cur["#"][gData] !== undefined),
        data: cur[gData] || (cur["#"] ? cur["#"][gData] : undefined)
      };
    }
  }

  public match(key: string) {
    const words = key.split(".");
    return this._match(this.root, words);
  }

  public delete(key: string) {
    const words = key.split('.');
    let cur = this.root;
    let detachParent: IRouteNode<T> | undefined = undefined;
    let detachIndex: number = -1;
    for (let i = 0; i < words.length; i++) {
      const curWord = words[i];
      if (cur[curWord]) {
        cur = cur[curWord];
        if (Object.keys(cur).length > 0) {
          detachParent = cur;
          detachIndex = i;
        }
      } else {
        return {
          find: false,
          data: undefined
        };
      }
    }

    // 没有匹配
    if (cur[gData] === undefined) {
      return {
        find: false,
        data: undefined
      };
    }

    // 已匹配，处理路径上的分支
    const data = cur[gData];
    if (detachIndex === -1) {
      // 无分支
      delete cur[gData];
    } else { // 有分支
      if (detachParent) {
        // 分支在结尾处
        if (words[detachIndex + 1] === undefined) {
          delete detachParent[gData];
        } else {
          // 分支在中间
          delete detachParent[words[detachIndex + 1]];
        }
      }
    }
    return {
      find: true,
      data
    };
  }
  
}

