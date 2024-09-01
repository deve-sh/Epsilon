const getImageTag = (functionName) => {
    // AWS_REGISTRY_ID/AWS_ECR_REPO_NAME:FUNCTION_NAME
	return `${process.env.DOCKER_REGISTRY_USERNAME}/${process.env.DOCKER_REGISTRY_REPO_NAME}:${functionName}`;
};

module.exports = getImageTag;
