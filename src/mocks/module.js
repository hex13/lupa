import React from 'react';
var Component = React.Component;

export function foo () {

}

export function baz () {

}

export class MyComponent extends React.Component {

}

export class MySecondComponent extends Component {
    render () {
        return <div className="whatever"></div>;
    }
}