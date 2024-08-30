#!/usr/bin/env node

// @ts-check

require("dotenv").config();

const FUNCTIONS_PATH = process.argv[3] || "./test";

// build | local
const mode = process.argv[2] || "local";

const express = require("express");
const {
	setupLoggingOverride,
	flushLogs,
} = require("./utilities/override-console");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require("./utilities/intercept-request"));

const cloudFunctionDefinitionExports = require(FUNCTIONS_PATH);

function loadFunction(functionName = "") {
	const FUNCTION_NAME = functionName || process.argv[4];

	if (!FUNCTION_NAME) return process.exit(1);

	if (mode === "build") {
		process.env.FUNCTION_NAME = FUNCTION_NAME;
		setupLoggingOverride();
	}

	let resolvedConfig = {};
	let resolvedFunc = null;

	try {
		const cloudFunction = cloudFunctionDefinitionExports[FUNCTION_NAME];

		if (!cloudFunction.definition)
			throw new Error("Definition not found for function: " + FUNCTION_NAME);

		resolvedFunc = cloudFunction.definition;
		resolvedConfig = cloudFunction.config || {};

		resolvedConfig = { timeout: resolvedConfig.timeout || 15 * 1000 };
	} catch (error) {
		console.error(error);
		console.error(
			"Did you forget to export your function",
			FUNCTION_NAME,
			"with the format { func: (req, res) => any; config: { timeout: number } }"
		);
		process.exit(1);
	}

	app.all(`/${FUNCTION_NAME}`, async (req, res) => {
		// TODO: In build mode: Mark this docker container as busy and to provision another container for other requests

		const logsFlushingInterval = setInterval(() => {
			flushLogs();
		}, 5000);

		const onFinish = (type) => () => {
			flushLogs();
			// @ts-expect-error Type differences in Timer and Timeout
			clearInterval(logsFlushingInterval);
			if (type) console.log(type, "Timed out");
		};

		req.setTimeout(5000, () => {
			if (!res.headersSent) return res.sendStatus(408);
			onFinish("Request");
		});
		res.setTimeout(resolvedConfig.timeout, () => {
			if (!res.headersSent) return res.sendStatus(504);
			onFinish("Response");
		});

		try {
			await resolvedFunc(req, res);
			if (!res.headersSent) return res.sendStatus(200);
		} catch {
			if (!res.headersSent) return res.sendStatus(500);
		} finally {
			onFinish()();
		}
	});

	console.log(
		`Loaded function ${FUNCTION_NAME}${
			mode !== "build" ? ` at http://localhost:8080/${FUNCTION_NAME}` : ""
		}`
	);
}

if (mode !== "build") {
	// Load all cloud functions to test and work with locally
	const functionListExportedByUser = Object.keys(
		cloudFunctionDefinitionExports
	);
	functionListExportedByUser.forEach((funcName) => loadFunction(funcName));
} else {
	loadFunction(process.argv[4]);
}

const port = process.env.PORT || 8080;

app.listen(port, () => {
	console.log(`Ready to listen to requests at port`, port);
});

module.exports = app;
