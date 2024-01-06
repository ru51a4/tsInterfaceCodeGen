
class node {
    childrens = [];
    attr = [];
    tag = '';
    value = '';
    key = '';
    id = '';
    isArray = false;
}

class tsInterfaceCodeGen {
    static gen(str) {
        let obj = JSON.parse(str)
        let i = 0;
        let uuidv4 = () => {
            return i++;
        }
        //step 1 - create tree
        let start = new node();
        start.key = "root";
        let stack = [start];
        let nodes = [];
        let createTree = (obj, prevKey, prevIsArray = false) => {
            for (let key in obj) {
                let el = new node();
                el.id = uuidv4();
                el.key = (prevIsArray) ? prevKey : key;
                el.isArray = Array.isArray(obj[key]);
                stack[stack.length - 1].childrens.push(el);
                if ((/boolean|number|string/).test(typeof obj[key])) {
                    el.value = obj[key];
                } else {
                    stack.push(el);
                    if (!prevIsArray) {
                        nodes.push(el);
                    }
                    createTree(obj[key], key, el.isArray);
                    stack.pop();
                }
            }
        }
        createTree(obj);
        let r = [];
        nodes = nodes.sort((a, b) => a.childrens.filter((c) => c.childrens.length).length - b.childrens.filter((c) => c.childrens.length).length).filter((c) => !c.isArray);
        let resStr = '';
        let hack = [];
        nodes.forEach((c) => hack[`I${c.key}`] = `I${c.key}`);
        let iter = (node) => {
            resStr += `interface I${node.key.split("").map((ch, i) => i == 0 ? ch.toUpperCase() : ch).join("")} {\n`
            node?.childrens.forEach((node) => {
                let arr = (node.isArray && node.childrens) ? '[]' : ''
                if (node.value === '') {
                    if (hack[`I${node.key}`]) {
                        resStr += `${node.key}: I${node.key.split("").map((ch, i) => i == 0 ? ch.toUpperCase() : ch).join("")}${arr};\n`
                    } else {
                        resStr += `${node.key}: any;\n`
                    }
                } else {
                    resStr += `${node.key}: ${typeof node.value}${arr};\n`
                }
            });
            resStr += `}\n`
        }

        while (nodes.length) {
            let n = nodes.shift();
            resStr = '';
            iter(n);
            r.push(resStr);
        }
        return (r.reverse().join("\n"));
    }

}
global.window.tsInterfaceCodeGen = tsInterfaceCodeGen;

module.exports = tsInterfaceCodeGen