const { SpheronClient, ProtocolEnum } = require("@spheron/storage");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { File } = require("../models/file");
const { Counter } = require("../models/count");
const { signAuthMessage } = require("../../utils");
const LitJsSdk = require("@lit-protocol/lit-node-client");
const { decrypFile } = require("./decrypt");

const chain = "ethereum";

const accessControlConditions = (contractAddress) => [
	{
		contractAddress: 0x0b22c83a97930329b3426fa0675ba38fcc57ba87,
		standardContractType: "",
		chain: "ethereum",
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
		const { name, description, address } = req.body;
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++");

		console.log(address);
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++");

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
			accessControlConditions: accessControlConditions(address),
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
			contractAddress: address,
		});
		await file.save();

		console.log(file);

		console.log(uploadResponse);

		await fs.unlink(localFilePath, (err) => {
			if (err) {
				console.error(err);
			}
		});

		const decryptedData = await spheron.decryptUpload({
			authSig,
			ipfsCid: uploadResponse.cid,
			litNodeClient: client,
		});

		console.log(decryptedData);

		res.status(200).json({ file });
	} catch (error) {
		console.error("Error uploading file:", error);
		res.status(500).json({ error: "Error uploading file" });
	}
};

const getFiles = async (req, res) => {
	try {
		const files = await File.find({});
		res.json(files);
	} catch (error) {
		console.error("Error fetching file list:", error);
		res.status(500).json({ error: "Error fetching file list" });
	}
};

const downloadFile = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ error: "provide id" });
		}

		const file = await File.findOne({ _id: id });

		if (!file) {
			return res.status(400).json({ error: "File Don't exist" });
		}

		res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
		res.setHeader("Content-Type", "application/octet-stream");

		console.log("++++++++++++++++++++++++++++++++++++++++++++++++");
		console.log("file to decrypt", file);
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++");

		// Send the buffer as the response
		const decryptedData = await decrypFile(file.cid);
		await fs.writeFile(`/downloads/${uuidv4()}`, buffer, (err) => {
			if (err) {
				console.error(err);
				return res.status(500).send("Error saving the file.");
			}
		});
		res.send(Buffer.from(decryptedData));
	} catch (error) {
		console.error("Error downloading file ", error);
		res.status(500).json({ error: "Error downloading file ", e: error });
	}
};

module.exports = { uploadFile, getFiles, downloadFile };
