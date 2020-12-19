import React from "react";

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
        this.setState({question: event.target.value});
        this.props.modifyQuestion(this.state.question, this.state.answer);
    }

    modifyAnswer = (event) => {
        this.setState({answer: event.target.value});
        this.props.modifyQuestion(this.state.question, this.state.answer);
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

    addQuestionComponent = () => {
        let numQuestion = this.state.questionComponents.length;

        this.setState({questions: [...this.state.questions, {question: "", answer: ""}]});
        this.setState(
            {questionComponents: [...this.state.questionComponents,
                    <QuestionAnswer
                        key={numQuestion}
                        modifyQuestion={(question, answer) => this.modifyQuestion(numQuestion, question, answer)}
                        question={() => this.getQuestion(numQuestion)}
                    />]
            });
    }

    getQuestion = (index) => {
        return this.state.questions[index];
    }

    render() {
        return (
            <div>
                {this.state.showEdit && <EditQuiz
                    questionComponents={this.state.questionComponents}
                    addQuestionComponent={this.addQuestionComponent}
                    title={this.state.title}
                    setTitle={this.setTitle}
                    showPreview={this.toggleState}
                /> }

                {!this.state.showEdit && <Preview
                    showEdit={this.toggleState}
                    title={this.state.title}
                    questions={this.state.questions}
                    showMainMenu={this.props.showMainMenu}
                /> }
            </div>
        );
    }
}

class EditQuiz extends React.Component {
    render() {
        return (
            <div className="component">
                <h1 id="banner">Create Quiz</h1>
                <TitleComponent title={this.props.title} setTitle={this.props.setTitle}/>
                <div id="questions">
                    {this.props.questionComponents}
                </div>
                <EditWidget
                    addQuestion={this.props.addQuestionComponent}
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
            index: 0
        }
    }

    getQuestion = () => {
        console.log(this.props.questions[this.state.index]);
        return this.props.questions[this.state.index].question;
    }
    getAnswer = () => this.props.questions[this.state.index].answer;
    hasNext = () => this.state.index < this.props.questions.length - 1;

    nextQuestion = () => {
        this.setState({index: this.state.index + 1});
    }

    submit = () => {
        // TODO: Submit the quiz to an external server
    }

    render() {
        return (
            <div className="component">
                <h1 id="banner">{this.props.title}</h1>
                <PreviewQuestionWidget
                    question={this.getQuestion()}
                    answer={this.getAnswer()}
                    hasNext={this.hasNext}
                    nextQuestion={this.nextQuestion}
                    showMainMenu={this.props.showMainMenu}
                />
                <input type="button" value="Edit" onClick={this.props.showEdit}/>
            </div>
        );
    }
}