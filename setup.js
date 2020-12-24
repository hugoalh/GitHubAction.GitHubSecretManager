/*==================
[GitHub Action] GitHub Secret Manager - Setup
	Language:
		NodeJS/14.15.0
==================*/
const childProcess = require("child_process");
let setupLog = childProcess.execSync(
	`npm install --production`,
	{
		cwd: __dirname
	}
);
console.log(setupLog.toString("utf8"));
