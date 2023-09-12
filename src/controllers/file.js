const { SpheronClient, ProtocolEnum } = require("@spheron/storage");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { File } = require("../models/file");
const { Counter } = require("../models/count");
const { signAuthMessage } = require("../../utils");
const LitJsSdk = require("@lit-protocol/lit-node-client");

const chain = "ethereum";

const accessControlConditions = [
	{
		contractAddress: "",
		standardContractType: "",
		chain,
		method: "eth_getBalance",
		parameters: [":userAddress", "latest"],
		returnValueTest: {
			comparator: ">",
			value: "0",
		},
	},
];

const uploadFile = async (req, res) => {
	try {
		const localFilePath = uuidv4();
		const { buffer, originalname, mimetype } = req.file;
		const { name, description } = req.body;

		await fs.writeFile(localFilePath, buffer, (err) => {
			if (err) {
				console.error(err);
				return res.status(500).send("Error saving the file.");
			}
		});

		let currentlyUploaded = 0;

		const filePath = localFilePath;
		const bucketName = "nrtUpload";
		const spheronToken = process.env.TOKEN;
		const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;

		const authSig = await signAuthMessage(walletPrivateKey);

		const client = new LitJsSdk.LitNodeClient({});

		await client.connect();

		const spheron = new SpheronClient({
			token: spheronToken,
		});

		const uploadResponse = await spheron.encryptUpload({
			authSig,
			accessControlConditions,
			chain,
			filePath,
			litNodeClient: client,
			configuration: {
				name: bucketName,
				onUploadInitiated: (uploadId) => {
					console.log(`Upload with id ${uploadId} started...`);
				},
				onChunkUploaded: (uploadedSize, totalSize) => {
					currentlyUploaded += uploadedSize;
					console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`);
				},
			},
		});

		console.log(uploadResponse);

		const file = new File({
			filename: originalname,
			contentType: mimetype,
			name,
			description,
			uploadId: uploadResponse.uploadId,
			bucketId: uploadResponse.bucketId,
			protocolLink: uploadResponse.protocolLink,
			dynamicLinks: uploadResponse.dynamicLinks,
			cid: uploadResponse.cid,
		});
		await file.save();

		console.log(file);

		await fs.unlink(localFilePath, (err) => {
			if (err) {
				console.error(err);
			}
		});

		res.status(200).json({ file });
	} catch (error) {
		console.error("Error uploading file:", error);
		res.status(500).json({ error: "Error uploading file" });
	}
};

// const uploadFile = async (req, res) => {
// 	try {
// 		const localFilePath = uuidv4();
// 		const { buffer, originalname, mimetype } = req.file;
// 		const { name, description } = req.body;

// 		fs.writeFile(`uplodes/${localFilePath}`, buffer, (err) => {
// 			if (err) {
// 				console.error(err);
// 				return res.status(500).send("Error saving the file.");
// 			}
// 		});

// 		let currentlyUploaded = 0;

// 		const filePath = `uplodes/${localFilePath}`;
// 		const bucketName = "test-bucketer";
// 		const spheronToken = process.env.TOKEN;
// 		const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
// 		const authSig = await signAuthMessage(walletPrivateKey);
// 		console.log("signed");

// 		const client = new LitJsSdk.LitNodeClient({});
// 		console.log("client connecting");

// 		await client.connect();

// 		console.log("token up");

// 		const spheron = new SpheronClient({
// 			token: spheronToken,
// 		});
// 		console.log("passing");
// 		const uploadResponse = await spheron.encryptUpload({
// 			authSig,
// 			accessControlConditions,
// 			chain,
// 			filePath,
// 			litNodeClient: client,
// 			configuration: {
// 				name: bucketName,
// 				onUploadInitiated: (uploadId) => {
// 					console.log(`Upload with id ${uploadId} started...`);
// 				},
// 				onChunkUploaded: (uploadedSize, totalSize) => {
// 					currentlyUploaded += uploadedSize;
// 					console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`);
// 				},
// 			},
// 		});

// 		console.log(uploadResponse);

// 		const file = new File({
// 			filename: originalname,
// 			contentType: mimetype,
// 			name,
// 			description,
// 			uploadId: uploadResponse.uploadId,
// 			bucketId: uploadResponse.bucketId,
// 			protocolLink: uploadResponse.protocolLink,
// 			dynamicLinks: uploadResponse.dynamicLinks,
// 			cid: uploadResponse.cid,
// 		});
// 		await file.save();

// 		console.log(file);

// 		// fs.unlink(localFilePath, (err) => {
// 		// 	if (err) {
// 		// 		console.error(err);
// 		// 	}
// 		// });

// 		// const decryptedData = spheron.decryptUpload({
// 		// 	authSig,
// 		// 	ipfsCid: uploadResponse.cid,
// 		// 	litNodeClient: client,
// 		// });

// 		// console.log("!!!!!!!!!!!!!!!");
// 		// console.log("DECRYPTED DATA", decryptedData);
// 		// console.log("!!!!!!!!!!!!!!!");

// 		res.status(200).json({ file });
// 	} catch (error) {
// 		console.error("Error uploading file:", error);
// 		res.status(500).json({ error: "Error uploading file" });
// 	}
// };

const getFiles = async (req, res) => {
	try {
		const files = await File.find({});
		res.json(files);
	} catch (error) {
		console.error("Error fetching file list:", error);
		res.status(500).json({ error: "Error fetching file list" });
	}
};

module.exports = { uploadFile, getFiles };

// const { uploadId, bucketId, protocolLink, dynamicLinks } =
// 	// await client.upload("C:\\Users\\developer\\Desktop\\data.txt", {
// 	await client.upload(buffer, {
// 		protocol: ProtocolEnum.IPFS,
// 		name,
// 		onUploadInitiated: (uploadId) => {
// 			console.log(`Upload with id ${uploadId} started...`);
// 		},
// 		onChunkUploaded: (uploadedSize, totalSize) => {
// 			currentlyUploaded += uploadedSize;
// 			console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`);
// 		},
// 	});
