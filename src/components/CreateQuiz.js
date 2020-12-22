import React from "react";

const API_URL = "http://localhost:9000/api/quiz";

function TitleComponent(props) {
    return (
        <div>
            <p className="formLabel">Title:</p>
            <input type="text" value={props.title} onChange={(event) => props.setTitle(event.target.value)}/>
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
        this.props.modifyQuestion(event.target.value, this.state.answer);
        this.setState({question: event.target.value});
    }

    modifyAnswer = (event) => {
        this.props.modifyQuestion(event.target.value, this.state.answer);
        this.setState({answer: event.target.value});
    }

    render() {
        return (
            <div>
                <p className="formLabel">Question: </p>
                <input type="text" value={this.state.question} onChange={this.modifyQuestion}/>
                <p className="formLabel">Answer: </p>
                <input type="text" value={this.state.answer} onChange={this.modifyAnswer}/>
            </div>
        )
    }
}

function EditWidget(props) {
    return (
        <div>
            <input type="button" onClick={props.addQuestion} value="Add Question"/>
            <input type="button" onClick={props.showPreview} value="Show Preview"/>
        </div>
    );
}

export default class CreateQuiz extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showEdit: true,
            title: "",
            questionComponents: [],
            questions: []
        }
    }

    toggleState = () => {
        this.setState({showEdit: !this.state.showEdit});
    }

    setTitle = (title) => {
        this.setState({title});
    }

    modifyQuestion = (index, question, answer) => {
        this.setState({questions: [...this.state.questions.slice(0, index), {question, answer}, ...this.state.questions.slice(index + 1)]});
    }

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

class EditQuiz extends React.Component {

    constructor(props) {
        super(props);

        let questionComponents = this.props.getQuestions().map((question, numQuestion) => {
            return <QuestionAnswer
                key={numQuestion}
                modifyQuestion={(question, answer) => this.props.modifyQuestion(numQuestion, question, answer)}
                question={() => this.props.getQuestions()[numQuestion]}
                />
        });

        this.state = {
            questionComponents: questionComponents
        }
    }

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


    render() {
        return (
            <div className="component">
                <h1 id="banner">Create Quiz</h1>
                <TitleComponent title={this.props.title} setTitle={this.props.setTitle}/>
                <div id="questions">
                    {this.state.questionComponents}
                </div>
                <EditWidget
                    addQuestion={this.addQuestionComponent}
                    showPreview={this.props.showPreview}
                />
            </div>
        );
    }
}

function PreviewQuestionWidget(props) {
    return (
        <div>
            <h1 id="preview_question">{props.question}</h1>
            <p id="preview_answer">{props.answer}</p>
            {props.hasNext() && <input type="button" value="Next" onClick={props.nextQuestion}/>}
            {!props.hasNext() && <input type="button" value="Submit" onClick={props.showMainMenu}/>}
        </div>
    );
}

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
            <div className="component">
                <h1 id="banner">{this.state.title}</h1>
                <PreviewQuestionWidget
                    question={this.getQuestion()}
                    answer={this.getAnswer()}
                    hasNext={this.hasNext}
                    nextQuestion={this.nextQuestion}
                    showMainMenu={this.submit}
                />
                <input type="button" value="Edit" onClick={this.props.showEdit}/>
            </div>
        );
    }
}