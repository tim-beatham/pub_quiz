import React from "react";

import "../styling/create_quiz.css";

const {httpEndPoint} = require("../config.json");

const API_URL = `${httpEndPoint}/api/quiz`;

/**
 * The component that allows you to change the title
 * within the quiz.
 * 
 * @param {*} props 
 */
function TitleComponent(props) {
    return (
        <div>
            <p className="formLabel">Title:</p>
            <input type="text" value={props.title} onChange={(event) => props.setTitle(event.target.value.trim())}/>
        </div>
    );
}   

class QuestionAnswer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            question: this.props.question().question,
            answer: this.props.question().answer
        }
    }

    modifyQuestion = (event) => {
        this.props.modifyQuestion(event.target.value.trim(), this.state.answer);
        this.setState({question: event.target.value.trim()});
    }

    modifyAnswer = (event) => {
        this.props.modifyQuestion(this.state.question, event.target.value.trim());
        this.setState({answer: event.target.value.trim()});
    }

    render() {
        return (
            <div className="question_answer">
                <p className="form_label">Question: </p>
                <input type="text" value={this.state.question} onChange={this.modifyQuestion}/>
                <p className="form_label">Answer: </p>
                <input type="text" value={this.state.answer} onChange={this.modifyAnswer}/>
            </div>
        )
    }
}

function EditWidget(props) {
    return (
        <div id="add_widget">
            <input type="button" onClick={props.addQuestion} value="Add Question"/>
            <input type="button" onClick={props.showPreview} value="Show Preview"/>
        </div>
    );
}


/**
 * Component that allows you to create a quiz
 * and preview the given quiz.
 */
export default class CreateQuiz extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            // If true it allows us to edit the quiz.
            // If flase then we preview the quiz.
            showEdit: true,
            // The title of the quiz.
            title: "",
            // The questions that the user has created.
            questions: []
        }
    }

    /**
     * Inverts the edit state
     * parameter.
     */
    toggleState = () => {
        this.setState({showEdit: !this.state.showEdit});
    }

    /**
     * Sets the title of the given quiz.
     * 
     * @param {string} title    the title of the quiz. 
     */
    setTitle = (title) => {
        this.setState({title});
    }

    /**
     * Modifies the given quiz question.
     * 
     * @param {*} index         the index of the question in the list 
     * @param {*} question      the question to ask
     * @param {*} answer        the answer of the question
     */
    modifyQuestion = (index, question, answer) => {
        this.setState({questions: [...this.state.questions.slice(0, index), 
            {question, answer}, ...this.state.questions.slice(index + 1)]});
    }

    /**
     * Adds a question to the component.
     */
    addQuestionAnswer = () => {
        this.setState({questions: [...this.state.questions, {question: "", answer: ""}]});
    }

    getQuestions = () => this.state.questions;
    getTitle = () => this.state.title;

    render() {
        return (
            <div>
                {this.state.showEdit && <EditQuiz
                    questionComponents={this.state.questionComponents}
                    title={this.state.title}
                    setTitle={this.setTitle}
                    getQuestions={this.getQuestions}
                    showPreview={this.toggleState}
                    modifyQuestion={this.modifyQuestion}
                    addQuestionAnswer={this.addQuestionAnswer}
                /> }

                {!this.state.showEdit && <Preview
                    showEdit={this.toggleState}
                    getTitle={this.getTitle}
                    getQuestions={this.getQuestions}
                    showMainMenu={this.props.showMainMenu}
                /> }
            </div>
        );
    }
}


/**
 * Allows the user to edit the quiz component.
 */
class EditQuiz extends React.Component {

    constructor(props) {
        super(props);

        /**
         * Maps the quiz questions to question
         * components.
         */
        let questionComponents = this.props.getQuestions().map((question, numQuestion) => {
            return <QuestionAnswer
                key={numQuestion}
                modifyQuestion={(question, answer) => this.props.modifyQuestion(numQuestion, question, answer)}
                question={() => this.props.getQuestions()[numQuestion]}
                />
        });

        this.state = {
            // Adds the question components to the given state.
            questionComponents: questionComponents,
            titleValid: true,
            questionsValid: true
        }
    }

    /**
     * Adds a question component to the 
     * state.
     */
    addQuestionComponent = () => {
        let numQuestion = this.state.questionComponents.length;

        this.props.addQuestionAnswer();

        this.setState(
            {questionComponents: [...this.state.questionComponents,
                    <QuestionAnswer
                        key={numQuestion}
                        modifyQuestion={(question, answer) => this.props.modifyQuestion(numQuestion, question, answer)}
                        question={() => this.props.getQuestions()[numQuestion]}
                    />]
            });
    }

    titleValid = () => {
        return this.props.title !== "";
    }

    questionsValid = () => {
        let questions = this.props.getQuestions();

        questions.forEach (question => {
            console.log(question);
            if (question.question === "" || question.answer === "") {
                return false;
            }
        });


        if (questions.length === 0)
            return false;

        return true;
    }

    showPreview = () => {
        if (!this.questionsValid()) {
            this.setState({questionsValid: false});
        }  

        if (!this.titleValid()) {
            this.setState({titleValid: false});
        }

        if (this.titleValid() && this.questionsValid()) {
            this.setState({questionsValid: true});
            this.setState({titleValid: true});
            this.props.showPreview();
        }
    }


    render() {
        return (
            <div id="edit_quiz" className="col-100">
                <h1 id="banner">Create Quiz</h1>
                <TitleComponent title={this.props.title} setTitle={this.props.setTitle}/>

                {!this.state.titleValid && <h2>Please Enter A Value For The Title!</h2>}

                <div id="questions">
                    {this.state.questionComponents}
                </div>
                <EditWidget
                    addQuestion={this.addQuestionComponent}
                    showPreview={this.showPreview}
                />

                {!this.state.questionsValid && <h2>Please add a question or fill in your questions!</h2>}
            </div>
        );
    }
}

function PreviewQuestionWidget(props) {
    return (
        <div id="preview_question">
            <h1>{props.question}</h1>
            <p id="preview_answer">{props.answer}</p>
        </div>
    );
}


/**
 * Shows the preview state.
 * 
 * Allows the user to review the questions they have created 
 * before uploading them to the server.
 */
class Preview extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0,
            title: this.props.getTitle(),
            questions: this.props.getQuestions()
        }
    }

    getQuestion = () => {
        return this.state.questions[this.state.index].question;
    }
    getAnswer = () => this.state.questions[this.state.index].answer;
    hasNext = () => this.state.index < this.state.questions.length - 1;

    nextQuestion = () => {
        this.setState({index: this.state.index + 1});
    }

    submit = () => {
        const toPost = {"quiz_name": this.state.title, "questions": this.state.questions};
        window.fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(toPost)
        }).then(_ => this.props.showMainMenu()); // TODO: Create an error screen
    }

    render() {
        return (
            <div id="preview_quiz" className="col-100">
                <h1 id="banner">{this.state.title}</h1>
                
                <PreviewQuestionWidget
                    question={this.getQuestion()}
                    answer={this.getAnswer()}
                    hasNext={this.hasNext}
                    nextQuestion={this.nextQuestion}
                    showMainMenu={this.submit}
                />

                <div id="preview_widget">
                    <input type="button" value="Edit" onClick={this.props.showEdit}/>
                    {this.hasNext() && <input type="button" value="Next" onClick={this.nextQuestion}/>}
                    {!this.hasNext() && <input type="button" value="Submit" onClick={this.submit}/>}
                </div>
                
                
            </div>
        );
    }
}