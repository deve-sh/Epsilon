const pullDockerImage = async (functionName) => {
	const dockerCLIProxy = require("./docker-cli-proxy");
	const getImageTag = require("../constants/get-image-tag");

	try {
		await dockerCLIProxy.pull(getImageTag(functionName));

        // TODO: Create service to get the sha of image related to <functionName>
	} catch (err) {
		console.error(err);
		throw new Error("Container failed to start in VM");
	}
};

module.exports = pullDockerImage;
