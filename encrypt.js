/*==================
[GitHub Action] GitHub Secret Manager - Encrypt
	Language:
		NodeJS/12.13.0
==================*/
const sodium = require("tweetsodium");
module.exports = function main(publicKey, value) {
	return Buffer.from(sodium.seal(Buffer.from(value), Buffer.from(publicKey, "base64"))).toString("base64");
};
