const { SpheronClient, ProtocolEnum } = require("@spheron/storage");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { Crypter } = require("../models/crypter");
const https = require("https");

const crypto = require("crypto");

const encryptionKey = process.env.ENCRKEY;

const encryptFile = (inputFilePath, outputFilePath) => {
	const input = fs.createReadStream(inputFilePath);
	const output = fs.createWriteStream(outputFilePath);

	const cipher = crypto.createCipher("aes-256-cbc", encryptionKey);

	input.pipe(cipher).pipe(output);
};

const decryptFile = (inputFilePath, outputFilePath) => {
	const input = fs.createReadStream(inputFilePath);
	const output = fs.createWriteStream(outputFilePath);

	const decipher = crypto.createDecipher("aes-256-cbc", encryptionKey);

	input.pipe(decipher).pipe(output);
};

const uploadFile = async (req, res) => {
	try {
		// ?  assigning filepaths
		const localFilePath = `uplodes/${uuidv4()}`;
		const uploadeFileName = uuidv4();
		const localencryptFilePath = `uplodes/${uploadeFileName}`;

		// ? getting data

		const { buffer, originalname, mimetype } = req.file;
		const { name, description } = req.body;

		await fs.writeFile(localFilePath, buffer, (err) => {
			if (err) {
				console.error(err);
				return res.status(500).send("Error saving the file.");
			}
		});

		encryptFile(localFilePath, localencryptFilePath);

		let currentlyUploaded = 0;

		const filePath = localencryptFilePath;
		const spheronToken = process.env.TOKEN;
		const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;

		const spheron = new SpheronClient({
			token: spheronToken,
		});

		const uploadResponse = await spheron.upload(filePath, {
			protocol: ProtocolEnum.IPFS,
			name,
			onUploadInitiated: (uploadId) => {
				console.log(`Upload with id ${uploadId} started...`);
			},
			onChunkUploaded: (uploadedSize, totalSize) => {
				currentlyUploaded += uploadedSize;
				console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`);
			},
		});

		const file = new Crypter({
			user_id: req.user._id,
			filename: originalname,
			contentType: mimetype,
			name,
			description,
			uploadId: uploadResponse.uploadId,
			bucketId: uploadResponse.bucketId,
			protocolLink: uploadResponse.protocolLink,
			dynamicLinks: uploadResponse.dynamicLinks,
			cid: uploadResponse.cid,
			uploadeFileName,
		});
		await file.save();

		console.log(file);

		await fs.unlink(localFilePath, (err) => {
			if (err) {
				console.error(err);
			}
		});
		await fs.unlink(localencryptFilePath, (err) => {
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

const getFiles = async (req, res) => {
	try {
		const files = await Crypter.find({
			user_id: req.user._id,
		});
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
			return res.status(400).json({ error: "Provide id" });
		}

		const file = await Crypter.findOne({ _id: id });

		if (!file) {
			return res.status(400).json({ error: "File doesn't exist" });
		}

		const downloadedFilePath = await downloadRemoteFile(
			`${file.protocolLink}/${file.uploadeFileName}`,
			`downloads/${file.uploadeFileName}`
		);
		const decryptedFilePath = await decryptFileX(downloadedFilePath);

		console.log(decryptedFilePath);

		res.download(decryptedFilePath, (err) => {
			if (err) {
				console.error("File download error:", err);
				res.status(404).send("File not found");
			} else {
				fs.unlink(downloadedFilePath, (err) => {
					if (err) {
						console.error(err);
					} else {
						fs.unlink(decryptedFilePath, (err) => {
							if (err) {
								console.error(err);
							}
						});
					}
				});
			}
		});
	} catch (error) {
		console.error("Error downloading file ", error);
		res.status(500).json({ error: "Error downloading file", e: error });
	}
};

const downloadRemoteFile = (url, localPath) => {
	return new Promise((resolve, reject) => {
		const fileStream = fs.createWriteStream(localPath);

		https
			.get(url, (response) => {
				response.pipe(fileStream);
				fileStream.on("finish", () => {
					fileStream.close();
					console.log("Download Completed");
					resolve(localPath);
				});
			})
			.on("error", (err) => {
				console.error("Download error:", err);
				reject(err);
			});
	});
};

const decryptFileX = (inputFilePath) => {
	return new Promise((resolve, reject) => {
		const outputFilePath = `downloads/${uuidv4()}`;
		fs.writeFile(outputFilePath, "", (err) => {
			if (err) {
				console.error(err);
				reject(err);
			} else {
				decryptFileLogic(inputFilePath, outputFilePath)
					.then(() => resolve(outputFilePath))
					.catch((err) => {
						console.error("Decryption error:", err);
						reject(err);
					});
			}
		});
	});
};

const decryptFileLogic = (inputFilePath, outputFilePath) => {
	return new Promise((resolve, reject) => {
		const input = fs.createReadStream(inputFilePath);
		const output = fs.createWriteStream(outputFilePath);

		const decipher = crypto.createDecipher("aes-256-cbc", encryptionKey);

		input.pipe(decipher).pipe(output);

		output.on("finish", () => {
			resolve();
		});
	});
};

module.exports = { uploadFile, getFiles, downloadFile };
