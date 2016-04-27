import React from 'react';
var Component = React.Component;

module.exports = {
    createFile: function () {

    },
    deleteFile: function () {

    }
};

export function foo () {

}

export function baz () {

}

export class MyComponent extends React.Component {

}

export class MySecondComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {foo: 1};
    }
    componentDidMount() {

    }
    render () {
        return <div className="whatever"></div>;
    }
}
