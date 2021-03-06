import React from 'react';

class Switch extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            isToggled: false,
        }
    }

    render() {
        return (
            <div className="switch_container">
                {this.props.empty ? null : <div>#</div>}
                <label className="switch">
                    <input 
                        type="checkbox" 
                        checked={this.state.isToggled}
                        onChange={() =>{ 
                            this.setState({isToggled: !this.state.isToggled})
                            this.props.switchState()
                        }}
                    />
                    <span className="slider"/>
                </label>
                {this.props.empty ? null : <div>X</div>}
            </div>
        );
    }
}

export default Switch;