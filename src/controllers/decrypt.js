const { SpheronClient } = require("@spheron/storage");
const LitJsSdk = require("@lit-protocol/lit-node-client");
const { signAuthMessage } = require("../../utils");

const decrypFile = async (cid) => {
	if (cid) {
		const spheronToken = process.env.TOKEN;
		const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;

		const authSig = await signAuthMessage(walletPrivateKey);

		const client = new LitJsSdk.LitNodeClient({});
		await client.connect();

		const spheron = new SpheronClient({
			token: spheronToken,
		});
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++");

		console.log("spheron connected", cid);

		console.log("++++++++++++++++++++++++++++++++++++++++++++++++");

		const decryptedData = await spheron.decryptUpload({
			authSig,
			ipfsCid: cid,
			litNodeClient: client,
		});
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++");

		console.log("crossed to return");

		console.log("++++++++++++++++++++++++++++++++++++++++++++++++");

		return decryptedData;
	} else {
		console.error("cannot decrypt with out cid: " + cid);
	}
};

module.exports = { decrypFile };
