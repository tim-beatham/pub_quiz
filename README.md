# Pub Quiz Implementation Using React

The project shows my implementation of a pub quiz using React.JS, Express, MongoDB and Socket.IO.
The beauty of the quiz is that any question can be asked. It relies on one user to dedicate themselves
as a marker to mark the questions the other users have answered.

An alternative approach would be to use multiple choice questions but this does not properly simulate
a pub quiz as it gives the answer away.

There is a lot of work that needs to be done for it to be used in the real world. One would ideally want to
make it look more aestheitcally pleasing, provide a way to make a user account and add more features to the quiz
such as uploading images.

## The Main Menu

![The Main Menu](./screenshots/main_menu.png)

When making a request to the site a user is presented with a main menu. From here they can create their
own quiz, create a game or join a game.

Before creating or joining a game they are required to enter an appropriate username.

## Creating A Quiz

![Creating A Quiz](./screenshots/create_quiz.png)

When creating a quiz the user is asked to enter a series of questions and answers. They have to
provide at least one question and answer and they have to provide a title of the quiz.

From here they can then preview the quiz and consequently make a POST request to back end API. The
back end then stores the quiz in a MongoDB database.

## Creating A Game

![Creating A Game](./screenshots/create_game.png)

When creating a game the user has to select a quiz that they want to use for the game. They are presented
with all the quizzes that users have made.

## Joining A Game

![Joining A Game](./screenshots/join_game.png)

When a user joins the game they simply have to click on the game that they want to join and it takes them to
the lobby.

## The Game Lobby

![The Game Lobby](./screenshots/game_lobby.png)

The game lobby shows all of the players that are connected and it shows the quiz master in green. Only
the quiz master can press the start game button.

## Answering A Question

![Answering A Question](./screenshots/answer_question.png)

A user answers a questions by simply entering the question in the input box and pressing enter, there
is nothing fancy going on here.

## Marking A Question

![Marking A Question](./screenshots/marker.png)

The marker marks the question by selecting on a user question box. When it is green
the marker marks it as correct. When it is red the marker marks it as incorrect.

## The Leaderboard

![The Leaderboard](./screenshots/leaderboard.png)

At the end of the quiz everyone is presented with a leaderboard table which shows who won the quiz.
