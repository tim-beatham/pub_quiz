const mongo = require("mongodb");

const MongoClient = mongo.MongoClient;
const url = "mongodb://localhost:27017/";


function postQuiz(quiz) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        const dbObj = db.db("PubQuiz");

        dbObj.collection("quizzes").insertOne(quiz, function (err, res) {
            if (err) throw err;
            console.log(`${quiz} inserted`);
            db.close();
        })
    });
}

async function fetchQuizzes() {
    let client, db;

    client = await MongoClient.connect(url);
    db = client.db("PubQuiz");

    let result = await db.collection("quizzes").find({});
    result = await result.toArray();

    client.close();

    return result;
}

async function fetchQuiz(id) {
    let client, db;

    client = await MongoClient.connect(url);
    db = client.db("PubQuiz");

    let result = await db.collection("quizzes").findOne({"_id": new mongo.ObjectID(id)});

    client.close();

    return result;
}

exports.postQuiz = postQuiz;
exports.fetchQuizzes = fetchQuizzes;
exports.fetchQuiz = fetchQuiz;