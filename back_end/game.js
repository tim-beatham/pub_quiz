const {v4: uuidv4} = require("uuid");

// Maps a game ID to a game object. 
let games = {};

// The servers socket.
let io = null;

let logger = null;

/**
 * Create an instance of the server's
 * WebSocket.
 * @param {*} http      the instance of the http socket. 
 */
function createIO(http, logIn) {

    io = require("socket.io")(http, {
        cors: {
            origin: "*"
        }
    });

    logger = logIn;

    io.on("connection", (socket) => {
        onCreateGame(io, socket);
        onJoinGame(io, socket);
        onGetGame(io, socket);
    });
}

/**
 * Handle the lobby leader disconnecting.
 * 
 * @param {*} socket 
 * @param {*} io 
 * @param {*} username 
 * @param {*} gameID 
 */
function onDisconnectLobbyLeader(socket, io, username, gameID) {
    socket.on("disconnect", () => {
        logger.writeInfoLog(`User: ${username} Game: ${gameID} disconnected`);

        let game = games[gameID];
        if (game !== undefined) {
            game.removePlayer(username);
            io.to(game.gameID).emit("usersUpdated", game.getPlayers());
            io.to(game.gameID).emit("quizMasterDisconnect");
            delete games[gameID];
        }
    }); 
}

/**
 * Handle a participant disconnecting.
 * 
 * @param {*} socket        the player's socket
 * @param {*} io            the reference to the socket.io object
 * @param {*} username      the username of the user that disconnected
 * @param {*} gameID        the gameID that the user was connected to
 */
function onDisconnectParticipant (socket, io, username, gameID) {
    socket.on("disconnect", () => {
        logger.writeInfoLog(`User: ${username} Game: ${gameID} disconnected`);

        let game = games[gameID];
        if (game) {
            game.removePlayer(username);
            io.to(game.gameID).emit("usersUpdated", game.getPlayers());
            io.to(game.gameID).emit("userDisconnected", username);
        } 
    }); 
}


/**
 * Handles the join game event.
 * @param {*} io            the server's WebSocket
 * @param {*} socket        the player's socket
 */
function onJoinGame(io, socket) {
    socket.on("joinGame", ({username, gameID}) => {
        if (games[gameID]) {

            if (Object.getOwnPropertyNames(games[gameID].players).indexOf(username) !== -1) {
                socket.emit("usernameTaken", username);
                return;
            }

            games[gameID].addPlayer(username, socket);

            socket.join(gameID);

            io.to(gameID).emit("usersUpdated", games[gameID].getPlayers());
            socket.emit("joinedGame", {
                quizName: games[gameID].quiz.quiz_name, 
                gameID,
                gameMaster: games[gameID].gameMaster.player
            });

            onDisconnectParticipant(socket, io, username, gameID);
            onAnswerQuestion(socket, username, gameID);
            onLeaderboard(socket, gameID);

            logger.writeInfoLog(`User: ${username} Joined: ${gameID}`);
        }
    });
}


/**
 * When the marker marks the questions
 * that the user's have provided.
 * 
 * @param {*} socket 
 * @param {*} gameID 
 */
function onMarkQuestions(socket, gameID) {
    socket.on("userAnswers", (answersObj) => {
        logger.writeInfoLog(`Questions marked: ${JSON.stringify(answersObj)}`);

        let game = games[gameID];

        // If the user
        Object.getOwnPropertyNames(answersObj).forEach(username => {
            if (answersObj[username]) {
                game.players[username].score++;
            }
        });

        sendNextQuestion(socket, gameID);
    });
}


/**
 * Sends the list of active games to the player's that requested it.
 * @param {*} io            the server's socket
 * @param {*} socket        the player's socket
 */
function onGetGame(io, socket) {
    socket.on("getGames", () => {
        logger.writeInfoLog("Get Games Request");

        let gameTable = [];

        Object.getOwnPropertyNames(games).forEach(game => {
            if (games[game].started === false) {
                let tableEntry = {game};
                tableEntry["quiz"] = games[game].quiz.quiz_name;
                tableEntry["numPlayers"] = Object.getOwnPropertyNames(games[game].players).length;
                tableEntry["gameMaster"] = games[game].gameMaster.player;

                gameTable.push(tableEntry);
            }
        });

        socket.emit("displayGames", gameTable);
    });
}

