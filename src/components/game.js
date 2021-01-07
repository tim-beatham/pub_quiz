import React, {useState} from 'react';
import io from "socket.io-client";

import "../styling/game.css"

const {httpEndPoint} = require("../config.json");

const NUM_START = 3;

let socket = io(httpEndPoint);

const STATES = {
    GAME_LOBBY: "game-lobby",
    QUESTION_SECTION: "question-section",
    WAIT_STATE: "wait",
    END_STATE: "end-state",
    GAME_MASTER: "game-master"
}

function StartGameButton(props) {

    function startGame() {
        if (props.getNumPlayers() < NUM_START) 
            return;

        props.startGame();
    }

    return (
        <input type="button" id="start_game_button" value="Start Game" onClick={startGame} />
    );
} 


class QuestionSection extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            answer: ""
        }
    }

    render () {
        return (
            <div id="question_component" className="col-100">
                <h1 id="banner">
                    {this.props.question}
                </h1>
                <div>
                    <label>Enter the answer:</label>
                    <input type="text" onChange={(e) => this.setState({answer: e.target.value})} />
                    <button onClick={() => this.props.submitAnswer(this.state.answer)}>Enter</button>
                </div>
            </div>
        );
    }
}

function UserQuestionComponent(props) {

    const [correct, setCorrect] = useState(false);

    function setAnswer(e) {
        props.setAnswer(props.username, !correct);
        setCorrect(!correct);
    }

    return (
        <div onClick={setAnswer} className="answer_component" style={{backgroundColor: (correct) ? "green" : "red"}}>
            <p>{props.username}</p>
            <p>{props.answer}</p>
        </div>
    )
}


class GameMasterSection extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            userQuestions: [],
            answersCorrect: {}
        }
    }

    componentDidMount () {
        socket.on("userAnswer", ({answer, username}) => {
            this.setState({userQuestions: [...this.state.userQuestions, 
                                                <UserQuestionComponent  answer={answer} 
                                                                        username={username} 
                                                                        setAnswer={this.setAnswer}
                                                                        />]});
        });
    }

    setAnswer = (username, correct) => {
        let answers = Object.assign({}, this.state.answersCorrect);
        answers[username] = correct;
        this.setState({answersCorrect: answers});
    }

    submitAnswers = () => {
        // Emit the answers to the socket.
        socket.emit("userAnswers", this.state.answersCorrect);

        // Remove the questions and the answers.
        this.setState({userQuestions: []});
        this.setState({answersCorrect: {}});
    }

    render () {
        return (
            <div id="game_master" className="col-100">
                <h1 id="banner">Marking Answers</h1>

                <h2>Question: {this.props.question}</h2>
                <h2>Answer: {this.props.answer}</h2>

                {this.state.userQuestions.length === 0 && 
                    <div>
                        <h2>Waiting For Users To Submit Answers</h2>
                        <div class="loader"></div>
                    </div>}

                <div id="answer_section">
                    {this.state.userQuestions}
                </div>

                {this.props.players.length - 1 === this.state.userQuestions.length && 
                    <button onClick={this.submitAnswers}>Submit</button>}
            </div>
        )
    }
}

class WaitSection extends React.Component {
    render () {
        return (
            <div className="component">
                <h1 id="banner">Waiting</h1>
                <div className="loader"></div>
            </div>
        )
    }
}

class EndState extends React.Component {

    constructor (props) {
        super (props);

        this.state = {
            leaderboard: []
        }
    }

    componentDidMount () {
        // Make a request to get the leader board.
        socket.emit("getLeaderboard");

        socket.on("leaderboard", leaderboard => {
            let players = [];
            
            leaderboard.forEach((player, index) => {
                players.push(<h1>{`${index + 1}) ${player}`}</h1>);
            });
            
            // Set the state of the component.
            this.setState({leaderboard: players});
        });
    }


    render () {
        return (
            <div className="component">
                <h1 id="banner">Leaderboard</h1>
                {this.state.leaderboard}
            </div>
        );
    }
}

class GameLobby extends React.Component {
  
    generatePlayerComponents = () => {
        return this.props.players.map(player => <div 
            style={this.generateStyle(player)} 
            className="player_component">
            <h3>{player}</h3></div>);
    }

    generateStyle = (player) => {
        if (player === this.props.gameMaster) {
            return {backgroundColor: "green"};
        }
        return {backgroundColor: "red"};
    }

