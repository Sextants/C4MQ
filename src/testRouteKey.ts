import C4MQTopicRoute from "./C4MQTypes/C4MQTopicRoute";

const routeKeys = new C4MQTopicRoute<{[key:string]: string}>();

routeKeys.insert("*", {});
routeKeys.insert("*.*.*", {});
routeKeys.insert("#", {});
routeKeys.insert("aa.bb.cc", {});
routeKeys.insert("aa.*.cc", {});
routeKeys.insert("*.bb.*", {});
routeKeys.insert("#.aa.#", {});
routeKeys.insert("#.bb.*", {});
routeKeys.insert("#.bb.cc", {});
routeKeys.insert("#.cc", {});
routeKeys.insert("#.aa.#.#", {});

// console.log(JSON.stringify(routeKeys, null, 2));

console.log(routeKeys.match("abcde"));              // match *
console.log(routeKeys.match("abcde.ee.zz"));        // match *.*.*
console.log(routeKeys.match("abcde.ee"));           // match #
console.log(routeKeys.match("aa.bb.cc"));           // match aa.bb.cc
console.log(routeKeys.match("aa.zz.cc"));           // match aa.*.cc
console.log(routeKeys.match("zz.bb.yy"));           // match *.bb.*
console.log(routeKeys.match("abced.ee.zz.aa"));     // match #.aa.#
console.log(routeKeys.match("abced.ee.zz.aa.aa.zzz"));     // match #.aa.#
console.log(routeKeys.match("mm.dd.bb.aa"));        // match #.bb.*
console.log(routeKeys.match("mm.dd.bb.cc"));        // match #.bb.cc
console.log(routeKeys.match("mm.dd.zz.cc"));        // match #.cc
console.log(routeKeys.match("*.*.cc"));
