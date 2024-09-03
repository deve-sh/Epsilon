// @ts-check

const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/:functionName", async (originalReq, originalRes) => {
	try {
		const { functionName } = originalReq.params;

		const { method, headers, originalUrl } = originalReq;

		const getProvisionedVMURL = require("./helpers/get-provisioned-vm-url");

		const provisionedVMURL = await getProvisionedVMURL(functionName);

		if (!provisionedVMURL) return originalRes.sendStatus(429);

		const originalQueryParams = originalUrl.split("?")[1];

		const url = new URL(
			`${provisionedVMURL}${
				originalQueryParams ? `?${originalQueryParams}` : ""
			}`
		);

		const options = {
			host: url.hostname,
			port: url.port || 8080,
			path: url.search,
			method,
			headers,
		};

		const http = require("http");

		const proxyReq = http.request(options, (proxyRes) => {
			originalRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
			proxyRes.pipe(originalRes, { end: true });
		});

		proxyReq.on("error", (err) => {
			console.error("Error with proxy request:", err.message);
			originalRes.status(500).send("Gateway error: " + err.message);
		});

		originalReq.pipe(proxyReq, { end: true });
	} catch {
		return originalRes.sendStatus(500);
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
