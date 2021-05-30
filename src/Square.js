import React from 'react';

class Square extends React.Component {
    render() {
        return (
            <button 
            className="square" 
            onClick={this.props.onClick} 
            disabled= {this.props.disabled}
            >
                {this.props.value !== '_' ? this.props.value : null}
            </button>
        );
    }
}

export default Square;