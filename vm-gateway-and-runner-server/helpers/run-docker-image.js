const runDockerImage = async (functionName) => {
	const dockerCLIProxy = require("./docker-cli-proxy");

	const {
		getAvailablePort,
		markPortAsAllocatedForContainer,
		markPortAsDeallocatedFromContainer,
	} = require("./port-service");

	const getImageTag = require("../constants/get-image-tag");
	const imageTag = getImageTag(functionName);

	try {
		const availablePort = await getAvailablePort();

		markPortAsAllocatedForContainer(functionName, {
			port: availablePort,
			containerObject: null,
		});

		const data = await dockerCLIProxy.run(
			imageTag,
			[
				"--mount type=tmpfs,destination=/tmp",
				// TODO: Allow for this config to be changed by the user as well similar to timeout
				'--memory="512m"',
				`-p ${availablePort}:8080`,
			],
			process.stdout
		);

		const _output = data[0];
		const containerObject = data[1];

		if (containerObject)
			markPortAsAllocatedForContainer(functionName, {
				port: availablePort,
				containerObject,
			});
		else markPortAsDeallocatedFromContainer(functionName);
	} catch (err) {
		console.error(err);
		markPortAsDeallocatedFromContainer(functionName);
		throw new Error("Container failed to start in VM");
	}
};

module.exports = runDockerImage;
