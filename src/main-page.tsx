import React, { Component } from 'react'

import LoginPage from "./login-page";

interface MainPageProps {

}

interface MainPageState {
    username: string
    isUsernameValidate: boolean
}

class MainPage extends Component<MainPageProps, MainPageState> {
    constructor(props: MainPageProps) {
        super(props);

        this.state = {
            username: "",
            isUsernameValidate: false
        };
    }

    usernameHandler(name: string) {
        this.setState({
            username: name,
            isUsernameValidate: true
        });
    }

    render() {
        return(
            <div>
                {!this.state.isUsernameValidate && <LoginPage usernameHandler={this.usernameHandler.bind(this)}/>}
                {this.state.isUsernameValidate && this.state.username}
            </div>
        );
    }
}

export default MainPage;