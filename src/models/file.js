const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
	{
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
	},
	{
		timestamps: true,
	}
);

const File = new mongoose.model("File", FileSchema);
module.exports = { File };
