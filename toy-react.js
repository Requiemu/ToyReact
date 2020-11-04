const RENDER_TO_DOM = Symbol("render to dom");

export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }

    get vdom() {
        if (!this._vdom) {
            this._vdom = this.render().vdom;
            return this._vdom;
        }
        return this.render().vdom;
    }

    update() {
        const isSameVDom = (oldVDom, newVDom) => {
            if (!oldVDom) {
                return false;
            }
            if (oldVDom.type !== newVDom.type) {
                return false;
            }
            for (let name in newVDom.props) {
                if (newVDom.props[name] !== oldVDom.props[name]) {
                    return false;
                }
            }
            if (oldVDom.props.length > newVDom.props.length) {
                return false;
            }
            if (newVDom.type === '#text') {
                return newVDom.content === oldVDom.content;
            }
            return true;
        }

        const update = (oldVDom, newVDom) => {
            if (!isSameVDom(oldVDom, newVDom)) {
                console.log('update different node:', oldVDom, newVDom);
                newVDom[RENDER_TO_DOM](oldVDom._range);
                return;
            }

            newVDom._range = oldVDom._range;

            let newChildren = newVDom.vchildren;
            let oldChildren = oldVDom.vchildren;

            if (!newChildren || !newChildren.length) {
                return;
            }

            let tailRange = oldChildren[oldChildren.length - 1]._range;

            // Update children
            for (let i in newVDom.vchildren) {
                let newChild = newChildren[i];
                let oldChild = oldChildren[i];
                if (i < oldChildren.length) {
                    update(oldChild, newChild);
                } else {
                    let range = tailRange.cloneRange();
                    range.cllapse();
                    newChild[RENDER_TO_DOM](range);
                    tailRange = range;
                }
            }

        }

        let vdom = this.vdom;
        update(this._vdom, vdom);
        this._vdom = vdom;
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
            this.update();
        }

    }

    setAttribute(name, value) {
        if (value === 'square') {
        }
        this.props[name] = value;
    }

    appendChild(component) {
        this.children.push(component);
    }

    [RENDER_TO_DOM](range) {
        this._range = range;
        this._vdom = this.vdom;
        this._vdom[RENDER_TO_DOM](range);
    }
}

export class ElementWrapper extends Component {
    constructor(type) {
        super();
        this.type = type;
    }

    get vdom() {
        this.vchildren = this.children.map(child => child.vdom);
        return this;
    }

    [RENDER_TO_DOM](range) {
        this._range = range;
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

        if (!this.vchildren) {
            this.vchildren = this.children.map(child => child._vdom);
        }

        for (let component of this.vchildren) {
            let childRange = document.createRange();
            childRange.setStart(root, root.childNodes.length);
            childRange.setEnd(root, root.childNodes.length);
            component[RENDER_TO_DOM](childRange);
        }

        this._root = root;
        replaceContent(range, root);
    }
}

function replaceContent(range, node) {
    // range.deleteContents();
    // range.insertNode(root);  <==== this will not work, text element will cause error
    range.insertNode(node);
    range.setStartAfter(node);
    range.deleteContents();

    range.setStartBefore(node);
    range.setEndAfter(node);
}

export class TextWrapper extends Component {

    constructor(content) {
        super();
        this.type = '#text';
        this.content = content;
    }

    get vdom() {
        return this;
    }

    [RENDER_TO_DOM](range) {
        this._range = range;
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