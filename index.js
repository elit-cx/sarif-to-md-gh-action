


const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const sariftToMd = require('@security-alert/sarif-to-markdown')

try {
  // `who-to-greet` input defined in action metadata file
  const sarifReportpath = core.getInput('sarifReport');
  console.log(`report file name ${sarifReportpath}!`);
  let rawdata = fs.readFileSync(sarifReportpath);
  const results = sariftToMd.sarifToMarkdown({
    owner: github.owner,
    repo: github.repo,
    branch: github.branch,
    sourceRoot: ""
})(JSON.parse(rawdata));
  const time = (new Date()).toTimeString();
  core.setOutput("mdFile", results);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}