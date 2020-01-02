import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Button, Col, message, Row, Typography} from "antd";
import 'antd/dist/antd.css';
import { ResponsivePie, PieDatum } from '@nivo/pie';
import { ResponsiveBar, BarDatum } from '@nivo/bar';
// @ts-ignore
import domtoimage from 'dom-to-image';
// @ts-ignore
import { saveAs } from 'file-saver';

import { DataProcessor } from "./data-processor";

const { Title, Paragraph } = Typography;

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

    componentDidMount(): void {
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
                this.renderDataPage();
            })
            .catch((error: string) => {
                message.error(error);
                this.props.goBack();
            })
    }

    contributionFrame() {
        const data = [
            {
                id: "使用",
                value: this.dataProcessor.contributions.contributionDays
            },
            {
                id: "未使用",
                value: 365 - this.dataProcessor.contributions.contributionDays
            }
        ];

        const pieChart = (data: PieDatum[]) => {
            return (
                <ResponsivePie data={data}
                               isInteractive={false}
                               enableRadialLabels={false}/>
            );
        };

        return (
            <Row key='contributionFrame'>
                <Col span={24}>
                    <div style={{ display: "flex",
                         justifyContent: 'center',
                         alignItems: 'center',
                         height: frameHeight }}>
                        <Title>
                            在2019年的365天里，你一共有{this.dataProcessor.contributions.contributionDays}天在使用 GitHub
                        </Title>
                        {pieChart(data)}
                    </div>
                </Col>
            </Row>
        );
    }

    diligenceFrame() {
        let hardMonths = this.dataProcessor.contributions.contributionMonths.filter((month) => month > 20);

        let diligentMessage = "";
        if (hardMonths.length === 12) {
            diligentMessage = "你每个月都很努力呢";
        } else if (hardMonths.length >= 10) {
            diligentMessage = "你几乎每个月都很努力呢";
        } else {
            let maxMonths: number[] = [];
            let max = 0;
            for (let month = 0; month < this.dataProcessor.contributions.contributionMonths.length; month++) {
                if (this.dataProcessor.contributions.contributionMonths[month] > max) {
                    max = this.dataProcessor.contributions.contributionMonths[month];
                    maxMonths = [month];
                } else if (this.dataProcessor.contributions.contributionMonths[month] === max) {
                    maxMonths.push(month);
                }
            }
            let hardMonthDescription = maxMonths.map((month) => (month + 1).toString() + '月').join('、');
            diligentMessage = "你在" + hardMonthDescription + "很努力呢";
        }

        let data: BarDatum[] = this.dataProcessor.contributions.contributionMonths
            .map((month, index) => {
                return {
                    month: (index + 1).toString() + "月",
                    contributions: month
                }
            });

        const barChart = (data: BarDatum[]) => {
            return (
                <ResponsiveBar data={data}
                               indexBy='month'
                               keys={['contributions']}
                               key='diligenceBarChart'
                               margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                               legends={[
                                   {
                                       dataFrom: 'keys',
                                       anchor: 'bottom-right',
                                       direction: 'column',
                                       justify: false,
                                       translateX: 120,
                                       translateY: 0,
                                       itemsSpacing: 2,
                                       itemWidth: 100,
                                       itemHeight: 20,
                                       itemDirection: 'left-to-right',
                                       itemOpacity: 0.85,
                                       symbolSize: 20,
                                       effects: [
                                           {
                                               on: 'hover',
                                               style: {
                                                   itemOpacity: 1
                                               }
                                           }
                                       ]
                                   }]}/>
            );
        };

        return (
            <Row key='diligenceFrame'>
                <Col span={24}>
                    <div style={{ display: "flex",
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  height: frameHeight }}>
                            {[
                                barChart(data),
                                <Title key='diligenceMessage'>{diligentMessage}</Title>
                            ]}
                    </div>
                </Col>
            </Row>
        );
    }

    commitFrame() {
        let hasCommits = this.dataProcessor.commits.totalCommitContributions !== 0;
        let commitMessage1 = "你共向" + this.dataProcessor.commits.totalRepositoriesWithContributedCommits.toString() + '个仓库提交了' + this.dataProcessor.commits.totalCommitContributions + "次 commits";
        let commitMessage2 = "这些是你在这些 commits 中使用的主要语言";

        let sortedLanguages = Array.from(this.dataProcessor.commits.languages)
            .sort((language1, language2) => {
                return language1[1] - language2[1];
            });

        let data: PieDatum[] = sortedLanguages.map((language) => {
            return {
                id: language[0],
                value: language[1],
            }
        });

        const pieChart = (data: PieDatum[]) => {
            return (
                <ResponsivePie data={data}
                               enableSlicesLabels={false}
                               isInteractive={false}
                               margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                               key='commitPieChart'/>
            );
        };

        if (hasCommits) {
            return (
                <Row key='commitFrame'>
                    <Col span={24}>
                        <div style={{
                            display: "flex",
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: frameHeight
                        }}>
                            {[
                                <Title key='commitMessage'>{commitMessage1}<br/>{commitMessage2}</Title>,
                                pieChart(data)
                            ]}
                        </div>
                    </Col>
                </Row>
            );
        } else {
            return (
                <div key='commitFrame' />
            );
        }
    }

    repositoryFrame() {
        let hasRepository = this.dataProcessor.repositories.totalRepositoryContributions !== 0;
        let repositoryMessage1 = "你共创建了" + this.dataProcessor.repositories.totalRepositoryContributions.toString() + "个仓库";
        let repositoryMessage2 = "获得了" + this.dataProcessor.repositories.stars.toString() + "颗 star";
        let repositoryMessage3 = "这些是你在这些仓库中使用的主要语言";

        let sortedLanguages = Array.from(this.dataProcessor.repositories.languages)
            .sort((language1, language2) => {
                return language1[1] - language2[1];
            });

        let data: PieDatum[] = sortedLanguages.map((language) => {
            return {
                id: language[0],
                value: language[1],
            }
        });

        const pieChart = (data: PieDatum[]) => {
            return (
                <ResponsivePie data={data}
                               enableSlicesLabels={false}
                               isInteractive={false}
                               margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                               key='repositoryPieChart'/>
            );
        };

        if (hasRepository) {
            return (
                <Row key='repositoryFrame'>
                    <Col span={24}>
                        <div style={{
                            display: "flex",
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: frameHeight
                        }}>
                            {[
                                pieChart(data),
                                <Title key='repositoryMessage'>
                                    {repositoryMessage1}<br/>{repositoryMessage2}<br/>{repositoryMessage3}
                                </Title>
                            ]}
                        </div>
                    </Col>
                </Row>
            );
        } else {
            return (
                <div key='repositoryFrame' />
            );
        }
    }

    starFrame() {
        let hasStar = this.dataProcessor.stars.stars !== 0;
        let starMessage1 = "你共 star 了" + this.dataProcessor.stars.stars.toString() + "个仓库";
        let starMessage2 = "这些是那些仓库使用的主要语言";

        let sortedLanguages = Array.from(this.dataProcessor.stars.languages)
            .sort((language1, language2) => {
                return language1[1] - language2[1];
            });

        let data: PieDatum[] = sortedLanguages.map((language) => {
            return {
                id: language[0],
                value: language[1],
            }
        });

        const pieChart = (data: PieDatum[]) => {
            return (
                <ResponsivePie data={data}
                               enableSlicesLabels={false}
                               isInteractive={false}
                               margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                               key='starPieChart'/>
            );
        };

        if (hasStar) {
            return (
                <Row key='starFrame'>
                    <Col span={24}>
                        <div style={{
                            display: "flex",
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: frameHeight
                        }}>
                            {[
                                <Title key='starMessage'>{starMessage1}<br/>{starMessage2}</Title>,
                                pieChart(data)
                            ]}
                        </div>
                    </Col>
                </Row>
            );
        } else {
            return (
                <div key='starFrame' />
            );
        }
    }

    watchFrame() {
        let hasWatch = this.dataProcessor.stars.stars !== 0;
        let WatchMessage1 = "你共 watch 了" + this.dataProcessor.watches.watches.toString() + "个仓库";
        let WatchMessage2 = "这些是那些仓库使用的主要语言";

        let sortedLanguages = Array.from(this.dataProcessor.watches.languages)
            .sort((language1, language2) => {
                return language1[1] - language2[1];
            });

        let data: PieDatum[] = sortedLanguages.map((language) => {
            return {
                id: language[0],
                value: language[1],
            }
        });

        const pieChart = (data: PieDatum[]) => {
            return (
                <ResponsivePie data={data}
                               enableSlicesLabels={false}
                               isInteractive={false}
                               margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                               key='watchPieChart'/>
            );
        };

        if (hasWatch) {
            return (
                <Row key='watchFrame'>
                    <Col span={24}>
                        <div style={{
                            display: "flex",
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: frameHeight
                        }}>
                            {[
                                pieChart(data),
                                <Title key='watchMessage'>{WatchMessage1}<br/>{WatchMessage2}</Title>
                            ]}
                        </div>
                    </Col>
                </Row>
            );
        } else {
            return (
                <div key='watchFrame' />
            );
        }
    }

    issueFrame() {
        let hasIssue = this.dataProcessor.issues.totalIssueContributions !== 0;
        let issueMessage1 = "你共向"+ this.dataProcessor.issues.totalRepositoryWithContributedIssues +"个仓库提出了" + this.dataProcessor.issues.totalIssueContributions + "条 issue";
        let issueMessage2 = "这是你最受关注的一条 issue";

        if (hasIssue) {
            return (
                <Row key='issueFrame'>
                    <Col span={16}>
                        <div style={{ display: "flex",
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      height: frameHeight }}>
                            <Title>
                                {issueMessage1}<br/>{issueMessage2}
                            </Title>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div style={{ display: "flex",
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: frameHeight }}>
                            <Title>
                                {this.dataProcessor.issues.popularIssueContribution}
                            </Title>
                        </div>
                    </Col>
                </Row>
            );
        } else {
            return (
                <div key='issueFrame' />
            );
        }
    }

    pullRequestFrame() {
        let hasPullrequest = this.dataProcessor.pullRequests.totalPullRequestContributions !== 0;
        let pullRequestMessage1 = "你共向"+ this.dataProcessor.pullRequests.totalRepositoryWithContributedPullRequests +"个仓库发起了" + this.dataProcessor.pullRequests.totalPullRequestContributions + "个 pull requests";
        let pullRequestMessage2 = "这是你最受关注的一个 pull request";

        if (hasPullrequest) {
            return (
                <Row key='pullRequestFrame'>
                    <Col span={16}>
                        <div style={{ display: "flex",
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      height: frameHeight }}>
                            <Title>
                                {pullRequestMessage1}<br/>{pullRequestMessage2}
                            </Title>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div style={{ display: "flex",
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      height: frameHeight }}>
                            <Title>
                                {this.dataProcessor.pullRequests.popularPullRequestContribution}
                            </Title>
                        </div>
                    </Col>
                </Row>
            );
        } else {
            return (
                <div key='pullRequestFrame' />
            );
        }
    }

    saveFrame() {
        let onClick = () => {
            // @ts-ignore
            domtoimage.toBlob(document.getElementById('dataFrames'))
                .then((blob: any) => {
                    // @ts-ignore
                    saveAs(blob, 'my-github-year.png');
                })
                .catch((e: any) => {
                    console.log(e);
                });
        };

        return (
            <Row key='saveFrame'>
                <Col span={24}>
                    <div style={{ display: "flex",
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: frameHeight }}>
                        <Typography>
                        <Title>
                            本项目仓库位于<a href='https://github.com/Evian-Zhang/my-github-year'>Evian-Zhang/my-github-year</a>
                        </Title>
                        <Paragraph>
                        <Button onClick={onClick} type='primary' size='large'>
                            点击下载图片
                        </Button>
                        </Paragraph>
                        </Typography>
                    </div>
                </Col>
            </Row>
        );
    }

    renderDataPage() {
        const noContributionFrame = () => {
            return (
                <div style={{ display: "flex",
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: frameHeight }}>
                    <Title style={{ textAlign: 'center' }}>
                        你在2019年似乎并没有使用 GitHub
                    </Title>
                </div>
            );
        };

        const dataPage = () => {
            return (
            <div>
                {!this.dataProcessor.contributions.hasAnyContributions &&
                <Row type='flex' align='middle'>
                    <Col span={24}>
                        {noContributionFrame()}
                    </Col>
                </Row>}
                <div id='dataFrames'>
                {this.dataProcessor.contributions.hasAnyContributions &&
                [
                    <Row key='idFrame'>
                        <Col span={24}>
                            <div style={{ display: "flex",
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: frameHeight }}>
                                <Typography>
                                <Title>
                                    {this.dataProcessor.username}的2019年
                                </Title>
                                    <Paragraph>
                                        <img src={require("./QRcode.png")} alt="QR code" style={{ width: "300px" }}/>
                                    </Paragraph>
                                </Typography>
                            </div>
                        </Col>
                    </Row>,
                    this.contributionFrame(),
                    this.diligenceFrame(),
                    this.commitFrame(),
                    this.repositoryFrame(),
                    this.starFrame(),
                    this.watchFrame(),
                    this.issueFrame(),
                    this.pullRequestFrame()
                ]}
                </div>
                {
                    this.dataProcessor.contributions.hasAnyContributions &&
                    this.saveFrame()
                }
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