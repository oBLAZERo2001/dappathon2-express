const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
	{
		address: {
			type: String,
			reqired: false,
		},
		name: {
			type: String,
			reqired: false,
		},
		members: {
			type: Array,
		},
		user_id: { type: mongoose.Types.ObjectId, required: true },
	},
	{
		timestamps: true,
	}
);

const Token = new mongoose.model("Token", TokenSchema);
module.exports = { Token };
