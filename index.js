
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
        nodes.forEach((c) => hack[`I${c.key}`] = true);
        let blya = (node) => {
            resStr += `interface I${node.key} {\n`
            node?.childrens.forEach((node) => {
                let arr = (node.isArray && node.childrens) ? '[]' : ''
                if (node.value === '') {
                    let a = nodes?.childrens?.[0].key
                    let keyZaeb = nodes?.childrens?.filter((c) => c.key !== a)?.length;
                    resStr += `${node.key}: ${arr}${(hack[`I${node.key}`] || (!keyZaeb && a)) ? `I` + node.key : 'any'};\n`
                } else {
                    resStr += `${node.key}: ${arr}${typeof node.value};\n`
                }
            });
            resStr += `}\n`
        }

        while (nodes.length) {
            let n = nodes.shift();
            resStr = '';
            blya(n);
            r.push(resStr);
        }
        return (r.reverse().join("\n"));
    }

}
global.window.tsInterfaceCodeGen = tsInterfaceCodeGen;

module.exports = tsInterfaceCodeGen