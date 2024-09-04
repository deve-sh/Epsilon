// @ts-check

const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/:functionName", async (originalReq, originalRes) => {
	try {
		const { v4: uuid } = require("uuid");
		const requestId = uuid().replace(/-/g, "");

		const { functionName } = originalReq.params;

		if (functionName.includes(".") || functionName.includes(":"))
			return originalRes.sendStatus(404);

		// TODO: Add a mapping, where if the Docker image is not found for the function, send back 404

		const { method, headers, originalUrl } = originalReq;

		const getProvisionedVMURL = require("./helpers/get-provisioned-vm-url");

		const provisionedVMURL = await getProvisionedVMURL(functionName, requestId);

		if (!provisionedVMURL) return originalRes.sendStatus(429);

		const originalQueryParams = originalUrl.split("?")[1];

		const containerExposedURL = new URL(
			`${provisionedVMURL}${
				originalQueryParams ? `?${originalQueryParams}` : ""
			}`
		);

		const port = Number(containerExposedURL.port);

		const markDockerContainerForDeprovisioningAfterInactivity = require("./helpers/timeout-for-deprovisioning");
		const { setPortBusyStatus } = require("./helpers/port-service");

		markDockerContainerForDeprovisioningAfterInactivity(
			functionName,
			requestId,
			port
		);
		setPortBusyStatus(port, true);

		const proxyReqOptions = {
			host: containerExposedURL.hostname,
			port,
			path: containerExposedURL.pathname + containerExposedURL.search,
			method,
			timeout: 5_000,
			headers: {
				...headers,
				host: containerExposedURL.hostname,
				"x-epsilon-request-id": requestId,
			},
		};

		const http = require("http");

		const proxyReq = http.request(proxyReqOptions, (proxyRes) => {
			originalRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
			proxyRes.pipe(originalRes, { end: true });
			proxyRes.on("end", () => {
				setPortBusyStatus(port, false);
			});
		});

		proxyReq.on("error", (err) => {
			console.error("Error with proxy request:", err.message);
			originalRes.status(200).send("Gateway error: " + err.message);
			setPortBusyStatus(port, false);
		});

		if (originalReq.method !== "GET" && originalReq.method !== "HEAD") {
			originalReq.pipe(proxyReq, { end: true });
		} else {
			proxyReq.end();
		}
	} catch {
		if (!originalRes.headersSent) return originalRes.sendStatus(500);
	}
});

app.post("/internal/logs", (_req, res) => {
	// TODO: Forward logs received from Docker containers to a log sink like Google Cloud Logs, AWS Cloudwatch etc or our own built log sink.
	const _logs = _req.body;
	const { functionName } = _req.query;

	// Accepted, flush the logs in queue from the docker containers
	return res.sendStatus(202);
});

// Health checks
app.all("/", (_req, res) => {
	return res.sendStatus(200);
});

app.listen(9163, () => {
	console.log("Listening for requests on port on VM", 9163);
});
