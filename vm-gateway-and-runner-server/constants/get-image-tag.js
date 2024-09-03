// To support more Container Registries, simply have this as a switch-case service
// Which resolves the image tag and credentials based on a global-flag

const getImageTag = (functionName) => {
	const isLocal = require("../helpers/is-local");
	if (isLocal()) return functionName;

	// By default AWS ECR -> Check .github/workflows/build-docker-image-sample-for-code.yaml for script to upload image to ECR
	// AWS_REGISTRY_ID/AWS_ECR_REPO_NAME:FUNCTION_NAME
	return `${process.env.DOCKER_REGISTRY_USERNAME}/${process.env.DOCKER_REGISTRY_REPO_NAME}:${functionName}`;
};

module.exports = getImageTag;
