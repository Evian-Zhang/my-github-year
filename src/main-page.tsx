import React, { Component } from 'react'

import LoginPage from "./login-page";
import DataPage from "./data-page";

interface MainPageProps {

}

interface MainPageState {
    isUsernameValid: boolean
}

class MainPage extends Component<MainPageProps, MainPageState> {
    username: string;
    token: string;
    constructor(props: MainPageProps) {
        super(props);

        this.username = "";
        this.token = "";
        this.state = {
            isUsernameValid: false
        };
    }

    usernameTokenHandler(name: string, token: string) {
        this.username = name;
        this.token = token;
        this.setState({
            isUsernameValid: true
        });
    }

    goBack() {
        this.username = "";
        this.token = "";
        this.setState({
            isUsernameValid: false,
        });
    }

    render() {
        return(
            <div>
                {!this.state.isUsernameValid &&
                <LoginPage inputHandler={this.usernameTokenHandler.bind(this)}/>}
                {this.state.isUsernameValid &&
                <DataPage username={this.username}
                          token={this.token}
                          goBack={this.goBack.bind(this)}/>}
            </div>
        );
    }
}

export default MainPage;