    render () {
        return (
            <div id="game_lobby" className="col-100">
                <h1 id="banner">Game Lobby</h1>
                <p>{this.props.gameID}</p>
                <p>{this.props.quizName}</p>
                <div id="players_section">
                    {this.generatePlayerComponents()}
                </div>
                {this.props.gameMaster === this.props.username && <StartGameButton 
                    getNumPlayers={() => this.props.players.length}
                    startGame={this.props.startGame}
                />}
            </div>
        )
    }
}


export default class Game extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            gameID: "",
            players: [],
            quizName: "",
            gameMaster: "",
            currentQuestion: "",
            currentAnswer: "",
            currentState: STATES.GAME_LOBBY
        };
    }

    componentDidMount() {
        socket = io(httpEndPoint);

        socket.open();

        this.props.host ? this.createLobby() : this.joinLobby();
        
        window.addEventListener("beforeunload", (e) => {
            e.preventDefault();
            e.returnValue = "Are you sure you want to leave?";
            socket.close();
        });

        
        this.socketEvents();
    }

    componentWillUnmount() {
        socket.close();
    }

    socketEvents = () => {
        socket.on("usersUpdated", (players) => {
            this.setState({players});

            let isGameMasterAndPlaying = this.state.gameMaster === this.props.username 
                                                    && this.state.currentState === STATES.GAME_MASTER;
                                                    
            if (isGameMasterAndPlaying && players.length === 1) {
                this.props.showError ("All the players have disconnected you are on your own");
            }
        });

        socket.on("joinedGame", ({quizName, gameID, gameMaster}) => {
            this.setState({quizName, gameID, gameMaster});
        });

        socket.on("nextQuestion", (question) => {
            let isGameMaster = this.state.gameMaster === this.props.username;

            let stateToShow = (isGameMaster) ? STATES.GAME_MASTER : STATES.QUESTION_SECTION;

            this.setState({currentState: stateToShow});

            this.setState({currentQuestion: question.question});

            if (isGameMaster) {
                this.setState({currentAnswer: question.answer});
            }
        });

        socket.on("gameEnded", () => {
            this.setState({currentState: STATES.END_STATE});
        });

        socket.on("quizMasterDisconnect", () => {
            socket.close();
            this.props.showError("Lobby Leader Disconnected");
        });

        socket.on("userDisconnected", (user) => {
            if (this.state.currentState === STATES.QUESTION_SECTION || this.state.currentState === STATES.GAME_MASTER 
                                                                        || this.state.currentState === STATES.WAIT_STATE) {
                alert (`${user} disconnected!`);
            }
        });

        socket.on("usernameTaken", (username) => {
            this.props.showError(`Username '${username}' is already taken`);
        });
    }

    createLobby = () => {
        socket.emit("createLobby", {username: this.props.username, quiz: this.props.quiz});

        socket.on("gameCreated", (id) => {
            this.setState({gameID: id});
            this.props.setGameID(id);
        });
    }

    joinLobby = () => {
        socket.emit("joinGame", ({gameID: this.props.getGameID(), username: this.props.username}));
    }

    startGame = () => {
        socket.emit("startGame");
    }

    submitAnswer = (answer) => {
        socket.emit("submitAnswer", answer);
        this.setState({currentState: STATES.WAIT_STATE});
    }

    render() {
        let component = null;

        switch (this.state.currentState) {
            case STATES.QUESTION_SECTION:
                component = <QuestionSection
                    question={this.state.currentQuestion}
                    submitAnswer={this.submitAnswer}
                />
                break;
            case STATES.WAIT_STATE:
                component = <WaitSection />
                break;
            case STATES.END_STATE:
                component = <EndState />
                break;
            case STATES.GAME_MASTER:
                component = <GameMasterSection 
                    question={this.state.currentQuestion}
                    answer={this.state.currentAnswer}
                    players={this.state.players}
                />;
                break;
            default:
            case STATES.GAME_LOBBY:
                component = <GameLobby
                    gameID={this.state.gameID}
                    gameName={this.state.quizName}
                    players={this.state.players}
                    startGame={this.startGame}
                    showGameState={() => this.setState({state: STATES.QUESTION_SECTION})}
                    username={this.props.username}
                    gameMaster={this.state.gameMaster}
                />;
                break;
        }

        return (
            <div id="game_section">
                {component}
            </div>
        )
    }
}
