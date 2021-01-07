import React from "react"

import "../styling/error.css";

export default class ErrorComponent extends React.Component {
    render () {
        return (
            <div id="error_component" className="col-100">
                <h2>{this.props.errorMsg}</h2>
            </div>
        )
    }
}
