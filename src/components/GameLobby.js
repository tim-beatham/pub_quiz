import React from 'react';
import io from "socket.io-client";

const ENDPOINT = "http://localhost:9000";

export default class GameLobby extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            gameID: "",
            socket: null,
            quiz: this.props.quiz
        };
    }

    componentDidMount() {
        let socket = io(ENDPOINT);
        this.setState({socket});
        socket.emit("createLobby");

        socket.on("gameCreated", (id) => {
            this.setState({gameID: id});
        });
    }

    render() {
        return (
            <div className="component">
                <h1 id="banner">Game Lobby</h1>
                <p>{this.props.quiz.quiz_name}</p>
                <p>{this.state.gameID}</p>
            </div>
        )
    }


}