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
	githubSodium = require("@hugoalh/github-sodium"),
	regexpEscape = require("escape-string-regexp");
(async () => {
	githubAction.core.info(`Import workflow argument (stage 1). ([GitHub Action] GitHub Secret Manager)`);
	let environmentVariable = process.env,
		target = githubAction.core.getInput("target");
	githubAction.core.info(`Analysis workflow argument (stage 1). ([GitHub Action] GitHub Secret Manager)`);
	if (environmentVariable.GITHUB_ACTIONS.toLowerCase() !== "true") {
		throw new Error(`For security reason, this action cannot execute/run on self-host machine/runner! ([GitHub Action] GitHub Secret Manager)`);
	};
	if (environmentVariable.GITHUB_ACTOR !== environmentVariable.GITHUB_REPOSITORY.split("/")[0]) {
		throw new Error(`For security reason, action's actor and source's secret's owner must be the same user! ([GitHub Action] GitHub Secret Manager)`);
	};
	if (advancedDetermine.isString(target) === true) {
		throw new Error(`Argument "target" is removed! Use "target_repository" and/or "target_organization" instead. ([GitHub Action] GitHub Secret Manager)`);
	};
	githubAction.core.info(`Import workflow argument (stage 2). ([GitHub Action] GitHub Secret Manager)`);
	let mode = githubAction.core.getInput("mode"),
		secretList = githubAction.core.getInput("secretlist");
	githubAction.core.info(`Analysis workflow argument (stage 2). ([GitHub Action] GitHub Secret Manager)`);
	if (advancedDetermine.isStringSingleLine(mode) !== true) {
		throw new TypeError(`Argument "mode" must be type of string (non-nullable)! ([GitHub Action] GitHub Secret Manager)`);
	};
	switch (mode.toLowerCase()) {
		case "existmerge":
		case "exist":
			mode = "existmerge";
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
	switch (advancedDetermine.isString(secretList)) {
		case null:
			secretList = {};
			githubAction.core.info(`Import workflow argument (stage 3). ([GitHub Action] GitHub Secret Manager)`);
			let prefix = githubAction.core.getInput("prefix");
			githubAction.core.info(`Analysis workflow argument (stage 3). ([GitHub Action] GitHub Secret Manager)`);
			if (advancedDetermine.isStringSingleLine(prefix) !== true) {
				throw new TypeError(`Argument "prefix" must be type of string (non-nullable)! ([GitHub Action] GitHub Secret Manager)`);
			};
			if (prefix.toLowerCase().search(/^[\d\w]+_$/gu) !== 0) {
				throw new SyntaxError(`Argument "prefix"'s value is not match the require pattern! ([GitHub Action] GitHub Secret Manager)`);
			};
			prefix = prefix.toUpperCase();
			Object.keys(environmentVariable).forEach((element) => {
				if (element.toUpperCase().indexOf(prefix) === 0) {
					secretList[element.toUpperCase().replace(prefix, "")] = process.env[element];
				};
			});
			Object.keys(environmentVariable).forEach((element) => {
				if (element.toUpperCase().indexOf(`INPUT_${prefix}`) === 0) {
					secretList[element.toUpperCase().replace(`INPUT_${prefix}`, "")] = process.env[element];
				};
			});
			break;
		case true:
			if (advancedDetermine.isStringifyJSON(secretList) === false) {
				throw new TypeError(`Argument "secretlist" must be type of object JSON! ([GitHub Action] GitHub Secret Manager)`);
			};
			secretList = JSON.parse(secretList);
			break;
		case false:
		default:
			throw new TypeError(`Argument "secretlist" must be type of object JSON! ([GitHub Action] GitHub Secret Manager)`);
	};
	if (advancedDetermine.isJSON(secretList) !== true) {
		throw new Error(`No secret to manage. Probably something went wrong? ([GitHub Action] GitHub Secret Manager)`);
	};
	Object.values(secretList).forEach((element) => {
		githubAction.core.setSecret(element);
	});
	Object.keys(secretList).forEach((element) => {
		if (element.search(/^GITHUB_/giu) === 0) {
			delete secretList[element];
		};
	});
	githubAction.core.info(`Import workflow argument (stage 4). ([GitHub Action] GitHub Secret Manager)`);
	let secretListIgnoreAction = githubAction.core.getInput("secretlist_ignore_action");
	githubAction.core.info(`Analysis workflow argument (stage 4). ([GitHub Action] GitHub Secret Manager)`);
	if (advancedDetermine.isBoolean(secretListIgnoreAction, { allowStringify: true }) !== true) {
		throw new TypeError(`Argument "secretlist_ignore_action" must be type of boolean! ([GitHub Action] GitHub Secret Manager)`);
	};
	secretListIgnoreAction = (secretListIgnoreAction === "true");
	if (secretListIgnoreAction === true) {
		Object.keys(secretList).forEach((element) => {
			if (element.search(/^ACTIONS_/giu) === 0) {
				delete secretList[element];
			};
		});
	};
	let secretListName = Object.keys(secretList);
	githubAction.core.debug(`Secret Key List: ${secretListName.join(", ")} ([GitHub Action] GitHub Secret Manager)`);
	githubAction.core.info(`Import workflow argument (stage 5). ([GitHub Action] GitHub Secret Manager)`);
	let targetOrganization = githubAction.core.getInput("target_organization"),
		targetRepository = githubAction.core.getInput("target_repository"),
		token = githubAction.core.getInput("token");
	githubAction.core.info(`Analysis workflow argument (stage 5). ([GitHub Action] GitHub Secret Manager)`);
	if (advancedDetermine.isStringSingleLine(token) !== true) {
		throw new TypeError(`Argument "token" must be type of string (non-nullable)! ([GitHub Action] GitHub Secret Manager)`);
	};
	githubAction.core.info(`Set up transaction platform. ([GitHub Action] GitHub Secret Manager)`);
	const octokit = githubAction.github.getOctokit(token);
	let accessableOrganizationList = [],
		accessableRepositoryList = [],
		fetchOrganizationListDispatch = false,
		fetchRepositoryListDispatch = false,
		handleOrganizationList = [],
		handleRepositoryList = [];
	targetOrganization = targetOrganization.split("\n");
	for (let indexOrganization = 0; indexOrganization < targetOrganization.length; indexOrganization++) {
		let targetOrganizationName = targetOrganization[indexOrganization];
		if (targetOrganizationName.length > 0) {
			if (targetOrganizationName.search(/^[\d\w\-._*]+$/giu) === 0) {
				let pattern = new RegExp(
					`^${regexpEscape(targetOrganizationName).replace(/\\\*\\\*/gu, "[\\d\\w\\-._]+").replace(/\\\*/gu, "[\\d\\w]+")}$`,
					"gu"
				);
				if (fetchOrganizationListDispatch === false) {
					fetchOrganizationListDispatch = true;
					let totalPage = 1;
					for (let indexPage = 0; indexPage < totalPage; indexPage++) {
						let data = await octokit.orgs.listForAuthenticatedUser({
							page: indexPage + 1,
							per_page: 100
						});
						if (data.status !== 200) {
							githubAction.core.warning(`Receive status code ${data.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
						};
						if (typeof data.data.message !== "undefined") {
							break;
						};
						data.data.forEach((remoteOrganization) => {
							accessableOrganizationList.push(remoteOrganization.login);
						});
						if (indexPage === 0) {
							if (advancedDetermine.isString(data.headers.link) === true) {
								if (data.headers.link.search(/\?page=(\d+)&per_page=100>; rel="last"/giu) !== -1) {
									let totalPageData = data.headers.link.match(/\?page=(\d+)&per_page=100>; rel="last"/giu)[0].split("&")[0].split("=")[1];
									totalPage = Number(totalPageData);
									githubAction.core.info(`User has in at most ${totalPage * 100} organizations, this action may take longer than usual! ([GitHub Action] GitHub Secret Manager)`);
								};
							};
						};
					};
				};
				accessableOrganizationList.forEach((accessableOrganizationName) => {
					if (accessableOrganizationName.search(pattern) === 0) {
						handleOrganizationList.push(accessableOrganizationName);
					};
				});
			} else if (targetOrganizationName.search(/^[\d\w\-._]+$/giu) === 0) {
				handleOrganizationList.push(targetOrganizationName);
			} else {
				throw new SyntaxError(`Argument "target_organization"'s value is not match the require pattern! ([GitHub Action] GitHub Secret Manager)`);
			};
		};
	};
	targetRepository = targetRepository.split("\n");
	for (let indexRepository = 0; indexRepository < targetRepository.length; indexRepository++) {
		let targetRepositoryName = targetRepository[indexRepository];
		if (targetRepositoryName.length > 0) {
			if (targetRepositoryName.search(/^[\d\w\-._*]+\/[\d\w\-._*]+$/giu) === 0) {
				let pattern = new RegExp(
					`^${regexpEscape(targetRepositoryName).replace(/\\\*\\\*/gu, "[\\d\\w\\-._]+").replace(/\\\*/gu, "[\\d\\w]+")}$`,
					"gu"
				);
				if (fetchRepositoryListDispatch === false) {
					fetchRepositoryListDispatch = true;
					let totalPage = 1;
					for (let indexPage = 0; indexPage < totalPage; indexPage++) {
						let data = await octokit.repos.listForAuthenticatedUser({
							affiliation: "owner,organization_member",
							direction: "asc",
							page: indexPage + 1,
							per_page: 100,
							sort: "full_name",
							visibility: "all"
						});
						if (data.status !== 200) {
							githubAction.core.warning(`Receive status code ${data.status}! May cause error in the beyond. ([GitHub Action] GitHub Secret Manager)`);
						};
						if (typeof data.data.message !== "undefined") {
							break;
						};
						data.data.forEach((remoteRepository) => {
							if (remoteRepository.fork === false && remoteRepository.archived === false && remoteRepository.permissions.admin === true) {
								accessableRepositoryList.push(remoteRepository.full_name);
							};
						});
						if (indexPage === 0) {
							if (advancedDetermine.isString(data.headers.link) === true) {
								if (data.headers.link.search(/\?page=(\d+)&per_page=100&sort=full_name&visibility=all>; rel="last"/giu) !== -1) {
									let totalPageData = data.headers.link.match(/\?page=(\d+)&per_page=100&sort=full_name&visibility=all>; rel="last"/giu)[0].split("&")[0].split("=")[1];
									totalPage = Number(totalPageData);
									githubAction.core.info(`User has in at most ${totalPage * 100} repositories, this action may take longer than usual! ([GitHub Action] GitHub Secret Manager)`);
								};
							};
						};
					};
				};
				accessableRepositoryList.forEach((accessableRepositoryName) => {
					if (accessableRepositoryName.search(pattern) === 0) {
						handleRepositoryList.push(accessableRepositoryName);
					};
				});
			} else if (targetRepositoryName.search(/^[\d\w\-._]+\/[\d\w\-._]+$/giu) === 0) {
				handleRepositoryList.push(targetRepositoryName);
			} else {
				throw new SyntaxError(`Argument "target_repository"'s value is not match the require pattern! ([GitHub Action] GitHub Secret Manager)`);
			};
		};
	};
	if (handleOrganizationList.length === 0 && handleRepositoryList.length === 0) {
		throw new Error(`No repository or organization to manage. Probably something went wrong? ([GitHub Action] GitHub Secret Manager)`);
	};
	if (handleOrganizationList.length > 0) {
		githubAction.core.info(`Manage organization(s) secret. ([GitHub Action] GitHub Secret Manager)`);
		for (let indexOrganization = 0; indexOrganization < handleOrganizationList.length; indexOrganization++) {
			let organizationName = handleOrganizationList[indexOrganization],
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
			secretListName.forEach((key) => {
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
				let value = githubSodium(publicKey, secretList[key]);
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
				case "existmerge":
				default:
					break;
				case "pushmerge":
					for (let indexNotExistKey = 0; indexNotExistKey < listNotExist.length; indexNotExistKey++) {
						let key = listNotExist[indexNotExistKey];
						let value = githubSodium(publicKey, secretList[key]);
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
	if (handleRepositoryList.length > 0) {
		githubAction.core.info(`Manage repository(ies) secret. ([GitHub Action] GitHub Secret Manager)`);
		for (let indexRepository = 0; indexRepository < handleRepositoryList.length; indexRepository++) {
			let [repositoryOwner, repositoryName] = handleRepositoryList[indexRepository].split("/"),
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
			secretListName.forEach((key) => {
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
				let value = githubSodium(publicKey, secretList[key]);
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
				case "existmerge":
				default:
					break;
				case "pushmerge":
					for (let indexNotExistKey = 0; indexNotExistKey < listNotExist.length; indexNotExistKey++) {
						let key = listNotExist[indexNotExistKey];
						let value = githubSodium(publicKey, secretList[key]);
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
