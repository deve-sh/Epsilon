const pullDockerImage = async (functionName) => {
	const getImageTag = require("../constants/get-image-tag");

	// Running locally, the image should already be there
	// Disable this flag to pull images from ECR
	const isLocal = require("./is-local");

	if (isLocal()) return true;

	const exec = require("./exec");
	const { stderr } = await exec(`docker pull ${getImageTag(functionName)}`);

	if (stderr)
		throw new Error("Failed to pull image for function", functionName, "in VM");
};

module.exports = pullDockerImage;
