import React from 'react';

import "../styling/main_menu.css";

export default function MainMenu (props) {
    return (
        <div id="main_menu" className="col-100">
            <h1 id="banner">Pub Quiz</h1>

            <div>
                <label>Username:</label>
                <input id="name_box" type="text" placeholder="Name" onChange={(event) => props.setUsername(event.target.value)}/>
            </div>
            
            <button className="menu_button" onClick={props.showCreateQuiz}>Create Quiz</button>
            <button className="menu_button" onClick={props.showCreateGame}>Create Game</button>
            <button className="menu_button" onClick={props.showJoinGame}>Join Game</button>
        </div>
    );
}
