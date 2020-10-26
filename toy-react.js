export class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }

    setAttribute(name, value) {
        this.root.setAttribute(name, value);
    }

    appendChild(component) {
        this.root.appendChild(component.root);
    }
}

export class TextWrapper {

    constructor(content) {
        this.root = document.createTextNode(content);
    }
}

export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
    }

    setAttribute(name, value) {
        this.props[name] = value;
    }

    appendChild(component) {
        this.children.push(component);
    }

    get root() {
        if (!this._root) {
            this._root = this.render().root;
        }
        return this._root;
    }

    render() {

    }
}

export function createElement(type, attributes, ...children) {
    console.log(type, attributes, children);
    let e;
    if (typeof type === "string") {
        e = new ElementWrapper(type);
    } else {
        e = new type();
    }

    for (let p in attributes) {
        console.log(e);
        e.setAttribute(p, attributes[p]);
    }
    let insertChild = (children) => {
        for (let child of children) {
            if (typeof child === "string") {
                child = new TextWrapper(child);
            }
            // console.log(child, children);
            if (typeof child === "object" && child instanceof Array) {
                insertChild(child);
                return
            }
            e.appendChild(child);
        }
    }
    insertChild(children);
    return e;
}

export function render(component, parentElement) {
    parentElement.appendChild(component.root);
}