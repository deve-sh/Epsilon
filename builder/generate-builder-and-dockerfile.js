const fs = require("node:fs");

const passedFunctionExportsPath = process.argv[2];
const passedFunctionName = process.argv[3];
const passedDockerImageTag = process.argv[4];

const dockerFilePath = "./Dockerfile";
const builderFilePath = "./build.sh";

const dockerFileContents = fs.readFileSync(dockerFilePath, "utf-8");
const builderCommandContents = fs.readFileSync(builderFilePath, "utf-8");

fs.writeFileSync(
	dockerFilePath,
	dockerFileContents
		.replace(
			"__/app/test__",
			require("path").join("/app", passedFunctionExportsPath).replace("\\", "/")
		)
		.replace("__testFunction__", passedFunctionName || "test")
);

console.log("Wrote to Dockerfile 🐳");

fs.writeFileSync(
	builderFilePath,
	builderCommandContents.replace("docker-image-tag", passedDockerImageTag)
);

console.log("Wrote to build.sh file 📃");
