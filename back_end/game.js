const {v4: uuidv4} = require("uuid");

// Maps a game ID to a game object. 
let games = {};

// The servers socket.
let io = null;

/**
 * Create an instance of the server's
 * WebSocket.
 * @param {*} http      the instance of the http socket. 
 */
function createIO(http) {

    io = require("socket.io")(http, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {
        console.log("a user connected");

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
        let game = games[gameID];
        game.removePlayer(username);
        io.to(game.gameID).emit("usersUpdated", game.getPlayers ());
        io.to(game.gameID).emit("quizMasterDisconnect");
        delete games[gameID];
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
        let game = games[gameID];
        game.removePlayer(username);
        io.to(game.gameID).emit("usersUpdated", game.getPlayers());
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
            games[gameID].addPlayer(username, socket);

            socket.join(gameID);

            io.to(gameID).emit("usersUpdated", games[gameID].getPlayers());
            socket.emit("joinedGame", {
                quizName: games[gameID].quiz.quiz_name, 
                gameID,
                gameMaster: games[gameID].gameMaster.player
            });

            onDisconnectParticipant(socket, io, username, gameID);
        }
    });
}


/**
 * Sends the list of active games to the player's that requested it.
 * @param {*} io            the server's socket
 * @param {*} socket        the player's socket
 */
function onGetGame(io, socket) {
    socket.on("getGames", () => {

        let gameTable = [];

        Object.getOwnPropertyNames(games).forEach(game => {
            let tableEntry = {game};
            tableEntry["quiz"] = games[game].quiz.quiz_name;
            tableEntry["numPlayers"] = Object.getOwnPropertyNames(games[game].players).length;
            tableEntry["gameMaster"] = games[game].gameMaster.player;

            console.log(tableEntry);

            gameTable.push(tableEntry);
        });

        socket.emit("displayGames", gameTable);
    });
}

function onCreateGame(io, socket) {
    
    socket.on("createLobby", ({username, quiz}) => {
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

        onDisconnectLobbyLeader(socket, io, username, game.gameID);
    });
}


/**
 * Starts the game
 * @param {*} io 
 * @param {*} socket 
 * @param {*} gameID 
 */
function onStartGame(io, socket, gameID) {
    socket.on("startGame", (gameID) => {
        io.to(gameID).emit("gameStarted");
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
    socket.to(gameID).emit("nextQuestion", game.questions[game.currentQuizIndex]);
}


/**
 * Triggered when the user answers
 * a given question.
 * 
 * @param {*} socket 
 * @param {*} gameID 
 */
function answerQuestion(socket, gameID) {
    socket.on("questionAnswered", ({answer, username, gameID}) => {
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
    }

    /**
     * Returns then number
     * of players in the game.
     */
    getPlayers() {
        return Object.getOwnPropertyNames(this.players);
    }

    getGameMasterSocket = () => {
        return this.players[this.gameMaster].socket;
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
}

exports.createIO = createIO;