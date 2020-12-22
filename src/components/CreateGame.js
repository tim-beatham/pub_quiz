import React from 'react';

const FETCH_ENDPOINT = "http://localhost:9000/api/quizzes";

function QuizComponent(props) {
    function showLobby() {
        props.setQuiz(props.quiz);
        props.showLobby();
    }

    return (
        <tr className="quiz_entry" onClick={showLobby}><td>{props.quiz.quiz_name}</td></tr>
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
                        quiz={quiz}
                        questions={quiz.questions}
                        showLobby={this.props.showLobby}
                        setQuiz={this.props.setQuiz}
                    />);
                });
                this.setState({quizzes, quizComponents});
            });
    }

    render() {
        return (
            <div className="component">
                <h1 id="banner">Available Quizzes</h1>
                <table className="table_heading">
                    <thead>
                        <tr><th>Name</th></tr>
                    </thead>
                    <tbody>
                        {this.state.quizComponents}
                    </tbody>

                </table>
            </div>
        );
    }
}