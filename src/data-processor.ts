interface QueryResponse {
    hasAnyContributions: boolean,
    contributionCalendar: {
        totalContributions: number,
        weeks: [{
            contributionDays: [{
                date: Date,
                contributionCount: number
            }]
        }]
    },
    totalCommitContributions: number,
    totalRepositoriesWithContributedCommits: number,
    commitContributionsByRepository: [{
        repository: {
            languages: {
                nodes: [{
                    name: string
                }]
            }
        }
    }],
    totalIssueContributions: number,
    totalRepositoriesWithContributedIssues: number,
    popularIssueContribution: {
        issue: {
            title: string
        }
    },
    totalPullRequestContributions: number,
    totalRepositoriesWithContributedPullRequests: number,
    popularPullRequestContribution: {
        pullRequest: {
            title: string
        }
    },
    repositoryContributions: {
        nodes: [{
            repository: {
                languages: {
                    nodes: [{
                        name: string
                    }]
                }
            }
        }]
    },
    totalRepositoryContributions: number
}

class ContributionData {
    hasAnyContributions: boolean;
    totalContributions: number;
    contributionMonths: Array<number>;

    constructor() {
        this.hasAnyContributions = false;
        this.totalContributions = 0;
        this.contributionMonths = new Array(12);
        for (let month = 0; month < 12; month++) {
            this.contributionMonths[month] = 0;
        }
    }
}

class CommitData {
    totalCommitContributions: number;
    totalRepositoriesWithContributedCommits: number;
    languages: Map<string, number>;

    constructor() {
        this.totalCommitContributions = 0;
        this.totalRepositoriesWithContributedCommits = 0;
        this.languages = new Map();
    }
}

class IssueData {
    totalIssueContributions: number;
    totalRepositoryWithContributedIssues: number;
    popularIssueContribution: string;

    constructor() {
        this.totalIssueContributions = 0;
        this.totalRepositoryWithContributedIssues = 0;
        this.popularIssueContribution = "";
    }
}

class PullRequestData {
    totalPullRequestContributions: number;
    totalRepositoryWithContributedPullRequests: number;
    popularPullRequestContribution: string;

    constructor() {
        this.totalPullRequestContributions = 0;
        this.totalRepositoryWithContributedPullRequests = 0;
        this.popularPullRequestContribution = "";
    }
}

class RepositoryData {
    totalRepositoryContributions: number;
    languages: Map<string, number>;

    constructor() {
        this.totalRepositoryContributions = 0;
        this.languages = new Map();
    }
}

class DataProcessor {
    username: string;
    token: string;
    rawData: QueryResponse | null;

    contributions: ContributionData;
    commits: CommitData;
    issues: IssueData;
    pullRequests: PullRequestData;
    repositories: RepositoryData;

    constructor(username: string, token: string) {
        this.username = username;
        this.token = token;
        this.rawData = null;
        this.contributions = new ContributionData();
        this.commits = new CommitData();
        this.issues = new IssueData();
        this.pullRequests = new PullRequestData();
        this.repositories = new RepositoryData();
    }

    async fetchEvents() {
        const headers = {
            'Authorization': `bearer ${this.token}`
        };
        const body = {
            "query": `query {
                user(login: "${this.username}") {
                    contributionsCollection(from:"2019-01-01T00:00:00Z", to:"2019-12-31T23:59:59Z") {
                        hasAnyContributions
                        contributionCalendar {
                            totalContributions
                            weeks {
                                contributionDays {
                                    date
                                    contributionCount
                                }
                            }
                        }
                        totalCommitContributions
                        totalRepositoriesWithContributedCommits
                        commitContributionsByRepository {
                            repository {
                                languages(first: 5, orderBy: { direction: DESC, field: SIZE }) {
                                    nodes {
                                        name
                                    }
                                }
                            }
                        }
                        totalIssueContributions
                        totalRepositoriesWithContributedIssues
                        popularIssueContribution {
                            issue {
                                title
                            }
                        }
                        totalPullRequestContributions
                        totalRepositoriesWithContributedPullRequests
                        popularPullRequestContribution {
                            pullRequest {
                                title
                            }
                        }
                        repositoryContributions(first: 64) {
                            nodes {
                                repository {
                                    languages(first: 5, orderBy: { direction: DESC, field: SIZE }) {
                                        nodes {
                                            name
                                        }
                                    }
                                }
                            }
                        }
                        totalRepositoryContributions
                    }
                }
            }`
        };
        let res = await fetch("https://api.github.com/graphql", {
            method: 'POST',
            body: JSON.stringify(body),
            headers: headers
        });
        if (res.status !== 200) {
            let message = "未知错误";
            switch (res.status) {
                case 401: {
                    message = "Token 不正确";
                    break;
                }
                case 404: {
                    message = "未找到该用户";
                    break;
                }
            }
            return Promise.reject(message);
        }
        this.rawData = await res.json();
        console.log(this.rawData);
        return Promise.resolve();
    }

    async processData() {
        if (this.rawData) {
            // ContributionData
            this.contributions.hasAnyContributions = this.rawData.hasAnyContributions;
            if (!this.contributions.hasAnyContributions) {
                return Promise.resolve();
            }
            this.contributions.totalContributions = this.rawData.contributionCalendar.totalContributions;
            for (let week of this.rawData.contributionCalendar.weeks) {
                for (let day of week.contributionDays) {
                    this.contributions.contributionMonths[day.date.getMonth()] += day.contributionCount;
                }
            }

            // CommitData
            this.commits.totalCommitContributions = this.rawData.totalCommitContributions;
            this.commits.totalRepositoriesWithContributedCommits = this.rawData.totalRepositoriesWithContributedCommits;
            for (let repository of this.rawData.commitContributionsByRepository) {
                let languages = repository.repository.languages.nodes;
                for (let rank = 0; rank < languages.length; rank++) {
                    let score = 1 - rank * 0.1;
                    let preScore = this.commits.languages.get(languages[rank].name);
                    if (preScore) {
                        this.commits.languages.set(languages[rank].name, score + preScore);
                    } else {
                        this.commits.languages.set(languages[rank].name, score);
                    }
                }
            }

            // IssueData
            this.issues.totalIssueContributions = this.rawData.totalIssueContributions;
            this.issues.totalRepositoryWithContributedIssues = this.rawData.totalRepositoriesWithContributedIssues;
            this.issues.popularIssueContribution = this.rawData.popularIssueContribution.issue.title;

            // PullRequestData
            this.pullRequests.totalPullRequestContributions = this.rawData.totalPullRequestContributions;
            this.pullRequests.totalRepositoryWithContributedPullRequests = this.rawData.totalRepositoriesWithContributedPullRequests;
            this.pullRequests.popularPullRequestContribution = this.rawData.popularPullRequestContribution.pullRequest.title;

            // RepositoryData
            this.repositories.totalRepositoryContributions = this.rawData.totalRepositoryContributions;
            for (let repository of this.rawData.repositoryContributions.nodes) {
                let languages = repository.repository.languages.nodes;
                for (let rank = 0; rank < languages.length; rank++) {
                    let score = 1 - rank * 0.1;
                    let preScore = this.commits.languages.get(languages[rank].name);
                    if (preScore) {
                        this.repositories.languages.set(languages[rank].name, score + preScore);
                    } else {
                        this.repositories.languages.set(languages[rank].name, score);
                    }
                }
            }
        }
        return Promise.resolve();
    }
}

export { DataProcessor }