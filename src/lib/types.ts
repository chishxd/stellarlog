interface CommitAuthor {
	name: string;
	date: string;
}

interface CommitDetails {
	author: CommitAuthor;
	message: string;
}

export interface GithubCommit {
	sha: string;
	commit: CommitDetails;
	stats: {
		total: number;
		additions: number;
		deletions: number;
	};
}
