const pullDockerImage = async (functionName) => {
	const dockerCLIProxy = require("./docker-cli-proxy");
	const getImageTag = require("../constants/get-image-tag");

	try {
		// Running locally, the image should already be there
		// Disable this flag to pull images from ECR
		const isLocal = require("./is-local");
		
		if (isLocal()) return true;

		await dockerCLIProxy.pull(getImageTag(functionName));
	} catch (err) {
		console.error(err);
		throw new Error("Container failed to start in VM");
	}
};

module.exports = pullDockerImage;