function onCreateGame(io, socket) {
    
    socket.on("createLobby", ({username, quiz}) => {
        logger.writeInfoLog(`CREATE LOBBY: ${username} QUIZ NAME: ${quiz.quiz_name}`);

        let game = new Game(quiz);
        games[game.gameID] = game;

        game.addPlayer(username, socket);
        game.setGameMaster(username);

        socket.join(game.gameID);

        socket.emit("gameCreated", game.gameID);

        io.to(game.gameID).emit("usersUpdated", game.getPlayers());

        socket.emit("joinedGame", {
                quizName: quiz.quiz_name, 
                gameID: game.gameID,
                gameMaster: username
        });

        onStartGame(socket, game.gameID);
        onDisconnectLobbyLeader(socket, io, username, game.gameID);
        onMarkQuestions(socket, game.gameID);
        onLeaderboard(socket, game.gameID);
    });
}


/**
 * Starts the game
 * @param {*} io 
 * @param {*} socket 
 * @param {*} gameID 
 */
function onStartGame(socket, gameID) {
    socket.on("startGame", () => {
        logger.writeInfoLog(`Game: ${gameID} started`);

        games[gameID].started = true;
        sendNextQuestion(socket, gameID);
    });
}


/**
 * Send the next question to 
 * the users.
 * 
 * @param {*} socket
 * @param {*} gameID
 */
function sendNextQuestion(socket, gameID){
    let game = games[gameID];

    if (game.currentQuizIndex < game.quiz.questions.length) {
        // Send just the question to everyone apart from the marker
        let question = game.quiz.questions[game.currentQuizIndex++];

        socket.to(gameID).emit("nextQuestion", {question: question.question, youtubeLink: question.youtubeLink, imageLink: question.imageLink});
        // Send botht the question and the answer to the marker.
        socket.emit("nextQuestion", question);
        return;
    }
    io.to(gameID).emit("gameEnded");
}


function onLeaderboard(socket, gameID) {

    socket.on("getLeaderboard", () => {
        logger.writeInfoLog(`Get Leaderboard for ${gameID}`);

        let game = games[gameID];

        let players = Object.values(game.players);

        players.sort((p1, p2) => p2.score - p1.score);
        players = players.filter(player => player.player !== game.gameMaster.player)
                    .map(player => {return {username: player.player, score: player.score}});

        socket.emit("leaderboard", players);
    });
} 

/**
 * Triggered when the user answers
 * a given question.
 * 
 * @param {*} socket 
 * @param {*} gameID 
 */
function onAnswerQuestion(socket, username, gameID) {
    socket.on("submitAnswer", (answer) => {
        logger.writeInfoLog(`User: ${username} Submitted answer: ${answer} For: ${gameID}`);

        let game = games[gameID];

        let gamemasterSocket = game.getGameMasterSocket();
        
        gamemasterSocket.emit("userAnswer", {answer, username});
    });
}

/**
 * Represents an instancer of a game.
 * Provides operations to manage the game.
 */
class Game {
    constructor (quiz) {
        this.gameID = uuidv4();
        this.quiz = quiz;
        this.players = {};
        this.gameMaster = null;
        this.currentQuizIndex = 0;
        this.started = false;
    }

    /**
     * Returns then number
     * of players in the game.
     */
    getPlayers() {
        return Object.getOwnPropertyNames(this.players);
    }

    getGameMasterSocket = () => {
        return this.gameMaster.socket;
    }

    /**
     * Sets the lobby leader of the game.
     * @param {*} username 
     */
    setGameMaster(username) {
        this.gameMaster = this.players[username];
    }

    /**
     * Adds a player to the game.
     * @param {*} username 
     * @param {*} socket 
     */
    addPlayer(username, socket) {
        this.players[username] = new Player(username, socket);
    }


    /**
     * Removes a player from the game.
     * @param {*} usernameToRemove 
     */
    removePlayer(usernameToRemove) {
        if (this.players[usernameToRemove]) {
            delete this.players[usernameToRemove];
        }
    }
}


/**
 * Constructs a new instance of a player.
 * 
 * @param {*} player 
 * @param {*} socket 
 */
function Player(player, socket) {
    this.player = player;
    this.socket = socket;
    this.score = 0;
}

exports.createIO = createIO;