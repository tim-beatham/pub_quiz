import React from 'react';
import io from "socket.io-client";

const ENDPOINT = "http://localhost:9000";


export default class GameLobby extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            gameID: "",
            socket: null,
            players: [],
            quizName: "",
            gameMaster: ""
        };
    }

    componentDidMount() {
        this.socket = io(ENDPOINT);

        this.socketEvents();

        this.props.host ? this.createLobby() : this.joinLobby();
    }


    generateStyle = (player) => {
        if (player === this.state.gameMaster) {
            return {backgroundColor: "green"};
        }

        return {backgroundColor: "red"};
    }

    generatePlayerComponents = () => {
        return this.state.players.map(player => <div style={this.generateStyle(player)} className="player_component"><h3>{player}</h3></div>);
    }

    socketEvents = () => {
        this.socket.on("userJoined", (players) => {
            this.setState({players});
        });

        this.socket.on("joinedGame", ({quizName, gameID, gameMaster}) => {

            this.setState({quizName, gameID, gameMaster});
        });
    }

    createLobby = () => {
        this.socket.emit("createLobby", {username: this.props.getUsername(), quiz: this.props.quiz});

        this.socket.on("gameCreated", (id) => {
            this.setState({gameID: id});
            this.props.setGameID(id);
        });
    }

    joinLobby = () => {
        // TODO: DO THE JOIN SOCKET PROTOCOL.
        this.socket.emit("joinGame", ({gameID: this.props.getGameID(), username: this.props.getUsername()}));
    }

    render() {
        return (
            <div className="component">
                <h1 id="banner">Game Lobby</h1>
                <p>{this.state.quizName}</p>
                <p>{this.state.gameID}</p>
                <div id="players_section">
                    {this.generatePlayerComponents()}
                </div>
            </div>
        )
    }
}
