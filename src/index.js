import React from "react";
import ReactDOM from 'react-dom';
import "./index.css";
import MainMenu from "./components/MainMenu"
import CreateGame from "./components/CreateGame";
import CreateQuiz from "./components/CreateQuiz";
import GameLobby from "./components/GameLobby";
import JoinGame from "./components/JoinGame";


const STATES = {
    MAIN_MENU: "main-menu",
    CREATE_QUIZ: "create-quiz",
    CREATE_GAME: "create-game",
    SHOW_LOBBY: "show-lobby",
    JOIN_GAME: "join-game"
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentComponent: STATES.MAIN_MENU,
            quiz: {},
            username: "",
            gameID: "",
            isHost: false,
        }
    }

    showComponent(name) {
        switch (name) {
            case "main-menu":
                this.setState({currentComponent: STATES.MAIN_MENU});
                break;
            case "create-quiz":
                this.setState({currentComponent: STATES.CREATE_QUIZ})
                break;
            case "create-game":
                this.setState({currentComponent: STATES.CREATE_GAME});
                break;
            case "show-lobby":
                this.setState({currentComponent: STATES.SHOW_LOBBY});
                break;
            case "join-game":
                this.setState({currentComponent: STATES.JOIN_GAME});
                break;
            default:
                this.setState({currentComponent: STATES.MAIN_MENU});
        }
    }

    render() {
        let component = null;

        switch (this.state.currentComponent) {
            case STATES.MAIN_MENU:
                component = <MainMenu
                    showCreateQuiz={() => this.showComponent("create-quiz")}
                    showCreateGame={() => this.showComponent("create-game")}
                    showJoinGame={() => this.showComponent("join-game")}
                    setUsername={(username) => this.setState({username})}
                />;
                break;
            case STATES.CREATE_QUIZ:
                component = <CreateQuiz
                    showMainMenu={() => this.showComponent("menu")}
                />;
                break;
            case STATES.CREATE_GAME:
                component = <CreateGame
                    showMainMenu={() => this.showComponent("menu")}
                    showLobby={() => this.showComponent("show-lobby")}
                    setQuiz={(quiz) => this.setState({quiz})}
                    setHost={() => this.setState({isHost: true})}
                />;
                break;
            case STATES.SHOW_LOBBY:
                component = <GameLobby
                    quiz={this.state.quiz}
                    host={this.state.isHost}
                    setGameID={(gameID) => this.setState({gameID})}
                    getUsername={() => this.state.username}
                    getGameID={() => this.state.gameID.trim()}
                />
                break;
            case STATES.JOIN_GAME:
                component = <JoinGame 
                    setNotHost={() => this.setState({isHost: false})}
                    setGameID={(gameID) => this.setState({gameID})}
                    showLobby={() => this.showComponent("show-lobby")}
                />
                break;
            default:
                component = <MainMenu
                    showCreateQuiz={() => this.showComponent("create-quiz")}
                    showCreateGame={() => this.showComponent("create-game")}
                />;
                break;
        }

        return component;
    }
}

ReactDOM.render(<App />, document.getElementById("root"));

