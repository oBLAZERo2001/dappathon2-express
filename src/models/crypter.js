const mongoose = require("mongoose");

const CrypterSchema = new mongoose.Schema(
	{
		user_id: { type: mongoose.Types.ObjectId, required: true },
		name: {
			type: String,
		},
		description: {
			type: String,
		},
		filename: { type: String },
		contentType: { type: String },
		uploadId: { type: String },
		bucketId: { type: String },
		protocolLink: { type: String },
		dynamicLinks: { type: Array },
		cid: { type: String },
		contractAddress: { type: String },
		uploadeFileName: { type: String },
	},
	{
		timestamps: true,
	}
);

const Crypter = new mongoose.model("Crypter", CrypterSchema);
module.exports = { Crypter };
