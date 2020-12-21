const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const {postQuiz, fetchQuizzes} = require("./db_queries");

const cors = require("cors");

app.use(bodyParser.json());

const responseExpected = {
    "quiz_name": "An example of a quiz",
    "questions": []
}

const expectedQuestion = {
    "question": "some question",
    "answer": "some answer"
}

app.use(cors());

app.post("/api/quiz", function (req, res) {
    const postRequest = req.body;

    // Check the attributes of the request.
    if (checkObjects(responseExpected, postRequest)) {
        const questions = postRequest.questions;

        for (let question of questions) {
            if (!checkObjects(expectedQuestion, question)) {
                res.status(400).send("invalid post request");
                return;
            }
        }

        postQuiz(postRequest);
        res.status(200).send("successfully added");
        return;
    }
    res.status(400).send("invalid post request");
});


app.get("/api/quizzes", function (req, res) {
    fetchQuizzes()
        .then(result => {
            res.status(200).json(result);
        }).catch(err => {
            res.status(500).send(JSON.stringify(err));
        });
});


console.log("Server Started");
app.listen(9000);

function checkObjects(obj1, obj2) {
    const attributeNames1 = Object.getOwnPropertyNames(obj1);
    const attributeNames2 = Object.getOwnPropertyNames(obj2);

    if (attributeNames1.length !== attributeNames2.length)
        return false;

    for (let i = 0; i < attributeNames1.length; i++) {
        let attributeName1 = attributeNames1[i];
        let attributeName2 = attributeNames2[i];

        if (attributeName1 !== attributeName2 || typeof obj1[attributeName1] !== typeof obj2[attributeName2]) {
            return false;
        }
    }

    return true;
}




