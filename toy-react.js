const RENDER_TO_DOM = Symbol("render to dom");

export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }

    get vdom() {
        return this.render().vdom;
    }

    update(range) {
        if (range) {
            this._range = range;
        }
        this._range.deleteContents();
        this[RENDER_TO_DOM](this._range);
    }

    setState(newState) {
        if (this.state === null) {
            this.state = newState;
        } else if (typeof this.state !== 'object') {
            this.state = newState;
        } else if (typeof this.state === 'object') {
            const merge = (oldValue, newValue) => {
                for (let p in newValue) {
                    if (oldValue[p] === null || typeof oldValue[p] !== 'object') {
                        oldValue[p] = newValue[p];
                    } else {
                        merge(oldValue[p], newValue[p]);
                    }
                }
            }
            merge(this.state, newState);
        }
        this.update();
    }

    setAttribute(name, value) {
        this.props[name] = value;
    }

    appendChild(component) {
        this.children.push(component);
    }

    [RENDER_TO_DOM](range) {
        this._range = range;
        this.render().update(range);
    }



    render() {

    }
}

export class ElementWrapper extends Component {
    constructor(type) {
        super();
        this.type = type;
    }

    get vdom() {
        return this;
    }

    [RENDER_TO_DOM](range) {
        const root = document.createElement(this.type);

        for (let name in this.props) {
            const value = this.props[name]
            if (name.match(/^on([\s\S]+)$/)) {
                root.addEventListener(RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase()), value);
            } else if (name === 'className') {
                root.setAttribute('class', value);
            } else {
                root.setAttribute(name, value);
            }
        }

        for (let component of this.children) {
            let range = document.createRange();
            range.setStart(root, root.childNodes.length);
            range.setEnd(root, root.childNodes.length);
            // component[RENDER_TO_DOM](range);
            component.update(range);
        }


        range.deleteContents();
        range.insertNode(root);
    }
}

export class TextWrapper extends Component {

    constructor(content) {
        super();
        this.content = content;
    }

    get vdom() {
        return this;
    }

    [RENDER_TO_DOM](range) {
        const root = document.createTextNode(this.content);
        range.deleteContents();
        range.insertNode(root);
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
    insertChild(children);
    return e;
}

export function render(component, parentElement) {
    let rootRange = document.createRange();
    rootRange.selectNodeContents(parentElement);
    component[RENDER_TO_DOM](rootRange);
}