import React, {ChangeEvent, Component} from 'react'
import {Button, Col, Input, message, Row} from "antd";
import 'antd/dist/antd.css';

interface LoginPageProps {
    usernameHandler: (_: string) => void
}

interface LoginPageState {
    isQuerying: boolean,
    buttonContent: string
}

class LoginPage extends Component<LoginPageProps, LoginPageState> {
    username: string;

    constructor(props: LoginPageProps) {
        super(props);

        this.username = "";
        this.state = {
            isQuerying: false,
            buttonContent: "查询"
        };
    }

    onUsernameInputChange(event: ChangeEvent<HTMLInputElement>) {
        this.username = event.target.value;
    }

    onSubmit() {
        if (this.username.length > 0) {
            this.setState({
                isQuerying: true,
                buttonContent: "正在查找用户"
            });
            fetch("https://api.github.com/users/" + this.username)
                .then(res => res.json())
                .then(userInfo => this.props.usernameHandler(userInfo.login))
                .catch(_ => {
                    this.setState({
                        isQuerying: false,
                        buttonContent: "查询"
                    });
                    message.error("用户" + this.username + "不存在");
                })
        } else {
            message.error("登录名不得为空");
        }
    }

    render() {
        return (
            <div style={{position: "absolute",
                         top: "50%",
                         left: "50%",
                         transform: "translate(-50%, -50%)",
                         msTransform: "translate(-50%, -50%)"}}>
                <Row>
                    <Col span={24}>
                        <div style={{height: "100px"}}>
                            <Input onChange={this.onUsernameInputChange.bind(this)}
                                placeholder='请输入 GitHub 登录名'/>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Button type='primary'
                                size='large'
                                onClick={this.onSubmit.bind(this)}
                                disabled={this.state.isQuerying}>
                            {this.state.buttonContent}
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default LoginPage;