import React from 'react';

const FETCH_ENDPOINT = "http://localhost:9000/api/quizzes";

function QuizComponent(props) {
    return (
        <tr className="quiz_entry"><td>{props.name}</td></tr>
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
                <table className="table_heading">
                    <tr><th>Name</th></tr>
                    {this.state.quizComponents}
                </table>
            </div>
        );
    }
}