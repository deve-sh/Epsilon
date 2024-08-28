const fs = require("node:fs");

const code = `
let commonValueAcrossInvocations = 1;

module.exports.test = {
	definition: async (req, res) => {
		commonValueAcrossInvocations++;
		return res.status(200).send({ commonValueAcrossInvocations });
	},
	config: { timeout: 10000 },
};
`;

fs.writeFileSync('./test.js', code);