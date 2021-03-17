const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const sariftToMd = require('@security-alert/sarif-to-markdown')

try {
  const sarifReportpath = core.getInput('sarifReport');
  //const sarifReportpath = 'sample.json';
  console.log(`report file name ${sarifReportpath}`);
  let rawdata = fs.readFileSync(sarifReportpath);
  let jsonSarif = JSON.parse(rawdata)
  //console.log(`get sarif data ${rawdata}`);
  const context = github.context;
  owner = context.repo.owner ?? ""
  repo = context.repo.repo ?? ""
  branch = context.repo.branch ?? ""
  console.log(`repo details ${context.repo.owner}, ${context.repo.repo}, ${context.repo.branch}`)
  const results = sariftToMd.sarifToMarkdown({
    owner: owner,
    repo: repo,
    branch: branch,
    sourceRoot: ""
})(jsonSarif);
/*const results = sariftToMd.sarifToMarkdown({
    owner: 'eli',
    repo: 'test',
    branch: 'master',
    sourceRoot: ""
})(jsonSarif);*/
const resultsHasMessage = results.filter(result => result.hasMessages);
    const body = resultsHasMessage.map(result => {
        return result.body;
    }).join("\n\n");
console.log(`convert sarif data ${body}`);
  const time = (new Date()).toTimeString();
  core.setOutput("mdFile", results);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}