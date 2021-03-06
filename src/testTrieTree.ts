import C4TrieTree from './C4MQTypes/C4TrieTree'

const tree = new C4TrieTree<{[key:string]: string}>();

tree.insert("*", {})
tree.insert("hello", {});
tree.insert("hello2", {});
tree.insert("hellozxxz", {});
tree.insert("hexxz", {});
tree.insert("world", {});
tree.insert("你好", {});

console.log(tree.contains("你好"));
console.log(tree.contains("hell"));
console.log(tree.contains("hexxz"));
console.log(tree.contains("helz"));
console.log(tree.contains("world"));
console.log(tree.contains("worz"));

console.log("--------------------------------");

console.log(tree.match("helloaaa"));
console.log(tree.find("hell"));

console.log("--------------------------------");

console.log(JSON.stringify(tree, null ,2));

// console.log(tree.delete("hell"));
// console.log(tree.delete("hello"));
// console.log(tree.delete('hexxz'));

// console.log(JSON.stringify(tree, null ,2));

// console.log("--------------------------------");

// console.log(tree.contains("你好"));
// console.log(tree.contains("hell"));
// console.log(tree.contains("hexxz"));
// console.log(tree.contains("helz"));
// console.log(tree.contains("world"));
// console.log(tree.contains("worz"));

// console.log("--------------------------------");

// console.log(tree.match("helloaaa"));
// console.log(tree.find("hell"));
