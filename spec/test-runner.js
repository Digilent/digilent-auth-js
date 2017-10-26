var Jasmine = require('jasmine');
var prompt = require('syncprompt');

runTest(['spec/core.js'], 'test environment')
.then(() => {
	prompt('Confirm user on AWS Cognito, then hit Enter.');

	return runTest(['spec/core2.js'], 'object');
})
.then(() => {
	console.log("Success");
})
.catch(() => {
	console.log("Error");
});

function runTest(files, filterString) {
	return new Promise((resolve, reject) => {
		var jasmine = new Jasmine();

		jasmine.onComplete((passed) => {
			if (passed) {
				resolve();
			}
			else {
				reject();
			}
		});

		jasmine.execute(files, filterString);
	});
}