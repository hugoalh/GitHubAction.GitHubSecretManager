/*==================
[GitHub Action] GitHub Secret Manager
	Language:
		NodeJS/12.13.0
==================*/
const advancedDetermine = require("@hugoalh/advanced-determine"),
	githubAction = {
		core: require("@actions/core"),
		github: require("@actions/github")
	},
	githubSodium = require("@hugoalh/github-sodium");
(async () => {
	githubAction.core.info(`Import workflow argument. ([GitHub Action] GitHub Secret Manager)`);
	let environmentVariable = process.env,
		mode = githubAction.core.getInput("mode"),
		prefix = githubAction.core.getInput("prefix"),
		target = githubAction.core.getInput("target"),
		token = githubAction.core.getInput("token");
	githubAction.core.info(`Analysis workflow argument. ([GitHub Action] GitHub Secret Manager)`);
	if (environmentVariable.GITHUB_ACTIONS !== true && environmentVariable.GITHUB_ACTIONS !== "true") {
		throw new Error(`For security reason, this action cannot execute/run on self-host machine/runner! ([GitHub Action] GitHub Secret Manager)`);
	};
	if (environmentVariable.GITHUB_ACTOR !== environmentVariable.GITHUB_REPOSITORY.split("/")[0]) {
		throw new Error(`For security reason, action's actor and source's secret's owner must be the same user! ([GitHub Action] GitHub Secret Manager)`);
	};
	if (advancedDetermine.isStringSingleLine(mode) !== true) {
		throw new TypeError(`Argument "mode" must be type of string (non-nullable)! ([GitHub Action] GitHub Secret Manager)`);
	};
	switch (mode.toLowerCase()) {
		case "exist":
			mode = "exist";
			break;
		case "pushmerge":
		case "push":
			mode = "pushmerge";
			break;
		case "replace":
			mode = "replace";
			break;
		default:
			throw new RangeError(`Argument "mode"'s value is not in the method list! ([GitHub Action] GitHub Secret Manager`);
	};
	if (advancedDetermine.isStringSingleLine(prefix) !== true) {
		throw new TypeError(`Argument "prefix" must be type of string (non-nullable)! ([GitHub Action] GitHub Secret Manager)`);
	};
	if (prefix.toLowerCase().search(/^[\w\d]+_$/gu) === 0) {
		prefix = prefix.toUpperCase();
	} else {
		throw new SyntaxError(`Argument "prefix"'s value is not match the require pattern! ([GitHub Action] GitHub Secret Manager)`);
	};
	if (advancedDetermine.isString(target) !== true) {
		throw new TypeError(`Argument "target" must be type of string (non-nullable)! ([GitHub Action] GitHub Secret Manager)`);
	};
	let targetOrganization = [],
		targetRepository = [];
	target.split("\n").forEach((element) => {
		if (element.length > 0) {
			if (element.search(/\(org(anization)?\)[\w\d\-._]+/giu) === 0) {
				targetOrganization.push(element.replace(/\(org(anization)?\)/giu, ""));
			} else if (element.search(/^[\w\d\-._]+\/[\w\d\-._]+$/giu) === 0) {
				targetRepository.push(element);
			} else {
				throw new SyntaxError(`Argument "repository"'s value is not match the require pattern! ([GitHub Action] GitHub Secret Manager)`);
			};
		};
	});
	if (advancedDetermine.isStringSingleLine(token) !== true) {
		throw new TypeError(`Argument "token" must be type of string (non-nullable)! ([GitHub Action] GitHub Secret Manager)`);
	};
	let secretDatabase = {};
	Object.keys(environmentVariable).forEach((element) => {
		if (element.toUpperCase().indexOf(prefix) === 0) {
			secretDatabase[element.toUpperCase().replace(prefix, "")] = process.env[element];
		};
	});
	Object.keys(environmentVariable).forEach((element) => {
		if (element.toUpperCase().indexOf(`INPUT_${prefix}`) === 0) {
			secretDatabase[element.toUpperCase().replace(`INPUT_${prefix}`, "")] = process.env[element];
		};
	});
	let secretDatabaseKey = Object.keys(secretDatabase);
	githubAction.core.debug(`Secret Key List: ${secretDatabaseKey.join(", ")} ([GitHub Action] GitHub Secret Manager)`);
	Object.values(secretDatabase).forEach((element) => {
		githubAction.core.setSecret(element);
	});
	if (
		(targetOrganization.length === 0 && targetRepository.length === 0) ||
		secretDatabaseKey.length === 0
	) {
		throw new Error(`Nothing to manage. Probably something went wrong? ([GitHub Action] GitHub Secret Manager)`);
	};
	githubAction.core.info(`Set up transaction platform. ([GitHub Action] GitHub Secret Manager)`);
	const octokit = githubAction.github.getOctokit(token);
	if (targetOrganization.length > 0) {
		githubAction.core.info(`Manage organization(s) secret. ([GitHub Action] GitHub Secret Manager)`);
		for (let indexOrganization = 0; indexOrganization < targetOrganization.length; indexOrganization++) {
			let organizationName = targetOrganization[indexOrganization],
				result = [],
				totalPage = 1;
			for (let indexPage = 0; indexPage < totalPage; indexPage++) {
				let dataList = await octokit.actions.listOrgSecrets({
					org: organizationName,
					page: indexPage + 1,
					per_page: 100
				});
				githubAction.core.setSecret(dataList);
				if (dataList.status !== 200) {
					githubAction.core.warning(`Receive status code ${dataList.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
				};
				dataList.data.secrets.forEach((element) => {
					result.push(element.name);
				});
				if (indexPage === 0) {
					if (advancedDetermine.isString(dataList.headers.link) === true) {
						if (dataList.headers.link.search(/\?page=(\d+)&per_page=100>; rel="last"/giu) !== -1) {
							let totalPageData = dataList.headers.link.match(/\?page=(\d+)&per_page=100>; rel="last"/giu)[0].split("&")[0].split("=")[1];
							totalPage = Number(totalPageData);
							githubAction.core.info(`Organization "${organizationName}" has at most ${totalPage * 100} secrets, this action may take longer than usual! ([GitHub Action] GitHub Secret Manager)`);
						};
					};
				};
			};
			let listExist = [],
				listNotExist = [];
			secretDatabaseKey.forEach((key) => {
				if (result.includes(key) === true) {
					listExist.push(key);
				} else {
					listNotExist.push(key);
				};
			});
			let dataPublicKey = await octokit.actions.getOrgPublicKey({
				org: organizationName
			});
			githubAction.core.setSecret(dataPublicKey);
			if (dataPublicKey.status !== 200) {
				githubAction.core.warning(`Receive status code ${dataPublicKey.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
			};
			let publicKey = dataPublicKey.data.key,
				publicKeyID = dataPublicKey.data.key_id;
			githubAction.core.setSecret(publicKey);
			githubAction.core.setSecret(publicKeyID);
			for (let indexExistKey = 0; indexExistKey < listExist.length; indexExistKey++) {
				let key = listExist[indexExistKey];
				let value = githubSodium(publicKey, secretDatabase[key]);
				githubAction.core.setSecret(value);
				let data = await octokit.actions.createOrUpdateOrgSecret({
					encrypted_value: value,
					key_id: publicKeyID,
					org: organizationName,
					secret_name: key,
					visibility: "all"
				});
				if (data.status !== 201 && data.status !== 204) {
					githubAction.core.warning(`Receive status code ${data.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
				};
			};
			switch (mode) {
				case "exist":
				default:
					break;
				case "pushmerge":
					for (let indexNotExistKey = 0; indexNotExistKey < listNotExist.length; indexNotExistKey++) {
						let key = listNotExist[indexNotExistKey];
						let value = githubSodium(publicKey, secretDatabase[key]);
						githubAction.core.setSecret(value);
						let data = await octokit.actions.createOrUpdateOrgSecret({
							encrypted_value: value,
							key_id: publicKeyID,
							org: organizationName,
							secret_name: key
						});
						if (data.status !== 201 && data.status !== 204) {
							githubAction.core.warning(`Receive status code ${data.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
						};
					};
					break;
				case "replace":
					for (let indexNotExistKey = 0; indexNotExistKey < listNotExist.length; indexNotExistKey++) {
						let key = listNotExist[indexNotExistKey];
						let data = await octokit.actions.deleteOrgSecret({
							org: organizationName,
							secret_name: key
						});
						if (data.status !== 204) {
							githubAction.core.warning(`Receive status code ${data.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
						};
					};
					break;
			};
		};
	};
	if (targetRepository.length > 0) {
		githubAction.core.info(`Manage repository(ies) secret. ([GitHub Action] GitHub Secret Manager)`);
		for (let indexRepository = 0; indexRepository < targetRepository.length; indexRepository++) {
			let [repositoryOwner, repositoryName] = targetRepository[indexRepository].split("/"),
				result = [],
				totalPage = 1;
			for (let indexPage = 0; indexPage < totalPage; indexPage++) {
				let dataList = await octokit.actions.listRepoSecrets({
					owner: repositoryOwner,
					page: indexPage + 1,
					per_page: 100,
					repo: repositoryName
				});
				githubAction.core.setSecret(dataList);
				if (dataList.status !== 200) {
					githubAction.core.warning(`Receive status code ${dataList.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
				};
				dataList.data.secrets.forEach((element) => {
					result.push(element.name);
				});
				if (indexPage === 0) {
					if (advancedDetermine.isString(dataList.headers.link) === true) {
						if (dataList.headers.link.search(/\?page=(\d+)&per_page=100>; rel="last"/giu) !== -1) {
							let totalPageData = dataList.headers.link.match(/\?page=(\d+)&per_page=100>; rel="last"/giu)[0].split("&")[0].split("=")[1];
							totalPage = Number(totalPageData);
							githubAction.core.info(`Repository "${repositoryOwner}/${repositoryName}" has at most ${totalPage * 100} secrets, this action may take longer than usual! ([GitHub Action] GitHub Secret Manager)`);
						};
					};
				};
			};
			let listExist = [],
				listNotExist = [];
			secretDatabaseKey.forEach((key) => {
				if (result.includes(key) === true) {
					listExist.push(key);
				} else {
					listNotExist.push(key);
				};
			});
			let dataPublicKey = await octokit.actions.getRepoPublicKey({
				owner: repositoryOwner,
				repo: repositoryName
			});
			githubAction.core.setSecret(dataPublicKey);
			if (dataPublicKey.status !== 200) {
				githubAction.core.warning(`Receive status code ${dataPublicKey.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
			};
			let publicKey = dataPublicKey.data.key,
				publicKeyID = dataPublicKey.data.key_id;
			githubAction.core.setSecret(publicKey);
			githubAction.core.setSecret(publicKeyID);
			for (let indexExistKey = 0; indexExistKey < listExist.length; indexExistKey++) {
				let key = listExist[indexExistKey];
				let value = githubSodium(publicKey, secretDatabase[key]);
				githubAction.core.setSecret(value);
				let data = await octokit.actions.createOrUpdateRepoSecret({
					encrypted_value: value,
					key_id: publicKeyID,
					owner: repositoryOwner,
					repo: repositoryName,
					secret_name: key
				});
				if (data.status !== 201 && data.status !== 204) {
					githubAction.core.warning(`Receive status code ${data.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
				};
			};
			switch (mode) {
				case "exist":
				default:
					break;
				case "pushmerge":
					for (let indexNotExistKey = 0; indexNotExistKey < listNotExist.length; indexNotExistKey++) {
						let key = listNotExist[indexNotExistKey];
						let value = githubSodium(publicKey, secretDatabase[key]);
						githubAction.core.setSecret(value);
						let data = await octokit.actions.createOrUpdateRepoSecret({
							encrypted_value: value,
							key_id: publicKeyID,
							owner: repositoryOwner,
							repo: repositoryName,
							secret_name: key
						});
						if (data.status !== 201 && data.status !== 204) {
							githubAction.core.warning(`Receive status code ${data.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
						};
					};
					break;
				case "replace":
					for (let indexNotExistKey = 0; indexNotExistKey < listNotExist.length; indexNotExistKey++) {
						let key = listNotExist[indexNotExistKey];
						let data = await octokit.actions.deleteRepoSecret({
							owner: repositoryOwner,
							repo: repositoryName,
							secret_name: key
						});
						if (data.status !== 204) {
							githubAction.core.warning(`Receive status code ${data.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
						};
					};
					break;
			};
		};
	};
})().catch((error) => {
	githubAction.core.error(error);
	process.exit(1);
});
