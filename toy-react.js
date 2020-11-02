const RENDER_TO_DOM = Symbol("render to dom");

export class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }

    setAttribute(name, value) {
        if (name.match(/^on([\s\S]+)$/)) {
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, (s)=>s.toLowerCase()), value);
        } else if (name === 'className'){
            this.root.setAttribute('class', value);
        } else {
            this.root.setAttribute(name, value);
        }
    }

    appendChild(component) {
        let range = document.createRange();
        range.setStart(this.root, this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length);
        component[RENDER_TO_DOM](range);
    }

    [RENDER_TO_DOM](range){
        range.deleteContents();
        range.insertNode(this.root);
    }
}

export class TextWrapper {

    constructor(content) {
        this.root = document.createTextNode(content);
    }

    [RENDER_TO_DOM](range) {
        range.deleteContents();
        range.insertNode(this.root);
    }
}

export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }

    rerender() {
        this._range.deleteContents();
        this.render()[RENDER_TO_DOM](this._range);
    }

    setState(newState) {
        if (this.state === null) {
            this.state = newState;
        } else if (typeof this.state !== 'object'){
            this.state = newState;
        } else if (typeof this.state === 'object') {
            const merge = (oldValue, newValue) => {
                for (let p in newValue) {
                    if (oldValue[p] === null || typeof oldValue[p] !== 'object' ) {
                        oldValue[p] = newValue[p];
                    } else {
                        merge(oldValue[p], newValue[p]);
                    }
                }
            }
            merge(this.state, newState);
        }
        this.rerender();
    }

    setAttribute(name, value) {
        this.props[name] = value;
    }

    appendChild(component) {
        this.children.push(component);
    }

    [RENDER_TO_DOM](range) {
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }



    render() {

    }
}

export function createElement(type, attributes, ...children) {
    let e;
    if (typeof type === "string") {
        e = new ElementWrapper(type);
    } else {
        e = new type();
    }

    for (let p in attributes) {
        e.setAttribute(p, attributes[p]);
    }
    let insertChild = (children) => {
        for (let child of children) {
            if (child === null) {
                child = new TextWrapper('');
            }
            if (typeof child === "string") {
                child = new TextWrapper(child);
            }
            if (typeof child === "object" && child instanceof Array) {
                insertChild(child);
                return
            }
            e.appendChild(child);
        }
    }
    console.log(e, children)
    insertChild(children);
    return e;
}

export function render(component, parentElement) {
    let rootRange = document.createRange();
    rootRange.selectNodeContents(parentElement);
    component[RENDER_TO_DOM](rootRange);
}