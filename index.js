const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const sariftToMd = require('@security-alert/sarif-to-markdown')

async function run(){

	try {
        const context = github.context;
        const github_token = core.getInput('token');

		if (context.payload.pull_request == null) {
		core.setFailed('No pull request found.');
		return;
		}

		const sarifReportpath = core.getInput('sarifReport');
		console.log(`report file name ${sarifReportpath}`);
		let rawdata = fs.readFileSync(sarifReportpath);
		let jsonSarif = JSON.parse(rawdata)
		
		const octokit = new github.getOctokit(github_token)
		const owner = context.repo.owner 
		const repo = context.repo.repo 
		const pull_request_number = context.payload.pull_request.number;
		
		const response = await octokit.pulls.get({
		owner: owner,
		repo: repo,
		pull_number: pull_request_number
		});
		const branch = response.data.head.ref
		
		console.log(`repo details ${owner}, ${repo}, ${branch}`)
		const results = sariftToMd.sarifToMarkdown({
		owner: owner,
		repo: repo,
		branch: branch,
		sourceRoot: ""
		})(jsonSarif);
		
		const resultsHasMessage = results.filter(result => result.hasMessages);
			const body = resultsHasMessage.map(result => {
				return result.body;
			}).join("\n\n");
		//console.log(`convert sarif data ${body}`);
		fs.writeFileSync("report.md", body);
		core.setOutput("mdFile", 'report.md');

		//Comment on PR
		const new_comment = await octokit.issues.createComment({
			...context.repo,
			issue_number: pull_request_number,
			body: body
			});
		
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();