// @ts-check

require("dotenv").config();

const FUNCTIONS_PATH = process.env.FUNCTIONS_PATH || "./test";

const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cloudFunctionDefinitionExports = require(FUNCTIONS_PATH);

function loadFunction(functionName = "") {
	const FUNCTION_NAME = process.env.FUNCTION_NAME || functionName;

	if (!FUNCTION_NAME) return process.exit(1);

	let resolvedConfig = {};
	let resolvedFunc = null;

	try {
		const cloudFunction = cloudFunctionDefinitionExports[FUNCTION_NAME];

		if (!cloudFunction.definition)
			throw new Error("Definition not found for function: " + FUNCTION_NAME);

		resolvedFunc = cloudFunction.definition;
		resolvedConfig = cloudFunction.config || {};

		resolvedConfig = { timeout: resolvedConfig.timeout || 10000 };
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
		try {
			// Add wrappers for logging, monitoring and timeouts around this function invocation using the config
			await resolvedFunc(req, res);
			if (!res.headersSent) return res.sendStatus(200);
		} catch {
			if (!res.headersSent) return res.sendStatus(500);
		}
	});

	console.log("Loaded function", FUNCTION_NAME);
}

// build | local
const mode = process.argv[2] || "local";

if (mode !== "build") {
	// Load all cloud functions to test and work with locally
	const functionListExportedByUser = Object.keys(
		cloudFunctionDefinitionExports
	);
	functionListExportedByUser.forEach((funcName) => loadFunction(funcName));
} else {
	loadFunction(process.env.FUNCTION_NAME);
}

const port = process.env.PORT || 8080;

app.listen(port, () => {
	console.log(`Ready to listen to requests at port`, port);
});

module.exports = app;
