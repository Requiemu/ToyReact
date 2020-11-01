import { createElement, Component, render } from "./toy-react.js";

class MyComponent extends Component {

    constructor() {
        super();
        this.state = {
            a: 1
        }
    }

    // onClick() {
    //     this.state.a += 1
    // }

    render() {
        return <div>
            <h1>My component</h1>
            <div>{this.state.a.toString()}</div>
            <button onClick={() =>{this.setState({a: this.state.a+1}); console.log(this.state.a)}}>加</button>
            {this.children}
        </div>
    }
}

render(
    <MyComponent id="a">
        <div>123</div>
    </MyComponent>
    , document.body)