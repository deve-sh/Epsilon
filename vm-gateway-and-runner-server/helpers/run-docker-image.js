const runDockerImage = async (functionName, imageId) => {
	const dockerCLIProxy = require("./docker-cli-proxy");

	const {
		getAvailablePort,
		markPortAsAllocatedForContainer,
	} = require("./port-service");

	try {
		const availablePort = await getAvailablePort();

		const data = await dockerCLIProxy.run(
			imageId,
			[
				"--mount type=tmpfs,destination=/tmp",
				// TODO: Allow for this config to be changed by the user as well similar to timeout
				'--memory="256m"',
				`-p ${availablePort}:8080`,
			],
			process.stdout
		);

		const _output = data[0];
		const container = data[1];

		if (container) markPortAsAllocatedForContainer(functionName, availablePort, container);
	} catch (err) {
		console.error(err);
		throw new Error("Container failed to start in VM");
	}
};

module.exports = runDockerImage;
