import React from 'react';

const FETCH_ENDPOINT = "http://localhost:9000/api/quizzes";

function QuizComponent(props) {
    let questions = props.questions.map(question => {
        return <div><p>{question.question}</p><p>{question.answer}</p></div>;
    });

    return (
        <div className="quiz_component">
            <h2>{props.name}</h2>
            <div>
                {questions}
            </div>
        </div>
    )
}

export default class CreateGame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            quizzes: {},
            quizComponents: []
        }
    }

    componentDidMount() {
        // Make a fetch request to the remote server.
        fetch(FETCH_ENDPOINT, {
            mode: "cors"
        })
            .then(res => res.json())
            .then(quizzes => {
                this.setState({quizzes});

                let quizComponents = [];

                quizzes.forEach(quiz => {
                    quizComponents.push(<QuizComponent
                        name={quiz.quiz_name}
                        questions={quiz.questions}
                    />);
                });

                this.setState({quizzes, quizComponents});
            });
    }

    render() {
        return (
            <div className="component">
                <h1 id="banner">Available Quizzes</h1>
                <div className="width_100">
                    {this.state.quizComponents}
                </div>
            </div>
        );
    }
}