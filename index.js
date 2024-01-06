
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
        str = `{"menu": {
    "header": "SVG Viewer",
    "items": [
        {"id": "Open"},
        {"id": "OpenNew", "label": "Open New"},
        null,
        {"id": "ZoomIn", "label": "Zoom In"},
        {"id": "ZoomOut", "label": "Zoom Out"},
        {"id": "OriginalView", "label": "Original View"},
        null,
        {"id": "Quality"},
        {"id": "Pause"},
        {"id": "Mute"},
        null,
        {"id": "Find", "label": "Find..."},
        {"id": "FindAgain", "label": "Find Again"},
        {"id": "Copy"},
        {"id": "CopyAgain", "label": "Copy Again"},
        {"id": "CopySVG", "label": "Copy SVG"},
        {"id": "ViewSVG", "label": "View SVG"},
        {"id": "ViewSource", "label": "View Source"},
        {"id": "SaveAs", "label": "Save As"},
        null,
        {"id": "Help"},
        {"id": "About", "label": "About Adobe CVG Viewer..."}
    ]
}}
`
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
        let map = [];
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
                    nodes.push(el);
                    createTree(obj[key], key, el.isArray);
                    stack.pop();
                }
            }
        }
        createTree(obj);
        let r = [];
        nodes = nodes.sort((a, b) => a.childrens.filter((c) => c.childrens.length).length - b.childrens.filter((c) => c.childrens.length).length)
        let resStr = '';
        let dfs = (node) => {
            resStr += `interface I${node.key} {\n`
            node?.childrens.forEach((node) => {

                let arr = (node.childrens) ? '[]' : ''
                if (node.value === '') {
                    resStr += `${node.key}: ${arr}I${node.key};\n`
                } else {
                    resStr += `${node.key}: ${arr}${typeof node.value};\n`
                }
            });
            resStr += `}\n`
        }

        while (nodes.length) {
            let n = nodes.shift();
            resStr = '';
            dfs(n);
            r.push(resStr);
        }
        return (r.reverse().join("\n"));
    }

}
console.log(tsInterfaceCodeGen.gen());
//module.exports = tsInterfaceCodeGen