const deprovisionContainer = async (requestId) => {
	try {
		const exec = require("./exec");
		await exec(`docker stop ${requestId}`);
	} catch (err) {
		console.log("Error while stopping docker container:", err);
	}
};

module.exports = deprovisionContainer;
