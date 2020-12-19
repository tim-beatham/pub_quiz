import React from 'react';

export default class MainMenu extends React.Component {
    render() {
        return (
            <div className="component">
                <h1 id="banner">Pub Quiz</h1>
                <button className="menu_button" onClick={this.props.showCreateQuiz}>Create Quiz</button>
                <button className="menu_button" onClick={this.props.showCreateGame}>Create Game</button>
            </div>
        );
    }
}
