const mongoose = require("mongoose");

const OtpNonceSchema = new mongoose.Schema(
	{
		nonce: {
			type: Number,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		expireAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const OtpNonce = new mongoose.model("Otpnonce", OtpNonceSchema);

module.exports = { OtpNonce };
