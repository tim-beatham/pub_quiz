import React from "react";
import ReactDOM from 'react-dom';

import "./styling/content.css";
import "./styling/structure.css";

import MainMenu from "./components/main_menu"
import CreateGame from "./components/create_game";
import CreateQuiz from "./components/create_quiz";
import Game from "./components/game";
import JoinGame from "./components/join_game";
import ErrorComponent from "./components/error";


/**
 * The possible states that the application
 * can contain.
 */
const STATES = {
    MAIN_MENU: "main-menu",
    CREATE_QUIZ: "create-quiz",
    CREATE_GAME: "create-game",
    SHOW_LOBBY: "show-lobby",
    JOIN_GAME: "join-game",
    ERROR: "error"
}

/**
 * The root component for the web application.
 * 
 * Contains the current component to be displayed, as
 * well as variables shared between components.
 * 
 */
class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentComponent: STATES.MAIN_MENU,
            quiz: {},
            username: "",
            gameID: "",
            errorMsg: "",
            isHost: false,
        }
    }

    render() {
        let component = null;

        switch (this.state.currentComponent) {
            case STATES.MAIN_MENU:
                component = <MainMenu
                    showCreateQuiz={() => this.setState({currentComponent: STATES.CREATE_QUIZ})}
                    showCreateGame={() => this.setState({currentComponent: STATES.CREATE_GAME})}
                    showJoinGame={() => this.setState({currentComponent: STATES.JOIN_GAME})}
                    setUsername={(username) => this.setState({username})}
                    username={this.state.username}
                />;
                break;
            case STATES.CREATE_QUIZ:
                component = <CreateQuiz
                    showMainMenu={() => this.setState({currentComponent: STATES.MAIN_MENU})}
                />;
                break;
            case STATES.CREATE_GAME:
                component = <CreateGame
                    showMainMenu={() => this.setState({currentComponent: STATES.MAIN_MENU})}
                    showLobby={() => this.setState({currentComponent: STATES.SHOW_LOBBY})}
                    setQuiz={(quiz) => this.setState({quiz})}
                    setHost={() => this.setState({isHost: true})}
                />;
                break;
            case STATES.SHOW_LOBBY:
                component = <Game
                    quiz={this.state.quiz}
                    host={this.state.isHost}
                    setGameID={(gameID) => this.setState({gameID})}
                    username = {this.state.username}
                    getGameID={() => this.state.gameID.trim()}
                    showError = {(errorMsg) => {
                        this.setState({errorMsg});
                        this.setState({currentComponent: STATES.ERROR});
                    }}
                />
                break;
            case STATES.JOIN_GAME:
                component = <JoinGame 
                    setNotHost={() => this.setState({isHost: false})}
                    setGameID={(gameID) => this.setState({gameID})}
                    showLobby={() => this.setState({currentComponent: STATES.SHOW_LOBBY})}
                />
                break;
            case STATES.ERROR:
                component = <ErrorComponent
                    errorMsg={this.state.errorMsg}
                />
                break;
            default:
                component = <MainMenu
                    showCreateQuiz={() => this.setState({currentComponent: STATES.CREATE_QUIZ})}
                    showCreateGame={() => this.setState({currentComponent: STATES.CREATE_GAME})}
                />;
                break;
        }

        return component;
    }
}

ReactDOM.render(<App />, document.getElementById("root"));

