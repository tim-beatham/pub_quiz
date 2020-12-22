import React from 'react';
import ReactDOM from 'react-dom';
import "./index.css";
import MainMenu from "./components/MainMenu"
import CreateGame from "./components/CreateGame";
import CreateQuiz from "./components/CreateQuiz";
import GameLobby from "./components/GameLobby";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showMainMenu: true,
            showCreateQuiz: false,
            showCreateGame: false,
            showGameLobby: false,
            quiz: {}
        }
    }

    showComponent(name) {
        switch (name) {
            case "menu":
                this.setState({showMainMenu: true, showCreateQuiz: false, showCreateGame: false, showGameLobby: false});
                break;
            case "createQuiz":
                this.setState({showCreateQuiz: true, showMainMenu: false, showCreateGame: false, showGameLobby: false});
                break;
            case "createGame":
                this.setState({showCreateGame: true, showMainMenu: false, showCreateQuiz: false, showGameLobby: false});
                break;
            case "showLobby":
                this.setState({showGameLobby: true, showCreateGame: false, showMainMenu: false, showCreateQuiz: false});
                break;
            default:
                this.setState({showMainMenu: true, showCreateQuiz: false, showCreateGame: false, showGameLobby: false});
        }
    }

    render() {
        return (
            <div>
                {this.state.showMainMenu &&
                <MainMenu
                    showCreateQuiz={() => this.showComponent("createQuiz")}
                    showCreateGame={() => this.showComponent("createGame")}
                />}
                {this.state.showCreateQuiz && <CreateQuiz
                    showMainMenu={() => this.showComponent("menu")}
                />}
                {this.state.showCreateGame && <CreateGame
                    showMainMenu={() => this.showComponent("menu")}
                    showLobby={() => this.showComponent("showLobby")}
                    setQuiz={(quiz) => this.setState({quiz})}
                />}
                {this.state.showGameLobby && <GameLobby
                    quiz={this.state.quiz}
                />}
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("root"));

