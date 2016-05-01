import React from 'react';


class WeirdAnimal extends React.Component {
    render() {
        const className = 'tree';
        return <div id="one-and-only">
            <span className="cat squirrel">
                :)
                <div className={className}></div>
            </span>
        </div>
    }
}



export function Foo({blah}) {
    var test = <div className="bar"></div>;
    return <span className="baz"></span>;
}
