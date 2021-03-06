interface QueryResponse {
    data: {
        user: {
            contributionsCollection: {
                hasAnyContributions: boolean;
                contributionCalendar: {
                    totalContributions: number;
                    weeks: [
                        {
                            contributionDays: [
                                {
                                    date: Date;
                                    contributionCount: number;
                                }
                            ];
                        }
                    ];
                };
                totalCommitContributions: number;
                totalRepositoriesWithContributedCommits: number;
                commitContributionsByRepository: [
                    {
                        repository: {
                            languages: {
                                nodes: [
                                    {
                                        name: string;
                                    }
                                ];
                            };
                        };
                    }
                ];
                totalIssueContributions: number;
                totalRepositoriesWithContributedIssues: number;
                popularIssueContribution: {
                    issue: {
                        title: string;
                    };
                } | null;
                totalPullRequestContributions: number;
                totalRepositoriesWithContributedPullRequests: number;
                popularPullRequestContribution: {
                    pullRequest: {
                        title: string;
                    };
                } | null;
                repositoryContributions: {
                    nodes: [
                        {
                            repository: {
                                languages: {
                                    nodes: [
                                        {
                                            name: string;
                                        }
                                    ];
                                };
                                stargazers: {
                                    totalCount: number;
                                };
                            };
                        }
                    ];
                };
                totalRepositoryContributions: number;
            };
            starredRepositories: {
                nodes: [
                    {
                        languages: {
                            nodes: [
                                {
                                    name: string;
                                }
                            ];
                        };
                    }
                ];
                totalCount: number;
            };
            watching: {
                nodes: [
                    {
                        languages: {
                            nodes: [
                                {
                                    name: string;
                                }
                            ];
                        };
                    }
                ];
                totalCount: number;
            };
        };
    };
}

class ContributionData {
    hasAnyContributions: boolean;
    totalContributions: number;
    contributionDays: number;
    contributionMonths: Array<number>;

    constructor() {
        this.hasAnyContributions = false;
        this.totalContributions = 0;
        this.contributionDays = 0;
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
    popularIssueContribution: string | null;

    constructor() {
        this.totalIssueContributions = 0;
        this.totalRepositoryWithContributedIssues = 0;
        this.popularIssueContribution = "";
    }
}

class PullRequestData {
    totalPullRequestContributions: number;
    totalRepositoryWithContributedPullRequests: number;
    popularPullRequestContribution: string | null;

    constructor() {
        this.totalPullRequestContributions = 0;
        this.totalRepositoryWithContributedPullRequests = 0;
        this.popularPullRequestContribution = "";
    }
}

class RepositoryData {
    totalRepositoryContributions: number;
    languages: Map<string, number>;
    stars: number;

    constructor() {
        this.totalRepositoryContributions = 0;
        this.languages = new Map();
        this.stars = 0;
    }
}

class StarData {
    stars: number;
    languages: Map<string, number>;

    constructor() {
        this.languages = new Map();
        this.stars = 0;
    }
}

class WatchData {
    watches: number;
    languages: Map<string, number>;

