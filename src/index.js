import React from 'react';
import ReactDOM from 'react-dom';
import "./index.css";
import MainMenu from "./components/MainMenu"
import CreateGame from "./components/CreateGame";
import CreateQuiz from "./components/CreateQuiz";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showMainMenu: true,
            showCreateQuiz: false,
            showCreateGame: false
        }
    }

    showComponent(name) {
        switch (name) {
            case "menu":
                this.setState({showMainMenu: true, showCreateQuiz: false, showCreateGame: false});
                break;
            case "createQuiz":
                this.setState({showCreateQuiz: true, showMainMenu: false, showCreateGame: false});
                break;
            case "createGame":
                this.setState({showCreateGame: true, showMainMenu: false, showCreateQuiz: false});
                break;
            default:
                this.setState({showMainMenu: true, showCreateQuiz: false, showCreateGame: false});
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
                />}
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("root"));

