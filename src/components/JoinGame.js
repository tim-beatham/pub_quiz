import React from "react"

import io from "socket.io-client";

const ENDPOINT = "http://localhost:9000";


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
        this.socket = io(ENDPOINT);

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
            <div className="component">
                <h1 id="banner">Join Game</h1>
                <input type="text" placeholder="GameID" onChange={(event) => this.setState({gameID: event.target.value})}/>
                <input type="button" value="Submit" onClick={() => this.submit(this.state.gameID)}/>

                <table id="join_table">
                    <thead>
                        <tr><th>Game ID</th><th>Quiz Name</th><th>Number Of Players</th><th>Quiz Master</th></tr>
                    </thead>
                    <tbody>
                        {this.state.gameComponents}
                    </tbody>
                </table>
            </div>
        );
    }
}