    constructor() {
        this.languages = new Map();
        this.watches = 0;
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
    stars: StarData;
    watches: WatchData;

    constructor(username: string, token: string) {
        this.username = username;
        this.token = token;
        this.rawData = null;
        this.contributions = new ContributionData();
        this.commits = new CommitData();
        this.issues = new IssueData();
        this.pullRequests = new PullRequestData();
        this.repositories = new RepositoryData();
        this.stars = new StarData();
        this.watches = new WatchData();
    }

    async fetchEvents() {
        const headers = {
            Authorization: `bearer ${this.token}`,
        };
        const currentYear = localStorage.getItem("currentYear");
        const body = {
            query: `query {
                user(login: "${this.username}") {
                    contributionsCollection(from:"${currentYear}-01-01T00:00:00Z", to:"${currentYear}-12-31T23:59:59Z") {
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
                                    stargazers(first: 1) {
                                        totalCount
                                    }
                                }
                            }
                        }
                        totalRepositoryContributions
                    }
                    starredRepositories(first: 64) {
                        nodes {
                            languages(first: 5, orderBy: { direction: DESC, field: SIZE }) {
                                nodes {
                                    name
                                }
                            }
                        }
                        totalCount
                    }
                    watching(first: 64) {
                        nodes {
                            languages(first: 5, orderBy: { direction: DESC, field: SIZE }) {
                                nodes {
                                    name
                                }
                            }
                        }
                        totalCount
                    }
                }
            }`,
        };
        let res = await fetch("https://api.github.com/graphql", {
            method: "POST",
            body: JSON.stringify(body),
            headers: headers,
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
        const text = await res.text();
        const reISO = /^(\d{4})-(\d{2})-(\d{2})$/;
        let dateTimeReceiver = (key: string, value: string) => {
            let a = reISO.exec(value);
            if (a) {
                return new Date(value);
            }
            return value;
        };
        this.rawData = JSON.parse(text, dateTimeReceiver);
        return Promise.resolve();
    }

    processData() {
        if (this.rawData) {
            let rawData = this.rawData.data.user.contributionsCollection;
            // ContributionData
            this.contributions.hasAnyContributions = rawData.hasAnyContributions;
            if (!this.contributions.hasAnyContributions) {
                return;
            }
            this.contributions.totalContributions = rawData.contributionCalendar.totalContributions;
            for (let week of rawData.contributionCalendar.weeks) {
                for (let day of week.contributionDays) {
                    this.contributions.contributionMonths[day.date.getMonth()] += day.contributionCount;
                    if (day.contributionCount > 0) {
                        this.contributions.contributionDays += 1;
                    }
                }
            }

            // CommitData
            this.commits.totalCommitContributions = rawData.totalCommitContributions;
            this.commits.totalRepositoriesWithContributedCommits = rawData.totalRepositoriesWithContributedCommits;
            for (let repository of rawData.commitContributionsByRepository) {
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
            this.issues.totalIssueContributions = rawData.totalIssueContributions;
            this.issues.totalRepositoryWithContributedIssues = rawData.totalRepositoriesWithContributedIssues;
            if (rawData.popularIssueContribution) {
                this.issues.popularIssueContribution = rawData.popularIssueContribution.issue.title;
            } else {
                this.issues.popularIssueContribution = null;
            }

            // PullRequestData
            this.pullRequests.totalPullRequestContributions = rawData.totalPullRequestContributions;
            this.pullRequests.totalRepositoryWithContributedPullRequests = rawData.totalRepositoriesWithContributedPullRequests;
            if (rawData.popularPullRequestContribution) {
                this.pullRequests.popularPullRequestContribution = rawData.popularPullRequestContribution.pullRequest.title;
            } else {
                this.pullRequests.popularPullRequestContribution = null;
            }

            // RepositoryData
            this.repositories.totalRepositoryContributions = rawData.totalRepositoryContributions;
            for (let repository of rawData.repositoryContributions.nodes) {
                let languages = repository.repository.languages.nodes;
                for (let rank = 0; rank < languages.length; rank++) {
                    let score = 1 - rank * 0.1;
                    let preScore = this.repositories.languages.get(languages[rank].name);
                    if (preScore) {
                        this.repositories.languages.set(languages[rank].name, score + preScore);
                    } else {
                        this.repositories.languages.set(languages[rank].name, score);
                    }
                }
                this.repositories.stars += repository.repository.stargazers.totalCount;
            }

            // StarData
            this.stars.stars = this.rawData.data.user.starredRepositories.totalCount;
            for (let repository of this.rawData.data.user.starredRepositories.nodes) {
                let languages = repository.languages.nodes;
                for (let rank = 0; rank < languages.length; rank++) {
                    let score = 1 - rank * 0.1;
                    let preScore = this.stars.languages.get(languages[rank].name);
                    if (preScore) {
                        this.stars.languages.set(languages[rank].name, score + preScore);
                    } else {
                        this.stars.languages.set(languages[rank].name, score);
                    }
                }
            }

            // WatchData
            this.watches.watches = this.rawData.data.user.watching.totalCount;
            for (let repository of this.rawData.data.user.watching.nodes) {
                let languages = repository.languages.nodes;
                for (let rank = 0; rank < languages.length; rank++) {
                    let score = 1 - rank * 0.1;
                    let preScore = this.watches.languages.get(languages[rank].name);
                    if (preScore) {
                        this.watches.languages.set(languages[rank].name, score + preScore);
                    } else {
                        this.watches.languages.set(languages[rank].name, score);
                    }
                }
            }
        }
    }
}

export { DataProcessor };
