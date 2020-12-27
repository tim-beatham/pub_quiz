

const {v4: uuidv4} = require("uuid");

function createIO(http) {
    const io = require("socket.io")(http, {
        cors: {
            origin: "*"
        }
    });

    let games = {};

    io.on("connection", (socket) => {
        console.log("a user connected");

        socket.on("createLobby", ({username, quiz}) => {
            let game = new Game(quiz);
            games[game.gameID] = game;

            game.addPlayer(username, socket);
            game.setGameMaster(username);

            socket.join(game.gameID);

            socket.emit("gameCreated", game.gameID);
            io.to(game.gameID).emit("userJoined", game.getPlayers());
            socket.emit("joinedGame", {
                    quizName: quiz.quiz_name, 
                    gameID: game.gameID,
                    gameMaster: username
                });
        });

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

        socket.on("joinGame", ({username, gameID}) => {

            if (games[gameID]) {
                games[gameID].addPlayer(username, socket);

                socket.join(gameID);

                io.to(gameID).emit("userJoined", games[gameID].getPlayers());
                socket.emit("joinedGame", {
                    quizName: games[gameID].quiz.quiz_name, 
                    gameID,
                    gameMaster: games[gameID].gameMaster.player
                });
            }
        });
    });
}

class Game {
    constructor (quiz) {
        this.gameID = uuidv4();
        this.quiz = quiz;
        this.players = {};
        this.gameMaster = null;
    }

    getPlayers() {
        return Object.getOwnPropertyNames(this.players);
    }

    setGameMaster(username) {
        this.gameMaster = this.players[username];
    }

    addPlayer(username, socket) {
        // TODO: Add the player to the game
        this.players[username] = new Player(username, socket);
    }

    removePlayer(name) {
        // TODO: Remove the player from the game
    }
}

function Player(player, socket) {
    this.player = player;
    this.socket = socket;
}

exports.createIO = createIO;