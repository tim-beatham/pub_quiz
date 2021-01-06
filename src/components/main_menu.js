import React from 'react';

import "../styling/main_menu.css";

export default class MainMenu extends React.Component {

    constructor (props) {
        super(props);
    
        this.state = {
            showInvalidUsername: false
        }

    }

    transitionToCreateGame = () => {
        if (this.props.username !== "") {
            this.props.showCreateGame();
            return;
        }

        this.setState({showInvalidUsername: true});
    }

    transitionToJoinGame = () => {
        if (this.props.username !== "") {
            this.props.showJoinGame();
            return;
        }

        this.setState({showInvalidUsername: true});
    }

    render () {
        return (
            <div id="main_menu" className="col-100">
                <h1 id="banner">Pub Quiz</h1>
    
                <div>
                    <label>Username:</label>
                    <input id="name_box" type="text" placeholder="Name" onChange={(event) => this.props.setUsername(event.target.value.trim())}/>
                </div>
                
                <button className="menu_button" onClick={this.props.showCreateQuiz}>Create Quiz</button>
                <button className="menu_button" onClick={this.transitionToCreateGame}>Create Game</button>
                <button className="menu_button" onClick={this.transitionToJoinGame}>Join Game</button>

                {this.state.showInvalidUsername && <h2>Please enter a username!</h2>}

            </div>
        );    
    }
}
