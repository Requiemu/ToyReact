import { createElement, Component, render } from "./toy-react.js";

class MyComponent extends Component {

    render() {
        return <div>
            <h1>My component</h1>
            {this.children}
        </div>
    }
}

render(
    <MyComponent id="a">
        <div>123</div>
        <div>456</div>
    </MyComponent>
, document.body)