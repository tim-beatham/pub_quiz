import React from "react"


export default class ErrorComponent extends React.Component {
    render () {
        return (
            <div className="error_component">
                {this.props.errorMsg}
            </div>
        )
    }
}
