import React from 'react';
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";


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
        
        window.addEventListener("beforeunload", (e) => {
            e.preventDefault();
            e.returnValue = "Are you sure you want to leave?";
            this.socket.close();
        });

        this.socket.on("quizMasterDisconnect", () => {
            this.socket.close();
            this.props.showError("Lobby Leader Disconnected");
        });
    }

    componentWillUnmount() {
        this.socket.close();
    }

    leaveLobby = () => {
        this.socket.emit("playerLeave", { 
            gameID: this.state.gameID, 
            username: this.props.username
        });
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
        this.socket.on("usersUpdated", (players) => {
            this.setState({players});
        });

        this.socket.on("joinedGame", ({quizName, gameID, gameMaster}) => {
            this.setState({quizName, gameID, gameMaster});
        });
    }

    createLobby = () => {
        this.socket.emit("createLobby", {username: this.props.username, quiz: this.props.quiz});

        this.socket.on("gameCreated", (id) => {
            this.setState({gameID: id});
            this.props.setGameID(id);
        });
    }

    joinLobby = () => {
        this.socket.emit("joinGame", ({gameID: this.props.getGameID(), username: this.props.username}));
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
