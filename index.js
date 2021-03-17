const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const sariftToMd = require('@security-alert/sarif-to-markdown')

try {
  const sarifReportpath = core.getInput('sarifReport');
  console.log(`report file name ${sarifReportpath}`);
  let rawdata = fs.readFileSync(sarifReportpath);
  let jsonSarif = JSON.parse(rawdata)
  const context = github.context;
  owner = context.repo.owner 
  repo = context.repo.repo 
  branch = ""
  console.log(`repo details ${context.repo.owner}, ${context.repo.repo}, ${context.repo.branch}`)
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
const github_token = core.getInput('GITHUB_TOKEN');

if (context.payload.pull_request == null) {
    core.setFailed('No pull request found.');
    return;
}
const pull_request_number = context.payload.pull_request.number;

const octokit = new github.GitHub(github_token);
const new_comment = octokit.issues.createComment({
    ...context.repo,
    issue_number: pull_request_number,
    body: body
    });

} catch (error) {
  core.setFailed(error.message);
}