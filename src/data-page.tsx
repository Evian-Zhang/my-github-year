import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Col, message, Row, Typography} from "antd";
import 'antd/dist/antd.css';

import { DataProcessor } from "./data-processor";

const { Title } = Typography;

const frameHeight = "500px";

interface DataPageProps {
    username: string,
    token: string,
    goBack: () => void,
}

interface DataPageState {
    fetchingTip: string,
    isProcessing: boolean,
    width: number,
    height: number
}

class DataPage extends Component<DataPageProps, DataPageState> {
    dataProcessor: DataProcessor;

    constructor(props: DataPageProps) {
        super(props);

        this.dataProcessor = new DataProcessor(this.props.username, this.props.token);
        this.state = {
            fetchingTip: "正在获取数据...",
            isProcessing: true,
            width: 0,
            height: 0
        };
    }

    updateWindowDimensions() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    componentDidMount(): void {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
        this.dataProcessor.fetchEvents()
            .then(() => {
                this.setState({
                    fetchingTip: "正在处理数据..."
                })
            })
            .then(() => {
                this.dataProcessor.processData();
                this.setState({
                    isProcessing: false
                });
                console.log(this.dataProcessor);
                this.renderDataPage();
            })
            .catch((error: string) => {
                message.error(error);
                this.props.goBack();
            })
    }

    componentWillUnmount(): void {
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    renderDataPage() {
        console.log(this.dataProcessor.rawData);
        const noContributionFrame = () => {
            return (
                <div style={{ display: "flex",
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: frameHeight }}>
                    <Title style={{ textAlign: 'center' }}>
                        你似乎在2019年并没有使用 GitHub
                    </Title>
                </div>
            );
        };

        const dataPage = () => {
            return (
            <div>
                {this.dataProcessor.contributions.hasAnyContributions &&
                <Row type='flex' align='middle'>
                    <Col span={24}>
                        {noContributionFrame()}
                    </Col>
                </Row>}
            </div>
            );
        };
        ReactDOM.render(dataPage(), document.getElementById('dataPage'));
    }

    render() {

        return (
            <div id='dataPage'>
                {this.state.isProcessing &&
                <Row type='flex' align='middle'>
                    <Col span={24}>
                        <div style={{ display: "flex",
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      height: frameHeight }}>
                            <Title style={{ textAlign: 'center' }}>
                                {this.state.fetchingTip}
                            </Title>
                        </div>
                    </Col>
                </Row>}

            </div>
        );
    }
}

export default DataPage;