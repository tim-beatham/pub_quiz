import React from "react"

import io from "socket.io-client";

import "../styling/join_game.css";

import {httpEndPoint} from "../config.json"



function GameComponent(props) {
    return (
        <tr onClick={() => props.submit(props.game.game)}>
            <td>{props.game.game}</td><td>{props.game.quiz}</td>
            <td>{props.game.numPlayers}</td>
            <td>{props.game.gameMaster}</td>
        </tr>
    )
}


export default class JoinGame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gameID: "",
            gameComponents: []
        }
    }

    componentDidMount () {
        this.socket = io(httpEndPoint);

        this.socket.emit("getGames");

        this.socket.on("displayGames", (games) => {
        let gameComponents = games.map(game => {
                return <GameComponent 
                    game={game}
                    submit={this.submit}
                />;
            });

            this.setState({gameComponents});
        });
    }

    submit = (gameID) => {
        this.props.setNotHost();
        this.props.setGameID(gameID);
        this.props.showLobby();
    }

    render () {
        return (
            <div id="join_game" className="col-100">
                <h1 id="banner">Join Game</h1>

                {this.state.gameComponents.length > 0 && 
                <div>
                    <h1>List of Games:</h1>
                    <table id="join_table">
                        <thead>
                            <tr><th>Game ID</th><th>Quiz Name</th><th>Number Of Players</th><th>Quiz Master</th></tr>
                        </thead>
                        <tbody>
                            {this.state.gameComponents}
                        </tbody>
                    </table>
                </div>}


                {this.state.gameComponents.length === 0 && <h1>No Games Available</h1>}
            </div>
        );
    }
}